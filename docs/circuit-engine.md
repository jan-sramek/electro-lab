# Circuit Engine

HTTP host for `ElectroLab.CircuitSim`.

## Endpoints

- `GET /api/circuit/health` — liveness
- `POST /api/circuit/simulate` — run analysis (`dcOp`, `tran` or `ac`)

## Responsibility

- Validate JSON DTOs
- Map to CircuitSim netlist types
- Invoke the selected analysis
- Return a stable result envelope

Does **not** contain MNA stamp math — that lives in CircuitSim.

## Limits and error behaviour

Every solve is a dense O(n³) elimination, so the API bounds the work a single request can ask for.
Limits are constants shared with the library (`NetlistValidator`, `TransientAnalysis`, `AcAnalysis`);
the same checks run inside the library so direct callers are protected too.

| Limit | Value | Where |
|-------|-------|-------|
| Request body | 1 MB (`ApiLimits.MaxRequestBodyBytes`) | Kestrel → `413` |
| Elements per circuit | 500 (`NetlistValidator.MaxElements`) | mapper + validator → `400` |
| Distinct nodes | 600 (`NetlistValidator.MaxNodes`) | validator → `400` |
| Transient steps `ceil(tStop/dt)` | 20 000 (`TransientAnalysis.MaxSteps`) | mapper + analysis → `400` |
| AC `pointsPerDecade` | 200 (`AcAnalysis.MaxPointsPerDecade`) | mapper + analysis → `400` |
| AC total sweep points | 2 000 (`AcAnalysis.MaxTotalPoints`) | mapper + analysis → `400` |

Validation rules enforced before any stamping:

- Every pin value must be a non-empty node name (`"b": null` → `400` naming the element and pin).
- Every numeric param must be finite; `"NaN"`, `"Infinity"` (as JSON strings) are rejected. String params are
  parsed culture-invariantly (`1.5`, never `1,5`).
- Analysis fields are defaulted **only when absent**. A supplied `tStop`/`dt`/`freq`/`fStart`/`fStop` that is
  non-finite or ≤ 0, `dt > tStop`, or `fStop < fStart` is a `400`, not silently replaced.

Response guarantees:

- Every response, including malformed JSON, oversized bodies and unexpected exceptions, is the
  `SimulateResponse` envelope (`ok`, `analysisType`, `errors`, `warnings`, …). Stack traces are never returned;
  unexpected exceptions are logged and answered with `500` + `"Internal simulator error."`.
- If a solve produces a non-finite value the response is `400` with `ok:false` and
  `"solution is not finite …"` rather than a serialization failure.
- Engine-internal nodes (ids containing `__`, e.g. a battery's ESR midpoint `V1__mid`) are stripped from
  `nodeVoltages` in every analysis.
