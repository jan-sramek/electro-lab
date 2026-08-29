import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** Series chain: 5 V → switch → 220 Ω → LED → gnd */
export function createLedPreset(): SchematicDocument {
  resetIdSeq(10);
  const v1 = createComponent('battery', 100, 180, 'V1');
  const s1 = createComponent('switch', 240, 100, 'S1');
  const r1 = createComponent('resistor', 400, 100, 'R1');
  const d1 = createComponent('led', 540, 180, 'D1');
  const gnd = createComponent('ground', 100, 280, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [v1, s1, r1, d1, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'S1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'S1', pin: 'b' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W4', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W5', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
