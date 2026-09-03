import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Schmitt trigger (non-inverting hysteresis): pot → Rin → +in;
 * feedback divider Rf/Rg from OUT sets trip points. Rails 0…5 V.
 */
export function createOpAmpSchmittPreset(): SchematicDocument {
  resetIdSeq(330);
  const vcc = createComponent('battery', 60, 200, 'VCC');
  vcc.params = { v: 5, esr: 0 };
  const jTop = createComponent('junction', 140, 80, 'JT');
  const pot = createComponent('potentiometer', 220, 160, 'POT1');
  pot.params = { r: 10000, pos: 0.35 };
  const rin = createComponent('resistor', 320, 120, 'RIN');
  rin.params = { r: 10000 };
  const jPlus = createComponent('junction', 400, 120, 'JP');
  const u1 = createComponent('op_amp', 480, 200, 'U1');
  u1.params = { ...u1.params, vMax: 5, vMin: 0 };
  const jOut = createComponent('junction', 580, 160, 'JO');
  const rf = createComponent('resistor', 500, 80, 'RF');
  rf.params = { r: 100000 };
  const rg = createComponent('resistor', 400, 280, 'RG');
  rg.params = { r: 100000 };
  const rLed = createComponent('resistor', 660, 120, 'R1');
  rLed.params = { r: 470 };
  const d1 = createComponent('led', 740, 120, 'D1');
  d1.params = { ...d1.params, color: 1 };
  const jGnd = createComponent('junction', 140, 360, 'JG');
  const gnd = createComponent('ground', 60, 380, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [vcc, jTop, pot, rin, jPlus, u1, jOut, rf, rg, rLed, d1, jGnd, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VCC', pin: 'p' }, b: { componentId: 'JT', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'POT1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'POT1', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W4', a: { componentId: 'POT1', pin: 'w' }, b: { componentId: 'RIN', pin: 'a' } },
      { id: 'W5', a: { componentId: 'RIN', pin: 'b' }, b: { componentId: 'JP', pin: 'j' } },
      { id: 'W6', a: { componentId: 'JP', pin: 'j' }, b: { componentId: 'U1', pin: 'inp' } },
      { id: 'W7', a: { componentId: 'U1', pin: 'inn' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W8', a: { componentId: 'U1', pin: 'out' }, b: { componentId: 'JO', pin: 'j' } },
      { id: 'W9', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'RF', pin: 'a' } },
      { id: 'W10', a: { componentId: 'RF', pin: 'b' }, b: { componentId: 'JP', pin: 'j' } },
      { id: 'W11', a: { componentId: 'JP', pin: 'j' }, b: { componentId: 'RG', pin: 'a' } },
      { id: 'W12', a: { componentId: 'RG', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W13', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W14', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W15', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W16', a: { componentId: 'VCC', pin: 'n' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W17', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
