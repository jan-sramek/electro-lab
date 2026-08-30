# Netlist schema (v1)

## Simulate request

```json
{
  "schemaVersion": 1,
  "analysis": { "type": "dcOp" },
  "circuit": {
    "ground": "gnd",
    "elements": [
      {
        "id": "V1",
        "model": "battery",
        "pins": { "p": "n1", "n": "gnd" },
        "params": { "v": 5, "esr": 0 }
      },
      {
        "id": "R1",
        "model": "resistor",
        "pins": { "a": "n1", "b": "n2" },
        "params": { "r": 220 }
      },
      {
        "id": "D1",
        "model": "led",
        "pins": { "a": "n2", "c": "gnd" },
        "params": { "vf": 2.0, "ron": 20 }
      }
    ]
  }
}
```

### Analysis types

| type | fields | Notes |
|------|--------|--------|
| `dcOp` | — | DC operating point |
| `tran` | `tStop`, `dt`, optional `initFromDc` | Fixed-step Backward Euler; defaults `tStop=0.005`, `dt=5e-5`. `initFromDc` seeds C/L from a DC solve at t=0 (overrides `params.ic`) |
| `ac` | `freq`, or `fStart`/`fStop`/`pointsPerDecade` | Phasor / small-signal; default `freq=1000` Hz. Nonlinear devices (LED, diode, BJT) treated as open with a warning |

### Models (teaching pack)

| model | pins | params | DC | Transient | AC |
|-------|------|--------|----|-----------|-----|
| `battery` | `p`, `n` | `v`, optional `esr` ≥ 0 | Ideal V (+ Thévenin ESR) | Same | AC short (+ ESR) |
| `ac_source` | `p`, `n` | `mag`, `phase` (°) | 0 V (short) | 0 V | Phasor `mag∠phase` |
| `resistor` | `a`, `b` | `r` | Linear G | Same | Same |
| `led` / `diode` | `a`, `c` | `vf`, `ron` | Piecewise | Same | Open (+warning) |
| `switch` | `a`, `b` | `closed`; optional `openAt` / `closeAt` (s, ≥0; −1 = unused) | Ron/Roff from timeline at t=0, else `closed` | Same; `openAt` alone → open for `t ≥ openAt`; `closeAt` alone → closed for `t ≥ closeAt`; both with `closeAt ≤ openAt` → closed on `[closeAt, openAt)` | Same as DC |
| `bjt_npn` | `c`, `b`, `e` | `vf`, `rb`, `ron` | Piecewise switch | Same | Open (+warning) |
| `op_amp` | `inp`, `inn`, `out` | `gain` (default 1e5) | Finite-gain VCVS to gnd (teaching ideal) | Same | Same |
| `current_source` | `p`, `n` | `i` | Ideal I | Same | Open (no AC) |
| `capacitor` | `a`, `b` | `c`; optional `ic` (V, initial V(a)−V(b) for tran) | Open (+warning) | BE companion from `ic` (default 0) or from DC when `initFromDc` | `jωC` |
| `inductor` | `a`, `b` | `l` | Near-short | BE companion (I=0 unless `initFromDc`) | `1/(jωL)` |
| `potentiometer` | `a`, `w`, `b` | `r`, `pos` (0–1) | Two series R | Same | Same |
| `pulse_source` | `p`, `n` | `v1`, `v2`, `td`, `pw` | Uses `v1` | Pulse | AC short |
| `ammeter` | `a`, `b` | `r` (sense, default 0.01) | Series sense R | Same | Same |

Schematic-only (not sent to CircuitEngine): Lab `ground` forces connected nets to `circuit.ground`; Lab `voltmeter` shows V(p)−V(n) from results without loading the circuit.

## Simulate response (dcOp)

```json
{
  "schemaVersion": 1,
  "ok": true,
  "analysisType": "dcOp",
  "errors": [],
  "warnings": [],
  "dcOp": {
    "nodeVoltages": { "gnd": 0, "n1": 5, "n2": 2.1 },
    "branchCurrents": { "V1": 0.013, "R1": 0.013, "D1": 0.013 }
  }
}
```

## Simulate response (tran)

```json
{
  "schemaVersion": 1,
  "ok": true,
  "analysisType": "tran",
  "tran": {
    "time": [0, 5e-5, "..."],
    "nodeVoltages": [{ "id": "n2", "values": [0, 0.24, "..."] }],
    "branchCurrents": [{ "id": "C1", "values": [0, 0.004, "..."] }]
  }
}
```

## Simulate response (ac)

```json
{
  "schemaVersion": 1,
  "ok": true,
  "analysisType": "ac",
  "ac": {
    "points": [
      {
        "frequency": 1000,
        "nodeVoltages": { "n2": { "mag": 0.707, "phaseDeg": -45 } },
        "branchCurrents": { "R1": { "mag": 0.0007, "phaseDeg": 45 } }
      }
    ]
  }
}
```

## Deferred

Full SPICE semiconductors (Ebers–Moll / Level-1 MOSFET), small-signal linearization of nonlinear devices for AC, transformers, and WebSocket streaming remain deferred.
