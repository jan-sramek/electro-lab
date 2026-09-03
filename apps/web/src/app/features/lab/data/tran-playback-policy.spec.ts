import { TranPlaybackPolicy } from './tran-playback-policy';
import { createLedFadePreset } from './presets/led-fade.preset';
import { createBuckPreset } from './presets/buck.preset';
import { createBoostPreset } from './presets/boost.preset';
import { createHalfWavePreset } from './presets/half-wave.preset';
import { createNe555AstablePreset } from './presets/ne555-astable.preset';
import { SimulateResponse } from '../api/circuit-api.types';
import { assignNets, createComponent } from './schematic.model';

describe('TranPlaybackPolicy', () => {
  const policy = new TranPlaybackPolicy();

  it('plays charge animation when switch is closed and caps are present', () => {
    const doc = createLedFadePreset();
    const res = fakeLedFadeTran(doc, 3000);
    const out = policy.resolve(
      { doc, activePreset: 'ledFade', usedEnergySeed: false, storedCapVoltageAbs: 0, animateDischargePlayback: false, tStop: 6 },
      res
    );
    expect(out.playback).toBe('charge-once');
    expect(out.scrubIndex).toBeGreaterThan(0);
    expect(out.timing?.sampleCount).toBeGreaterThan(10);
    expect(out.timing?.sampleCount).toBeLessThan(res.tran!.time.length);
  });

  it('loops buck/boost PWM instead of one-shot cap charge scrub', () => {
    const buck = createBuckPreset();
    const res = fakePwmTran(200);
    const buckPlan = policy.resolve(
      {
        doc: buck,
        activePreset: 'buck',
        usedEnergySeed: false,
        storedCapVoltageAbs: 0,
        animateDischargePlayback: false,
        tStop: 0.01
      },
      res
    );
    expect(policy.isSwitchingConverter(buck)).toBeTrue();
    expect(buckPlan.playback).toBe('blink-loop');

    const boostPlan = policy.resolve(
      {
        doc: createBoostPreset(),
        activePreset: 'boost',
        usedEnergySeed: false,
        storedCapVoltageAbs: 0,
        animateDischargePlayback: false,
        tStop: 0.01
      },
      res
    );
    expect(boostPlan.playback).toBe('blink-loop');
  });

  it('loops half-wave AC so conduction half-cycles stay visible', () => {
    const doc = createHalfWavePreset();
    const res = fakeHalfWaveTran(400);
    const plan = policy.resolve(
      {
        doc,
        activePreset: 'halfWave',
        usedEnergySeed: false,
        storedCapVoltageAbs: 0,
        animateDischargePlayback: false,
        tStop: 0.08
      },
      res
    );
    expect(policy.hasAcSource(doc)).toBeTrue();
    expect(plan.playback).toBe('blink-loop');
  });

  it('loops NE555 astable instead of one-shot RC charge scrub', () => {
    const doc = createNe555AstablePreset();
    const res = fakeNe555Tran(400);
    const withPreset = policy.resolve(
      {
        doc,
        activePreset: 'ne555',
        usedEnergySeed: false,
        storedCapVoltageAbs: 0,
        animateDischargePlayback: false,
        tStop: 0.1
      },
      res
    );
    expect(policy.shouldAnimateCharge({
      doc,
      activePreset: 'ne555',
      usedEnergySeed: false,
      storedCapVoltageAbs: 0,
      animateDischargePlayback: false,
      tStop: 0.1
    })).toBeFalse();
    expect(withPreset.playback).toBe('blink-loop');

    // Topology alone is enough — preset id may be missing after edits.
    const byTopology = policy.resolve(
      {
        doc,
        activePreset: null,
        usedEnergySeed: false,
        storedCapVoltageAbs: 0,
        animateDischargePlayback: false,
        tStop: 0.1
      },
      res
    );
    expect(byTopology.playback).toBe('blink-loop');
  });

  it('plays discharge animation when switch is open with stored energy', () => {
    const doc = assignNets({
      ...createLedFadePreset(),
      components: createLedFadePreset().components.map((c) =>
        c.modelKey === 'switch' ? { ...c, params: { ...c.params, closed: false } } : c
      )
    });
    const res = fakeLedFadeTran(doc, 3000);
    const out = policy.resolve(
      { doc, activePreset: 'ledFade', usedEnergySeed: true, storedCapVoltageAbs: 4.5, animateDischargePlayback: true, tStop: 6 },
      res
    );
    expect(out.playback).toBe('discharge-once');
    expect(out.scrubIndex).toBeGreaterThanOrEqual(0);
    expect(out.endScrubIndex).toBeGreaterThan(out.scrubIndex);
  });

  it('discharge playback ends on the dim frame, not peak LED current', () => {
    const doc = assignNets({
      ...createLedFadePreset(),
      components: createLedFadePreset().components.map((c) =>
        c.modelKey === 'switch' ? { ...c, params: { ...c.params, closed: false } } : c
      )
    });
    const res = fakeDischargeTran(3000);
    const out = policy.resolve(
      { doc, activePreset: 'ledFade', usedEnergySeed: true, storedCapVoltageAbs: 4.5, animateDischargePlayback: true, tStop: 6 },
      res
    );
    expect(out.playback).toBe('discharge-once');
    const led = res.tran!.branchCurrents.find((s) => s.id === 'D1')!;
    expect(led.values[out.endScrubIndex]!).toBeLessThan(led.values[out.scrubIndex]! * 0.5);
  });

  it('slow discharge playback spans ~8τ for large capacitors', () => {
    const doc = assignNets({
      ...createLedFadePreset(),
      components: createLedFadePreset().components.map((c) => {
        if (c.modelKey === 'switch') return { ...c, params: { ...c.params, closed: false } };
        if (c.modelKey === 'capacitor') return { ...c, params: { ...c.params, c: 0.1022 } };
        return c;
      })
    });
    const dt = 0.002;
    const tau = 24.5;
    const samples = Math.floor((8 * tau) / dt) + 1;
    const time = Array.from({ length: samples }, (_, i) => i * dt);
    const ledI = time.map((t) => 0.012 * Math.exp(-t / tau));
    const res: SimulateResponse = {
      schemaVersion: 1,
      ok: true,
      analysisType: 'tran',
      errors: [],
      warnings: [],
      tran: {
        time,
        nodeVoltages: [],
        branchCurrents: [
          { id: 'C1', values: time.map((t, i) => (i === 0 ? 0 : -0.015 * Math.exp(-t / tau))) },
          { id: 'D1', values: ledI }
        ]
      }
    };
    const out = policy.resolve(
      { doc, activePreset: 'ledFade', usedEnergySeed: true, storedCapVoltageAbs: 4.5, animateDischargePlayback: true, tStop: 6 },
      res
    );
    expect(out.playback).toBe('discharge-once');
    const endT = res.tran!.time[out.endScrubIndex]!;
    expect(endT).toBeGreaterThan(tau * 6);
    expect(ledI[out.endScrubIndex]! * 1000).toBeLessThan(0.01);
  });

  it('discharge playback ends at the simulated tail, not at 5% of peak current', () => {
    const doc = assignNets({
      ...createLedFadePreset(),
      components: createLedFadePreset().components.map((c) =>
        c.modelKey === 'switch' ? { ...c, params: { ...c.params, closed: false } } : c
      )
    });
    const dt = 0.002;
    const tau = 0.5;
    const samples = Math.floor((8 * tau) / dt) + 1;
    const time = Array.from({ length: samples }, (_, i) => i * dt);
    const ledI = time.map((t) => 0.012 * Math.exp(-t / tau));
    const res: SimulateResponse = {
      schemaVersion: 1,
      ok: true,
      analysisType: 'tran',
      errors: [],
      warnings: [],
      tran: {
        time,
        nodeVoltages: [],
        branchCurrents: [
          { id: 'C1', values: time.map((t, i) => (i === 0 ? 0 : -0.015 * Math.exp(-t / tau))) },
          { id: 'D1', values: ledI }
        ]
      }
    };
    const out = policy.resolve(
      { doc, activePreset: 'ledFade', usedEnergySeed: true, storedCapVoltageAbs: 4.5, animateDischargePlayback: true, tStop: 6 },
      res
    );
    expect(out.endScrubIndex).toBe(samples - 1);
    expect(ledI[out.endScrubIndex]! * 1000).toBeLessThan(0.01);
  });

  it('plays discharge from stored energy even when this run did not inject seed', () => {
    const doc = assignNets({
      ...createLedFadePreset(),
      components: createLedFadePreset().components.map((c) =>
        c.modelKey === 'switch' ? { ...c, params: { ...c.params, closed: false } } : c
      )
    });
    const res = fakeLedFadeTran(doc, 3000);
    const out = policy.resolve(
      { doc, activePreset: 'ledFade', usedEnergySeed: false, storedCapVoltageAbs: 4.8, animateDischargePlayback: true, tStop: 6 },
      res
    );
    expect(out.playback).toBe('discharge-once');
  });

  it('plays discharge when energy seed was injected even if switch detection is ambiguous', () => {
    const doc = assignNets({
      groundNet: 'gnd',
      components: [
        createComponent('battery', 0, 0, 'V1'),
        createComponent('resistor', 100, 0, 'R1'),
        createComponent('capacitor', 200, 0, 'C1'),
        createComponent('led', 300, 0, 'D1'),
        createComponent('ground', 0, 100, 'GND1')
      ],
      wires: []
    });
    const res = fakeDischargeTran(500);
    const out = policy.resolve(
      { doc, activePreset: null, usedEnergySeed: true, storedCapVoltageAbs: 0, animateDischargePlayback: true, tStop: 6 },
      res
    );
    expect(out.playback).toBe('discharge-once');
  });

  it('skips discharge playback on mid-discharge parameter re-runs', () => {
    const doc = assignNets({
      ...createLedFadePreset(),
      components: createLedFadePreset().components.map((c) =>
        c.modelKey === 'switch' ? { ...c, params: { ...c.params, closed: false } } : c
      )
    });
    const res = fakeDischargeTran(500);
    const out = policy.resolve(
      {
        doc,
        activePreset: 'ledFade',
        usedEnergySeed: true,
        storedCapVoltageAbs: 4.5,
        animateDischargePlayback: false,
        tStop: 6
      },
      res
    );
    expect(out.playback).toBe('none');
  });

  it('charge settle index lands near 5τ not at full tStop', () => {
    const doc = createLedFadePreset();
    const res = fakeLedFadeTran(doc, 3000);
    const idx = policy.chargeSettleIndex(doc, res.tran!);
    const t = res.tran!.time[idx]!;
    expect(t).toBeGreaterThan(1);
    expect(t).toBeLessThan(5);
  });

  it('default scrub picks peak cap current not the steady-state end', () => {
    const doc = createLedFadePreset();
    const res = fakeLedFadeTran(doc, 3000);
    const idx = policy.defaultScrubIndex(doc, res.tran!);
    expect(idx).toBe(1);
    expect(Math.abs(res.tran!.branchCurrents.find((s) => s.id === 'C1')!.values[idx]!)).toBeGreaterThan(
      0.01
    );
  });

  it('charge playback stops in the brief inrush window for engine-style spike data', () => {
    const doc = createLedFadePreset();
    const res = engineChargeSpikeTran(3001);
    const out = policy.resolve(
      { doc, activePreset: 'ledFade', usedEnergySeed: false, storedCapVoltageAbs: 0, animateDischargePlayback: false, tStop: 6 },
      res
    );
    expect(out.playback).toBe('charge-once');
    expect(out.timing!.sampleCount).toBeLessThan(30);
    // Animation covers the spike; final scrub parks where |I_cap|≈0.
    expect(out.endScrubIndex).toBeGreaterThan(2);
    const iEnd = res.tran!.branchCurrents.find((s) => s.id === 'C1')!.values[out.endScrubIndex]!;
    expect(Math.abs(iEnd)).toBeLessThan(1e-5);
  });

  it('charge playback parks on settled zero after the inrush, not the peak frame', () => {
    const doc = createLedFadePreset();
    const res = engineChargeSpikeTran(3001);
    const out = policy.resolve(
      { doc, activePreset: 'ledFade', usedEnergySeed: false, storedCapVoltageAbs: 0, animateDischargePlayback: false, tStop: 6 },
      res
    );
    const peak = policy.peakCapCurrentIndex(doc, res.tran!)!;
    expect(out.endScrubIndex).not.toBe(peak);
    expect(Math.abs(res.tran!.branchCurrents.find((s) => s.id === 'C1')!.values[peak]!)).toBeGreaterThan(0.01);
  });
});

function fakeLedFadeTran(
  doc: ReturnType<typeof createLedFadePreset>,
  samples: number
): SimulateResponse {
  const time = Array.from({ length: samples }, (_, i) => (i / (samples - 1)) * 6);
  const capI = time.map((t, i) => (i === 0 ? 0 : 0.02 * Math.exp(-t / 0.5)));
  const ledI = time.map((t) => 0.01 + 0.005 * (1 - Math.exp(-t / 0.3)));
  return {
    schemaVersion: 1,
    ok: true,
    analysisType: 'tran',
    errors: [],
    warnings: [],
    tran: {
      time,
      nodeVoltages: [],
      branchCurrents: [
        { id: 'C1', values: capI },
        { id: 'D1', values: ledI }
      ]
    }
  };
}

function fakePwmTran(samples: number): SimulateResponse {
  const dt = 2e-5;
  const time = Array.from({ length: samples }, (_, i) => i * dt);
  const iL = time.map((t) => 0.04 + 0.01 * Math.sin((2 * Math.PI * t) / 0.001));
  return {
    schemaVersion: 1,
    ok: true,
    analysisType: 'tran',
    errors: [],
    warnings: [],
    tran: {
      time,
      nodeVoltages: [{ id: 'out', values: time.map(() => 4) }],
      branchCurrents: [
        { id: 'C1', values: time.map((_, i) => (i % 2 === 0 ? 0.005 : -0.004)) },
        { id: 'L1', values: iL },
        { id: 'RL', values: time.map(() => 0.02) },
        { id: 'M1', values: time.map((t) => ((t % 0.001) < 0.00025 ? 0.04 : 0)) },
        { id: 'Dfly', values: time.map((t) => ((t % 0.001) < 0.00025 ? 0 : 0.04)) }
      ]
    }
  };
}

/** Ends on a blocked half-cycle (I=0) — static scrub would hide wire flow. */
function fakeHalfWaveTran(samples: number): SimulateResponse {
  const dt = 2e-4;
  const time = Array.from({ length: samples }, (_, i) => i * dt);
  const iLoad = time.map((t) => {
    const v = 10 * Math.SQRT2 * Math.sin(2 * Math.PI * 50 * t);
    return v > 0.7 ? (v - 0.7) / 1000 : 0;
  });
  return {
    schemaVersion: 1,
    ok: true,
    analysisType: 'tran',
    errors: [],
    warnings: [],
    tran: {
      time,
      nodeVoltages: [],
      branchCurrents: [
        { id: 'AC1', values: iLoad },
        { id: 'D1', values: iLoad },
        { id: 'R1', values: iLoad }
      ]
    }
  };
}

/** Oscillating OUT / LED — must not be mistaken for a one-shot RC charge. */
function fakeNe555Tran(samples: number): SimulateResponse {
  const dt = 5e-5;
  const time = Array.from({ length: samples }, (_, i) => i * dt);
  const outHigh = time.map((t) => (Math.floor(t / 0.005) % 2 === 0 ? 5 : 0.1));
  const ledI = outHigh.map((v) => (v > 2 ? 0.012 : 0));
  return {
    schemaVersion: 1,
    ok: true,
    analysisType: 'tran',
    errors: [],
    warnings: [],
    tran: {
      time,
      nodeVoltages: [{ id: 'out', values: outHigh }],
      branchCurrents: [
        { id: 'CT', values: time.map((t) => 0.001 * Math.sin((2 * Math.PI * t) / 0.01)) },
        { id: 'D1', values: ledI },
        { id: 'U1', values: ledI }
      ]
    }
  };
}

/** Open-switch discharge: LED and cap current decay from a peak at t≈0. */
function fakeDischargeTran(samples: number): SimulateResponse {
  const time = Array.from({ length: samples }, (_, i) => (i / (samples - 1)) * 6);
  const ledI = time.map((t) => 0.012 * Math.exp(-t / 0.5));
  const capI = time.map((t, i) => (i === 0 ? 0 : -0.015 * Math.exp(-t / 0.5)));
  return {
    schemaVersion: 1,
    ok: true,
    analysisType: 'tran',
    errors: [],
    warnings: [],
    tran: {
      time,
      nodeVoltages: [],
      branchCurrents: [
        { id: 'C1', values: capI },
        { id: 'D1', values: ledI }
      ]
    }
  };
}

/** Circuit-engine LED-fade charge: huge inrush in step 1, then ~0 for the rest of the run. */
function engineChargeSpikeTran(samples: number): SimulateResponse {
  const time = Array.from({ length: samples }, (_, i) => i * 0.002);
  const capI = time.map((_, i) => {
    if (i === 0) return 0;
    if (i === 1) return 0.059;
    if (i === 2) return 0.00064;
    return 0;
  });
  const ledI = time.map((_, i) => (i < 2 ? 0.01 : 0.012));
  return {
    schemaVersion: 1,
    ok: true,
    analysisType: 'tran',
    errors: [],
    warnings: [],
    tran: {
      time,
      nodeVoltages: [{ id: 'n1', values: time.map((t) => (t < 0.004 ? 5 * (t / 0.004) : 5)) }],
      branchCurrents: [
        { id: 'C1', values: capI },
        { id: 'D1', values: ledI }
      ]
    }
  };
}
