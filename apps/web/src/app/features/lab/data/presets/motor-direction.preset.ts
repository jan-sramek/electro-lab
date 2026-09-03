import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Teaching H-bridge reverse: S2+S3 closed, S1+S4 open (motor current flips).
 */
export function createMotorDirectionPreset(): SchematicDocument {
  resetIdSeq(490);
  const v1 = createComponent('battery', 70, 180, 'V1');
  v1.params = { v: 5, esr: 0 };
  const jT = createComponent('junction', 300, 60, 'JT');
  const jL = createComponent('junction', 180, 180, 'JL');
  const jR = createComponent('junction', 420, 180, 'JR');
  const jG = createComponent('junction', 300, 300, 'JG');

  const s1 = createComponent('switch', 180, 100, 'S1');
  s1.params = { closed: false, openAt: -1, closeAt: -1 };
  s1.rotation = 90;
  const s2 = createComponent('switch', 180, 240, 'S2');
  s2.params = { closed: true, openAt: -1, closeAt: -1 };
  s2.rotation = 90;
  const s3 = createComponent('switch', 420, 100, 'S3');
  s3.params = { closed: true, openAt: -1, closeAt: -1 };
  s3.rotation = 90;
  const s4 = createComponent('switch', 420, 240, 'S4');
  s4.params = { closed: false, openAt: -1, closeAt: -1 };
  s4.rotation = 90;

  const mot = createComponent('dc_motor', 300, 180, 'MOT1');
  mot.params = { ron: 15, vStart: 1, burned: false };
  const gnd = createComponent('ground', 300, 360, 'GND1');

  return assignNets({
    groundNet: 'gnd',
    components: [v1, jT, jL, jR, jG, s1, s2, s3, s4, mot, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'JT', pin: 'j' } },
      { id: 'W2', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W3', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'S1', pin: 'a' } },
      { id: 'W4', a: { componentId: 'S1', pin: 'b' }, b: { componentId: 'JL', pin: 'j' } },
      { id: 'W5', a: { componentId: 'JL', pin: 'j' }, b: { componentId: 'S2', pin: 'a' } },
      { id: 'W6', a: { componentId: 'S2', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W7', a: { componentId: 'JT', pin: 'j' }, b: { componentId: 'S3', pin: 'a' } },
      { id: 'W8', a: { componentId: 'S3', pin: 'b' }, b: { componentId: 'JR', pin: 'j' } },
      { id: 'W9', a: { componentId: 'JR', pin: 'j' }, b: { componentId: 'S4', pin: 'a' } },
      { id: 'W10', a: { componentId: 'S4', pin: 'b' }, b: { componentId: 'JG', pin: 'j' } },
      { id: 'W11', a: { componentId: 'JL', pin: 'j' }, b: { componentId: 'MOT1', pin: 'a' } },
      { id: 'W12', a: { componentId: 'MOT1', pin: 'b' }, b: { componentId: 'JR', pin: 'j' } },
      { id: 'W13', a: { componentId: 'JG', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  });
}
