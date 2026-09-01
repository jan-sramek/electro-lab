# ADR-004: Progress for Learn MVP

- **Status:** Accepted  
- **Date:** 2026-08-31

## Context

Checkmarks on steps are nice. Saving them on the server needs a user (ADR-003) and schema. Inventing anonymous server “device ids” is a mess we’d regret.

## Decision

**Optional progress in `localStorage` only** for MVP. Not synced. Not the source of truth for anything important.

Server progress waits for Account, then a new ADR.

## Consequences

FR-L7 is a “should”. Clearing site data wipes ticks — say so in the UI if we show them. No progress endpoints on LearningApi in this phase.
