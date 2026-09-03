import { Point, PreferAxis, RoutingIntent } from './types';

/**
 * Dominant axis of recent cursor motion (oldest → newest).
 * Later samples weigh more so the latest pull direction wins.
 */
export function motionPrimaryAxis(samples: Point[] | null | undefined): PreferAxis | null {
  if (!samples || samples.length < 2) return null;
  // Skip the first samples while still on the pin — leaving a side pin always
  // jitters horizontally and would lock the opposite L.
  const origin = samples[0]!;
  let start = 1;
  while (start < samples.length) {
    const p = samples[start]!;
    if (Math.hypot(p.x - origin.x, p.y - origin.y) >= 18) break;
    start += 1;
  }
  if (start >= samples.length) return null;

  let hx = 0;
  let hy = 0;
  for (let i = start; i < samples.length; i++) {
    const w = i - start + 1;
    const a = samples[i - 1]!;
    const b = samples[i]!;
    hx += Math.abs(b.x - a.x) * w;
    hy += Math.abs(b.y - a.y) * w;
  }
  if (hx + hy < 14) return null;
  // Soft bias so “mostly down” still reads vertical.
  if (hy >= hx * 0.75) return 'v';
  if (hx >= hy * 0.75) return 'h';
  return hy >= hx ? 'v' : 'h';
}

/** Span-only axis from pin → target (exit never overrides). */
export function spanPrimaryAxis(dx: number, dy: number): PreferAxis {
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  if (ady > adx * 0.65) return 'v';
  if (adx > ady * 0.65) return 'h';
  return ady >= adx ? 'v' : 'h';
}

/**
 * Sticky axis while drawing one wire: strong motion updates the lock;
 * otherwise keep the previous lock so the L does not flip mid-gesture.
 */
export function updateAxisLock(
  prev: PreferAxis | null,
  motion: Point[] | null | undefined,
  from: Point,
  to: Point
): PreferAxis {
  const fromMotion = motionPrimaryAxis(motion);
  if (fromMotion) return fromMotion;
  if (prev) return prev;
  return spanPrimaryAxis(to.x - from.x, to.y - from.y);
}

/**
 * Teaching router intent for squared / rectangular circuits:
 * - primaryAxis follows mouse motion (or sticky lock), then span
 * - shape is always L for open space (two sides of the pin→target rectangle)
 * - U is only chosen later when obstacles force a detour
 */
export function inferRoutingIntent(args: {
  from: Point;
  to: Point;
  motion?: Point[] | null;
  axisLock?: PreferAxis | null;
}): RoutingIntent {
  const { from, to, motion, axisLock } = args;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const fromMotion = motionPrimaryAxis(motion);
  const span = spanPrimaryAxis(dx, dy);

  let primaryAxis: PreferAxis;
  let confidence: number;
  if (fromMotion) {
    primaryAxis = fromMotion;
    confidence = 0.95;
  } else if (axisLock) {
    primaryAxis = axisLock;
    confidence = 0.8;
  } else {
    primaryAxis = span;
    confidence = 0.55;
  }

  return { primaryAxis, shape: 'L', confidence };
}
