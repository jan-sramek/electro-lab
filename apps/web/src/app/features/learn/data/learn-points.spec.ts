import { LearnUnitProgressDto, isUnitComplete, resolveUnitPhase } from '../api/learning-api.types';
import { LEARN_UNITS, findLearnUnit } from './learn-catalog';
import { unitHasLab } from './learn-catalog.model';
import { LEARN_POINTS, totalPoints, unitPointsEarned, unitPointsMax } from './learn-points';

const row = (p: Partial<LearnUnitProgressDto>): LearnUnitProgressDto => ({
  moduleSlug: 'basics',
  unitSlug: 'voltage-intro',
  readComplete: false,
  quizPassed: false,
  labPassed: false,
  complete: false,
  ...p
});

describe('optional lab + points', () => {
  it('lesson + quiz complete a unit; the lab is a bonus', () => {
    expect(isUnitComplete(row({ readComplete: true, quizPassed: true }))).toBeTrue();
    expect(isUnitComplete(row({ readComplete: true }))).toBeFalse();
    expect(isUnitComplete(row({ complete: true }))).toBeTrue();
  });

  it('phase machine offers the lab as an optional phase and skips it for theory-only units', () => {
    const quizDone = row({ readComplete: true, quizPassed: true, complete: true });
    expect(resolveUnitPhase(quizDone, 'complete', true)).toBe('lab');
    expect(resolveUnitPhase(quizDone, 'complete', false)).toBe('complete');
    expect(resolveUnitPhase(row({ ...quizDone, labPassed: true }), 'complete', true)).toBe('complete');
    expect(resolveUnitPhase(row({ readComplete: true }), 'available', true)).toBe('quiz');
    expect(resolveUnitPhase(row({}), 'locked', true)).toBe('read');
  });

  it('the lab bonus outweighs lesson and quiz together', () => {
    expect(LEARN_POINTS.lab).toBeGreaterThan(LEARN_POINTS.read + LEARN_POINTS.quiz);
    expect(unitPointsMax(true)).toBe(100);
    expect(unitPointsMax(false)).toBe(40);
    expect(unitPointsEarned(row({ readComplete: true, quizPassed: true }), true)).toBe(40);
    expect(unitPointsEarned(row({ readComplete: true, quizPassed: true, labPassed: true }), true)).toBe(100);
    // A theory-only unit never awards lab points, even if a stray flag is set.
    expect(unitPointsEarned(row({ readComplete: true, quizPassed: true, labPassed: true }), false)).toBe(40);
  });

  it('concept openers are theory-only; build-and-check units keep their lab', () => {
    for (const slug of ['voltage-intro', 'current-intro', 'resistance-intro', 'circuit-elements', 'ac-dc']) {
      expect(unitHasLab(findLearnUnit('basics', slug))).withContext(slug).toBeFalse();
    }
    for (const slug of ['ohms-law', 'series-parallel-circuits', 'fundamentals-loop', 'led-fade']) {
      expect(unitHasLab(findLearnUnit('basics', slug))).withContext(slug).toBeTrue();
    }
  });

  it('totals sum over the catalog', () => {
    const empty = totalPoints({});
    expect(empty.earned).toBe(0);
    const required = LEARN_UNITS.filter((u) => !u.optional);
    const labUnits = required.filter((u) => unitHasLab(u)).length;
    const finals = required.filter((u) => u.finalQuiz).length;
    expect(empty.max).toBe(labUnits * 100 + (required.length - labUnits - finals) * 40 + finals * 70);
    const some = totalPoints({
      'basics/ohms-law': row({ unitSlug: 'ohms-law', readComplete: true, quizPassed: true, labPassed: true }),
      'basics/voltage-intro': row({ readComplete: true, quizPassed: true })
    });
    expect(some.earned).toBe(140);
  });

  it('the group final quiz is worth more than a unit quiz and has no lab', () => {
    expect(unitPointsMax(false, true)).toBe(70);
    expect(unitPointsEarned(row({ readComplete: true, quizPassed: true }), false, true)).toBe(70);
    expect(unitHasLab(findLearnUnit('basics', 'basics-final-quiz'))).toBeFalse();
    expect(findLearnUnit('basics', 'basics-final-quiz')?.finalQuiz).toBeTrue();
  });
});
