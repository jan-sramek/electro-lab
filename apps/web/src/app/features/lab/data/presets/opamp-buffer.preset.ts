import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** Voltage follower: battery → op-amp buffer → load. */
export function createOpAmpBufferPreset(): SchematicDocument {
  resetIdSeq(40);
  const v1 = createComponent('battery', 80, 160, 'V1');
  v1.params = { v: 3, esr: 0 };
  const u1 = createComponent('op_amp', 280, 160, 'U1');
  const rl = createComponent('resistor', 440, 160, 'RL');
  rl.params = { r: 1000 };
  const gnd = createComponent('ground', 80, 280, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [v1, u1, rl, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'U1', pin: 'inp' } },
      { id: 'W2', a: { componentId: 'U1', pin: 'out' }, b: { componentId: 'U1', pin: 'inn' } },
      { id: 'W3', a: { componentId: 'U1', pin: 'out' }, b: { componentId: 'RL', pin: 'a' } },
      { id: 'W4', a: { componentId: 'RL', pin: 'b' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W5', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
