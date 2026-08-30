import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * LED + capacitor fade (interactive two-run demo):
 *   battery → switch → node → (C to gnd) and (R → LED → C.b)
 *
 * LED cathode returns at the capacitor bottom pin (no extra junction), so
 * discharge current animates on the C↔LED loop only — not through a ground
 * tee node.
 *
 * 1) Run with switch Closed — C charges, LED lights (Lab stores final Vc).
 * 2) Uncheck Closed, Run again — Lab injects Vc as capacitor ic; LED fades.
 *
 * Values: R = 220 Ω, C = 0.0022 F → τ ≈ 0.5 s after the switch opens.
 */
export function createLedFadePreset(): SchematicDocument {
  resetIdSeq(70);
  const v1 = createComponent('battery', 100, 180, 'V1');
  v1.params = { v: 5, esr: 0 };
  const s1 = createComponent('switch', 260, 100, 'S1');
  s1.params = { closed: true, openAt: -1 };
  const jt = createComponent('junction', 400, 100, 'JT');
  const c1 = createComponent('capacitor', 400, 200, 'C1');
  c1.rotation = 90;
  c1.params = { c: 0.0022 };
  const r1 = createComponent('resistor', 520, 100, 'R1');
  r1.params = { r: 220 };
  const d1 = createComponent('led', 640, 200, 'D1');
  const gnd = createComponent('ground', 100, 320, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [v1, s1, jt, c1, r1, d1, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'S1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'S1', pin: 'b' }, b: { componentId: 'JT', pin: 'j' } },
      { id: 'W3', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'C1', pin: 'a' } },
      // Cap bottom ↔ earth (idle during open-switch discharge).
      { id: 'W4', a: { componentId: 'C1', pin: 'b' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W5', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W6', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      // Discharge return: LED cathode straight to C.b (same y when C is rotated).
      { id: 'W7', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'C1', pin: 'b' } },
      { id: 'W8', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
