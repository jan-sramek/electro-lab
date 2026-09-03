import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Diode orientation: battery → switch → R → diode → LED → return.
 * Forward diode lights the LED; reverse the diode (swap anode/cathode wiring) and it blocks.
 */
export function createDiodeDirectionPreset(): SchematicDocument {
  resetIdSeq(55);
  const v1 = createComponent('battery', 100, 180, 'V1');
  v1.params = { v: 5, esr: 0 };
  const s1 = createComponent('switch', 240, 100, 'S1');
  s1.params = { closed: true, openAt: -1 };
  const r1 = createComponent('resistor', 380, 100, 'R1');
  r1.params = { r: 220 };
  const d1 = createComponent('diode', 520, 120, 'D1');
  d1.params = { vf: 0.7, ron: 10, burned: false };
  const led = createComponent('led', 660, 180, 'LED1');
  led.params = { ...led.params, color: 1 };
  const jRet = createComponent('junction', 660, 300, 'J1');
  const gnd = createComponent('ground', 100, 320, 'GND1');

  return assignNets({
    groundNet: 'gnd',
    components: [v1, s1, r1, d1, led, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'S1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'S1', pin: 'b' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W4', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'LED1', pin: 'a' } },
      { id: 'W5', a: { componentId: 'LED1', pin: 'c' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W6', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W7', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  });
}
