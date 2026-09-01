/** Assessment copy for Learn units (lessons, quizzes, lab challenge labels). */
export const LEARN_ASSESSMENT_I18N: Record<string, string> = {
  'learn.unit.locked': 'Finish the previous project first to unlock this one.',
  'learn.unit.phase.read': 'Read',
  'learn.unit.phase.quiz': 'Quiz',
  'learn.unit.phase.lab': 'Lab',
  'learn.unit.phase.done': 'Done',
  'learn.unit.readHeading': 'Before you build',
  'learn.unit.readConfirm': 'I have read and understand this section.',
  'learn.unit.continueToQuiz': 'Continue to quiz',
  'learn.unit.quizHeading': 'Quick check',
  'learn.unit.quizHint': 'Formative quiz — retry until all answers are correct. We show why after each try.',
  'learn.unit.submitQuiz': 'Check answers',
  'learn.unit.retryQuiz': 'Try again',
  'learn.unit.continueToLab': 'Continue to lab challenge',
  'learn.unit.labHeading': 'Lab challenge',
  'learn.unit.labHint':
    'Build the circuit from scratch in Lab — start with an empty canvas. Place parts, wire them up, run a simulation, then check your work.',
  'learn.unit.labReturnHint': 'After the challenge passes in Lab, return here to continue the path.',
  'learn.unit.completeHeading': 'Unit complete',
  'learn.unit.completeBody': 'Nice work — you read the lesson, passed the quiz, and cleared the lab challenge.',
  'learn.unit.continueNext': 'Next project →',
  'learn.hub.status.locked': 'Locked',
  'learn.hub.status.available': 'Start',
  'learn.hub.status.in_progress': 'In progress',
  'learn.hub.status.complete': 'Complete',
  'lab.challenge.heading': 'Learn challenge',
  'lab.challenge.check': 'Check my work',
  'lab.challenge.passed': 'Challenge passed — return to Learn to continue.',
  'lab.challenge.failed': 'Not yet — adjust the circuit or run again, then check once more.',
  'lab.challenge.backToUnit': 'Back to unit',

  'learn.challenge.tab.default': 'Challenge',
  'learn.challenge.tab.led': 'LED series',
  'learn.challenge.tab.rc': 'RC charge',
  'learn.challenge.tab.ledFade': 'LED fade',
  'learn.challenge.tab.bjt': 'BJT switch',
  'learn.challenge.tab.relay': 'Relay + diode',
  'learn.challenge.tab.nmos': 'NMOS switch',
  'learn.challenge.tab.motor': 'Motor driver',
  'learn.challenge.tab.ne555': 'NE555 timer',
  'learn.challenge.tab.pushbutton': 'Pushbutton LED',
  'learn.challenge.tab.ldr': 'LDR night-light',
  'learn.challenge.tab.buzzer': 'Buzzer',
  'learn.challenge.tab.arduino': 'Arduino LED',
  'learn.challenge.tab.i2cOled': 'I2C OLED',
  'learn.challenge.tab.pot': 'Pot divider',
  'learn.challenge.tab.pulse': 'Pulse RC',
  'learn.challenge.tab.opamp': 'Op-amp',
  'learn.challenge.tab.ac': 'AC analysis',

  'learn.challenge.check.sim_ok': 'Simulation completes without errors.',
  'learn.challenge.check.no_circuit_errors': 'Wiring passes circuit checks.',
  'learn.challenge.check.analysis_mode': 'Correct analysis mode is selected.',
  'learn.challenge.check.has_models': 'All required parts are on the canvas.',
  'learn.challenge.check.any_model_current_min': 'Load current meets the minimum goal.',
  'learn.challenge.check.any_model_current_max': 'Load current is below the maximum.',
  'learn.challenge.check.any_cap_voltage_final_min': 'Capacitor voltage reaches the target by the end of transient.',
  'learn.challenge.check.any_switch_closed': 'At least one switch is closed (on).',
  'learn.challenge.check.any_pushbutton_pressed': 'Pushbutton is pressed (hold to test).',
  'learn.challenge.check.min_wire_count': 'Enough wires connect the circuit.',
  'learn.challenge.check.branch_current_min': 'Branch current meets the minimum.',
  'learn.challenge.check.branch_current_max': 'Branch current stays below the maximum.',
  'learn.challenge.check.switch_state': 'Switch is in the required state.',

  ...ledAssessment(),
  ...rcAssessment(),
  ...ledFadeAssessment(),
  ...bc547Assessment(),
  ...relayAssessment(),
  ...nmosAssessment(),
  ...motorAssessment(),
  ...ne555Assessment(),
  ...pushbuttonAssessment(),
  ...ldrAssessment(),
  ...buzzerAssessment(),
  ...arduinoAssessment(),
  ...i2cOledAssessment()
};

function lessonKeys(prefix: string, l1Title: string, l1Body: string, l2Title: string, l2Body: string) {
  return {
    [`${prefix}.lesson1.title`]: l1Title,
    [`${prefix}.lesson1.body`]: l1Body,
    [`${prefix}.lesson2.title`]: l2Title,
    [`${prefix}.lesson2.body`]: l2Body
  };
}

function quizKeys(
  prefix: string,
  q1: [string, string, string, string, string],
  q2: [string, string, string, string, string],
  q3: [string, string, string, string, string]
) {
  const pack = (n: 1 | 2 | 3, row: [string, string, string, string, string]) => ({
    [`${prefix}.quiz.q${n}.prompt`]: row[0],
    [`${prefix}.quiz.q${n}.a`]: row[1],
    [`${prefix}.quiz.q${n}.b`]: row[2],
    [`${prefix}.quiz.q${n}.c`]: row[3],
    [`${prefix}.quiz.q${n}.explain`]: row[4]
  });
  return { ...pack(1, q1), ...pack(2, q2), ...pack(3, q3) };
}

function challengeKeys(prefix: string, c1: string, c2: string) {
  return {
    [`${prefix}.challenge.c1.label`]: c1,
    [`${prefix}.challenge.c2.label`]: c2
  };
}

function ledAssessment() {
  const p = 'learn.project.led';
  return {
    ...lessonKeys(
      p,
      'Why a resistor?',
      'An LED needs a current-limiting resistor in series. Without it, too much current flows and the teaching model may show burnout.',
      'Brightness vs current',
      'Lower series resistance → more current → brighter LED (until overload). This is Ohm’s law in a one-loop circuit.'
    ),
    ...quizKeys(
      p,
      [
        'What does the series resistor mainly do?',
        'Limits LED current',
        'Stores charge',
        'Boosts voltage',
        'It drops voltage so only a safe current reaches the LED.'
      ],
      [
        'You decrease R1. What usually happens to LED current?',
        'It falls',
        'It rises',
        'It stays exactly the same',
        'Less resistance in series allows more current for the same supply.'
      ],
      [
        'Before running in Lab, you should…',
        'Skip ground',
        'Ignore polarity',
        'Confirm supply and return path',
        'Every loop needs a clear return to ground in the teaching model.'
      ]
    ),
    ...challengeKeys(p, 'Run DC with no simulation errors.', 'LED D1 conducts (current above ~1 mA).')
  };
}

function rcAssessment() {
  const p = 'learn.project.rc';
  return {
    ...lessonKeys(
      p,
      'Capacitors charge gradually',
      'A capacitor cannot jump instantly to the supply voltage. Current through R charges C — the voltage curve is exponential.',
      'Time constant τ',
      'τ ≈ R × C sets how fast the curve rises. Double C or R → roughly double the charge time.'
    ),
    ...quizKeys(
      p,
      ['Larger capacitance usually means…', 'Slower charging', 'Faster charging', 'No change', 'More charge to move → longer rise time for the same R.'],
      ['Which analysis shows the charge curve?', 'DC only', 'Transient', 'AC small-signal', 'Use Transient to watch voltage vs time.'],
      ['τ doubles when…', 'R and C both halve', 'R doubles (C fixed)', 'Supply doubles', 'τ = R×C — scale R or C to stretch time.']
    ),
    ...challengeKeys(p, 'Simulation completes without errors.', 'Use Transient analysis for this unit.')
  };
}

function ledFadeAssessment() {
  const p = 'learn.project.ledFade';
  return {
    ...lessonKeys(
      p,
      'Store and release',
      'The capacitor was charged earlier; now it discharges through a resistor while the LED dims.',
      'Same RC idea',
      'Fade time is still governed by R×C — only the load (LED) changes how you observe it.'
    ),
    ...quizKeys(
      p,
      ['You see the LED dim over seconds because…', 'C discharges through R', 'Battery runs out instantly', 'LED polarity flips', 'Stored charge leaks through the discharge path.'],
      ['To fade slower, you would usually…', 'Shrink C a lot', 'Increase C or discharge R', 'Remove ground', 'Larger τ → slower voltage fall.'],
      ['Best analysis mode here is…', 'DC', 'Transient', 'AC', 'Watch voltage/current vs time.']
    ),
    ...challengeKeys(p, 'Run completes cleanly.', 'Use Transient analysis.')
  };
}

function bc547Assessment() {
  const p = 'learn.project.bc547';
  return {
    ...lessonKeys(
      p,
      'Transistor as switch',
      'A small base current can allow a larger collector current — the BJT routes LED current when driven on.',
      'Open vs driven',
      'Open base (switch off) → LED off. Driven base with series RB → LED on if the transistor is in saturation.'
    ),
    ...quizKeys(
      p,
      ['With S1 open, the LED should be…', 'On brightly', 'Off', 'Random', 'No base drive → transistor off → LED dark.'],
      ['RB is for…', 'Limiting base current', 'Boosting supply voltage', 'Timing the LED', 'Protects the teaching BJT from excessive base current.'],
      ['Too little RB can…', 'Burn the transistor open', 'Charge the capacitor faster only', 'Nothing in this model', 'Excessive base current is a teaching failure mode.']
    ),
    ...challengeKeys(p, 'DC simulation succeeds.', 'Switch S1 closed (LED on path).')
  };
}

function relayAssessment() {
  const p = 'learn.project.relay';
  return {
    ...lessonKeys(
      p,
      'Coil + contacts',
      'Energizing the coil pulls contacts closed to switch a separate load (here, an LED).',
      'Flyback diode',
      'The diode gives coil current a safe path when the switch opens — inductive kick otherwise spikes voltage.'
    ),
    ...quizKeys(
      p,
      ['Flyback diode orientation…', 'Conducts when coil field collapses', 'Blocks all DC forever', 'Replaces the coil', 'It must conduct reverse energy away from the switch node.'],
      ['With S1 open, the contact LED should be…', 'On', 'Off', 'Always blinking', 'No coil current → contacts open.'],
      ['Relay coil is driven from…', 'The same switch path as in the preset', 'Only AC analysis', 'Scope probe', 'Follow the preset wiring in Lab.']
    ),
    ...challengeKeys(p, 'DC run is clean.', 'Switch S1 closed so the coil energizes.')
  };
}

function nmosAssessment() {
  const p = 'learn.project.nmos';
  return {
    ...lessonKeys(
      p,
      'Gate controls channel',
      'NMOS turns on when gate voltage is high enough vs source — here a switch + pull-down set the gate.',
      'Pull-down',
      'When the switch opens, RPD holds the gate low so the LED turns off reliably.'
    ),
    ...quizKeys(
      p,
      ['With S1 open, gate is pulled…', 'Low by RPD', 'High automatically', 'Floating forever', 'Pull-down defines the off state.'],
      ['LED current flows when…', 'MOSFET is on', 'Gate is below threshold only', 'Ground is removed', 'Channel must conduct drain current.'],
      ['Excess drain current can…', 'Burn M1 open in the teaching model', 'Charge the capacitor only', 'Do nothing', 'Respect series resistance and supply limits.']
    ),
    ...challengeKeys(p, 'Simulation OK.', 'S1 closed for the on state.')
  };
}

function motorAssessment() {
  const p = 'learn.project.motor';
  return {
    ...lessonKeys(
      p,
      'Low-side switch',
      'NMOS on the ground return side switches the motor load — common in teaching layouts.',
      'Motor as load',
      'Motor current is much larger than logic — the FET must handle the return path.'
    ),
    ...quizKeys(
      p,
      ['Low-side switch means the transistor is…', 'In the return path to ground', 'In parallel with the battery only', 'Inside the motor', 'Return-side switching is a common pattern.'],
      ['With S1 open, motor current should be…', 'Near zero', 'Maximum always', 'Undefined without AC', 'Open switch → no complete path.'],
      ['Run which analysis first?', 'DC', 'Transient only', 'AC only', 'DC shows steady on/off behavior.']
    ),
    ...challengeKeys(p, 'DC simulation succeeds.', 'S1 closed to energize the path.')
  };
}

function ne555Assessment() {
  const p = 'learn.project.ne555';
  return {
    ...lessonKeys(
      p,
      'Astable multivibrator',
      'The 555 alternately charges and discharges the timing capacitor — output toggles.',
      'Timing network',
      'RA, RB, and CT set period in the teaching approximation — change them to speed up or slow down blinking.'
    ),
    ...quizKeys(
      p,
      ['You see blinking LEDs over time in…', 'Transient', 'DC only', 'AC one point', 'Time-varying output needs Transient.'],
      ['Larger timing capacitor generally…', 'Slows oscillation', 'Speeds it up always', 'Removes ground', 'More τ → longer half-cycles.'],
      ['Three LEDs on OUT in this preset…', 'Blink together', 'Never light', 'Need I2C', 'They follow the 555 output in the sample.']
    ),
    ...challengeKeys(p, 'Simulation runs.', 'Use Transient analysis.')
  };
}

function pushbuttonAssessment() {
  const p = 'learn.project.pushbutton';
  return {
    ...lessonKeys(
      p,
      'Momentary input',
      'A pushbutton only connects while pressed — same idea as reading a digital input on a microcontroller.',
      'Active-high path',
      'Button between supply and resistor/LED: pressed = closed switch = current flows.'
    ),
    ...quizKeys(
      p,
      ['Button released means…', 'Open circuit (no LED current)', 'Shorted supply', 'Capacitor fully charged always', 'Momentary switch opens when not pressed.'],
      ['To light the LED you must…', 'Press BTN1 (or Hold to press)', 'Remove ground', 'Run AC only', 'Closed button completes the path.'],
      ['This maps later to Arduino…', 'digitalRead on a pin', 'I2C clock', 'Analog-only forever', 'Digital input is on/off like the button.']
    ),
    ...challengeKeys(p, 'DC simulation OK.', 'Press the button so D1 has current.')
  };
}

function ldrAssessment() {
  const p = 'learn.project.ldr';
  return {
    ...lessonKeys(
      p,
      'Light-dependent resistor',
      'LDR resistance falls in bright light and rises in dark — here it sets a gate voltage for an NMOS night-light.',
      'Divider intuition',
      'Pull-up + LDR to ground: dark → high node voltage → transistor on → LED on.'
    ),
    ...quizKeys(
      p,
      ['In the dark, LDR resistance is…', 'Higher', 'Near zero always', 'Unrelated to light', 'Dark → high R → node rises.'],
      ['Lowering Light parameter simulates…', 'Brighter ambient', 'Darker ambient', 'Higher supply', 'Light control models illumination on the LDR.'],
      ['Night-light means LED on when…', 'It is dark', 'Sun is brightest', 'Ground is removed', 'Inverted from a sunny-day sensor.']
    ),
    ...challengeKeys(p, 'Simulation succeeds.', 'LED D1 on in the default dark setting.')
  };
}

function buzzerAssessment() {
  const p = 'learn.project.buzzer';
  return {
    ...lessonKeys(
      p,
      'Sound from current',
      'The teaching buzzer needs sufficient DC current — always include series limiting.',
      'Switch control',
      'Same pattern as LED: switch in series controls whether current reaches the load.'
    ),
    ...quizKeys(
      p,
      ['Series resistor helps…', 'Limit buzzer current', 'Increase supply voltage', 'Remove ground', 'Protects the teaching buzzer model.'],
      ['With switch open, buzzer should be…', 'Silent', 'Loudest', 'In AC mode only', 'Open path → no current.'],
      ['Use which analysis?', 'DC', 'Transient only', 'AC sweep', 'Steady on/off is DC.']
    ),
    ...challengeKeys(p, 'DC run clean.', 'S1 closed to drive the buzzer path.')
  };
}

function arduinoAssessment() {
  const p = 'learn.project.arduino';
  return {
    ...lessonKeys(
      p,
      'Digital output',
      'Arduino pin D13 drives an LED through a resistor — HIGH sources current, LOW does not.',
      'Teaching limits',
      'Pins have high/low thresholds in the model — not a full MCU emulator, but good for wiring practice.'
    ),
    ...quizKeys(
      p,
      ['OUTPUT HIGH on D13 should…', 'Light the LED (with correct wiring)', 'Float the pin randomly', 'Disable ground', 'Active high drives the LED branch.'],
      ['Series resistor is still needed because…', 'LED needs current limit', 'Arduino has no ground', 'Capacitor is mandatory', 'Same as discrete LED circuits.'],
      ['This preset teaches…', 'Digital I/O wiring', 'Full firmware upload', 'RF layout', 'Wiring and logic levels first.']
    ),
    ...challengeKeys(p, 'Simulation OK.', 'LED D1 conducts with default sketch output.')
  };
}

function i2cOledAssessment() {
  const p = 'learn.project.i2cOled';
  return {
    ...lessonKeys(
      p,
      'I2C bus wiring',
      'SDA and SCL need pull-ups to the logic supply — slaves share the bus with open-drain signaling.',
      'Address & power',
      'OLED module shares ground and supply; I2C is a two-wire data + clock interface.'
    ),
    ...quizKeys(
      p,
      ['I2C needs pull-ups because…', 'Devices use open-drain drivers', 'LEDs need them', 'Ground is optional', 'Pull-ups define idle high on SDA/SCL.'],
      ['How many wires for I2C data+clock (excluding power)?', 'Two (SDA, SCL)', 'One', 'Four data only', 'Classic I2C is two signal lines plus power/ground.'],
      ['Before Run, check…', 'Common ground and supply', 'Only AC mode', 'Remove resistors', 'All parts share reference and power.']
    ),
    ...challengeKeys(p, 'Circuit has no wiring errors.', 'Simulation completes successfully.')
  };
}
