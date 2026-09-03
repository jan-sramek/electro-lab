import { LED_COLORS } from './led-colors';

export interface ParamDef {
  key: string;
  /** i18n key, e.g. lab.param.voltage */
  label: string;
  type: 'number' | 'slider' | 'boolean' | 'enum' | 'momentary';
  min?: number;
  /** Required for type === 'slider'; optional clamp hint for number fields. */
  max?: number;
  step?: number;
  unit?: string;
  /** For type === 'enum': option value + i18n label key. */
  options?: { value: number; label: string }[];
}

export interface PinDef {
  name: string;
  ox: number;
  oy: number;
}

export interface SymbolDef {
  modelKey: string;
  /**
   * CircuitEngine model when different from the Lab part id (e.g. BC547 → bjt_npn).
   * Keeps named discrete parts in the palette without new SPICE models.
   */
  simModel?: string;
  /** Glyph switch key when the part reuses another symbol (defaults to simModel ?? modelKey). */
  glyphKey?: string;
  /** i18n key, e.g. lab.symbol.battery */
  label: string;
  /** Optional i18n key — teaching approximation note in inspector / palette. */
  teachingNote?: string;
  /** If true, omitted from CircuitEngine netlist; used only for grounding. */
  schematicOnly?: boolean;
  /** Extra canvas scale multiplier (LED/diode default smaller for dense layouts). */
  displayScale?: number;
  pins: PinDef[];
  defaultParams: Record<string, number | boolean>;
  paramDefs: ParamDef[];
  width: number;
  height: number;
}

/** Engine model key for simulate / wire-current physics. */
export function simModelOf(modelKey: string): string {
  const def = SYMBOL_LIBRARY[modelKey];
  return def?.simModel ?? def?.modelKey ?? modelKey;
}

/** SVG glyph key for canvas and palette thumbs. */
export function glyphKeyOf(modelKey: string): string {
  const def = SYMBOL_LIBRARY[modelKey];
  return def?.glyphKey ?? def?.simModel ?? def?.modelKey ?? modelKey;
}

export function isBjtNpnPart(modelKey: string): boolean {
  return simModelOf(modelKey) === 'bjt_npn';
}

export function isNmosPart(modelKey: string): boolean {
  return simModelOf(modelKey) === 'nmos';
}

export function isNe555Part(modelKey: string): boolean {
  return simModelOf(modelKey) === 'ne555';
}

export const SYMBOL_LIBRARY: Record<string, SymbolDef> = {
  battery: {
    modelKey: 'battery',
    label: 'lab.symbol.battery',
    pins: [
      { name: 'p', ox: 40, oy: 0 },
      { name: 'n', ox: -40, oy: 0 }
    ],
    defaultParams: { v: 5, esr: 0 },
    paramDefs: [
      { key: 'v', label: 'lab.param.voltage', type: 'number', min: 0, step: 0.1, unit: 'V' },
      {
        key: 'esr',
        label: 'lab.param.esr',
        type: 'number',
        min: 0,
        step: 0.1,
        unit: 'Ω'
      }
    ],
    width: 48,
    height: 36
  },
  ac_source: {
    modelKey: 'ac_source',
    label: 'lab.symbol.ac_source',
    pins: [
      { name: 'p', ox: 40, oy: 0 },
      { name: 'n', ox: -40, oy: 0 }
    ],
    defaultParams: { mag: 1, phase: 0, freq: 50 },
    paramDefs: [
      { key: 'mag', label: 'lab.param.acMag', type: 'number', min: 0, step: 0.1, unit: 'V' },
      { key: 'phase', label: 'lab.param.acPhase', type: 'number', min: -180, step: 15, unit: '°' },
      { key: 'freq', label: 'lab.param.acFreq', type: 'number', min: 0, step: 1, unit: 'Hz' }
    ],
    width: 48,
    height: 36
  },
  op_amp: {
    modelKey: 'op_amp',
    label: 'lab.symbol.op_amp',
    teachingNote: 'lab.modelNote.op_amp',
    pins: [
      { name: 'inp', ox: -40, oy: -16 },
      { name: 'inn', ox: -40, oy: 16 },
      { name: 'out', ox: 44, oy: 0 }
    ],
    defaultParams: { gain: 1e5, vMax: 15, vMin: -15 },
    paramDefs: [
      { key: 'gain', label: 'lab.param.gain', type: 'number', min: 1, step: 1000, unit: '' },
      { key: 'vMax', label: 'lab.param.vMax', type: 'number', step: 1, unit: 'V' },
      { key: 'vMin', label: 'lab.param.vMin', type: 'number', step: 1, unit: 'V' }
    ],
    width: 56,
    height: 48
  },
  bjt_npn: {
    modelKey: 'bjt_npn',
    label: 'lab.symbol.bjt_npn',
    teachingNote: 'lab.modelNote.bjt_npn',
    pins: [
      { name: 'c', ox: 0, oy: -40 },
      { name: 'b', ox: -40, oy: 0 },
      { name: 'e', ox: 0, oy: 40 }
    ],
    // Small internal rb — external base resistor sets Ib; low RB can burn the part (~25 mA).
    defaultParams: { vf: 0.7, rb: 10, ron: 10, burned: false },
    paramDefs: [
      { key: 'vf', label: 'lab.param.forwardV', type: 'number', min: 0, step: 0.05, unit: 'V' },
      {
        key: 'rb',
        label: 'lab.param.baseResistance',
        type: 'number',
        min: 1,
        step: 5,
        unit: 'Ω'
      },
      {
        key: 'ron',
        label: 'lab.param.onResistance',
        type: 'number',
        min: 0.1,
        step: 1,
        unit: 'Ω'
      }
    ],
    width: 40,
    height: 56
  },
  /** Common TO-92 NPN — same teaching switch model as bjt_npn (not a SPICE BC547). */
  bc547: {
    modelKey: 'bc547',
    simModel: 'bjt_npn',
    glyphKey: 'bjt_npn',
    label: 'lab.symbol.bc547',
    teachingNote: 'lab.modelNote.bc547',
    pins: [
      { name: 'c', ox: 0, oy: -40 },
      { name: 'b', ox: -40, oy: 0 },
      { name: 'e', ox: 0, oy: 40 }
    ],
    // Small internal rb so a low external base resistor can burn the part (~25 mA Ib).
    defaultParams: { vf: 0.7, rb: 10, ron: 10, burned: false },
    paramDefs: [
      { key: 'vf', label: 'lab.param.forwardV', type: 'number', min: 0, step: 0.05, unit: 'V' },
      {
        key: 'rb',
        label: 'lab.param.baseResistance',
        type: 'number',
        min: 1,
        step: 5,
        unit: 'Ω'
      },
      {
        key: 'ron',
        label: 'lab.param.onResistance',
        type: 'number',
        min: 0.1,
        step: 1,
        unit: 'Ω'
      }
    ],
    width: 40,
    height: 56
  },
  nmos: {
    modelKey: 'nmos',
    label: 'lab.symbol.nmos',
    teachingNote: 'lab.modelNote.nmos',
    pins: [
      { name: 'd', ox: 0, oy: -40 },
      { name: 'g', ox: -40, oy: 0 },
      { name: 's', ox: 0, oy: 40 }
    ],
    defaultParams: { vth: 2, ron: 5, burned: false },
    paramDefs: [
      { key: 'vth', label: 'lab.param.thresholdV', type: 'number', min: 0, step: 0.1, unit: 'V' },
      {
        key: 'ron',
        label: 'lab.param.onResistance',
        type: 'number',
        min: 0.1,
        step: 1,
        unit: 'Ω'
      }
    ],
    width: 40,
    height: 56
  },
  ne555: {
    modelKey: 'ne555',
    label: 'lab.symbol.ne555',
    teachingNote: 'lab.modelNote.ne555',
    pins: [
      { name: 'gnd', ox: -36, oy: -36 },
      { name: 'trig', ox: -36, oy: -12 },
      { name: 'out', ox: -36, oy: 12 },
      { name: 'reset', ox: -36, oy: 36 },
      { name: 'ctrl', ox: 36, oy: 36 },
      { name: 'thr', ox: 36, oy: 12 },
      { name: 'dis', ox: 36, oy: -12 },
      { name: 'vcc', ox: 36, oy: -36 }
    ],
    defaultParams: { ron: 10, burned: false },
    paramDefs: [
      {
        key: 'ron',
        label: 'lab.param.onResistance',
        type: 'number',
        min: 0.1,
        step: 1,
        unit: 'Ω'
      }
    ],
    width: 72,
    height: 72
  },
  ammeter: {
    modelKey: 'ammeter',
    label: 'lab.symbol.ammeter',
    teachingNote: 'lab.modelNote.ammeter',
    pins: [
      { name: 'a', ox: -40, oy: 0 },
      { name: 'b', ox: 40, oy: 0 }
    ],
    defaultParams: { r: 0.01, burned: false },
    paramDefs: [
      {
        key: 'r',
        label: 'lab.param.senseResistance',
        type: 'number',
        min: 0.001,
        step: 0.01,
        unit: 'Ω'
      }
    ],
    width: 44,
    height: 36
  },
  voltmeter: {
    modelKey: 'voltmeter',
    label: 'lab.symbol.voltmeter',
    schematicOnly: true,
    pins: [
      { name: 'p', ox: -40, oy: 0 },
      { name: 'n', ox: 40, oy: 0 }
    ],
    defaultParams: {},
    paramDefs: [],
    width: 44,
    height: 36
  },
  resistor: {
    modelKey: 'resistor',
    label: 'lab.symbol.resistor',
    pins: [
      { name: 'a', ox: -50, oy: 0 },
      { name: 'b', ox: 50, oy: 0 }
    ],
    defaultParams: { r: 220, burned: false },
    paramDefs: [
      {
        key: 'r',
        label: 'lab.param.resistance',
        type: 'number',
        min: 0.1,
        step: 10,
        unit: 'Ω'
      }
    ],
    teachingNote: 'lab.modelNote.resistor',
    width: 56,
    height: 24
  },
  led: {
    modelKey: 'led',
    label: 'lab.symbol.led',
    displayScale: 0.68,
    pins: [
      { name: 'a', ox: 0, oy: -40 },
      { name: 'c', ox: 0, oy: 40 }
    ],
    defaultParams: { color: 0, vf: 2, ron: 20, burned: false },
    paramDefs: [
      {
        key: 'color',
        label: 'lab.param.ledColor',
        type: 'enum',
        options: LED_COLORS.map((o) => ({ value: o.id, label: o.labelKey }))
      },
      { key: 'vf', label: 'lab.param.forwardV', type: 'number', min: 0, step: 0.1, unit: 'V' },
      {
        key: 'ron',
        label: 'lab.param.onResistance',
        type: 'number',
        min: 0.1,
        step: 1,
        unit: 'Ω'
      }
    ],
    width: 28,
    height: 48
  },
  diode: {
    modelKey: 'diode',
    label: 'lab.symbol.diode',
    teachingNote: 'lab.modelNote.diode',
    displayScale: 0.68,
    pins: [
      { name: 'a', ox: -40, oy: 0 },
      { name: 'c', ox: 40, oy: 0 }
    ],
    defaultParams: { vf: 0.7, ron: 10, burned: false },
    paramDefs: [
      { key: 'vf', label: 'lab.param.forwardV', type: 'number', min: 0, step: 0.05, unit: 'V' },
      {
        key: 'ron',
        label: 'lab.param.onResistance',
        type: 'number',
        min: 0.1,
        step: 1,
        unit: 'Ω'
      }
    ],
    width: 44,
    height: 28
  },
  zener: {
    modelKey: 'zener',
    label: 'lab.symbol.zener',
    teachingNote: 'lab.modelNote.zener',
    displayScale: 0.68,
    pins: [
      { name: 'a', ox: -40, oy: 0 },
      { name: 'c', ox: 40, oy: 0 }
    ],
    defaultParams: { vf: 0.7, vz: 5.1, ron: 10, burned: false },
    paramDefs: [
      { key: 'vf', label: 'lab.param.forwardV', type: 'number', min: 0, step: 0.05, unit: 'V' },
      { key: 'vz', label: 'lab.param.zenerV', type: 'number', min: 0.5, step: 0.1, unit: 'V' },
      {
        key: 'ron',
        label: 'lab.param.onResistance',
        type: 'number',
        min: 0.1,
        step: 1,
        unit: 'Ω'
      }
    ],
    width: 44,
    height: 28
  },
  fuse: {
    modelKey: 'fuse',
    label: 'lab.symbol.fuse',
    teachingNote: 'lab.modelNote.fuse',
    displayScale: 0.7,
    pins: [
      { name: 'a', ox: -40, oy: 0 },
      { name: 'b', ox: 40, oy: 0 }
    ],
    defaultParams: { iMax: 0.1, ron: 0.05, burned: false },
    paramDefs: [
      { key: 'iMax', label: 'lab.param.fuseIMax', type: 'number', min: 0.01, step: 0.01, unit: 'A' },
      {
        key: 'ron',
        label: 'lab.param.onResistance',
        type: 'number',
        min: 0.01,
        step: 0.01,
        unit: 'Ω'
      }
    ],
    width: 48,
    height: 24
  },
  vreg_7805: {
    modelKey: 'vreg_7805',
    label: 'lab.symbol.vreg7805',
    teachingNote: 'lab.modelNote.vreg7805',
    displayScale: 0.72,
    pins: [
      { name: 'in', ox: -36, oy: 0 },
      { name: 'gnd', ox: 0, oy: 28 },
      { name: 'out', ox: 36, oy: 0 }
    ],
    defaultParams: { vOut: 5, dropout: 2, ron: 2, burned: false },
    paramDefs: [
      { key: 'vOut', label: 'lab.param.regVout', type: 'number', min: 1, step: 0.1, unit: 'V' },
      { key: 'dropout', label: 'lab.param.regDropout', type: 'number', min: 0, step: 0.1, unit: 'V' },
      {
        key: 'ron',
        label: 'lab.param.onResistance',
        type: 'number',
        min: 0.1,
        step: 0.5,
        unit: 'Ω'
      }
    ],
    width: 52,
    height: 40
  },
  switch: {
    modelKey: 'switch',
    label: 'lab.symbol.switch',
    pins: [
      { name: 'a', ox: -50, oy: 0 },
      { name: 'b', ox: 50, oy: 0 }
    ],
    defaultParams: { closed: true, openAt: -1, closeAt: -1 },
    paramDefs: [
      { key: 'closed', label: 'lab.param.closed', type: 'boolean' },
      {
        key: 'openAt',
        label: 'lab.param.openAt',
        type: 'number',
        min: -1,
        step: 0.1,
        unit: 's'
      },
      {
        key: 'closeAt',
        label: 'lab.param.closeAt',
        type: 'number',
        min: -1,
        step: 0.1,
        unit: 's'
      }
    ],
    width: 56,
    height: 28
  },
  pushbutton: {
    modelKey: 'pushbutton',
    simModel: 'switch',
    glyphKey: 'pushbutton',
    label: 'lab.symbol.pushbutton',
    teachingNote: 'lab.modelNote.pushbutton',
    pins: [
      { name: 'a', ox: -50, oy: 0 },
      { name: 'b', ox: 50, oy: 0 }
    ],
    defaultParams: { closed: false, openAt: -1, closeAt: -1 },
    paramDefs: [
      { key: 'closed', label: 'lab.param.pressed', type: 'momentary' },
      {
        key: 'openAt',
        label: 'lab.param.openAt',
        type: 'number',
        min: -1,
        step: 0.1,
        unit: 's'
      },
      {
        key: 'closeAt',
        label: 'lab.param.closeAt',
        type: 'number',
        min: -1,
        step: 0.1,
        unit: 's'
      }
    ],
    width: 56,
    height: 28
  },
  ldr: {
    modelKey: 'ldr',
    label: 'lab.symbol.ldr',
    teachingNote: 'lab.modelNote.ldr',
    pins: [
      { name: 'a', ox: -50, oy: 0 },
      { name: 'b', ox: 50, oy: 0 }
    ],
    defaultParams: { light: 0.5, rDark: 100000, rLight: 1000, burned: false },
    paramDefs: [
      {
        key: 'light',
        label: 'lab.param.light',
        type: 'slider',
        min: 0,
        max: 1,
        step: 0.05,
        unit: ''
      },
      {
        key: 'rDark',
        label: 'lab.param.rDark',
        type: 'number',
        min: 100,
        step: 1000,
        unit: 'Ω'
      },
      {
        key: 'rLight',
        label: 'lab.param.rLight',
        type: 'number',
        min: 10,
        step: 100,
        unit: 'Ω'
      }
    ],
    width: 56,
    height: 28
  },
  buzzer: {
    modelKey: 'buzzer',
    label: 'lab.symbol.buzzer',
    teachingNote: 'lab.modelNote.buzzer',
    displayScale: 0.85,
    pins: [
      { name: 'a', ox: 0, oy: -40 },
      { name: 'c', ox: 0, oy: 40 }
    ],
    defaultParams: { vf: 1, ron: 50, burned: false },
    paramDefs: [
      { key: 'vf', label: 'lab.param.forwardV', type: 'number', min: 0, step: 0.1, unit: 'V' },
      {
        key: 'ron',
        label: 'lab.param.onResistance',
        type: 'number',
        min: 1,
        step: 10,
        unit: 'Ω'
      }
    ],
    width: 36,
    height: 48
  },
  dc_motor: {
    modelKey: 'dc_motor',
    label: 'lab.symbol.dc_motor',
    teachingNote: 'lab.modelNote.dc_motor',
    pins: [
      { name: 'a', ox: -50, oy: 0 },
      { name: 'b', ox: 50, oy: 0 }
    ],
    defaultParams: { ron: 15, vStart: 1, burned: false },
    paramDefs: [
      {
        key: 'ron',
        label: 'lab.param.onResistance',
        type: 'number',
        min: 0.5,
        step: 1,
        unit: 'Ω'
      },
      {
        key: 'vStart',
        label: 'lab.param.vStart',
        type: 'number',
        min: 0,
        step: 0.1,
        unit: 'V'
      }
    ],
    width: 56,
    height: 36
  },
  arduino_dio: {
    modelKey: 'arduino_dio',
    label: 'lab.symbol.arduino_dio',
    teachingNote: 'lab.modelNote.arduino_dio',
    pins: [
      { name: 'sig', ox: 40, oy: 0 },
      { name: 'gnd', ox: -40, oy: 0 }
    ],
    defaultParams: { mode: 1, level: 1, vHigh: 5, ron: 40 },
    paramDefs: [
      {
        key: 'mode',
        label: 'lab.param.pinMode',
        type: 'enum',
        options: [
          { value: 0, label: 'lab.param.pinModeInput' },
          { value: 1, label: 'lab.param.pinModeOutput' }
        ]
      },
      {
        key: 'level',
        label: 'lab.param.pinLevel',
        type: 'enum',
        options: [
          { value: 0, label: 'lab.param.pinLevelLow' },
          { value: 1, label: 'lab.param.pinLevelHigh' }
        ]
      },
      {
        key: 'vHigh',
        label: 'lab.param.vHigh',
        type: 'number',
        min: 1,
        step: 0.1,
        unit: 'V'
      },
      {
        key: 'ron',
        label: 'lab.param.onResistance',
        type: 'number',
        min: 1,
        step: 5,
        unit: 'Ω'
      }
    ],
    width: 56,
    height: 36
  },
  arduino_i2c: {
    modelKey: 'arduino_i2c',
    label: 'lab.symbol.arduino_i2c',
    teachingNote: 'lab.modelNote.arduino_i2c',
    displayScale: 0.9,
    pins: [
      { name: 'v5', ox: 48, oy: -28 },
      { name: 'gnd', ox: 48, oy: -10 },
      { name: 'scl', ox: 48, oy: 10 },
      { name: 'sda', ox: 48, oy: 28 }
    ],
    defaultParams: { vHigh: 5 },
    paramDefs: [
      {
        key: 'vHigh',
        label: 'lab.param.vHigh',
        type: 'number',
        min: 1,
        step: 0.1,
        unit: 'V'
      }
    ],
    width: 64,
    height: 64
  },
  ssd1306: {
    modelKey: 'ssd1306',
    label: 'lab.symbol.ssd1306',
    teachingNote: 'lab.modelNote.ssd1306',
    displayScale: 0.95,
    pins: [
      { name: 'vcc', ox: -52, oy: -28 },
      { name: 'gnd', ox: -52, oy: -10 },
      { name: 'scl', ox: -52, oy: 10 },
      { name: 'sda', ox: -52, oy: 28 }
    ],
    defaultParams: { addr: 60, rLoad: 500 },
    paramDefs: [
      {
        key: 'addr',
        label: 'lab.param.i2cAddr',
        type: 'enum',
        options: [
          { value: 60, label: 'lab.param.i2cAddr3C' },
          { value: 61, label: 'lab.param.i2cAddr3D' }
        ]
      },
      {
        key: 'rLoad',
        label: 'lab.param.supplyLoad',
        type: 'number',
        min: 50,
        step: 50,
        unit: 'Ω'
      }
    ],
    width: 72,
    height: 64
  },
  relay: {
    modelKey: 'relay',
    label: 'lab.symbol.relay',
    teachingNote: 'lab.modelNote.relay',
    pins: [
      { name: 'cp', ox: -40, oy: -28 },
      { name: 'cn', ox: -40, oy: 28 },
      { name: 'a', ox: 40, oy: -20 },
      { name: 'b', ox: 40, oy: 20 }
    ],
    defaultParams: {
      rCoil: 400,
      vPull: 3.5,
      ron: 0.1,
      closed: false,
      openAt: -1,
      closeAt: -1
    },
    paramDefs: [
      {
        key: 'rCoil',
        label: 'lab.param.rCoil',
        type: 'number',
        min: 1,
        step: 10,
        unit: 'Ω'
      },
      {
        key: 'vPull',
        label: 'lab.param.vPull',
        type: 'number',
        min: 0,
        step: 0.1,
        unit: 'V'
      },
      {
        key: 'ron',
        label: 'lab.param.onResistance',
        type: 'number',
        min: 0.01,
        step: 0.1,
        unit: 'Ω'
      },
      { key: 'closed', label: 'lab.param.closed', type: 'boolean' },
      {
        key: 'openAt',
        label: 'lab.param.openAt',
        type: 'number',
        min: -1,
        step: 0.1,
        unit: 's'
      },
      {
        key: 'closeAt',
        label: 'lab.param.closeAt',
        type: 'number',
        min: -1,
        step: 0.1,
        unit: 's'
      }
    ],
    width: 56,
    height: 56
  },
  current_source: {
    modelKey: 'current_source',
    label: 'lab.symbol.current_source',
    pins: [
      { name: 'p', ox: 0, oy: -40 },
      { name: 'n', ox: 0, oy: 40 }
    ],
    defaultParams: { i: 0.01 },
    paramDefs: [
      { key: 'i', label: 'lab.param.current', type: 'number', min: 0, step: 0.001, unit: 'A' }
    ],
    width: 32,
    height: 48
  },
  capacitor: {
    modelKey: 'capacitor',
    label: 'lab.symbol.capacitor',
    teachingNote: 'lab.modelNote.capacitor',
    pins: [
      { name: 'a', ox: -40, oy: 0 },
      { name: 'b', ox: 40, oy: 0 }
    ],
    defaultParams: { c: 1e-6, vmax: 16, burned: false },
    paramDefs: [
      {
        key: 'c',
        label: 'lab.param.capacitance',
        type: 'number',
        min: 1e-12,
        step: 1e-7,
        unit: 'F'
      },
      {
        key: 'vmax',
        label: 'lab.param.capVmax',
        type: 'number',
        min: 1,
        step: 1,
        unit: 'V'
      },
      {
        key: 'ic',
        label: 'lab.param.capIc',
        type: 'number',
        step: 0.1,
        unit: 'V'
      }
    ],
    width: 44,
    height: 28
  },
  inductor: {
    modelKey: 'inductor',
    label: 'lab.symbol.inductor',
    pins: [
      { name: 'a', ox: -50, oy: 0 },
      { name: 'b', ox: 50, oy: 0 }
    ],
    defaultParams: { l: 0.01 },
    paramDefs: [
      {
        key: 'l',
        label: 'lab.param.inductance',
        type: 'number',
        min: 1e-9,
        step: 0.001,
        unit: 'H'
      },
      {
        key: 'ic',
        label: 'lab.param.inductorIc',
        type: 'number',
        step: 0.01,
        unit: 'A'
      }
    ],
    width: 56,
    height: 28
  },
  potentiometer: {
    modelKey: 'potentiometer',
    label: 'lab.symbol.potentiometer',
    pins: [
      { name: 'a', ox: -50, oy: 0 },
      { name: 'w', ox: 0, oy: 40 },
      { name: 'b', ox: 50, oy: 0 }
    ],
    defaultParams: { r: 10000, pos: 0.5 },
    paramDefs: [
      {
        key: 'r',
        label: 'lab.param.resistance',
        type: 'number',
        min: 1,
        step: 100,
        unit: 'Ω'
      },
      {
        key: 'pos',
        label: 'lab.param.wiper',
        type: 'slider',
        min: 0.01,
        max: 0.99,
        step: 0.01,
        unit: ''
      }
    ],
    width: 56,
    height: 48
  },
  pulse_source: {
    modelKey: 'pulse_source',
    label: 'lab.symbol.pulse_source',
    pins: [
      { name: 'p', ox: 40, oy: 0 },
      { name: 'n', ox: -40, oy: 0 }
    ],
    defaultParams: { v1: 0, v2: 5, td: 0.001, pw: 0.004, period: 0 },
    paramDefs: [
      { key: 'v1', label: 'lab.param.vInitial', type: 'number', min: 0, step: 0.1, unit: 'V' },
      { key: 'v2', label: 'lab.param.vPulse', type: 'number', min: 0, step: 0.1, unit: 'V' },
      { key: 'td', label: 'lab.param.delay', type: 'number', min: 0, step: 0.0005, unit: 's' },
      { key: 'pw', label: 'lab.param.pulseWidth', type: 'number', min: 0, step: 0.0005, unit: 's' },
      {
        key: 'period',
        label: 'lab.param.pulsePeriod',
        type: 'number',
        min: 0,
        step: 0.0005,
        unit: 's'
      }
    ],
    width: 48,
    height: 36
  },
  ground: {
    modelKey: 'ground',
    label: 'lab.symbol.ground',
    schematicOnly: true,
    pins: [{ name: 'g', ox: 0, oy: -20 }],
    defaultParams: {},
    paramDefs: [],
    width: 28,
    height: 32
  },
  junction: {
    modelKey: 'junction',
    label: 'lab.symbol.junction',
    schematicOnly: true,
    displayScale: 0.65,
    pins: [{ name: 'j', ox: 0, oy: 0 }],
    defaultParams: {},
    paramDefs: [],
    width: 10,
    height: 10
  }
};

export const PALETTE_ORDER = [
  'battery',
  'arduino_dio',
  'arduino_i2c',
  'ac_source',
  'pulse_source',
  'resistor',
  'potentiometer',
  'ldr',
  'led',
  'diode',
  'zener',
  'fuse',
  'vreg_7805',
  'buzzer',
  'switch',
  'pushbutton',
  'relay',
  'bjt_npn',
  'bc547',
  'nmos',
  'dc_motor',
  'ne555',
  'op_amp',
  'ssd1306',
  'current_source',
  'capacitor',
  'inductor',
  'ammeter',
  'voltmeter',
  'ground'
] as const;

/** Accordion groups for the Lab parts palette (keys ⊆ PALETTE_ORDER). */
export const PALETTE_GROUPS: ReadonlyArray<{
  id: string;
  labelKey: string;
  keys: readonly string[];
}> = [
  {
    id: 'sources',
    labelKey: 'lab.palette.group.sources',
    keys: ['battery', 'ac_source', 'pulse_source', 'current_source', 'arduino_dio', 'arduino_i2c']
  },
  {
    id: 'passives',
    labelKey: 'lab.palette.group.passives',
    keys: ['resistor', 'potentiometer', 'ldr', 'capacitor', 'inductor']
  },
  {
    id: 'diodes',
    labelKey: 'lab.palette.group.diodes',
    keys: ['diode', 'led', 'zener']
  },
  {
    id: 'power',
    labelKey: 'lab.palette.group.power',
    keys: ['fuse', 'vreg_7805']
  },
  {
    id: 'transistors',
    labelKey: 'lab.palette.group.transistors',
    keys: ['bjt_npn', 'bc547', 'nmos']
  },
  {
    id: 'switches',
    labelKey: 'lab.palette.group.switches',
    keys: ['switch', 'pushbutton', 'relay']
  },
  {
    id: 'actuators',
    labelKey: 'lab.palette.group.actuators',
    keys: ['buzzer', 'dc_motor']
  },
  {
    id: 'ics',
    labelKey: 'lab.palette.group.ics',
    keys: ['ne555', 'op_amp', 'ssd1306']
  },
  {
    id: 'meters',
    labelKey: 'lab.palette.group.meters',
    keys: ['ammeter', 'voltmeter']
  },
  {
    id: 'ground',
    labelKey: 'lab.palette.group.ground',
    keys: ['ground']
  }
];

export function symbolOf(modelKey: string): SymbolDef {
  const def = SYMBOL_LIBRARY[modelKey];
  if (!def) throw new Error(`Unknown modelKey '${modelKey}'`);
  return def;
}
