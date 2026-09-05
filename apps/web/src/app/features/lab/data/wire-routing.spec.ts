import {
  candidateElbows,
  collinearOverlap,
  documentWireObstacles,
  firstLegAxis,
  inferPreferAxis,
  inferRoutingIntent,
  motionPrimaryAxis,
  orthogonalTeeOnPolyline,
  polylineSegments,
  routeAllWirePolylines,
  routeOrthogonal,
  spanPrimaryAxis,
  updateAxisLock
} from './wire-routing';
import { SchematicDocument, createComponent, resetIdSeq } from './schematic.model';

describe('wire routing (refactored)', () => {
  it('scores collinear horizontal overlap', () => {
    expect(
      collinearOverlap(
        { x1: 0, y1: 10, x2: 100, y2: 10 },
        { x1: 40, y1: 10, x2: 140, y2: 10 }
      )
    ).toBe(60);
    expect(
      collinearOverlap(
        { x1: 0, y1: 10, x2: 100, y2: 10 },
        { x1: 0, y1: 20, x2: 100, y2: 20 }
      )
    ).toBe(0);
  });

  it('T onto a rail stays a simple L even if the rail already occupies that Y', () => {
    const rail = polylineSegments([
      { x: 0, y: 200 },
      { x: 400, y: 200 }
    ]);
    const pts = routeOrthogonal(320, 80, 200, 200, {
      axisLock: 'v',
      obstacles: rail
    });
    expect(polylineSegments(pts).length).toBeLessThanOrEqual(2);
    expect(firstLegAxis(pts)).toBe('v');
    expect(candidateElbows(0, 0, 100, 50).length).toBe(2);
  });

  it('routes two nearby wires independently (shared rails allowed)', () => {
    resetIdSeq(1);
    const a1 = createComponent('junction', 100, 100, 'A1');
    const b1 = createComponent('junction', 300, 200, 'B1');
    const a2 = createComponent('junction', 100, 120, 'A2');
    const b2 = createComponent('junction', 300, 220, 'B2');
    const doc: SchematicDocument = {
      groundNet: 'gnd',
      components: [a1, b1, a2, b2],
      wires: [
        { id: 'W1', a: { componentId: 'A1', pin: 'j' }, b: { componentId: 'B1', pin: 'j' } },
        { id: 'W2', a: { componentId: 'A2', pin: 'j' }, b: { componentId: 'B2', pin: 'j' } }
      ]
    };
    const routed = routeAllWirePolylines(doc);
    expect(routed.get('W1')!.length).toBeGreaterThanOrEqual(2);
    expect(routed.get('W2')!.length).toBeGreaterThanOrEqual(2);
  });

  it('T-drop onto a horizontal rail is a straight vertical stub', () => {
    const rail = [
      { x: 40, y: 200 },
      { x: 400, y: 200 }
    ];
    const tee = orthogonalTeeOnPolyline({ x: 320, y: 80 }, rail, { x: 250, y: 198 }, 16);
    expect(tee).toEqual({ x: 320, y: 200 });
    const pts = routeOrthogonal(320, 80, tee!.x, tee!.y, { axisLock: 'v' });
    expect(polylineSegments(pts).length).toBe(1);
    expect(firstLegAxis(pts)).toBe('v');
  });

  it('exposes existing wires as segments', () => {
    resetIdSeq(10);
    const a = createComponent('junction', 0, 0, 'A');
    const b = createComponent('junction', 100, 0, 'B');
    const doc: SchematicDocument = {
      groundNet: 'gnd',
      components: [a, b],
      wires: [{ id: 'W1', a: { componentId: 'A', pin: 'j' }, b: { componentId: 'B', pin: 'j' } }]
    };
    const obs = documentWireObstacles(doc);
    expect(obs.length).toBeGreaterThan(0);
  });

  it('pulling down goes vertical-first (not the opposite L)', () => {
    const pts = routeOrthogonal(0, 0, 50, 100, {
      exitA: { x: 0, y: 1 },
      axisLock: 'v',
      motion: [
        { x: 0, y: 0 },
        { x: 0, y: 40 },
        { x: 20, y: 80 },
        { x: 50, y: 100 }
      ]
    });
    const longAlongStartRow = polylineSegments(pts).some(
      (s) => Math.abs(s.y1) < 0.5 && Math.abs(s.y2) < 0.5 && Math.abs(s.x2 - s.x1) > 20
    );
    expect(longAlongStartRow).toBeFalse();
    expect(firstLegAxis(pts)).toBe('v');
  });

  it('squared circuit: down then across follows rectangle sides (L), not mid cut', () => {
    const motion = [
      { x: 80, y: 180 },
      { x: 80, y: 220 },
      { x: 80, y: 260 },
      { x: 120, y: 300 },
      { x: 160, y: 300 }
    ];
    const pts = routeOrthogonal(80, 180, 160, 300, {
      exitA: { x: -1, y: 0 },
      motion,
      axisLock: updateAxisLock(null, motion, { x: 80, y: 180 }, { x: 160, y: 300 })
    });
    // Two sides of the rectangle — corner at left column then bottom row.
    expect(pts.some((p) => Math.abs(p.x - 80) < 12 && Math.abs(p.y - 300) < 1)).toBeTrue();
    // Must not cut through mid (U).
    const midCut = polylineSegments(pts).some(
      (s) =>
        Math.abs(s.y1 - s.y2) < 0.5 &&
        s.y1 > 200 &&
        s.y1 < 280 &&
        Math.abs(s.x2 - s.x1) > 40
    );
    expect(midCut).toBeFalse();
  });

  it('left horizontal pin + pull down does not run the opposite L', () => {
    const motion = [
      { x: 80, y: 180 },
      { x: 78, y: 220 },
      { x: 90, y: 280 },
      { x: 160, y: 300 }
    ];
    const pts = routeOrthogonal(80, 180, 160, 300, {
      exitA: { x: -1, y: 0 },
      motion,
      axisLock: 'v'
    });
    const longAlongStartRow = polylineSegments(pts).some(
      (s) =>
        Math.abs(s.y1 - 180) < 1 && Math.abs(s.y2 - 180) < 1 && Math.abs(s.x2 - s.x1) > 20
    );
    expect(longAlongStartRow).toBeFalse();
    const longVertical = polylineSegments(pts).some(
      (s) => Math.abs(s.x1 - s.x2) < 1 && Math.abs(s.y2 - s.y1) > 40
    );
    expect(longVertical).toBeTrue();
  });

  it('motionPrimaryAxis follows the traced side of the rectangle', () => {
    // Across then down → HV (the old "latest pull" heuristic flipped this to VH).
    expect(
      motionPrimaryAxis([
        { x: 0, y: 0 },
        { x: 40, y: 0 },
        { x: 80, y: 0 },
        { x: 80, y: 40 },
        { x: 80, y: 80 }
      ])
    ).toBe('h');
    // Down then across → VH.
    expect(
      motionPrimaryAxis([
        { x: 0, y: 0 },
        { x: 0, y: 40 },
        { x: 0, y: 80 },
        { x: 50, y: 80 },
        { x: 120, y: 80 }
      ])
    ).toBe('v');
  });

  it('motionPrimaryAxis is ambiguous on a diagonal or straight run', () => {
    expect(
      motionPrimaryAxis([
        { x: 0, y: 0 },
        { x: 50, y: 50 },
        { x: 100, y: 100 }
      ])
    ).toBeNull();
    expect(
      motionPrimaryAxis([
        { x: 0, y: 0 },
        { x: 40, y: 2 },
        { x: 100, y: 5 }
      ])
    ).toBeNull();
  });

  it('motionPrimaryAxis fits the trace against the current cursor, not its own end', () => {
    // Trace drawn along the top row, cursor now far below-right.
    const trace = [
      { x: 0, y: 0 },
      { x: 60, y: 0 },
      { x: 120, y: 0 }
    ];
    expect(motionPrimaryAxis(trace, { x: 0, y: 0 }, { x: 120, y: 100 })).toBe('h');
  });

  it('re-tracing the other side flips the pick', () => {
    // First across the top and down; then back along the bottom and up the left.
    const trace = [
      { x: 0, y: 0 },
      { x: 60, y: 0 },
      { x: 120, y: 0 },
      { x: 120, y: 60 },
      { x: 120, y: 120 },
      { x: 60, y: 120 },
      { x: 0, y: 120 },
      { x: 0, y: 60 },
      { x: 0, y: 120 },
      { x: 60, y: 120 },
      { x: 120, y: 120 }
    ];
    expect(motionPrimaryAxis(trace, { x: 0, y: 0 }, { x: 120, y: 120 })).toBe('v');
  });

  it('axis lock sticks until the trace clearly picks a side', () => {
    expect(updateAxisLock('v', [], { x: 0, y: 0 }, { x: 100, y: 20 })).toBe('v');
    // Nearly straight run — both Ls coincide, lock stays.
    expect(
      updateAxisLock('v', [
        { x: 0, y: 0 },
        { x: 40, y: 0 },
        { x: 100, y: 5 }
      ], { x: 0, y: 0 }, { x: 100, y: 5 })
    ).toBe('v');
    // Clear across-then-down trace overrides.
    expect(
      updateAxisLock('v', [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 40 }
      ], { x: 0, y: 0 }, { x: 100, y: 80 })
    ).toBe('h');
  });

  it('intent ignores pin exit for primary axis', () => {
    const intent = inferRoutingIntent({
      from: { x: 0, y: 0 },
      to: { x: 40, y: 100 },
      axisLock: null,
      motion: [
        { x: 0, y: 0 },
        { x: 5, y: 50 },
        { x: 40, y: 100 }
      ]
    });
    expect(intent.primaryAxis).toBe('v');
    expect(intent.shape).toBe('L');
  });

  it('left horizontal pin + pull up uses clean VH L (no staircase jog)', () => {
    // Screenshot case: battery side pin → switch above-right. Horizontal exit must NOT
    // stub sideways first (that forced right→up→right).
    const motion = [
      { x: 80, y: 180 },
      { x: 80, y: 150 },
      { x: 90, y: 100 },
      { x: 160, y: 80 }
    ];
    const pts = routeOrthogonal(80, 180, 160, 80, {
      exitA: { x: 1, y: 0 },
      motion,
      axisLock: 'v'
    });
    const segs = polylineSegments(pts);
    expect(segs.length).toBeLessThanOrEqual(2);
    // One horizontal + one vertical — two sides of the square, not right→up→right.
    const horiz = segs.filter((s) => Math.abs(s.y1 - s.y2) < 0.5 && Math.abs(s.x2 - s.x1) > 8);
    expect(horiz.length).toBe(1);
    expect(pts.some((p) => Math.abs(p.x - 80) < 1 && Math.abs(p.y - 80) < 1)).toBeTrue();
  });

  it('drops leftover stub waypoints so old staircase wires become a square L', () => {
    const pts = routeOrthogonal(80, 180, 160, 80, {
      midpoints: [{ x: 90, y: 80 }]
    });
    const horiz = polylineSegments(pts).filter(
      (s) => Math.abs(s.y1 - s.y2) < 0.5 && Math.abs(s.x2 - s.x1) > 8
    );
    expect(horiz.length).toBe(1);
    expect(pts.some((p) => Math.abs(p.x - 80) < 1 && Math.abs(p.y - 80) < 1)).toBeTrue();
  });

  it('spanPrimaryAxis / inferPreferAxis soft vertical bias', () => {
    expect(spanPrimaryAxis(80, 100)).toBe('v');
    expect(spanPrimaryAxis(100, 50)).toBe('h');
    expect(inferPreferAxis(100, 50)).toBe('h');
  });
});
