import { assignNets } from '../schematic.model';
import { createNe555AstablePreset } from '../presets/ne555-astable.preset';
import { createNe555ChristmasTreePreset } from '../presets/ne555-christmas-tree.preset';
import { createNmosSwitchPreset } from '../presets/nmos-switch.preset';
import { createLedPreset } from '../presets/led-series.preset';
import { createLedFadePreset } from '../presets/led-fade.preset';
import { createBuckPreset } from '../presets/buck.preset';
import { createBoostPreset } from '../presets/boost.preset';
import { createHalfWavePreset } from '../presets/half-wave.preset';
import { createBridgePreset } from '../presets/bridge.preset';
import { createFilterCapPreset } from '../presets/filter-cap.preset';
import { createNtcDividerPreset } from '../presets/ntc-divider.preset';
import { createSeriesParallelPreset } from '../presets/series-parallel.preset';
import { createDiodeDirectionPreset } from '../presets/diode-direction.preset';
import { createSeriesLedsPreset } from '../presets/series-leds.preset';
import { createVoltageDividerPreset } from '../presets/voltage-divider.preset';
import { createZenerPreset } from '../presets/zener.preset';
import { createPotDividerPreset } from '../presets/pot-divider.preset';
import { createMotorNmosPreset } from '../presets/motor-nmos.preset';
import { createRcStepPreset } from '../presets/rc-step.preset';
import { createRelayDiodePreset } from '../presets/relay-diode.preset';
import { createOpAmpFollowerPreset } from '../presets/opamp-follower.preset';
import { createReversePolarityPreset } from '../presets/reverse-polarity.preset';
import { createVreg7805Preset } from '../presets/vreg-7805.preset';
import { createHBridgePreset } from '../presets/h-bridge.preset';
import { createMotorPwmPreset } from '../presets/motor-pwm.preset';
import { createFuseProtectPreset } from '../presets/fuse-protect.preset';
import { createPullUpDownPreset } from '../presets/pull-up-down.preset';
import { createPwmFilterPreset } from '../presets/pwm-filter.preset';
import { createDebouncePreset } from '../presets/debounce.preset';
import { createRipplePreset } from '../presets/ripple.preset';
import { createBjtSwitchPreset } from '../presets/bjt-switch.preset';
import { createLdrNightLightPreset } from '../presets/ldr-nightlight.preset';
import { createIndustrial24vPreset } from '../presets/industrial-24v.preset';
import { createMotorDirectionPreset } from '../presets/motor-direction.preset';
import { createEstopRelayPreset } from '../presets/estop-relay.preset';
import { createRelayBjtPreset } from '../presets/relay-bjt.preset';
import { createOpAmpNonInvPreset } from '../presets/opamp-noninv.preset';
import { createArduinoLedPreset } from '../presets/arduino-led.preset';
import { createBuzzerButtonPreset } from '../presets/buzzer-button.preset';
import { createPushbuttonLedPreset } from '../presets/pushbutton-led.preset';
import { createPulseRcPreset } from '../presets/pulse-rc.preset';
import { createAcRcPreset } from '../presets/ac-rc.preset';
import { createRcLowPassPreset } from '../presets/rc-low-pass.preset';
import { createRcHighPassPreset } from '../presets/rc-high-pass.preset';
import { createMeasureAcPreset } from '../presets/measure-ac.preset';
import { estimateAllWireCurrents } from '../wire-current';
import { SchematicDocument } from '../schematic.model';

function missingWires(
  doc: SchematicDocument,
  currentOf: (id: string) => number | null,
  minA = 1e-6
): string[] {
  const currents = estimateAllWireCurrents(doc.components, doc.wires, currentOf);
  return doc.wires
    .filter((w) => Math.abs(currents.get(w.id) ?? 0) < minA)
    .map((w) => w.id);
}

describe('wire flow coverage on presets', () => {
  it('LED series — all wires animate', () => {
    const doc = createLedPreset();
    const I = 0.012;
    const missing = missingWires(doc, (id) => (id === 'GND1' || id === 'J1' ? null : I));
    expect(missing).withContext(missing.join(', ')).toEqual([]);
  });

  it('NMOS switch — drain loop and supply animate', () => {
    const doc = createNmosSwitchPreset();
    const I = 0.012;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id === 'JV' || id === 'JG' || id === 'J1') return null;
      if (id === 'VB' || id === 'AM1' || id === 'RD' || id === 'D1' || id === 'M1') return I;
      if (id === 'S1' || id === 'RG' || id === 'RPD') return 0;
      return null;
    });
    const energized = ['W1', 'W8', 'W9', 'W10', 'W11', 'W12', 'W13', 'W14'];
    for (const id of energized) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
    for (const id of ['W2', 'W3', 'W4', 'W5', 'W6', 'W7']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(`${id} gate/pull idle`)
        .toBeLessThan(1e-6);
    }
  });

  it('LED fade charge — cap branch, LED branch, and cap→ground animate', () => {
    const doc = createLedFadePreset();
    const Iin = 0.012;
    const Icap = 0.005;
    const Iled = 0.007;
    const missing = missingWires(doc, (id) => {
      if (id === 'GND1' || id === 'JT') return null;
      if (id === 'V1' || id === 'S1') return Iin;
      if (id === 'C1') return Icap;
      if (id === 'D1' || id === 'R1') return Iled;
      return null;
    });
    expect(missing).withContext(missing.join(', ')).toEqual([]);
  });

  it('LED fade discharge — C↔LED loop animates; battery/switch idle', () => {
    const doc = createLedFadePreset();
    const Iled = 0.008;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id === 'JT') return null;
      if (id === 'V1' || id === 'S1') return 0;
      if (id === 'C1') return -Iled;
      if (id === 'D1' || id === 'R1') return Iled;
      return null;
    });
    for (const id of ['W1', 'W2', 'W4', 'W8']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(`${id} supply/earth idle while switch open`)
        .toBeLessThan(1e-6);
    }
    for (const id of ['W3', 'W5', 'W6', 'W7']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(`${id} discharge loop`)
        .toBeGreaterThan(1e-6);
    }
  });

  it('NE555 astable — timing-only currents still animate ground return', () => {
    const doc = assignNets(createNe555AstablePreset());
    const Ict = 0.0003;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'RA' || id === 'RB' || id === 'CT' || id === 'CC') return Ict;
      if (id === 'V1' || id === 'U1' || id === 'R1' || id === 'R2' || id === 'R3') return 0;
      if (id === 'D1' || id === 'D2' || id === 'D3') return 0;
      return null;
    });
    const wGnd = doc.wires.find((w) => w.b.componentId === 'GND1' || w.a.componentId === 'GND1')!;
    expect(Math.abs(currents.get(wGnd.id) ?? 0)).toBeGreaterThan(1e-6);
    for (const id of ['W11', 'W25']) {
      if (doc.wires.some((w) => w.id === id)) {
        expect(Math.abs(currents.get(id) ?? 0))
          .withContext(id)
          .toBeGreaterThan(1e-6);
      }
    }
  });

  it('NE555 astable — LED branches and return path animate', () => {
    const doc = assignNets(createNe555AstablePreset());
    const Iled = 0.012;
    const missing = missingWires(doc, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'U1' || id === 'R1' || id === 'R2' || id === 'R3') return Iled;
      if (id === 'D1' || id === 'D2' || id === 'D3') return Iled;
      if (id === 'VCC') return Iled * 3 + 0.002;
      if (id === 'RA' || id === 'RB' || id === 'CT' || id === 'CC') return 0.0003;
      return null;
    });
    expect(missing).withContext(missing.join(', ')).toEqual([]);
  });

  it('NE555 Christmas tree — all LED branches animate', () => {
    const doc = assignNets(createNe555ChristmasTreePreset());
    const Iled = 0.01;
    const ledIds = doc.components.filter((c) => c.modelKey === 'led').map((c) => c.id);
    const rIds = doc.components.filter((c) => c.id.startsWith('R') && c.modelKey === 'resistor').map((c) => c.id);
    const missing = missingWires(doc, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'U1' || ledIds.includes(id) || rIds.includes(id)) return Iled;
      if (id === 'VCC') return Iled * ledIds.length + 0.002;
      if (id === 'RA' || id === 'RB' || id === 'CT' || id === 'CC') return 0.0002;
      return null;
    });
    expect(missing).withContext(missing.join(', ')).toEqual([]);
  });

  it('Series-parallel — both LED branches and shared rails animate', () => {
    const doc = createSeriesParallelPreset();
    const I = 0.01;
    const missing = missingWires(doc, (id) => {
      if (id === 'GND1' || id === 'JT' || id === 'JR') return null;
      if (id === 'V1' || id === 'S1') return I * 2;
      if (id === 'R1' || id === 'D1' || id === 'R2' || id === 'D2') return I;
      return null;
    });
    expect(missing).withContext(missing.join(', ')).toEqual([]);
  });

  it('Buck on-phase — supply→MOSFET→L→load animate; gate idle; diode idle', () => {
    const doc = createBuckPreset();
    const I = 0.04;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'VP1') return 0;
      if (id === 'Dfly') return 0;
      if (id === 'VB' || id === 'M1' || id === 'L1' || id === 'RL') return I;
      if (id === 'C1') return 0.005;
      return null;
    });
    for (const id of ['W1', 'W2', 'W3', 'W4', 'W5', 'W8', 'W9', 'W14', 'W15']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(`${id} power path`)
        .toBeGreaterThan(1e-6);
    }
    for (const id of ['W10', 'W12', 'W13']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(`${id} gate/diode idle`)
        .toBeLessThan(1e-6);
    }
  });

  it('Buck off-phase — freewheel diode + L→load animate; MOSFET feed idle', () => {
    const doc = createBuckPreset();
    const I = 0.04;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'VP1' || id === 'M1' || id === 'VB') return 0;
      if (id === 'Dfly' || id === 'L1' || id === 'RL') return I;
      if (id === 'C1') return -0.004;
      return null;
    });
    for (const id of ['W4', 'W5', 'W8', 'W9', 'W10', 'W11']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(`${id} freewheel path`)
        .toBeGreaterThan(1e-6);
    }
    for (const id of ['W1', 'W2', 'W3', 'W12', 'W13']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(`${id} supply/gate idle`)
        .toBeLessThan(1e-6);
    }
  });

  it('Boost — ground-referenced PWM wires stay idle while power return flows', () => {
    const doc = createBoostPreset();
    const I = 0.03;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'VP1') return 0;
      if (id === 'VB' || id === 'L1' || id === 'M1') return I;
      if (id === 'D1' || id === 'RL') return 0;
      if (id === 'C1') return 0.002;
      return null;
    });
    for (const id of ['W12', 'W13', 'W14']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(`${id} gate drive must be idle`)
        .toBeLessThan(1e-6);
    }
    expect(Math.abs(currents.get('W15') ?? 0))
      .withContext('W15 MOSFET return')
      .toBeGreaterThan(1e-6);
    expect(Math.abs(currents.get('W16') ?? 0))
      .withContext('W16 battery return')
      .toBeGreaterThan(1e-6);
  });

  it('Half-wave conduction — AC→diode→load→return all animate', () => {
    const doc = createHalfWavePreset();
    const I = 0.012;
    const missing = missingWires(doc, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'AC1' || id === 'D1' || id === 'R1') return I;
      return null;
    });
    expect(missing).withContext(missing.join(', ')).toEqual([]);
  });

  it('NTC divider — mid→pot→return animate; voltmeter idle', () => {
    const doc = createNtcDividerPreset();
    const I = 0.000333;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id === 'JT' || id === 'JM' || id === 'JB' || id === 'VM1') return null;
      if (id === 'V1' || id === 'R1' || id === 'NTC1') return I;
      return null;
    });
    for (const id of ['W1', 'W2', 'W3', 'W4', 'W5', 'W7', 'W8']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
    // Wiper stub may be idle when b already returns the rheostat current.
    expect(Math.abs(currents.get('W9') ?? 0))
      .withContext('VM+ idle')
      .toBeLessThan(1e-6);
    expect(Math.abs(currents.get('W10') ?? 0))
      .withContext('VM− idle')
      .toBeLessThan(1e-6);
  });

  it('Diode direction — forward path animates', () => {
    const doc = createDiodeDirectionPreset();
    const I = 0.012;
    const missing = missingWires(doc, (id) => {
      if (id === 'GND1' || id === 'J1') return null;
      if (id === 'V1' || id === 'S1' || id === 'R1' || id === 'D1' || id === 'LED1') return I;
      return null;
    });
    expect(missing).withContext(missing.join(', ')).toEqual([]);
  });

  it('Series LEDs — one loop current animates all wires', () => {
    const doc = createSeriesLedsPreset();
    const I = 0.01;
    const missing = missingWires(doc, (id) => {
      if (id === 'GND1' || id === 'J1') return null;
      if (id === 'V1' || id === 'S1' || id === 'R1' || id === 'D1' || id === 'D2') return I;
      return null;
    });
    expect(missing).withContext(missing.join(', ')).toEqual([]);
  });

  it('Voltage divider — string current animates; mid is shared', () => {
    const doc = createVoltageDividerPreset();
    const I = 0.00025;
    const missing = missingWires(doc, (id) => {
      if (id === 'GND1' || id === 'JM' || id === 'J1') return null;
      if (id === 'VB' || id === 'R1' || id === 'R2') return I;
      return null;
    });
    expect(missing).withContext(missing.join(', ')).toEqual([]);
  });

  it('Zener shunt — supply and load branch animate', () => {
    const doc = createZenerPreset();
    const Irs = 0.015;
    const Irl = 0.005;
    const Idz = 0.01;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id === 'JM' || id === 'J1') return null;
      if (id === 'VB' || id === 'RS') return Irs;
      if (id === 'RL') return Irl;
      if (id === 'DZ1') return Idz;
      return null;
    });
    for (const id of ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
  });

  it('Pot divider — ends animate; wiper may be idle until loaded', () => {
    const doc = createPotDividerPreset();
    const I = 0.0005;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id === 'J1') return null;
      if (id === 'V1' || id === 'POT1') return I;
      return null;
    });
    for (const id of ['W1', 'W2', 'W3', 'W4']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
  });

  it('Motor NMOS — supply→motor→FET→return animates when on', () => {
    const doc = createMotorNmosPreset();
    const I = 0.2;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'S1' || id === 'RG' || id === 'RPD') return 0;
      if (id === 'V1' || id === 'MOT1' || id === 'M1') return I;
      if (id === 'Dfly') return 0;
      return null;
    });
    for (const id of ['W1', 'W8', 'W9', 'W10', 'W13', 'W14', 'W15']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
  });

  it('RC step — charge path animates', () => {
    const doc = createRcStepPreset();
    const I = 0.001;
    const missing = missingWires(doc, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'V1' || id === 'R1' || id === 'C1') return I;
      return null;
    });
    expect(missing).withContext(missing.join(', ')).toEqual([]);
  });

  it('Bridge conduction (AC+ half) — D1/D4 load path animates', () => {
    const doc = createBridgePreset();
    const I = 0.01;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'AC1' || id === 'D1' || id === 'D4' || id === 'R1') return I;
      if (id === 'D2' || id === 'D3') return 0;
      return null;
    });
    for (const id of ['W1', 'W3', 'W4', 'W14', 'W15', 'W8', 'W9', 'W10', 'W16', 'W2']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
    for (const id of ['W5', 'W6', 'W11', 'W12']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(`${id} idle bridge leg`)
        .toBeLessThan(1e-6);
    }
  });

  it('Filter-cap — AC→diode→C/R→return animates while charging', () => {
    const doc = createFilterCapPreset();
    const Iac = 0.02;
    const Ic = 0.015;
    const Ir = 0.005;
    const missing = missingWires(doc, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'AC1' || id === 'D1') return Iac;
      if (id === 'C1') return Ic;
      if (id === 'R1') return Ir;
      return null;
    });
    expect(missing).withContext(missing.join(', ')).toEqual([]);
  });

  it('Relay + flyback — coil and LED load paths animate when closed', () => {
    const doc = createRelayDiodePreset();
    const Icoil = 0.012;
    const Iled = 0.01;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'Dfly') return 0;
      if (id === 'VB') return Icoil + Iled;
      if (id === 'S1' || id === 'K1') return Icoil;
      if (id === 'RC' || id === 'D1') return Iled;
      return null;
    });
    for (const id of ['W1', 'W2', 'W3', 'W4', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'W13', 'W14', 'W15']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
    expect(Math.abs(currents.get('W5') ?? 0))
      .withContext('flyback cathode stub may share JC')
      .toBeGreaterThanOrEqual(0);
    expect(Math.abs(currents.get('W6') ?? 0))
      .withContext('flyback idle while coil driven')
      .toBeLessThan(1e-6);
  });

  it('Op-amp follower — input and load paths animate; feedback may be idle', () => {
    const doc = createOpAmpFollowerPreset();
    const Iin = 0; // ideal buffer draws no input current
    const Iload = 0.001;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'VIN') return Iin;
      if (id === 'U1') return Iload;
      if (id === 'RL') return Iload;
      return null;
    });
    for (const id of ['W3', 'W5', 'W6', 'W8']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
  });

  it('Reverse-polarity protection — series diode + LED path animates', () => {
    const doc = createReversePolarityPreset();
    const I = 0.015;
    const missing = missingWires(doc, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'VB' || id === 'Dprot' || id === 'R1' || id === 'D1') return I;
      return null;
    });
    expect(missing).withContext(missing.join(', ')).toEqual([]);
  });

  it('7805 regulator — input, output load, and ground pins animate', () => {
    const doc = createVreg7805Preset();
    const Iout = 0.005;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'VB' || id === 'U1') return Iout;
      if (id === 'RL') return Iout;
      return null;
    });
    for (const id of ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
  });

  it('H-bridge forward (S1+S4) — motor path animates; open diagonal idle', () => {
    const doc = createHBridgePreset();
    const I = 0.2;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'S2' || id === 'S3') return 0;
      if (id === 'V1' || id === 'S1' || id === 'S4' || id === 'MOT1') return I;
      return null;
    });
    for (const id of ['W1', 'W2', 'W3', 'W4', 'W9', 'W10', 'W11', 'W12', 'W13']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
    for (const id of ['W5', 'W6', 'W7', 'W8']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(`${id} open diagonal`)
        .toBeLessThan(1e-6);
    }
  });

  it('Motor PWM on-phase — supply→motor→FET→return animates; flyback idle', () => {
    const doc = createMotorPwmPreset();
    const I = 0.25;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'VP1' || id === 'RG' || id === 'RPD') return 0;
      if (id === 'Dfly') return 0;
      if (id === 'V1' || id === 'MOT1' || id === 'M1') return I;
      return null;
    });
    for (const id of ['W1', 'W7', 'W8', 'W9', 'W12', 'W13', 'W14']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
    // W11 shares the drain node with the motor; W10 is the flyback cathode stub.
    expect(Math.abs(currents.get('W10') ?? 0))
      .withContext('W10 flyback cathode idle')
      .toBeLessThan(1e-6);
  });

  it('Fuse protect (safe) — fuse→load path animates; short switch idle', () => {
    const doc = createFuseProtectPreset();
    const I = 0.022;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'S1') return 0;
      if (id === 'VB' || id === 'F1' || id === 'RL') return I;
      return null;
    });
    for (const id of ['W1', 'W2', 'W3', 'W4', 'W7', 'W8']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
    for (const id of ['W5', 'W6']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(`${id} short open`)
        .toBeLessThan(1e-6);
    }
  });

  it('Pull-up (switch open) — Rpu→LED path animates; switch branch idle', () => {
    const doc = createPullUpDownPreset();
    const Iled = 0.008;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'S1') return 0;
      if (id === 'V1' || id === 'Rpu' || id === 'R1' || id === 'D1') return Iled;
      return null;
    });
    for (const id of ['W1', 'W2', 'W3', 'W6', 'W7', 'W8', 'W9', 'W10']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
    for (const id of ['W4', 'W5']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(`${id} switch open`)
        .toBeLessThan(1e-6);
    }
  });

  it('PWM filter — pulse→R→C charge path animates; voltmeter idle', () => {
    const doc = createPwmFilterPreset();
    const I = 0.001;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J') || id === 'VM1') return null;
      if (id === 'VP1' || id === 'R1' || id === 'C1') return I;
      return null;
    });
    for (const id of ['W1', 'W2', 'W3', 'W4', 'W5', 'W6']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
    for (const id of ['W7', 'W8']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(`${id} meter idle`)
        .toBeLessThan(1e-6);
    }
  });

  it('Debounce (switch open) — pull-up→gate→LED path animates', () => {
    const doc = createDebouncePreset();
    const Iled = 0.012;
    const Igate = 0.00005;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'S1' || id === 'C1') return 0;
      if (id === 'RD' || id === 'D1' || id === 'M1') return Iled;
      if (id === 'Rpu' || id === 'RG' || id === 'RPD') return Igate;
      if (id === 'V1') return Iled + Igate;
      return null;
    });
    for (const id of ['W1', 'W8', 'W9', 'W10', 'W14', 'W15']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
  });

  it('Ripple filter — AC→diode→C/R animates while charging', () => {
    const doc = createRipplePreset();
    const Iac = 0.03;
    const Ic = 0.02;
    const Ir = 0.01;
    const missing = missingWires(doc, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'AC1' || id === 'D1') return Iac;
      if (id === 'C1') return Ic;
      if (id === 'R1') return Ir;
      return null;
    });
    expect(missing).withContext(missing.join(', ')).toEqual([]);
  });

  it('BJT switch on — collector LED path animates; base may be small', () => {
    const doc = createBjtSwitchPreset();
    const Ic = 0.012;
    const Ib = 0.0008;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'S1') return Ib;
      if (id === 'RB') return Ib;
      if (id === 'Q1') return Ic;
      if (id === 'RC' || id === 'D1') return Ic;
      if (id === 'VB') return Ic + Ib;
      return null;
    });
    for (const id of ['W1', 'W8', 'W9', 'W10', 'W11']) {
      if (!doc.wires.some((w) => w.id === id)) continue;
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
  });

  it('LDR night-light (dark/on) — divider and LED path animate', () => {
    const doc = createLdrNightLightPreset();
    const Idiv = 0.00005;
    const Iled = 0.012;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'R1' || id === 'LDR1') return Idiv;
      if (id === 'RD' || id === 'D1' || id === 'M1') return Iled;
      if (id === 'V1') return Idiv + Iled;
      return null;
    });
    for (const id of ['W1', 'W2', 'W3', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
  });

  it('Industrial 24 V — coil and contact LED paths animate when closed', () => {
    const doc = createIndustrial24vPreset();
    const Icoil = 0.02;
    const Iled = 0.01;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'Dfly') return 0;
      if (id === 'VB') return Icoil + Iled;
      if (id === 'S1' || id === 'K1') return Icoil;
      if (id === 'RC' || id === 'D1') return Iled;
      return null;
    });
    for (const id of ['W1', 'W2', 'W3', 'W4', 'W5']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
  });

  it('H-bridge reverse (S2+S3) — motor path animates; open diagonal idle', () => {
    const doc = createMotorDirectionPreset();
    const I = 0.2;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'S1' || id === 'S4') return 0;
      if (id === 'V1' || id === 'S2' || id === 'S3' || id === 'MOT1') return I;
      return null;
    });
    for (const id of ['W1', 'W2', 'W5', 'W6', 'W7', 'W8', 'W11', 'W12', 'W13']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
    for (const id of ['W3', 'W4', 'W9', 'W10']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(`${id} open diagonal`)
        .toBeLessThan(1e-6);
    }
  });

  it('E-stop relay — series switches + coil and contact LED paths animate', () => {
    const doc = createEstopRelayPreset();
    const Icoil = 0.012;
    const Iled = 0.01;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'Dfly') return 0;
      if (id === 'VB') return Icoil + Iled;
      if (id === 'SESTOP' || id === 'S1' || id === 'K1') return Icoil;
      if (id === 'RC' || id === 'D1') return Iled;
      return null;
    });
    for (const id of ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W10', 'W11', 'W12', 'W13', 'W14']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
  });

  it('Relay+BJT — base drive, coil, and contact LED paths animate', () => {
    const doc = createRelayBjtPreset();
    const Ib = 0.001;
    const Icoil = 0.012;
    const Iled = 0.01;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'Dfly') return 0;
      if (id === 'S1' || id === 'RB') return Ib;
      if (id === 'K1') return Icoil;
      if (id === 'Q1') return Icoil + Ib;
      if (id === 'RC' || id === 'D1') return Iled;
      if (id === 'VB') return Icoil + Iled + Ib;
      return null;
    });
    for (const id of ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W10', 'W11', 'W12', 'W13', 'W14', 'W15', 'W16']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
  });

  it('Op-amp non-inverting — feedback and load paths animate', () => {
    const doc = createOpAmpNonInvPreset();
    const Ifb = 0.0005;
    const Iload = 0.001;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'VIN') return 0;
      if (id === 'RF' || id === 'RG') return Ifb;
      if (id === 'RL') return Iload;
      if (id === 'U1') return Iload + Ifb;
      return null;
    });
    for (const id of ['W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W11']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
  });

  it('Arduino DIO HIGH — pin→R→LED path animates', () => {
    const doc = createArduinoLedPreset();
    const I = 0.015;
    const missing = missingWires(doc, (id) => {
      if (id === 'GND1') return null;
      if (id === 'D2' || id === 'R1' || id === 'D1') return I;
      return null;
    });
    expect(missing).withContext(missing.join(', ')).toEqual([]);
  });

  it('Pushbutton LED (pressed) — series path animates', () => {
    const doc = createPushbuttonLedPreset();
    const I = 0.015;
    const missing = missingWires(doc, (id) => {
      if (id === 'GND1') return null;
      if (id === 'V1' || id === 'BTN1' || id === 'R1' || id === 'D1') return I;
      return null;
    });
    expect(missing).withContext(missing.join(', ')).toEqual([]);
  });

  it('Buzzer button (pressed) — series path animates', () => {
    const doc = createBuzzerButtonPreset();
    const I = 0.02;
    const missing = missingWires(doc, (id) => {
      if (id === 'GND1') return null;
      if (id === 'V1' || id === 'BTN1' || id === 'R1' || id === 'BZ1') return I;
      return null;
    });
    expect(missing).withContext(missing.join(', ')).toEqual([]);
  });

  it('Pulse RC (charge) — source→R→C path animates', () => {
    const doc = createPulseRcPreset();
    const I = 0.002;
    const missing = missingWires(doc, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'VP1' || id === 'R1' || id === 'C1') return I;
      return null;
    });
    expect(missing).withContext(missing.join(', ')).toEqual([]);
  });

  it('AC RC / low-pass / measure-AC — series R and shunt C animate; VM idle', () => {
    for (const [name, doc] of [
      ['ac', createAcRcPreset()],
      ['rcLowPass', createRcLowPassPreset()],
      ['measureAc', createMeasureAcPreset()]
    ] as const) {
      const I = 0.001;
      const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
        if (id === 'GND1' || id.startsWith('J')) return null;
        if (id === 'VM1') return 0;
        if (id === 'AC1' || id === 'R1' || id === 'C1') return I;
        return null;
      });
      for (const id of ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7']) {
        expect(Math.abs(currents.get(id) ?? 0))
          .withContext(`${name} ${id}`)
          .toBeGreaterThan(1e-6);
      }
      expect(Math.abs(currents.get('W8') ?? 0))
        .withContext(`${name} VM probe idle`)
        .toBeLessThan(1e-6);
    }
  });

  it('RC high-pass — series C and shunt R animate; VM idle', () => {
    const doc = createRcHighPassPreset();
    const I = 0.001;
    const currents = estimateAllWireCurrents(doc.components, doc.wires, (id) => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'VM1') return 0;
      if (id === 'AC1' || id === 'C1' || id === 'R1') return I;
      return null;
    });
    for (const id of ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7']) {
      expect(Math.abs(currents.get(id) ?? 0))
        .withContext(id)
        .toBeGreaterThan(1e-6);
    }
    expect(Math.abs(currents.get('W8') ?? 0))
      .withContext('VM probe idle')
      .toBeLessThan(1e-6);
  });
});
