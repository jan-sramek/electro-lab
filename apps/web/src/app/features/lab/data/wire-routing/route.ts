import { snap } from '../schematic.model';
import { inferRoutingIntent } from './intent';
import { Point, RouteOptions } from './types';
import { dedupePoints, simpleElbow } from './geometry';

/**
 * Orthogonal route between two points: a straight run or a single L on two
 * sides of the pin→target rectangle. Motion / axis lock picks which L.
 *
 * Existing wires are not obstacles. Joining a rail must be allowed to share
 * that corridor — dodging it produced U-turns and staircases.
 */
export function routeOrthogonal(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  opts?: RouteOptions
): Point[] {
  x1 = snap(x1);
  y1 = snap(y1);
  x2 = snap(x2);
  y2 = snap(y2);

  const mids = usableWaypoints(x1, y1, x2, y2, opts?.midpoints ?? []);
  if (mids.length) {
    const pts: Point[] = [{ x: x1, y: y1 }];
    let cx = x1;
    let cy = y1;
    for (const m of mids) {
      pts.push(...simpleElbow(cx, cy, m.x, m.y).slice(1));
      cx = m.x;
      cy = m.y;
    }
    pts.push(...simpleElbow(cx, cy, x2, y2).slice(1));
    return dedupePoints(pts);
  }

  const intent = inferRoutingIntent({
    from: { x: x1, y: y1 },
    to: { x: x2, y: y2 },
    motion: opts?.motion ?? null,
    axisLock: opts?.axisLock ?? null
  });
  return dedupePoints(simpleElbow(x1, y1, x2, y2, intent.primaryAxis));
}

/**
 * Keep user-dragged elbows; drop tiny near-pin jogs from old exit-stub routes.
 */
export function usableWaypoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  raw: Point[]
): Point[] {
  const hv: Point = { x: x2, y: y1 };
  const vh: Point = { x: x1, y: y2 };
  return raw
    .map((p) => ({ x: snap(p.x), y: snap(p.y) }))
    .filter((p) => {
      if (samePoint(p, hv) || samePoint(p, vh)) return true;
      if (Math.hypot(p.x - x1, p.y - y1) < 24) return false;
      if (Math.abs(p.x - x1) <= 20 && Math.abs(p.x - x2) > 1) return false;
      if (Math.abs(p.y - y1) <= 20 && Math.abs(p.y - y2) > 1) return false;
      return true;
    });
}

function samePoint(a: Point, b: Point): boolean {
  return Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) < 1;
}
