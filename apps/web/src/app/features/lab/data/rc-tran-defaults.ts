import { SchematicDocument } from './schematic.model';
import { hasRcEnergyNetwork } from './circuit-topology';
import { hasControllableSwitch } from './switch-state';

/** Teaching defaults for LED-fade / RC discharge on the canvas (matches LED fade example). */
export const RC_TRAN_TEACHING_TSTOP = 6;
export const RC_TRAN_TEACHING_DT = 0.002;

/** True when this schematic benefits from transient fade/charge playback. */
export function isRcFadeTeachingCircuit(doc: SchematicDocument): boolean {
  return hasRcEnergyNetwork(doc) && hasControllableSwitch(doc);
}

export function rcTranDefaultsNeeded(tStop: number, dt: number): boolean {
  return tStop < 0.5 || dt < 0.0005 || dt > 0.01;
}

export interface RcTranSettings {
  tStop: number;
  dt: number;
}

export function recommendedRcTranSettings(tStop: number, dt: number): RcTranSettings | null {
  if (!rcTranDefaultsNeeded(tStop, dt)) return null;
  return {
    tStop: tStop < 0.5 ? RC_TRAN_TEACHING_TSTOP : tStop,
    dt: dt < 0.0005 || dt > 0.01 ? RC_TRAN_TEACHING_DT : dt
  };
}
