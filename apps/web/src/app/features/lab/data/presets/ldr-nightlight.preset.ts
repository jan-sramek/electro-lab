import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * LDR night-light (NMOS low-side switch):
 *   Vcc — R1 — gate — LDR — GND
 * Dark → LDR high → gate rises above Vth → LED on.
 * Raise Light on LDR → gate falls → LED off.
 */
export function createLdrNightLightPreset(): SchematicDocument {
  resetIdSeq(210);
  const v1 = createComponent('battery', 70, 200, 'V1');
  v1.params = { v: 5, esr: 0 };
  const jV = createComponent('junction', 160, 80, 'JV');

  // Pull-up so dark (high LDR) lifts the gate.
  const r1 = createComponent('resistor', 260, 80, 'R1');
  r1.params = { r: 10000 };

  const jG = createComponent('junction', 380, 180, 'JG');
  const ldr = createComponent('ldr', 380, 260, 'LDR1');
  ldr.params = { light: 0.15, rDark: 100000, rLight: 1000 };
  ldr.rotation = 90;

  const m1 = createComponent('nmos', 460, 200, 'M1');
  // Pin a under JV → vertical feed (no overlap with R1 rail at y=80).
  const rd = createComponent('resistor', 180, 40, 'RD');
  rd.params = { r: 220 };
  const d1 = createComponent('led', 320, 100, 'D1');
  d1.params = { ...d1.params, color: 2 };
  const j1 = createComponent('junction', 380, 300, 'J1');
  const gnd = createComponent('ground', 70, 320, 'GND1');

  return assignNets({
    groundNet: 'gnd',
    components: [v1, jV, r1, jG, ldr, m1, rd, d1, j1, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'JV', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W4', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'M1', pin: 'g' } },
      { id: 'W5', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'LDR1', pin: 'a' } },
      { id: 'W6', a: { componentId: 'LDR1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W7', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'RD', pin: 'a' } },
      { id: 'W8', a: { componentId: 'RD', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W9', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'M1', pin: 'd' } },
      { id: 'W10', a: { componentId: 'M1', pin: 's' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W11', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W12', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  });
}
