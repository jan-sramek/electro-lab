import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Inverting integrator: pulse → Rin → inn, Cf feedback.
 * Run Transient — OUT ramps while the pulse is high.
 */
export function createOpAmpIntegratorPreset(): SchematicDocument {
  resetIdSeq(350);
  const pulse = createComponent('pulse_source', 80, 180, 'VP1');
  pulse.params = { v1: 0, v2: 1, td: 0.002, pw: 0.01, period: 0 };
  const rin = createComponent('resistor', 220, 180, 'RIN');
  rin.params = { r: 10000 };
  const jSum = createComponent('junction', 340, 180, 'JS');
  const jTop = createComponent('junction', 340, 80, 'JT');
  const u1 = createComponent('op_amp', 420, 200, 'U1');
  const cf = createComponent('capacitor', 420, 80, 'CF');
  cf.params = { c: 1e-6, vmax: 25, burned: false };
  const jOut = createComponent('junction', 520, 200, 'JO');
  const rl = createComponent('resistor', 620, 200, 'RL');
  rl.params = { r: 10000 };
  const jGnd = createComponent('junction', 200, 320, 'JG');
  const gnd = createComponent('ground', 80, 340, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [pulse, rin, jSum, jTop, u1, cf, jOut, rl, jGnd, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VP1', pin: 'p' }, b: { componentId: 'RIN', pin: 'a' } },
      { id: 'W2', a: { componentId: 'RIN', pin: 'b' }, b: { componentId: 'JS', pin: 'j' } },
      { id: 'W3', a: { componentId: 'JS', pin: 'j' }, b: { componentId: 'U1', pin: 'inn' } },
      { id: 'W4', a: { componentId: 'JS', pin: 'j' }, b: { componentId: 'JT', pin: 'j' } },
      { id: 'W5', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'CF', pin: 'a' } },
      { id: 'W6', a: { componentId: 'CF', pin: 'b' }, b: { componentId: 'JO', pin: 'j' } },
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
