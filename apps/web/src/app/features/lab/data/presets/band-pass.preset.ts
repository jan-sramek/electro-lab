import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** Series RLC band-pass: AC → R → L → C; voltmeter across R (VR peaks at resonance). */
export function createBandPassPreset(): SchematicDocument {
  resetIdSeq(420);
  const ac = createComponent('ac_source', 80, 160, 'AC1');
  ac.params = { mag: 1, phase: 0 };
  const jA = createComponent('junction', 180, 160, 'JA');
  const r1 = createComponent('resistor', 260, 100, 'R1');
  r1.params = { r: 100 };
  const jB = createComponent('junction', 360, 160, 'JB');
  const l1 = createComponent('inductor', 440, 100, 'L1');
  l1.params = { l: 0.01 };
  const c1 = createComponent('capacitor', 600, 160, 'C1');
  // Resonance ≈ 1 kHz with L = 10 mH
  c1.params = { c: 1 / (0.01 * (2 * Math.PI * 1000) ** 2) };
  const vm = createComponent('voltmeter', 260, 40, 'VM1');
  // Under C1.b so the drop is vertical (no long overlap with the return rail).
  const jRet = createComponent('junction', 640, 300, 'J1');
  const gnd = createComponent('ground', 80, 320, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [ac, jA, r1, jB, l1, c1, vm, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'AC1', pin: 'p' }, b: { componentId: 'JA', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JA', pin: 'j' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'JB', pin: 'j' } },
      { id: 'W4', a: { componentId: 'JB', pin: 'j' }, b: { componentId: 'L1', pin: 'a' } },
      { id: 'W5', a: { componentId: 'L1', pin: 'b' }, b: { componentId: 'C1', pin: 'a' } },
      { id: 'W6', a: { componentId: 'C1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W7', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W8', a: { componentId: 'AC1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W9', a: { componentId: 'VM1', pin: 'p' }, b: { componentId: 'JA', pin: 'j' } },
      { id: 'W10', a: { componentId: 'VM1', pin: 'n' }, b: { componentId: 'JB', pin: 'j' } }
    ]
  };
  return assignNets(doc);
}
