import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Inverting differentiator: pulse → Cin → inn, Rf feedback.
 * Run Transient — OUT spikes on pulse edges.
 */
export function createOpAmpDifferentiatorPreset(): SchematicDocument {
  resetIdSeq(360);
  const pulse = createComponent('pulse_source', 80, 180, 'VP1');
  pulse.params = { v1: 0, v2: 1, td: 0.005, pw: 0.01, period: 0 };
  const cin = createComponent('capacitor', 220, 180, 'CIN');
  cin.params = { c: 1e-6, vmax: 25, burned: false };
  const jSum = createComponent('junction', 340, 180, 'JS');
  const jTop = createComponent('junction', 340, 80, 'JT');
  const u1 = createComponent('op_amp', 420, 200, 'U1');
  const rf = createComponent('resistor', 420, 80, 'RF');
  rf.params = { r: 10000 };
  const jOut = createComponent('junction', 520, 200, 'JO');
  const rl = createComponent('resistor', 620, 200, 'RL');
  rl.params = { r: 10000 };
  const jGnd = createComponent('junction', 200, 320, 'JG');
  const gnd = createComponent('ground', 80, 340, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [pulse, cin, jSum, jTop, u1, rf, jOut, rl, jGnd, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VP1', pin: 'p' }, b: { componentId: 'CIN', pin: 'a' } },
      { id: 'W2', a: { componentId: 'CIN', pin: 'b' }, b: { componentId: 'JS', pin: 'j' } },
      { id: 'W3', a: { componentId: 'JS', pin: 'j' }, b: { componentId: 'U1', pin: 'inn' } },
      { id: 'W4', a: { componentId: 'JS', pin: 'j' }, b: { componentId: 'JT', pin: 'j' } },
      { id: 'W5', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'RF', pin: 'a' } },
      { id: 'W6', a: { componentId: 'RF', pin: 'b' }, b: { componentId: 'JO', pin: 'j' } },
      { id: 'W7', a: { componentId: 'U1', pin: 'out' }, b: { componentId: 'JO', pin: 'j' } },
      { id: 'W8', a: { componentId: 'U1', pin: 'inp' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W9', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'RL', pin: 'a' } },
      { id: 'W10', a: { componentId: 'RL', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W11', a: { componentId: 'VP1', pin: 'n' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W12', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
