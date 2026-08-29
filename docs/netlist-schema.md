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
        "params": { "v": 5 }
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
      },
      {
        "id": "S1",
        "model": "switch",
        "pins": { "a": "n1", "b": "n2" },
        "params": { "closed": true }
      }
    ]
  }
}
```

### Analysis types

| type | fields | Notes |
|------|--------|--------|
| `dcOp` | — | DC operating point |
| `tran` | `tStop`, `dt` | Fixed-step Backward Euler; defaults `tStop=0.005`, `dt=5e-5` |

### Models (teaching pack)

| model | pins | params | DC | Transient |
|-------|------|--------|----|-----------|
| `battery` | `p`, `n` | `v` | Ideal V | Same |
| `resistor` | `a`, `b` | `r` | Linear G | Same |
| `led` / `diode` | `a`, `c` | `vf`, `ron` | Piecewise | Same |
| `switch` | `a`, `b` | `closed` | Ron/Roff | Same |
| `current_source` | `p`, `n` | `i` | Ideal I | Same |
| `capacitor` | `a`, `b` | `c` | Open (+warning) | BE companion |
| `inductor` | `a`, `b` | `l` | Near-short | BE companion |

Schematic-only (not sent to CircuitEngine): Lab `ground` symbol forces connected nets to `circuit.ground`.

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

## Deferred

AC analysis, SPICE semiconductors (op-amp/BJT/MOS), and WebSocket streaming remain deferred.
