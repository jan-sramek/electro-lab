import { SchematicComponent, SchematicDocument, SchematicWire, snap } from '../schematic.model';
import { SYMBOL_LIBRARY } from '../symbol-library';
import { symbolDisplayScale } from '../symbol-scale';
import { firstLegAxis, polylineSegments } from './geometry';
import { routeOrthogonal } from './route';
import { Point, WireBend, WireSegment } from './types';

export { SYMBOL_DISPLAY_SCALE, symbolDisplayScale } from '../symbol-scale';

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

export function scaledPinWorldPos(c: SchematicComponent, pinName: string): Point | null {
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

function routeWire(doc: SchematicDocument, wire: SchematicWire): Point[] {
  const ca = doc.components.find((c) => c.id === wire.a.componentId);
  const cb = doc.components.find((c) => c.id === wire.b.componentId);
  if (!ca || !cb) return [];
  const a = scaledPinWorldPos(ca, wire.a.pin);
  const b = scaledPinWorldPos(cb, wire.b.pin);
  if (!a || !b) return [];
  return routeOrthogonal(a.x, a.y, b.x, b.y, {
    midpoints: wire.waypoints ?? null
  });
}

/** Route every wire independently (shared rails are allowed). */
export function routeAllWirePolylines(doc: SchematicDocument): Map<string, Point[]> {
  const map = new Map<string, Point[]>();
  for (const w of doc.wires) {
    map.set(w.id, routeWire(doc, w));
  }
  return map;
}

export function wirePolyline(doc: SchematicDocument, wire: SchematicWire): Point[] {
  return routeAllWirePolylines(doc).get(wire.id) ?? routeWire(doc, wire);
}

/** Obstacle segments for rubber-band preview (existing wires only). */
export function documentWireObstacles(doc: SchematicDocument): WireSegment[] {
  const segs: WireSegment[] = [];
  for (const pts of routeAllWirePolylines(doc).values()) {
    segs.push(...polylineSegments(pts));
  }
  return segs;
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

/** Side of the pin→pin rectangle a routed polyline follows (null when straight/empty). */
export function bendOfPolyline(pts: Point[]): WireBend | null {
  if (pts.length < 3) return null;
  const axis = firstLegAxis(pts);
  if (!axis) return null;
  return axis === 'h' ? 'hv' : 'vh';
}

/**
 * Axis of a straight wire (null when it already bends or is degenerate).
 * Used to keep a straight run straight at its fixed end when the other end moves.
 */
function straightAxis(pts: Point[]): WireBend | null {
  if (pts.length !== 2) return null;
  const axis = firstLegAxis(pts, 0);
  if (!axis) return null;
  return axis === 'h' ? 'hv' : 'vh';
}

/**
 * Remember how every wire touching `componentIds` is bent right now, so a
 * move can keep the drawn shape instead of re-routing by span.
 */
export function captureWireBends(
  doc: SchematicDocument,
  componentIds: Iterable<string>
): Map<string, WireBend | null> {
  const ids = new Set(componentIds);
  const routed = routeAllWirePolylines(doc);
  const bends = new Map<string, WireBend | null>();
  for (const w of doc.wires) {
    if (!ids.has(w.a.componentId) && !ids.has(w.b.componentId)) continue;
    const pts = routed.get(w.id) ?? [];
    bends.set(w.id, bendOfPolyline(pts) ?? straightAxis(pts));
  }
  return bends;
}

/** Pin a wire to one side of the a→b rectangle (or straight when collinear). */
export function withWireBend(
  wire: SchematicWire,
  a: Point,
  b: Point,
  bend: WireBend | null
): SchematicWire {
  if (!bend || Math.abs(a.x - b.x) < 0.5 || Math.abs(a.y - b.y) < 0.5) {
    return clearWireWaypoints(wire);
  }
  const corner = bend === 'hv' ? { x: b.x, y: a.y } : { x: a.x, y: b.y };
  return { ...wire, waypoints: [corner] };
}

/**
 * Re-anchor the remembered bends after endpoints moved: the L keeps its
 * orientation and its corner slides with the pins.
 */
export function applyWireBends(
  doc: SchematicDocument,
  bends: Map<string, WireBend | null>
): SchematicDocument {
  if (!bends.size) return doc;
  const byId = new Map(doc.components.map((c) => [c.id, c] as const));
  return {
    ...doc,
    wires: doc.wires.map((w) => {
      if (!bends.has(w.id)) return w;
      const ca = byId.get(w.a.componentId);
      const cb = byId.get(w.b.componentId);
      const a = ca ? scaledPinWorldPos(ca, w.a.pin) : null;
      const b = cb ? scaledPinWorldPos(cb, w.b.pin) : null;
      if (!a || !b) return clearWireWaypoints(w);
      return withWireBend(w, a, b, bends.get(w.id) ?? null);
    })
  };
}

/**
 * A junction tapped mid-rail is placed where the user clicked. When the branch
 * then ends on a pin, slide the junction along its straight rail so the branch
 * runs straight into that pin (only when the pin projects inside the rail).
 */
export function alignJunctionToward(
  doc: SchematicDocument,
  junctionId: string,
  target: Point
): SchematicDocument {
  const j = doc.components.find((c) => c.id === junctionId);
  if (!j || j.modelKey !== 'junction') return doc;
  const byId = new Map(doc.components.map((c) => [c.id, c] as const));
  const ends: Point[] = [];
  for (const w of doc.wires) {
    const other =
      w.a.componentId === junctionId ? w.b : w.b.componentId === junctionId ? w.a : null;
    if (!other) continue;
    if (w.waypoints?.length) return doc;
    const c = byId.get(other.componentId);
    const p = c ? scaledPinWorldPos(c, other.pin) : null;
    if (!p) return doc;
    ends.push(p);
  }
  if (ends.length !== 2) return doc;
  const [p, q] = ends as [Point, Point];
  const horizontal = Math.abs(p.y - j.y) < 0.5 && Math.abs(q.y - j.y) < 0.5;
  const vertical = Math.abs(p.x - j.x) < 0.5 && Math.abs(q.x - j.x) < 0.5;
  if (horizontal === vertical) return doc;
  if (horizontal) {
    const lo = Math.min(p.x, q.x) + 1;
    const hi = Math.max(p.x, q.x) - 1;
    if (target.x < lo || target.x > hi || Math.abs(target.x - j.x) < 0.5) return doc;
    return {
      ...doc,
      components: doc.components.map((c) => (c.id === junctionId ? { ...c, x: target.x } : c))
    };
  }
  const lo = Math.min(p.y, q.y) + 1;
  const hi = Math.max(p.y, q.y) - 1;
  if (target.y < lo || target.y > hi || Math.abs(target.y - j.y) < 0.5) return doc;
  return {
    ...doc,
    components: doc.components.map((c) => (c.id === junctionId ? { ...c, y: target.y } : c))
  };
}
