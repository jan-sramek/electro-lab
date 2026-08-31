import { PinRef, SchematicComponent, SchematicWire, pinKey } from '../schematic.model';
import { simModelOf } from '../symbol-library';
import { BranchCurrentLookup, WireCurrentMap } from './wire-flow.model';

/**
 * Conventional current leaving a schematic pin into attached wires (amperes).
 * See wire-current.ts module doc for sign conventions.
 */
export function pinOutflowAmps(modelKey: string, pin: string, branchI: number): number {
  switch (simModelOf(modelKey)) {
    case 'resistor':
    case 'capacitor':
    case 'inductor':
    case 'switch':
    case 'ammeter':
      if (pin === 'a') return -branchI;
      if (pin === 'b') return branchI;
      return 0;
    case 'ldr':
    case 'dc_motor':
      if (pin === 'a') return -branchI;
      if (pin === 'b') return branchI;
      return 0;
    case 'relay':
      if (pin === 'a') return -branchI;
      if (pin === 'b') return branchI;
      return 0;
    case 'diode':
    case 'led':
    case 'buzzer':
      if (pin === 'a') return -branchI;
      if (pin === 'c') return branchI;
      return 0;
    case 'battery':
    case 'pulse_source':
    case 'ac_source':
    case 'arduino_dio':
      if (pin === 'p' || pin === 'sig') return branchI;
      if (pin === 'n' || pin === 'gnd') return -branchI;
      return 0;
    case 'op_amp':
      if (pin === 'out') return branchI;
      return 0;
    case 'bjt_npn':
      if (pin === 'c') return -branchI;
      if (pin === 'e') return branchI;
      return 0;
    case 'nmos':
      if (pin === 'd') return -branchI;
      if (pin === 's') return branchI;
      return 0;
    case 'ne555':
      if (pin === 'out') return branchI;
      return 0;
    case 'current_source':
      if (pin === 'n') return branchI;
      if (pin === 'p') return -branchI;
      return 0;
    case 'potentiometer':
      if (pin === 'a') return -branchI;
      if (pin === 'b') return branchI;
      if (pin === 'w') return 0;
      return 0;
    default:
      return 0;
  }
}

/** True when branch current maps to a pin's wire outflow (false → KCL treats pin as pass-through). */
export function isPinCurrentModeled(modelKey: string, pin: string): boolean {
  switch (simModelOf(modelKey)) {
    case 'ne555':
      return pin === 'out';
    case 'op_amp':
      return pin === 'out';
    case 'nmos':
      return pin === 'd' || pin === 's';
    case 'arduino_dio':
      return pin === 'sig' || pin === 'gnd';
    case 'bjt_npn':
      return pin === 'c' || pin === 'e';
    case 'relay':
      return pin === 'a' || pin === 'b';
    case 'voltmeter':
      return false;
    default:
      return true;
  }
}

function isPassiveNetNode(modelKey: string): boolean {
  return modelKey === 'ground' || modelKey === 'junction' || modelKey === 'voltmeter';
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

function pinInjectedOutflow(
  components: SchematicComponent[],
  ref: PinRef,
  currentOf: BranchCurrentLookup
): number | null {
  const c = componentOf(components, ref.componentId);
  if (!c) return null;
  if (c.modelKey === 'ground') return null;
  if (isPassiveNetNode(c.modelKey)) return 0;
  if (!isPinCurrentModeled(c.modelKey, ref.pin)) return null;
  const i = currentOf(c.id);
  if (typeof i !== 'number') return null;
  return pinOutflowAmps(c.modelKey, ref.pin, i);
}

function leavingThroughWire(w: SchematicWire, pin: PinRef, iAlongAtoB: number): number {
  return pinKey(w.a) === pinKey(pin) ? iAlongAtoB : -iAlongAtoB;
}

function wireCurrentAtoB(
  modelA: string | undefined,
  pinA: string,
  iA: number | null | undefined,
  modelB: string | undefined,
  pinB: string,
  iB: number | null | undefined
): number {
  const oa =
    modelA && typeof iA === 'number' && isPinCurrentModeled(modelA, pinA)
      ? pinOutflowAmps(modelA, pinA, iA)
      : 0;
  const ob =
    modelB && typeof iB === 'number' && isPinCurrentModeled(modelB, pinB)
      ? pinOutflowAmps(modelB, pinB, iB)
      : 0;
  if (Math.abs(oa) < 1e-12 && Math.abs(ob) < 1e-12) return 0;
  if (Math.abs(oa) < 1e-12) return -ob;
  if (Math.abs(ob) < 1e-12) return oa;
  return (oa - ob) / 2;
}

function seriesCurrentHint(
  components: SchematicComponent[],
  currentOf: BranchCurrentLookup
): number | null {
  let best = 0;
  for (const c of components) {
    if (isPassiveNetNode(c.modelKey)) continue;
    const i = currentOf(c.id);
    if (typeof i === 'number' && Math.abs(i) > Math.abs(best)) best = i;
  }
  return Math.abs(best) > 1e-12 ? best : null;
}

/** Estimate battery current as sum of |branch I| on loads when V1 branch is missing. */
function supplyCurrentHint(
  components: SchematicComponent[],
  currentOf: BranchCurrentLookup
): number | null {
  let sum = 0;
  let any = false;
  for (const c of components) {
    if (c.modelKey === 'battery' || isPassiveNetNode(c.modelKey)) continue;
    const i = currentOf(c.id);
    if (typeof i !== 'number' || Math.abs(i) < 1e-12) continue;
    sum += Math.abs(i);
    any = true;
  }
  return any && sum > 1e-12 ? sum : null;
}

function hintForComponent(
  c: SchematicComponent,
  components: SchematicComponent[],
  currentOf: BranchCurrentLookup
): number | null {
  const direct = currentOf(c.id);
  if (typeof direct === 'number' && Math.abs(direct) > 1e-12) return direct;
  if (c.modelKey === 'battery') return supplyCurrentHint(components, currentOf);
  return seriesCurrentHint(components, currentOf);
}

/**
 * KCL wire-current field: seed leaf pins, close junctions (incl. star splits), hint fallback.
 */
export class WireCurrentField {
  private readonly along = new Map<string, number>();

  constructor(
    private readonly components: SchematicComponent[],
    private readonly wires: SchematicWire[],
    private readonly currentOf: BranchCurrentLookup
  ) {}

  solve(): WireCurrentMap {
    if (!this.wires.length) return this.along;

    const pinRefs = new Map<string, PinRef>();
    for (const w of this.wires) {
      pinRefs.set(pinKey(w.a), w.a);
      pinRefs.set(pinKey(w.b), w.b);
    }

    const trySeed = (): boolean => {
      let changed = false;
      for (const w of this.wires) {
        if (this.along.has(w.id)) continue;
        const countA = wiresAtPin(this.wires, w.a).length;
        const countB = wiresAtPin(this.wires, w.b).length;
        const oa = pinInjectedOutflow(this.components, w.a, this.currentOf);
        const ob = pinInjectedOutflow(this.components, w.b, this.currentOf);

        if (countA === 1 && oa !== null) {
          const ca = componentOf(this.components, w.a.componentId);
          if (!(Math.abs(oa) < 1e-15 && ca && isPassiveNetNode(ca.modelKey))) {
            this.along.set(w.id, oa);
            changed = true;
            continue;
          }
        }
        if (countB === 1 && ob !== null) {
          const cb = componentOf(this.components, w.b.componentId);
          if (!(Math.abs(ob) < 1e-15 && cb && isPassiveNetNode(cb.modelKey))) {
            this.along.set(w.id, -ob);
            changed = true;
          }
        }
      }
      return changed;
    };

    const tryKcl = (): boolean => {
      let changed = false;
      for (const pin of pinRefs.values()) {
        const required = pinInjectedOutflow(this.components, pin, this.currentOf);
        if (required === null) continue;

        const ws = wiresAtPin(this.wires, pin);
        let knownLeaving = 0;
        const unknown: SchematicWire[] = [];
        for (const w of ws) {
          const i = this.along.get(w.id);
          if (i === undefined) {
            unknown.push(w);
            continue;
          }
          knownLeaving += leavingThroughWire(w, pin, i);
        }
        if (unknown.length !== 1) continue;

        const w = unknown[0]!;
        const needLeave = required - knownLeaving;
        const iAlong = pinKey(w.a) === pinKey(pin) ? needLeave : -needLeave;
        this.along.set(w.id, iAlong);
        changed = true;
      }
      return changed;
    };

    const tryDistributePassive = (): boolean => {
      let changed = false;
      for (const pin of pinRefs.values()) {
        const c = componentOf(this.components, pin.componentId);
        if (!c || !isPassiveNetNode(c.modelKey)) continue;

        const required = pinInjectedOutflow(this.components, pin, this.currentOf) ?? 0;
        const ws = wiresAtPin(this.wires, pin);
        let knownLeaving = 0;
        const unknown: SchematicWire[] = [];
        const knownMags: number[] = [];
        for (const w of ws) {
          const i = this.along.get(w.id);
          if (i === undefined) unknown.push(w);
          else {
            knownLeaving += leavingThroughWire(w, pin, i);
            if (Math.abs(i) > 1e-9) knownMags.push(Math.abs(i));
          }
        }
        if (unknown.length < 2) continue;
        if (unknown.length === ws.length) continue;

        const remainder = required - knownLeaving;
        const share = remainder / unknown.length;
        if (Math.abs(share) >= 1e-15) {
          for (const w of unknown) {
            if (this.along.has(w.id)) continue;
            const iAlong = pinKey(w.a) === pinKey(pin) ? share : -share;
            this.along.set(w.id, iAlong);
            changed = true;
          }
          continue;
        }

        // High-Z device stubs (e.g. 555 thr/trig): mirror sibling wire flow for teaching visuals.
        const knownWire = ws.find((w) => this.along.has(w.id));
        if (!knownWire || !knownMags.length) continue;
        const knownI = this.along.get(knownWire.id)!;
        const sign = leavingThroughWire(knownWire, pin, knownI) >= 0 ? 1 : -1;
        const stubMag = knownMags.reduce((a, b) => a + b, 0) / knownMags.length;
        if (stubMag < 1e-9) continue;
        for (const w of unknown) {
          if (this.along.has(w.id)) continue;
          const other = pinKey(w.a) === pinKey(pin) ? w.b : w.a;
          const oc = componentOf(this.components, other.componentId);
          if (!oc || isPinCurrentModeled(oc.modelKey, other.pin)) continue;
          const iAlong = (pinKey(w.a) === pinKey(pin) ? 1 : -1) * sign * stubMag;
          this.along.set(w.id, iAlong);
          changed = true;
        }
      }
      return changed;
    };

    const maxIter = this.wires.length * 4 + 12;
    for (let n = 0; n < maxIter; n++) {
      const a = trySeed();
      const b = tryKcl();
      const c = tryDistributePassive();
      if (!a && !b && !c) break;
    }

    const hint = seriesCurrentHint(this.components, this.currentOf);
    const supplyHint = supplyCurrentHint(this.components, this.currentOf);
    for (const w of this.wires) {
      if (this.along.has(w.id)) continue;
      const ca = componentOf(this.components, w.a.componentId);
      const cb = componentOf(this.components, w.b.componentId);
      const ia = ca ? hintForComponent(ca, this.components, this.currentOf) : null;
      const ib = cb ? hintForComponent(cb, this.components, this.currentOf) : null;

      let i = wireCurrentAtoB(ca?.modelKey, w.a.pin, ia, cb?.modelKey, w.b.pin, ib);
      if (Math.abs(i) < 1e-12 && hint != null) {
        const mag = Math.abs(hint);
        const countA = wiresAtPin(this.wires, w.a).length;
        const countB = wiresAtPin(this.wires, w.b).length;
        if (countA === 1 && ca && !isPassiveNetNode(ca.modelKey)) {
          const hi = hintForComponent(ca, this.components, this.currentOf) ?? mag;
          i = pinOutflowAmps(ca.modelKey, w.a.pin, hi);
        } else if (countB === 1 && cb && !isPassiveNetNode(cb.modelKey)) {
          const hi = hintForComponent(cb, this.components, this.currentOf) ?? mag;
          i = -pinOutflowAmps(cb.modelKey, w.b.pin, hi);
        } else if (ca?.modelKey === 'battery' && typeof supplyHint === 'number') {
          i = pinOutflowAmps('battery', w.a.pin, supplyHint);
        } else if (cb?.modelKey === 'battery' && typeof supplyHint === 'number') {
          i = -pinOutflowAmps('battery', w.b.pin, supplyHint);
        } else {
          i = wireCurrentAtoB(ca?.modelKey, w.a.pin, mag, cb?.modelKey, w.b.pin, mag);
        }
      }
      if (Math.abs(i) > 1e-15) this.along.set(w.id, i);
    }

    return this.along;
  }
}
