import { SYMBOL_LIBRARY } from './symbol-library';

/** Base teaching Lab symbol scale (pins, glyphs, hit boxes). */
export const SYMBOL_DISPLAY_SCALE = 0.58;

/**
 * Per-part display multiplier on top of {@link SYMBOL_DISPLAY_SCALE}.
 * LEDs/diodes pack tighter so multi-LED circuits (e.g. Christmas tree) fit on canvas.
 */
export function symbolDisplayScale(modelKey: string): number {
  const mul = SYMBOL_LIBRARY[modelKey]?.displayScale ?? 1;
  return SYMBOL_DISPLAY_SCALE * mul;
}

/** Pin hit radius — smaller for compact two-pin parts. */
export function pinHitRadius(modelKey: string): number {
  return modelKey === 'led' || modelKey === 'diode' || modelKey === 'junction' ? 9 : 12;
}
