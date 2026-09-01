import { createLedFadePreset } from './presets/led-fade.preset';
import {
  capacitorStorageKey,
  energyTopologyFingerprint
} from './circuit-topology';
import { assignNets } from './schematic.model';

describe('energyTopologyFingerprint', () => {
  it('is stable when only component IDs change', () => {
    const doc = createLedFadePreset();
    const fpA = energyTopologyFingerprint(doc);
    const renamed = {
      ...doc,
      components: doc.components.map((c) => ({
        ...c,
        id: c.id === 'C1' ? 'C9' : c.id === 'D1' ? 'D9' : c.id
      })),
      wires: doc.wires.map((w) => ({
        ...w,
        a: {
          ...w.a,
          componentId:
            w.a.componentId === 'C1'
              ? 'C9'
              : w.a.componentId === 'D1'
                ? 'D9'
                : w.a.componentId
        },
        b: {
          ...w.b,
          componentId:
            w.b.componentId === 'C1'
              ? 'C9'
              : w.b.componentId === 'D1'
                ? 'D9'
                : w.b.componentId
        }
      }))
    };
    const fpB = energyTopologyFingerprint(assignNets(renamed));
    expect(fpB).toBe(fpA);
  });

  it('changes when a wire is removed', () => {
    const doc = createLedFadePreset();
    const fpA = energyTopologyFingerprint(doc);
    const rewired = { ...doc, wires: doc.wires.slice(0, -1) };
    expect(energyTopologyFingerprint(rewired)).not.toBe(fpA);
  });

  it('capacitor storage key uses sorted nets', () => {
    const doc = createLedFadePreset();
    const cap = assignNets(doc).components.find((c) => c.modelKey === 'capacitor')!;
    const key = capacitorStorageKey(cap);
    expect(key).toMatch(/^C:/);
    expect(key).toContain('|');
  });
});
