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
| `tran` | `tStop`, `dt`, optional `initFromDc` | Fixed-step Backward Euler; defaults `tStop=0.005`, `dt=5e-5` apply only when the field is absent (a supplied value ≤ 0, non-finite, or `dt > tStop` → 400). `ceil(tStop/dt)` ≤ 20 000. `initFromDc` seeds C/L from a DC solve at t=0 (overrides `params.ic`) using exactly the dcOp bias rules (incl. zener / 7805). The first plotted sample at t=0 is already one BE companion step from the IC (not a pure algebraic snapshot). |
| `ac` | `freq`, or `fStart`/`fStop`/`pointsPerDecade` | Phasor / small-signal; default `freq=1000` Hz. Log sweep: `pointsPerDecade` ≤ 200 and `round(decades·ppd)+1` ≤ 2 000 total points, else 400. Nonlinear devices (LED, diode, BJT) treated as open with a warning |

### Limits (400 on violation)

- ≤ 500 elements, ≤ 600 distinct nodes, request body ≤ 1 MB.
- Every pin must name a non-empty node; every numeric param must be finite (`"NaN"` / `"Infinity"` strings rejected).
- Node ids containing `__` are reserved for engine-internal nodes (e.g. `V1__mid`) and are omitted from `nodeVoltages` in responses.
- `branchCurrents` sign convention: passives report current from the first pin to the second (`a→b`, `a→c`);
  sources report delivered current (flowing `n→p` inside the source). An ideal-short inductor whose own
  reading is below 1 µA takes its current from the series neighbour, orientation-corrected to `a→b`.

### Models (teaching pack)

| model | pins | params | DC | Transient | AC |
|-------|------|--------|----|-----------|-----|
| `battery` | `p`, `n` | `v`, optional `esr` ≥ 0 | Ideal V (+ Thévenin ESR) | Same | AC short (+ ESR) |
| `ac_source` | `p`, `n` | `mag`, `phase` (°); optional `freq` (Hz) | 0 V (short) | `mag·sin(2π·freq·t + phase)` when `freq` > 0; else 0 V | Phasor `mag∠phase` |
| `resistor` | `a`, `b` | `r`; bool `burned` | Linear G; burned → open | Same | Same |
| `led` / `diode` | `a`, `c` | `vf`, `ron`; bool `burned` | Piecewise; burned → open | Same | Open (+warning) |
| `switch` | `a`, `b` | `closed`; optional `openAt` / `closeAt` (s, ≥0; −1 = unused) | Ron/Roff from timeline at t=0, else `closed` | Same; `openAt` alone → open for `t ≥ openAt`; `closeAt` alone → closed for `t ≥ closeAt`; both with `closeAt ≤ openAt` → closed on `[closeAt, openAt)` | Same as DC |
| `bjt_npn` | `c`, `b`, `e` | `vf`, `rb`, `ron`; bool `burned` | Piecewise switch; burned → open (Lab burns on sustained Ib ≳ 25 mA) | Same | Open (+warning) |
| `nmos` | `d`, `g`, `s` | `vth`, `ron`; bool `burned` | Piecewise: on when Vgs ≥ vth; burned → open | Same | Open (+warning) |
| `ne555` | `gnd`…`vcc` | `ron`; bool `burned` | Behavioral SR latch | Same | Open (+warning) |
| `ldr` | `a`, `b` | `light` 0–1, `rDark`, `rLight` | R interpolates dark→light | Same | Same |
| `buzzer` | `a`, `c` | `vf`, `ron` | Piecewise like LED | Same | Open (+warning) |
| `dc_motor` | `a`, `b` | `ron`, `vStart`; bool `burned` | On when \|V\|≥vStart | Same | Open (+warning) |
| `arduino_dio` | `sig`, `gnd` | `mode` 0/1, `level` 0/1, `vHigh`, `ron` | Output V / input open | Same | Open (+warning) |
| `relay` | `cp`, `cn`, `a`, `b` | `rCoil`, `vPull`, `ron`; bool `closed`; optional `openAt`/`closeAt` | Coil R always; contacts Ron when `|Vcoil|≥vPull` or override | Same | Coil R; contacts open (+warning) |
| `op_amp` | `inp`, `inn`, `out` | `gain` (default 1e5); optional `vMax`/`vMin` (default ±15) | Finite-gain VCVS to gnd, clamped to rails | Same | Linear VCVS (unclamped) |
| `current_source` | `p`, `n` | `i` | Ideal I | Same | Open (no AC) |
| `capacitor` | `a`, `b` | `c`; optional `ic` (V); optional Lab `vmax`; bool `burned` | Open (+warning); burned stays open | BE companion; burned → open | `jωC`; burned → open |
| `inductor` | `a`, `b` | `l`; optional `ic` (A, initial I a→b for tran) | Near-short | BE companion from `ic` (default 0) or from DC when `initFromDc` | `1/(jωL)` |
| `potentiometer` | `a`, `w`, `b` | `r`, `pos` (0–1) | Two series R | Same | Same |
| `pulse_source` | `p`, `n` | `v1`, `v2`, `td`, `pw` | Uses `v1` | Pulse | AC short |
| `ammeter` | `a`, `b` | `r` (sense, default 0.01); bool `burned` | Series sense R; burned → open | Same | Same |

Lab may place **named catalog parts** (e.g. `bc547`) that compile to these engine models via `simModel` — same pins/params, teaching approximation only (not datasheet/SPICE).

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

Full SPICE semiconductors (Ebers–Moll / Level-1 MOSFET), small-signal linearization of nonlinear devices for AC, transformers, and WebSocket streaming remain deferred. Lab `nmos` / `ne555` are teaching behavioral models, not datasheet/SPICE equivalents.
