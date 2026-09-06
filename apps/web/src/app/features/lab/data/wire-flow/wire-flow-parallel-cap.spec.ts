import { SchematicDocument, assignNets, createComponent, resetIdSeq } from '../schematic.model';
import { estimateAllWireCurrents } from '../wire-current';

/**
 * Battery → switch → R → (LED ‖ C) → ground. The capacitor shares the LED's
 * cathode pin, and the cathode has its own wire to ground — the shape users
 * draw by hand. Regressions here showed up as "no flow in the LED loop with a
 * big capacitor" and ghost flow to ground during discharge.
 */
function parallelCapDoc(): SchematicDocument {
  resetIdSeq(1);
  const v1 = createComponent('battery', 100, 300, 'V1');
  v1.rotation = 90;
  const s1 = createComponent('switch', 300, 100, 'S1');
  const r1 = createComponent('resistor', 800, 100, 'R1');
  const j1 = createComponent('junction', 1000, 240, 'J1');
  const d1 = createComponent('led', 1000, 300, 'D1');
  d1.rotation = 90;
  const c1 = createComponent('capacitor', 1200, 300, 'C1');
  c1.rotation = 90;
  const gnd = createComponent('ground', 400, 600, 'GND1');
  const doc: SchematicDocument = {
    groundNet: 'gnd',
    components: [v1, s1, r1, j1, d1, c1, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'S1', pin: 'a' } },
      { id: 'W2', a: { componentId: 'S1', pin: 'b' }, b: { componentId: 'R1', pin: 'a' } },
      { id: 'W3a', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
      { id: 'W3b', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'D1', pin: 'a' } },
      { id: 'W4', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'C1', pin: 'a' } },
      { id: 'W5', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'C1', pin: 'b' } },
      { id: 'W6', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W7', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
    ]
  };
  return assignNets(doc);
}

function solve(I: Record<string, number>): Record<string, number> {
  const doc = parallelCapDoc();
  const m = estimateAllWireCurrents(doc.components, doc.wires, (id) => (id in I ? I[id]! : null));
  const out: Record<string, number> = {};
  for (const w of doc.wires) out[w.id] = Math.round((m.get(w.id) ?? 0) * 1e6) / 1e3; // mA
  return out;
}

describe('wire flow — LED with parallel capacitor', () => {
  it('DC: LED loop animates, capacitor wires stay idle', () => {
    const w = solve({ V1: 0.0125, S1: 0.0125, R1: 0.0125, D1: 0.0125, C1: 0 });
    expect(w['W6']).toBe(12.5);
    expect(w['W4']).toBe(0);
    expect(w['W5']).toBe(0);
  });

  it('charging a large capacitor (LED still dark) closes the return through the cathode ground wire', () => {
    const w = solve({ V1: 0.0125, S1: 0.0125, R1: 0.0125, D1: 0, C1: 0.0125 });
    expect(w['W4']).toBe(12.5);
    expect(w['W5']).toBe(-12.5);
    expect(w['W6']).toBe(12.5);
    expect(w['W3b']).toBe(0);
  });

  it('shared charging splits by branch current and sums on the ground return', () => {
    const w = solve({ V1: 0.0125, S1: 0.0125, R1: 0.0125, D1: 0.006, C1: 0.0065 });
    expect(w['W3b']).toBe(6);
    expect(w['W4']).toBe(6.5);
    expect(w['W6']).toBe(12.5);
  });

  it('discharge loops C → LED → C without ghost flow to ground', () => {
    const w = solve({ V1: 0, S1: 0, R1: 0, D1: 0.003, C1: -0.003 });
    expect(w['W3b']).toBe(3);
    expect(w['W4']).toBe(-3);
    expect(w['W5']).toBe(3);
    expect(w['W6']).toBe(0);
    expect(w['W7']).toBe(0);
    expect(w['W1']).toBe(0);
  });
});
