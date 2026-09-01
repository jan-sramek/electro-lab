# ADR-003: No auth for Learn MVP

- **Status:** Accepted  
- **Date:** 2026-08-31

## Context

`/account` is still a stub. Putting login in front of Learn now means picking OAuth/sessions/user tables before we’ve proven the learning flow.

## Decision

**Learn MVP is anonymous.** No sign-in, no user ids, no auth on Learn features.

Real auth belongs in Phase C, with its own requirements and ADRs.

## Consequences

No personal data in Phase B. Progress can’t sync across devices unless it’s local-only (see ADR-004). Anything we add on LearningApi for catalog before Account should stay public read-only.
