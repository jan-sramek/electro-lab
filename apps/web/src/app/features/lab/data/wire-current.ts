import { PinRef, SchematicComponent, SchematicWire, pinKey } from './schematic.model';

/**
 * Conventional current leaving a schematic pin into attached wires (amperes),
 * given CircuitSim branch-current sign conventions.
 *
 * Passives (R, L, C, switch, diode, LED): +I flows through the device
 * from the first pin toward the second (a→b, a→c), so current enters the
 * first pin from the wire and leaves the second pin into the wire.
 *
 * Battery / pulse (+I supplying): leaves p into the circuit, returns at n.
 * Current source (+I): leaves n, enters p (engine comment).
 */
export function pinOutflowAmps(modelKey: string, pin: string, branchI: number): number {
  switch (modelKey) {
    case 'resistor':
    case 'capacitor':
    case 'inductor':
    case 'switch':
    case 'ammeter':
      if (pin === 'a') return -branchI;
      if (pin === 'b') return branchI;
      return 0;
    case 'diode':
    case 'led':
      if (pin === 'a') return -branchI;
      if (pin === 'c') return branchI;
      return 0;
    case 'battery':
    case 'pulse_source':
    case 'ac_source':
    case 'op_amp':
      if (pin === 'p' || pin === 'out') return branchI;
      if (pin === 'n') return -branchI;
      return 0;
    case 'bjt_npn':
      if (pin === 'c') return -branchI;
      if (pin === 'e') return branchI;
      return 0;
    case 'current_source':
      if (pin === 'n') return branchI;
      if (pin === 'p') return -branchI;
      return 0;
    case 'potentiometer':
      if (pin === 'a') return -branchI;
      if (pin === 'w') return branchI;
      return 0;
    default:
      return 0;
  }
}

/**
 * Current along a wire from endpoint A toward endpoint B (amperes).
 * Uses pin outflows; averages both ends when both are known (series check).
 */
export function wireCurrentAtoB(
  modelA: string | undefined,
  pinA: string,
  iA: number | null | undefined,
  modelB: string | undefined,
  pinB: string,
  iB: number | null | undefined
): number {
  const oa =
    modelA && typeof iA === 'number' ? pinOutflowAmps(modelA, pinA, iA) : 0;
  const ob =
    modelB && typeof iB === 'number' ? pinOutflowAmps(modelB, pinB, iB) : 0;
  if (Math.abs(oa) < 1e-12 && Math.abs(ob) < 1e-12) return 0;
  if (Math.abs(oa) < 1e-12) return -ob;
  if (Math.abs(ob) < 1e-12) return oa;
  return (oa - ob) / 2;
}

function isPassiveNetNode(modelKey: string): boolean {
  return modelKey === 'ground' || modelKey === 'junction';
}

/** Largest |branch current| among real devices — used when a source current is missing. */
export function seriesCurrentHint(
  components: SchematicComponent[],
  currentOf: (id: string) => number | null
): number | null {
  let best = 0;
  for (const c of components) {
    if (isPassiveNetNode(c.modelKey)) continue;
    const i = currentOf(c.id);
    if (typeof i === 'number' && Math.abs(i) > Math.abs(best)) best = i;
  }
  return Math.abs(best) > 1e-12 ? best : null;
}

function wiresAtPin(wires: SchematicWire[], ref: PinRef): SchematicWire[] {
  const k = pinKey(ref);
  return wires.filter((w) => pinKey(w.a) === k || pinKey(w.b) === k);
}

/**
 * Current along wire from A toward B, preferring the endpoint that has exactly
 * one attached wire (avoids ambiguous ground/T nodes). Falls back to a series
 * hint so battery↔ground return wires still animate if V-source current is absent.
 */
export function estimateWireCurrentAtoB(
  wire: SchematicWire,
  components: SchematicComponent[],
  wires: SchematicWire[],
  currentOf: (id: string) => number | null
): number {
  const ca = components.find((c) => c.id === wire.a.componentId);
  const cb = components.find((c) => c.id === wire.b.componentId);
  const ia = currentOf(wire.a.componentId);
  const ib = currentOf(wire.b.componentId);

  const countA = wiresAtPin(wires, wire.a).length;
  const countB = wiresAtPin(wires, wire.b).length;

  // Prefer a unique device pin (typical series / return-to-ground case).
  if (countA === 1 && ca && !isPassiveNetNode(ca.modelKey) && typeof ia === 'number') {
    return pinOutflowAmps(ca.modelKey, wire.a.pin, ia);
  }
  if (countB === 1 && cb && !isPassiveNetNode(cb.modelKey) && typeof ib === 'number') {
    return -pinOutflowAmps(cb.modelKey, wire.b.pin, ib);
  }

  let i = wireCurrentAtoB(ca?.modelKey, wire.a.pin, ia, cb?.modelKey, wire.b.pin, ib);
  if (Math.abs(i) > 1e-12) return i;

  const hint = seriesCurrentHint(components, currentOf);
  if (hint == null) return 0;

  // Substitute |hint| as conventional +supply / +forward current for direction.
  const mag = Math.abs(hint);
  if (countA === 1 && ca && !isPassiveNetNode(ca.modelKey)) {
    return pinOutflowAmps(ca.modelKey, wire.a.pin, mag);
  }
  if (countB === 1 && cb && !isPassiveNetNode(cb.modelKey)) {
    return -pinOutflowAmps(cb.modelKey, wire.b.pin, mag);
  }
  return wireCurrentAtoB(ca?.modelKey, wire.a.pin, mag, cb?.modelKey, wire.b.pin, mag);
}
