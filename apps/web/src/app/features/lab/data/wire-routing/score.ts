import { RouteCandidate } from './candidates';
import { firstLegAxis, pathLength } from './geometry';
import { AXIS_MATCH_BONUS, LENGTH_WEIGHT, RoutingIntent, WireSegment } from './types';

/** Score is only used to pick HV vs VH L. */
export function scoreCandidate(
  cand: RouteCandidate,
  intent: RoutingIntent,
  _obstacles: WireSegment[] | null
): number {
  const pts = cand.pts;
  let score = pathLength(pts) * LENGTH_WEIGHT;
  const first = cand.primaryAxis ?? firstLegAxis(pts);
  if (first === intent.primaryAxis) {
    score -= AXIS_MATCH_BONUS * intent.confidence;
  }
  return score;
}

export function pickBestCandidate(
  candidates: RouteCandidate[],
  intent: RoutingIntent,
  obstacles: WireSegment[] | null
): RouteCandidate {
  if (!candidates.length) {
    return {
      pts: [],
      kind: 'hv',
      primaryAxis: intent.primaryAxis,
      shape: 'L'
    };
  }
  const exact = candidates.find((c) => c.shape === 'L' && c.primaryAxis === intent.primaryAxis);
  if (exact) return exact;
  const anyL = candidates.find((c) => c.shape === 'L');
  if (anyL) return anyL;

  let best = candidates[0]!;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const cand of candidates) {
    const s = scoreCandidate(cand, intent, obstacles);
    if (s < bestScore - 1e-9) {
      bestScore = s;
      best = cand;
    }
  }
  return best;
}
