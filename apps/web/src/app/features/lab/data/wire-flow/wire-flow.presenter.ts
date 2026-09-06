import { Point, pathLength } from '../wire-routing';
import { polylineToPath } from '../schematic.model';
import { WireFlowOverlay } from './wire-flow.model';

/** Minimum |I| (A) before drawing flow dashes. */
export const WIRE_FLOW_MIN_AMPS = 1e-6;

/** Reference current for full-strength flow (≈12 mA LED). */
const FLOW_REF_AMPS = 0.012;

/** Standard dash / gap (world units); the keyframe scrolls one full period (16). */
const FLOW_DASH_ON = 6;
const FLOW_DASH_OFF = 10;
const FLOW_DASH_PERIOD = FLOW_DASH_ON + FLOW_DASH_OFF;

/**
 * Dash pattern for a wire of length `len`. Junction→pin stubs are shorter than one
 * dash period and sit under two pin rings, so with the standard pattern they look
 * dead most of the cycle. Shrink the period to the wire length: half of it is lit
 * at every phase and the motion stays visible.
 */
export function flowDashFor(len: number): string {
  if (len >= FLOW_DASH_PERIOD) return `${FLOW_DASH_ON} ${FLOW_DASH_OFF}`;
  const on = Math.max(1.5, len * 0.5);
  const off = Math.max(1, len - on);
  return `${round2(on)} ${round2(off)}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Maps wire geometry + signed current into SVG overlay parameters.
 * Pure presentation — no graph solving.
 */
export class WireFlowPresenter {
  static overlay(pts: Point[], iAlongAtoB: number): WireFlowOverlay | null {
    const mag = Math.abs(iAlongAtoB);
    if (mag < WIRE_FLOW_MIN_AMPS) return null;

    const strength = Math.min(1, mag / FLOW_REF_AMPS);
    const periodMs = Math.round(
      Math.max(200, Math.min(920, 500 / Math.sqrt(strength + 0.15)))
    );
    const drawPts = iAlongAtoB >= 0 ? pts : [...pts].reverse();
    return {
      path: polylineToPath(drawPts),
      periodMs,
      strength,
      amps: mag,
      dash: flowDashFor(pathLength(pts))
    };
  }
}
