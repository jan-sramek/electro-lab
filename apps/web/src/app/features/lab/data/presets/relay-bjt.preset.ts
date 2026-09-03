import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Relay coil driven by NPN (BJT) with flyback diode; contacts switch an LED.
 * Close S1 → base drive → coil pulls in → LED on.
 *
 * VCC coil feed on JC (y=80), LED load on y=40, base drive on y=200
 * so those rails do not share a long horizontal run.
 */
export function createRelayBjtPreset(): SchematicDocument {
  resetIdSeq(540);
  const vb = createComponent('battery', 80, 240, 'VB');
  vb.params = { v: 5, esr: 0 };

  const jV = createComponent('junction', 160, 80, 'JV');
  const jC = createComponent('junction', 400, 80, 'JC');

  const s1 = createComponent('switch', 240, 200, 'S1');
  s1.params = { closed: true, openAt: -1, closeAt: -1 };
  const rb = createComponent('resistor', 340, 200, 'RB');
  rb.params = { r: 2200 };
  const q1 = createComponent('bc547', 460, 220, 'Q1');
  const jCol = createComponent('junction', 460, 180, 'JCOL');

  const k1 = createComponent('relay', 560, 200, 'K1');
  k1.params = {
    ...k1.params,
    rCoil: 400,
    vPull: 3.5,
    ron: 0.1,
    closed: false,
    openAt: -1,
    closeAt: -1
  };

  const dFly = createComponent('diode', 400, 140, 'Dfly');
  dFly.params = { vf: 0.7, ron: 10, burned: false };
  dFly.rotation = 270;

  const rc = createComponent('resistor', 210, 40, 'RC');
  rc.params = { r: 220 };
  const d1 = createComponent('led', 400, 40, 'D1');
  d1.params = { ...d1.params, color: 0 };
  const jLoad = createComponent('junction', 620, 40, 'JL');

  const j1 = createComponent('junction', 460, 320, 'J1');
  const gnd = createComponent('ground', 80, 340, 'GND1');

  return assignNets({
    groundNet: 'gnd',
    components: [vb, jV, jC, s1, rb, q1, jCol, k1, dFly, rc, d1, jLoad, j1, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VB', pin: 'p' }, b: { componentId: 'JV', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'RC', pin: 'a' } },
      { id: 'W3', a: { componentId: 'RC', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W4', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'JL', pin: 'j' } },
      { id: 'W5', a: { componentId: 'JL', pin: 'j' }, b: { componentId: 'K1', pin: 'a' } },
      { id: 'W6', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'JC', pin: 'j' } },
      { id: 'W7', a: { componentId: 'JC', pin: 'j' }, b: { componentId: 'K1', pin: 'cp' } },
      { id: 'W8', a: { componentId: 'Dfly', pin: 'c' }, b: { componentId: 'JC', pin: 'j' } },
      { id: 'W9', a: { componentId: 'Dfly', pin: 'a' }, b: { componentId: 'JCOL', pin: 'j' } },
      { id: 'W10', a: { componentId: 'K1', pin: 'cn' }, b: { componentId: 'JCOL', pin: 'j' } },
      { id: 'W11', a: { componentId: 'JCOL', pin: 'j' }, b: { componentId: 'Q1', pin: 'c' } },
      { id: 'W12', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'S1', pin: 'a' } },
      { id: 'W13', a: { componentId: 'S1', pin: 'b' }, b: { componentId: 'RB', pin: 'a' } },
      { id: 'W14', a: { componentId: 'RB', pin: 'b' }, b: { componentId: 'Q1', pin: 'b' } },
      { id: 'W15', a: { componentId: 'Q1', pin: 'e' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W16', a: { componentId: 'K1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W17', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W18', a: { componentId: 'VB', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  });
}
