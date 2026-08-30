import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * NPN switch: base drive and collector LED share the battery via a top junction,
 * with a single bottom return rail to ground (no overlapping supply/return paths).
 */
export function createBjtSwitchPreset(): SchematicDocument {
  resetIdSeq(60);
  const vb = createComponent('battery', 100, 200, 'VB');
  vb.params = { v: 5, esr: 0 };
  const jVcc = createComponent('junction', 180, 160, 'JV');
  const rb = createComponent('resistor', 280, 120, 'RB');
  rb.params = { r: 1000 };
  const q1 = createComponent('bjt_npn', 420, 220, 'Q1');
  const am = createComponent('ammeter', 280, 60, 'AM1');
  const rc = createComponent('resistor', 420, 60, 'RC');
  rc.params = { r: 220 };
  const d1 = createComponent('led', 560, 140, 'D1');
  const jRet = createComponent('junction', 420, 320, 'J1');
  const gnd = createComponent('ground', 100, 340, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [vb, jVcc, rb, q1, am, rc, d1, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VB', pin: 'p' }, b: { componentId: 'JV', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'RB', pin: 'a' } },
      { id: 'W3', a: { componentId: 'RB', pin: 'b' }, b: { componentId: 'Q1', pin: 'b' } },
      { id: 'W4', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'AM1', pin: 'a' } },
      { id: 'W5', a: { componentId: 'AM1', pin: 'b' }, b: { componentId: 'RC', pin: 'a' } },
      { id: 'W6', a: { componentId: 'RC', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W7', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'Q1', pin: 'c' } },
      { id: 'W8', a: { componentId: 'Q1', pin: 'e' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W9', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W10', a: { componentId: 'VB', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
