import { assignNets } from '../schematic.model';
import { createNe555AstablePreset } from '../presets/ne555-astable.preset';
import { createNe555ChristmasTreePreset } from '../presets/ne555-christmas-tree.preset';
import { createNmosSwitchPreset } from '../presets/nmos-switch.preset';
import { createLedPreset } from '../presets/led-series.preset';
import { createLedFadePreset } from '../presets/led-fade.preset';
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
});
