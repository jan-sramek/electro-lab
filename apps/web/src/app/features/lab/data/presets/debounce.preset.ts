import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Switch with RC debounce into NMOS gate driving an LED.
 * VCC → Rpu → JSW → S1 → gnd; C1 on JSW; RG/RPD to M1; LED+R low-side.
 */
export function createDebouncePreset(): SchematicDocument {
  resetIdSeq(510);
  const v1 = createComponent('battery', 70, 200, 'V1');
  v1.params = { v: 5, esr: 0 };
  const jV = createComponent('junction', 160, 80, 'JV');
  const rpu = createComponent('resistor', 260, 80, 'Rpu');
  rpu.params = { r: 10000 };
  const jSw = createComponent('junction', 360, 160, 'JSW');
  const s1 = createComponent('switch', 360, 240, 'S1');
  s1.params = { closed: false, openAt: -1, closeAt: -1 };
  s1.rotation = 90;
  const c1 = createComponent('capacitor', 280, 240, 'C1');
  c1.params = { c: 100e-9, vmax: 16, burned: false };
  c1.rotation = 90;
  const rg = createComponent('resistor', 440, 80, 'RG');
  rg.params = { r: 1000 };
  const jG = createComponent('junction', 520, 180, 'JG');
  const rpd = createComponent('resistor', 520, 260, 'RPD');
  rpd.params = { r: 100000 };
  rpd.rotation = 90;
  const m1 = createComponent('nmos', 600, 200, 'M1');
  const rd = createComponent('resistor', 200, 40, 'RD');
  rd.params = { r: 220 };
  const d1 = createComponent('led', 340, 100, 'D1');
  d1.params = { ...d1.params, color: 0 };
  const j1 = createComponent('junction', 360, 320, 'J1');
  const gnd = createComponent('ground', 70, 340, 'GND1');

  return assignNets({
    groundNet: 'gnd',
    components: [v1, jV, rpu, jSw, s1, c1, rg, jG, rpd, m1, rd, d1, j1, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'JV', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'Rpu', pin: 'a' } },
      { id: 'W3', a: { componentId: 'Rpu', pin: 'b' }, b: { componentId: 'JSW', pin: 'j' } },
      { id: 'W4', a: { componentId: 'JSW', pin: 'j' }, b: { componentId: 'S1', pin: 'a' } },
      { id: 'W5', a: { componentId: 'S1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W6', a: { componentId: 'JSW', pin: 'j' }, b: { componentId: 'C1', pin: 'a' } },
      { id: 'W7', a: { componentId: 'C1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W8', a: { componentId: 'JSW', pin: 'j' }, b: { componentId: 'RG', pin: 'a' } },
      { id: 'W9', a: { componentId: 'RG', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W10', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'M1', pin: 'g' } },
      { id: 'W11', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'RPD', pin: 'a' } },
      { id: 'W12', a: { componentId: 'RPD', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W13', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'RD', pin: 'a' } },
      { id: 'W14', a: { componentId: 'RD', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W15', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'M1', pin: 'd' } },
      { id: 'W16', a: { componentId: 'M1', pin: 's' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W17', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W18', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  });
}
