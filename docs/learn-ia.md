# Learn information architecture (Phase B)

Locked URL and slug contract for Phase B. Curriculum source: [learn-content-map.md](learn-content-map.md). FRs: [requirements-learn-mvp.md](requirements-learn-mvp.md).

---

## Routes

| Route | Purpose |
|-------|---------|
| `/learn` | Hub — projects grouped by module |
| `/learn/{moduleSlug}/{unitSlug}` | Unit detail (steps, Open in Lab) |
| `/lab?example={exampleId}&from={moduleSlug}/{unitSlug}` | Lab preset + Learn back-link |

Unknown module/unit → redirect to `/learn`.

---

## Slug rules

- **moduleSlug** and **unitSlug** — lowercase kebab-case, stable after publish
- **exampleId** — matches `ExamplePresetId` in Lab (`bjt`, `i2cOled`, …)
- **i18nKeyPrefix** — `learn.project.{legacyId}` until keys are renamed

---

## Modules (Phase B)

| moduleSlug | i18n key | Units in MVP |
|------------|----------|--------------|
| `basics` | `learn.module.basics.title` | led-series, rc-charge, led-fade |
| `switching` | `learn.module.switching.title` | bjt-switch, relay-flyback, nmos-switch, motor-lowside |
| `timing` | `learn.module.timing.title` | ne555-astable |
| `input` | `learn.module.input.title` | pushbutton-led, ldr-nightlight |
| `actuators` | `learn.module.actuators.title` | buzzer-button |
| `mcu` | `learn.module.mcu.title` | arduino-dio-led |
| `buses` | `learn.module.buses.title` | i2c-oled-wiring |

---

## Unit catalog (MVP)

| unitSlug | moduleSlug | exampleId | i18n prefix |
|----------|------------|-----------|-------------|
| `led-series` | `basics` | `led` | `learn.project.led` |
| `rc-charge` | `basics` | `rc` | `learn.project.rc` |
| `led-fade` | `basics` | `ledFade` | `learn.project.ledFade` |
| `bjt-switch` | `switching` | `bjt` | `learn.project.bc547` |
| `relay-flyback` | `switching` | `relay` | `learn.project.relay` |
| `nmos-switch` | `switching` | `nmos` | `learn.project.nmos` |
| `motor-lowside` | `switching` | `motor` | `learn.project.motor` |
| `ne555-astable` | `timing` | `ne555` | `learn.project.ne555` |
| `pushbutton-led` | `input` | `pushbutton` | `learn.project.pushbutton` |
| `ldr-nightlight` | `input` | `ldr` | `learn.project.ldr` |
| `buzzer-button` | `actuators` | `buzzer` | `learn.project.buzzer` |
| `arduino-dio-led` | `mcu` | `arduino` | `learn.project.arduino` |
| `i2c-oled-wiring` | `buses` | `i2cOled` | `learn.project.i2cOled` |

Code source of truth: `apps/web/src/app/features/learn/data/learn-catalog.ts`.

**Prerender:** keep `apps/web/prerender-routes.txt` in sync with `learnPrerenderPaths()` when adding units.

**Production build:** set your real domain before `npm run build`:

```bash
SITE_ORIGIN=https://your.domain npm run build
```

This updates `sitemap.xml`, `robots.txt`, and `BUILD_SITE_ORIGIN` for JSON-LD/canonical URLs.

---

## Pilot unit pattern

Reference implementation: **`i2c-oled-wiring`** (`/learn/buses/i2c-oled-wiring`)

- Module grouping on hub
- Optional step checkmarks (`localStorage`, key `learn.progress.{moduleSlug}/{unitSlug}`)
- Analytics stub: `learn_unit_view`, `learn_open_lab` events (console in dev)

---

## SEO / prerender

- Hub and all unit paths prerendered at build (see [ADR-007](adr/007-seo.md))
- Document title: `{unit title} — Learn`
- Meta description: unit summary i18n string
- `/lab` — `noindex`
