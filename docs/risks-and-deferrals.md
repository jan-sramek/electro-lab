# Risks and deferrals

What to **decide early**, what to **defer**, and what **not to start** — so we don’t lock in expensive mistakes during the first analysis pass.

Related: [ADR-008](adr/008-analysis-and-reversibility.md), [roadmap.md](roadmap.md), [analysis-checklist.md](analysis-checklist.md).

---

## Decide early (expensive to change)

| Choice | Why direction matters now | Where documented |
|--------|---------------------------|------------------|
| Learn **URL / IA** (`/learn`, `/learn/{module}`, `/learn/{module}/{unit}`) | SEO, redirects, shares, AI citations | [seo-plan.md](seo-plan.md), [ADR-007](adr/007-seo.md) |
| **Stable unit slugs** and example ids | Deep links, curriculum, analytics | [learn-content-map.md](learn-content-map.md) |
| **i18n key** namespaces (`learn.project.*`, `lab.*`) | Mass rename cost | [glossary.md](glossary.md) |
| **Netlist / simulate API** contract | Lab ↔ CircuitEngine coupling | [netlist-schema.md](netlist-schema.md), [ADR-001](adr/001-lab-v1-freeze.md) |
| **Bounded contexts** (Lab / Learn / Identity / CircuitSim) | Prevents solver or CMS logic in wrong layer | [domain-model.md](domain-model.md), [modules.md](modules.md) |
| **Deployment style** (modular processes, not microservice sprawl) | Ops and team shape | [ADR-006](adr/006-deployment-style.md) |
| **Logging backbone** (Serilog + pluggable sinks) | Cross-service consistency | [ADR-005](adr/005-logging.md) |
| **Public page rendering** (prerender or SSR for Learn) | Angular pipeline and crawlability | [ADR-007](adr/007-seo.md) |
| **Product positioning** (teaching simulator, not SPICE) | Scope creep and wrong users | [product-overview.md](product-overview.md), [vision.md](vision.md) |

---

## Safe to defer (don’t build until justified)

| Choice | Defer until | Risk if built too early |
|--------|-------------|-------------------------|
| Auth provider (OAuth, email, etc.) | Account phase (C) | Wrong integration and data model |
| JWT vs server session | Account design gate | Security and client complexity |
| Full CMS | Content volume or non-dev authors need it | Authoring and migration cost |
| Quiz / attempt schema | Catalog and unit shape stable | Wrong tables and UX |
| Streaks, XP, leaderboards | Progress + account exist | Game design churn |
| OTLP collector vendor | Production deploy | Low — ADR-005 already abstracts sinks |
| `llms.txt`, AI crawler policy | Public Learn pages live | Low |
| Read replicas, Redis, job queues | Measured load | Premature cost |
| Native mobile apps | Web product proven | High sunk cost |
| WebSocket live transient | Measured need for playback | Pipeline complexity |

**Phase B TS catalog** ([ADR-002](adr/002-learn-content-source.md)) is a deliberate deferral of server catalog — not a permanent architecture. Migration path: same DTO shape on LearningApi when an ADR approves.

---

## Do not start without a new ADR

- New Lab device families or protocol bit-banging ([ADR-001](adr/001-lab-v1-freeze.md))
- SPICE-level models, full MCU emulation
- Extra backend services beyond web / CircuitEngine / LearningApi / DB
- NgRx or large front-end frameworks “for later”
- User-generated content in Learn (XSS and moderation scope)

---

## Risk register (living)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep into “real” simulator | Delays Learn; wrong quality bar | Lab freeze ADR; product-overview boundaries |
| Learn URLs redesigned after launch | SEO loss, broken links | Lock IA in G2; canonical slugs in content map |
| Content stuck in repo forever | Non-devs blocked | ADR-002 migration path; server catalog ADR when needed |
| Auth rushed before anonymous path works | Split UX | ADR-003; Account is phase C |
| Simulate API abuse on public deploy | Cost / DoS | Rate limits when exposed; quality.md threat notes |
| AI-generated content at scale | Trust / SEO penalties | Human-reviewed units; seo-plan anti-patterns |
| Under-documented privacy for minors | Compliance surprise | Revisit at Account + analytics; note in checklist |

---

## Privacy note (planned)

MVP is anonymous. Before Account and analytics: decide what we store, retention, and whether minors are in scope. No legal doc in-repo yet — flag for phase C gate.
