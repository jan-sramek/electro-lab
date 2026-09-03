import { compileNetlist, orthogonalPolyline, pinWorldPos, assignNets } from './schematic.model';
import { createLedPreset } from './presets/led-series.preset';
import { createLedFadePreset } from './presets/led-fade.preset';
import { createRcStepPreset } from './presets/rc-step.preset';
import { createPotDividerPreset } from './presets/pot-divider.preset';
import { createPulseRcPreset } from './presets/pulse-rc.preset';
import { createOpAmpBufferPreset } from './presets/opamp-buffer.preset';
import { createOpAmpFollowerPreset } from './presets/opamp-follower.preset';
import { createOpAmpNonInvPreset } from './presets/opamp-noninv.preset';
import { createOpAmpComparatorPreset } from './presets/opamp-comparator.preset';
import { createOpAmpSchmittPreset } from './presets/opamp-schmitt.preset';
import { createOpAmpSummingPreset } from './presets/opamp-summing.preset';
import { createOpAmpIntegratorPreset } from './presets/opamp-integrator.preset';
import { createOpAmpDifferentiatorPreset } from './presets/opamp-differentiator.preset';
import { createOpAmpActiveFilterPreset } from './presets/opamp-active-filter.preset';
import { createAcRcPreset } from './presets/ac-rc.preset';
import { createBjtSwitchPreset } from './presets/bjt-switch.preset';
import { createRelayDiodePreset } from './presets/relay-diode.preset';
import { createNmosSwitchPreset } from './presets/nmos-switch.preset';
import { createNe555AstablePreset } from './presets/ne555-astable.preset';
import { createNe555ChristmasTreePreset } from './presets/ne555-christmas-tree.preset';
import { createNe555PotBlinkPreset } from './presets/ne555-pot-blink.preset';
import { createPushbuttonLedPreset } from './presets/pushbutton-led.preset';
import { createLdrNightLightPreset } from './presets/ldr-nightlight.preset';
import { createBuzzerButtonPreset } from './presets/buzzer-button.preset';
import { createMotorNmosPreset } from './presets/motor-nmos.preset';
import { createArduinoLedPreset } from './presets/arduino-led.preset';
import { createI2cOledPreset } from './presets/i2c-oled.preset';
import { createHalfWavePreset } from './presets/half-wave.preset';
import { createBridgePreset } from './presets/bridge.preset';
import { createFilterCapPreset } from './presets/filter-cap.preset';
import { createZenerPreset } from './presets/zener.preset';
import { createVreg7805Preset } from './presets/vreg-7805.preset';
import { createReversePolarityPreset } from './presets/reverse-polarity.preset';
import { createFuseProtectPreset } from './presets/fuse-protect.preset';
import { createRipplePreset } from './presets/ripple.preset';
import { createBuckPreset } from './presets/buck.preset';
import { createBoostPreset } from './presets/boost.preset';
import { createRcLowPassPreset } from './presets/rc-low-pass.preset';
import { createRcHighPassPreset } from './presets/rc-high-pass.preset';
import { createRlcSeriesPreset } from './presets/rlc-series.preset';
import { createBandPassPreset } from './presets/band-pass.preset';
import { createNotchFilterPreset } from './presets/notch-filter.preset';
import { createVoltageDividerPreset } from './presets/voltage-divider.preset';
import { createMeasureAcPreset } from './presets/measure-ac.preset';
import { createMotorPwmPreset } from './presets/motor-pwm.preset';
import { createHBridgePreset } from './presets/h-bridge.preset';
import { createMotorDirectionPreset } from './presets/motor-direction.preset';
import { createPullUpDownPreset } from './presets/pull-up-down.preset';
import { createDebouncePreset } from './presets/debounce.preset';
import { createNtcDividerPreset } from './presets/ntc-divider.preset';
import { createPwmFilterPreset } from './presets/pwm-filter.preset';
import { createRelayBjtPreset } from './presets/relay-bjt.preset';
import { createEstopRelayPreset } from './presets/estop-relay.preset';
import { createIndustrial24vPreset } from './presets/industrial-24v.preset';
import { diagnoseSchematic } from './circuit-diagnostics';
import { SchematicDocument } from './schematic.model';

/** Long horizontal segments that share the same y and overlap in x on *different* nets. */
function overlappingHorizontalRails(docs: SchematicDocument[]): string[] {
  const hits: string[] = [];
  for (const raw of docs) {
    const doc = assignNets(raw);
    const segs: { y: number; x1: number; x2: number; id: string; net: string }[] = [];
    for (const w of doc.wires) {
      const ca = doc.components.find((c) => c.id === w.a.componentId);
      const cb = doc.components.find((c) => c.id === w.b.componentId);
      if (!ca || !cb) continue;
      const a = pinWorldPos(ca, w.a.pin);
      const b = pinWorldPos(cb, w.b.pin);
      if (!a || !b) continue;
      const net = ca.pins[w.a.pin]?.net ?? cb.pins[w.b.pin]?.net ?? '';
      // Layout check uses plain HV/VH elbows (not pin-exit stubs).
      const pts = orthogonalPolyline(a.x, a.y, b.x, b.y);
      for (let i = 0; i < pts.length - 1; i++) {
        const p = pts[i]!;
        const q = pts[i + 1]!;
        if (Math.abs(p.y - q.y) > 0.5) continue;
        segs.push({
          y: p.y,
          x1: Math.min(p.x, q.x),
          x2: Math.max(p.x, q.x),
          id: w.id,
          net
        });
      }
    }
    for (let i = 0; i < segs.length; i++) {
      for (let j = i + 1; j < segs.length; j++) {
        const A = segs[i]!;
        const B = segs[j]!;
        if (Math.abs(A.y - B.y) > 0.5) continue;
        if (A.net && B.net && A.net === B.net) continue;
        const overlap = Math.min(A.x2, B.x2) - Math.max(A.x1, B.x1);
        // Ignore short shared stubs at a pin; flag long coincident rails.
        if (overlap > 15) hits.push(`${A.id} ∩ ${B.id} @ y=${A.y} (${A.net}/${B.net})`);
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

  it('compiles op-amp chapter presets', () => {
    const follower = compileNetlist(createOpAmpFollowerPreset());
    expect(follower.elements.some((e) => e.model === 'op_amp')).toBeTrue();
    const nonInv = compileNetlist(createOpAmpNonInvPreset());
    expect(nonInv.elements.some((e) => e.model === 'op_amp')).toBeTrue();
    const cmp = compileNetlist(createOpAmpComparatorPreset());
    expect(cmp.elements.some((e) => e.model === 'potentiometer')).toBeTrue();
    const schmitt = compileNetlist(createOpAmpSchmittPreset());
    expect(schmitt.elements.some((e) => e.model === 'op_amp')).toBeTrue();
    const sum = compileNetlist(createOpAmpSummingPreset());
    expect(sum.elements.filter((e) => e.model === 'battery').length).toBe(2);
    const integ = compileNetlist(createOpAmpIntegratorPreset());
    expect(integ.elements.some((e) => e.model === 'pulse_source')).toBeTrue();
    expect(integ.elements.some((e) => e.model === 'capacitor')).toBeTrue();
    const diff = compileNetlist(createOpAmpDifferentiatorPreset());
    expect(diff.elements.some((e) => e.model === 'capacitor')).toBeTrue();
    const lpf = compileNetlist(createOpAmpActiveFilterPreset());
    expect(lpf.elements.some((e) => e.model === 'ac_source')).toBeTrue();
  });

  it('compiles op-amp, AC, BJT, relay, NMOS, and NE555 presets', () => {
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
    const nmos = compileNetlist(createNmosSwitchPreset());
    expect(nmos.elements.some((e) => e.model === 'nmos')).toBeTrue();
    expect(nmos.elements.some((e) => e.id === 'M1')).toBeTrue();
    const ne555 = compileNetlist(createNe555AstablePreset());
    expect(ne555.elements.some((e) => e.model === 'ne555')).toBeTrue();
    expect(ne555.elements.some((e) => e.id === 'U1')).toBeTrue();
    expect(ne555.elements.filter((e) => e.model === 'led').length).toBe(3);
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

  it('NMOS sample layout compiles without long rail collisions', () => {
    const hits = overlappingHorizontalRails([createNmosSwitchPreset()]);
    expect(hits).withContext(hits.join('; ')).toEqual([]);
  });

  it('NE555 astable preset compiles three parallel LEDs', () => {
    const ne555 = compileNetlist(createNe555AstablePreset());
    expect(ne555.elements.filter((e) => e.model === 'led').length).toBe(3);
  });

  it('NE555 pot blink preset compiles one LED and a potentiometer', () => {
    const doc = createNe555PotBlinkPreset();
    const circuit = compileNetlist(doc);
    expect(circuit.elements.some((e) => e.model === 'ne555')).toBeTrue();
    expect(circuit.elements.some((e) => e.model === 'potentiometer')).toBeTrue();
    expect(circuit.elements.filter((e) => e.model === 'led').length).toBe(1);
    expect(doc.components.find((c) => c.id === 'POT1')?.params['pos']).toBe(0.35);
    expect(diagnoseSchematic(doc, 'tran').filter((d) => d.severity === 'error')).toEqual([]);
  });

  it('NE555 Christmas tree preset compiles ten LEDs', () => {
    const tree = compileNetlist(createNe555ChristmasTreePreset());
    expect(tree.elements.some((e) => e.model === 'ne555')).toBeTrue();
    expect(tree.elements.filter((e) => e.model === 'led').length).toBe(10);
  });

  it('Arduino-path presets compile new teaching models', () => {
    expect(compileNetlist(createPushbuttonLedPreset()).elements.some((e) => e.model === 'switch')).toBeTrue();
    expect(compileNetlist(createLdrNightLightPreset()).elements.some((e) => e.model === 'ldr')).toBeTrue();
    expect(compileNetlist(createBuzzerButtonPreset()).elements.some((e) => e.model === 'buzzer')).toBeTrue();
    const motor = compileNetlist(createMotorNmosPreset());
    expect(motor.elements.some((e) => e.model === 'dc_motor')).toBeTrue();
    expect(motor.elements.some((e) => e.model === 'nmos')).toBeTrue();
    expect(compileNetlist(createArduinoLedPreset()).elements.some((e) => e.model === 'arduino_dio')).toBeTrue();
    const i2c = compileNetlist(createI2cOledPreset());
    expect(i2c.elements.some((e) => e.model === 'arduino_i2c')).toBeTrue();
    expect(i2c.elements.some((e) => e.model === 'ssd1306')).toBeTrue();
    expect(i2c.elements.filter((e) => e.model === 'resistor').length).toBe(2);
  });

  it('Arduino-path sample layouts avoid long rail collisions', () => {
    const hits = overlappingHorizontalRails([
      createPushbuttonLedPreset(),
      createLdrNightLightPreset(),
      createBuzzerButtonPreset(),
      createMotorNmosPreset(),
      createArduinoLedPreset(),
      createI2cOledPreset()
    ]);
    expect(hits).withContext(hits.join('; ')).toEqual([]);
  });

  it('power-supply presets compile expected models', () => {
    expect(compileNetlist(createHalfWavePreset()).elements.some((e) => e.model === 'diode')).toBeTrue();
    expect(compileNetlist(createBridgePreset()).elements.filter((e) => e.model === 'diode').length).toBe(4);
    expect(compileNetlist(createFilterCapPreset()).elements.some((e) => e.model === 'capacitor')).toBeTrue();
    expect(compileNetlist(createZenerPreset()).elements.some((e) => e.model === 'zener')).toBeTrue();
    expect(compileNetlist(createVreg7805Preset()).elements.some((e) => e.model === 'vreg_7805')).toBeTrue();
    expect(compileNetlist(createReversePolarityPreset()).elements.some((e) => e.model === 'diode')).toBeTrue();
    expect(compileNetlist(createFuseProtectPreset()).elements.some((e) => e.model === 'fuse')).toBeTrue();
    const fuseProtect = createFuseProtectPreset();
    expect(fuseProtect.components.find((c) => c.id === 'S1')?.params['closed']).toBe(false);
    expect(compileNetlist(createRipplePreset()).elements.some((e) => e.model === 'capacitor')).toBeTrue();
    const buck = compileNetlist(createBuckPreset());
    expect(buck.elements.some((e) => e.model === 'inductor')).toBeTrue();
    expect(buck.elements.some((e) => e.model === 'nmos')).toBeTrue();
    expect(buck.elements.some((e) => e.model === 'pulse_source')).toBeTrue();
    expect(createBuckPreset().components.find((c) => c.id === 'L1')?.params['l']).toBe(0.1);
    const boost = compileNetlist(createBoostPreset());
    expect(boost.elements.some((e) => e.model === 'inductor')).toBeTrue();
    expect(boost.elements.some((e) => e.model === 'nmos')).toBeTrue();
    expect(createBoostPreset().components.find((c) => c.id === 'L1')?.params['l']).toBe(0.047);
  });

  it('filters / motors / digital presets compile expected models', () => {
    expect(compileNetlist(createRcLowPassPreset()).elements.some((e) => e.model === 'capacitor')).toBeTrue();
    expect(compileNetlist(createRcHighPassPreset()).elements.some((e) => e.model === 'capacitor')).toBeTrue();
    expect(compileNetlist(createRlcSeriesPreset()).elements.some((e) => e.model === 'inductor')).toBeTrue();
    expect(compileNetlist(createBandPassPreset()).elements.some((e) => e.model === 'inductor')).toBeTrue();
    const notch = compileNetlist(createNotchFilterPreset());
    expect(notch.elements.some((e) => e.model === 'inductor')).toBeTrue();
    // Series Rs + Rload — ideal AC alone cannot show a shunt-LC notch.
    expect(notch.elements.filter((e) => e.model === 'resistor').length).toBe(2);
    expect(diagnoseSchematic(createNotchFilterPreset(), 'ac').filter((d) => d.severity === 'error')).toEqual([]);
    expect(overlappingHorizontalRails([createNotchFilterPreset()])).toEqual([]);

    expect(compileNetlist(createVoltageDividerPreset()).elements.filter((e) => e.model === 'resistor').length).toBeGreaterThanOrEqual(2);
    expect(compileNetlist(createMeasureAcPreset()).elements.some((e) => e.model === 'ac_source')).toBeTrue();
    expect(compileNetlist(createMotorPwmPreset()).elements.some((e) => e.model === 'pulse_source')).toBeTrue();
    expect(compileNetlist(createMotorPwmPreset()).elements.some((e) => e.model === 'dc_motor')).toBeTrue();
    expect(compileNetlist(createHBridgePreset()).elements.filter((e) => e.model === 'switch').length).toBe(4);
    expect(compileNetlist(createMotorDirectionPreset()).elements.some((e) => e.model === 'dc_motor')).toBeTrue();
    expect(compileNetlist(createPullUpDownPreset()).elements.some((e) => e.model === 'led')).toBeTrue();
    expect(compileNetlist(createDebouncePreset()).elements.some((e) => e.model === 'capacitor')).toBeTrue();
  });

  it('sensors / adc-dac / industrial presets compile expected models', () => {
    expect(compileNetlist(createNtcDividerPreset()).elements.some((e) => e.model === 'potentiometer')).toBeTrue();
    expect(createNtcDividerPreset().components.find((c) => c.id === 'NTC1')?.rotation).toBe(90);
    expect(diagnoseSchematic(createNtcDividerPreset(), 'dcOp').filter((d) => d.severity === 'error')).toEqual([]);
    expect(overlappingHorizontalRails([createNtcDividerPreset()])).toEqual([]);
    expect(compileNetlist(createPwmFilterPreset()).elements.some((e) => e.model === 'pulse_source')).toBeTrue();
    expect(compileNetlist(createPwmFilterPreset()).elements.some((e) => e.model === 'capacitor')).toBeTrue();
    expect(compileNetlist(createRelayBjtPreset()).elements.some((e) => e.model === 'relay')).toBeTrue();
    expect(compileNetlist(createRelayBjtPreset()).elements.some((e) => e.model === 'bjt_npn')).toBeTrue();
    expect(diagnoseSchematic(createRelayBjtPreset(), 'dcOp').filter((d) => d.severity === 'error')).toEqual([]);
    expect(overlappingHorizontalRails([createRelayBjtPreset()])).toEqual([]);
    expect(createEstopRelayPreset().components.some((c) => c.id === 'SESTOP')).toBeTrue();
    expect(createIndustrial24vPreset().components.find((c) => c.id === 'VB')?.params['v']).toBe(24);
    expect(compileNetlist(createIndustrial24vPreset()).elements.some((e) => e.model === 'relay')).toBeTrue();
  });

  it('power-supply sample layouts avoid long rail collisions', () => {
    const presets = [
      ['halfWave', createHalfWavePreset()],
      ['bridge', createBridgePreset()],
      ['filterCap', createFilterCapPreset()],
      ['zener', createZenerPreset()],
      ['vreg7805', createVreg7805Preset()],
      ['reversePolarity', createReversePolarityPreset()],
      ['fuseProtect', createFuseProtectPreset()],
      ['ripple', createRipplePreset()],
      ['buck', createBuckPreset()],
      ['boost', createBoostPreset()]
    ] as const;
    for (const [name, doc] of presets) {
      const hits = overlappingHorizontalRails([doc]);
      expect(hits).withContext(`${name}: ${hits.join('; ')}`).toEqual([]);
    }
  });

  it('all example presets compile and diagnose without errors in default mode', () => {
    const presets: [string, SchematicDocument, 'dcOp' | 'tran' | 'ac'][] = [
      ['led', createLedPreset(), 'dcOp'],
      ['ledFade', createLedFadePreset(), 'tran'],
      ['rc', createRcStepPreset(), 'tran'],
      ['pot', createPotDividerPreset(), 'dcOp'],
      ['pulse', createPulseRcPreset(), 'tran'],
      ['opamp', createOpAmpBufferPreset(), 'dcOp'],
      ['opampFollower', createOpAmpFollowerPreset(), 'dcOp'],
      ['opampNonInv', createOpAmpNonInvPreset(), 'dcOp'],
      ['opampComparator', createOpAmpComparatorPreset(), 'dcOp'],
      ['opampSchmitt', createOpAmpSchmittPreset(), 'dcOp'],
      ['opampSumming', createOpAmpSummingPreset(), 'dcOp'],
      ['opampIntegrator', createOpAmpIntegratorPreset(), 'tran'],
      ['opampDifferentiator', createOpAmpDifferentiatorPreset(), 'tran'],
      ['opampActiveFilter', createOpAmpActiveFilterPreset(), 'ac'],
      ['ac', createAcRcPreset(), 'ac'],
      ['bjt', createBjtSwitchPreset(), 'dcOp'],
      ['relay', createRelayDiodePreset(), 'dcOp'],
      ['nmos', createNmosSwitchPreset(), 'dcOp'],
      ['ne555', createNe555AstablePreset(), 'tran'],
      ['ne555Pot', createNe555PotBlinkPreset(), 'tran'],
      ['christmasTree', createNe555ChristmasTreePreset(), 'tran'],
      ['pushbutton', createPushbuttonLedPreset(), 'dcOp'],
      ['ldr', createLdrNightLightPreset(), 'dcOp'],
      ['buzzer', createBuzzerButtonPreset(), 'dcOp'],
      ['motor', createMotorNmosPreset(), 'dcOp'],
      ['arduino', createArduinoLedPreset(), 'dcOp'],
      ['i2cOled', createI2cOledPreset(), 'dcOp'],
      ['rcLowPass', createRcLowPassPreset(), 'ac'],
      ['rcHighPass', createRcHighPassPreset(), 'ac'],
      ['rlcSeries', createRlcSeriesPreset(), 'ac'],
      ['bandPass', createBandPassPreset(), 'ac'],
      ['notchFilter', createNotchFilterPreset(), 'ac'],
      ['voltageDivider', createVoltageDividerPreset(), 'dcOp'],
      ['measureAc', createMeasureAcPreset(), 'ac'],
      ['motorPwm', createMotorPwmPreset(), 'tran'],
      ['hBridge', createHBridgePreset(), 'dcOp'],
      ['motorDirection', createMotorDirectionPreset(), 'dcOp'],
      ['pullUpDown', createPullUpDownPreset(), 'dcOp'],
      ['debounce', createDebouncePreset(), 'dcOp'],
      ['ntcDivider', createNtcDividerPreset(), 'dcOp'],
      ['pwmFilter', createPwmFilterPreset(), 'tran'],
      ['relayBjt', createRelayBjtPreset(), 'dcOp'],
      ['estopRelay', createEstopRelayPreset(), 'dcOp'],
      ['industrial24v', createIndustrial24vPreset(), 'dcOp']
    ];
    for (const [name, doc, mode] of presets) {
      expect(() => compileNetlist(doc)).withContext(name).not.toThrow();
      const errs = diagnoseSchematic(doc, mode).filter((d) => d.severity === 'error');
      expect(errs.map((e) => e.code))
        .withContext(`${name}: ${errs.map((e) => e.code).join(', ')}`)
        .toEqual([]);
    }
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
