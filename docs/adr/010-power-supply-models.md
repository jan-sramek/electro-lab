# ADR-010: Power-supply teaching models

- **Status:** Accepted  
- **Date:** 2026-09-02  
- **Supersedes (partial):** ADR-001 freeze for the models listed below only

## Context

Learn curriculum *Napájecí obvody* (power supplies) needs rectifiers, filter caps, Zener regulation, 7805, reverse-polarity / fuse protection, ripple, and basic buck/boost demos. ADR-001 froze new engine models; these teaching parts are required to ship that module.

## Decision

Allow these **teaching-simplified** CircuitSim models (not SPICE-accurate):

| ModelKey | Role |
|----------|------|
| `zener` | Piecewise diode: forward Vf, reverse breakdown Vz |
| `vreg_7805` | Series linear regulator: fixed Vout when Vin ≥ Vout + dropout |
| `fuse` | Low-Ron series link; opens when burned (teaching overload) |

Buck/boost samples use **existing** pulse + NMOS + diode + L + C (no converter IC model).
Sample L/PWM values are sized so peak switch/diode current stays under Lab teaching burn limits.

## Note (inductor companion)

Transient inductor stamping must inject `iPrev` as `StampCurrentSource(a, b, iPrev)` for Backward Euler
`i = iPrev + (dt/L)(va−vb)`. The opposite sign made switched inductive circuits diverge (no visible
wire current after parts “burned” on numerical spikes).

## Consequences

- Register models in `DeviceModelRegistry`; extend DC/transient piecewise settle for zener + regulator.
- Frontend: symbols, glyphs, palette group, presets, Learn module `power`.
- Further power ICs (LM317, switching controllers) still need a new ADR.
