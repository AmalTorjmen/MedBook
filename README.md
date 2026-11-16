# UC1 – Rechercher un médecin et consulter ses disponibilités

> Projet MedBook – TP Processus unifiés et approches agiles (INSAT, RT4/1)
> Branches : `feature/uc1-recherche-medecin-backend` et `feature/uc1-recherche-medecin-frontend`

## 1. Fiche du cas d'utilisation (d'après la description textuelle)

| Élément | Valeur |
|---|---|
| Identifiant | UC1 |
| Acteur principal | Patient |
| Acteurs secondaires | Aucun |
| Objectif | Permettre au patient de rechercher un médecin selon plusieurs critères et de consulter ses disponibilités |
| Déclencheur | Le patient souhaite trouver un médecin ou consulter ses créneaux disponibles |

**Préconditions**
- Le patient possède un compte MedBook et est **authentifié** (d'où l'authentification livrée avec cet UC).
- Les informations des médecins sont disponibles sur la plateforme.

**Scénario nominal**
1. Le patient accède à la recherche de médecins.
2. Le système affiche un formulaire de recherche.
3. Le patient renseigne un ou plusieurs critères : nom, spécialité ou cabinet.
4. Le patient lance la recherche.
5. Le système vérifie les critères saisis.
6. Le système recherche les médecins correspondants.
7. Le système affiche les résultats.
8. Le patient sélectionne un médecin.
9. Le système affiche la fiche du médecin et ses créneaux disponibles.

**Scénarios alternatifs**
| Cas | Comportement implémenté |
|---|---|
| A1 – Aucun critère saisi | La liste de tous les médecins est affichée |
| A2 – Aucun médecin correspondant | Message « Aucun médecin ne correspond à ces critères » |
| A3 – Aucun créneau disponible | Fiche du médecin + message « aucun créneau libre pour le moment » |
| A4 – Erreur technique | Message d'erreur (ex. « Serveur injoignable ») ; le patient peut relancer |

**Postconditions** : les résultats ou la fiche du médecin sont affichés ; aucune réservation n'est créée ni modifiée.

## 2. Réalisation – backend (`backend/`)

Architecture en trois couches : contrôleur → service → repository.

| Couche | Fichier | Rôle |
|---|---|---|
| Présentation | `src/recherche/recherche.controller.ts` | Routes UC1, validation des critères (DTO) |
| Métier | `src/recherche/recherche.service.ts` | Mise en forme des résultats, médecin introuvable → 404 |
| Accès aux données | `src/recherche/medecin.repository.ts`, `src/disponibilites/disponibilite.repository.ts` | Recherche par critères ; créneaux **futurs et sans rendez-vous CONFIRME** |
| Sécurité | `src/auth/*`, `src/common/guards/patient-context.guard.ts` | Inscription / connexion, jeton JWT, mots de passe hachés (scrypt) |

**Routes**
| Méthode | Route | Rôle |
|---|---|---|
| POST | `/api/auth/inscription` | Créer un compte patient |
| POST | `/api/auth/connexion` | Se connecter (renvoie le jeton) |
| GET | `/api/auth/moi` | Profil du patient connecté |
| GET | `/api/medecins?nom=&idSpecialite=&idCabinet=` | Étapes 3 à 7 |
| GET | `/api/medecins/:id/disponibilites` | Étapes 8 et 9 |
| GET | `/api/specialites`, `/api/cabinets` | Listes du formulaire |

**Base de données** (`database/`), à importer dans cet ordre :
`schema.sql` → `seed.sql` → `migration_auth.sql` → `migration_photos.sql` (→ `fix_encodage.sql` si les accents sont cassés).

## 3. Réalisation – frontend (`frontend/`)

| Fichier | Rôle |
|---|---|
| `src/app/pages/connexion`, `src/app/pages/inscription` | Authentification (précondition) |
| `src/app/pages/recherche/recherche.component.ts` | Formulaire de recherche + résultats (étapes 1 à 8) |
| `src/app/core/medbook-api.service.ts` | Appels à l'API UC1 |
| `src/app/core/auth.*` | Session, intercepteur JWT, gardes de route |
| `src/app/shared/avatar.component.ts` | Avatars des médecins et des patients |

L'étape 9 (fiche + créneaux) s'affiche sur la page de réservation, livrée avec l'UC2.

## 4. Installation dans le dépôt

- Copier le contenu de `backend/` dans le dossier `backend/` du dépôt.
- Copier le contenu de `frontend/` dans le dossier `frontend/` du dépôt.
- `frontend/.gitignore-racine` : ajouter ses lignes au `.gitignore` à la racine du dépôt, puis supprimer ce fichier.

```bash
# backend
cd backend && cp .env.example .env && npm install && npm run start:dev
# frontend (autre terminal)
cd frontend && npm install && npm start      # http://localhost:4200
```
Comptes de démonstration : `amal.torjmane@example.com` ou `nour.smadhi@example.com`, mot de passe `medbook123`.

## 5. Branches et commits

```bash
# --- Backend ---
git checkout develop && git pull origin develop
git checkout -b feature/uc1-recherche-medecin-backend
git add backend/src/auth backend/src/common backend/src/entities backend/src/patients \
        backend/database/migration_auth.sql backend/.env.example
git commit -m "feat(auth): inscription et connexion des patients (JWT)"
git add backend/src/recherche backend/src/disponibilites backend/src/app.module.ts backend/database backend/README.md
git commit -m "feat(uc1): API de recherche de médecins et de créneaux libres"
git push -u origin feature/uc1-recherche-medecin-backend
# → Pull Request vers develop, puis merge

# --- Frontend ---
git checkout develop && git pull origin develop
git checkout -b feature/uc1-recherche-medecin-frontend
git add frontend .gitignore
git commit -m "feat(uc1): interface Angular — connexion, inscription, recherche"
git push -u origin feature/uc1-recherche-medecin-frontend
# → Pull Request vers develop, puis merge
```
