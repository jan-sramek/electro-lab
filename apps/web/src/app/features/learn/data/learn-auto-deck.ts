import { LearnUnitDetailResponse } from '../api/learning-api.types';
import { findLearnUnit } from './learn-catalog';
import { learnStepKey } from './learn-catalog.model';
import { getLearnChallengeSpec } from './learn-challenge-spec';
import { LearnSlide, LearnSlideDeck } from './learn-slides.model';

/**
 * Units without a hand-authored deck still get the slide style: one slide per lesson
 * block, a picture of the parts the unit's circuit uses (from the challenge spec), and a
 * closing "in the Lab" slide built from the unit's step texts. No new copy is needed.
 */
export function autoDeckFor(unit: LearnUnitDetailResponse): LearnSlideDeck {
  const def = findLearnUnit(unit.moduleSlug, unit.unitSlug);
  const parts = partsFor(unit.exampleId);
  const blocks = [...unit.lessonBlocks].sort((a, b) => a.order - b.order);
  const slides: LearnSlide[] = blocks.map((b, i) => ({
    id: `block${b.id}`,
    titleKey: b.titleKey || `${unit.i18nKeyPrefix}.title`,
    bodyKeys: [b.bodyKey],
    figure:
      i === 0 && parts.length
        ? {
            kind: 'elements-grid',
            params: { parts, labelKeys: parts.map((p) => `lab.symbol.${p}`) },
            captionKey: `${unit.i18nKeyPrefix}.summary`
          }
        : undefined
  }));
  if (def && def.stepCount > 0) {
    slides.push({
      id: 'steps',
      titleKey: 'learn.slides.inTheLab',
      bodyKeys: ['learn.slides.inTheLabIntro'],
      factKeys: Array.from({ length: def.stepCount }, (_, i) => learnStepKey(def, i + 1))
    });
  }
  return slides;
}

/** Parts named by the unit's challenge spec (has_models), in spec order. */
function partsFor(exampleId: string): string[] {
  const spec = getLearnChallengeSpec(exampleId);
  if (!spec) return [];
  for (const c of spec.criteria) {
    if (c.type !== 'has_models') continue;
    try {
      const models = (JSON.parse(c.paramsJson) as { models?: unknown }).models;
      if (Array.isArray(models)) return models.map(String).slice(0, 5);
    } catch {
      return [];
    }
  }
  return [];
}
