# ADR-001: Freeze Lab as v1

- **Status:** Accepted  
- **Date:** 2026-08-31

## Context

Lab already has a solid editor, DC/transient/AC, a teaching parts set, and examples. Keep stacking devices and “almost protocol” models and we’ll never get to Learn.

## Decision

Treat Lab + CircuitSim + CircuitEngine as **done for v1**.

OK without a new ADR:

- Bugs and regressions
- Accessibility, i18n, shared shell Learn needs
- Docs that explain behaviour without changing it
- Performance tweaks that keep the same contracts

Needs a new ADR:

- New engine models / part families
- Breaking changes to the simulate/netlist contract
- New analysis modes or streaming transports
- Real protocol or MCU emulation

## Consequences

Energy goes to Learn and engineering hygiene. Netlist `schemaVersion` stays the compatibility knob. Agents and humans should follow the freeze rule in the docs.
