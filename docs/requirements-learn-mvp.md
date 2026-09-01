# Learn MVP — requirements (Phase B)

**Phase B deliverable only.** Product-wide NFRs: [requirements.md](requirements.md). Final product picture: [product-overview.md](product-overview.md). Gate: [roadmap.md](roadmap.md) G2 before substantial implementation.

Lab v1 is frozen. This file defines the **first Learn implementation slice**.

Also useful: [glossary.md](glossary.md), [learn-content-map.md](learn-content-map.md) (target curriculum), [adr/](adr/).

## Goal

Anonymous visitors can browse electronics projects on `/learn`, follow a short checklist, and open the matching Lab example.

## In this phase

- A real **project catalog** (structured data, not only prose in the template)
- Each project: title, summary, ordered steps, Lab example id
- Content lives in the repo for now (see [ADR-002](adr/002-learn-content-source.md)) — migration path in [domain-model.md](domain-model.md)
- All visible Learn copy goes through i18n
- No account required ([ADR-003](adr/003-auth-deferred.md))

## Not in this phase

- Quizzes and scores
- Server-side progress (local checkmarks optional — [ADR-004](adr/004-progress-storage.md))
- Sign-in
- A CMS
- New Lab parts or simulator features

---

## Journeys

**Browse → Lab**

1. Open `/learn`
2. See projects with title + short summary
3. Open one and read the steps
4. Click Open in Lab
5. Arrive on `/lab?example=…` with the right preset

**When something is down**

- LearningApi out: Learn works from English fallback / client catalog where designed
- CircuitEngine out: Learn still browsable; Lab shows error on Run

---

## Note on architecture vs these FRs

Browse-project and open-Lab (FR-L1…L6) do **not** by themselves require multiple backends. The split (web / CircuitEngine / LearningApi) is justified by resilience and isolation — [ADR-006](adr/006-deployment-style.md). Thin FRs for a future area → write drivers + an ADR; default to **fewer** services.

## Functional requirements

| ID | What | Priority |
|----|------|----------|
| FR-L1 | See a catalog of projects on `/learn` | Must |
| FR-L2 | Each project has title, summary, steps, and Lab example id | Must |
| FR-L3 | Open Lab from a project via deep-link | Must |
| FR-L4 | Learner-facing strings use i18n keys | Must |
| FR-L5 | Catalog from agreed source (ADR-002), grouped per [learn-content-map.md](learn-content-map.md) — not one-off template hardcoding | Must |
| FR-L6 | No sign-in required | Must |
| FR-L7 | Optional local “step done” ticks | Should |
| FR-L8 | HTTP catalog on LearningApi | Could (when ADR moves catalog server-side) |
| FR-L9 | Quizzes | Later (Phase C+) |

## Phase B acceptance (done when)

- [x] `/learn` lists all catalog units (13 projects + basics) grouped by module
- [x] Each Open in Lab hits the right example id
- [x] No account needed
- [x] EN keys exist in `en-fallback.ts` and `TranslationSeeder`
- [x] Architecture + ADRs still match what we shipped
- [x] A small test covers catalog → example id
- [ ] CircuitEngine and LearningApi logging debuggable locally (NFR-7 in [requirements.md](requirements.md))
- [x] Learn pages have document titles / headings suitable for SEO (NFR-12); Lab remains noindex

## Rough traceability

| FR | Likely code |
|----|-------------|
| FR-L1–L3 | `features/learn/*`, Lab `?example=` |
| FR-L4 | `en-fallback.ts`, `TranslationSeeder.cs` |
| FR-L5 | Learn `data/` module (API when ADR-002 superseded) |
| FR-L7 | `localStorage` under Learn |

## Follow-on (later phases)

- Server progress (Account)
- Auth
- Quizzes — see [requirements.md](requirements.md) capability map
