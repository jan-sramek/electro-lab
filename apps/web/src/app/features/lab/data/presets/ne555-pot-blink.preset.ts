import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * NE555 astable with a potentiometer as Rb and one LED on OUT.
 * POT1 is a rheostat (a→DIS, wiper+b→thr/trig): raise Wiper → larger Rb → slower blink.
 * Layout keeps supply / timing / LED / return on separate rows (no long overlapping rails).
 */
export function createNe555PotBlinkPreset(): SchematicDocument {
  resetIdSeq(210);
  const vcc = createComponent('battery', 60, 240, 'VCC');
  vcc.params = { v: 5, esr: 0 };

  // VCC stub only — fan-outs leave JV on distinct rows.
  const jVcc = createComponent('junction', 140, 60, 'JV');
  const jRst = createComponent('junction', 140, 120, 'JR');
  const u1 = createComponent('ne555', 380, 240, 'U1');

  const ra = createComponent('resistor', 220, 60, 'RA');
  ra.params = { r: 4700 };

  const jDis = createComponent('junction', 300, 160, 'JD');
  const pot = createComponent('potentiometer', 300, 200, 'POT1');
  pot.params = { r: 100000, pos: 0.35 };

  const jThr = createComponent('junction', 480, 100, 'JT');
  const ct = createComponent('capacitor', 560, 200, 'CT');
  ct.params = { c: 1e-6, vmax: 16, burned: false };
  ct.rotation = 90;

  const cCtrl = createComponent('capacitor', 280, 340, 'CC');
  cCtrl.params = { c: 1e-8, vmax: 16, burned: false };
  cCtrl.rotation = 90;

  const jOut = createComponent('junction', 520, 160, 'JO');
  const rLed = createComponent('resistor', 600, 120, 'R1');
  rLed.params = { r: 220 };
  const d1 = createComponent('led', 680, 120, 'D1');
  d1.params = { ...d1.params, color: 0 };

  const jGnd = createComponent('junction', 140, 400, 'JG');
  const gnd = createComponent('ground', 60, 420, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [
      vcc,
      jVcc,
      jRst,
      u1,
      ra,
      jDis,
      pot,
      jThr,
      ct,
      cCtrl,
      jOut,
      rLed,
      d1,
      jGnd,
      gnd
    ],
    wires: [
      { id: 'W1', a: { componentId: 'VCC', pin: 'p' }, b: { componentId: 'JV', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'RA', pin: 'a' } },
      { id: 'W3', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'JR', pin: 'j' } },
      { id: 'W4', a: { componentId: 'JR', pin: 'j' }, b: { componentId: 'U1', pin: 'vcc' } },
      { id: 'W5', a: { componentId: 'JR', pin: 'j' }, b: { componentId: 'U1', pin: 'reset' } },
      { id: 'W6', a: { componentId: 'RA', pin: 'b' }, b: { componentId: 'JD', pin: 'j' } },
      { id: 'W7', a: { componentId: 'JD', pin: 'j' }, b: { componentId: 'U1', pin: 'dis' } },
      { id: 'W8', a: { componentId: 'JD', pin: 'j' }, b: { componentId: 'POT1', pin: 'a' } },
      { id: 'W9', a: { componentId: 'POT1', pin: 'w' }, b: { componentId: 'JT', pin: 'j' } },
      { id: 'W10', a: { componentId: 'POT1', pin: 'b' }, b: { componentId: 'JT', pin: 'j' } },
      { id: 'W11', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'U1', pin: 'thr' } },
      { id: 'W12', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'U1', pin: 'trig' } },
      { id: 'W13', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'CT', pin: 'a' } },
      { id: 'W14', a: { componentId: 'CT', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W15', a: { componentId: 'U1', pin: 'ctrl' }, b: { componentId: 'CC', pin: 'a' } },
      { id: 'W16', a: { componentId: 'CC', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W17', a: { componentId: 'U1', pin: 'gnd' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W18', a: { componentId: 'U1', pin: 'out' }, b: { componentId: 'JO', pin: 'j' } },
      { id: 'W19', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W20', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W21', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W22', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W23', a: { componentId: 'VCC', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
