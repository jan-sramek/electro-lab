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
      if (pin === 'p') return branchI;
      if (pin === 'n') return -branchI;
      return 0;
    case 'op_amp':
      // Branch current is output current (out → ground VCVS).
      if (pin === 'out') return branchI;
      return 0;
    case 'bjt_npn':
      // Branch current is Ic (c → e). Base is handled by the base resistor's current.
      if (pin === 'c') return -branchI;
      if (pin === 'e') return branchI;
      return 0;
    case 'current_source':
      if (pin === 'n') return branchI;
      if (pin === 'p') return -branchI;
      return 0;
    case 'potentiometer':
      // Branch current is Ia→w. Unloaded wiper ⇒ same I through b; wiper open ⇒ 0 at w.
      if (pin === 'a') return -branchI;
      if (pin === 'b') return branchI;
      if (pin === 'w') return 0;
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
  return modelKey === 'ground' || modelKey === 'junction' || modelKey === 'voltmeter';
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

function componentOf(
  components: SchematicComponent[],
  id: string
): SchematicComponent | undefined {
  return components.find((c) => c.id === id);
}

/**
 * Current leaving a pin into its attached wires.
 * Ground / junction / voltmeter inject 0 (KCL only).
 * Returns null when the device branch current is unknown.
 */
function pinInjectedOutflow(
  components: SchematicComponent[],
  ref: PinRef,
  currentOf: (id: string) => number | null
): number | null {
  const c = componentOf(components, ref.componentId);
  if (!c) return null;
  if (isPassiveNetNode(c.modelKey)) return 0;
  const i = currentOf(c.id);
  if (typeof i !== 'number') return null;
  return pinOutflowAmps(c.modelKey, ref.pin, i);
}

/** Current leaving `pin` through wire `w` given I along w from a→b. */
function leavingThroughWire(w: SchematicWire, pin: PinRef, iAlongAtoB: number): number {
  return pinKey(w.a) === pinKey(pin) ? iAlongAtoB : -iAlongAtoB;
}

/**
 * Estimate I along every wire (A→B) by seeding degree-1 device pins, then
 * closing KCL at multi-wire junctions/ground so return paths and T-splits fill in.
 */
export function estimateAllWireCurrents(
  components: SchematicComponent[],
  wires: SchematicWire[],
  currentOf: (id: string) => number | null
): Map<string, number> {
  const along = new Map<string, number>();
  if (!wires.length) return along;

  const pinRefs = new Map<string, PinRef>();
  for (const w of wires) {
    pinRefs.set(pinKey(w.a), w.a);
    pinRefs.set(pinKey(w.b), w.b);
  }

  const trySeed = (): boolean => {
    let changed = false;
    for (const w of wires) {
      if (along.has(w.id)) continue;
      const countA = wiresAtPin(wires, w.a).length;
      const countB = wiresAtPin(wires, w.b).length;
      const oa = pinInjectedOutflow(components, w.a, currentOf);
      const ob = pinInjectedOutflow(components, w.b, currentOf);

      // Seed even when I≈0 so open switches / idle batteries don't get
      // painted later by the series-current hint (false flow on dead branches).
      // Do NOT pin passive net nodes (ground/junction) at 0 — their stubs must
      // stay free so KCL can place return-path current on earth wires.
      if (countA === 1 && oa !== null) {
        const ca = componentOf(components, w.a.componentId);
        if (!(Math.abs(oa) < 1e-15 && ca && isPassiveNetNode(ca.modelKey))) {
          along.set(w.id, Math.abs(oa) < 1e-15 ? 0 : oa);
          changed = true;
          continue;
        }
      }
      if (countB === 1 && ob !== null) {
        const cb = componentOf(components, w.b.componentId);
        if (!(Math.abs(ob) < 1e-15 && cb && isPassiveNetNode(cb.modelKey))) {
          along.set(w.id, Math.abs(ob) < 1e-15 ? 0 : -ob);
          changed = true;
        }
      }
    }
    return changed;
  };

  const tryKcl = (): boolean => {
    let changed = false;
    for (const pin of pinRefs.values()) {
      const required = pinInjectedOutflow(components, pin, currentOf);
      if (required === null) continue;

      const ws = wiresAtPin(wires, pin);
      let knownLeaving = 0;
      const unknown: SchematicWire[] = [];
      for (const w of ws) {
        const i = along.get(w.id);
        if (i === undefined) {
          unknown.push(w);
          continue;
        }
        knownLeaving += leavingThroughWire(w, pin, i);
      }
      if (unknown.length !== 1) continue;

      const w = unknown[0]!;
      const needLeave = required - knownLeaving;
      const iAlong =
        pinKey(w.a) === pinKey(pin) ? needLeave : -needLeave;
      along.set(w.id, iAlong);
      changed = true;
    }
    return changed;
  };

  // Iterate: seed unique pins ↔ KCL at multi-wire nodes (junctions / ground).
  for (let n = 0; n < wires.length + 4; n++) {
    const a = trySeed();
    const b = tryKcl();
    if (!a && !b) break;
  }

  // Fallback for leftover wires (missing branch currents, etc.).
  // Never invent current on a wire already fixed at 0 by a known idle pin.
  const hint = seriesCurrentHint(components, currentOf);
  for (const w of wires) {
    if (along.has(w.id)) continue;
    const ca = componentOf(components, w.a.componentId);
    const cb = componentOf(components, w.b.componentId);
    const ia = currentOf(w.a.componentId);
    const ib = currentOf(w.b.componentId);

    let i = wireCurrentAtoB(ca?.modelKey, w.a.pin, ia, cb?.modelKey, w.b.pin, ib);
    if (Math.abs(i) < 1e-12 && hint != null) {
      const mag = Math.abs(hint);
      const countA = wiresAtPin(wires, w.a).length;
      const countB = wiresAtPin(wires, w.b).length;
      if (countA === 1 && ca && !isPassiveNetNode(ca.modelKey)) {
        i = pinOutflowAmps(ca.modelKey, w.a.pin, mag);
      } else if (countB === 1 && cb && !isPassiveNetNode(cb.modelKey)) {
        i = -pinOutflowAmps(cb.modelKey, w.b.pin, mag);
      } else {
        i = wireCurrentAtoB(ca?.modelKey, w.a.pin, mag, cb?.modelKey, w.b.pin, mag);
      }
    }
    if (Math.abs(i) > 1e-15) along.set(w.id, i);
  }

  return along;
}

/**
 * Current along wire from A toward B, preferring the endpoint that has exactly
 * one attached wire (avoids ambiguous ground/T nodes). Falls back to KCL fill
 * across the whole net so junction/ground segments still animate.
 */
export function estimateWireCurrentAtoB(
  wire: SchematicWire,
  components: SchematicComponent[],
  wires: SchematicWire[],
  currentOf: (id: string) => number | null
): number {
  return estimateAllWireCurrents(components, wires, currentOf).get(wire.id) ?? 0;
}
