import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * NTC teaching stand-in: fixed Rtop + pot as temperature-dependent R (rheostat).
 * Pot is vertical (a up / b down); wiper tied to b so the a→b path is one variable R.
 * Slide Wiper (pos) ≈ change NTC resistance; probe mid with the voltmeter.
 */
export function createNtcDividerPreset(): SchematicDocument {
  resetIdSeq(520);
  const v1 = createComponent('battery', 80, 180, 'V1');
  v1.params = { v: 5, esr: 0 };
  const jTop = createComponent('junction', 180, 80, 'JT');
  const rTop = createComponent('resistor', 260, 80, 'R1');
  rTop.params = { r: 10000 };
  const jMid = createComponent('junction', 360, 160, 'JM');
  // Vertical rheostat under JM so the mid→NTC wire lands on pin a (not the body center).
  const ntc = createComponent('potentiometer', 360, 250, 'NTC1');
  ntc.params = { r: 10000, pos: 0.5 };
  ntc.rotation = 90;
  const vm = createComponent('voltmeter', 460, 200, 'VM1');
  vm.rotation = 90;
  // Under NTC1.b so the drop is vertical (no long overlap with the VM return).
  const jBot = createComponent('junction', 360, 320, 'JB');
  const gnd = createComponent('ground', 80, 340, 'GND1');

  return assignNets({
    groundNet: 'gnd',
    components: [v1, jTop, rTop, jMid, ntc, vm, jBot, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'JT', pin: 'j' } },
      { id: 'W2', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W3', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'JM', pin: 'j' } },
      { id: 'W4', a: { componentId: 'JM', pin: 'j' }, b: { componentId: 'NTC1', pin: 'a' } },
      { id: 'W5', a: { componentId: 'NTC1', pin: 'b' }, b: { componentId: 'JB', pin: 'j' } },
      // Local rheostat short (wiper→b) — keeps the return rail free of a stub overlap.
      { id: 'W6', a: { componentId: 'NTC1', pin: 'w' }, b: { componentId: 'NTC1', pin: 'b' } },
      { id: 'W7', a: { componentId: 'JB', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W8', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W9', a: { componentId: 'VM1', pin: 'p' }, b: { componentId: 'JM', pin: 'j' } },
      { id: 'W10', a: { componentId: 'VM1', pin: 'n' }, b: { componentId: 'JB', pin: 'j' } }
    ]
  });
}
