# Product requirements

Product-wide **functional categories**, **non-functional** requirements, and a **phased capability map**. Phase-specific numbered FRs live in phase docs (e.g. [requirements-learn-mvp.md](requirements-learn-mvp.md) for Phase B).

Context: [product-overview.md](product-overview.md), [vision.md](vision.md), [roadmap.md](roadmap.md).

---

## Functional requirement categories (product-wide)

Brief index of **what the product must do** at maturity. Detail and acceptance criteria live in phase docs when that phase starts.

| ID | Category | Surface | Scope (one line) | Phase | Detail |
|----|----------|---------|------------------|-------|--------|
| FR-CAT-01 | Schematic editing | Lab | Place parts, wire pins, edit parameters, canvas interaction | A | Shipped |
| FR-CAT-02 | Simulation | Lab | DC, transient, AC; run, scope, probes | A | Shipped |
| FR-CAT-03 | Circuit sessions | Lab | Tabs, pin, presets, local save | A | Shipped |
| FR-CAT-04 | Teaching diagnostics | Lab | Ground faults, burnout teaching, wire-current hints | A | Shipped |
| FR-CAT-05 | Learn navigation | Learn | Path → module → unit; hub pages | B–C | [requirements-learn-mvp.md](requirements-learn-mvp.md) (B) |
| FR-CAT-06 | Learn content | Learn | Titles, summaries, steps, concept notes; i18n | B+ | requirements-learn-mvp (B); [learn-content-map.md](learn-content-map.md) |
| FR-CAT-07 | Lab integration | Learn | Open in Lab; stable `example` ids | B | requirements-learn-mvp |
| FR-CAT-08 | Progress | Learn | Step checkmarks → unit/module completion | B / C | Local (B); server (C) — [ADR-004](adr/004-progress-storage.md) |
| FR-CAT-09 | Quizzes | Learn | Formative checks after a unit or module | C+ | [learn-content-map.md](learn-content-map.md) |
| FR-CAT-10 | Challenges | Learn | Open tasks: change a value, fix a fault, light design tweak | C+ | learn-content-map |
| FR-CAT-11 | Identity | Account | Sign-in, profile, session | C | [ADR-003](adr/003-auth-deferred.md) |
| FR-CAT-12 | Cloud progress | Account | Resume on another device; teacher/share links | C+ | product-overview |
| FR-CAT-13 | Localization | Platform | API translations, English fallback, more locales | A / D | Shipped (EN); hreflang later |
| FR-CAT-14 | Discovery & sharing | Platform | Public URLs, SEO, social/AI previews | B | [seo-plan.md](seo-plan.md), [ADR-007](adr/007-seo.md) |
| FR-CAT-15 | Content operations | Platform | Authoring beyond repo (API / CMS) | B+ | [ADR-002](adr/002-learn-content-source.md) |
| FR-CAT-16 | Marketing / home | Platform | Landing page, product promise, entry into Learn | B | seo-plan |

**Phase B numbered FRs** (FR-L1…L9) in [requirements-learn-mvp.md](requirements-learn-mvp.md) implement **FR-CAT-05, 06, 07** (and optionally **08**).

**Out of scope here** (contracts / NFRs instead): simulate HTTP API, logging, horizontal scale — see NFRs below and [architecture.md](architecture.md).

---

## Non-functional requirements (product-wide)

These apply to the product as a whole, not only the Learn MVP slice.

| ID | Requirement |
|----|-------------|
| NFR-1 | Usable on phone-sized screens as well as desktop (Learn first; Lab usable on both) |
| NFR-2 | Remote catalog/API failures fail softly within a couple of seconds — empty or error state, not a hung page |
| NFR-3 | Collect no personal data until Account phase; anonymous Learn is a supported mode long-term |
| NFR-4 | Main actions reachable by keyboard; sensible heading hierarchy for a11y and SEO |
| NFR-5 | Lab presets and CircuitSim regression tests stay green unless an ADR explicitly changes simulator scope |
| NFR-6 | Update docs and ADRs when catalog shape, deep-link contract, or public URL scheme changes |
| NFR-7 | APIs use the long-term logging backbone ([ADR-005](adr/005-logging.md)): Serilog via `ILogger`, console always, OTLP available by config; startup/request failures visible; no secrets or PII in log lines; health endpoints remain |
| NFR-8 | Browser code does not log secrets; users see failures in the UI, not only in the console |
| NFR-9 | Design for higher visit / simulate load without a rewrite: CircuitEngine and LearningApi **stateless** for core flows; horizontal scale of CircuitEngine when simulate traffic grows; static web and read-mostly LearningApi cheap to replicate |
| NFR-10 | Under overload, prefer **clear failure** (timeouts, 503, banner) over silent corruption; no promise of infinite scale on default Compose |
| NFR-11 | Learn UX feels **light and game-like** (Duolingo-ish): short units, clear CTAs, encouraging copy, visible progress when checkmarks/quizzes exist — without turning Lab into a toy or mandating streaks/XP before Account |
| NFR-12 | **SEO and discoverability from the start** for public and Learn content — [seo-plan.md](seo-plan.md): generic keyword themes, URL/page plan, technical checklist, **AI-era** quotable structure. Meaningful titles/descriptions, semantic headings, crawlable text, clean URLs. Prerender/SSR for Learn and landing ([ADR-007](adr/007-seo.md)). Lab editor may stay `noindex` |

Other cross-cutting topics (analytics, a11y depth, privacy, security baseline, errors, performance, CI): see [cross-cutting-concerns.md](cross-cutting-concerns.md).

---

## Capability map (phased)

High-level **what the product gains**, not implementation tasks.

| Capability | Phase | Notes | Detail |
|------------|-------|-------|--------|
| Schematic editor + teaching simulator | A | Lab v1 | Shipped; [ADR-001](adr/001-lab-v1-freeze.md) |
| Example presets + local circuit tabs | A | Lab v1 | Shipped |
| i18n backbone (EN + API) | A | | Shipped |
| Learn project catalog + unit pages | B | First Learn slice | [requirements-learn-mvp.md](requirements-learn-mvp.md) |
| Lab deep-link from every catalog unit | B | `?example=` contract | requirements-learn-mvp |
| SEO-ready public Learn URLs | B | SSR/prerender spike → ADR-007 accepted | [seo-plan.md](seo-plan.md) |
| Optional local step checkmarks | B | Should | ADR-004 |
| Concept notes before Run | B+ | Short explainers per unit | [learn-content-map.md](learn-content-map.md) |
| Server-hosted catalog API | B+ | Only if repo catalog hurts | New ADR |
| Formative quizzes | C+ | After catalog stable | learn-content-map |
| Challenges (tweak value, fix fault) | C+ | | learn-content-map |
| Account / sign-in | C | | [ADR-003](adr/003-auth-deferred.md) |
| Server-side progress | C | Replaces local-only default | [ADR-004](adr/004-progress-storage.md) |
| Teacher / shareable class links | C+ | | product-overview |
| Additional locales | D | hreflang when >1 locale | ADR-007 |
| Production observability (OTLP on) | D | Config only until then | ADR-005 |

---

## Journeys (product-level)

**Learn → Lab (anonymous)** — Browse path, open unit, read steps, Open in Lab, simulate. Primary journey for Phase B.

**Learn when APIs down** — English fallback for strings; client catalog if content is in repo; CircuitEngine down → Learn still readable, Lab shows error on Run.

**Account (future)** — Sign in, resume progress, optional teacher-assigned unit links.

---

## Traceability habit

| Layer | Where |
|-------|--------|
| FR categories | This file (table above) |
| Phase FRs | Phase requirement docs |
| NFRs | This file |
| Decisions | [adr/](adr/) |
| Curriculum | [learn-content-map.md](learn-content-map.md) |
| Contracts | [netlist-schema.md](netlist-schema.md), [circuit-engine.md](circuit-engine.md) |
