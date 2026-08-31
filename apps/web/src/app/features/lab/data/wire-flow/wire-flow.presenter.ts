import { Point } from '../wire-routing';
import { polylineToPath } from '../schematic.model';
import { WireFlowOverlay } from './wire-flow.model';

/** Minimum |I| (A) before drawing flow dashes. */
export const WIRE_FLOW_MIN_AMPS = 1e-6;

/** Reference current for full-strength flow (≈12 mA LED). */
const FLOW_REF_AMPS = 0.012;

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
      amps: mag
    };
  }
}
