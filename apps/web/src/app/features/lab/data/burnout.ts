import { isBjtNpnPart, isNmosPart, isNe555Part, simModelOf } from './symbol-library';

/** Teaching overload thresholds. */
export const DIODE_BURN_A = 0.1;
/** ¼ W resistor teaching rating. */
export const RESISTOR_BURN_W = 0.25;
/** Default electrolytic-style voltage rating when `vmax` unset. */
export const CAP_DEFAULT_VMAX = 16;
/** Series ammeter teaching fuse (~200 mA). */
export const AMMETER_BURN_A = 0.2;
/** Piezo buzzer teaching current limit. */
export const BUZZER_BURN_A = 0.05;
/** Small DC motor teaching stall / overcurrent. */
export const MOTOR_BURN_A = 0.4;

export type BurnKind =
  | 'led'
  | 'bjt'
  | 'diode'
  | 'resistor'
  | 'capacitor'
  | 'ammeter'
  | 'nmos'
  | 'ne555'
  | 'buzzer'
  | 'dc_motor'
  | 'ldr';

export function burnKindOf(modelKey: string): BurnKind | null {
  if (modelKey === 'led') return 'led';
  if (modelKey === 'buzzer') return 'buzzer';
  if (modelKey === 'dc_motor') return 'dc_motor';
  if (modelKey === 'ldr') return 'ldr';
  if (isBjtNpnPart(modelKey)) return 'bjt';
  if (isNmosPart(modelKey)) return 'nmos';
  if (isNe555Part(modelKey)) return 'ne555';
  const sim = simModelOf(modelKey);
  if (sim === 'diode') return 'diode';
  if (sim === 'resistor') return 'resistor';
  if (sim === 'capacitor') return 'capacitor';
  if (sim === 'ammeter') return 'ammeter';
  return null;
}

export function canBurnOut(modelKey: string): boolean {
  return burnKindOf(modelKey) != null;
}

/** LDR resistance matches CircuitSim LdrModel (log blend dark→light). */
export function ldrResistanceOhms(params: Record<string, number | boolean>): number | null {
  const lightRaw = params['light'];
  const rDark = params['rDark'];
  const rLight = params['rLight'];
  if (typeof lightRaw !== 'number' || typeof rDark !== 'number' || typeof rLight !== 'number') {
    return null;
  }
  if (!(rDark > 0) || !(rLight > 0)) return null;
  const light = Math.max(0, Math.min(1, lightRaw));
  return rDark * Math.pow(rLight / rDark, light);
}

export function burnWarningKey(kind: BurnKind): string {
  switch (kind) {
    case 'led':
      return 'lab.led.burnedWarning';
    case 'bjt':
      return 'lab.bjt.burnedWarning';
    case 'diode':
      return 'lab.diode.burnedWarning';
    case 'resistor':
      return 'lab.resistor.burnedWarning';
    case 'capacitor':
      return 'lab.capacitor.burnedWarning';
    case 'ammeter':
      return 'lab.ammeter.burnedWarning';
    case 'nmos':
      return 'lab.nmos.burnedWarning';
    case 'ne555':
      return 'lab.ne555.burnedWarning';
    case 'buzzer':
      return 'lab.buzzer.burnedWarning';
    case 'dc_motor':
      return 'lab.dc_motor.burnedWarning';
    case 'ldr':
      return 'lab.ldr.burnedWarning';
  }
}

export function burnInspectorNoteKey(kind: BurnKind): string {
  switch (kind) {
    case 'led':
      return 'lab.inspector.ledBurned';
    case 'bjt':
      return 'lab.inspector.bjtBurned';
    case 'diode':
      return 'lab.inspector.diodeBurned';
    case 'resistor':
      return 'lab.inspector.resistorBurned';
    case 'capacitor':
      return 'lab.inspector.capacitorBurned';
    case 'ammeter':
      return 'lab.inspector.ammeterBurned';
    case 'nmos':
      return 'lab.inspector.nmosBurned';
    case 'ne555':
      return 'lab.inspector.ne555Burned';
    case 'buzzer':
      return 'lab.inspector.buzzerBurned';
    case 'dc_motor':
      return 'lab.inspector.dcMotorBurned';
    case 'ldr':
      return 'lab.inspector.ldrBurned';
  }
}

export function burnReplaceLabelKey(kind: BurnKind): string {
  switch (kind) {
    case 'led':
      return 'lab.inspector.replaceLed';
    case 'bjt':
      return 'lab.inspector.replaceBjt';
    case 'diode':
      return 'lab.inspector.replaceDiode';
    case 'resistor':
      return 'lab.inspector.replaceResistor';
    case 'capacitor':
      return 'lab.inspector.replaceCapacitor';
    case 'ammeter':
      return 'lab.inspector.replaceAmmeter';
    case 'nmos':
      return 'lab.inspector.replaceNmos';
    case 'ne555':
      return 'lab.inspector.replaceNe555';
    case 'buzzer':
      return 'lab.inspector.replaceBuzzer';
    case 'dc_motor':
      return 'lab.inspector.replaceDcMotor';
    case 'ldr':
      return 'lab.inspector.replaceLdr';
  }
}
