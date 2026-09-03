import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * PWM as pseudo-DAC: pulse → R → C; voltmeter on the filtered node.
 * Higher duty → higher average DC on C (after the RC settles).
 */
export function createPwmFilterPreset(): SchematicDocument {
  resetIdSeq(530);
  const vp = createComponent('pulse_source', 100, 160, 'VP1');
  // 50% duty @ 1 kHz — RC averages toward ~2.5 V.
  vp.params = { v1: 0, v2: 5, td: 0, pw: 0.0005, period: 0.001 };
  const r1 = createComponent('resistor', 280, 100, 'R1');
  r1.params = { r: 1000 };
  const jSense = createComponent('junction', 400, 160, 'JS');
  const c1 = createComponent('capacitor', 480, 160, 'C1');
  c1.params = { c: 10e-6, vmax: 16, burned: false };
  const vm = createComponent('voltmeter', 400, 230, 'VM1');
  vm.rotation = 90;
  const jRet = createComponent('junction', 496, 300, 'J1');
  const gnd = createComponent('ground', 100, 320, 'GND1');

  return assignNets({
    groundNet: 'gnd',
    components: [vp, r1, jSense, c1, vm, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VP1', pin: 'p' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'JS', pin: 'j' } },
      { id: 'W3', a: { componentId: 'JS', pin: 'j' }, b: { componentId: 'C1', pin: 'a' } },
      { id: 'W4', a: { componentId: 'C1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W5', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W6', a: { componentId: 'VP1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W7', a: { componentId: 'VM1', pin: 'p' }, b: { componentId: 'JS', pin: 'j' } },
      { id: 'W8', a: { componentId: 'VM1', pin: 'n' }, b: { componentId: 'J1', pin: 'j' } }
    ]
  });
}
