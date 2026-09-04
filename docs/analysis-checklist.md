# Analysis checklist

Use this so the **first product pass** does not skip a domain. Status is about **documentation and decisions**, not whether code exists.

Legend: **done** · **partial** · **planned** · **n/a**

Update this table when docs or ADRs change.

---

## Checklist

| Domain | Question we must answer | Status | Primary doc |
|--------|-------------------------|--------|-------------|
| Product vision | What is the final product in brief? | done | [product-overview.md](product-overview.md), [vision.md](vision.md) |
| Users & journeys | Who uses it and what do they do end-to-end? | done | [product-overview.md](product-overview.md), [requirements.md](requirements.md) |
| Curriculum | What do we teach, in what order? | done | [learn-content-map.md](learn-content-map.md) |
| Functional scope by phase | What ships when? | done | [requirements.md](requirements.md) (FR categories + capability map), [roadmap.md](roadmap.md) |
| Non-functional requirements | Performance, scale, logging, SEO, a11y, privacy, i18n | done | [requirements.md](requirements.md) |
| Domain model | Entities and bounded contexts at maturity | done | [domain-model.md](domain-model.md) |
| Target architecture | Deployables, integration, failure modes | done | [architecture.md](architecture.md), [ADR-006](adr/006-deployment-style.md) |
| Data ownership | Postgres vs browser vs stateless APIs | done | [domain-model.md](domain-model.md), [ADR-004](adr/004-progress-storage.md) |
| Auth & identity | Deferred; **G4 direction locked** (magic link + cookie) | partial | [ADR-003](adr/003-auth-deferred.md), [requirements-account.md](requirements-account.md) |
| Content authoring | Repo → API → CMS path | done | [ADR-002](adr/002-learn-content-source.md) |
| API contracts | Simulate JSON, future catalog API | done | [netlist-schema.md](netlist-schema.md), [circuit-engine.md](circuit-engine.md) |
| SEO & discovery | Classic search + AI-era citability | done | [seo-plan.md](seo-plan.md), [ADR-007](adr/007-seo.md) |
| Cross-cutting concerns | Logging, SEO, analytics, a11y, privacy, security, errors, perf, CI, UX | partial | [cross-cutting-concerns.md](cross-cutting-concerns.md) — principles done; Phase B implements per slice |
| Security & abuse | Simulate abuse, XSS, auth when added | partial | [quality.md](quality.md), [risks-and-deferrals.md](risks-and-deferrals.md) |
| Observability | Logging lifecycle | done | [ADR-005](adr/005-logging.md), [quality.md](quality.md) |
| Testing & quality gates | What blocks a phase merge | done | [quality.md](quality.md), [roadmap.md](roadmap.md) |
| Ops & deployment | Compose → production shape | partial | [ADR-006](adr/006-deployment-style.md) — prod runbooks later |
| Privacy & compliance | Minors deferred for G5; delete-account required when Account ships | partial | [requirements-account.md](requirements-account.md), [risks-and-deferrals.md](risks-and-deferrals.md) |
| Brand & naming | Generic SEO until brand exists | done | [seo-plan.md](seo-plan.md) |
| Reversibility | What is expensive to change later | done | [risks-and-deferrals.md](risks-and-deferrals.md), [ADR-008](adr/008-analysis-and-reversibility.md) |
| Module map | Where code lives | done | [modules.md](modules.md) |
| Glossary | Shared language | done | [glossary.md](glossary.md) |

---

## Gate use

| Gate | This checklist should show |
|------|----------------------------|
| **G0 Analysis** | product-overview, requirements, risks-and-deferrals drafted; privacy row has a phase C note |
| **G1 Architecture** | domain-model + architecture target/current — **ready for review** |
| **G2 Phase B design** | SEO row → done when ADR-007 Accepted; Phase B FR doc current |
| **G4 Phase C design** | Auth row partial with locked provider; Account FR + privacy filled; no G5 code yet |

Full gate definitions: [roadmap.md](roadmap.md).
