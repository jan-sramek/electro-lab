import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** Pushbutton + series LED — press to light (maps to Arduino digitalRead later). */
export function createPushbuttonLedPreset(): SchematicDocument {
  resetIdSeq(200);
  const v1 = createComponent('battery', 80, 180, 'V1');
  v1.params = { v: 5, esr: 0 };
  const btn = createComponent('pushbutton', 220, 120, 'BTN1');
  btn.params = { closed: false, openAt: -1, closeAt: -1 };
  const r1 = createComponent('resistor', 360, 120, 'R1');
  r1.params = { r: 220 };
  const d1 = createComponent('led', 500, 180, 'D1');
  d1.params = { ...d1.params, color: 0 };
  const gnd = createComponent('ground', 80, 280, 'GND1');

  return assignNets({
    groundNet: 'gnd',
    components: [v1, btn, r1, d1, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'BTN1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'BTN1', pin: 'b' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W4', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W5', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  });
}
