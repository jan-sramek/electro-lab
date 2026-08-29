# Circuit Engine

HTTP host for `ElectroLab.CircuitSim`.

## Endpoints

- `GET /api/circuit/health` — liveness
- `POST /api/circuit/simulate` — run analysis (`dcOp` or `tran`)

## Responsibility

- Validate JSON DTOs
- Map to CircuitSim netlist types
- Invoke the selected analysis
- Return a stable result envelope

Does **not** contain MNA stamp math — that lives in CircuitSim.
