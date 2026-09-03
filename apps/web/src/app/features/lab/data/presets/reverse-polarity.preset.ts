import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** Series diode reverse-polarity protection before an LED load. */
export function createReversePolarityPreset(): SchematicDocument {
  resetIdSeq(150);
  const vb = createComponent('battery', 80, 180, 'VB');
  vb.params = { v: 5, esr: 0 };
  const dProt = createComponent('diode', 220, 120, 'Dprot');
  dProt.params = { vf: 0.7, ron: 10, burned: false };
  const r1 = createComponent('resistor', 360, 120, 'R1');
  r1.params = { r: 220 };
  const d1 = createComponent('led', 500, 180, 'D1');
  d1.params = { ...d1.params, color: 1 };
  const jRet = createComponent('junction', 500, 280, 'J1');
  const gnd = createComponent('ground', 80, 300, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [vb, dProt, r1, d1, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VB', pin: 'p' }, b: { componentId: 'Dprot', pin: 'a' } },
      { id: 'W2', a: { componentId: 'Dprot', pin: 'c' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W4', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W5', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W6', a: { componentId: 'VB', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
