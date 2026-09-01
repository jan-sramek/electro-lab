# ADR-006: Deployment style (not a microservice mesh)

- **Status:** Accepted  
- **Date:** 2026-08-31

## Context

People ask: are we a monolith or microservices? The repo already runs as several processes (web, CircuitEngine, LearningApi, Postgres, proxy). That can look like “microservices,” but Learn MVP functional requirements (browse projects, open Lab) would also work as one ASP.NET app + Angular.

So: **functional requirements alone are not enough** to force this split. We need an explicit style decision driven by other forces.

## Decision

Call the architecture what it is:

**A small set of purposeful deployables (modular multi-process), not a microservice landscape.**

| Deployable | Why it exists as its own process |
|------------|----------------------------------|
| **Web (Angular)** | Browser UI; separate build/deploy from .NET |
| **CircuitEngine** | Isolates the solver: scale/restart without touching Learn DB; Lab can fail independently of translations |
| **LearningApi** | Owns Postgres-backed learning concerns (i18n now; catalog/progress later); web can fall back if it’s down |
| **Postgres** | Shared durable store for learning-side data |
| **Proxy** | One URL in Compose |

We are **not** aiming for:

- Many tiny services per entity
- Service mesh, saga choreography, or “everything is an API call”
- Splitting CircuitSim into its own network service (it stays a library inside CircuitEngine)

**CircuitSim remains an in-process library.** That is intentional.

Default for new Phase B/C behaviour:

- Prefer extending **LearningApi** (or the web app for pure UI/catalog-in-repo) over inventing a new service
- A **new deployable** needs an ADR and a clear reason (blast radius, scaling, compliance, or a different lifecycle) — not “microservices are modern”

## What drove this (if not FRs alone)

| Driver | Effect |
|--------|--------|
| **NFR / resilience** | Lab usable with EN fallback when LearningApi is down |
| **NFR / scale** | Simulate load can grow by adding CircuitEngine replicas without cloning Learn/DB into the same process (NFR-9) |
| **Blast radius** | Heavy or crashing simulate shouldn’t take down i18n/DB hosting |
| **Lifecycle** | Solver library vs teaching content/API change at different rates |
| **Tech fit** | Angular SPA + .NET APIs is a normal split |
| **Team size** | Few people → few processes; avoid distributed complexity |

Learn MVP FRs (FR-L1…L6) only need *some* place to serve catalog/copy and a Lab deep-link. They do **not** require three backends. The split is for the drivers above.

## Consequences

- Document style as **modular deployables**, not “we do microservices”
- Keep operational cost low (Compose is the whole “cluster” for now)
- When Account/auth arrives, default home is LearningApi (or a later ADR if identity must be separate)
- If we ever merge CircuitEngine + LearningApi into one host, that also needs an ADR — merging is allowed if the drivers weaken

## If requirements feel too thin to choose architecture

Do this, in order:

1. **Write the FRs/NFRs you do know** (even a short list)
2. **List architecture drivers** that aren’t features: resilience, team size, deploy, compliance, performance isolation
3. **Pick the simplest shape that satisfies drivers** (often: one API + one web, or the few splits we already have)
4. **Record it in an ADR** with “revisit when X”
5. **Don’t invent services for FRs that aren’t written yet**

Thin FRs ⇒ prefer **fewer** moving parts, not more.
