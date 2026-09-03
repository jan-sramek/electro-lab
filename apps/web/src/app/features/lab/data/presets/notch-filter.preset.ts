import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Series-LC shunt notch: AC → Rs → Vout → Rload to gnd; L–C series from Vout to gnd.
 * At resonance the LC shorts Vout (through Rs) so |Vout| dips; voltmeter on Vout.
 * Rs is required — an ideal source alone cannot show a notch.
 */
export function createNotchFilterPreset(): SchematicDocument {
  resetIdSeq(430);
  const ac = createComponent('ac_source', 100, 160, 'AC1');
  ac.params = { mag: 1, phase: 0 };
  const rs = createComponent('resistor', 240, 100, 'RS');
  rs.params = { r: 1000 };
  const jOut = createComponent('junction', 340, 160, 'JO');
  const rl = createComponent('resistor', 340, 230, 'RL');
  rl.params = { r: 1000 };
  rl.rotation = 90;
  const l1 = createComponent('inductor', 440, 100, 'L1');
  l1.params = { l: 0.01 };
  const c1 = createComponent('capacitor', 580, 160, 'C1');
  // Notch ≈ 1 kHz with L = 10 mH
  c1.params = { c: 1 / (0.01 * (2 * Math.PI * 1000) ** 2) };
  const vm = createComponent('voltmeter', 280, 230, 'VM1');
  vm.rotation = 90; // p up / n down — across Rload
  const jG = createComponent('junction', 340, 300, 'JG');
  // Directly under C1.b so the drop is vertical (no long overlap with the return rail).
  const jRet = createComponent('junction', 596, 300, 'J1');
  const gnd = createComponent('ground', 100, 320, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [ac, rs, jOut, rl, l1, c1, vm, jG, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'AC1', pin: 'p' }, b: { componentId: 'RS', pin: 'a' } },
      { id: 'W2', a: { componentId: 'RS', pin: 'b' }, b: { componentId: 'JO', pin: 'j' } },
      { id: 'W3', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'RL', pin: 'a' } },
      { id: 'W4', a: { componentId: 'RL', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W5', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'L1', pin: 'a' } },
      { id: 'W6', a: { componentId: 'L1', pin: 'b' }, b: { componentId: 'C1', pin: 'a' } },
      { id: 'W7', a: { componentId: 'C1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W8', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W9', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W10', a: { componentId: 'AC1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W11', a: { componentId: 'VM1', pin: 'p' }, b: { componentId: 'JO', pin: 'j' } },
      { id: 'W12', a: { componentId: 'VM1', pin: 'n' }, b: { componentId: 'JG', pin: 'j' } }
    ]
  };
  return assignNets(doc);
}
