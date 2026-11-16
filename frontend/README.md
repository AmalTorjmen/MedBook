# MedBook – Frontend Angular

Interface patient pour **l'authentification**, **UC1** (rechercher un médecin et voir ses disponibilités) et **UC2** (réserver un rendez-vous).

## Lancer

```bash
# 1. Backend (dans ../backend)
#    importer database/schema.sql, seed.sql puis migration_auth.sql
npm install && npm run start:dev        # API sur http://localhost:3000/api

# 2. Frontend (ici)
npm install
npm start                                # http://localhost:4200  (proxy /api → :3000)
```

Comptes de démonstration (créés par le seed) : `amal.torjmane@example.com` ou `nour.smadhi@example.com`, mot de passe `medbook123`. Vous pouvez aussi créer un compte depuis la page d'inscription.

## Structure (3 couches côté client)

```
src/app/
├── core/                    # services, modèles, sécurité
│   ├── auth.service.ts      # session (signal) + appel /auth
│   ├── auth.interceptor.ts  # ajoute "Authorization: Bearer <jwt>", déconnecte sur 401
│   ├── auth.guard.ts        # authGuard (UC1/UC2) + inviteGuard (connexion)
│   ├── medbook-api.service.ts
│   └── models.ts
└── pages/
    ├── connexion/  inscription/
    ├── recherche/           # UC1 – formulaire nom / spécialité / cabinet + résultats
    └── reservation/         # UC1 (créneaux libres) + UC2 (choix, motif, confirmation)
```

## Routes API utilisées

| Méthode | Route | UC |
|---|---|---|
| POST | `/api/auth/connexion`, `/api/auth/inscription` | Authentification |
| GET | `/api/specialites`, `/api/cabinets`, `/api/medecins?nom=&idSpecialite=&idCabinet=` | UC1 |
| GET | `/api/medecins/:id/disponibilites` | UC1 |
| POST | `/api/rendez-vous` | UC2 |

Le scénario alternatif de l'UC2 « créneau déjà pris » (HTTP 409) est géré : le message s'affiche et la liste des créneaux se recharge.

## Photos des médecins et des patients

Chaque personne a un avatar illustré, généré à partir de son nom (`shared/avatar.component.ts`) : une blouse blanche et un stéthoscope pour les médecins, une tenue de couleur pour les patients. Aucune connexion Internet n'est nécessaire.

Pour utiliser de vraies photos :
1. importez `backend/database/migration_photos.sql` ;
2. déposez les images dans `frontend/public/images/medecins/` ou `frontend/public/images/patients/` ;
3. renseignez la colonne `photo_url`, par exemple `UPDATE medecin SET photo_url = '/images/medecins/1.jpg' WHERE id_medecin = 1;`.

Si la photo est absente ou introuvable, l'avatar illustré s'affiche automatiquement.
