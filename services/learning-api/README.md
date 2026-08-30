# LearningApi — catalog/auth/progress + i18n (`/api/learning/*`).

## Local

Requires Postgres. From repo root:

```bash
docker compose up -d db
dotnet run --project services/learning-api
```

Compose maps Postgres to host **5433** (avoids clashing with a local 5432). Connection string is in `appsettings.json`.

- Health: `GET http://localhost:5081/api/learning/health`
- Dictionary: `GET http://localhost:5081/api/learning/i18n/en`

## Schema

Table `translations` (`locale`, `key`, `value`) — composite PK. English rows are upserted from `TranslationSeeder` on startup (code catalog is source of truth). Other locales add rows with the same keys.
