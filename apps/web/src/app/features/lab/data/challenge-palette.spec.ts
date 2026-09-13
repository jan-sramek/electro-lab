import { exercisePaletteKeysFromCriteria } from './challenge-palette';

describe('exercisePaletteKeysFromCriteria', () => {
  it('collects has_models and related modelKey criteria into palette keys', () => {
    const keys = exercisePaletteKeysFromCriteria([
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'led', 'resistor', 'ground'] })
      },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
    ]);
    expect(keys).toEqual(['battery', 'resistor', 'led', 'ground']);
  });

  it('includes teaching aliases that satisfy a sim model key', () => {
    const keys = exercisePaletteKeysFromCriteria([
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'bjt_npn', 'led', 'resistor', 'ground'] })
      }
    ]);
    expect(keys).toContain('bjt_npn');
    expect(keys).toContain('bc547');
    expect(keys).toContain('battery');
  });

  it('returns an empty list when criteria name no parts', () => {
    expect(exercisePaletteKeysFromCriteria([{ type: 'sim_ok', paramsJson: '{}' }])).toEqual([]);
  });
});
