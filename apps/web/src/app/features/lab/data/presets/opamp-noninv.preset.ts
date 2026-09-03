import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** Non-inverting amp: gain = 1 + Rf/Rg (here ≈ 11×). */
export function createOpAmpNonInvPreset(): SchematicDocument {
  resetIdSeq(310);
  const vin = createComponent('battery', 80, 160, 'VIN');
  vin.params = { v: 0.5, esr: 0 };
  const u1 = createComponent('op_amp', 360, 200, 'U1');
  const jFb = createComponent('junction', 280, 280, 'JF');
  const rg = createComponent('resistor', 280, 340, 'RG');
  rg.params = { r: 1000 };
  rg.rotation = 90;
  const rf = createComponent('resistor', 400, 120, 'RF');
  rf.params = { r: 10000 };
  const jOut = createComponent('junction', 460, 200, 'JO');
  const rl = createComponent('resistor', 560, 200, 'RL');
  rl.params = { r: 5000 };
  const jGnd = createComponent('junction', 200, 400, 'JG');
  const gnd = createComponent('ground', 80, 420, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [vin, u1, jFb, rg, rf, jOut, rl, jGnd, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VIN', pin: 'p' }, b: { componentId: 'U1', pin: 'inp' } },
      { id: 'W2', a: { componentId: 'U1', pin: 'inn' }, b: { componentId: 'JF', pin: 'j' } },
      { id: 'W3', a: { componentId: 'JF', pin: 'j' }, b: { componentId: 'RG', pin: 'a' } },
      { id: 'W4', a: { componentId: 'RG', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W5', a: { componentId: 'JF', pin: 'j' }, b: { componentId: 'RF', pin: 'a' } },
      { id: 'W6', a: { componentId: 'RF', pin: 'b' }, b: { componentId: 'JO', pin: 'j' } },
      { id: 'W7', a: { componentId: 'U1', pin: 'out' }, b: { componentId: 'JO', pin: 'j' } },
      { id: 'W8', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'RL', pin: 'a' } },
      { id: 'W9', a: { componentId: 'RL', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W10', a: { componentId: 'VIN', pin: 'n' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W11', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
