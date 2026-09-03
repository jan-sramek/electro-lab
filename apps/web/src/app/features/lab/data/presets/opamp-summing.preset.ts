import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/** Inverting summing amp: Vout ≈ −Rf·(V1/R1 + V2/R2). Here ≈ −(V1 + V2). */
export function createOpAmpSummingPreset(): SchematicDocument {
  resetIdSeq(340);
  const v1 = createComponent('battery', 60, 120, 'V1');
  v1.params = { v: 1, esr: 0 };
  const v2 = createComponent('battery', 60, 240, 'V2');
  v2.params = { v: 0.5, esr: 0 };
  const r1 = createComponent('resistor', 200, 120, 'R1');
  r1.params = { r: 10000 };
  const r2 = createComponent('resistor', 200, 240, 'R2');
  r2.params = { r: 10000 };
  const jSum = createComponent('junction', 320, 180, 'JS');
  const jTop = createComponent('junction', 320, 80, 'JT');
  const u1 = createComponent('op_amp', 400, 200, 'U1');
  const rf = createComponent('resistor', 400, 80, 'RF');
  rf.params = { r: 10000 };
  const jOut = createComponent('junction', 500, 200, 'JO');
  const rl = createComponent('resistor', 600, 200, 'RL');
  rl.params = { r: 5000 };
  const jGnd = createComponent('junction', 200, 340, 'JG');
  const gnd = createComponent('ground', 60, 360, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [v1, v2, r1, r2, jSum, jTop, u1, rf, jOut, rl, jGnd, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'V2', pin: 'p' }, b: { componentId: 'R2', pin: 'a' } },
      { id: 'W3', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'JS', pin: 'j' } },
      { id: 'W4', a: { componentId: 'R2', pin: 'b' }, b: { componentId: 'JS', pin: 'j' } },
      { id: 'W5', a: { componentId: 'JS', pin: 'j' }, b: { componentId: 'U1', pin: 'inn' } },
      { id: 'W6', a: { componentId: 'JS', pin: 'j' }, b: { componentId: 'JT', pin: 'j' } },
      { id: 'W7', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'RF', pin: 'a' } },
      { id: 'W8', a: { componentId: 'RF', pin: 'b' }, b: { componentId: 'JO', pin: 'j' } },
      { id: 'W9', a: { componentId: 'U1', pin: 'out' }, b: { componentId: 'JO', pin: 'j' } },
      { id: 'W10', a: { componentId: 'U1', pin: 'inp' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W11', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'RL', pin: 'a' } },
      { id: 'W12', a: { componentId: 'RL', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W13', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W14', a: { componentId: 'V2', pin: 'n' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W15', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
