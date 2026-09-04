# ADR-004: Learn progress storage (amended)

- **Status:** Accepted (amended 2026-09-04)  
- **Date:** 2026-08-31  
- **Amended:** 2026-09-04 — anonymous **server** session progress shipped; Account cloud progress is Phase C

## Context

Original MVP assumed checkmarks only in `localStorage`. Assessment Phase B then added LearningApi progress keyed by anonymous session (`X-Learn-Session`) for read / quiz / lab phases — still without user accounts ([requirements-learn-assessment.md](../requirements-learn-assessment.md)).

## Decision

### Phase B (current — shipped)

1. **Authoritative assessment progress** lives in LearningApi / Postgres, keyed by **session UUID** (browser `localStorage`).
2. Clearing site data loses the session key → progress appears reset (UI should stay honest).
3. Lab criteria **checking** remains client-side (SPECS); API records attestation.

### Phase C (after G4)

1. Authenticated progress keyed by **user id**, same phase flags.
2. **Explicit merge** from session → user on first link (see [requirements-account.md](../requirements-account.md)).
3. Anonymous session progress remains for signed-out users.
4. Do not invent device fingerprinting.

## Consequences

- ADR text no longer claims “localStorage only” for assessment — that applied to pre-assessment MVP.
- Optional Lab schematic `localStorage` tabs are unrelated and stay client-only.
- Account build must not break anonymous sessions.
- Anti-cheat / server sim stays out of scope.
