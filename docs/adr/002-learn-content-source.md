# ADR-002: Where Learn content lives (MVP)

- **Status:** Accepted  
- **Date:** 2026-08-31

## Context

Learn is currently one page with projects mostly written in the template and strings in i18n. We want a proper catalog (ids, Lab example link, step keys) without building a CMS.

Options we considered: TypeScript module in the repo, markdown at build time, Postgres/API from day one, external CMS.

## Decision

**Keep MVP content in a TypeScript catalog under `apps/web/src/app/features/learn/data/`.** Prose stays in i18n keys (`learn.project.*`). LearningApi stays translations-only until we consciously move the catalog.

## Consequences

We can move fast and unit-test “project → example id”. No new tables for Phase B. Non-devs can’t edit in a UI yet — fine until content volume or authors justify a CMS.

**This is not permanent architecture.** Catalog ids, module/unit slugs, steps, and `exampleId` must match the target shape in [domain-model.md](../domain-model.md) so a later move to LearningApi is a **transport change**, not a curriculum rewrite. When we outgrow the TS module, write an ADR and serve the same DTOs from Postgres.
