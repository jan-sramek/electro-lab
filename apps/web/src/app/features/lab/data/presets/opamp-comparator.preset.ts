import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Open-loop comparator: pot sets Vin on +in; −in at 2.5 V divider.
 * OUT rails high/low vs threshold — probe JO or watch LED.
 */
export function createOpAmpComparatorPreset(): SchematicDocument {
  resetIdSeq(320);
  const vcc = createComponent('battery', 60, 200, 'VCC');
  vcc.params = { v: 5, esr: 0 };
  const jTop = createComponent('junction', 160, 80, 'JT');
  const pot = createComponent('potentiometer', 240, 160, 'POT1');
  pot.params = { r: 10000, pos: 0.7 };
  const rA = createComponent('resistor', 240, 80, 'RA');
  rA.params = { r: 10000 };
  const rB = createComponent('resistor', 240, 280, 'RB');
  rB.params = { r: 10000 };
  const jThr = createComponent('junction', 320, 200, 'JTH');
  const u1 = createComponent('op_amp', 420, 200, 'U1');
  u1.params = { ...u1.params, vMax: 5, vMin: 0 };
  const jOut = createComponent('junction', 520, 160, 'JO');
  const rLed = createComponent('resistor', 600, 120, 'R1');
  rLed.params = { r: 470 };
  const d1 = createComponent('led', 680, 120, 'D1');
  d1.params = { ...d1.params, color: 0 };
  const jGnd = createComponent('junction', 160, 360, 'JG');
  const gnd = createComponent('ground', 60, 380, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [vcc, jTop, pot, rA, rB, jThr, u1, jOut, rLed, d1, jGnd, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VCC', pin: 'p' }, b: { componentId: 'JT', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'POT1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'POT1', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W4', a: { componentId: 'POT1', pin: 'w' }, b: { componentId: 'U1', pin: 'inp' } },
      { id: 'W5', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'RA', pin: 'a' } },
      { id: 'W6', a: { componentId: 'RA', pin: 'b' }, b: { componentId: 'JTH', pin: 'j' } },
      { id: 'W7', a: { componentId: 'JTH', pin: 'j' }, b: { componentId: 'RB', pin: 'a' } },
      { id: 'W8', a: { componentId: 'RB', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W9', a: { componentId: 'JTH', pin: 'j' }, b: { componentId: 'U1', pin: 'inn' } },
      { id: 'W10', a: { componentId: 'U1', pin: 'out' }, b: { componentId: 'JO', pin: 'j' } },
      { id: 'W11', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W12', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W13', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W14', a: { componentId: 'VCC', pin: 'n' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W15', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
