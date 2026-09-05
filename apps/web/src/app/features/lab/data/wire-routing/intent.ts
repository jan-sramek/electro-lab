import { distanceToPolyline } from './geometry';
import { Point, PreferAxis, RoutingIntent } from './types';

/** Below this the two Ls are practically the same wire. */
const TRACE_MIN_SPAN = 12;
/** Minimum mean-distance gap (px) before the trace is trusted over the lock. */
const TRACE_MIN_MARGIN = 4;

/**
 * Which L the traced cursor path follows.
 *
 * The user draws the side of the pin→target rectangle they want: across then
 * down reads HV ('h'), down then across reads VH ('v'). Each candidate L is
 * scored by the (recency-weighted) mean distance of the trace samples to it;
 * the clearly closer one wins. Diagonal / tiny spans are ambiguous → null so
 * the sticky lock or span axis decides.
 *
 * Without from/to the trace's own endpoints are used.
 */
export function motionPrimaryAxis(
  samples: Point[] | null | undefined,
  from?: Point | null,
  to?: Point | null
): PreferAxis | null {
  if (!samples || samples.length < 2) return null;
  const a = from ?? samples[0]!;
  const b = to ?? samples[samples.length - 1]!;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  // Both Ls coincide on a straight run — nothing to choose.
  if (Math.abs(dx) < TRACE_MIN_SPAN || Math.abs(dy) < TRACE_MIN_SPAN) return null;

  const hv: Point[] = [a, { x: b.x, y: a.y }, b];
  const vh: Point[] = [a, { x: a.x, y: b.y }, b];
  let sH = 0;
  let sV = 0;
  let wSum = 0;
  for (let i = 0; i < samples.length; i++) {
    const p = samples[i]!;
    // Samples on the pin or on the target sit on both Ls — skip the noise.
    if (Math.hypot(p.x - a.x, p.y - a.y) < TRACE_MIN_SPAN) continue;
    if (Math.hypot(p.x - b.x, p.y - b.y) < TRACE_MIN_SPAN) continue;
    // Mild recency weight so a re-traced path can still change the pick.
    const w = 1 + i / samples.length;
    sH += distanceToPolyline(p, hv) * w;
    sV += distanceToPolyline(p, vh) * w;
    wSum += w;
  }
  if (wSum === 0) return null;
  sH /= wSum;
  sV /= wSum;
  const margin = Math.max(TRACE_MIN_MARGIN, Math.min(Math.abs(dx), Math.abs(dy)) * 0.1);
  if (sH + margin < sV) return 'h';
  if (sV + margin < sH) return 'v';
  return null;
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
  const fromMotion = motionPrimaryAxis(motion, from, to);
  if (fromMotion) return fromMotion;
  if (prev) return prev;
  return spanPrimaryAxis(to.x - from.x, to.y - from.y);
}

/**
 * Teaching router intent for squared / rectangular circuits:
 * - primaryAxis follows the traced path (or sticky lock), then span
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
  const fromMotion = motionPrimaryAxis(motion, from, to);
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
