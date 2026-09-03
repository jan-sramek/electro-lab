import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Parallel LED branches: same V across both paths, currents add.
 * Compare with series thinking — here each branch has its own R+LED.
 */
export function createSeriesParallelPreset(): SchematicDocument {
  resetIdSeq(58);
  const v1 = createComponent('battery', 80, 200, 'V1');
  v1.params = { v: 5, esr: 0 };
  const s1 = createComponent('switch', 200, 80, 'S1');
  s1.params = { closed: true, openAt: -1 };
  const jT = createComponent('junction', 320, 80, 'JT');
  const r1 = createComponent('resistor', 420, 40, 'R1');
  r1.params = { r: 330 };
  const d1 = createComponent('led', 560, 100, 'D1');
  d1.params = { ...d1.params, color: 0 };
  const r2 = createComponent('resistor', 420, 160, 'R2');
  r2.params = { r: 330 };
  const d2 = createComponent('led', 560, 220, 'D2');
  d2.params = { ...d2.params, color: 2 };
  const jR = createComponent('junction', 640, 300, 'JR');
  const gnd = createComponent('ground', 80, 340, 'GND1');

  return assignNets({
    groundNet: 'gnd',
    components: [v1, s1, jT, r1, d1, r2, d2, jR, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'S1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'S1', pin: 'b' }, b: { componentId: 'JT', pin: 'j' } },
      { id: 'W3', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W4', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W5', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'JR', pin: 'j' } },
      { id: 'W6', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'R2', pin: 'a' } },
      { id: 'W7', a: { componentId: 'R2', pin: 'b' }, b: { componentId: 'D2', pin: 'a' } },
      { id: 'W8', a: { componentId: 'D2', pin: 'c' }, b: { componentId: 'JR', pin: 'j' } },
      { id: 'W9', a: { componentId: 'JR', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W10', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  });
}
