/**
 * Longer quiz banks (module finals and special formative units). English copy
 * lives here and is derived into i18n keys (`${prefix}.quiz.qN.prompt|a|b|c|explain`)
 * plus the answer key used for offline grading. The seeder mirrors the answer key
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

/** One “what does this part do?” question per palette element from the circuit-elements lesson. */
const CIRCUIT_ELEMENTS: FinalQuizDef = {
  unitSlug: 'circuit-elements',
  prefix: 'learn.project.circuitElements',
  questions: [
    {
      prompt: 'What does a battery do in a circuit?',
      a: 'It provides a steady DC voltage between its terminals.',
      b: 'It swings back and forth like the mains.',
      c: 'It measures current in series.',
      correct: 'a',
      explain: 'A battery is a DC source. The long line on its symbol marks the positive terminal.'
    },
    {
      prompt: 'What does an AC source do?',
      a: 'It stores charge and blocks steady DC.',
      b: 'It swings voltage back and forth, like the mains.',
      c: 'It melts when the current gets too high.',
      correct: 'b',
      explain: 'An AC source alternates polarity. Use it when the lesson needs a changing supply.'
    },
    {
      prompt: 'What does a pulse source do?',
      a: 'It jumps between two voltage levels, like a microcontroller pin.',
      b: 'It only limits current, like a resistor.',
      c: 'It is the agreed 0 V reference node.',
      correct: 'a',
      explain: 'A pulse source is a digital-style supply: low and high levels over time.'
    },
    {
      prompt: 'What does a resistor do?',
      a: 'It limits current.',
      b: 'It emits light when current flows.',
      c: 'It opens the path only while you hold it.',
      correct: 'a',
      explain: 'Resistors shape how much current the source can push. They do not add energy.'
    },
    {
      prompt: 'What does a capacitor do?',
      a: 'It adds energy to the circuit like a battery.',
      b: 'It stores charge and blocks steady DC.',
      c: 'It is a deliberately weak link that melts.',
      correct: 'b',
      explain: 'In steady DC a capacitor looks open; it matters when voltages change.'
    },
    {
      prompt: 'What does an inductor do?',
      a: 'It stores energy in a magnetic field and resists changes in current.',
      b: 'It is a one-way valve for current.',
      c: 'It measures voltage across two points.',
      correct: 'a',
      explain: 'In steady DC an inductor behaves like a plain wire; its role shows when current changes.'
    },
    {
      prompt: 'What does a diode do?',
      a: 'It adjusts resistance with a sliding tap.',
      b: 'It connects every ground symbol into one node.',
      c: 'It acts as a one-way valve for current.',
      correct: 'c',
      explain: 'Current flows anode → cathode (the bar side). A silicon diode drops about 0.7 V when conducting.'
    },
    {
      prompt: 'What does an LED do?',
      a: 'It is a fuse that protects the supply.',
      b: 'It is a diode that emits light when current flows the right way.',
      c: 'It swings AC like the mains.',
      correct: 'b',
      explain: 'An LED needs a series resistor. Current flows in the arrow direction; typical drop is about 2 V.'
    },
    {
      prompt: 'What does an NPN transistor do?',
      a: 'It is a controllable valve: a small signal switches a larger current.',
      b: 'It only marks a schematic crossing with no join.',
      c: 'It provides a fixed AC frequency.',
      correct: 'a',
      explain: 'BJTs are electronic switches/amplifiers. A small base current controls collector–emitter current.'
    },
    {
      prompt: 'What does an N-MOSFET do?',
      a: 'It stores charge between plates.',
      b: 'It is only used as a junction dot.',
      c: 'It is a voltage-controlled electronic switch.',
      correct: 'c',
      explain: 'A small gate voltage controls a larger drain–source current — no moving parts.'
    },
    {
      prompt: 'What does a switch do?',
      a: 'It opens or closes the path so current can flow or stop.',
      b: 'It always measures amps in series.',
      c: 'It blocks DC and passes only AC.',
      correct: 'a',
      explain: 'In the Lab you toggle a switch by clicking it. Open means the loop is broken.'
    },
    {
      prompt: 'What does a pushbutton do?',
      a: 'It permanently shorts the supply to ground.',
      b: 'It opens or closes the path only while you hold it down.',
      c: 'It is a coil that drives a relay contact.',
      correct: 'b',
      explain: 'Unlike a latching switch, a pushbutton returns when released.'
    },
    {
      prompt: 'What does a potentiometer do?',
      a: 'It is a resistor with a sliding tap so resistance can be adjusted.',
      b: 'It is a one-way light emitter.',
      c: 'It marks 0 V on the schematic.',
      correct: 'a',
      explain: 'A pot is three terminals: the ends of a resistive track and a wiper you can move.'
    },
    {
      prompt: 'What does a fuse do?',
      a: 'It provides a steady DC voltage.',
      b: 'It measures the difference between two nodes.',
      c: 'It is a weak link that melts when current is too high.',
      correct: 'c',
      explain: 'A fuse protects the circuit by opening when overload would otherwise damage parts.'
    },
    {
      prompt: 'What does a junction (dot) mean on a schematic?',
      a: 'Wires meeting at a filled dot are electrically connected.',
      b: 'Any crossing of two lines is always connected.',
      c: 'It is the positive battery terminal.',
      correct: 'a',
      explain: 'Lines that cross without a dot are not connected. Only the filled junction joins nets.'
    },
    {
      prompt: 'What does ground do in a schematic?',
      a: 'It is where current disappears forever.',
      b: 'It marks the agreed 0 V reference; every ground symbol is the same node.',
      c: 'It always carries the largest current in the circuit.',
      correct: 'b',
      explain: 'All node voltages are measured against ground. Separate ground symbols are still one net.'
    },
    {
      prompt: 'What does a voltmeter do?',
      a: 'It measures voltage across two points (connected in parallel).',
      b: 'It must sit in series so all current passes through it.',
      c: 'It melts to protect against overcurrent.',
      correct: 'a',
      explain: 'A voltmeter sees the potential difference between two nodes without becoming the path.'
    },
    {
      prompt: 'What does an ammeter do?',
      a: 'It only connects across two points like a voltmeter.',
      b: 'It stores energy in a magnetic field.',
      c: 'It measures current and must sit in series with the path.',
      correct: 'c',
      explain: 'Current has to pass through the meter, so the ammeter is inserted into the loop.'
    }
  ]
};

export const LEARN_FINAL_QUIZZES: readonly FinalQuizDef[] = [BASICS_FINAL, CIRCUIT_ELEMENTS];

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
