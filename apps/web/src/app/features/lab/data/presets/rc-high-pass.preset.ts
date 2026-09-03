import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** AC high-pass: AC → C → R; vertical voltmeter across R; return on bottom rail. */
export function createRcHighPassPreset(): SchematicDocument {
  resetIdSeq(400);
  const ac = createComponent('ac_source', 100, 160, 'AC1');
  ac.params = { mag: 1, phase: 0 };
  const c1 = createComponent('capacitor', 280, 100, 'C1');
  // fc ≈ 1 kHz with R = 1 kΩ
  c1.params = { c: 1 / (2 * Math.PI * 1000 * 1000) };
  const jSense = createComponent('junction', 410, 160, 'JS');
  const r1 = createComponent('resistor', 460, 160, 'R1');
  r1.params = { r: 1000 };
  const vm = createComponent('voltmeter', 410, 230, 'VM1');
  vm.rotation = 90; // p up / n down — probes don't share a horizontal rail
  // Under R1.b so the drop is vertical (no long overlap with the return rail).
  const jRet = createComponent('junction', 510, 300, 'J1');
  const gnd = createComponent('ground', 100, 320, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [ac, c1, jSense, r1, vm, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'AC1', pin: 'p' }, b: { componentId: 'C1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'C1', pin: 'b' }, b: { componentId: 'JS', pin: 'j' } },
      { id: 'W3', a: { componentId: 'JS', pin: 'j' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W4', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W5', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W6', a: { componentId: 'AC1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W7', a: { componentId: 'VM1', pin: 'p' }, b: { componentId: 'JS', pin: 'j' } },
      { id: 'W8', a: { componentId: 'VM1', pin: 'n' }, b: { componentId: 'J1', pin: 'j' } }
    ]
  };
  return assignNets(doc);
}
