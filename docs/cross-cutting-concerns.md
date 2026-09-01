# Cross-cutting concerns

Big approximate overview of things to **decide early** (like logging and SEO) so we don’t retrofit them later. Full detail stays in linked docs; this is the “don’t forget” index.

Product context: [product-overview.md](product-overview.md). NFRs: [requirements.md](requirements.md). Gates: [roadmap.md](roadmap.md).

---

## Summary table

| Concern | Decide principle now | Phase B (first build) | Later | Primary doc |
|---------|----------------------|------------------------|-------|-------------|
| **Logging** | Serilog + `ILogger`, console always, OTLP by config | Debug failed requests locally | Turn on collector in prod | [ADR-005](adr/005-logging.md), NFR-7 |
| **SEO & discovery** | URL/IA, unit page shape, prerender/SSR | Titles, headings, first crawlable units | Volume log, `llms.txt` | [seo-plan.md](seo-plan.md), [ADR-007](adr/007-seo.md), NFR-12 |
| **Scale shape** | Stateless APIs; simulate separate from learning | No sticky sessions | Replicas, load test | NFR-9/10, [ADR-006](adr/006-deployment-style.md) |
| **i18n** | Key namespaces (`learn.*`, `lab.*`) | EN keys in web + seeder | More locales, hreflang | FR-CAT-13, [glossary.md](glossary.md) |
| **API contracts** | Netlist/simulate versioning | Don’t break presets | Catalog API when ADR says | [netlist-schema.md](netlist-schema.md) |
| **Analytics** | What to measure; event naming; no PII in anonymous phase | Minimal events (e.g. open unit, open Lab) | Vendor, dashboards, consent UI | This doc § Analytics |
| **Accessibility** | WCAG 2.1 AA target for Learn; keyboard on main flows | Semantic HTML, focus, headings | Full audit; Lab canvas a11y depth | This doc § Accessibility, NFR-4 |
| **Privacy** | Data inventory per phase; anonymous default | Privacy policy stub before real traffic | GDPR, minors, DPA at Account | [risks-and-deferrals.md](risks-and-deferrals.md) |
| **Security** | Validate simulate; no user HTML in Learn; HTTPS | Security headers plan | Rate limits on public simulate | This doc § Security, [quality.md](quality.md) |
| **Errors** | User-visible failures; correlation id for support | Banners/toasts on API errors | Sentry, status page | This doc § Errors, NFR-2/8 |
| **Performance** | Rough budgets (Learn LCP, simulate p95) | Measure on first public units | CDN, bundle tuning | This doc § Performance |
| **CI / quality** | Tests + build before merge | Wire GitHub Actions if ready | E2E deep-link path | [quality.md](quality.md), NFR-5 |
| **UX consistency** | One primary CTA; unit page template | Reuse shared components | Design system | [seo-plan.md](seo-plan.md), NFR-11 |
| **Bounded contexts** | Lab / Learn / CircuitSim / Identity separate | No solver in Learn | Account ADRs | [domain-model.md](domain-model.md) |

---

## Tier 1 — principles (decide now, implement in phases)

### Logging
- **Now:** One backbone (Serilog), structured logs, no secrets/PII, health endpoints.
- **Not now:** Picking a log vendor or running a collector locally.

### SEO & AI-era discovery
- **Now:** Generic keywords, stable URLs, quotable unit pages (TL;DR, steps, pitfalls), Lab `noindex`.
- **Not now:** Chasing brand terms; fake FAQ blocks; mass auto-generated pages.

### Analytics & product metrics
- **Now:** Measure learning funnel, not vanity hits only. Suggested anonymous events:
  - `learn_unit_view` — `unit_slug`
  - `learn_open_lab` — `unit_slug`, `example_id`
  - `lab_simulate_error` — `error_code` (no netlist payload)
- Naming: `snake_case`, stable ids from [learn-content-map.md](learn-content-map.md).
- **No PII** until Account; no netlist or personal data in events.
- **Not now:** Full analytics vendor; cookie banner until non-essential cookies exist.

### Accessibility
- **Now:** Target **WCAG 2.1 AA** for Learn (public, text-heavy). Lab: keyboard for toolbar, tabs, Run; canvas is best-effort with teaching labels.
- Headings match SEO (one H1, logical H2).
- **Not now:** Certified audit; every canvas glyph described.

### Privacy & consent
- **Now:** Document what each phase stores (see [domain-model.md](domain-model.md)). Phase B: mostly anonymous; `localStorage` for tabs/progress optional.
- Before meaningful public traffic: short **Privacy Policy** (even stub) on marketing/Learn.
- **Not now:** Full GDPR legal review until Account or EU analytics with cookies.

### Security baseline
- **Now:** CircuitEngine validates payloads; Learn renders **i18n text only** (no user HTML); HTTPS in prod; plan CSP/security headers when Learn goes public.
- **Not now:** Auth hardening, WAF, pen test.
- **Public deploy:** rate-limit `/api/circuit/simulate` per IP (note in [risks-and-deferrals.md](risks-and-deferrals.md)).

### Errors & support
- **Now:** Users see clear failure (NFR-2, NFR-8). APIs return consistent error shape; logs include **correlation/request id**; optional display in UI (“Reference: …”) for support.
- **Not now:** Sentry, public status page.

### Performance
- **Now:** Rough budgets — e.g. Learn **LCP &lt; 2.5s** on mid mobile after SSR; simulate **p95 &lt; few seconds** for teaching circuits on default deploy.
- Measure before caching layers or CDN complexity.
- **Not now:** Aggressive bundle splitting projects.

### CI & quality gates
- **Now:** `dotnet test`, `ng build`, preset/catalog tests before merge ([quality.md](quality.md)).
- **Not now:** Large e2e suite.

### UX consistency (anti–vibe-coded)
- **Now:** [seo-plan.md](seo-plan.md) unit template; game-like Learn tone ([vision.md](vision.md), NFR-11); one primary button per screen.
- Reuse shared layout, typography, and CTA components across units.
- **Not now:** Full design system or Figma library.

---

## Tier 2 — note now, build when phase needs it

| Concern | When | Stance |
|---------|------|--------|
| Auth | Phase C | Anonymous Learn stays valid ([ADR-003](adr/003-auth-deferred.md)) |
| Tracing / metrics | Public deploy | Logging OTLP-ready; metrics follow same pipeline |
| Rate limiting | Public simulate | Per-IP limits; clear 429 |
| Backup / DR | User data in Postgres | Translations-only = lower urgency |
| Legal (Terms) | Public launch | Pair with Privacy Policy |
| Feature flags | Many experiments | Env config until needed |
| Email | Account | Defer |

---

## How this fits agile delivery

1. **Analysis pack** = guardrails (this file + requirements + ADRs).
2. **Each vertical slice** implements only the cross-cutting rows that slice touches.
3. **Example — first Learn unit slice:** SEO titles, unit template, i18n keys, error banner, optional `learn_unit_view` / `learn_open_lab` events — not full analytics vendor or pen test.

---

## Checklist hook

When updating [analysis-checklist.md](analysis-checklist.md), treat rows for analytics, a11y depth, privacy legal, and security as **partial** until Phase B first public unit ships; principles in this doc count as “decided” for G0/G1.
