import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';
import { symbolDisplayScale } from '../symbol-scale';

/**
 * Full-wave bridge — junctions sit on AC pin columns (scaled) so feeds are vertical.
 */
export function createBridgePreset(): SchematicDocument {
  resetIdSeq(110);
  const acX = 120;
  const acY = 200;
  const ac = createComponent('ac_source', acX, acY, 'AC1');
  ac.params = { mag: 10, phase: 0, freq: 50 };
  const sAc = symbolDisplayScale('ac_source');
  const acP = acX + 40 * sAc;
  const acN = acX + -40 * sAc;

  const jAcP = createComponent('junction', acP, 40, 'JACP');
  const jAcN = createComponent('junction', acN, 400, 'JACN');
  const jDcP = createComponent('junction', 480, 40, 'JDCP');
  const jDcN = createComponent('junction', 480, 280, 'JDCN');

  const d1 = createComponent('diode', 320, 40, 'D1');
  d1.params = { vf: 0.7, ron: 10, burned: false };

  const d2 = createComponent('diode', acP, 160, 'D2');
  d2.params = { vf: 0.7, ron: 10, burned: false };
  d2.rotation = 90;
  const jD2 = createComponent('junction', acP, 280, 'JD2');

  const jD3 = createComponent('junction', acN, 160, 'JD3');
  const d3 = createComponent('diode', 480, 160, 'D3');
  d3.params = { vf: 0.7, ron: 10, burned: false };
  d3.rotation = 270;

  const d4 = createComponent('diode', 280, 400, 'D4');
  d4.params = { vf: 0.7, ron: 10, burned: false };
  d4.rotation = 180;
  const jD4 = createComponent('junction', 480, 400, 'JD4');

  const r1 = createComponent('resistor', 560, 160, 'R1');
  r1.params = { r: 1000 };
  r1.rotation = 90;
  const gnd = createComponent('ground', 480, 460, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [ac, jAcP, jAcN, jDcP, jDcN, d1, d2, d3, d4, jD2, jD3, jD4, r1, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'AC1', pin: 'p' }, b: { componentId: 'JACP', pin: 'j' } },
      { id: 'W2', a: { componentId: 'AC1', pin: 'n' }, b: { componentId: 'JACN', pin: 'j' } },
      { id: 'W3', a: { componentId: 'JACP', pin: 'j' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W4', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'JDCP', pin: 'j' } },
      { id: 'W5', a: { componentId: 'JACP', pin: 'j' }, b: { componentId: 'D2', pin: 'c' } },
      { id: 'W6', a: { componentId: 'D2', pin: 'a' }, b: { componentId: 'JD2', pin: 'j' } },
      { id: 'W7', a: { componentId: 'JD2', pin: 'j' }, b: { componentId: 'JDCN', pin: 'j' } },
      { id: 'W8', a: { componentId: 'JACN', pin: 'j' }, b: { componentId: 'D4', pin: 'c' } },
      { id: 'W9', a: { componentId: 'D4', pin: 'a' }, b: { componentId: 'JD4', pin: 'j' } },
      { id: 'W10', a: { componentId: 'JD4', pin: 'j' }, b: { componentId: 'JDCN', pin: 'j' } },
      { id: 'W11', a: { componentId: 'JACN', pin: 'j' }, b: { componentId: 'JD3', pin: 'j' } },
      { id: 'W12', a: { componentId: 'JD3', pin: 'j' }, b: { componentId: 'D3', pin: 'a' } },
      { id: 'W13', a: { componentId: 'D3', pin: 'c' }, b: { componentId: 'JDCP', pin: 'j' } },
      { id: 'W14', a: { componentId: 'JDCP', pin: 'j' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W15', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'JDCN', pin: 'j' } },
      { id: 'W16', a: { componentId: 'JDCN', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
