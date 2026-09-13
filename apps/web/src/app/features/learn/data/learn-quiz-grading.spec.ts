import { gradeQuizLocally, quizPassCountFor } from './learn-quiz-grading';
import { LEARN_QUIZ_KEYS } from './learn-final-quizzes';

describe('gradeQuizLocally', () => {
  const unit = {
    i18nKeyPrefix: 'learn.project.led',
    quiz: {
      passCount: 4,
      questions: [
        { id: 31, order: 1, promptKey: 'p1', options: [] },
        { id: 32, order: 2, promptKey: 'p2', options: [] },
        { id: 33, order: 3, promptKey: 'p3', options: [] },
        { id: 34, order: 4, promptKey: 'p4', options: [] },
        { id: 35, order: 5, promptKey: 'p5', options: [] }
      ]
    }
  };

  it('passes when answers match the standard a/b/c/a/b key by order', () => {
    const r = gradeQuizLocally(unit, { 31: 'a', 32: 'b', 33: 'c', 34: 'a', 35: 'b' });
    expect(r.passed).toBeTrue();
    expect(r.correctCount).toBe(5);
    expect(r.results.map((x) => x.explanationKey)).toEqual([
      'learn.project.led.quiz.q1.explain',
      'learn.project.led.quiz.q2.explain',
      'learn.project.led.quiz.q3.explain',
      'learn.project.led.quiz.q4.explain',
      'learn.project.led.quiz.q5.explain'
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

  it('passes a 5-question quiz at 80 % (4 of 5)', () => {
    expect(quizPassCountFor(5)).toBe(4);
    const r = gradeQuizLocally(unit, { 31: 'a', 32: 'b', 33: 'c', 34: 'a', 35: 'z' });
    expect(r.passed).toBeTrue();
    expect(r.correctCount).toBe(4);
  });

  it('long quizzes pass at 80 % with their own answer key', () => {
    expect(quizPassCountFor(3)).toBe(3);
    expect(quizPassCountFor(10)).toBe(8);
    const key = LEARN_QUIZ_KEYS['basics-final-quiz'];
    expect(key.length).toBe(10);
    const final = {
      unitSlug: 'basics-final-quiz',
      i18nKeyPrefix: 'learn.project.basicsFinal',
      quiz: { passCount: 8, questions: key.map((_, i) => ({ id: 100 + i, order: i + 1, promptKey: 'p', options: [] })) }
    };
    const answers: Record<number, string> = {};
    key.forEach((c, i) => (answers[100 + i] = c));
    expect(gradeQuizLocally(final, answers).passed).toBeTrue();
    // Two wrong still passes, three wrong fails.
    answers[100] = 'z'; answers[101] = 'z';
    expect(gradeQuizLocally(final, answers).passed).toBeTrue();
    answers[102] = 'z';
    const r = gradeQuizLocally(final, answers);
    expect(r.passed).toBeFalse();
    expect(r.correctCount).toBe(7);
  });
});
