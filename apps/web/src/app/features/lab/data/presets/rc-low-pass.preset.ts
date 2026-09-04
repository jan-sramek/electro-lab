import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * AC low-pass: AC → series R → mid → C to gnd; vertical voltmeter across C.
 * Top rail is a single net (JI→R→JS) so stub overlaps are same-net and ignored.
 */
export function createRcLowPassPreset(): SchematicDocument {
  resetIdSeq(460);
  const ac = createComponent('ac_source', 100, 180, 'AC1');
  ac.params = { mag: 1, phase: 0 };
  const jIn = createComponent('junction', 240, 100, 'JI');
  const r1 = createComponent('resistor', 340, 100, 'R1');
  r1.params = { r: 1000 };
  const jSense = createComponent('junction', 440, 100, 'JS');
  const c1 = createComponent('capacitor', 440, 180, 'C1');
  c1.params = { c: 1 / (2 * Math.PI * 1000 * 1000) };
  c1.rotation = 90;
  const vm = createComponent('voltmeter', 520, 180, 'VM1');
  vm.rotation = 90;
  const jRet = createComponent('junction', 440, 280, 'J1');
  const gnd = createComponent('ground', 100, 300, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [ac, jIn, r1, jSense, c1, vm, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'AC1', pin: 'p' }, b: { componentId: 'JI', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JI', pin: 'j' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'JS', pin: 'j' } },
      { id: 'W4', a: { componentId: 'JS', pin: 'j' }, b: { componentId: 'C1', pin: 'a' } },
      { id: 'W5', a: { componentId: 'C1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W6', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W7', a: { componentId: 'AC1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W8', a: { componentId: 'VM1', pin: 'p' }, b: { componentId: 'JS', pin: 'j' } },
      { id: 'W9', a: { componentId: 'VM1', pin: 'n' }, b: { componentId: 'J1', pin: 'j' } }
    ]
  };
  return assignNets(doc);
}
