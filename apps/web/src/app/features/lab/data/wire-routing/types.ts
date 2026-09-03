import { snap } from '../schematic.model';

export interface Point {
  x: number;
  y: number;
}

export interface WireSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** First long run after the pin exit stub. */
export type PreferAxis = 'h' | 'v';

/**
 * L — single elbow (two sides of the pin→target rectangle).
 * U — mid corridor detour (obstacle dodge / rare).
 */
export type RouteShape = 'L' | 'U';

export interface RoutingIntent {
  primaryAxis: PreferAxis;
  shape: RouteShape;
  /** 0..1 — higher when mouse motion is clear. */
  confidence: number;
}

export interface RouteOptions {
  exitA?: Point | null;
  exitB?: Point | null;
  midpoints?: Point[] | null;
  obstacles?: WireSegment[] | null;
  /** Recent cursor samples (oldest → newest) while rubber-banding. */
  motion?: Point[] | null;
  /** Sticky axis lock from the canvas while drawing one wire. */
  axisLock?: PreferAxis | null;
}

export const OVERLAP_EPS = 0.5;

export const LENGTH_WEIGHT = 0.02;
export const OVERLAP_WEIGHT = 8;
export const AXIS_MISMATCH_WEIGHT = 3.5;
/** Reward matching the intended first axis (motion / lock). */
export const AXIS_MATCH_BONUS = 40;
/** Penalty for cutting through the rectangle mid instead of its sides. */
export const MID_CUT_PENALTY = 25;

export function snapPoint(p: Point): Point {
  return { x: snap(p.x), y: snap(p.y) };
}
