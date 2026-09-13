import { PALETTE_ORDER } from './symbol-library';
import { modelKeyMatches } from '../../learn/data/lab-challenge-checker';

/**
 * Palette model keys needed for a Learn lab challenge, derived from checker criteria.
 * Includes palette aliases that satisfy the same sim model (e.g. bc547 ↔ bjt_npn).
 */
export function exercisePaletteKeysFromCriteria(
  criteria: ReadonlyArray<{ type: string; paramsJson: string }>
): string[] {
  const required = new Set<string>();
  for (const c of criteria) {
    try {
      const params = JSON.parse(c.paramsJson || '{}') as {
        models?: unknown;
        modelKey?: unknown;
      };
      if (c.type === 'has_models' && Array.isArray(params.models)) {
        for (const m of params.models) required.add(String(m));
      }
      if (typeof params.modelKey === 'string' && params.modelKey.length > 0) {
        required.add(params.modelKey);
      }
      if (c.type === 'any_switch_closed') required.add('switch');
      if (c.type === 'any_pushbutton_pressed') required.add('pushbutton');
    } catch {
      /* ignore malformed params */
    }
  }
  if (required.size === 0) return [];
  return PALETTE_ORDER.filter((key) => [...required].some((r) => modelKeyMatches(key, r)));
}
