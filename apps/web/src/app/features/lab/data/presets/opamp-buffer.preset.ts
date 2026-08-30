import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Inverting amp (−10×) with separated rails:
 *   top:    Rf
 *   middle: battery → Rin → sum → op-amp → out → RL
 *   bottom: return bus (battery −, +in ref, load return, earth)
 */
export function createOpAmpBufferPreset(): SchematicDocument {
  resetIdSeq(40);

  const v1 = createComponent('battery', 100, 200, 'V1');
  v1.params = { v: 1, esr: 0 };

  const rin = createComponent('resistor', 240, 200, 'RIN');
  rin.params = { r: 1000 };

  const jSum = createComponent('junction', 340, 200, 'JS');
  const jTop = createComponent('junction', 340, 100, 'JT');

  const u1 = createComponent('op_amp', 420, 220, 'U1');

  // Rf centered so its right pin sits directly above the output junction
  const rf = createComponent('resistor', 420, 100, 'RF');
  rf.params = { r: 10000 };
  // RF.b at (470,100); place JO under it so the drop is a pure vertical
  const jOut = createComponent('junction', 470, 220, 'JO');

  const rl = createComponent('resistor', 580, 220, 'RL');
  rl.params = { r: 2000 };

  const jGndL = createComponent('junction', 100, 320, 'JL');
  const jGndM = createComponent('junction', 380, 320, 'JM');
  const jGndR = createComponent('junction', 630, 320, 'JR');
  const gnd = createComponent('ground', 100, 360, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [v1, rin, jSum, jTop, u1, rf, jOut, rl, jGndL, jGndM, jGndR, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'RIN', pin: 'a' } },
      { id: 'W2', a: { componentId: 'RIN', pin: 'b' }, b: { componentId: 'JS', pin: 'j' } },
      { id: 'W3', a: { componentId: 'JS', pin: 'j' }, b: { componentId: 'U1', pin: 'inn' } },

      { id: 'W4', a: { componentId: 'JS', pin: 'j' }, b: { componentId: 'JT', pin: 'j' } },
      { id: 'W5', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'RF', pin: 'a' } },
      { id: 'W6', a: { componentId: 'RF', pin: 'b' }, b: { componentId: 'JO', pin: 'j' } },

      { id: 'W7', a: { componentId: 'U1', pin: 'out' }, b: { componentId: 'JO', pin: 'j' } },
      { id: 'W8', a: { componentId: 'JO', pin: 'j' }, b: { componentId: 'RL', pin: 'a' } },
      { id: 'W9', a: { componentId: 'RL', pin: 'b' }, b: { componentId: 'JR', pin: 'j' } },

      // +in → bottom rail (vertical stub; U1.inp x = 380)
      { id: 'W10', a: { componentId: 'U1', pin: 'inp' }, b: { componentId: 'JM', pin: 'j' } },

      { id: 'W11', a: { componentId: 'JR', pin: 'j' }, b: { componentId: 'JM', pin: 'j' } },
      { id: 'W12', a: { componentId: 'JM', pin: 'j' }, b: { componentId: 'JL', pin: 'j' } },
      { id: 'W13', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'JL', pin: 'j' } },
      { id: 'W14', a: { componentId: 'JL', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
