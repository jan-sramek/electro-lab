import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** RC step: 5 V → 1 kΩ → 1 µF to gnd (for transient teaching). */
export function createRcStepPreset(): SchematicDocument {
  resetIdSeq(20);
  const v1 = createComponent('battery', 100, 160, 'V1');
  const r1 = createComponent('resistor', 280, 100, 'R1');
  r1.params = { r: 1000 };
  const c1 = createComponent('capacitor', 440, 160, 'C1');
  c1.params = { c: 1e-6 };
  const gnd = createComponent('ground', 100, 260, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [v1, r1, c1, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'C1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'C1', pin: 'b' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W4', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
