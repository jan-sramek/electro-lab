# Roadmap and gates

**Waterfall-biased planning:** finish analysis and target design for a phase before large implementation. Delivery still uses **vertical slices** inside a phase — but no slice starts until its design gate passes.

Product picture: [product-overview.md](product-overview.md). Capabilities: [requirements.md](requirements.md).

---

## Phases (what ships)

| Phase | Name | Outcome |
|-------|------|---------|
| **A** | Lab v1 | Editor, simulator, presets, tabs | **Done** |
| **B** | Learn foundation | Catalog, unit pages, Lab deep-links, SEO-ready public Learn |
| **C** | Account | Sign-in, cloud progress, teacher-friendly sharing |
| **D** | Polish | More locales, deeper a11y, production ops hardening |

Phase B FRs: [requirements-learn-mvp.md](requirements-learn-mvp.md) only.

---

## Gates (when to proceed)

| Gate | Name | Entry | Exit criteria |
|------|------|-------|----------------|
| **G0** | Analysis | Lab v1 done | Passed — doc pack reviewed |
| **G1** | Target architecture | G0 passed | Passed |
| **G2** | Phase B design | G1 passed | Passed — [learn-ia.md](learn-ia.md), prerender ([ADR-007](adr/007-seo.md)) |
| **G3** | Phase B build | G2 passed | Passed — catalog, quizzes, lab challenges shipping; Account is Phase C |
| **G4** | Phase C design | B shipped | Auth + progress ADRs updated; Account FR doc |
| **G5** | Phase C build | G4 passed | Account slice |

**Rule:** No substantial Learn catalog implementation until **G2 exit**.

---

## Current position

| Item | Status |
|------|--------|
| Phase A | Complete |
| G0 | Passed |
| G1 | Passed |
| G2 | Passed |
| G3 | Passed (Learn Phase B catalog shipped) |
| Phase B code | Catalog, routes, prerender shipped — **polish wave ongoing** (challenge integrity, UX, diagnostics, CI) |
| G4 | **Next design gate** — Account FR + auth/progress ADRs before build |

Phase B polish does **not** reopen Lab device scope ([ADR-001](adr/001-lab-v1-freeze.md)). Account implementation waits for G4 exit.
---

## After each phase ships

1. Update [analysis-checklist.md](analysis-checklist.md) statuses  
2. Confirm ADRs still match reality  
3. Run gate for next phase before expanding scope  
