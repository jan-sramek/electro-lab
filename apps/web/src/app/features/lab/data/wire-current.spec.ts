import { createLedPreset } from './presets/led-series.preset';
import { createLedFadePreset } from './presets/led-fade.preset';
import { createPotDividerPreset } from './presets/pot-divider.preset';
import { createBjtSwitchPreset } from './presets/bjt-switch.preset';
import { createOpAmpBufferPreset } from './presets/opamp-buffer.preset';
import {
  createComponent,
  assignNets,
  SchematicDocument
} from './schematic.model';
import {
  estimateAllWireCurrents,
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

  it('potentiometer +I: leaves through b (return leg)', () => {
    expect(pinOutflowAmps('potentiometer', 'a', 0.001)).toBeCloseTo(-0.001);
    expect(pinOutflowAmps('potentiometer', 'b', 0.001)).toBeCloseTo(0.001);
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
    const currentOf = (id: string) => (id === 'GND1' || id === 'J1' ? null : I);

    for (const w of doc.wires) {
      const i = estimateWireCurrentAtoB(w, doc.components, doc.wires, currentOf);
      expect(Math.abs(i))
        .withContext(`${w.id} ${w.a.componentId}.${w.a.pin} → ${w.b.componentId}.${w.b.pin}`)
        .toBeGreaterThan(1e-6);
    }

    const wBattGnd = doc.wires.find(
      (w) => w.a.componentId === 'V1' && w.a.pin === 'n'
    )!;
    // Along V1.n → GND: current is toward the battery (negative along a→b).
    expect(estimateWireCurrentAtoB(wBattGnd, doc.components, doc.wires, currentOf)).toBeLessThan(
      0
    );
  });

  it('LED preset: battery− ↔ ground still flows if V1 current is missing', () => {
    const doc = createLedPreset();
    const currentOf = (id: string) =>
      id === 'D1' || id === 'R1' || id === 'S1' ? 0.0125 : null;
    const wBattGnd = doc.wires.find(
      (w) => w.a.componentId === 'V1' && w.a.pin === 'n'
    )!;
    const i = estimateWireCurrentAtoB(wBattGnd, doc.components, doc.wires, currentOf);
    expect(i).toBeLessThan(0);
    expect(Math.abs(i)).toBeGreaterThan(1e-6);
  });

  it('return path through a junction still animates (LED → J → battery−)', () => {
    const v1 = createComponent('battery', 100, 180, 'V1');
    const r1 = createComponent('resistor', 300, 100, 'R1');
    const d1 = createComponent('led', 500, 180, 'D1');
    const j1 = createComponent('junction', 300, 280, 'J1');
    const doc: SchematicDocument = assignNets({
      groundNet: 'gnd',
      components: [v1, r1, d1, j1],
      wires: [
        { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'R1', pin: 'a' } },
        { id: 'W2', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'D1', pin: 'a' } },
        { id: 'W3', a: { componentId: 'D1', pin: 'c' }, b: { componentId: 'J1', pin: 'j' } },
        { id: 'W4', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'V1', pin: 'n' } }
      ]
    });
    const I = 0.01;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) =>
      id === 'J1' ? null : I
    );
    for (const w of doc.wires) {
      expect(Math.abs(currents.get(w.id) ?? 0))
        .withContext(w.id)
        .toBeGreaterThan(1e-6);
    }
    // Junction → battery−: current flows toward the battery (positive along a→b).
    expect(currents.get('W4')).toBeGreaterThan(0);
  });

  it('pot divider: every wire flows including pot.b → ground', () => {
    const doc = createPotDividerPreset();
    const I = 0.0005;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) =>
      id === 'GND1' || id === 'J1' ? null : I
    );
    for (const w of doc.wires) {
      expect(Math.abs(currents.get(w.id) ?? 0))
        .withContext(w.id)
        .toBeGreaterThan(1e-6);
    }
  });

  it('BJT switch: collector and emitter legs animate', () => {
    const doc = createBjtSwitchPreset();
    const currentOf = (id: string): number | null => {
      if (id === 'GND1' || id === 'J1' || id === 'JV') return null;
      if (id === 'Q1') return 0.015;
      if (id === 'RB') return 0.004;
      if (id === 'RC' || id === 'D1' || id === 'AM1') return 0.015;
      if (id === 'VB') return 0.019;
      return null;
    };
    const currents = estimateAllWireCurrents(doc.components, doc.wires, currentOf);
    for (const id of ['W6', 'W7', 'W8', 'W9', 'W10']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
  });

  it('op-amp invert: input chain and bottom ground rail animate', () => {
    const doc = createOpAmpBufferPreset();
    const currentOf = (id: string): number | null => {
      if (id.startsWith('J') || id === 'GND1') return null;
      if (id === 'V1' || id === 'RIN') return 0.001;
      if (id === 'RF') return 0.001;
      if (id === 'RL') return 0.005;
      if (id === 'U1') return 0.006;
      return null;
    };
    const currents = estimateAllWireCurrents(doc.components, doc.wires, currentOf);
    for (const id of ['W1', 'W2', 'W5', 'W6', 'W8', 'W9', 'W11', 'W12', 'W13', 'W14']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
  });

  it('LED fade discharge: loop on C↔LED only — no ghost on switch/battery/gnd', () => {
    const doc = createLedFadePreset();
    // Open-switch discharge: only C and LED/R carry current; V1 and S1 are idle.
    const Iled = 0.008;
    const Icap = -0.008; // discharging (a←b through device)
    const currentOf = (id: string): number | null => {
      if (id === 'GND1' || id === 'JT') return null;
      if (id === 'V1' || id === 'S1') return 0;
      if (id === 'D1' || id === 'R1') return Iled;
      if (id === 'C1') return Icap;
      return null;
    };
    const currents = estimateAllWireCurrents(doc.components, doc.wires, currentOf);
    for (const id of ['W1', 'W2', 'W4', 'W8']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(`${id} should be idle`)
        .toBeLessThan(1e-9);
    }
    for (const id of ['W3', 'W5', 'W6', 'W7']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(`${id} should carry discharge`)
        .toBeGreaterThan(1e-6);
    }
  });
});
