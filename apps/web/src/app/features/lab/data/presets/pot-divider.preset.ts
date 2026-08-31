import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** Potentiometer divider: supply on top, return on bottom — wiper free for probing. */
export function createPotDividerPreset(): SchematicDocument {
  resetIdSeq(40);
  const v1 = createComponent('battery', 120, 160, 'V1');
  const pot = createComponent('potentiometer', 320, 160, 'POT1');
  pot.params = { r: 10000, pos: 0.3 };
  // Align under pot.b so the drop is vertical (no long overlap with the return rail).
  const jRet = createComponent('junction', 340, 280, 'J1');
  const gnd = createComponent('ground', 120, 300, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [v1, pot, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'POT1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'POT1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W3', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W4', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
