# MedBook – Organisation Git et commandes

## 1. Structure du dépôt (monorepo)

```
medbook/
├── .github/
│   ├── workflows/backend-ci.yml        # CI : build + tests
│   └── PULL_REQUEST_TEMPLATE.md
├── backend/                            # API NestJS + MySQL
│   ├── database/                       # schema.sql, seed.sql (XAMPP / phpMyAdmin)
│   ├── src/
│   │   ├── entities/                   # entités du modèle métier
│   │   ├── patients/                   # PatientRepository (partagé)
│   │   ├── disponibilites/             # DisponibiliteRepository (partagé UC1/UC2/UC4)
│   │   ├── rendez-vous/                # UC2 (puis UC3) : controller, service, repository, dto
│   │   ├── notifications/              # Système de notification (acteur secondaire)
│   │   ├── common/                     # guards, decorators
│   │   └── config/
│   └── test/                           # tests e2e
├── frontend/                           # interface web (plus tard)
├── docs/
│   ├── uml/                            # diagrammes (cas d'utilisation, classes, séquence)
│   ├── rapports/                       # rapports TP (PDF)
│   └── GIT_WORKFLOW.md
├── .gitignore
└── README.md
```

## 2. Stratégie de branches

| Branche | Rôle |
|---|---|
| `main` | Version livrable (fin d'itération). Protégée : merge uniquement par PR. |
| `develop` | Branche d'intégration. Toutes les features y sont fusionnées. |
| `feature/ucX-description` | Une branche par cas d'utilisation / tâche. |
| `fix/description` | Correction de bug. |
| `docs/description` | Documentation / UML. |

Branches prévues selon la planification des itérations :

- Itération 1 : `docs/uml-conception`
- Itération 2 : `feature/uc1-recherche-medecin`, `feature/uc2-reservation-backend`
- Itération 3 : `feature/uc3-annulation`, `feature/uc4-gestion-disponibilites`, `feature/uc5-administration`

## 3. Convention de commits (Conventional Commits)

```
<type>(<portée>): <message court à l'impératif>
```

Types : `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.
Exemples :
`feat(uc2): ajouter la réservation transactionnelle`
`test(uc2): couvrir le conflit de double réservation`
`docs(uml): ajouter le diagramme de séquence UC2`

## 4. Commandes – mise en place (dépôt GitHub déjà créé)

### Cas A : le dépôt est vide et vous avez le dossier `medbook/` en local

```bash
cd medbook
git init -b main
git remote add origin https://github.com/<organisation>/<repo>.git
git add .
git commit -m "chore: initialiser la structure du projet MedBook"
git push -u origin main

# Créer la branche d'intégration
git checkout -b develop
git push -u origin develop
```

### Cas B : le dépôt existe déjà et contient des fichiers (README…)

```bash
git clone https://github.com/<organisation>/<repo>.git
cd <repo>
# copier le contenu de medbook/ dans ce dossier, puis :
git add .
git commit -m "chore: initialiser la structure du projet MedBook"
git push origin main
git checkout -b develop
git push -u origin develop
```

### Chaque membre de l'équipe

```bash
git clone https://github.com/<organisation>/<repo>.git
cd <repo>
git checkout develop
git config user.name  "Prénom Nom"
git config user.email "email@exemple.com"
```

## 5. Commandes – cycle de travail sur une feature (ex. UC2)

```bash
# 1. Partir de develop à jour
git checkout develop
git pull origin develop

# 2. Créer la branche de feature
git checkout -b feature/uc2-reservation-backend

# 3. Travailler, puis committer par petites étapes
git add backend/src/entities backend/database
git commit -m "feat(uc2): ajouter les entités et le schéma SQL"
git add backend/src/rendez-vous
git commit -m "feat(uc2): implémenter RendezVousService transactionnel"
git add backend/src/**/*.spec.ts backend/test
git commit -m "test(uc2): tester les règles de réservation"

# 4. Publier la branche
git push -u origin feature/uc2-reservation-backend

# 5. Ouvrir une Pull Request vers develop (GitHub web, ou avec gh)
gh pr create --base develop --title "feat(uc2): réservation d'un rendez-vous" --body "Voir le template"

# 6. Après relecture et merge : nettoyer
git checkout develop
git pull origin develop
git branch -d feature/uc2-reservation-backend
git push origin --delete feature/uc2-reservation-backend
```

## 6. Commandes utiles au quotidien

```bash
git status                     # état des fichiers
git log --oneline --graph --all
git diff                       # modifications non indexées
git stash / git stash pop      # mettre de côté le travail en cours

# Récupérer les changements de develop dans sa feature
git checkout feature/uc2-reservation-backend
git fetch origin
git rebase origin/develop      # ou: git merge origin/develop
# en cas de conflit : corriger, puis
git add <fichier> && git rebase --continue

# Annuler le dernier commit local (en gardant les modifications)
git reset --soft HEAD~1
```

## 7. Fin d'itération : livraison vers `main`

```bash
git checkout main
git pull origin main
git merge --no-ff develop -m "chore: livraison itération 2"
git tag -a v0.2.0 -m "Itération 2 : UC1 + UC2"
git push origin main --tags
```

## 8. Règles d'équipe

1. Ne jamais pousser directement sur `main` ni `develop` : toujours passer par une PR.
2. Une PR = une fonctionnalité, relue par au moins un autre membre.
3. Ne jamais committer `.env` (utiliser `.env.example`).
4. Mettre à jour `backend/database/schema.sql` à chaque changement du modèle.
5. Activer sur GitHub : *Settings → Branches → Branch protection rules* pour `main` et `develop` (PR obligatoire, CI verte).
