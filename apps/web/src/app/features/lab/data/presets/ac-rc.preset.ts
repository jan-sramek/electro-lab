import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** AC low-pass: 1 Vrms AC → 1 kΩ → ~159 nF (fc ≈ 1 kHz). */
export function createAcRcPreset(): SchematicDocument {
  resetIdSeq(50);
  const ac = createComponent('ac_source', 80, 160, 'AC1');
  ac.params = { mag: 1, phase: 0 };
  const r1 = createComponent('resistor', 260, 100, 'R1');
  r1.params = { r: 1000 };
  const c1 = createComponent('capacitor', 420, 160, 'C1');
  c1.params = { c: 1 / (2 * Math.PI * 1000 * 1000) };
  const vm = createComponent('voltmeter', 420, 260, 'VM1');
  const gnd = createComponent('ground', 80, 280, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [ac, r1, c1, vm, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'AC1', pin: 'p' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'C1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'C1', pin: 'b' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W4', a: { componentId: 'AC1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W5', a: { componentId: 'VM1', pin: 'p' }, b: { componentId: 'C1', pin: 'a' } },
      { id: 'W6', a: { componentId: 'VM1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
