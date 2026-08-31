import { createNe555AstablePreset } from '../presets/ne555-astable.preset';
import { assignNets } from '../schematic.model';
import { WireFlowBuilder } from './wire-flow.builder';

describe('WireFlowBuilder NE555', () => {
  it('animates LED branches when OUT sources current (RB=10 Ω latched-high case)', () => {
    const doc = assignNets(createNe555AstablePreset());
    const rb = doc.components.find((c) => c.id === 'RB')!;
    rb.params = { ...rb.params, r: 10 };

    const Iled = 0.012;
    const currentOf = (id: string): number | null => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'U1' || id === 'R1' || id === 'R2' || id === 'R3') return Iled;
      if (id === 'D1' || id === 'D2' || id === 'D3') return Iled;
      if (id === 'VCC') return Iled * 3 + 0.001;
      if (id === 'RA' || id === 'RB' || id === 'CT') return 0.0002;
      return null;
    };

    const paths = WireFlowBuilder.build(doc, true, currentOf);
    const byId = new Map(paths.map((p) => [p.id, p]));

    for (const id of ['W16', 'W17', 'W18', 'W19', 'W20', 'W21']) {
      expect(byId.get(id)?.flow)
        .withContext(`LED path ${id}`)
        .not.toBeNull();
    }
    expect(byId.get('W1')?.flow).withContext('supply W1').not.toBeNull();
  });

  it('still animates timing resistors when branch current is small (mA)', () => {
    const doc = assignNets(createNe555AstablePreset());
    const currentOf = (id: string): number | null => {
      if (id === 'GND1' || id.startsWith('J')) return null;
      if (id === 'RA') return 0.0003;
      if (id === 'RB') return 0.0005;
      if (id === 'CT') return 0.0004;
      return null;
    };
    const paths = WireFlowBuilder.build(doc, true, currentOf);
    const byId = new Map(paths.map((p) => [p.id, p]));
    expect(byId.get('W5')?.flow).withContext('RA→DIS').not.toBeNull();
    expect(byId.get('W6')?.flow).withContext('DIS→RB').not.toBeNull();
    expect(byId.get('W7')?.flow).withContext('RB→JT').not.toBeNull();
  });
});
