import { gradeQuizLocally } from './learn-quiz-grading';

describe('gradeQuizLocally', () => {
  const unit = {
    i18nKeyPrefix: 'learn.project.led',
    quiz: {
      passCount: 3,
      questions: [
        { id: 31, order: 1, promptKey: 'p1', options: [] },
        { id: 32, order: 2, promptKey: 'p2', options: [] },
        { id: 33, order: 3, promptKey: 'p3', options: [] }
      ]
    }
  };

  it('passes when every answer matches the standard a/b/c key by order', () => {
    const r = gradeQuizLocally(unit, { 31: 'a', 32: 'b', 33: 'c' });
    expect(r.passed).toBeTrue();
    expect(r.correctCount).toBe(3);
    expect(r.results.map((x) => x.explanationKey)).toEqual([
      'learn.project.led.quiz.q1.explain',
      'learn.project.led.quiz.q2.explain',
      'learn.project.led.quiz.q3.explain'
    ]);
  });

  it('fails with per-question feedback when an answer is wrong or missing', () => {
    const r = gradeQuizLocally(unit, { 31: 'a', 32: 'a' });
    expect(r.passed).toBeFalse();
    expect(r.correctCount).toBe(1);
    expect(r.results.find((x) => x.questionId === 32)?.correct).toBeFalse();
    expect(r.results.find((x) => x.questionId === 32)?.correctOptionId).toBe('b');
    expect(r.results.find((x) => x.questionId === 33)?.correct).toBeFalse();
  });
});
