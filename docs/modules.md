# Platforms and modules

A map of what runs where, and what each area is responsible for. **Target product:** [product-overview.md](product-overview.md). **Entities:** [domain-model.md](domain-model.md).

Words: [glossary.md](glossary.md). How they connect: [architecture.md](architecture.md).

---

## Platforms (things you deploy or run)

Style: **modular multi-process**, not a microservice mesh — [adr/006-deployment-style.md](adr/006-deployment-style.md).

| Platform | Path | Main job |
|----------|------|----------|
| **Web** | `apps/web` | Browser UI: shell, Lab, Learn, Account stub |
| **CircuitEngine** | `services/circuit-engine` | HTTP in front of the solver (`/api/circuit`) |
| **LearningApi** | `services/learning-api` | HTTP for learning-side data (`/api/learning`) — i18n today |
| **Postgres** | Compose `db` | Durable data (translations now; more later) |
| **Proxy** | `deploy/proxy` | Single entry in Compose: static web + API routes |
| **CircuitSim** | `src/ElectroLab.CircuitSim` | Library only — not a service; loaded by CircuitEngine |

Locally you usually run: Postgres (optional if you only care about EN fallback), CircuitEngine, LearningApi, Angular.

---

## Web app — top-level surfaces

| Module | Route / area | Main functions |
|--------|----------------|----------------|
| **Shell** | app chrome | Nav (Lab / Learn / Account), layout, bootstrapping |
| **Lab** | `/lab` | Draw circuits, run sim, inspect, examples, local tabs |
| **Learn** | `/learn` | Guided projects — short, game-like sessions (see vision / NFR-11) |
| **Account** | `/account` | Placeholder for sign-in / profile (Phase C) |
| **Core** | `app/core` | Cross-cutting web utilities (e.g. i18n client) |
| **Shared** | `app/shared` | Only truly shared UI/helpers (keep thin) |

Rule of thumb: feature code stays under `features/lab` or `features/learn`. Don’t dump Learn into Lab folders or the other way around.

---

## Lab — internal groups

All under `apps/web/src/app/features/lab/`.

| Group | Path idea | Main functions |
|-------|-----------|----------------|
| **Pages** | `pages/lab-page` | Wires the Lab screen: toolbar, canvas, inspector, results, tabs |
| **Palette / canvas / inspector** | `components/*` | Place parts, draw wires, edit params, show glyphs |
| **Toolbar / scope / results** | `components/*` | Analysis mode, Run, examples, plots, status |
| **Circuit tabs** | `components/circuit-tabs` | Named local circuits, pin/close |
| **Editor store** | `services/lab-editor.store` | Schematic state, undo, presets, tab persistence hooks |
| **Sim facade** | `services/circuit-simulation.facade` | Calls CircuitEngine, maps results, burnout / flow side effects |
| **Persistence** | `services/schematic-persistence` | `localStorage` library of slots |
| **Data / domain** | `data/*` | Symbol library, presets, netlist compile, diagnostics, wire-flow maths |
| **API client** | `api` (if present) | HTTP types/calls toward CircuitEngine |

Lab v1 is **feature-frozen** for new simulator capabilities — see [adr/001-lab-v1-freeze.md](adr/001-lab-v1-freeze.md).

---

## Learn — internal groups

Under `apps/web/src/app/features/learn/` (growing in Phase B).

| Group | Main functions |
|-------|----------------|
| **Pages** | Learn landing / project view |
| **Data (catalog)** | Project list, example ids, step keys (ADR-002) |
| **Services** (as needed) | Load catalog, optional local progress (ADR-004) |
| **Components** (as needed) | Project cards, step lists, CTAs |

Learn does **not** own the solver or schematic editor. It deep-links into Lab.

---

## CircuitSim — library groups

Under `src/ElectroLab.CircuitSim/`.

| Group | Main functions |
|-------|----------------|
| **Models** | Device teaching models (R, LED, BJT, NE555, Arduino I2C, SSD1306, …) |
| **Netlist** | Circuit / element shapes the engine stamps |
| **MNA** | Matrix stamping helpers |
| **Analysis** | DC operating point, transient, AC |
| **Tests** | `ElectroLab.CircuitSim.Tests` — physics regressions |

No HTTP, no UI, no Learn/auth concepts here.

---

## CircuitEngine — service groups

Under `services/circuit-engine/`.

| Group | Main functions |
|-------|----------------|
| **HTTP API** | Health, `POST .../simulate` |
| **Mapping** | JSON DTO → CircuitSim netlist |
| **Hosting** | Config, CORS, logging (Serilog — ADR-005) |

Does not invent device maths — that’s CircuitSim.

---

## LearningApi — service groups

Under `services/learning-api/`.

| Group | Main functions |
|-------|----------------|
| **i18n API** | Serve translation dictionaries by locale |
| **Seed** | Upsert English catalog on startup |
| **Data access** | EF + Postgres |
| **Future** | Catalog / progress / auth when ADRs say so |

---

## Shared “functions” across the product

| Concern | Where it lives |
|---------|----------------|
| **Simulate a circuit** | Lab UI → CircuitEngine → CircuitSim |
| **Teach a project** | Learn catalog + copy → deep-link → Lab preset |
| **UI language** | LearningApi + web EN fallback |
| **Save work in the browser** | Lab slots / `localStorage` |
| **Ops logs** | CircuitEngine + LearningApi (Serilog) |
| **Identity** | Nowhere yet (Account phase) |

---

## Quick “where do I change X?”

| You want to… | Start here |
|--------------|------------|
| Change a Lab part symbol or params UI | `features/lab/data/symbol-library`, glyphs, inspector |
| Change solver behaviour for a part | `CircuitSim/Models`, then restart CircuitEngine |
| Add/adjust a Lab example | `features/lab/data/presets`, store + toolbar + `?example=` |
| Change Learn project text/steps | i18n keys + Learn catalog module (Phase B) |
| Change simulate JSON contract | `docs/netlist-schema.md` + engine mapping (+ ADR if breaking) |
| Change logging | ADR-005 + both API `Program.cs` / Serilog config |
