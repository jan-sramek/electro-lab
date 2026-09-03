import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Teaching buck: Vin → NMOS → L → Cout||R; freewheel diode at LX.
 * Gate drive is referenced to the MOSFET source (LX) so Vgs = PWM.
 *
 * L / PWM sized so peak switch & diode current stay under teaching burn
 * limits (NMOS 0.5 A, diode 0.1 A) — 1 mH + 400 µs on-time ramped to amps
 * and instantly burned M1, which looked like “no current”.
 */
export function createBuckPreset(): SchematicDocument {
  resetIdSeq(180);
  const vb = createComponent('battery', 80, 200, 'VB');
  vb.params = { v: 12, esr: 0 };
  const jVin = createComponent('junction', 180, 100, 'JV');
  const m1 = createComponent('nmos', 280, 160, 'M1');
  m1.params = { vth: 2, ron: 5, burned: false };
  const jLx = createComponent('junction', 360, 100, 'JLX');
  const l1 = createComponent('inductor', 460, 100, 'L1');
  // 100 mH + 250 µs on → keeps switch/diode peaks under teaching burn limits.
  l1.params = { l: 0.1 };
  const jOut = createComponent('junction', 580, 100, 'JO');
  const dFly = createComponent('diode', 360, 180, 'Dfly');
  dFly.params = { vf: 0.7, ron: 10, burned: false };
  dFly.rotation = 270;
  const c1 = createComponent('capacitor', 580, 180, 'C1');
  c1.params = { c: 100e-6, vmax: 25 };
  c1.rotation = 90;
  const rl = createComponent('resistor', 660, 180, 'RL');
  rl.params = { r: 220 };
  rl.rotation = 90;
  const jRet = createComponent('junction', 360, 280, 'J1');
  // Gate–source PWM so high-side NMOS sees real Vgs.
  const vp = createComponent('pulse_source', 220, 240, 'VP1');
  vp.params = { v1: 0, v2: 5, td: 0, pw: 0.00025, period: 0.001 };
  const gnd = createComponent('ground', 80, 320, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [vb, jVin, m1, jLx, l1, jOut, dFly, c1, rl, jRet, vp, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VB', pin: 'p' }, b: { componentId: 'JV', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'M1', pin: 'd' } },
      { id: 'W3', a: { componentId: 'M1', pin: 's' }, b: { componentId: 'JLX', pin: 'j' } },
      { id: 'W4', a: { componentId: 'JLX', pin: 'j' }, b: { componentId: 'L1', pin: 'a' } },
      { id: 'W5', a: { componentId: 'L1', pin: 'b' }, b: { componentId: 'JO', pin: 'j' } },
      { id: 'W6', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'C1', pin: 'a' } },
      { id: 'W7', a: { componentId: 'C1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W8', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'RL', pin: 'a' } },
      { id: 'W9', a: { componentId: 'RL', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W10', a: { componentId: 'JLX', pin: 'j' }, b: { componentId: 'Dfly', pin: 'c' } },
      { id: 'W11', a: { componentId: 'Dfly', pin: 'a' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W12', a: { componentId: 'VP1', pin: 'p' }, b: { componentId: 'M1', pin: 'g' } },
      { id: 'W13', a: { componentId: 'VP1', pin: 'n' }, b: { componentId: 'JLX', pin: 'j' } },
      { id: 'W14', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W15', a: { componentId: 'VB', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
