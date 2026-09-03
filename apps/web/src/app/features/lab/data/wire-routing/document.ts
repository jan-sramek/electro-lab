import { SchematicComponent, SchematicDocument, SchematicWire, snap } from '../schematic.model';
import { SYMBOL_LIBRARY } from '../symbol-library';
import { symbolDisplayScale } from '../symbol-scale';
import { polylineSegments } from './geometry';
import { routeOrthogonal } from './route';
import { Point, WireSegment } from './types';

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
