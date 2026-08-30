/** Teaching LED color presets — schematic `color` id maps to typical Vf and glyph colors. */
export interface LedColorPreset {
  id: number;
  /** i18n key under lab.led.color.* */
  labelKey: string;
  vf: number;
  /** Body RGB when off (dim). */
  off: readonly [number, number, number];
  /** Body RGB at full brightness. */
  lit: readonly [number, number, number];
  /** Glow ellipse RGB when lit. */
  glow: readonly [number, number, number];
}

export const LED_COLORS: readonly LedColorPreset[] = [
  {
    id: 0,
    labelKey: 'lab.led.color.red',
    vf: 2.0,
    off: [248, 226, 226],
    lit: [255, 61, 109],
    glow: [255, 77, 109]
  },
  {
    id: 1,
    labelKey: 'lab.led.color.green',
    vf: 2.1,
    off: [220, 252, 231],
    lit: [34, 197, 94],
    glow: [74, 222, 128]
  },
  {
    id: 2,
    labelKey: 'lab.led.color.yellow',
    vf: 2.0,
    off: [254, 249, 195],
    lit: [250, 204, 21],
    glow: [253, 224, 71]
  },
  {
    id: 3,
    labelKey: 'lab.led.color.blue',
    vf: 3.0,
    off: [219, 234, 254],
    lit: [59, 130, 246],
    glow: [96, 165, 250]
  },
  {
    id: 4,
    labelKey: 'lab.led.color.white',
    vf: 3.2,
    off: [241, 245, 249],
    lit: [248, 250, 252],
    glow: [226, 232, 240]
  }
] as const;

export function ledColorById(id: number): LedColorPreset {
  return LED_COLORS.find((c) => c.id === id) ?? LED_COLORS[0]!;
}

export function normalizeLedColorId(raw: number | boolean | undefined): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return 0;
  const id = Math.round(raw);
  return LED_COLORS.some((c) => c.id === id) ? id : 0;
}
