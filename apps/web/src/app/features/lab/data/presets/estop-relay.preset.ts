import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * E-stop principle: series SESTOP must stay closed for the coil path.
 * Open SESTOP → coil drops even if S1 is closed.
 */
export function createEstopRelayPreset(): SchematicDocument {
  resetIdSeq(550);
  const vb = createComponent('battery', 70, 220, 'VB');
  vb.params = { v: 5, esr: 0 };
  const jV = createComponent('junction', 160, 80, 'JV');
  const sEstop = createComponent('switch', 240, 80, 'SESTOP');
  sEstop.params = { closed: true, openAt: -1, closeAt: -1 };
  const jMid = createComponent('junction', 340, 80, 'JM');
  const s1 = createComponent('switch', 420, 80, 'S1');
  s1.params = { closed: true, openAt: -1, closeAt: -1 };
  const jCoil = createComponent('junction', 520, 80, 'JC');
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
  const dFly = createComponent('diode', 440, 140, 'Dfly');
  dFly.params = { vf: 0.7, ron: 10, burned: false };
  dFly.rotation = 270;
  const rc = createComponent('resistor', 240, 40, 'RC');
  rc.params = { r: 220 };
  const d1 = createComponent('led', 360, 40, 'D1');
  d1.params = { ...d1.params, color: 0 };
  const jLoad = createComponent('junction', 640, 40, 'JL');
  const j1 = createComponent('junction', 440, 320, 'J1');
  const gnd = createComponent('ground', 70, 340, 'GND1');

  return assignNets({
    groundNet: 'gnd',
    components: [vb, jV, sEstop, jMid, s1, jCoil, k1, dFly, rc, d1, jLoad, j1, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VB', pin: 'p' }, b: { componentId: 'JV', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'SESTOP', pin: 'a' } },
      { id: 'W3', a: { componentId: 'SESTOP', pin: 'b' }, b: { componentId: 'JM', pin: 'j' } },
      { id: 'W4', a: { componentId: 'JM', pin: 'j' }, b: { componentId: 'S1', pin: 'a' } },
      { id: 'W5', a: { componentId: 'S1', pin: 'b' }, b: { componentId: 'JC', pin: 'j' } },
      { id: 'W6', a: { componentId: 'JC', pin: 'j' }, b: { componentId: 'K1', pin: 'cp' } },
      { id: 'W7', a: { componentId: 'K1', pin: 'cn' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W8', a: { componentId: 'JC', pin: 'j' }, b: { componentId: 'Dfly', pin: 'c' } },
      { id: 'W9', a: { componentId: 'Dfly', pin: 'a' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W10', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'RC', pin: 'a' } },
      { id: 'W11', a: { componentId: 'RC', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W12', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'JL', pin: 'j' } },
      { id: 'W13', a: { componentId: 'JL', pin: 'j' }, b: { componentId: 'K1', pin: 'a' } },
      { id: 'W14', a: { componentId: 'K1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W15', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W16', a: { componentId: 'VB', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  });
}
