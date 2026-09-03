import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** DC voltage divider: 5 V → R1 10 kΩ → JM → R2 10 kΩ → gnd. */
export function createVoltageDividerPreset(): SchematicDocument {
  resetIdSeq(440);
  const vb = createComponent('battery', 120, 160, 'VB');
  vb.params = { v: 5, esr: 0 };
  const r1 = createComponent('resistor', 280, 100, 'R1');
  r1.params = { r: 10000 };
  const jMid = createComponent('junction', 400, 160, 'JM');
  const r2 = createComponent('resistor', 480, 160, 'R2');
  r2.params = { r: 10000 };
  // Under R2.b so the drop is vertical (no long overlap with the return rail).
  const jRet = createComponent('junction', 530, 280, 'J1');
  const gnd = createComponent('ground', 120, 300, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [vb, r1, jMid, r2, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VB', pin: 'p' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'JM', pin: 'j' } },
      { id: 'W3', a: { componentId: 'JM', pin: 'j' }, b: { componentId: 'R2', pin: 'a' } },
      { id: 'W4', a: { componentId: 'R2', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W5', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W6', a: { componentId: 'VB', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
