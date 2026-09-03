import { EXAMPLE_PRESET_IDS } from '../services/lab-editor.store';
import { LAB_PRESET_GROUPS } from './preset-groups';

describe('LAB_PRESET_GROUPS', () => {
  it('covers every example preset exactly once', () => {
    const flat = LAB_PRESET_GROUPS.flatMap((g) => [...g.ids]);
    expect(new Set(flat).size).toBe(flat.length);
    expect(flat.sort().join(',')).toBe([...EXAMPLE_PRESET_IDS].sort().join(','));
  });
});
