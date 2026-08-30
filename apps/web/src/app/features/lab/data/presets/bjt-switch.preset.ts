import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** NPN switch: base from 5 V through Rb, collector LED + Rc from 5 V. */
export function createBjtSwitchPreset(): SchematicDocument {
  resetIdSeq(60);
  const vb = createComponent('battery', 80, 200, 'VB');
  vb.params = { v: 5, esr: 0 };
  const rb = createComponent('resistor', 220, 120, 'RB');
  rb.params = { r: 1000 };
  const q1 = createComponent('bjt_npn', 360, 200, 'Q1');
  const rc = createComponent('resistor', 360, 80, 'RC');
  rc.params = { r: 220 };
  const d1 = createComponent('led', 500, 140, 'D1');
  const am = createComponent('ammeter', 220, 80, 'AM1');
  const gnd = createComponent('ground', 80, 320, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [vb, rb, q1, rc, d1, am, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VB', pin: 'p' }, b: { componentId: 'RB', pin: 'a' } },
      { id: 'W2', a: { componentId: 'RB', pin: 'b' }, b: { componentId: 'Q1', pin: 'b' } },
      { id: 'W3', a: { componentId: 'VB', pin: 'p' }, b: { componentId: 'AM1', pin: 'a' } },
      { id: 'W4', a: { componentId: 'AM1', pin: 'b' }, b: { componentId: 'RC', pin: 'a' } },
      { id: 'W5', a: { componentId: 'RC', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W6', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'Q1', pin: 'c' } },
      { id: 'W7', a: { componentId: 'Q1', pin: 'e' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W8', a: { componentId: 'VB', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
