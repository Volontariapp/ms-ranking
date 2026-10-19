# Microservice Ranking (ms-ranking)

Le microservice **`ms-ranking`** classe, pour chaque utilisateur, les événements et les posts
(score structurel, scoreur sémantique optionnel, repli à froid en 206 `FALLBACK_ACTIVATED`).

Cette première itération est un squelette d'infrastructure : NestJS + connexion PostgreSQL (via
`@volontariapp/bridge-nest` et TypeORM) + migrations communes de l'outbox + healthcheck. Le serveur
gRPC et la logique de classement arrivent avec les tickets suivants (voir le plan).

## Documentation

La conception complète est dans le dépôt `docs`, dossier `docs/matching/` (commencer par
`13-decisions-v1.md`, puis `14-plan-d-implementation.md`).

## Getting Started

### Prérequis

- **Node.js** (>= 24.14.0)
- **Package Manager** : Yarn v4 (`corepack enable`)
- PostgreSQL : service `postgres-ranking` de `ci-tools/docker-compose.yml` (port 5438).
- Clé publique interne : `certs/internal.pub` (générée par `scripts/gen_certs.sh` de `meta`).

### Installation et exécution

```bash
yarn install
docker compose -f ci-tools/docker-compose.yml up -d postgres-ranking --wait
yarn build && yarn migration:run:local
yarn start:local
```

Vérifier la connexion à la base de données :

```bash
curl http://localhost:3007/health
```
