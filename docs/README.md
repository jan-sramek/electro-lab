# Docs

Engineering documentation for Electro Lab — **analysis-first**, then architecture, then phase builds.

Start here: [product-overview.md](product-overview.md) (final product in brief).

## Tier 1 — Product analysis (read first)

| Doc | What’s in it |
|-----|----------------|
| [product-overview.md](product-overview.md) | Final product: users, surfaces, boundaries, phases |
| [analysis-checklist.md](analysis-checklist.md) | Completeness matrix — don’t skip a domain |
| [roadmap.md](roadmap.md) | Phases and review gates (G0–G5) |
| [requirements.md](requirements.md) | FR categories, product-wide NFRs, phased capability map |
| [learn-ia.md](learn-ia.md) | Learn URL/slug contract (Phase B) |
| [cross-cutting-concerns.md](cross-cutting-concerns.md) | Don’t-forget index: logging, SEO, analytics, a11y, privacy, security, … |
| [risks-and-deferrals.md](risks-and-deferrals.md) | Lock early vs defer; risk register |

## Tier 2 — Design references

| Doc | What’s in it |
|-----|----------------|
| [vision.md](vision.md) | Principles and how we decide |
| [glossary.md](glossary.md) | Shared words |
| [domain-model.md](domain-model.md) | Bounded contexts and entities (target) |
| [modules.md](modules.md) | Platforms and app modules |
| [architecture.md](architecture.md) | Today + target: services, data, failure modes |
| [learn-content-map.md](learn-content-map.md) | Target curriculum (pedagogy-first) |
| [seo-plan.md](seo-plan.md) | Keywords, page plan, classic + AI-era SEO |
| [quality.md](quality.md) | Tests, done-ness, gates, logging |

## Tier 3 — Phase deliverables

| Doc | What’s in it |
|-----|----------------|
| [requirements-learn-mvp.md](requirements-learn-mvp.md) | **Phase B only** — Learn catalog FRs + acceptance |

## Decisions (ADRs)

| ADR | In one line |
|-----|-------------|
| [001](adr/001-lab-v1-freeze.md) | Lab simulator stays frozen |
| [002](adr/002-learn-content-source.md) | Learn catalog in TS module for Phase B (migration path documented) |
| [003](adr/003-auth-deferred.md) | No login yet |
| [004](adr/004-progress-storage.md) | Progress local-only for now |
| [005](adr/005-logging.md) | Serilog for APIs (console now, OTLP when deployed) |
| [006](adr/006-deployment-style.md) | Few purposeful processes — not microservices everywhere |
| [007](adr/007-seo.md) | SEO-first Learn/public pages (Proposed) |
| [008](adr/008-analysis-and-reversibility.md) | Analysis gates; expensive-to-change register |

## Lab contracts (don’t break lightly)

| Doc | What’s in it |
|-----|----------------|
| [product-architecture.md](product-architecture.md) | Surfaces and deployables |
| [circuit-engine.md](circuit-engine.md) | Engine HTTP role |
| [netlist-schema.md](netlist-schema.md) | Simulate JSON |

## Habit

1. Skim **product-overview** + relevant ADR before coding  
2. Check **roadmap** gate for your phase  
3. Implement against phase requirements; product NFRs from **requirements.md**  
4. Update docs when contracts or decisions change  
5. Don’t add Lab devices unless ADR-001 allows it
