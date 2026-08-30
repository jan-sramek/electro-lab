import { compileNetlist, orthogonalPolyline, pinWorldPos } from './schematic.model';
import { createLedPreset } from './presets/led-series.preset';
import { createLedFadePreset } from './presets/led-fade.preset';
import { createRcStepPreset } from './presets/rc-step.preset';
import { createPotDividerPreset } from './presets/pot-divider.preset';
import { createPulseRcPreset } from './presets/pulse-rc.preset';
import { createOpAmpBufferPreset } from './presets/opamp-buffer.preset';
import { createAcRcPreset } from './presets/ac-rc.preset';
import { createBjtSwitchPreset } from './presets/bjt-switch.preset';
import { createRelayDiodePreset } from './presets/relay-diode.preset';
import { diagnoseSchematic } from './circuit-diagnostics';
import { SchematicDocument } from './schematic.model';

/** Long horizontal segments that share the same y and overlap in x (supply/return collision). */
function overlappingHorizontalRails(docs: SchematicDocument[]): string[] {
  const hits: string[] = [];
  for (const doc of docs) {
    const segs: { y: number; x1: number; x2: number; id: string }[] = [];
    for (const w of doc.wires) {
      const ca = doc.components.find((c) => c.id === w.a.componentId);
      const cb = doc.components.find((c) => c.id === w.b.componentId);
      if (!ca || !cb) continue;
      const a = pinWorldPos(ca, w.a.pin);
      const b = pinWorldPos(cb, w.b.pin);
      if (!a || !b) continue;
      const pts = orthogonalPolyline(a.x, a.y, b.x, b.y);
      for (let i = 0; i < pts.length - 1; i++) {
        const p = pts[i]!;
        const q = pts[i + 1]!;
        if (Math.abs(p.y - q.y) > 0.5) continue;
        segs.push({
          y: p.y,
          x1: Math.min(p.x, q.x),
          x2: Math.max(p.x, q.x),
          id: w.id
        });
      }
    }
    for (let i = 0; i < segs.length; i++) {
      for (let j = i + 1; j < segs.length; j++) {
        const A = segs[i]!;
        const B = segs[j]!;
        if (Math.abs(A.y - B.y) > 0.5) continue;
        const overlap = Math.min(A.x2, B.x2) - Math.max(A.x1, B.x1);
        // Ignore short shared stubs at a pin; flag long coincident rails.
        if (overlap > 15) hits.push(`${A.id} ∩ ${B.id} @ y=${A.y}`);
      }
    }
  }
  return hits;
}

describe('Lab preset contracts', () => {
  it('compiles LED preset with expected models', () => {
    const circuit = compileNetlist(createLedPreset());
    expect(circuit.ground).toBe('gnd');
    const models = circuit.elements.map((e) => e.model).sort();
    expect(models).toEqual(['battery', 'led', 'resistor', 'switch'].sort());
    expect(circuit.elements.every((e) => Object.keys(e.pins).length >= 2)).toBeTrue();
  });

  it('compiles LED fade preset with capacitor and LED', () => {
    const circuit = compileNetlist(createLedFadePreset());
    expect(circuit.elements.some((e) => e.model === 'led')).toBeTrue();
    expect(circuit.elements.some((e) => e.model === 'capacitor')).toBeTrue();
    expect(circuit.elements.some((e) => e.model === 'switch')).toBeTrue();
    expect(circuit.elements.some((e) => e.model === 'battery')).toBeTrue();
    const sw = circuit.elements.find((e) => e.id === 'S1');
    expect(sw?.params['closed']).toBe(true);
    expect(sw?.params['openAt']).toBe(-1);
  });

  it('compiles RC preset for transient', () => {
    const circuit = compileNetlist(createRcStepPreset());
    expect(circuit.elements.some((e) => e.model === 'capacitor')).toBeTrue();
    expect(circuit.elements.some((e) => e.model === 'resistor')).toBeTrue();
  });

  it('compiles pot and pulse presets', () => {
    const pot = compileNetlist(createPotDividerPreset());
    expect(pot.elements.some((e) => e.model === 'potentiometer')).toBeTrue();
    const pulse = compileNetlist(createPulseRcPreset());
    expect(pulse.elements.some((e) => e.model === 'pulse_source')).toBeTrue();
  });

  it('compiles op-amp, AC, BJT, and relay presets', () => {
    const oa = compileNetlist(createOpAmpBufferPreset());
    expect(oa.elements.some((e) => e.model === 'op_amp')).toBeTrue();
    const ac = compileNetlist(createAcRcPreset());
    expect(ac.elements.some((e) => e.model === 'ac_source')).toBeTrue();
    expect(ac.elements.every((e) => e.model !== 'voltmeter')).toBeTrue();
    const bjt = compileNetlist(createBjtSwitchPreset());
    expect(bjt.elements.some((e) => e.model === 'bjt_npn')).toBeTrue();
    expect(bjt.elements.some((e) => e.id === 'Q1')).toBeTrue();
    expect(createBjtSwitchPreset().components.some((c) => c.modelKey === 'bc547')).toBeTrue();
    expect(bjt.elements.some((e) => e.model === 'ammeter')).toBeTrue();
    expect(bjt.elements.some((e) => e.model === 'switch')).toBeTrue();
    const relay = compileNetlist(createRelayDiodePreset());
    expect(relay.elements.some((e) => e.model === 'relay')).toBeTrue();
    expect(relay.elements.some((e) => e.model === 'diode' && e.id === 'Dfly')).toBeTrue();
    expect(relay.elements.some((e) => e.model === 'led')).toBeTrue();
    expect(relay.elements.some((e) => e.model === 'switch')).toBeTrue();
  });

  it('avoids long overlapping horizontal wire rails (supply vs return)', () => {
    const hits = overlappingHorizontalRails([
      createLedPreset(),
      createLedFadePreset(),
      createRcStepPreset(),
      createPotDividerPreset(),
      createPulseRcPreset(),
      createOpAmpBufferPreset(),
      createAcRcPreset(),
      createBjtSwitchPreset(),
      createRelayDiodePreset()
    ]);
    expect(hits).withContext(hits.join('; ')).toEqual([]);
  });

  it('flags shorted voltage source', () => {
    const doc = createLedPreset();
    const shorted = {
      ...doc,
      wires: [
        ...doc.wires,
        { id: 'WSHORT', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'V1', pin: 'n' } }
      ]
    };
    const diags = diagnoseSchematic(shorted, 'dcOp');
    expect(diags.some((d) => d.code === 'shorted_voltage_source')).toBeTrue();
  });
});
