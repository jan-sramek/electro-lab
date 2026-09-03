import { OVERLAP_EPS, Point, PreferAxis, RouteShape } from './types';

export interface RouteCandidate {
  pts: Point[];
  kind: 'hv' | 'vh';
  primaryAxis: PreferAxis | null;
  shape: RouteShape;
}

/** Rectangle-side L candidates only (HV / VH). */
export function buildCandidates(x1: number, y1: number, x2: number, y2: number): RouteCandidate[] {
  if (Math.abs(x1 - x2) < OVERLAP_EPS || Math.abs(y1 - y2) < OVERLAP_EPS) {
    return [
      {
        pts: [
          { x: x1, y: y1 },
          { x: x2, y: y2 }
        ],
        kind: Math.abs(x1 - x2) < OVERLAP_EPS ? 'vh' : 'hv',
        primaryAxis: Math.abs(x1 - x2) < OVERLAP_EPS ? 'v' : 'h',
        shape: 'L'
      }
    ];
  }

  return [
    {
      pts: [
        { x: x1, y: y1 },
        { x: x2, y: y1 },
        { x: x2, y: y2 }
      ],
      kind: 'hv',
      primaryAxis: 'h',
      shape: 'L'
    },
    {
      pts: [
        { x: x1, y: y1 },
        { x: x1, y: y2 },
        { x: x2, y: y2 }
      ],
      kind: 'vh',
      primaryAxis: 'v',
      shape: 'L'
    }
  ];
}

export function candidateElbows(x1: number, y1: number, x2: number, y2: number): Point[][] {
  return buildCandidates(x1, y1, x2, y2).map((c) => c.pts);
}
