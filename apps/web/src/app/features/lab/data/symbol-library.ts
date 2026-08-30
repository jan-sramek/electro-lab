import { LED_COLORS } from './led-colors';

export interface ParamDef {
  key: string;
  /** i18n key, e.g. lab.param.voltage */
  label: string;
  type: 'number' | 'boolean' | 'enum';
  min?: number;
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
  /** i18n key, e.g. lab.symbol.battery */
  label: string;
  /** Optional i18n key — teaching approximation note in inspector / palette. */
  teachingNote?: string;
  /** If true, omitted from CircuitEngine netlist; used only for grounding. */
  schematicOnly?: boolean;
  pins: PinDef[];
  defaultParams: Record<string, number | boolean>;
  paramDefs: ParamDef[];
  width: number;
  height: number;
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
    defaultParams: { mag: 1, phase: 0 },
    paramDefs: [
      { key: 'mag', label: 'lab.param.acMag', type: 'number', min: 0, step: 0.1, unit: 'V' },
      { key: 'phase', label: 'lab.param.acPhase', type: 'number', min: -180, step: 15, unit: '°' }
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
    defaultParams: { gain: 1e5 },
    paramDefs: [
      { key: 'gain', label: 'lab.param.gain', type: 'number', min: 1, step: 1000, unit: '' }
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
    defaultParams: { vf: 0.7, rb: 1000, ron: 10 },
    paramDefs: [
      { key: 'vf', label: 'lab.param.forwardV', type: 'number', min: 0, step: 0.05, unit: 'V' },
      {
        key: 'rb',
        label: 'lab.param.baseResistance',
        type: 'number',
        min: 1,
        step: 100,
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
  ammeter: {
    modelKey: 'ammeter',
    label: 'lab.symbol.ammeter',
    pins: [
      { name: 'a', ox: -40, oy: 0 },
      { name: 'b', ox: 40, oy: 0 }
    ],
    defaultParams: { r: 0.01 },
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
    defaultParams: { r: 220 },
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
    width: 56,
    height: 24
  },
  led: {
    modelKey: 'led',
    label: 'lab.symbol.led',
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
    pins: [
      { name: 'a', ox: -40, oy: 0 },
      { name: 'c', ox: 40, oy: 0 }
    ],
    defaultParams: { vf: 0.7, ron: 10 },
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
    pins: [
      { name: 'a', ox: -40, oy: 0 },
      { name: 'b', ox: 40, oy: 0 }
    ],
    defaultParams: { c: 1e-6 },
    paramDefs: [
      {
        key: 'c',
        label: 'lab.param.capacitance',
        type: 'number',
        min: 1e-12,
        step: 1e-7,
        unit: 'F'
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
        type: 'number',
        min: 0.01,
        step: 0.05,
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
    defaultParams: { v1: 0, v2: 5, td: 0.001, pw: 0.004 },
    paramDefs: [
      { key: 'v1', label: 'lab.param.vInitial', type: 'number', min: 0, step: 0.1, unit: 'V' },
      { key: 'v2', label: 'lab.param.vPulse', type: 'number', min: 0, step: 0.1, unit: 'V' },
      { key: 'td', label: 'lab.param.delay', type: 'number', min: 0, step: 0.0005, unit: 's' },
      { key: 'pw', label: 'lab.param.pulseWidth', type: 'number', min: 0, step: 0.0005, unit: 's' }
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
    pins: [{ name: 'j', ox: 0, oy: 0 }],
    defaultParams: {},
    paramDefs: [],
    width: 12,
    height: 12
  }
};

export const PALETTE_ORDER = [
  'battery',
  'ac_source',
  'pulse_source',
  'resistor',
  'potentiometer',
  'led',
  'diode',
  'switch',
  'bjt_npn',
  'op_amp',
  'current_source',
  'capacitor',
  'inductor',
  'ammeter',
  'voltmeter',
  'ground'
] as const;

export function symbolOf(modelKey: string): SymbolDef {
  const def = SYMBOL_LIBRARY[modelKey];
  if (!def) throw new Error(`Unknown modelKey '${modelKey}'`);
  return def;
}
