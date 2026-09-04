# ADR-003: Auth deferred until Account (amended)

- **Status:** Accepted (amended 2026-09-04)  
- **Date:** 2026-08-31  
- **Amended:** 2026-09-04 for Phase C design gate G4

## Context

`/account` remains a stub. Learn MVP proved the anonymous path: catalog, quizzes, lab challenges, and session progress via `X-Learn-Session`.

Phase C needs sign-in without forcing it on every learner. Provider choice (magic link vs OAuth) is still expensive to reverse, so G4 must pick a direction before G5 build.

## Decision

1. **Phase B (current):** Learn stays **anonymous**. No user ids on Learn features.
2. **Phase C (G5, after G4):** Introduce optional auth. Preferred first slice: **email magic-link or a single OAuth provider** (pick one in G4 review) with server sessions or JWT — document the choice in this ADR’s G4 amendment note before coding.
3. Anonymous Learn remains valid forever; auth is additive.

### G4 amendment note (fill before G5)

| Choice | Decision | Owner / date |
|--------|----------|--------------|
| Provider | _TBD at G4 review_ | |
| Session style | _TBD (HTTP-only cookie session vs JWT)_ | |
| Identity host | Prefer LearningApi-adjacent module — **no new microservice** without ADR-006 revisit | |

## Consequences

- No personal data required for Phase B.
- Account FR: [requirements-account.md](../requirements-account.md).
- Progress linking: see ADR-004 amendment.
- Do not put login walls in front of Lab or public Learn SEO pages.
