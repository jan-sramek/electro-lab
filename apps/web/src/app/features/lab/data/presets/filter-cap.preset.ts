import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** Half-wave + filter C across the load — smoothed DC with residual ripple. */
export function createFilterCapPreset(): SchematicDocument {
  resetIdSeq(120);
  const ac = createComponent('ac_source', 100, 180, 'AC1');
  ac.params = { mag: 10, phase: 0, freq: 50 };
  const d1 = createComponent('diode', 260, 100, 'D1');
  d1.params = { vf: 0.7, ron: 10, burned: false };
  const jTop = createComponent('junction', 400, 100, 'JT');
  const c1 = createComponent('capacitor', 400, 180, 'C1');
  c1.params = { c: 100e-6, vmax: 25 };
  c1.rotation = 90;
  const r1 = createComponent('resistor', 500, 180, 'R1');
  r1.params = { r: 2200 };
  r1.rotation = 90;
  const jRet = createComponent('junction', 400, 280, 'J1');
  const gnd = createComponent('ground', 100, 300, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [ac, d1, jTop, c1, r1, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'AC1', pin: 'p' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'JT', pin: 'j' } },
      { id: 'W3', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'C1', pin: 'a' } },
      { id: 'W4', a: { componentId: 'C1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W5', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W6', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W7', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W8', a: { componentId: 'AC1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
