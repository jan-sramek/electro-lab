import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Sample: NMOS LED switch.
 * 5 V → gate via RG + switch; RPD pull-down via gate junction; drain LED + RD.
 * Layout keeps supply / gate / return drops on distinct columns (no long overlapping rails).
 */
export function createNmosSwitchPreset(): SchematicDocument {
  resetIdSeq(80);
  const vb = createComponent('battery', 80, 220, 'VB');
  vb.params = { v: 5, esr: 0 };

  const jVcc = createComponent('junction', 180, 80, 'JV');

  const sGate = createComponent('switch', 260, 80, 'S1');
  sGate.params = { closed: true, openAt: -1, closeAt: -1 };

  const rg = createComponent('resistor', 360, 80, 'RG');
  rg.params = { r: 1000 };

  const jGate = createComponent('junction', 420, 180, 'JG');

  // Vertical under JG so the pull-down does not share the gate horizontal.
  const rpd = createComponent('resistor', 420, 260, 'RPD');
  rpd.params = { r: 100000 };
  rpd.rotation = 90;

  const m1 = createComponent('nmos', 500, 220, 'M1');

  // Pin a under JV → pure vertical feed; avoids overlapping the gate rail at y=80.
  const am = createComponent('ammeter', 200, 40, 'AM1');
  const rd = createComponent('resistor', 320, 40, 'RD');
  rd.params = { r: 220 };
  const d1 = createComponent('led', 420, 100, 'D1');
  d1.params = { ...d1.params, color: 1 };

  const jRet = createComponent('junction', 420, 320, 'J1');
  const gnd = createComponent('ground', 80, 340, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [vb, jVcc, sGate, rg, jGate, rpd, m1, am, rd, d1, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VB', pin: 'p' }, b: { componentId: 'JV', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'S1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'S1', pin: 'b' }, b: { componentId: 'RG', pin: 'a' } },
      { id: 'W4', a: { componentId: 'RG', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W5', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'M1', pin: 'g' } },
      { id: 'W6', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'RPD', pin: 'a' } },
      { id: 'W7', a: { componentId: 'RPD', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W8', a: { componentId: 'JV', pin: 'j' }, b: { componentId: 'AM1', pin: 'a' } },
      { id: 'W9', a: { componentId: 'AM1', pin: 'b' }, b: { componentId: 'RD', pin: 'a' } },
      { id: 'W10', a: { componentId: 'RD', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W11', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'M1', pin: 'd' } },
      { id: 'W12', a: { componentId: 'M1', pin: 's' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W13', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W14', a: { componentId: 'VB', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
