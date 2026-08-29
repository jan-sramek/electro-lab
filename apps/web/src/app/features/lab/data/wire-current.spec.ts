import { createLedPreset } from './presets/led-series.preset';
import {
  estimateWireCurrentAtoB,
  pinOutflowAmps,
  wireCurrentAtoB
} from './wire-current';

describe('wire current direction', () => {
  it('resistor +I (a→b): current enters a from wire, leaves b into wire', () => {
    expect(pinOutflowAmps('resistor', 'a', 0.01)).toBeCloseTo(-0.01);
    expect(pinOutflowAmps('resistor', 'b', 0.01)).toBeCloseTo(0.01);
  });

  it('LED +I (a→c): enters a, leaves c', () => {
    expect(pinOutflowAmps('led', 'a', 0.0125)).toBeCloseTo(-0.0125);
    expect(pinOutflowAmps('led', 'c', 0.0125)).toBeCloseTo(0.0125);
  });

  it('battery +I (supplying): leaves p, enters n', () => {
    expect(pinOutflowAmps('battery', 'p', 0.0125)).toBeCloseTo(0.0125);
    expect(pinOutflowAmps('battery', 'n', 0.0125)).toBeCloseTo(-0.0125);
  });

  it('LED series wires: flow V+ → switch → R → LED → gnd, and gnd → V−', () => {
    const I = 0.0125;
    expect(wireCurrentAtoB('battery', 'p', I, 'switch', 'a', I)).toBeGreaterThan(0);
    expect(wireCurrentAtoB('switch', 'b', I, 'resistor', 'a', I)).toBeGreaterThan(0);
    expect(wireCurrentAtoB('resistor', 'b', I, 'led', 'a', I)).toBeGreaterThan(0);
    expect(wireCurrentAtoB('led', 'c', I, 'ground', 'g', null)).toBeGreaterThan(0);
    expect(wireCurrentAtoB('battery', 'n', I, 'ground', 'g', null)).toBeLessThan(0);
  });

  it('LED preset: every wire has flow, including battery− ↔ ground (bottom left)', () => {
    const doc = createLedPreset();
    const I = 0.0125;
    const currentOf = (id: string) =>
      id === 'GND1' ? null : I;

    for (const w of doc.wires) {
      const i = estimateWireCurrentAtoB(w, doc.components, doc.wires, currentOf);
      expect(Math.abs(i))
        .withContext(`${w.id} ${w.a.componentId}.${w.a.pin} → ${w.b.componentId}.${w.b.pin}`)
        .toBeGreaterThan(1e-6);
    }

    const w4 = doc.wires.find((w) => w.id === 'W4')!;
    // Along V1.n → GND: current is toward the battery (negative along a→b).
    expect(estimateWireCurrentAtoB(w4, doc.components, doc.wires, currentOf)).toBeLessThan(0);
  });

  it('LED preset: battery− ↔ ground still flows if V1 current is missing', () => {
    const doc = createLedPreset();
    const currentOf = (id: string) => (id === 'D1' || id === 'R1' || id === 'S1' ? 0.0125 : null);
    const w4 = doc.wires.find((w) => w.id === 'W4')!;
    const i = estimateWireCurrentAtoB(w4, doc.components, doc.wires, currentOf);
    expect(i).toBeLessThan(0);
    expect(Math.abs(i)).toBeGreaterThan(1e-6);
  });
});
