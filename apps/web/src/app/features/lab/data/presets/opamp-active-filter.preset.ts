import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Inverting active first-order LPF: Zin=Rin, Zf=Rf∥C.
 * fc ≈ 1/(2π·Rf·C) ≈ 1.6 kHz. Run AC and sweep / probe OUT vs freq.
 */
export function createOpAmpActiveFilterPreset(): SchematicDocument {
  resetIdSeq(370);
  const ac = createComponent('ac_source', 80, 200, 'AC1');
  ac.params = { mag: 1, phase: 0, freq: 100 };
  const rin = createComponent('resistor', 220, 200, 'RIN');
  rin.params = { r: 10000 };
  const jSum = createComponent('junction', 340, 200, 'JS');
  const jTop = createComponent('junction', 340, 100, 'JT');
  const u1 = createComponent('op_amp', 420, 220, 'U1');
  const rf = createComponent('resistor', 400, 60, 'RF');
  rf.params = { r: 10000 };
  const cf = createComponent('capacitor', 480, 100, 'CF');
  cf.params = { c: 1e-8, vmax: 25, burned: false };
  const jOut = createComponent('junction', 540, 220, 'JO');
  const rl = createComponent('resistor', 640, 220, 'RL');
  rl.params = { r: 10000 };
  const jGnd = createComponent('junction', 200, 340, 'JG');
  const gnd = createComponent('ground', 80, 360, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [ac, rin, jSum, jTop, u1, rf, cf, jOut, rl, jGnd, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'AC1', pin: 'p' }, b: { componentId: 'RIN', pin: 'a' } },
      { id: 'W2', a: { componentId: 'RIN', pin: 'b' }, b: { componentId: 'JS', pin: 'j' } },
      { id: 'W3', a: { componentId: 'JS', pin: 'j' }, b: { componentId: 'U1', pin: 'inn' } },
      { id: 'W4', a: { componentId: 'JS', pin: 'j' }, b: { componentId: 'JT', pin: 'j' } },
      { id: 'W5', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'RF', pin: 'a' } },
      { id: 'W6', a: { componentId: 'RF', pin: 'b' }, b: { componentId: 'JO', pin: 'j' } },
      { id: 'W7', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'CF', pin: 'a' } },
      { id: 'W8', a: { componentId: 'CF', pin: 'b' }, b: { componentId: 'JO', pin: 'j' } },
      { id: 'W9', a: { componentId: 'U1', pin: 'out' }, b: { componentId: 'JO', pin: 'j' } },
      { id: 'W10', a: { componentId: 'U1', pin: 'inp' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W11', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'RL', pin: 'a' } },
      { id: 'W12', a: { componentId: 'RL', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W13', a: { componentId: 'AC1', pin: 'n' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W14', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
