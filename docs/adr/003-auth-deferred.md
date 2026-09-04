# ADR-003: Auth deferred until Account (amended)

- **Status:** Accepted (amended 2026-09-04)  
- **Date:** 2026-08-31  
- **Amended:** 2026-09-04 for Phase C design gate G4

## Context

`/account` remains a stub. Learn MVP proved the anonymous path: catalog, quizzes, lab challenges, and session progress via `X-Learn-Session`.

Phase C needs sign-in without forcing it on every learner. Provider choice is expensive to reverse, so G4 locks a direction before G5 build.

## Decision

1. **Phase B (current):** Learn stays **anonymous**. No user ids on Learn features.
2. **Phase C (G5, after G4):** Introduce **optional** auth. Anonymous Learn remains valid forever; auth is additive.
3. **No login walls** in front of Lab or public Learn SEO pages.

### G4 locked direction (2026-09-04)

| Choice | Decision | Owner / date |
|--------|----------|--------------|
| Provider | **Email magic link** (passwordless). Add one OAuth later if needed — do not start with Google-only. | Electro Lab / 2026-09-04 |
| Session style | **HTTP-only cookie session** on LearningApi (or co-located Identity module). Prefer server session over long-lived JWT in localStorage. | Electro Lab / 2026-09-04 |
| Identity host | LearningApi-adjacent — **no new microservice** without revisiting ADR-006 | Electro Lab / 2026-09-04 |

Rationale: magic link matches anonymous → occasional account upgrades for students/hobbyists; cookie sessions fit same-origin Angular + API; keeps deployables small.

## Consequences

- No personal data required for Phase B.
- Account FR: [requirements-account.md](../requirements-account.md).
- Progress linking: see ADR-004 amendment.
- G5 must not break `X-Learn-Session` anonymous progress.
