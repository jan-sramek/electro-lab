import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * NE555 astable driving ten LEDs in a Christmas-tree pyramid (1 + 2 + 3 + 4).
 * Compact layout — run Transient (~100 ms) to see them blink together.
 */
export function createNe555ChristmasTreePreset(): SchematicDocument {
  resetIdSeq(120);
  const vcc = createComponent('battery', 60, 220, 'VCC');
  vcc.params = { v: 5, esr: 0 };

  const jVcc = createComponent('junction', 150, 70, 'JV');
  const u1 = createComponent('ne555', 300, 220, 'U1');

  const ra = createComponent('resistor', 240, 50, 'RA');
  ra.params = { r: 10000 };
  const rb = createComponent('resistor', 310, 110, 'RB');
  rb.params = { r: 10000 };
  const ct = createComponent('capacitor', 420, 300, 'CT');
  ct.params = { c: 4.7e-7, vmax: 16, burned: false };
  const cCtrl = createComponent('capacitor', 260, 310, 'CC');
  cCtrl.params = { c: 1e-8, vmax: 16, burned: false };
  const jThr = createComponent('junction', 380, 100, 'JT');

  const jOut = createComponent('junction', 400, 150, 'JO');

  const mkLed = (id: string, x: number, y: number, color: number, rId: string) => {
    const r = createComponent('resistor', x - 50, y, rId);
    r.params = { r: 220 };
    const d = createComponent('led', x, y, id);
    d.params = { ...d.params, color };
    return { r, d };
  };

  const star = mkLed('D1', 520, 50, 2, 'R1');
  const row2a = mkLed('D2', 480, 100, 0, 'R2');
  const row2b = mkLed('D3', 560, 100, 1, 'R3');
  const row3a = mkLed('D4', 440, 150, 0, 'R4');
  const row3b = mkLed('D5', 520, 150, 1, 'R5');
  const row3c = mkLed('D6', 600, 150, 3, 'R6');
  const row4a = mkLed('D7', 400, 200, 0, 'R7');
  const row4b = mkLed('D8', 480, 200, 1, 'R8');
  const row4c = mkLed('D9', 560, 200, 2, 'R9');
  const row4d = mkLed('D10', 640, 200, 3, 'R10');

  const jGnd = createComponent('junction', 150, 340, 'JG');
  const gnd = createComponent('ground', 60, 360, 'GND1');

  const ledBranches = [
    star,
    row2a,
    row2b,
    row3a,
    row3b,
    row3c,
    row4a,
    row4b,
    row4c,
    row4d
  ];

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [
      vcc,
      jVcc,
      u1,
      ra,
      rb,
      ct,
      cCtrl,
      jThr,
      jOut,
      ...ledBranches.flatMap((b) => [b.r, b.d]),
      jGnd,
      gnd
    ],
    wires: [
      { id: 'W1', a: { componentId: 'VCC', pin: 'p' }, b: { componentId: 'JV', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'U1', pin: 'vcc' } },
      { id: 'W3', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'U1', pin: 'reset' } },
      { id: 'W4', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'RA', pin: 'a' } },
      { id: 'W5', a: { componentId: 'RA', pin: 'b' }, b: { componentId: 'U1', pin: 'dis' } },
      { id: 'W6', a: { componentId: 'U1', pin: 'dis' }, b: { componentId: 'RB', pin: 'a' } },
      { id: 'W7', a: { componentId: 'RB', pin: 'b' }, b: { componentId: 'JT', pin: 'j' } },
      { id: 'W8', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'U1', pin: 'thr' } },
      { id: 'W9', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'U1', pin: 'trig' } },
      { id: 'W10', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'CT', pin: 'a' } },
      { id: 'W11', a: { componentId: 'CT', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W12', a: { componentId: 'U1', pin: 'ctrl' }, b: { componentId: 'CC', pin: 'a' } },
      { id: 'W13', a: { componentId: 'CC', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W14', a: { componentId: 'U1', pin: 'gnd' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W15', a: { componentId: 'U1', pin: 'out' }, b: { componentId: 'JO', pin: 'j' } },
      ...ledBranches.flatMap((b, i) => {
        const n = i + 1;
        const wOut = 15 + n * 3 - 2;
        const wR = wOut + 1;
        const wLed = wOut + 2;
        return [
          {
            id: `W${wOut}`,
            a: { componentId: 'JO', pin: 'j' },
            b: { componentId: b.r.id, pin: 'a' }
          },
          {
            id: `W${wR}`,
            a: { componentId: b.r.id, pin: 'b' },
            b: { componentId: b.d.id, pin: 'a' }
          },
          {
            id: `W${wLed}`,
            a: { componentId: b.d.id, pin: 'c' },
            b: { componentId: 'JG', pin: 'j' }
          }
        ];
      }),
      {
        id: `W${15 + ledBranches.length * 3 + 1}`,
        a: { componentId: 'JG', pin: 'j' },
        b: { componentId: 'GND1', pin: 'g' }
      },
      {
        id: `W${15 + ledBranches.length * 3 + 2}`,
        a: { componentId: 'VCC', pin: 'n' },
        b: { componentId: 'GND1', pin: 'g' }
      }
    ]
  };
  return assignNets(doc);
}
