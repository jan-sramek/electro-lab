# Glossary

Words we try to use the same way in docs, UI, and code.

| Term | Meaning |
|------|---------|
| **Lab** | `/lab` — draw wires, run simulation |
| **Learn** | `/learn` — guided projects and checklists |
| **Account** | `/account` — sign-in / profile (not built yet) |
| **CircuitSim** | The .NET solver library (no HTTP) |
| **CircuitEngine** | Thin HTTP API in front of CircuitSim |
| **LearningApi** | HTTP API for translations (and later Learn data) |
| **Netlist** | What the solver eats: ground + parts + params |
| **Schematic** | What you edit in Lab; we compile it to a netlist |
| **Preset / example** | Built-in circuit opened from the toolbar or `?example=` |
| **Slot / circuit tab** | A named circuit saved in the browser |
| **Pinned tab** | Tab you can’t close until you unpin it |
| **Model key** | Engine part id, e.g. `ssd1306` |
| **Symbol / part** | Something in the Lab palette |
| **Teaching model** | Simplified behaviour + a short “what this is not” note |
| **Project** | One Learn unit: title, blurb, steps, link into Lab |
| **Step** | One checklist line inside a project |
| **Progress** | “I’ve done this step/project” |
| **Locale** | Language code (`en` first) |
| **i18n key** | Stable string id, e.g. `learn.project.i2cOled.title` |
| **ADR** | A short decision write-up under `docs/adr/` |
| **Lab v1 freeze** | Don’t grow the simulator unless we agree in an ADR |

## Who owns what

| Area | Owns | Leaves alone |
|------|------|----------------|
| **Lab** | Schematics, sim UI, presets, local tabs | Lessons, quizzes, logins |
| **CircuitSim** | Maths / analyses | HTTP, UI, lesson text |
| **Learn** | Projects and learner flow | The solver |
| **Identity** (later) | Users and auth | Circuit maths |
| **Catalog** | Published project list | Local editor state |
| **Progress** | Completion / attempts | Solving netlists |
