import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Sample project: BC547 as an LED switch (teaching NPN).
 * 5 V → base via RB; collector LED + RC; emitter to ground.
 * Run DC — LED on. Open base path (delete RB wire or raise RB) to turn it off.
 */
export function createBjtSwitchPreset(): SchematicDocument {
  resetIdSeq(60);
  const vb = createComponent('battery', 80, 220, 'VB');
  vb.params = { v: 5, esr: 0 };

  const jVcc = createComponent('junction', 180, 160, 'JV');

  const sBase = createComponent('switch', 260, 120, 'S1');
  sBase.params = { closed: true, openAt: -1, closeAt: -1 };

  const rb = createComponent('resistor', 360, 120, 'RB');
  rb.params = { r: 2200 };

  const q1 = createComponent('bc547', 460, 220, 'Q1');

  const am = createComponent('ammeter', 260, 60, 'AM1');
  const rc = createComponent('resistor', 400, 60, 'RC');
  rc.params = { r: 220 };
  const d1 = createComponent('led', 560, 140, 'D1');
  d1.params = { ...d1.params, color: 0 };

  const jRet = createComponent('junction', 460, 320, 'J1');
  const gnd = createComponent('ground', 80, 340, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [vb, jVcc, sBase, rb, q1, am, rc, d1, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VB', pin: 'p' }, b: { componentId: 'JV', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'S1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'S1', pin: 'b' }, b: { componentId: 'RB', pin: 'a' } },
      { id: 'W4', a: { componentId: 'RB', pin: 'b' }, b: { componentId: 'Q1', pin: 'b' } },
      { id: 'W5', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'AM1', pin: 'a' } },
      { id: 'W6', a: { componentId: 'AM1', pin: 'b' }, b: { componentId: 'RC', pin: 'a' } },
      { id: 'W7', a: { componentId: 'RC', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W8', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'Q1', pin: 'c' } },
      { id: 'W9', a: { componentId: 'Q1', pin: 'e' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W10', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W11', a: { componentId: 'VB', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
