import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** NMOS low-side switch drives a DC motor with flyback diode. */
export function createMotorNmosPreset(): SchematicDocument {
  resetIdSeq(230);
  const v1 = createComponent('battery', 70, 200, 'V1');
  v1.params = { v: 5, esr: 0 };
  const jV = createComponent('junction', 160, 80, 'JV');
  const s1 = createComponent('switch', 260, 80, 'S1');
  s1.params = { closed: true, openAt: -1, closeAt: -1 };
  const rg = createComponent('resistor', 360, 80, 'RG');
  rg.params = { r: 1000 };
  const jG = createComponent('junction', 420, 180, 'JG');
  const rpd = createComponent('resistor', 420, 260, 'RPD');
  rpd.params = { r: 100000 };
  rpd.rotation = 90;
  const m1 = createComponent('nmos', 500, 200, 'M1');
  const jLoad = createComponent('junction', 160, 40, 'JL');
  const mot = createComponent('dc_motor', 300, 40, 'MOT1');
  mot.params = { ron: 15, vStart: 1, burned: false };
  // Flyback vertical: cathode toward +V (JV), anode toward drain.
  const dFly = createComponent('diode', 220, 140, 'Dfly');
  dFly.params = { vf: 0.7, ron: 10, burned: false };
  dFly.rotation = 270;
  const j1 = createComponent('junction', 420, 300, 'J1');
  const gnd = createComponent('ground', 70, 320, 'GND1');

  return assignNets({
    groundNet: 'gnd',
    components: [v1, jV, s1, rg, jG, rpd, m1, jLoad, mot, dFly, j1, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'JV', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'S1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'S1', pin: 'b' }, b: { componentId: 'RG', pin: 'a' } },
      { id: 'W4', a: { componentId: 'RG', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W5', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'M1', pin: 'g' } },
      { id: 'W6', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'RPD', pin: 'a' } },
      { id: 'W7', a: { componentId: 'RPD', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W8', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'JL', pin: 'j' } },
      { id: 'W9', a: { componentId: 'JL', pin: 'j' }, b: { componentId: 'MOT1', pin: 'a' } },
      { id: 'W10', a: { componentId: 'MOT1', pin: 'b' }, b: { componentId: 'M1', pin: 'd' } },
      { id: 'W11', a: { componentId: 'Dfly', pin: 'c' }, b: { componentId: 'JV', pin: 'j' } },
      { id: 'W12', a: { componentId: 'Dfly', pin: 'a' }, b: { componentId: 'M1', pin: 'd' } },
      { id: 'W13', a: { componentId: 'M1', pin: 's' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W14', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W15', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  });
}
