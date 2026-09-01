# ADR-005: Logging stack

- **Status:** Accepted  
- **Date:** 2026-08-31  
- **Updated:** 2026-08-31 — scoped for the whole product lifecycle, not only MVP

## Context

We need logging that stays sensible from first `dotnet run` through Compose, CI, and a later public deploy — without picking a paid APM on day one or rewriting every `ILogger` call in two years.

NFR-7/8 still apply: useful ops signal, no secrets/PII, health endpoints kept.

What “lifecycle-ready” means here:

- Same API in application code forever (`ILogger<T>` / Serilog)
- Enrichment that still matters in prod (service name, environment, request/trace id)
- **Sinks are config**, not a rewrite — local stdout today, collector/cloud later
- Free or free-tier backends available when we need them; no vendor lock in call sites

## Options

| Approach | Lifecycle fit | Cost / weight |
|----------|---------------|----------------|
| Default ASP.NET logging only | Weak structure; painful later | Lightest |
| Serilog → console only, “add stuff later” | Fine short-term; easy to under-specify enrichment | Light |
| **Serilog + console + OTLP-ready config** | One logging story from dev → prod | Still light |
| Full OpenTelemetry metrics/traces/logs everywhere on day one | Strong, but heavy for two small APIs | Heavier |
| Paid APM now | Strong hosted UX | Not free; premature |

## Decision

**Serilog is the logging backbone for CircuitEngine and LearningApi for the foreseeable product life.**

Rules:

1. **Code** uses `ILogger<T>` (Microsoft abstractions). No direct sink calls from business code.
2. **Host** uses Serilog (`Serilog.AspNetCore`) with shared enrichers:
   - service name (`CircuitEngine` / `LearningApi`)
   - environment
   - request path / status / duration (HTTP request logging)
   - correlation: ASP.NET request id and, when present, `TraceId`/`SpanId` from `Activity`
3. **Sinks are configuration**, not features:
   - **Always:** Console (required for local + Compose + most hosts that scrape stdout)
   - **Ready from the start:** OpenTelemetry OTLP sink (or Serilog OTLP), **off by default**, enabled with env/config when a collector exists
4. **Do not log** bodies, connection strings, tokens, passwords, or personal data.
5. **Web (Angular):** no product logging SaaS. User-visible errors stay in the UI; `console` is for development only.

**What we are not adopting as the core:** Seq-as-required-infrastructure, ELK, or a paid APM. Those can appear later as *destinations* behind OTLP or an extra Serilog sink — still without changing app code.

**Suggested free destinations when we leave “stdout only”:**

| Stage | Typical destination |
|-------|---------------------|
| Local / Compose | Console (stdout) |
| Solo / small VPS | Console + optional file, or a free OTLP collector + Grafana Loki |
| Shared staging/prod | OTLP → whatever we host or a free-tier observability backend |

## Consequences

- One decision covers almost the whole lifecycle: Serilog in, sinks out
- First implementation slice: wire Serilog + console + enrichers + request logging; stub OTLP config (disabled) so turning it on is config, not a project
- Slightly more setup than “leave defaults alone,” but we avoid a second migration when Learn/Account and real deploys appear
- Metrics/distributed tracing beyond “include TraceId on log lines” can be a later ADR if we want full OpenTelemetry traces/metrics

## Implementation notes (when we code it)

- Same pattern on both API `Program.cs` files
- Levels in `appsettings` / env (`Serilog:MinimumLevel`, override Microsoft.* to Warning)
- Document the env vars for OTLP (endpoint, headers) in `docs/quality.md` or a short ops note when enabled
