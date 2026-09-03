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

| Type | Params |
|------|--------|
| `sim_ok` | — |
| `no_circuit_errors` | — |
| `analysis_mode` | `mode`: `dcOp` \| `tran` \| `ac` |
| `branch_current_min` | `refId`, `minAmps` |
| `branch_current_max` | `refId`, `maxAmps` |
| `switch_state` | `refId`, `closed` |

## Acceptance

- [x] Catalog + assessment structure in Postgres with EF migrations
- [x] All 13 Phase B units seeded with lessons, quiz, lab criteria
- [x] Web unit player with phased UI
- [x] Lab challenge panel when `?challenge=1`
- [x] Offline fallback catalog when API unavailable (prerender / dev without DB)
- [ ] Account links session to user (future)

## Out of scope

- Summative grading / certificates
- Server-side simulation for anti-cheat (client attestation for now)
- XP, streaks, module recap quizzes
