# Electro Lab — Product Architecture

## Surfaces

- **Lab** (`/lab`) — schematic editor + circuit simulation
- **Learn** (`/learn`) — guided projects, quizzes, progress (later)
- **Account** (`/account`) — auth/profile (later)

## Deployables

| Name | Path | Role |
|------|------|------|
| Web | `apps/web` | Angular product shell |
| CircuitEngine | `services/circuit-engine` | HTTP host for simulation (`/api/circuit/*`) |
| LearningApi | `services/learning-api` | Catalog/auth/progress + i18n (`/api/learning/*`) |
| Proxy | `deploy/proxy` | Routes `/` → web, `/api/circuit` → circuit-engine, `/api/learning` → learning-api |
| Postgres | Compose `db` | Translations (and future Learn data) |

## Libraries

| Name | Path | Role |
|------|------|------|
| CircuitSim | `src/ElectroLab.CircuitSim` | Pure DC/transient/AC physics core (no HTTP) |

## Transport (Lab ↔ CircuitEngine)

DC operating point uses **HTTP POST** (`/api/circuit/simulate`). No WebSocket in Phase A.
Optional streaming (WebSocket/SSE) only if later transient/live modes need it.

## i18n

- Strings live in Postgres `translations` (`locale`, `key`, `value`).
- `GET /api/learning/i18n/{locale}` returns the dictionary.
- Angular loads at startup (`I18nService`); English fallback is embedded so Lab works if the API is down.
- First locale seeded: **en**. Add rows for other locales later with the same keys.

## Deferred (by design)

- **AC analysis** and richer multi-channel scope UX.
- Learn catalog / quizzes and LearningApi auth/progress (i18n slice exists).
- SPICE-level semiconductor models (op-amps, BJT/MOS).
- WebSocket / SSE streaming for live transient playback.
