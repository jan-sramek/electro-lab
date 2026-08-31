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
    const b = createComponent('resistor', 200, 108, 'R2');
    const map = placeAllPartLabels([a, b]);
    const p1 = map.get('R1')!;
    const p2 = map.get('R2')!;
    // At least one should pick a different side when south slots collide.
    expect(p1.y === p2.y && p1.x === p2.x).toBeFalse();
  });
});
