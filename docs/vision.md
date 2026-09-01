# Electro Lab — Vision

How we decide what to build. **What the product becomes** in brief: [product-overview.md](product-overview.md).

Electro Lab helps people learn electronics by **building and running small circuits in the browser**, with short guided projects next to a real editor.

It is not trying to replace SPICE, KiCad, or a full MCU emulator. The Lab models are teaching models: honest about what they simplify, clear enough to learn from.

## Who it’s for

- Someone new who wants to try an LED, a transistor switch, or an I2C wiring sketch without buying parts first
- A student following a structured path and jumping into the matching Lab example
- Later: a teacher who can point people at a stable unit URL + Lab preset

## How we decide what to build

- Prefer **clear teaching** over perfect physics
- Ship **complete slices** people can use end to end — avoid empty shells “for later”
- **Lab** is the workbench; **Learn** is the guide. Learn should not grow solver code; Lab should not become a CMS
- Feel **a bit game-like** (Duolingo energy, not a textbook PDF): short sessions, obvious next step, friendly feedback, visible progress when we have it. Lab stays a serious workbench; Learn carries most of the lightness
- Treat **SEO and discoverability** as first-class for public and Learn pages (titles, structure, crawlable content, shareable URLs, **AI-era** quotable lessons). Don’t bolt meta tags on after the SPA is finished. Lab canvas stays out of search; courses and landing should not
- **Analysis before big builds** — brief final-product overview, gates, and reversibility ([roadmap.md](roadmap.md), [ADR-008](adr/008-analysis-and-reversibility.md))
- If a service is down, fail obviously (or fall back to English strings). No silent breakage
- Add structure when a phase needs it — not frameworks we might need someday

## Phases (summary)

Full gates: [roadmap.md](roadmap.md). Capability map: [requirements.md](requirements.md).

| Phase | Status | What it means |
|-------|--------|----------------|
| **A — Lab v1** | Done | Editor, simulator, parts, examples, local tabs |
| **B — Learn foundation** | Next | Catalog, unit pages, Lab deep-links, SEO-ready public Learn |
| **C — Account** | Later | Sign-in, cloud progress |
| **D — Polish** | Later | More languages, deeper a11y, ops |

## Lab v1 is frozen

The circuit Lab is a finished first version. We are **not** adding new device families, protocol bit-banging, or SPICE-level models unless we deliberately reopen that with an ADR.

Still fine without drama: bug fixes, a11y, i18n, shared chrome Learn needs, doc clarifications.

See [adr/001-lab-v1-freeze.md](adr/001-lab-v1-freeze.md).

## Things we are not building

- Full SPICE / datasheet transistor models
- Real I2C/SPI/UART bit streams
- Full MCU / firmware simulation
- Collaborative editing
- Native mobile apps
- A CMS before content volume justifies it

## What “Phase B done” looks like

You can open Learn, pick a project, follow the steps, and land in Lab on the right example — without creating an account. Public Learn pages are crawlable and structured for search (classic + AI-era). See [requirements-learn-mvp.md](requirements-learn-mvp.md).
