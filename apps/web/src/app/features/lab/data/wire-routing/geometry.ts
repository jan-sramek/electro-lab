import { OVERLAP_EPS, Point, PreferAxis, WireSegment } from './types';

export function polylineSegments(pts: Point[]): WireSegment[] {
  const segs: WireSegment[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p = pts[i]!;
    const q = pts[i + 1]!;
    if (Math.abs(p.x - q.x) < OVERLAP_EPS && Math.abs(p.y - q.y) < OVERLAP_EPS) continue;
    segs.push({ x1: p.x, y1: p.y, x2: q.x, y2: q.y });
  }
  return segs;
}

/** Collinear overlap length between two axis-aligned segments (0 if not collinear). */
export function collinearOverlap(a: WireSegment, b: WireSegment): number {
  const aHoriz = Math.abs(a.y1 - a.y2) < OVERLAP_EPS;
  const bHoriz = Math.abs(b.y1 - b.y2) < OVERLAP_EPS;
  const aVert = Math.abs(a.x1 - a.x2) < OVERLAP_EPS;
  const bVert = Math.abs(b.x1 - b.x2) < OVERLAP_EPS;

  if (aHoriz && bHoriz && Math.abs(a.y1 - b.y1) < OVERLAP_EPS) {
    const a0 = Math.min(a.x1, a.x2);
    const a1 = Math.max(a.x1, a.x2);
    const b0 = Math.min(b.x1, b.x2);
    const b1 = Math.max(b.x1, b.x2);
    return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
  }
  if (aVert && bVert && Math.abs(a.x1 - b.x1) < OVERLAP_EPS) {
    const a0 = Math.min(a.y1, a.y2);
    const a1 = Math.max(a.y1, a.y2);
    const b0 = Math.min(b.y1, b.y2);
    const b1 = Math.max(b.y1, b.y2);
    return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
  }
  return 0;
}

export function routeOverlapLength(pts: Point[], obstacles: WireSegment[]): number {
  if (!obstacles.length) return 0;
  let total = 0;
  for (const seg of polylineSegments(pts)) {
    for (const obs of obstacles) {
      const o = collinearOverlap(seg, obs);
      if (o > 8) total += o;
    }
  }
  return total;
}

export function pathLength(pts: Point[]): number {
  let n = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const p = pts[i]!;
    const q = pts[i + 1]!;
    n += Math.abs(q.x - p.x) + Math.abs(q.y - p.y);
  }
  return n;
}

/** Axis of the first meaningful leg (skips tiny stubs under 10u). */
export function firstLegAxis(pts: Point[], minLen = 10): PreferAxis | null {
  for (let i = 0; i < pts.length - 1; i++) {
    const p = pts[i]!;
    const q = pts[i + 1]!;
    const dx = Math.abs(q.x - p.x);
    const dy = Math.abs(q.y - p.y);
    if (dx < OVERLAP_EPS && dy < OVERLAP_EPS) continue;
    if (dx + dy < minLen) continue;
    if (dy >= dx) return 'v';
    return 'h';
  }
  // Fall back to any non-zero leg (includes exit stub).
  for (let i = 0; i < pts.length - 1; i++) {
    const p = pts[i]!;
    const q = pts[i + 1]!;
    const dx = Math.abs(q.x - p.x);
    const dy = Math.abs(q.y - p.y);
    if (dx < OVERLAP_EPS && dy < OVERLAP_EPS) continue;
    if (dy >= dx) return 'v';
    return 'h';
  }
  return null;
}

export function dedupePoints(pts: Point[]): Point[] {
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

export function simpleElbow(x1: number, y1: number, x2: number, y2: number, prefer?: PreferAxis): Point[] {
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
  if (prefer === 'v') return vh;
  if (prefer === 'h') return hv;
  return Math.abs(x2 - x1) >= Math.abs(y2 - y1) ? hv : vh;
}
