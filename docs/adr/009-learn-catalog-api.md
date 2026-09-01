# ADR-009: Learn catalog and progress API

**Status:** Accepted  
**Date:** 2026-09-01

## Context

Phase B shipped a TS-only catalog and optional local step checkmarks. The product needs a gated learning path (read → quiz → lab) with reusable content and server progress before Account.

## Decision

1. **LearningApi** owns Learn catalog tables (modules, units, lesson blocks, quiz questions, lab criteria) and **anonymous progress** keyed by `X-Learn-Session`.
2. **EF Core migrations** replace `EnsureCreatedAsync` for schema evolution.
3. **Quiz grading** runs server-side (correct answers not exposed in GET).
4. **Lab challenges** use declarative criterion types; the **browser** evaluates against simulation results and POSTs pass/fail per criterion; API records `labPassed`.
5. Angular keeps a **fallback catalog** for prerender/offline; API is source of truth when available.

## Consequences

- `apps/web` Learn feature calls `/api/learning/catalog` and progress endpoints.
- `TranslationSeeder` + `LearnCatalogSeeder` run at startup.
- ADR-002 TS catalog becomes transport fallback, not primary.
- ADR-004 progress is server-backed for session; Account phase attaches session to user.

## Alternatives considered

- Keep everything in TS — rejected: user asked for DB/backend and path gating.
- Server-side simulation for lab verify — deferred: duplicates CircuitEngine; document client attestation limit.
