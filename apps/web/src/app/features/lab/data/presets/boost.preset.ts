import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Teaching boost: Vin → L → switch node; NMOS to gnd; diode to Cout||Rload.
 * PWM from pulse_source (period > 0).
 *
 * L / PWM sized under teaching burn limits (same trap as buck: tiny L + long
 * on-time → amps → burned MOSFET → no wire current).
 */
export function createBoostPreset(): SchematicDocument {
  resetIdSeq(190);
  const vb = createComponent('battery', 80, 220, 'VB');
  vb.params = { v: 5, esr: 0 };
  const jVin = createComponent('junction', 180, 120, 'JV');
  const l1 = createComponent('inductor', 300, 120, 'L1');
  // 47 mH + 300 µs on → ~32 mA ramp/step at 5 V.
  l1.params = { l: 0.047 };
  const jSw = createComponent('junction', 420, 120, 'JS');
  const m1 = createComponent('nmos', 420, 220, 'M1');
  m1.params = { vth: 2, ron: 5, burned: false };
  const d1 = createComponent('diode', 520, 120, 'D1');
  d1.params = { vf: 0.7, ron: 10, burned: false };
  const jOut = createComponent('junction', 640, 120, 'JO');
  const c1 = createComponent('capacitor', 640, 200, 'C1');
  c1.params = { c: 100e-6, vmax: 25 };
  c1.rotation = 90;
  const rl = createComponent('resistor', 720, 200, 'RL');
  rl.params = { r: 470 };
  rl.rotation = 90;
  const jRet = createComponent('junction', 420, 300, 'J1');
  // Rotate PWM so pins exit vertically (avoids shared horizontal rail on p/n).
  const vp = createComponent('pulse_source', 300, 360, 'VP1');
  vp.rotation = 90;
  vp.params = { v1: 0, v2: 5, td: 0, pw: 0.0003, period: 0.001 };
  const gnd = createComponent('ground', 80, 420, 'GND1');
  const jGate = createComponent('junction', 360, 220, 'JG');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [vb, jVin, l1, jSw, m1, d1, jOut, c1, rl, jRet, vp, gnd, jGate],
    wires: [
      { id: 'W1', a: { componentId: 'VB', pin: 'p' }, b: { componentId: 'JV', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'L1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'L1', pin: 'b' }, b: { componentId: 'JS', pin: 'j' } },
      { id: 'W4', a: { componentId: 'JS', pin: 'j' }, b: { componentId: 'M1', pin: 'd' } },
      { id: 'W5', a: { componentId: 'M1', pin: 's' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W6', a: { componentId: 'JS', pin: 'j' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W7', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'JO', pin: 'j' } },
      { id: 'W8', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'C1', pin: 'a' } },
      { id: 'W9', a: { componentId: 'C1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W10', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'RL', pin: 'a' } },
      { id: 'W11', a: { componentId: 'RL', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W12', a: { componentId: 'VP1', pin: 'p' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W13', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'M1', pin: 'g' } },
      { id: 'W14', a: { componentId: 'VP1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W15', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W16', a: { componentId: 'VB', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
