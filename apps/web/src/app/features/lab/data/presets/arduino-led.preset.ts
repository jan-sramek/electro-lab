import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** Teaching Arduino digital pin driving an LED (digitalWrite HIGH). */
export function createArduinoLedPreset(): SchematicDocument {
  resetIdSeq(240);
  const dio = createComponent('arduino_dio', 120, 180, 'D2');
  dio.params = { mode: 1, level: 1, vHigh: 5, ron: 40 };
  const r1 = createComponent('resistor', 280, 120, 'R1');
  r1.params = { r: 220 };
  const d1 = createComponent('led', 420, 180, 'D1');
  d1.params = { ...d1.params, color: 1 };
  const gnd = createComponent('ground', 120, 280, 'GND1');

  return assignNets({
    groundNet: 'gnd',
    components: [dio, r1, d1, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'D2', pin: 'sig' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W4', a: { componentId: 'D2', pin: 'gnd' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  });
}
