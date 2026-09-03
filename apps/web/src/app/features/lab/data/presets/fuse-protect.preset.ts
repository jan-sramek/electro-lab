import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Fuse protection: 5 V → fuse → load R; S1 shorts across the load.
 * Start with S1 open (safe). Close S1 and Run — only F1 opens.
 * Replacing F1 also opens SPST switches so the new fuse is not instantly overloaded.
 */
export function createFuseProtectPreset(): SchematicDocument {
  resetIdSeq(160);
  const vb = createComponent('battery', 80, 200, 'VB');
  vb.params = { v: 5, esr: 0 };
  const f1 = createComponent('fuse', 220, 120, 'F1');
  f1.params = { iMax: 0.1, ron: 0.05, burned: false };
  const jLoad = createComponent('junction', 360, 120, 'JL');
  const rl = createComponent('resistor', 360, 220, 'RL');
  rl.params = { r: 220 };
  rl.rotation = 90;
  // Short across the load — open until the student closes it to trip F1.
  const s1 = createComponent('switch', 480, 200, 'S1');
  s1.params = { closed: false, openAt: -1, closeAt: -1 };
  s1.rotation = 90;
  const jRet = createComponent('junction', 360, 300, 'J1');
  const gnd = createComponent('ground', 80, 320, 'GND1');

  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [vb, f1, jLoad, rl, s1, jRet, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'VB', pin: 'p' }, b: { componentId: 'F1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'F1', pin: 'b' }, b: { componentId: 'JL', pin: 'j' } },
      { id: 'W3', a: { componentId: 'JL', pin: 'j' }, b: { componentId: 'RL', pin: 'a' } },
      { id: 'W4', a: { componentId: 'RL', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W5', a: { componentId: 'JL', pin: 'j' }, b: { componentId: 'S1', pin: 'a' } },
      { id: 'W6', a: { componentId: 'S1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W7', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W8', a: { componentId: 'VB', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}
