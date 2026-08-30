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

Simulation uses **HTTP POST** (`/api/circuit/simulate`) for DC, transient, and AC. No WebSocket in Phase A.
Optional streaming (WebSocket/SSE) only if later transient/live modes need it.

## i18n

- Strings live in Postgres `translations` (`locale`, `key`, `value`).
- `GET /api/learning/i18n/{locale}` returns the dictionary.
- Angular loads at startup (`I18nService`); English fallback is embedded so Lab works if the API is down.
- First locale seeded: **en**. Add rows for other locales later with the same keys.

## Lab (shipped)

- DC operating point, fixed-step transient (`tStop`/`dt`), and single-frequency (or sweep-capable) **AC** analysis
- Multi-trace scope with time scrub driving canvas/probe; probe tool for net V / branch I
- Wire-current animation (KCL fill); status banner for errors / warnings / IC / probe
- Duplicate / clipboard / JSON import-export; named local circuit tabs
- Teaching pack: battery, R, C (optional `ic`), L (optional `ic`), LED/diode, switch (`openAt` / `closeAt`), pulse, pot, ammeter/voltmeter, op-amp (VCVS with teaching rails), switch-like NPN BJT, AC source (sine in transient when `freq` > 0)
- Example presets including LED series, **LED fade** (two-run capacitor IC carry-over), RC, pot, pulse, op-amp invert, AC RC LPF, BJT LED switch
- Transient option `initFromDc` (Lab toolbar checkbox) to seed C/L state from a DC solve at t = 0
- Lab polarity cues (`+`/`−`, A/K) and diagnostics for AC nonlinear opens, silent AC sources, switch+inductor spikes

## Deferred (by design)

- Learn catalog / quizzes and LearningApi auth/progress (i18n slice exists)
- SPICE-level semiconductors (real op-amps, BJT/MOS) and AC bias linearization of nonlinear devices
- Transformers; WebSocket / SSE streaming for live transient playback
- Bode UI for AC sweeps (engine can list frequencies; Lab emphasizes a single `f` today)
