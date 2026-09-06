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
      // Engine branch = contact current; the coil is handled by relayCoilOutflowAmps.
      if (pin === 'a') return -branchI;
      if (pin === 'b') return branchI;
      return 0;
    case 'diode':
    case 'led':
    case 'zener':
    case 'buzzer':
      if (pin === 'a') return -branchI;
      if (pin === 'c') return branchI;
      return 0;
    case 'fuse':
      if (pin === 'a') return -branchI;
      if (pin === 'b') return branchI;
      return 0;
    case 'vreg_7805':
      if (pin === 'out') return branchI;
      if (pin === 'in') return -branchI;
      if (pin === 'gnd') return 0;
      return 0;
    case 'battery':
    case 'pulse_source':
    case 'ac_source':
    case 'arduino_dio':
      if (pin === 'p' || pin === 'sig') return branchI;
      if (pin === 'n' || pin === 'gnd') return -branchI;
      return 0;
    case 'arduino_i2c':
      if (pin === 'v5') return branchI;
      if (pin === 'gnd') return -branchI;
      return 0;
    case 'ssd1306':
      if (pin === 'vcc') return -branchI;
      if (pin === 'gnd') return branchI;
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
      return 0;
    default:
      return 0;
  }
}

/**
 * The engine reports only the relay *contact* current as the relay's branch. The coil
 * current is derived by the canvas (V_cp − V_cn) / rCoil and served through the same
 * lookup under `<relayId>:coil`, so the coil wires get a real direction and magnitude.
 */
export const RELAY_COIL_SUFFIX = ':coil';

export function isRelayCoilPin(modelKey: string, pin: string): boolean {
  return simModelOf(modelKey) === 'relay' && (pin === 'cp' || pin === 'cn');
}

/** Conventional current leaving a relay coil pin for a given coil current (flows in at cp). */
export function relayCoilOutflowAmps(pin: string, coilI: number): number {
  if (pin === 'cp') return -coilI;
  if (pin === 'cn') return coilI;
  return 0;
}

/** Branch current relevant to one pin (relay coil pins use the derived coil current). */
function pinBranchCurrent(
  c: SchematicComponent,
  pin: string,
  currentOf: BranchCurrentLookup
): number | null {
  const i = isRelayCoilPin(c.modelKey, pin)
    ? currentOf(c.id + RELAY_COIL_SUFFIX)
    : currentOf(c.id);
  return typeof i === 'number' ? i : null;
}

/** Outflow from a device pin given the lookup, or null when the pin carries no modeled current. */
function pinOutflowFor(
  c: SchematicComponent,
  pin: string,
  currentOf: BranchCurrentLookup
): number | null {
  if (isRelayCoilPin(c.modelKey, pin)) {
    const coil = pinBranchCurrent(c, pin, currentOf);
    return coil === null ? null : relayCoilOutflowAmps(pin, coil);
  }
  if (!isPinCurrentModeled(c.modelKey, pin)) return null;
  const i = currentOf(c.id);
  return typeof i === 'number' ? pinOutflowAmps(c.modelKey, pin, i) : null;
}

/** True when branch current maps to a pin's wire outflow (false → KCL treats pin as pass-through). */
export function isPinCurrentModeled(modelKey: string, pin: string): boolean {
  if (modelKey === 'ground' || modelKey === 'junction' || modelKey === 'voltmeter') return false;
  switch (simModelOf(modelKey)) {
    case 'ne555':
      return pin === 'out';
    case 'op_amp':
      return pin === 'out';
    case 'vreg_7805':
      // The engine reports no quiescent current, so the gnd pin is a teaching stub.
      return pin === 'in' || pin === 'out';
    case 'nmos':
      return pin === 'd' || pin === 's';
    case 'arduino_dio':
      return pin === 'sig' || pin === 'gnd';
    case 'arduino_i2c':
      return pin === 'v5' || pin === 'gnd';
    case 'ssd1306':
      return pin === 'vcc' || pin === 'gnd';
    case 'bjt_npn':
      return pin === 'c' || pin === 'e';
    case 'relay':
      return pin === 'a' || pin === 'b';
    case 'potentiometer':
      return pin === 'a' || pin === 'b';
    default:
      return true;
  }
}

function isBjtBasePin(modelKey: string, pin: string): boolean {
  return simModelOf(modelKey) === 'bjt_npn' && pin === 'b';
}

/** Pot wiper stub when a/b already carries branch current (rheostat tie to b). */
function isPotWiperWithEndFlow(
  pot: SchematicComponent,
  pin: string,
  wires: SchematicWire[],
  along: Map<string, number>
): boolean {
  if (simModelOf(pot.modelKey) !== 'potentiometer' || pin !== 'w') return false;
  for (const w of wires) {
    const i = along.get(w.id);
    if (i === undefined || Math.abs(i) < 1e-12) continue;
    for (const end of [w.a, w.b]) {
      if (end.componentId === pot.id && (end.pin === 'a' || end.pin === 'b')) return true;
    }
  }
  return false;
}

function isPassiveNetNode(modelKey: string): boolean {
  return modelKey === 'ground' || modelKey === 'junction' || modelKey === 'voltmeter';
}

function isCapGroundWire(
  modelA: string | undefined,
  modelB: string | undefined
): boolean {
  return (
    (modelA === 'capacitor' && modelB === 'ground') ||
    (modelB === 'capacitor' && modelA === 'ground')
  );
}

/** Cap→ground return is for charging only; discharge uses the C↔load loop. */
function isCapGroundReturnAllowed(
  components: SchematicComponent[],
  currentOf: BranchCurrentLookup
): boolean {
  for (const c of components) {
    if (c.modelKey !== 'capacitor') continue;
    const i = currentOf(c.id);
    if (typeof i !== 'number') continue;
    if (i > 1e-9) return true;
    if (i < -1e-9) return false;
  }
  for (const c of components) {
    if (c.modelKey !== 'battery' && c.modelKey !== 'switch') continue;
    const i = currentOf(c.id);
    if (typeof i === 'number' && Math.abs(i) > 1e-9) return true;
  }
  return false;
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
  if (isPassiveNetNode(c.modelKey)) return 0;
  return pinOutflowFor(c, ref.pin, currentOf);
}

function leavingThroughWire(w: SchematicWire, pin: PinRef, iAlongAtoB: number): number {
  return pinKey(w.a) === pinKey(pin) ? iAlongAtoB : -iAlongAtoB;
}

/** Signed current along wire A→B from modeled pin outflows (pass-through pins contribute 0). */
export function wireCurrentAtoB(
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
  if (typeof direct === 'number') return direct;
  if (c.modelKey === 'battery') return supplyCurrentHint(components, currentOf);
  return seriesCurrentHint(components, currentOf);
}

function otherPin(w: SchematicWire, pin: PinRef): PinRef {
  return pinKey(w.a) === pinKey(pin) ? w.b : w.a;
}

function isUnmodeledDevicePin(c: SchematicComponent, pin: string): boolean {
  return !isPassiveNetNode(c.modelKey) && !isPinCurrentModeled(c.modelKey, pin);
}

/**
 * KCL wire-current field: seed leaf pins, close junctions (incl. star splits), hint fallback.
 */
export class WireCurrentField {
  private readonly along = new Map<string, number>();
  /**
   * Wires carrying a teaching-only visual (ground-symbol return, high-Z sensing
   * stubs) — no physical current, so KCL sums must ignore them or the fiction
   * gets "balanced" by a ghost current on a neighbouring rail.
   */
  private readonly visualOnly = new Set<string>();

  private leavingKcl(w: SchematicWire, pin: PinRef, iAlong: number): number {
    return this.visualOnly.has(w.id) ? 0 : leavingThroughWire(w, pin, iAlong);
  }

  constructor(
    private readonly components: SchematicComponent[],
    private readonly wires: SchematicWire[],
    private readonly currentOf: BranchCurrentLookup
  ) {}

  private assignWire(id: string, iAlong: number): boolean {
    if (Math.abs(iAlong) < 1e-15) return false;
    this.along.set(id, iAlong);
    return true;
  }

  /**
   * Record a wire whose current is known to be (about) zero from exact KCL, so
   * later passes treat it as solved instead of guessing a hint current for it.
   */
  private settleZero(id: string): boolean {
    if (this.along.has(id)) return false;
    this.along.set(id, 0);
    return true;
  }

  solve(): WireCurrentMap {
    if (!this.wires.length) return this.along;

    const explicitZero = (c: SchematicComponent | undefined): boolean => {
      if (!c) return false;
      const i = this.currentOf(c.id);
      return typeof i === 'number' && Math.abs(i) < 1e-15;
    };

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
            this.assignWire(w.id, oa);
            changed = true;
            continue;
          }
        }
        if (countB === 1 && ob !== null) {
          const cb = componentOf(this.components, w.b.componentId);
          if (!(Math.abs(ob) < 1e-15 && cb && isPassiveNetNode(cb.modelKey))) {
            if (this.assignWire(w.id, -ob)) changed = true;
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
          knownLeaving += this.leavingKcl(w, pin, i);
        }
        if (unknown.length !== 1) continue;

        const w = unknown[0]!;
        const other = otherPin(w, pin);
        const oc = componentOf(this.components, other.componentId);
        const pc = componentOf(this.components, pin.componentId);
        const atDevicePin = !!pc && !isPassiveNetNode(pc.modelKey);
        const towardSink = (oc && explicitZero(oc)) || oc?.modelKey === 'ground';
        // At a passive node, idle gate-drive / open sources must not absorb
        // ground-return residuals (boost PWM return shares the ground symbol
        // with the power path). At a modeled device pin the balance is exact:
        // whatever the pin's other wires do not carry must go down this one
        // (cap charging through the LED cathode's ground wire), and when they
        // carry all of it this wire is settled at zero (cap↔LED discharge loop).
        if (towardSink && !atDevicePin) continue;

        const needLeave = required - knownLeaving;
        if (towardSink) {
          let scale = Math.abs(required);
          for (const x of ws) scale = Math.max(scale, Math.abs(this.along.get(x.id) ?? 0));
          if (Math.abs(needLeave) < Math.max(1e-7, scale * 0.02)) {
            if (this.settleZero(w.id)) changed = true;
            continue;
          }
        }
        const iAlong = pinKey(w.a) === pinKey(pin) ? needLeave : -needLeave;
        if (this.assignWire(w.id, iAlong)) changed = true;
      }
      return changed;
    };

    /** Seed wires from a device terminal that already has a known branch current. */
    const tryDeviceTerminalWires = (): boolean => {
      let changed = false;
      for (const w of this.wires) {
        if (this.along.has(w.id)) continue;
        const assignFromPin = (pin: PinRef): boolean => {
          if (wiresAtPin(this.wires, pin).length !== 1) return false;
          const c = componentOf(this.components, pin.componentId);
          if (!c || isPassiveNetNode(c.modelKey)) return false;
          if (!isPinCurrentModeled(c.modelKey, pin.pin)) return false;
          const out = pinInjectedOutflow(this.components, pin, this.currentOf);
          if (out === null) return false;
          const iAlong = pinKey(w.a) === pinKey(pin) ? out : -out;
          return this.assignWire(w.id, iAlong);
        };
        if (assignFromPin(w.a) || assignFromPin(w.b)) changed = true;
      }
      return changed;
    };

    const dominantFeederLeaving = (pin: PinRef, ws: SchematicWire[]): number | null => {
      let best: number | null = null;
      for (const w of ws) {
        const i = this.along.get(w.id);
        if (i === undefined) continue;
        const other = otherPin(w, pin);
        const oc = componentOf(this.components, other.componentId);
        if (!oc || !isPinCurrentModeled(oc.modelKey, other.pin)) continue;
        const lv = this.leavingKcl(w, pin, i);
        if (best === null || Math.abs(lv) > Math.abs(best)) best = lv;
      }
      return best;
    };

    /**
     * At passive junctions, split current across parallel branches using simulated
     * branch magnitudes (not equal zero-share when KCL remainder is ~0).
     */
    const tryPassiveParallelSplit = (): boolean => {
      let changed = false;
      for (const pin of pinRefs.values()) {
        const c = componentOf(this.components, pin.componentId);
        if (!c || !isPassiveNetNode(c.modelKey)) continue;
        if (c.modelKey === 'ground') continue;

        const required = pinInjectedOutflow(this.components, pin, this.currentOf) ?? 0;
        const ws = wiresAtPin(this.wires, pin);
        let knownLeaving = 0;
        const unknown: SchematicWire[] = [];
        const knownMags: number[] = [];
        for (const w of ws) {
          const i = this.along.get(w.id);
          if (i === undefined) unknown.push(w);
          else {
            knownLeaving += this.leavingKcl(w, pin, i);
            if (Math.abs(i) > 1e-9) knownMags.push(Math.abs(i));
          }
        }
        if (!unknown.length) continue;
        const hasKnown = ws.some((w) => this.along.has(w.id));
        if (!hasKnown) continue;

        const remainder = required - knownLeaving;

        if (unknown.length === 1) {
          const w = unknown[0]!;
          const other = otherPin(w, pin);
          const oc = componentOf(this.components, other.componentId);
          if (oc && explicitZero(oc)) continue;
          if (oc?.modelKey === 'ground') continue;

          let iAlong = pinKey(w.a) === pinKey(pin) ? remainder : -remainder;

          if (
            oc &&
            isUnmodeledDevicePin(oc, other.pin) &&
            Math.abs(remainder) < 1e-12
          ) {
            const feed = dominantFeederLeaving(pin, ws.filter((x) => x.id !== w.id));
            if (feed !== null && Math.abs(feed) > 1e-12) {
              iAlong = pinKey(w.a) === pinKey(pin) ? feed : -feed;
            }
          }

          if (this.assignWire(w.id, iAlong)) changed = true;
          continue;
        }

        const weights: { w: SchematicWire; mag: number }[] = [];
        for (const w of unknown) {
          const other = otherPin(w, pin);
          const oc = componentOf(this.components, other.componentId);
          if (!oc) {
            weights.push({ w, mag: 0 });
            continue;
          }
          if (oc.modelKey === 'nmos' && other.pin === 'g') {
            weights.push({ w, mag: 0 });
            continue;
          }
          if (isBjtBasePin(oc.modelKey, other.pin)) {
            weights.push({ w, mag: 0 });
            continue;
          }
          const out = pinOutflowFor(oc, other.pin, this.currentOf);
          const mag = out === null ? 0 : Math.abs(out);
          weights.push({ w, mag });
        }
        const total = weights.reduce((s, x) => s + x.mag, 0);
        if (total >= 1e-15) {
          const sign = Math.abs(remainder) >= 1e-15 ? Math.sign(remainder) : Math.sign(-knownLeaving);
          const splitMag = Math.abs(remainder) >= 1e-15 ? Math.abs(remainder) : Math.abs(knownLeaving);
          for (const { w, mag } of weights) {
            if (this.along.has(w.id)) continue;
            const share = (mag / total) * splitMag;
            const iAlong = (pinKey(w.a) === pinKey(pin) ? 1 : -1) * sign * share;
            if (this.assignWire(w.id, iAlong)) changed = true;
          }
          continue;
        }

        // High-Z stubs (555 thr/trig, pot wiper): mirror sibling flow for teaching visuals.
        const knownWire = ws.find((w) => this.along.has(w.id));
        if (!knownWire || !knownMags.length || unknown.length < 2) continue;
        const knownI = this.along.get(knownWire.id)!;
        const sign = leavingThroughWire(knownWire, pin, knownI) >= 0 ? 1 : -1;
        const stubMag = knownMags.reduce((a, b) => a + b, 0) / knownMags.length;
        if (stubMag < 1e-9) continue;
        for (const w of unknown) {
          if (this.along.has(w.id)) continue;
          const other = otherPin(w, pin);
          const oc = componentOf(this.components, other.componentId);
          if (!oc || isPinCurrentModeled(oc.modelKey, other.pin)) continue;
          if (isRelayCoilPin(oc.modelKey, other.pin) && pinBranchCurrent(oc, other.pin, this.currentOf) !== null) continue;
          // A wire to another junction is a rail, not a high-Z stub: mirroring a
          // sibling current onto it breaks KCL at that junction (bridge rectifier
          // idle leg lit up with the conducting leg's current).
          if (oc.modelKey === 'junction') continue;
          if (oc.modelKey === 'ground') {
            // Ground stub: the exact KCL remainder when the node has one (shared
            // coil + contact return), else the teaching return visual — flow
            // toward the ground symbol with the sibling magnitude.
            const real = Math.abs(remainder) > 1e-9;
            const leave = real ? remainder : stubMag;
            const iAlong = (pinKey(w.a) === pinKey(pin) ? 1 : -1) * leave;
            if (this.assignWire(w.id, iAlong)) {
              changed = true;
              if (!real) this.visualOnly.add(w.id);
            }
            continue;
          }
          if (explicitZero(oc)) continue;
          if (oc.modelKey === 'voltmeter') continue;
          if (oc.modelKey === 'nmos' && other.pin === 'g') continue;
          if (isBjtBasePin(oc.modelKey, other.pin)) continue;
          // Rheostat: a/b already seeded — don't double-count the tied wiper stub.
          if (isPotWiperWithEndFlow(oc, other.pin, this.wires, this.along)) continue;
          const iAlong = (pinKey(w.a) === pinKey(pin) ? 1 : -1) * sign * stubMag;
          if (this.assignWire(w.id, iAlong)) {
            changed = true;
            this.visualOnly.add(w.id);
          }
        }
      }
      return changed;
    };

    /** Close return paths into ground symbols when ground has exactly one feeder wire. */
    const tryGroundReturns = (): boolean => {
      let changed = false;
      for (const pin of pinRefs.values()) {
        const c = componentOf(this.components, pin.componentId);
        if (!c || c.modelKey !== 'ground') continue;

        const ws = wiresAtPin(this.wires, pin);
        if (ws.length !== 2) continue;

        let knownLeaving = 0;
        const unknown: SchematicWire[] = [];
        for (const w of ws) {
          const i = this.along.get(w.id);
          if (i === undefined) unknown.push(w);
          else knownLeaving += this.leavingKcl(w, pin, i);
        }
        if (unknown.length !== 1) continue;
        const w = unknown[0]!;
        const other = otherPin(w, pin);
        const oc = componentOf(this.components, other.componentId);
        if (oc && explicitZero(oc)) continue;
        const needLeave = -knownLeaving;
        const iAlong = pinKey(w.a) === pinKey(pin) ? needLeave : -needLeave;
        if (this.assignWire(w.id, iAlong)) changed = true;
      }
      return changed;
    };

    /** Fix wires to high-Z inputs that were zeroed by junction cancellation. */
    const tryReviseZeroedUnmodeledFeeds = (): boolean => {
      let changed = false;
      for (const w of this.wires) {
        const i = this.along.get(w.id);
        if (i !== undefined && Math.abs(i) >= 1e-12) continue;

        for (const pin of [w.a, w.b]) {
          const oc = componentOf(this.components, pin.componentId);
          if (!oc || !isUnmodeledDevicePin(oc, pin.pin)) continue;
          if (oc.modelKey === 'voltmeter') continue;
          if (isPotWiperWithEndFlow(oc, pin.pin, this.wires, this.along)) continue;

          const jc = componentOf(this.components, otherPin(w, pin).componentId);
          if (!jc || !isPassiveNetNode(jc.modelKey)) continue;

          const jPin = otherPin(w, pin);
          const ws = wiresAtPin(this.wires, jPin);
          const feed = dominantFeederLeaving(jPin, ws.filter((x) => x.id !== w.id));
          if (feed === null || Math.abs(feed) < 1e-12) continue;

          const iAlong = pinKey(w.a) === pinKey(jPin) ? feed : -feed;
          if (this.assignWire(w.id, iAlong)) changed = true;
          break;
        }
      }
      return changed;
    };

    /** Close junction → ground stubs once the return bus has known feeders. */
    const tryGroundStubClosure = (): boolean => {
      let changed = false;
      for (const w of this.wires) {
        if (this.along.has(w.id)) continue;
        for (const gndPin of [w.a, w.b]) {
          const gc = componentOf(this.components, gndPin.componentId);
          if (!gc || gc.modelKey !== 'ground') continue;
          const jPin = pinKey(gndPin) === pinKey(w.a) ? w.b : w.a;
          const jc = componentOf(this.components, jPin.componentId);
          if (!jc || !isPassiveNetNode(jc.modelKey)) continue;

          const ws = wiresAtPin(this.wires, jPin).filter((x) => x.id !== w.id);
          let sumLeaving = 0;
          let anyKnown = false;
          for (const jw of ws) {
            const ji = this.along.get(jw.id);
            if (ji === undefined) continue;
            anyKnown = true;
            sumLeaving += this.leavingKcl(jw, jPin, ji);
          }
          if (!anyKnown) continue;
          const needLeave = -sumLeaving;
          const iAlong = pinKey(w.a) === pinKey(jPin) ? needLeave : -needLeave;
          if (this.assignWire(w.id, iAlong)) changed = true;
          break;
        }
      }
      return changed;
    };

    /** Split remaining outflow across multiple wires at a modeled device pin (e.g. C.b → gnd + LED). */
    const tryMultiWireModeledPin = (): boolean => {
      let changed = false;
      for (const pin of pinRefs.values()) {
        const c = componentOf(this.components, pin.componentId);
        if (!c || isPassiveNetNode(c.modelKey)) continue;
        if (!isPinCurrentModeled(c.modelKey, pin.pin)) continue;
        const required = pinInjectedOutflow(this.components, pin, this.currentOf);
        if (required === null || Math.abs(required) < 1e-15) continue;

        const ws = wiresAtPin(this.wires, pin);
        const unknown = ws.filter((w) => !this.along.has(w.id));
        if (unknown.length < 2) continue;

        let knownLeaving = 0;
        for (const w of ws) {
          const i = this.along.get(w.id);
          if (i !== undefined) knownLeaving += this.leavingKcl(w, pin, i);
        }
        const remainder = required - knownLeaving;

        const weights: { w: SchematicWire; mag: number }[] = [];
        for (const w of unknown) {
          const other = otherPin(w, pin);
          const oc = componentOf(this.components, other.componentId);
          if (!oc) {
            weights.push({ w, mag: 0 });
            continue;
          }
          if (oc.modelKey === 'ground') {
            const allowGnd =
              required > 1e-9 && isCapGroundReturnAllowed(this.components, this.currentOf);
            weights.push({ w, mag: allowGnd ? Math.abs(required) : 0 });
            continue;
          }
          const out = pinOutflowFor(oc, other.pin, this.currentOf);
          const mag = out === null ? 0 : Math.abs(out);
          weights.push({ w, mag });
        }

        const total = weights.reduce((s, x) => s + x.mag, 0);
        if (total < 1e-15) continue;

        const splitMag = Math.abs(remainder) >= 1e-15 ? Math.abs(remainder) : total;
        const sign = Math.abs(remainder) >= 1e-15 ? Math.sign(remainder) : Math.sign(required);
        for (const { w, mag } of weights) {
          if (this.along.has(w.id)) continue;
          const share = (mag / total) * splitMag;
          const iAlong = (pinKey(w.a) === pinKey(pin) ? 1 : -1) * sign * share;
          if (this.assignWire(w.id, iAlong)) changed = true;
        }
      }
      return changed;
    };

    const maxIter = this.wires.length * 4 + 12;
    for (let n = 0; n < maxIter; n++) {
      const a = trySeed();
      const b = tryDeviceTerminalWires();
      const c = tryKcl();
      const d = tryPassiveParallelSplit();
      const e = tryGroundReturns();
      const f = tryGroundStubClosure();
      const g = tryMultiWireModeledPin();
      if (!a && !b && !c && !d && !e && !f && !g) break;
    }
    tryReviseZeroedUnmodeledFeeds();

    for (let pass = 0; pass < 3; pass++) tryGroundStubClosure();

    const hint = seriesCurrentHint(this.components, this.currentOf);
    const supplyHint = supplyCurrentHint(this.components, this.currentOf);
    for (const w of this.wires) {
      if (this.along.has(w.id)) continue;
      const ca = componentOf(this.components, w.a.componentId);
      const cb = componentOf(this.components, w.b.componentId);
      if (explicitZero(ca) && explicitZero(cb)) continue;

      const ia = ca ? hintForComponent(ca, this.components, this.currentOf) : null;
      const ib = cb ? hintForComponent(cb, this.components, this.currentOf) : null;

      let i = wireCurrentAtoB(ca?.modelKey, w.a.pin, ia, cb?.modelKey, w.b.pin, ib);
      if (
        isCapGroundWire(ca?.modelKey, cb?.modelKey) &&
        !isCapGroundReturnAllowed(this.components, this.currentOf)
      ) {
        continue;
      }
      if (Math.abs(i) < 1e-12 && hint != null) {
        const mag = Math.abs(hint);
        const countA = wiresAtPin(this.wires, w.a).length;
        const countB = wiresAtPin(this.wires, w.b).length;

        if (countA === 1 && ca && !isPassiveNetNode(ca.modelKey) && !explicitZero(ca)) {
          if (!isPinCurrentModeled(ca.modelKey, w.a.pin)) continue;
          const hi = hintForComponent(ca, this.components, this.currentOf) ?? mag;
          i = pinOutflowAmps(ca.modelKey, w.a.pin, hi);
        } else if (countB === 1 && cb && !isPassiveNetNode(cb.modelKey) && !explicitZero(cb)) {
          if (!isPinCurrentModeled(cb.modelKey, w.b.pin)) continue;
          const hi = hintForComponent(cb, this.components, this.currentOf) ?? mag;
          i = -pinOutflowAmps(cb.modelKey, w.b.pin, hi);
        } else if (ca?.modelKey === 'battery' && typeof supplyHint === 'number' && !explicitZero(ca)) {
          i = pinOutflowAmps('battery', w.a.pin, supplyHint);
        } else if (cb?.modelKey === 'battery' && typeof supplyHint === 'number' && !explicitZero(cb)) {
          i = -pinOutflowAmps('battery', w.b.pin, supplyHint);
        } else if (
          ca &&
          isPassiveNetNode(ca.modelKey) &&
          cb &&
          !isPassiveNetNode(cb.modelKey) &&
          !explicitZero(cb) &&
          isPinCurrentModeled(cb.modelKey, w.b.pin)
        ) {
          const hi = hintForComponent(cb, this.components, this.currentOf) ?? mag;
          i = isPinCurrentModeled(cb.modelKey, w.b.pin)
            ? -pinOutflowAmps(cb.modelKey, w.b.pin, hi)
            : -mag;
        } else if (
          cb &&
          isPassiveNetNode(cb.modelKey) &&
          ca &&
          !isPassiveNetNode(ca.modelKey) &&
          !explicitZero(ca) &&
          isPinCurrentModeled(ca.modelKey, w.a.pin)
        ) {
          const hi = hintForComponent(ca, this.components, this.currentOf) ?? mag;
          if (Math.abs(hi) < 1e-15) continue;
          i = isPinCurrentModeled(ca.modelKey, w.a.pin)
            ? pinOutflowAmps(ca.modelKey, w.a.pin, hi)
            : mag;
        }
      }
      if (Math.abs(i) > 1e-15) this.assignWire(w.id, i);
    }

    return this.along;
  }
}
