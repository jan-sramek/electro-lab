# Quality

How we keep Lab v1 from rotting while the product grows. Gates: [roadmap.md](roadmap.md). NFRs: [requirements.md](requirements.md).

## What we’re protecting

- CircuitSim unit tests stay green
- Lab preset / wire-flow / diagnostics tests don’t quietly break
- New Learn logic gets small, focused tests (catalog → example id, slug stability)

We don’t need a huge e2e suite yet. One deep-link path later is enough.

Handy Lab anchors: LED / RC fade presets, Arduino-path preset compiles, CircuitSim device tests.

## Phase gates (quality bar)

| Gate | Quality expectations |
|------|---------------------|
| **G0 Analysis** | Docs consistent; checklist updated; no contradictions between ADRs |
| **G1 Architecture** | domain-model matches modules; failure modes documented |
| **G2 Phase B design** | Learn IA/URLs fixed; SSR/prerender choice in ADR-007; acceptance criteria in phase FR doc |
| **G3 Phase B merge** | Section below (“Done for a slice”) + Phase B acceptance checklist |

## “Done” for a slice

1. Phase acceptance notes are met  
2. User-facing strings in `en-fallback.ts` and `TranslationSeeder.cs`  
3. New pure logic has tests  
4. Docs/ADRs updated if contracts or decisions changed  
5. No new Lab simulator features unless ADR-001 reopened  
6. Happy path clicked through locally  

## What to run before merging

Until CI is wired:

```bash
dotnet test
cd apps/web && npx ng build --configuration=development
cd apps/web && npx ng test --no-watch --browsers=ChromeHeadless --include=**/preset-contracts.spec.ts
```

Later: GitHub Actions for `dotnet test`, `ng build`, web tests, Compose health.

## Logging and ops

**NFR-7 / NFR-8**, [adr/005-logging.md](adr/005-logging.md).

Serilog on APIs via `ILogger<T>`. Console always; OTLP by config. Angular: UI for users.

Bar: debug from service stdout + UI. No secrets/PII in logs.

## Scalability checks (when load is real)

**NFR-9 / NFR-10**: stateless simulate/browse; CircuitEngine replicas OK; load-test before caches/queues.

## When something’s weird locally

- **Unknown model** → rebuild/restart CircuitEngine  
- **Stale API strings** → restart LearningApi (seeder)  
- Ports: engine `:5080`, learning `:5081`, Angular `:4200`, Compose UI `:8080`

## Threat notes

Anonymous MVP — user spoofing isn’t the story yet. Still:

- Engine validates simulate payloads  
- No arbitrary HTML from users in Learn  
- Revisit simulate abuse if public deploy grows ([risks-and-deferrals.md](risks-and-deferrals.md))
