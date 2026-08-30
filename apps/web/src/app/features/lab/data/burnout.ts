import { isBjtNpnPart, simModelOf } from './symbol-library';

/** Teaching overload thresholds. */
export const DIODE_BURN_A = 0.1;
/** ¼ W resistor teaching rating. */
export const RESISTOR_BURN_W = 0.25;
/** Default electrolytic-style voltage rating when `vmax` unset. */
export const CAP_DEFAULT_VMAX = 16;
/** Series ammeter teaching fuse (~200 mA). */
export const AMMETER_BURN_A = 0.2;

export type BurnKind = 'led' | 'bjt' | 'diode' | 'resistor' | 'capacitor' | 'ammeter';

export function burnKindOf(modelKey: string): BurnKind | null {
  if (modelKey === 'led') return 'led';
  if (isBjtNpnPart(modelKey)) return 'bjt';
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
  }
}
