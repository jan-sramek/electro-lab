import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';
import { symbolDisplayScale } from '../symbol-scale';

/** Linear 7805: 12 V in → regulated 5 V out into Rl. */
export function createVreg7805Preset(): SchematicDocument {
  resetIdSeq(140);
  const vb = createComponent('battery', 80, 200, 'VB');
  vb.params = { v: 12, esr: 0 };
  // Align under battery − pin (global symbol scale).
  const batN = 80 + -40 * symbolDisplayScale('battery');
  const jBatN = createComponent('junction', batN, 360, 'JBN');
  const u1 = createComponent('vreg_7805', 260, 140, 'U1');
  u1.params = { vOut: 5, dropout: 2, ron: 2, burned: false };
  const jOut = createComponent('junction', 400, 140, 'JO');
  const rl = createComponent('resistor', 400, 220, 'RL');
  rl.params = { r: 1000 };
  rl.rotation = 90;
  const jRet = createComponent('junction', 400, 300, 'J1');
  const gnd = createComponent('ground', 400, 380, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [vb, jBatN, u1, jOut, rl, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VB', pin: 'p' }, b: { componentId: 'U1', pin: 'in' } },
      { id: 'W2', a: { componentId: 'U1', pin: 'out' }, b: { componentId: 'JO', pin: 'j' } },
      { id: 'W3', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'RL', pin: 'a' } },
      { id: 'W4', a: { componentId: 'RL', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W5', a: { componentId: 'U1', pin: 'gnd' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W6', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W7', a: { componentId: 'VB', pin: 'n' }, b: { componentId: 'JBN', pin: 'j' } },
      { id: 'W8', a: { componentId: 'JBN', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
