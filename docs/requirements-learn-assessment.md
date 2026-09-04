# Learn assessment — requirements (Phase C slice)

Gated unit player: **read → quiz → lab challenge → next unit**. Catalog and progress live in **LearningApi** (Postgres). Lab criteria are checked on the client; the API records progress.

Related: [learn-content-map.md](learn-content-map.md), [domain-model.md](domain-model.md), [ADR-009](adr/009-learn-catalog-api.md), [ADR-004](adr/004-progress-storage.md).

## Goal

Each Learn unit is a vertical lesson with server-backed structure and anonymous session progress.

## Unit flow

1. **Lesson blocks** — informative text (i18n keys)
2. **Read confirmation** — learner attests they read the material
3. **Formative quiz** — all questions must be correct; explanations shown after submit
4. **Lab challenge** — declarative criteria verified against simulation in Lab
5. **Complete** — unlock next unit in path order

## API (`/api/learning/*`)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/catalog` | Modules + units + availability |
| GET | `/catalog/{module}/{unit}` | Full unit (lessons, quiz questions without answers, lab criteria) |
| GET | `/progress` | Session progress snapshot |
| PUT | `/progress/{module}/{unit}/read` | Mark read complete |
| POST | `/quiz/{module}/{unit}/submit` | Grade quiz server-side |
| POST | `/lab-challenge/{module}/{unit}/verify` | Record lab pass when all criteria reported passed |

**Session:** `X-Learn-Session: <uuid>` header (generated in browser `localStorage`). Migrates to Account later.

## Lab criterion types (client checker)

Frontend SPECS in `learn-challenge-spec.ts` override seeded API criteria at check time. Model keys match via `simModelOf` (e.g. `bc547` ↔ `bjt_npn`, `pushbutton` ↔ `switch`).

| Type | Params |
|------|--------|
| `sim_ok` | — |
| `no_circuit_errors` | — |
| `analysis_mode` | `mode`: `dcOp` \| `tran` \| `ac` |
| `has_models` | `models`: string[] (palette or sim model keys) |
| `min_wire_count` | `min` |
| `any_model_current_min` | `modelKey`, `minAmps` |
| `any_model_current_max` | `modelKey`, `maxAmps` |
| `any_cap_voltage_final_min` | `modelKey` (default `capacitor`), `minVolts` |
| `any_switch_closed` | — (includes pushbutton via switch sim model) |
| `any_pushbutton_pressed` | — |
| `any_pin_dc_voltage_between` | `modelKey`, `pin`, `minVolts`, `maxVolts` |
| `any_part_not_burned` | `modelKey` |
| `branch_current_min` | `refId`, `minAmps` |
| `branch_current_max` | `refId`, `maxAmps` |
| `switch_state` | `refId`, `closed` |

Per-unit overlays (when several units share one `exampleId`) live in `UNIT_CRITERIA` — e.g. `led-burn-limit`, `divider-design`.

## Acceptance

- [x] Catalog + assessment structure in Postgres with EF migrations
- [x] Learn units seeded with lessons, quiz, lab criteria (full catalog path; see `learn-catalog.ts`)
- [x] Web unit player with phased UI
- [x] Lab challenge panel when `?challenge=1`
- [x] Offline fallback catalog when API unavailable (prerender / dev without DB)
- [ ] Account links session to user (future)

## Out of scope

- Summative grading / certificates
- Server-side simulation for anti-cheat (client attestation for now)
- XP, streaks, module recap quizzes
