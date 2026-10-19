# Microservice Ranking (ms-ranking)

Le microservice **`ms-ranking`** classe, pour chaque utilisateur, les événements et les posts
(score structurel, scoreur sémantique optionnel, repli à froid en 206 `FALLBACK_ACTIVATED`).

Ce dépôt est en cours de mise en place : seuls le dépôt, la CI et les hooks existent pour
l'instant. Le socle NestJS arrive avec le ticket 3.2 du plan.

## Documentation

La conception complète est dans le dépôt `docs`, dossier `docs/matching/` (commencer par
`13-decisions-v1.md`, puis `14-plan-d-implementation.md`).

## Prérequis

- **Node.js** (>= 24.14.0)
- **Package Manager** : Yarn v4 (`corepack enable`)
- PostgreSQL de test : service `postgres-ranking` de `ci-tools/docker-compose.yml` (port 5438).
