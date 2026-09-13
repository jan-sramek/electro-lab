/**
 * Group finals: a longer quiz at the end of a module. English copy lives here and
 * is derived into i18n keys (`${prefix}.quiz.qN.prompt|a|b|c|explain`) plus the
 * answer key used for offline grading. The seeder mirrors the answer key
 * (services/learning-api/Seed/LearnCatalogSeeder.cs, LongQuiz).
 */
export interface FinalQuizQuestion {
  prompt: string;
  a: string;
  b: string;
  c: string;
  correct: 'a' | 'b' | 'c';
  explain: string;
}

export interface FinalQuizDef {
  unitSlug: string;
  prefix: string;
  questions: readonly FinalQuizQuestion[];
}

const BASICS_FINAL: FinalQuizDef = {
  unitSlug: 'basics-final-quiz',
  prefix: 'learn.project.basicsFinal',
  questions: [
    {
      prompt: 'A 9 V battery is on the shelf with nothing connected. What is true?',
      a: 'There is current but no voltage.',
      b: 'There is voltage but no current.',
      c: 'There is neither.',
      correct: 'b',
      explain: 'Voltage is a potential difference between the terminals. Current needs a closed path.'
    },
    {
      prompt: 'What does an ammeter measure, and how is it connected?',
      a: 'Voltage, in parallel.',
      b: 'Resistance, across the part.',
      c: 'Current, in series with the path.',
      correct: 'c',
      explain: 'Current has to pass through the meter, so it sits in the path.'
    },
    {
      prompt: '5 V supply, an LED that takes 2 V, and a 220 Ω resistor. Roughly what current flows?',
      a: 'About 14 mA',
      b: 'About 23 mA',
      c: 'About 2 mA',
      correct: 'a',
      explain: 'The resistor sees 3 V. 3 V / 220 Ω ≈ 13.6 mA.'
    },
    {
      prompt: 'You double the resistance and keep the voltage. The current…',
      a: 'doubles.',
      b: 'halves.',
      c: 'stays the same.',
      correct: 'b',
      explain: 'I = U / R. Twice the R, half the I.'
    },
    {
      prompt: 'Two 470 Ω resistors in series act like…',
      a: '235 Ω',
      b: '470 Ω',
      c: '940 Ω',
      correct: 'c',
      explain: 'Series resistances add.'
    },
    {
      prompt: 'Two LEDs sit in parallel on a 5 V rail. One burns out. The other…',
      a: 'keeps shining as before.',
      b: 'goes dark too.',
      c: 'gets brighter.',
      correct: 'a',
      explain: 'Each parallel branch is its own loop with the same 5 V across it.'
    },
    {
      prompt: 'Which statement about ground is right?',
      a: 'Ground is where current disappears.',
      b: 'Ground is the agreed 0 V reference point.',
      c: 'Ground always carries the most current.',
      correct: 'b',
      explain: 'All node voltages are measured against ground. It is a reference, nothing more.'
    },
    {
      prompt: 'Mains in Europe is "230 V, 50 Hz". The 230 V is…',
      a: 'an RMS value.',
      b: 'the peak value.',
      c: 'the peak-to-peak value.',
      correct: 'a',
      explain: 'RMS is the heating-equivalent DC value. The peak is about 325 V.'
    },
    {
      prompt: 'On a schematic, two lines cross without a dot. They are…',
      a: 'connected.',
      b: 'connected if both are wires.',
      c: 'not connected.',
      correct: 'c',
      explain: 'Only a junction dot means a connection.'
    },
    {
      prompt: 'An LED in the Lab is running at 40 mA. What happens?',
      a: 'It dims slightly.',
      b: 'It overheats and burns out.',
      c: 'Nothing, LEDs have no limit.',
      correct: 'b',
      explain: 'Lab LEDs are healthy up to about 20 mA and burn above roughly 35 mA.'
    }
  ]
};

export const LEARN_FINAL_QUIZZES: readonly FinalQuizDef[] = [BASICS_FINAL];

/** Answer key by unit slug (correct option id per question order). */
export const LEARN_QUIZ_KEYS: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  LEARN_FINAL_QUIZZES.map((q) => [q.unitSlug, q.questions.map((x) => x.correct)])
);

/** English copy for every final-quiz key. */
export const LEARN_FINAL_QUIZ_I18N: Readonly<Record<string, string>> = Object.fromEntries(
  LEARN_FINAL_QUIZZES.flatMap((q) =>
    q.questions.flatMap((x, i) => {
      const p = `${q.prefix}.quiz.q${i + 1}`;
      return [
        [`${p}.prompt`, x.prompt],
        [`${p}.a`, x.a],
        [`${p}.b`, x.b],
        [`${p}.c`, x.c],
        [`${p}.explain`, x.explain]
      ];
    })
  )
);

export function finalQuizQuestionCount(unitSlug: string): number | null {
  const q = LEARN_FINAL_QUIZZES.find((x) => x.unitSlug === unitSlug);
  return q ? q.questions.length : null;
}
