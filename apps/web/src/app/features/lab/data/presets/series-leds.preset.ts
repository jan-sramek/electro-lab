import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Series LEDs: same current through both diodes; voltage drops add.
 * Pair with the parallel sample to contrast series vs parallel intuition.
 */
export function createSeriesLedsPreset(): SchematicDocument {
  resetIdSeq(59);
  const v1 = createComponent('battery', 80, 200, 'V1');
  v1.params = { v: 9, esr: 0 };
  const s1 = createComponent('switch', 220, 100, 'S1');
  s1.params = { closed: true, openAt: -1 };
  const r1 = createComponent('resistor', 360, 100, 'R1');
  r1.params = { r: 470 };
  const d1 = createComponent('led', 500, 160, 'D1');
  d1.params = { ...d1.params, color: 0 };
  const d2 = createComponent('led', 620, 160, 'D2');
  d2.params = { ...d2.params, color: 2 };
  const jRet = createComponent('junction', 620, 300, 'J1');
  const gnd = createComponent('ground', 80, 340, 'GND1');

  return assignNets({
    groundNet: 'gnd',
    components: [v1, s1, r1, d1, d2, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'S1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'S1', pin: 'b' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W4', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'D2', pin: 'a' } },
      { id: 'W5', a: { componentId: 'D2', pin: 'c' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W6', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W7', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  });
}
