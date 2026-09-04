import { assignNets } from '../schematic.model';
import { createNe555AstablePreset } from '../presets/ne555-astable.preset';
import { createNe555ChristmasTreePreset } from '../presets/ne555-christmas-tree.preset';
import { createNmosSwitchPreset } from '../presets/nmos-switch.preset';
import { createLedPreset } from '../presets/led-series.preset';
import { createLedFadePreset } from '../presets/led-fade.preset';
import { createBuckPreset } from '../presets/buck.preset';
import { createBoostPreset } from '../presets/boost.preset';
import { createHalfWavePreset } from '../presets/half-wave.preset';
import { createNtcDividerPreset } from '../presets/ntc-divider.preset';
import { createSeriesParallelPreset } from '../presets/series-parallel.preset';
import { createDiodeDirectionPreset } from '../presets/diode-direction.preset';
import { createSeriesLedsPreset } from '../presets/series-leds.preset';
import { createVoltageDividerPreset } from '../presets/voltage-divider.preset';
import { createZenerPreset } from '../presets/zener.preset';
import { createPotDividerPreset } from '../presets/pot-divider.preset';
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
});
