/**
 * Emit LearningApi seed JSON from client SPECS (source of truth).
 * Run via: node scripts/run-export-challenge-criteria.mjs
 */
import { LEARN_UNITS } from '../src/app/features/learn/data/learn-catalog';
import { getLearnChallengeSpec, specCriteriaForCheck } from '../src/app/features/learn/data/learn-challenge-spec';

const rows = LEARN_UNITS.map((u) => {
  const spec = getLearnChallengeSpec(u.exampleId);
  if (!spec) {
    throw new Error(`Missing challenge SPECS for exampleId ${u.exampleId} (${u.unitSlug})`);
  }
  const criteria = specCriteriaForCheck(u.exampleId, [], u.unitSlug).map((c, i) => ({
    order: i + 1,
    type: c.type,
    paramsJson: c.paramsJson,
    labelKey: `learn.challenge.check.${c.type}`
  }));
  return {
    moduleSlug: u.moduleSlug,
    unitSlug: u.unitSlug,
    exampleId: u.exampleId,
    analysisMode: spec.analysisMode,
    criteria
  };
});

process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
