import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Sample project: SPST relay with flyback diode switching an LED.
 * 5 V → S1 → coil (K1); diode across coil (cathode to coil+, anode to gnd).
 * Contacts switch LED + series R. Run DC with S1 closed — LED on.
 */
export function createRelayDiodePreset(): SchematicDocument {
  resetIdSeq(80);
  const vb = createComponent('battery', 80, 240, 'VB');
  vb.params = { v: 5, esr: 0 };

  const jVcc = createComponent('junction', 180, 140, 'JV');
  const sCoil = createComponent('switch', 280, 100, 'S1');
  sCoil.params = { closed: true, openAt: -1, closeAt: -1 };

  const jCoil = createComponent('junction', 380, 100, 'JC');

  const k1 = createComponent('relay', 480, 200, 'K1');
  k1.params = {
    ...k1.params,
    rCoil: 400,
    vPull: 3.5,
    ron: 0.1,
    closed: false,
    openAt: -1,
    closeAt: -1
  };

  // Flyback: cathode (c) to coil+, anode (a) to ground.
  const dFly = createComponent('diode', 380, 180, 'Dfly');
  dFly.params = { vf: 0.7, ron: 10, burned: false };
  dFly.rotation = 270;

  const rc = createComponent('resistor', 280, 40, 'RC');
  rc.params = { r: 220 };
  const led = createComponent('led', 400, 40, 'D1');
  led.params = { ...led.params, color: 0 };

  const jLoad = createComponent('junction', 560, 40, 'JL');
  const jRet = createComponent('junction', 560, 300, 'J1');
  const jBat = createComponent('junction', 80, 360, 'JB');
  const gnd = createComponent('ground', 560, 360, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [vb, jVcc, sCoil, jCoil, k1, dFly, rc, led, jLoad, jRet, jBat, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VB', pin: 'p' }, b: { componentId: 'JV', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'S1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'S1', pin: 'b' }, b: { componentId: 'JC', pin: 'j' } },
      { id: 'W4', a: { componentId: 'JC', pin: 'j' }, b: { componentId: 'K1', pin: 'cp' } },
      // Flyback diode: cathode to coil+, anode to return
      { id: 'W5', a: { componentId: 'JC', pin: 'j' }, b: { componentId: 'Dfly', pin: 'c' } },
      { id: 'W6', a: { componentId: 'Dfly', pin: 'a' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W7', a: { componentId: 'K1', pin: 'cn' }, b: { componentId: 'J1', pin: 'j' } },
      // Load through contacts
      { id: 'W8', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'RC', pin: 'a' } },
      { id: 'W9', a: { componentId: 'RC', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W10', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'JL', pin: 'j' } },
      { id: 'W11', a: { componentId: 'JL', pin: 'j' }, b: { componentId: 'K1', pin: 'a' } },
      { id: 'W12', a: { componentId: 'K1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W13', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W14', a: { componentId: 'VB', pin: 'n' }, b: { componentId: 'JB', pin: 'j' } },
      { id: 'W15', a: { componentId: 'JB', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
