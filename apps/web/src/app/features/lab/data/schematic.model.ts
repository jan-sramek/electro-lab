import { SYMBOL_LIBRARY, simModelOf, symbolOf } from './symbol-library';
import { symbolDisplayScale } from './symbol-scale';

export interface SchematicPin {
  net: string;
  ox: number;
  oy: number;
}

export interface SchematicComponent {
  id: string;
  modelKey: string;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  params: Record<string, number | boolean>;
  pins: Record<string, SchematicPin>;
}

export interface PinRef {
  componentId: string;
  pin: string;
}

export interface SchematicWire {
  id: string;
  a: PinRef;
  b: PinRef;
  /** Optional absolute world elbows for manual wire routing. */
  waypoints?: { x: number; y: number }[];
}

export interface SchematicDocument {
  groundNet: string;
  components: SchematicComponent[];
  wires: SchematicWire[];
}

export type EditorTool = 'select' | 'wire' | 'probe' | 'place';
export type AnalysisMode = 'dcOp' | 'tran' | 'ac';

let idSeq = 1;
export function nextId(prefix: string): string {
  return `${prefix}${idSeq++}`;
}

export function resetIdSeq(n = 1): void {
  idSeq = n;
}

export function pinKey(ref: PinRef): string {
  return `${ref.componentId}:${ref.pin}`;
}

/** Read a numeric schematic param (params are number | boolean — index access does not narrow). */
export function paramNumber(
  params: Record<string, number | boolean>,
  key: string,
  fallback: number
): number {
  const v = params[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

/** Read a boolean schematic param. */
export function paramBool(
  params: Record<string, number | boolean>,
  key: string,
  fallback = false
): boolean {
  const v = params[key];
  return typeof v === 'boolean' ? v : fallback;
}

/** Read a numeric schematic param when present; null if missing or non-numeric. */
export function paramNumberOrNull(
  params: Record<string, number | boolean>,
  key: string
): number | null {
  const v = params[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/**
 * Match SVG rotate() with y-down coordinates (positive angle = clockwise).
 * Clockwise 90: (x,y) → (-y, x)
 */
export function rotateOffset(
  ox: number,
  oy: number,
  rotation: 0 | 90 | 180 | 270
): { ox: number; oy: number } {
  switch (rotation) {
    case 90:
      return { ox: -oy, oy: ox };
    case 180:
      return { ox: -ox, oy: -oy };
    case 270:
      return { ox: oy, oy: -ox };
    default:
      return { ox, oy };
  }
}

export function pinWorldPos(
  c: SchematicComponent,
  pinName: string
): { x: number; y: number } | null {
  const pin = c.pins[pinName];
  if (!pin) return null;
  const s = symbolDisplayScale(c.modelKey);
  const r = rotateOffset(pin.ox * s, pin.oy * s, c.rotation);
  return { x: c.x + r.ox, y: c.y + r.oy };
}

/** Orthogonal (HV/VH) polyline for pin-to-pin wires (legacy helper; prefer wire-routing). */
export function orthogonalPolyline(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { x: number; y: number }[] {
  if (x1 === x2 || y1 === y2) {
    return [
      { x: x1, y: y1 },
      { x: x2, y: y2 }
    ];
  }
  // Prefer horizontal-then-vertical when |dx| >= |dy|
  if (Math.abs(x2 - x1) >= Math.abs(y2 - y1)) {
    return [
      { x: x1, y: y1 },
      { x: x2, y: y1 },
      { x: x2, y: y2 }
    ];
  }
  return [
    { x: x1, y: y1 },
    { x: x1, y: y2 },
    { x: x2, y: y2 }
  ];
}

export function polylineToPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

export function createComponent(
  modelKey: string,
  x: number,
  y: number,
  id?: string
): SchematicComponent {
  const def = symbolOf(modelKey);
  const pins: Record<string, SchematicPin> = {};
  for (const p of def.pins) {
    pins[p.name] = { net: '', ox: p.ox, oy: p.oy };
  }
  const sim = simModelOf(def.modelKey);
  const prefix =
    sim === 'battery'
      ? 'V'
      : sim === 'resistor'
        ? 'R'
        : sim === 'led' || sim === 'diode'
          ? 'D'
          : sim === 'switch'
            ? 'S'
            : sim === 'ldr'
              ? 'LDR'
              : sim === 'buzzer'
                ? 'BZ'
                : sim === 'dc_motor'
                  ? 'MOT'
                  : sim === 'arduino_dio'
                    ? 'DIO'
                    : sim === 'current_source'
              ? 'I'
              : sim === 'capacitor'
                ? 'C'
                : sim === 'inductor'
                  ? 'L'
                  : sim === 'potentiometer'
                    ? 'POT'
                    : sim === 'pulse_source'
                      ? 'VP'
                      : sim === 'bjt_npn'
                        ? 'Q'
                        : sim === 'nmos'
                          ? 'M'
                          : sim === 'ne555'
                            ? 'U'
                            : sim === 'relay'
                              ? 'K'
                              : sim === 'op_amp'
                                ? 'U'
                                : sim === 'ammeter'
                                  ? 'AM'
                                  : sim === 'voltmeter'
                                    ? 'VM'
                                    : sim === 'ac_source'
                                      ? 'AC'
                                      : def.modelKey === 'ground'
                                        ? 'GND'
                                        : def.modelKey === 'junction'
                                          ? 'J'
                                          : 'X';
  return {
    id: id ?? nextId(prefix),
    modelKey: def.modelKey,
    x,
    y,
    rotation: 0,
    params: { ...def.defaultParams },
    pins
  };
}

/** Union-find net assignment from wires + ground symbols. */
export function assignNets(doc: SchematicDocument): SchematicDocument {
  const parent = new Map<string, string>();

  const find = (k: string): string => {
    let p = parent.get(k) ?? k;
    if (!parent.has(k)) parent.set(k, k);
    while (parent.get(p) !== p) {
      const grand = parent.get(p)!;
      parent.set(p, parent.get(grand) ?? grand);
      p = parent.get(p)!;
    }
    return p;
  };

  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  for (const c of doc.components) {
    for (const pinName of Object.keys(c.pins)) {
      find(pinKey({ componentId: c.id, pin: pinName }));
    }
  }

  for (const w of doc.wires) {
    union(pinKey(w.a), pinKey(w.b));
  }

  const groundRoots = new Set<string>();
  for (const c of doc.components) {
    if (c.modelKey !== 'ground') continue;
    for (const pinName of Object.keys(c.pins)) {
      groundRoots.add(find(pinKey({ componentId: c.id, pin: pinName })));
    }
  }

  const rootToNet = new Map<string, string>();
  let n = 0;
  for (const c of doc.components) {
    for (const pinName of Object.keys(c.pins)) {
      const root = find(pinKey({ componentId: c.id, pin: pinName }));
      if (rootToNet.has(root)) continue;
      if (groundRoots.has(root)) {
        rootToNet.set(root, doc.groundNet);
      } else {
        rootToNet.set(root, `n${n++}`);
      }
    }
  }

  return {
    ...doc,
    components: doc.components.map((c) => ({
      ...c,
      pins: Object.fromEntries(
        Object.entries(c.pins).map(([name, pin]) => {
          const root = find(pinKey({ componentId: c.id, pin: name }));
          return [name, { ...pin, net: rootToNet.get(root) ?? doc.groundNet }];
        })
      )
    })),
    wires: doc.wires.map((w) => ({ ...w }))
  };
}

export function compileNetlist(doc: SchematicDocument) {
  const nettled = assignNets(doc);
  return {
    ground: nettled.groundNet,
    elements: nettled.components
      .filter((c) => !SYMBOL_LIBRARY[c.modelKey]?.schematicOnly)
      .map((c) => {
        const pins: Record<string, string> = {};
        for (const [name, pin] of Object.entries(c.pins)) {
          pins[name] = pin.net;
        }
        return {
          id: c.id,
          model: simModelOf(c.modelKey),
          pins,
          params: Object.fromEntries(
            Object.entries(c.params).filter(([key]) => key !== 'color')
          )
        };
      })
  };
}

export function cloneDoc(doc: SchematicDocument): SchematicDocument {
  return structuredClone(doc);
}

export function emptyDocument(): SchematicDocument {
  return { groundNet: 'gnd', components: [], wires: [] };
}

export function snap(value: number, grid = 10): number {
  return Math.round(value / grid) * grid;
}

/** Distance from point to segment AB. */
export function distPointToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-12) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/** Closest point on orthogonal polyline to (px,py); null if farther than maxDist. */
export function closestPointOnOrthogonalWire(
  px: number,
  py: number,
  pts: { x: number; y: number }[],
  maxDist = 8
): { x: number; y: number } | null {
  let best: { x: number; y: number; d: number } | null = null;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const d = distPointToSegment(px, py, a.x, a.y, b.x, b.y);
    if (d > maxDist) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    let t = len2 < 1e-12 ? 0 : ((px - a.x) * dx + (py - a.y) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const x = a.x + t * dx;
    const y = a.y + t * dy;
    if (!best || d < best.d) best = { x, y, d };
  }
  return best ? { x: snap(best.x), y: snap(best.y) } : null;
}

/** Split wire at junction: replace one wire with two pin→junction wires. */
export function splitWireAtJunction(
  doc: SchematicDocument,
  wireId: string,
  junctionId: string
): SchematicDocument {
  const wire = doc.wires.find((w) => w.id === wireId);
  if (!wire) return doc;
  const jRef: PinRef = { componentId: junctionId, pin: 'j' };
  return {
    ...doc,
    wires: [
      ...doc.wires.filter((w) => w.id !== wireId),
      { id: `${wireId}a`, a: wire.a, b: jRef },
      { id: `${wireId}b`, a: jRef, b: wire.b }
    ]
  };
}

/** Extract element ids referenced in engine error/warning strings (`V1: ...`). */
export function parseHighlightedIds(messages: string[]): string[] {
  const ids = new Set<string>();
  for (const msg of messages) {
    const m = /^([A-Za-z][A-Za-z0-9_]*)\s*:/.exec(msg.trim());
    if (m) ids.add(m[1]);
  }
  return [...ids];
}
