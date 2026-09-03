import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Teaching pull-up: VCC → Rpu → JSEN → S1 → gnd; LED+R from JSEN to gnd.
 * S1 open → JSEN high → LED on; S1 closed → JSEN=0 → LED off.
 */
export function createPullUpDownPreset(): SchematicDocument {
  resetIdSeq(500);
  const v1 = createComponent('battery', 70, 180, 'V1');
  v1.params = { v: 5, esr: 0 };
  const jV = createComponent('junction', 160, 80, 'JV');
  const rpu = createComponent('resistor', 260, 80, 'Rpu');
  rpu.params = { r: 10000 };
  const jSen = createComponent('junction', 380, 160, 'JSEN');
  const s1 = createComponent('switch', 380, 240, 'S1');
  s1.params = { closed: false, openAt: -1, closeAt: -1 };
  s1.rotation = 90;
  const r1 = createComponent('resistor', 480, 160, 'R1');
  r1.params = { r: 470 };
  const d1 = createComponent('led', 580, 220, 'D1');
  d1.params = { ...d1.params, color: 0 };
  const j1 = createComponent('junction', 380, 320, 'J1');
  const gnd = createComponent('ground', 70, 340, 'GND1');

  return assignNets({
    groundNet: 'gnd',
    components: [v1, jV, rpu, jSen, s1, r1, d1, j1, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'JV', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'Rpu', pin: 'a' } },
      { id: 'W3', a: { componentId: 'Rpu', pin: 'b' }, b: { componentId: 'JSEN', pin: 'j' } },
      { id: 'W4', a: { componentId: 'JSEN', pin: 'j' }, b: { componentId: 'S1', pin: 'a' } },
      { id: 'W5', a: { componentId: 'S1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W6', a: { componentId: 'JSEN', pin: 'j' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W7', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W8', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W9', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W10', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  });
}
