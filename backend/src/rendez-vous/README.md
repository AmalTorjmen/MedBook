# UC2 – Réserver un rendez-vous médical

Module NestJS du cas d'utilisation **UC2** de MedBook. C'est l'UC à risque technique du projet : le système doit empêcher que deux patients réservent le même créneau d'un médecin.

- **Acteur principal** : Patient (authentifié)
- **Acteur secondaire** : Système de notification
- **Endpoint** : `POST /api/rendez-vous`

---

## 1. Fonctionnement

Le patient choisit un créneau (`Disponibilite`) et confirme. Le système vérifie le patient et le créneau, enregistre le rendez-vous au statut `CONFIRME`, puis déclenche la notification de confirmation.

```
Controller ──> Service (transaction) ──> Repositories ──> MySQL
                  │
                  └── (après commit) ──> NotificationsService (asynchrone, avec relances)
```

| Couche | Fichier | Rôle |
|---|---|---|
| Présentation | `rendez-vous.controller.ts` | Valide le format (DTO), récupère le patient, délègue |
| Métier | `rendez-vous.service.ts` | Règles de gestion, transaction, traduction des erreurs |
| Accès données | `rendez-vous.repository.ts` | Lecture/écriture des rendez-vous |
| Partagés | `disponibilites/`, `patients/` | Repositories du créneau (avec verrou) et du patient |
| Notification | `notifications/notifications.service.ts` | Envoi non bloquant avec 3 relances |

```
src/rendez-vous/
├── dto/
│   ├── reserver-rendez-vous.dto.ts     # entrée validée
│   └── rendez-vous-response.dto.ts     # réponse
├── rendez-vous.controller.ts
├── rendez-vous.service.ts
├── rendez-vous.repository.ts
├── rendez-vous.module.ts
├── rendez-vous.service.spec.ts         # tests unitaires du service
└── README.md
```

---

## 2. API

### `POST /api/rendez-vous`

| | |
|---|---|
| En-tête requis | `x-patient-id: <id du patient>` (authentification **temporaire**) |
| Corps JSON | `{ "idDisponibilite": 1, "motif": "Contrôle annuel" }` |
| `idDisponibilite` | entier ≥ 1, obligatoire |
| `motif` | texte de 255 caractères maximum, facultatif |

Tout champ inconnu dans le corps est rejeté (400).

**Réponse 201**
```json
{
  "idRendezVous": 1,
  "statut": "CONFIRME",
  "motif": "Contrôle annuel",
  "dateCreation": "2026-10-28T08:00:00.000Z",
  "patient": { "idPatient": 1, "nomComplet": "Amal Torjmane" },
  "medecin": { "idMedecin": 1, "nomComplet": "Dr Sami Ben Ali" },
  "cabinet": { "idCabinet": 1, "nom": "Cabinet A", "emplacement": "Bloc 1 - 1er étage" },
  "creneau": { "idDisponibilite": 1, "date": "2026-10-29", "heureDebut": "09:00:00", "heureFin": "09:30:00" }
}
```

### Codes de retour

| Code | Situation | Scénario UML |
|---|---|---|
| 201 | Réservation confirmée | Nominal |
| 400 | Données invalides ou champ inconnu | A3 |
| 401 | Patient non identifié | Précondition |
| 404 | Patient inconnu, ou créneau inexistant / supprimé | A2 |
| 409 | Créneau déjà réservé (y compris course concurrente) | A1 |
| 422 | Créneau dans le passé | Règle 3 |
| 503 | Verrou ou deadlock MySQL : réessayer | Technique |

---

## 3. Règles métier appliquées

| # | Règle (document de conception) | Où |
|---|---|---|
| 1 | Le rendez-vous est lié à un patient et à une disponibilité existants | Service (404) |
| 3 | Le créneau est libre (aucun rendez-vous `CONFIRME`) et n'est pas dans le passé | Service (409 / 422) |
| 4 | Une disponibilité a au maximum un rendez-vous `CONFIRME` | Index unique en base |
| 6 | Un rendez-vous annulé est conservé et libère le créneau | Colonne générée |

---

## 4. Prévention des doubles réservations

Vérifier puis insérer ne suffit pas : deux requêtes simultanées peuvent voir le créneau libre. La protection se fait à trois niveaux :

1. **Service** : vérifie qu'aucun rendez-vous `CONFIRME` n'existe et renvoie un 409 explicite.
2. **Transaction + verrou pessimiste** : `SELECT ... FOR UPDATE` sur la ligne du créneau. Les demandes concurrentes sont mises en file d'attente par MySQL.
3. **Contrainte en base** : MySQL n'a pas d'index unique partiel. La colonne générée `creneau_confirme_id` vaut `id_disponibilite` si le statut est `CONFIRME`, sinon `NULL`. Elle porte un index `UNIQUE` (les `NULL` multiples sont autorisés), ce qui laisse l'historique des rendez-vous annulés sans bloquer le créneau.

Si malgré tout une violation d'unicité survient (erreur MySQL 1062), le service la convertit en 409. Les deadlocks (1213) et expirations de verrou (1205) deviennent un 503.

---

## 5. Notification

`NotificationsService.envoyerConfirmationReservation()` est appelé **après** la validation de la transaction :

- l'envoi est asynchrone, il ne retarde pas la réponse ;
- il ne lève jamais d'erreur ;
- en cas d'échec, 3 relances (après 5 s, 30 s, 120 s), puis abandon journalisé (scénario A5 : la réservation reste valide) ;
- l'envoi actuel est une **simulation** (journal). Un vrai service e-mail ou SMS est à brancher dans `envoyer()`.

---

## 6. Prérequis

- Node.js 20 ou 22, `npm install` exécuté dans `backend/`
- XAMPP avec MySQL démarré (`sudo /opt/lampp/lampp start` sous Linux)
- `.env` créé : `cp .env.example .env`
- Base importée dans phpMyAdmin : `database/schema.sql`, puis `database/seed.sql`

Le seed crée 2 patients (id 1 et 2) et 5 créneaux : les id 1 à 4 sont dans le futur, l'id 5 est dans le passé.

---

## 7. Tests

### 7.1 Tests unitaires (sans base de données)

```bash
cd backend
npm test
```
Attendu : **2 suites, 12 tests passés**.

**`rendez-vous.service.spec.ts` (9 tests)**

| # | Test | Résultat attendu |
|---|---|---|
| 1 | Réserve un créneau libre | Transaction ouverte, créneau verrouillé, rendez-vous enregistré, statut `CONFIRME`, notification déclenchée |
| 2 | Motif absent | Enregistré à `null` ; motif ` Contrôle ` enregistré nettoyé en `Contrôle` |
| 3 | Patient inconnu | 404, rien d'enregistré |
| 4 | Créneau inexistant ou supprimé (A2) | 404, rien d'enregistré |
| 5 | Créneau dans le passé | 422, rien d'enregistré |
| 6 | Créneau déjà réservé (A1) | 409, aucune notification |
| 7 | Violation d'unicité MySQL 1062 (course concurrente) | 409, aucune notification |
| 8 | Deadlock MySQL 1213 | 503 |
| 9 | Notification qui échoue (A5) | La réservation est quand même renvoyée |

**`notifications.service.spec.ts` (3 tests)**

| # | Test | Résultat attendu |
|---|---|---|
| 1 | Envoi qui échoue | Aucune exception levée |
| 2 | 2 échecs puis succès | 3 tentatives au total |
| 3 | Échecs permanents | Abandon après 4 tentatives (1 essai + 3 relances) |

### 7.2 Tests HTTP (sans base de données)

```bash
npm run test:e2e
```
Attendu : **1 suite, 5 tests passés** (`test/rendez-vous.e2e-spec.ts`).

| # | Requête | Code attendu |
|---|---|---|
| 1 | Sans en-tête `x-patient-id` | 401, service non appelé |
| 2 | `idDisponibilite: "abc"` | 400 |
| 3 | Corps avec un champ inconnu (`idPatient`) | 400, service non appelé |
| 4 | Requête valide | 201, service appelé avec le patient de l'en-tête |
| 5 | Service qui lève un conflit | 409 |

### 7.3 Tests manuels sur la vraie base

API lancée (`npm run start:dev`), base initialisée avec le seed :

```bash
H='Content-Type: application/json'
U=http://localhost:3000/api/rendez-vous
```

| # | Scénario | Commande | Attendu |
|---|---|---|---|
| 1 | Réservation réussie | `curl -i -X POST $U -H "$H" -H 'x-patient-id: 1' -d '{"idDisponibilite":1,"motif":"Contrôle"}'` | 201 |
| 2 | Créneau déjà pris (autre patient) | `curl -i -X POST $U -H "$H" -H 'x-patient-id: 2' -d '{"idDisponibilite":1}'` | 409 |
| 3 | Même patient, même créneau | `curl -i -X POST $U -H "$H" -H 'x-patient-id: 1' -d '{"idDisponibilite":1}'` | 409 |
| 4 | Créneau passé | `curl -i -X POST $U -H "$H" -H 'x-patient-id: 1' -d '{"idDisponibilite":5}'` | 422 |
| 5 | Créneau inexistant | `curl -i -X POST $U -H "$H" -H 'x-patient-id: 1' -d '{"idDisponibilite":999}'` | 404 |
| 6 | Patient inexistant | `curl -i -X POST $U -H "$H" -H 'x-patient-id: 999' -d '{"idDisponibilite":2}'` | 404 |
| 7 | Donnée invalide | `curl -i -X POST $U -H "$H" -H 'x-patient-id: 1' -d '{"idDisponibilite":"abc"}'` | 400 |
| 8 | Champ inconnu | `curl -i -X POST $U -H "$H" -H 'x-patient-id: 1' -d '{"idDisponibilite":2,"idPatient":2}'` | 400 |
| 9 | Motif trop long (> 255) | `curl -i -X POST $U -H "$H" -H 'x-patient-id: 1' -d "{\"idDisponibilite\":2,\"motif\":\"$(printf 'a%.0s' {1..300})\"}"` | 400 |
| 10 | Sans authentification | `curl -i -X POST $U -H "$H" -d '{"idDisponibilite":2}'` | 401 |

Après le test 1, le journal de l'API doit afficher la ligne `[SIMULATION] Confirmation envoyée à ...`.

### 7.4 Test de concurrence (double réservation)

C'est le test qui valide le risque principal de l'UC. Il lance 10 réservations simultanées du même créneau.

```bash
# Le créneau doit être libre : si besoin, vider les réservations
#   DELETE FROM rendez_vous;   (phpMyAdmin)
node scripts/test-concurrence.js 2 10
```

Paramètres : `idDisponibilite` (défaut 1) et nombre de requêtes (défaut 10). L'URL se change avec `API_URL`.

Attendu :
```
Codes HTTP obtenus : { '201': 1, '409': 9 }
OK : un seul rendez-vous confirmé.
```
Le script termine avec le code 0 en cas de succès, 1 sinon.

### 7.5 Vérifications SQL

```sql
-- Aucun créneau avec plus d'un rendez-vous CONFIRME (doit renvoyer 0 ligne)
SELECT id_disponibilite, COUNT(*) AS nb
FROM rendez_vous
WHERE statut = 'CONFIRME'
GROUP BY id_disponibilite
HAVING COUNT(*) > 1;

-- La base elle-même refuse un second rendez-vous confirmé (doit échouer avec l'erreur 1062 Duplicate entry)
INSERT INTO rendez_vous (id_patient, id_disponibilite, statut) VALUES (1, 1, 'CONFIRME');

-- Un rendez-vous annulé libère le créneau (doit réussir)
UPDATE rendez_vous SET statut = 'ANNULE' WHERE id_disponibilite = 1;
INSERT INTO rendez_vous (id_patient, id_disponibilite, statut) VALUES (2, 1, 'CONFIRME');
```

---

## 8. Points d'intégration

- **Authentification** : `PatientContextGuard` (en-tête `x-patient-id`) est temporaire. À remplacer par le garde JWT commun qui renseigne `request.patientId`. Le contrôleur et le décorateur `@PatientId()` n'ont alors pas à changer.
- **UC1** : ajouter `rechercherPourMedecin(idMedecin, date)` dans `DisponibiliteRepository` et importer le module dans `AppModule`.
- **UC3 (annulation)** : réutiliser `RendezVousRepository` (exporté) ; passer le statut à `ANNULE` libère automatiquement le créneau.
- **Fuseau horaire** : la règle « pas dans le passé » compare à l'heure locale du serveur.

## 9. Limites connues

- La notification est simulée (pas d'envoi réel) et les relances sont en mémoire : elles sont perdues si le serveur redémarre. En production, utiliser une file de messages.
- Le test de concurrence (7.4) et les requêtes SQL (7.5) doivent être exécutés sur la base XAMPP : les tests automatisés (7.1 et 7.2) simulent la base.