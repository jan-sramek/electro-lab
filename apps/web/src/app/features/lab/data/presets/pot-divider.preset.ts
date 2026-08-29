import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** Potentiometer divider: 5 V across pot, wiper to sense net. */
export function createPotDividerPreset(): SchematicDocument {
  resetIdSeq(40);
  const v1 = createComponent('battery', 100, 160, 'V1');
  const pot = createComponent('potentiometer', 300, 160, 'POT1');
  pot.params = { r: 10000, pos: 0.3 };
  const gnd = createComponent('ground', 100, 280, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [v1, pot, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'POT1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'POT1', pin: 'b' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W3', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
