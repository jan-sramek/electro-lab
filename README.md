# electro-lab

DIY electronics learning platform — **Learn** + **Lab** (circuit simulator).

## Architecture

See [docs/product-architecture.md](docs/product-architecture.md).

| Piece | Role |
|-------|------|
| `apps/web` | Angular product shell (`/lab`, `/learn`) |
| `services/circuit-engine` | HTTP host for `/api/circuit/simulate` |
| `src/ElectroLab.CircuitSim` | Pure DC circuit solver (MNA) |

## Lab

Interactive schematic editor: place parts from the palette, wire pin-to-pin, inspect params, run **DC**, **transient**, or **AC** analysis (scope for `tran`). Schematics autosave to `localStorage`. Example circuits include LED fade with capacitor initial-condition carry-over.

## Quick start (Docker Compose)

```bash
docker compose up --build
```

Open http://localhost:8080/lab

Compose includes Postgres (`db` on host port **5433**), CircuitEngine, LearningApi (i18n), web, and nginx.

## Local development

Terminal 1 — Postgres (once):

```bash
docker compose up -d db
```

Terminal 2 — CircuitEngine:

```bash
dotnet run --project services/circuit-engine
```

Listens on http://localhost:5080

Terminal 3 — LearningApi (i18n from DB):

```bash
dotnet run --project services/learning-api
```

Listens on http://localhost:5081

Terminal 4 — Angular (proxies `/api/circuit` → 5080, `/api/learning` → 5081):

```bash
cd apps/web
npm start
```

Open http://localhost:4200/lab

## Tests

```bash
dotnet test
```
