import { createComponent, assignNets, SchematicDocument } from './schematic.model';
import { placeAllPartLabels, placePartLabel, placePartMeasurement } from './part-label-layout';

describe('part label layout', () => {
  it('puts horizontal resistor labels below (or above) the body', () => {
    const r = createComponent('resistor', 100, 100, 'R1');
    const p = placePartLabel(r);
    expect(Math.abs(p.x)).toBeLessThan(1);
    expect(Math.abs(p.y)).toBeGreaterThan(Math.abs(p.x));
    expect(p.textAnchor).toBe('middle');
  });

  it('puts vertical LED labels beside the body', () => {
    const d = createComponent('led', 100, 100, 'D1');
    const p = placePartLabel(d);
    expect(Math.abs(p.x)).toBeGreaterThan(Math.abs(p.y) - 1);
    expect(p.textAnchor === 'start' || p.textAnchor === 'end').toBeTrue();
  });

  it('keeps measurement on the same side as the id', () => {
    const d = createComponent('led', 100, 100, 'D1');
    const id = placePartLabel(d);
    const m = placePartMeasurement(d, id);
    expect(Math.sign(m.x) || 0).toBe(Math.sign(id.x) || 0);
    expect(m.textAnchor).toBe(id.textAnchor);
  });

  it('places ground label away from the top pin', () => {
    const g = createComponent('ground', 100, 100, 'GND1');
    const p = placePartLabel(g);
    expect(p.y).toBeGreaterThan(0);
  });

  it('prefers the outer side for a battery so VCC does not cover nearby parts', () => {
    const vcc = createComponent('battery', 60, 220, 'VCC');
    const ra = createComponent('resistor', 160, 220, 'RA');
    const doc: SchematicDocument = assignNets({
      groundNet: 'gnd',
      components: [vcc, ra],
      wires: []
    });
    const map = placeAllPartLabels(doc.components);
    const v = map.get('VCC')!;
    // Battery prefers west (outside the circuit) when free.
    expect(v.x).toBeLessThan(0);
    expect(v.textAnchor).toBe('end');
  });

  it('separates labels for two nearby parts that would otherwise collide', () => {
    const a = createComponent('resistor', 200, 100, 'R1');
    const b = createComponent('resistor', 200, 104, 'R2');
    const map = placeAllPartLabels([a, b]);
    const p1 = map.get('R1')!;
    const p2 = map.get('R2')!;
    // World centers should not coincide even if local offsets match.
    const w1 = { x: a.x + p1.x, y: a.y + p1.y };
    const w2 = { x: b.x + p2.x, y: b.y + p2.y };
    expect(Math.hypot(w1.x - w2.x, w1.y - w2.y)).toBeGreaterThan(2);
  });

  it('nudges labels outward when a tight cluster fills all preferred sides', () => {
    const parts = [0, 1, 2, 3].map((i) => createComponent('resistor', 200, 100 + i * 6, `R${i}`));
    const map = placeAllPartLabels(parts);
    const placements = parts.map((p) => map.get(p.id)!);
    const uniq = new Set(placements.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`));
    expect(uniq.size).toBeGreaterThan(1);
  });
});
