import { OVERLAP_EPS, Point } from './types';
import { snap } from '../schematic.model';

/**
 * Best T-junction on an orthogonal polyline: drop vertically onto a horizontal
 * run, or go horizontally onto a vertical run, so the new wire is a straight
 * stub instead of running along the rail.
 */
export function orthogonalTeeOnPolyline(
  start: Point,
  pts: Point[],
  cursor: Point,
  maxDist = 16
): Point | null {
  let best: { x: number; y: number; d: number } | null = null;

  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    const horiz = Math.abs(a.y - b.y) < OVERLAP_EPS;
    const vert = Math.abs(a.x - b.x) < OVERLAP_EPS;
    if (!horiz && !vert) continue;

    if (horiz) {
      const y = a.y;
      const x0 = Math.min(a.x, b.x);
      const x1 = Math.max(a.x, b.x);
      if (start.x < x0 - 0.5 || start.x > x1 + 0.5) continue;
      const tee = { x: snap(start.x), y: snap(y) };
      const d = Math.abs(cursor.y - y);
      if (d > maxDist) continue;
      if (!best || d < best.d) best = { ...tee, d };
    } else {
      const x = a.x;
      const y0 = Math.min(a.y, b.y);
      const y1 = Math.max(a.y, b.y);
      if (start.y < y0 - 0.5 || start.y > y1 + 0.5) continue;
      const tee = { x: snap(x), y: snap(start.y) };
      const d = Math.abs(cursor.x - x);
      if (d > maxDist) continue;
      if (!best || d < best.d) best = { ...tee, d };
    }
  }

  return best ? { x: best.x, y: best.y } : null;
}

export function nearestOrthogonalTee(
  start: Point,
  polylines: Point[][],
  cursor: Point,
  maxDist = 16
): Point | null {
  let best: { x: number; y: number; d: number } | null = null;
  for (const pts of polylines) {
    const tee = orthogonalTeeOnPolyline(start, pts, cursor, maxDist);
    if (!tee) continue;
    const d = Math.hypot(tee.x - cursor.x, tee.y - cursor.y);
    if (!best || d < best.d) best = { ...tee, d };
  }
  return best ? { x: best.x, y: best.y } : null;
}
