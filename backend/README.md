# MedBook – Backend (NestJS + MySQL)

Implémente l'**UC2 – Réserver un rendez-vous médical** (UC à risque : doubles réservations).

## Prérequis

- Node.js 20 ou 22 (LTS)
- XAMPP avec le module **MySQL** démarré (MariaDB 10.4+ / MySQL 8)

## Installation

```bash
cd backend
npm install
cp .env.example .env        # Windows : copy .env.example .env
```

### Base de données (XAMPP)

1. Démarrer **MySQL** dans le panneau XAMPP.
2. Ouvrir <http://localhost/phpmyadmin> → onglet **Importer** → `database/schema.sql`, puis `database/seed.sql`, puis `database/migration_auth.sql` (mots de passe de démo : `medbook123`).
   (ou en ligne de commande : `C:\xampp\mysql\bin\mysql.exe -u root < database/schema.sql`, idem pour `seed.sql`.)
3. Vérifier `.env` (par défaut : `root`, mot de passe vide, base `medbook`).

### Lancer

```bash
npm run start:dev        # http://localhost:3000/api
```

## Endpoint UC2

`POST /api/rendez-vous`

| | |
|---|---|
| En-tête | `x-patient-id: <id>` (authentification **temporaire**, voir ci-dessous) |
| Corps | `{ "idDisponibilite": 1, "motif": "Contrôle" }` (`motif` optionnel, 255 car. max) |

```bash
curl -X POST http://localhost:3000/api/rendez-vous \
  -H "Content-Type: application/json" -H "x-patient-id: 1" \
  -d '{"idDisponibilite":1,"motif":"Contrôle annuel"}'
```

| Code | Cas du document UML |
|---|---|
| 201 | Réservation confirmée (rendez-vous + médecin + cabinet + créneau) |
| 400 | A3 – données invalides |
| 401 | Patient non authentifié |
| 404 | Patient inconnu, ou A2 – créneau supprimé / inexistant |
| 409 | A1 – créneau déjà réservé (y compris course concurrente) |
| 422 | Créneau dans le passé (règle 3) |
| 503 | Verrou/deadlock MySQL : réessayer |

## Prévention des doubles réservations (3 niveaux)

1. **Service** : vérifie qu'aucun rendez-vous `CONFIRME` n'existe → 409 explicite.
2. **Transaction + verrou** : `SELECT ... FOR UPDATE` sur la ligne `disponibilite` ; les demandes simultanées sont sérialisées.
3. **Base de données** : MySQL n'a pas d'index unique partiel ; la colonne générée `creneau_confirme_id` (= `id_disponibilite` si `CONFIRME`, sinon `NULL`) porte un index `UNIQUE`. Les rendez-vous `ANNULE` restent dans l'historique sans bloquer le créneau. Une violation (erreur 1062) est convertie en 409.

Test de concurrence (API lancée) : `node scripts/test-concurrence.js 1 10` → attendu : un seul 201, neuf 409.

## Tests

```bash
npm test             # tests unitaires et d’intégration
npm run test:integration  # tests HTTP UC1 sans base de données
```

`test/recherche.service.spec.ts` couvre UC1 A1–A3 et vérifie que l’erreur technique
UC1 A4 remonte depuis le service. Le contrat de réponse proposant explicitement
au patient de réessayer reste en attente. Les scénarios UC2 sont déclarés `todo`
dans Jest : leurs composants ne sont pas présents dans `src/`.
Les tests HTTP de `test/integration/recherche.integration.spec.ts` exercent le
contrôleur, le service, le garde d’authentification et les réponses HTTP UC1 ;
les dépôts sont simulés, donc aucune base de données n’est nécessaire.

## Notification (acteur secondaire)

`NotificationsService` simule l'envoi (journal). Appelée **après** la transaction, de façon non bloquante avec 3 nouvelles tentatives (A5) : un échec n'annule jamais la réservation.

## Points d'intégration

- **UC1** : ajouter `rechercherPourMedecin(idMedecin, date)` dans `DisponibiliteRepository`, importer son module dans `AppModule`. Le `DisponibiliteRepository` et le `PatientRepository` sont exportés par leurs modules.
- **Authentification** : remplacer `PatientContextGuard` (en-tête `x-patient-id`, temporaire) par le garde JWT commun qui renseigne `request.patientId`. Le contrôleur n'est pas à modifier.
- **UC3** : réutiliser `RendezVousRepository` (exporté) ; l'annulation passe le statut à `ANNULE`, ce qui libère automatiquement le créneau grâce à la colonne générée.

## Structure

```
src/
├── entities/        Patient, Medecin, Specialite, Cabinet, Disponibilite, RendezVous, StatutRendezVous
├── rendez-vous/     controller, service, repository, dto  (UC2)
├── disponibilites/  DisponibiliteRepository (partagé)
├── patients/        PatientRepository
├── notifications/   NotificationsService
├── common/          PatientContextGuard, @PatientId()
└── config/          database.config.ts
```
