import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** Half-wave rectifier: AC → diode → R load; return on bottom rail. Transient @ 50 Hz. */
export function createHalfWavePreset(): SchematicDocument {
  resetIdSeq(100);
  const ac = createComponent('ac_source', 100, 160, 'AC1');
  ac.params = { mag: 10, phase: 0, freq: 50 };
  const d1 = createComponent('diode', 260, 100, 'D1');
  d1.params = { vf: 0.7, ron: 10, burned: false };
  const jLoad = createComponent('junction', 400, 100, 'JL');
  const r1 = createComponent('resistor', 400, 200, 'R1');
  r1.params = { r: 1000 };
  r1.rotation = 90;
  const jRet = createComponent('junction', 400, 300, 'J1');
  const gnd = createComponent('ground', 100, 320, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [ac, d1, jLoad, r1, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'AC1', pin: 'p' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'JL', pin: 'j' } },
      { id: 'W3', a: { componentId: 'JL', pin: 'j' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W4', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W5', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W6', a: { componentId: 'AC1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
