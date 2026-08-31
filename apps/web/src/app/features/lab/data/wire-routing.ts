import { SchematicComponent, SchematicDocument, SchematicWire, snap } from './schematic.model';
import { symbolDisplayScale } from './symbol-scale';
import { SYMBOL_LIBRARY } from './symbol-library';

export interface Point {
  x: number;
  y: number;
}

export { SYMBOL_DISPLAY_SCALE, symbolDisplayScale } from './symbol-scale';

/**
 * Direction-aware orthogonal route between two points.
 * Prefer leaving along preferred exit axes when provided (pin outward normals).
 * Optional midpoints force the path through user-dragged elbows (snapped).
 */
export function routeOrthogonal(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  opts?: {
    exitA?: Point | null;
    exitB?: Point | null;
    midpoints?: Point[] | null;
  }
): Point[] {
  const mids = (opts?.midpoints ?? []).map((p) => ({ x: snap(p.x), y: snap(p.y) }));
  if (mids.length) {
    const pts: Point[] = [{ x: x1, y: y1 }];
    let cx = x1;
    let cy = y1;
    for (const m of mids) {
      pts.push(...elbow(cx, cy, m.x, m.y).slice(1));
      cx = m.x;
      cy = m.y;
    }
    pts.push(...elbow(cx, cy, x2, y2).slice(1));
    return dedupePoints(pts);
  }

  const exitA = opts?.exitA;
  const exitB = opts?.exitB;
  const stub = 8;

  let ax = x1;
  let ay = y1;
  let bx = x2;
  let by = y2;
  const head: Point[] = [{ x: x1, y: y1 }];
  const tail: Point[] = [];

  if (exitA && (exitA.x !== 0 || exitA.y !== 0)) {
    const len = Math.hypot(exitA.x, exitA.y) || 1;
    ax = snap(x1 + (exitA.x / len) * stub);
    ay = snap(y1 + (exitA.y / len) * stub);
    if (ax !== x1 || ay !== y1) head.push({ x: ax, y: ay });
  }
  if (exitB && (exitB.x !== 0 || exitB.y !== 0)) {
    const len = Math.hypot(exitB.x, exitB.y) || 1;
    bx = snap(x2 + (exitB.x / len) * stub);
    by = snap(y2 + (exitB.y / len) * stub);
    if (bx !== x2 || by !== y2) tail.unshift({ x: bx, y: by });
  }
  tail.push({ x: x2, y: y2 });

  const mid = pickBetterElbow(ax, ay, bx, by);
  return dedupePoints([...head, ...mid.slice(1, -1), ...tail]);
}

function pickBetterElbow(x1: number, y1: number, x2: number, y2: number): Point[] {
  if (x1 === x2 || y1 === y2) {
    return [
      { x: x1, y: y1 },
      { x: x2, y: y2 }
    ];
  }
  const hv = [
    { x: x1, y: y1 },
    { x: x2, y: y1 },
    { x: x2, y: y2 }
  ];
  const vh = [
    { x: x1, y: y1 },
    { x: x1, y: y2 },
    { x: x2, y: y2 }
  ];
  return Math.abs(x2 - x1) >= Math.abs(y2 - y1) ? hv : vh;
}

function elbow(x1: number, y1: number, x2: number, y2: number): Point[] {
  return pickBetterElbow(x1, y1, x2, y2);
}

function dedupePoints(pts: Point[]): Point[] {
  const out: Point[] = [];
  for (const p of pts) {
    const last = out[out.length - 1];
    if (last && last.x === p.x && last.y === p.y) continue;
    out.push(p);
  }
  const clean: Point[] = [];
  for (let i = 0; i < out.length; i++) {
    const a = clean[clean.length - 1];
    const b = out[i]!;
    const c = out[i + 1];
    if (a && c && ((a.x === b.x && b.x === c.x) || (a.y === b.y && b.y === c.y))) {
      continue;
    }
    clean.push(b);
  }
  return clean;
}

/** World-space pin outward direction (from body toward pin tip). */
export function pinExitDirection(c: SchematicComponent, pinName: string): Point | null {
  const pin = c.pins[pinName];
  if (!pin) return null;
  const s = symbolDisplayScale(c.modelKey);
  const ox = pin.ox * s;
  const oy = pin.oy * s;
  let rx = ox;
  let ry = oy;
  switch (c.rotation) {
    case 90:
      rx = -oy;
      ry = ox;
      break;
    case 180:
      rx = -ox;
      ry = -oy;
      break;
    case 270:
      rx = oy;
      ry = -ox;
      break;
  }
  return { x: rx, y: ry };
}

export function wirePolyline(doc: SchematicDocument, wire: SchematicWire): Point[] {
  const ca = doc.components.find((c) => c.id === wire.a.componentId);
  const cb = doc.components.find((c) => c.id === wire.b.componentId);
  if (!ca || !cb) return [];
  const a = scaledPinWorldPos(ca, wire.a.pin);
  const b = scaledPinWorldPos(cb, wire.b.pin);
  if (!a || !b) return [];
  return routeOrthogonal(a.x, a.y, b.x, b.y, {
    exitA: pinExitDirection(ca, wire.a.pin),
    exitB: pinExitDirection(cb, wire.b.pin),
    midpoints: wire.waypoints ?? null
  });
}

export function scaledPinWorldPos(
  c: SchematicComponent,
  pinName: string
): Point | null {
  const pin = c.pins[pinName];
  if (!pin) return null;
  const s = symbolDisplayScale(c.modelKey);
  const ox = pin.ox * s;
  const oy = pin.oy * s;
  let rx = ox;
  let ry = oy;
  switch (c.rotation) {
    case 90:
      rx = -oy;
      ry = ox;
      break;
    case 180:
      rx = -ox;
      ry = -oy;
      break;
    case 270:
      rx = oy;
      ry = -ox;
      break;
  }
  return { x: c.x + rx, y: c.y + ry };
}

export function symbolDisplaySize(modelKey: string): { width: number; height: number } {
  const def = SYMBOL_LIBRARY[modelKey];
  const s = symbolDisplayScale(modelKey);
  return {
    width: (def?.width ?? 40) * s,
    height: (def?.height ?? 40) * s
  };
}

/** Set the single teaching waypoint used when dragging a wire (absolute world coords). */
export function withWireWaypoint(wire: SchematicWire, point: Point): SchematicWire {
  return { ...wire, waypoints: [{ x: snap(point.x), y: snap(point.y) }] };
}

export function clearWireWaypoints(wire: SchematicWire): SchematicWire {
  if (!wire.waypoints?.length) return wire;
  const { waypoints: _, ...rest } = wire;
  return rest;
}
