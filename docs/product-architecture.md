# Electro Lab — product architecture

Final product (brief): [product-overview.md](product-overview.md). More detail: [architecture.md](architecture.md). Module map: [modules.md](modules.md). Principles: [vision.md](vision.md). Index: [README.md](README.md).

## Surfaces

- **Lab** (`/lab`) — schematic editor and simulation (**v1 is done and frozen**)
- **Learn** (`/learn`) — guided projects (next focus)
- **Account** (`/account`) — sign-in / profile (later)

## Deployables

| Name | Path | Role |
|------|------|------|
| Web | `apps/web` | Angular app |
| CircuitEngine | `services/circuit-engine` | `/api/circuit/*` |
| LearningApi | `services/learning-api` | `/api/learning/*` (i18n today) |
| Proxy | `deploy/proxy` | Routes web + APIs |
| Postgres | Compose `db` | Translations (and later Learn data) |

## Libraries

| Name | Path | Role |
|------|------|------|
| CircuitSim | `src/ElectroLab.CircuitSim` | DC / transient / AC solver (no HTTP) |

## Lab ↔ CircuitEngine

`POST /api/circuit/simulate` for DC, transient, and AC. No WebSocket in v1. Streaming only if we later need live transient playback and write an ADR for it.

## i18n

Strings sit in Postgres (`locale`, `key`, `value`). The web app loads them at startup and keeps an English fallback so Lab still works if LearningApi is down. First locale: **en**.

## Lab (shipped, frozen)

Editor with DC / transient / AC, scope scrubbing, probes, wire-current animation, local circuit tabs (including pin/close), teaching parts (including the Arduino-path set and I2C OLED), and the usual example presets.

**Don’t add Lab simulator features without** [adr/001-lab-v1-freeze.md](adr/001-lab-v1-freeze.md).

## Parked on purpose (by phase)

- Learn catalog — Phase B ([requirements-learn-mvp.md](requirements-learn-mvp.md)); product map: [requirements.md](requirements.md)
- Quizzes, server progress, Account — later phases ([roadmap.md](roadmap.md))
- Real SPICE-level semiconductors
- Transformers; WebSocket/SSE live playback
- Full Bode UI (engine can sweep; Lab mostly uses one frequency)
- Bit-level protocols / MCU emulation (we only teach wiring-level ideas, e.g. I2C OLED)
