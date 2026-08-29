import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** Pulse into RC: pulse_source → R → C to gnd. */
export function createPulseRcPreset(): SchematicDocument {
  resetIdSeq(50);
  const vp = createComponent('pulse_source', 100, 160, 'VP1');
  vp.params = { v1: 0, v2: 5, td: 0.001, pw: 0.004 };
  const r1 = createComponent('resistor', 280, 100, 'R1');
  r1.params = { r: 1000 };
  const c1 = createComponent('capacitor', 440, 160, 'C1');
  c1.params = { c: 1e-6 };
  const gnd = createComponent('ground', 100, 260, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [vp, r1, c1, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VP1', pin: 'p' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'C1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'C1', pin: 'b' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W4', a: { componentId: 'VP1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
