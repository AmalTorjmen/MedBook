# MedBook – Plateforme de prise de rendez-vous médicaux

Projet réalisé dans le cadre de la matière **Processus Unifiés et Approches Agiles**
(INSAT – Filière RT, groupe RT4/1, année universitaire 2026–2027).
Enseignante : Mme Hajer Taktak.

**Équipe :** Abdelkader Mohamed Louay, Besrour Nour, Bouzouita Baya, Torjmane Amal, Smadhi Nour.

## Vision

- **Problème :** la prise de rendez-vous dans un centre médical entraîne des délais d'attente, des erreurs et des conflits de réservation.
- **Utilisateurs :** patients, médecins, administrateur du centre.
- **Valeur :** simplifier la gestion des rendez-vous et des cabinets, éviter les doubles réservations et faire gagner du temps à tous.

## Acteurs

| Acteur | Rôle |
|---|---|
| Patient | S'inscrit, recherche un médecin, réserve et annule un rendez-vous |
| Médecin | Gère ses disponibilités (compte créé par l'administrateur) |
| Administrateur | Gère les comptes, médecins, spécialités et cabinets |
| Système de notification | Acteur secondaire externe (confirmations, annulations) |

## Cas d'utilisation

| UC | Intitulé | Priorité | Milestone | Statut |
|---|---|---|---|---|
| UC1 | Rechercher un médecin et consulter ses disponibilités | 1 | Élaboration | Réalisé |
| UC2 | Réserver un rendez-vous médical (**UC à risque technique**) | 1 | Élaboration | Réalisé |
| UC3 | Annuler un rendez-vous médical | 3 | Construction | À faire |
| UC4 | Gérer les disponibilités | 2 | Construction | À faire |
| UC5 | Gérer les comptes, médecins, spécialités et cabinets | 4 | Construction / Transition | À faire |

L'**UC2** est l'UC à risque : le système doit empêcher que deux patients réservent
le même créneau simultanément (transaction, verrou pessimiste `SELECT ... FOR UPDATE`,
contrainte `UNIQUE`).

## Architecture

Architecture en trois couches :

- **Frontend :** Angular (SPA)
- **Backend :** NestJS / TypeScript, TypeORM (contrôleurs → services → repositories)
- **Base de données :** MySQL
- **Sécurité :** JWT, mots de passe hachés (scrypt)
- **API :** REST JSON sous `/api`

## Organisation du dépôt

```
medbook/
├── backend/    # API NestJS : contrôleurs, services, repositories, tests
├── frontend/   # Application Angular
├── docs/       # Fiches UC, diagrammes PlantUML (docs/uml), exigences, 2TUP
└── .github/    # Workflow d'intégration continue (GitHub Actions)
```

## Gestion du projet

- **Issues :** une issue par cas d'utilisation, plus une issue « Vision & analyse des besoins ».
- **Projects :** tableau Kanban (Backlog / En cours / Revue / Terminé).
- **Milestones :** un par phase (Inception, Élaboration, Construction, Transition).
- **Branches :** une branche par UC, par exemple `feature/UC1-search-doctor`
  et `feature/UC2-book-appointment`.
- **Pull Requests :** une PR par UC avec `Closes #n`, relue par une autre équipe.
- **Traçabilité :** UC → ticket → branche → classes → tests.

## Phases et jalons

| Phase | Itération | Jalon (tag) | État |
|---|---|---|---|
| Inception | 1 | `v0.0-inception` | Terminée |
| Élaboration | 1 | `v0.1-elaboration` | Terminée |
| Construction | 2 – 3 | `v0.2.0` | À venir |
| Transition | 3 | `v1.0.0` | À venir |

## État d'avancement

Projet réalisé dans le cadre du TP1 (Processus unifié) et du TP2 (2TUP) :

- Inception et Élaboration terminées : vision, acteurs, diagramme de cas d'utilisation,
  fiches UC, priorisation, architecture de base exécutable, UC1 et UC2 réalisés.
- Construction et Transition : UC3, UC4 et UC5 restent à réaliser.

## Documentation

- Diagrammes PlantUML : `docs/uml/`
- Fiches UC : `docs/`
- Exigences fonctionnelles et techniques et cycle en Y : `docs/`
