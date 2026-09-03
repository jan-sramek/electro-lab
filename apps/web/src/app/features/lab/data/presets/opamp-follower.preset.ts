import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** Voltage follower: Vout ≈ Vin (unity gain buffer). */
export function createOpAmpFollowerPreset(): SchematicDocument {
  resetIdSeq(300);
  const vin = createComponent('battery', 80, 180, 'VIN');
  vin.params = { v: 2, esr: 0 };
  const jIn = createComponent('junction', 200, 120, 'JI');
  const u1 = createComponent('op_amp', 320, 200, 'U1');
  const jOut = createComponent('junction', 420, 200, 'JO');
  const rl = createComponent('resistor', 520, 200, 'RL');
  rl.params = { r: 2000 };
  const jGnd = createComponent('junction', 200, 300, 'JG');
  const gnd = createComponent('ground', 80, 320, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [vin, jIn, u1, jOut, rl, jGnd, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VIN', pin: 'p' }, b: { componentId: 'JI', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JI', pin: 'j' }, b: { componentId: 'U1', pin: 'inp' } },
      { id: 'W3', a: { componentId: 'U1', pin: 'out' }, b: { componentId: 'JO', pin: 'j' } },
      { id: 'W4', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'U1', pin: 'inn' } },
      { id: 'W5', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'RL', pin: 'a' } },
      { id: 'W6', a: { componentId: 'RL', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W7', a: { componentId: 'VIN', pin: 'n' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W8', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
