import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** Zener shunt regulator: 12 V → Rs → (Dz || Rl). Cathode at load node. */
export function createZenerPreset(): SchematicDocument {
  resetIdSeq(130);
  const vb = createComponent('battery', 80, 200, 'VB');
  vb.params = { v: 12, esr: 0 };
  const rs = createComponent('resistor', 220, 120, 'RS');
  rs.params = { r: 470 };
  const jMid = createComponent('junction', 360, 120, 'JM');
  const dz = createComponent('zener', 360, 200, 'DZ1');
  dz.params = { vf: 0.7, vz: 5.1, ron: 10, burned: false };
  dz.rotation = 90;
  const rl = createComponent('resistor', 460, 200, 'RL');
  rl.params = { r: 1000 };
  rl.rotation = 90;
  const jRet = createComponent('junction', 360, 300, 'J1');
  const gnd = createComponent('ground', 80, 320, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [vb, rs, jMid, dz, rl, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VB', pin: 'p' }, b: { componentId: 'RS', pin: 'a' } },
      { id: 'W2', a: { componentId: 'RS', pin: 'b' }, b: { componentId: 'JM', pin: 'j' } },
      { id: 'W3', a: { componentId: 'JM', pin: 'j' }, b: { componentId: 'DZ1', pin: 'c' } },
      { id: 'W4', a: { componentId: 'DZ1', pin: 'a' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W5', a: { componentId: 'JM', pin: 'j' }, b: { componentId: 'RL', pin: 'a' } },
      { id: 'W6', a: { componentId: 'RL', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W7', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W8', a: { componentId: 'VB', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
