# ADR-008: Analysis-first delivery and reversibility

- **Status:** Accepted  
- **Date:** 2026-09-01

## Context

The product spans Lab, Learn, Account, curriculum, SEO, and several deployables. Building Learn before the **final product** is sketched leads to MVP-shaped docs, accidental one-way choices, and “vibe coded” scope.

We want a **waterfall-biased analysis pass** first: brief overview of the mature product, checklist of domains, gates before phase builds ([roadmap.md](../roadmap.md)). Implementation still ships in vertical slices **after** the relevant design gate.

## Decision

1. **G0 → G1 → G2 before Phase B build** — see [roadmap.md](../roadmap.md). No substantial Learn catalog work until G2 exit.
2. **Tier-1 docs are product-wide**, not MVP-only: [product-overview.md](../product-overview.md), [requirements.md](../requirements.md), [risks-and-deferrals.md](../risks-and-deferrals.md).
3. **Provisional choices must document a migration path** — e.g. TS catalog ([ADR-002](002-learn-content-source.md)) → same-shape API DTOs on LearningApi; not “forever architecture.”
4. **Expensive-to-change list** lives in [risks-and-deferrals.md](../risks-and-deferrals.md) and is reviewed at each gate.

## Expensive to change (summary)

Lock early: Learn URL/IA, unit slugs, i18n namespaces, netlist/simulate contract, bounded contexts, logging backbone, public rendering strategy (SSR/prerender).

Defer safely: auth provider, CMS, quiz schema, gamification economy, OTLP vendor, caching layers, native apps.

## Consequences

- More upfront documentation; less rework from wrong early bets
- Phase docs (e.g. [requirements-learn-mvp.md](../requirements-learn-mvp.md)) are **deliverables under** product requirements, not the whole story
- New cross-cutting or irreversible choices need an ADR and a risks-and-deferrals check
