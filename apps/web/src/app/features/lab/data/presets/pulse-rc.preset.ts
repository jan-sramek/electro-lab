import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** Pulse into RC: pulse → R → C; return on bottom rail. */
export function createPulseRcPreset(): SchematicDocument {
  resetIdSeq(50);
  const vp = createComponent('pulse_source', 120, 160, 'VP1');
  vp.params = { v1: 0, v2: 5, td: 0.001, pw: 0.004 };
  const r1 = createComponent('resistor', 300, 100, 'R1');
  r1.params = { r: 1000 };
  const c1 = createComponent('capacitor', 480, 160, 'C1');
  c1.params = { c: 1e-6 };
  const jRet = createComponent('junction', 480, 280, 'J1');
  const gnd = createComponent('ground', 120, 300, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [vp, r1, c1, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VP1', pin: 'p' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'C1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'C1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W4', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W5', a: { componentId: 'VP1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
