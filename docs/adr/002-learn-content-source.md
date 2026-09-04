# ADR-002: Where Learn content lives (MVP)

- **Status:** Accepted  
- **Date:** 2026-08-31

## Context

Learn is currently one page with projects mostly written in the template and strings in i18n. We want a proper catalog (ids, Lab example link, step keys) without building a CMS.

Options we considered: TypeScript module in the repo, markdown at build time, Postgres/API from day one, external CMS.

## Decision

**Ship Learn catalog + assessment criteria from TypeScript (`learn-catalog.ts`, `learn-challenge-spec.ts`) with LearningApi seeding the same structure into Postgres for progress.** Translations stay in LearningApi. Full CMS / author UI remains future work.

## Consequences

We can move fast and unit-test “project → example id”. No new tables for Phase B. Non-devs can’t edit in a UI yet — fine until content volume or authors justify a CMS.

**This is not permanent architecture.** Catalog ids, module/unit slugs, steps, and `exampleId` must match the target shape in [domain-model.md](../domain-model.md) so a later move to LearningApi is a **transport change**, not a curriculum rewrite. When we outgrow the TS module, write an ADR and serve the same DTOs from Postgres.
