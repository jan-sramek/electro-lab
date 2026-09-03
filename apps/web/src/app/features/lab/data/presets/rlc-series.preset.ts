import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** Series RLC: AC → R → L → C; voltmeter across C; mid node after L for probing. */
export function createRlcSeriesPreset(): SchematicDocument {
  resetIdSeq(410);
  const ac = createComponent('ac_source', 80, 160, 'AC1');
  ac.params = { mag: 1, phase: 0 };
  const r1 = createComponent('resistor', 200, 100, 'R1');
  r1.params = { r: 100 };
  const l1 = createComponent('inductor', 360, 100, 'L1');
  l1.params = { l: 0.01 };
  const jMid = createComponent('junction', 470, 160, 'JM');
  const c1 = createComponent('capacitor', 540, 160, 'C1');
  // Resonance ≈ 1 kHz with L = 10 mH
  c1.params = { c: 1 / (0.01 * (2 * Math.PI * 1000) ** 2) };
  const vm = createComponent('voltmeter', 470, 230, 'VM1');
  vm.rotation = 90; // p up / n down — probes don't share a horizontal rail
  // Under C1.b so the drop is vertical (no long overlap with the return rail).
  const jRet = createComponent('junction', 580, 300, 'J1');
  const gnd = createComponent('ground', 80, 320, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [ac, r1, l1, jMid, c1, vm, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'AC1', pin: 'p' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'L1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'L1', pin: 'b' }, b: { componentId: 'JM', pin: 'j' } },
      { id: 'W4', a: { componentId: 'JM', pin: 'j' }, b: { componentId: 'C1', pin: 'a' } },
      { id: 'W5', a: { componentId: 'C1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W6', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W7', a: { componentId: 'AC1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W8', a: { componentId: 'VM1', pin: 'p' }, b: { componentId: 'JM', pin: 'j' } },
      { id: 'W9', a: { componentId: 'VM1', pin: 'n' }, b: { componentId: 'J1', pin: 'j' } }
    ]
  };
  return assignNets(doc);
}
