# SEO plan and keyword analysis

Discoverability plan for a product **without brand search demand yet**. Ties to **NFR-12**, [adr/007-seo.md](adr/007-seo.md), [learn-content-map.md](learn-content-map.md), [vision.md](vision.md).

Exact monthly volumes differ by tool (Google Keyword Planner vs Ahrefs vs Semrush). Treat numbers below as **relative priority**, then confirm in Keyword Planner / Trends for your target country before spending on content.

---

## Goals (pre-brand)

| Priority | Goal |
|----------|------|
| 1 | Rank for **how people already search** — “learn electronics”, beginners, tutorials |
| 2 | Capture **tool intent** that matches us — online / free / beginner circuit simulator |
| 3 | Win **long-tail how-tos** we can teach in Lab (LED resistor, 555, MOSFET switch, I2C pull-ups…) |
| 4 | Brand terms — only after the name is public and people search it |

Lab editor (`/lab`) stays low SEO / `noindex`. Learn + home do the ranking work.

---

## What “more searched” looks like (relative)

Public competitor/export snippets and category knowledge suggest this **demand ladder** (US-oriented, directional — not a substitute for Planner):

| Relative demand | Example queries | Notes |
|-----------------|-----------------|--------|
| **Highest (head)** | `learn electronics`, `electronics for beginners`, `how to learn electronics`, `basic electronics` | Huge intent; hard SERPs (YouTube, All About Circuits, Khan, blogs). Still the **north-star topics** for hub pages |
| **Very high** | `circuit simulator`, `online circuit simulator`, `free circuit simulator` | One published competitor SERP sample showed **~5.4k/mo** for `circuit simulator` (tool-dependent). Strong commercial/info mix |
| **High** | `circuit design` (~3.6k in same sample), `learn electronics for beginners`, `arduino for beginners` | Broad; compete with giants |
| **Medium–high (tutorial head)** | `555 timer`, `555 timer tutorial`, `led resistor`, `ohms law`, `what is a mosfet`, `i2c protocol` | Evergreen hobbyist/education traffic |
| **Medium (project long-tail)** | `bjt as a switch`, `flyback diode explained`, `ldr night light circuit`, `ssd1306 i2c wiring`, `ne555 blink led` | Lower volume, **much better chance** to rank early |
| **Low until brand exists** | `electro lab`, product name | Don’t build the strategy around this yet |

**Takeaway:** Lead copy and IA with **learn electronics / beginners / simulator for learning**, not the app name. Use long-tails to actually win early rankings; use head terms for hub H1/title themes and internal linking.

```text
Head demand (hard)          → Learn hub, module hubs, home promise
     ↓
Tool demand (competitive)   → “online circuit simulator for beginners” positioning
     ↓
Tutorial long-tails (winnable early) → unit pages with Lab CTA
     ↓
Brand (later)               → after launch awareness
```

---

## Priority keyword sets (use these first)

### Tier 1 — Head learning intent (hub pages)

Target: `/`, `/learn`, module landings. Expect tough competition; still own the phrasing.

| Keyword | Why it matters | Page |
|---------|----------------|------|
| learn electronics | Core demand | `/learn`, home |
| learn electronics for beginners | Softer head | `/learn`, getting-started module |
| how to learn electronics | Guide intent | `/learn` + path article |
| basic electronics | Broad beginner | getting-started hub |
| electronics tutorial | Category | `/learn` |
| electronics for beginners | Same cluster | `/learn` |

### Tier 2 — Simulator / learn-by-doing (home + Learn)

Matches product better than “SPICE” or “PCB”.

| Keyword | Why | Page |
|---------|-----|------|
| online circuit simulator | High tool demand | Home (honest: *teaching* simulator) |
| circuit simulator for beginners | Fit | Home / Learn |
| free online circuit simulator | Commercial | Home — only if free forever is true |
| learn electronics online | Learning + web | Learn hub |
| interactive electronics lessons | Soft | Learn hub |

Avoid as primary: `spice online`, `pcb design software`, `altium` — wrong product.

### Tier 3 — Winnable teaching long-tails (unit pages first)

Build these pages early; they feed authority up to Tier 1 hubs.

| Keyword cluster | Example phrases | Unit / module |
|-----------------|-----------------|---------------|
| LED + resistor | led series resistor, why led needs resistor, simple led circuit | `led-series` |
| Ohm / basics | ohms law example, voltage current resistance explained | getting-started |
| RC | rc circuit explained, capacitor charging graph | `rc-charge` |
| 555 | 555 timer tutorial, 555 astable led, ne555 blink circuit | `ne555-astable` |
| BJT / MOSFET switch | bjt as a switch, mosfet as switch, nmos led switch | `bjt-switch`, `nmos-switch` |
| Flyback / motor | flyback diode explained, mosfet motor diode | `relay-flyback`, `motor-lowside` |
| LDR | ldr night light circuit, photoresistor circuit | `ldr-nightlight` |
| I2C wiring | i2c pullup resistors, ssd1306 i2c wiring, i2c for beginners | `i2c-oled-wiring` |
| Arduino pin | arduino digitalWrite explained, arduino led pin | `arduino-dio-led` |

### Tier 4 — Brand (later)

| Keyword | When |
|---------|------|
| product name / electro lab | After public name + links exist |
| {name} tutorial | Only once branded searches appear in Search Console |

---

## Page plan (demand → URL)

| URL | Primary SEO job | Keywords to lead with |
|-----|-----------------|------------------------|
| `/` | Promise: learn electronics by building circuits online | learn electronics, online circuit simulator for beginners |
| `/learn` | Beginner learning hub | learn electronics for beginners, electronics tutorial |
| `/learn/{module}` | Theme hub (e.g. switching, timing) | Module head + 1–2 Tier 3 phrases |
| `/learn/{module}/{unit}` | Rank for one long-tail cluster | Tier 3 primary; mention Tier 1 in intro |
| `/lab` | Tool | **noindex** |

Titles should read like search queries people type, e.g.  
“Learn electronics for beginners — interactive circuits”  
not  
“Electro Lab — home”.

---

## Content order (SEO + curriculum)

1. **Learn hub** aimed at “learn electronics for beginners”  
2. **Getting-started units** (LED, RC) — high beginner demand even if Learn didn’t list them before  
3. **Strong long-tails we already teach well** (555, BJT/NMOS, flyback, I2C pull-ups)  
4. Home page that pairs “learn electronics” with “online teaching circuit simulator”  
5. Brand polish last  

---

## How we’ll validate volumes (do this next)

We don’t have live Keyword Planner access in-repo. Before locking titles for production:

1. Google Keyword Planner (or free Keywords Everywhere / similar) for **your country** — paste Tier 1–3 list  
2. Google Trends: compare `learn electronics` vs `circuit simulator` vs `555 timer` vs `ssd1306`  
3. After launch: Search Console — real queries beat any estimate  

Record confirmed volumes in a small table here (date, country, source, volume).

### Volume log (fill when measured)

| Keyword | Country | Source | Monthly volume | Date |
|---------|---------|--------|----------------|------|
| learn electronics | | | | |
| learn electronics for beginners | | | | |
| circuit simulator | | | ~5.4k in one public competitor SERP sample — **verify** | |
| online circuit simulator | | | | |
| 555 timer tutorial | | | | |
| led series resistor | | | | |
| i2c pullup resistors | | | | |

---

## SEO in the AI era

Search is not only “ten blue links.” Google AI Overviews, ChatGPT, Perplexity, and social previews also surface answers. Strategy:

> **Classic SEO gets us found; AI-era SEO gets us cited and clicked when someone wants to actually try the circuit.**

### Principles

| Principle | For Electro Lab |
|-----------|-----------------|
| **Intent over keywords** | Page answers one real question with teaching depth; keywords support the title |
| **Win on doing, not defining** | AI summarizes Ohm’s law; we win on *build this*, *wire it*, *common mistake* — matches Lab CTAs |
| **Quotable structure** | TL;DR, numbered steps, pitfalls, one takeaway — easy for crawlers and AI to extract |
| **Trust (E-E-A-T)** | Real circuits, honest simplifications, human-reviewed copy — not mass-generated filler |
| **No manipulation** | Schema and headings are fine; keyword stuffing, doorway pages, fake FAQs are not |
| **Measure beyond rank** | Search Console queries, AI referral traffic where visible, “Open in Lab” CTR |

### Standard unit page shape

Aligns with [learn-content-map.md](learn-content-map.md):

1. **Title / H1** — Tier 3 long-tail phrase  
2. **TL;DR** — 2–3 sentences, direct answer  
3. **What you’ll build** — outcome + Lab preset  
4. **Concepts** — short H2 definitions  
5. **Steps** — ordered list (future `HowTo` schema)  
6. **Common mistakes** — high citability  
7. **Try it** — primary CTA: Open in Lab  
8. **Related units** — internal links to module hub + prerequisites  

### Post-launch metrics

| Metric | Tool |
|--------|------|
| Queries and impressions | Google Search Console |
| Long-tail wins | Search Console + rank checks on Tier 3 |
| AI referrals | Analytics referrers (where available) |
| Teaching engagement | Open in Lab clicks per unit |

---

## Technical SEO

Unchanged intent from ADR-007, plus AI-era signals:

| Item | Plan |
|------|------|
| **Rendering** | Prerender/SSR for Learn + home — crawlers and preview bots see real text |
| **Crawl** | Sitemap for Learn URLs; `lastmod` when content changes |
| **Lab / Account** | `noindex` |
| **Semantic HTML** | One H1, logical H2/H3, `<article>`, related `<nav>` |
| **JSON-LD** | `LearningResource` + `HowTo` on units; `CollectionPage` on hub — `learn-structured-data.ts` |
| **Canonical** | `link rel=canonical` per hub/unit |
| **Open Graph / Twitter** | `og:title`, `og:description`, `og:url`, `og:type` on Learn pages |
| **Sitemap / robots** | `public/sitemap.xml`, `public/robots.txt` — regenerate via `npm run prebuild`; set `SITE_ORIGIN=https://your.domain` for production |
| **AI crawlers** | Allow public Learn by default; review at launch; no need to block GPTBot unless abuse appears |

---

## Anti-patterns

- Leading every title with an unknown brand name  
- Chasing only `circuit simulator` with no beginner/learn framing (wrong crowd + pros expecting SPICE)  
- Thin pages for head terms with no real teaching  
- Ignoring long-tails because volume “looks small” — that’s where a new site wins  
- Pages that repeat keywords with no teaching value  
- Auto-generated units at scale without Lab tie-in or human review  
- Fake FAQ blocks for rich results only  
- Competing with Wikipedia on pure definitions instead of project/how-to intent  
- Hiding that the simulator is teaching-grade (trust loss)

---

## Ownership

| Artefact | Habit |
|----------|--------|
| This plan | Re-rank tiers when Planner/Trends data is pasted into the volume log |
| Titles / H1s | Match Tier 1–3 language; brand secondary |
| Catalog units | Map each mvp/soon unit to one Tier 3 primary phrase |
