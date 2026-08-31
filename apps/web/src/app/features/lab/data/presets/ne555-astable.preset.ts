import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Sample: NE555 astable driving three parallel LEDs (red / green / yellow).
 * Classic Ra/Rb/C timing; each LED has its own series resistor from OUT.
 * Run Transient (~100 ms) — all three blink together; playback animates the canvas.
 */
export function createNe555AstablePreset(): SchematicDocument {
  resetIdSeq(100);
  const vcc = createComponent('battery', 60, 220, 'VCC');
  vcc.params = { v: 5, esr: 0 };

  const jVcc = createComponent('junction', 160, 80, 'JV');

  const u1 = createComponent('ne555', 360, 220, 'U1');

  const ra = createComponent('resistor', 260, 60, 'RA');
  ra.params = { r: 10000 };
  const rb = createComponent('resistor', 340, 120, 'RB');
  rb.params = { r: 10000 };
  const ct = createComponent('capacitor', 500, 300, 'CT');
  ct.params = { c: 4.7e-7, vmax: 16, burned: false };

  const cCtrl = createComponent('capacitor', 280, 320, 'CC');
  cCtrl.params = { c: 1e-8, vmax: 16, burned: false };

  const jThr = createComponent('junction', 440, 100, 'JT');

  const jOut = createComponent('junction', 480, 120, 'JO');
  const r1 = createComponent('resistor', 540, 70, 'R1');
  r1.params = { r: 220 };
  const d1 = createComponent('led', 600, 70, 'D1');
  d1.params = { ...d1.params, color: 0 };

  const r2 = createComponent('resistor', 540, 110, 'R2');
  r2.params = { r: 220 };
  const d2 = createComponent('led', 600, 110, 'D2');
  d2.params = { ...d2.params, color: 1 };

  const r3 = createComponent('resistor', 540, 150, 'R3');
  r3.params = { r: 220 };
  const d3 = createComponent('led', 600, 150, 'D3');
  d3.params = { ...d3.params, color: 2 };

  const jGnd = createComponent('junction', 160, 360, 'JG');
  const gnd = createComponent('ground', 60, 380, 'GND1');

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
      r1,
      d1,
      r2,
      d2,
      r3,
      d3,
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
      { id: 'W16', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W17', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W18', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W19', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'R2', pin: 'a' } },
      { id: 'W20', a: { componentId: 'R2', pin: 'b' }, b: { componentId: 'D2', pin: 'a' } },
      { id: 'W21', a: { componentId: 'D2', pin: 'c' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W22', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'R3', pin: 'a' } },
      { id: 'W23', a: { componentId: 'R3', pin: 'b' }, b: { componentId: 'D3', pin: 'a' } },
      { id: 'W24', a: { componentId: 'D3', pin: 'c' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W25', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W26', a: { componentId: 'VCC', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
