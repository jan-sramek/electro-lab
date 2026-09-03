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
  'learn.challenge.tab.diodeDirection': 'Diode direction',
  'learn.challenge.tab.seriesParallel': 'Series vs parallel',
  'learn.challenge.tab.seriesLeds': 'Series LEDs',
  'learn.challenge.tab.opamp': 'Op-amp',
  'learn.challenge.tab.ac': 'AC analysis',
  'learn.challenge.tab.halfWave': 'Half-wave rectifier',
  'learn.challenge.tab.bridge': 'Bridge rectifier',
  'learn.challenge.tab.filterCap': 'Filter capacitor',
  'learn.challenge.tab.zener': 'Zener regulator',
  'learn.challenge.tab.vreg7805': '7805 regulator',
  'learn.challenge.tab.reversePolarity': 'Reverse polarity',
  'learn.challenge.tab.fuseProtect': 'Fuse protection',
  'learn.challenge.tab.ripple': 'Ripple',
  'learn.challenge.tab.buck': 'Buck converter',
  'learn.challenge.tab.boost': 'Boost converter',
  'learn.challenge.tab.rcLowPass': 'RC low-pass',
  'learn.challenge.tab.rcHighPass': 'RC high-pass',
  'learn.challenge.tab.rlcSeries': 'Series RLC',
  'learn.challenge.tab.bandPass': 'Band-pass filter',
  'learn.challenge.tab.notchFilter': 'Notch filter',
  'learn.challenge.tab.voltageDivider': 'Voltage divider',
  'learn.challenge.tab.measureAc': 'Measure frequency & amplitude',
  'learn.challenge.tab.motorPwm': 'PWM motor speed',
  'learn.challenge.tab.hBridge': 'H-bridge',
  'learn.challenge.tab.motorDirection': 'Motor reverse',
  'learn.challenge.tab.pullUpDown': 'Pull-up / pull-down',
  'learn.challenge.tab.ntcDivider': 'NTC / thermistor divider',
  'learn.challenge.tab.pwmFilter': 'PWM as pseudo-DAC',
  'learn.challenge.tab.relayBjt': 'Relay + transistor driver',
  'learn.challenge.tab.estopRelay': 'E-stop principle',
  'learn.challenge.tab.industrial24v': 'Basic 24 V control',
  'learn.challenge.tab.debounce': 'RC debounce',
  'learn.challenge.tab.opampActiveFilter': 'Active low-pass filter',
  'learn.challenge.tab.opampDifferentiator': 'Differentiator',
  'learn.challenge.tab.opampIntegrator': 'Integrator',
  'learn.challenge.tab.opampSumming': 'Summing amplifier',
  'learn.challenge.tab.opampSchmitt': 'Schmitt trigger',
  'learn.challenge.tab.opampComparator': 'Comparator',
  'learn.challenge.tab.opampNonInv': 'Non-inverting amplifier',
  'learn.challenge.tab.opampFollower': 'Voltage follower',
  'learn.challenge.tab.christmasTree': 'NE555 Christmas tree',
  'learn.challenge.tab.ne555Pot': 'NE555 + pot blink',

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
  ...i2cOledAssessment(),
  ...halfWaveAssessment(),
  ...bridgeAssessment(),
  ...filterCapAssessment(),
  ...zenerAssessment(),
  ...vreg7805Assessment(),
  ...reversePolarityAssessment(),
  ...fuseProtectAssessment(),
  ...rippleAssessment(),
  ...buckAssessment(),
  ...boostAssessment(),
  ...opampFollowerAssessment(),
  ...opampAssessment(),
  ...opampNonInvAssessment(),
  ...opampComparatorAssessment(),
  ...opampSchmittAssessment(),
  ...opampSummingAssessment(),
  ...opampIntegratorAssessment(),
  ...opampDifferentiatorAssessment(),
  ...opampActiveFilterAssessment(),
  ...rcLowPassAssessment(),
  ...rcHighPassAssessment(),
  ...rlcSeriesAssessment(),
  ...bandPassAssessment(),
  ...notchFilterAssessment(),
  ...voltageDividerAssessment(),
  ...potDividerAssessment(),
  ...measureAcAssessment(),
  ...motorMosfetAssessment(),
  ...motorPwmAssessment(),
  ...motorSpeedAssessment(),
  ...motorFlybackAssessment(),
  ...hBridgeAssessment(),
  ...motorDirectionAssessment(),
  ...pullUpDownAssessment(),
  ...debounceAssessment(),
  ...sensorLdrAssessment(),
  ...sensorPotAssessment(),
  ...ntcDividerAssessment(),
  ...sensorThresholdAssessment(),
  ...commsI2cAssessment(),
  ...adcFrontEndAssessment(),
  ...adcReferenceAssessment(),
  ...pwmFilterAssessment(),
  ...relayBjtAssessment(),
  ...mosfetDriverAssessment(),
  ...coilProtectAssessment(),
  ...inductiveLoadAssessment(),
  ...estopRelayAssessment(),
  ...industrial24vAssessment(),
  ...fundamentalsLoopAssessment(),
  ...ohmExploreAssessment(),
  ...ledBurnLimitAssessment(),
  ...diodeDirectionAssessment(),
  ...seriesParallelAssessment(),
  ...timeConstantAssessment(),
  ...pulseRcAssessment(),
  ...acRcLpfAssessment(),
  ...ne555PlayAssessment(),
  ...ne555PotAssessment(),
  ...pinInputAssessment(),
  ...i2cAddressAssessment(),
  ...bjtVsMosAssessment(),
  ...inductiveWhyDiodeAssessment()
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

function halfWaveAssessment() {
  const p = 'learn.project.halfWave';
  return {
    ...lessonKeys(
      p,
      'One diode, one half-cycle',
      'A diode conducts only when anode is higher than cathode by ~Vf — so only positive AC peaks reach the load.',
      'Pulsating DC',
      'The load sees zero on the blocked half-cycle. That “missing” energy is why half-wave needs more filtering later.'
    ),
    ...quizKeys(
      p,
      ['A half-wave rectifier uses…', 'One series diode', 'Four diodes always', 'Only a capacitor', 'Single diode passes one polarity.'],
      ['On the blocked half-cycle the load voltage is…', 'Near zero', 'Double the peak', 'Negative of Vin always', 'Diode open → no path.'],
      ['Best analysis mode here?', 'Transient', 'DC only', 'AC small-signal only', 'Need time to see the waveform.']
    ),
    ...challengeKeys(p, 'Simulation succeeds.', 'Transient analysis is selected.')
  };
}

function bridgeAssessment() {
  const p = 'learn.project.bridge';
  return {
    ...lessonKeys(
      p,
      'Four diodes',
      'A bridge steers both AC half-cycles into the same DC polarity on the load.',
      'Twice the pulse rate',
      'For 50 Hz AC you get 100 Hz pulsating DC — easier to filter than half-wave.'
    ),
    ...quizKeys(
      p,
      ['Bridge rectifiers typically use…', 'Four diodes', 'One diode', 'Only inductors', 'Classic Graetz bridge.'],
      ['Compared with half-wave, pulse frequency is…', 'Higher (both halves)', 'Lower always', 'Exactly zero', 'Both polarities contribute.'],
      ['DC return in this Lab sample is…', 'Tied to ground for probing', 'Floating forever', 'AC only', 'Teaching convenience.']
    ),
    ...challengeKeys(p, 'Simulation succeeds.', 'Transient analysis is selected.')
  };
}

function filterCapAssessment() {
  const p = 'learn.project.filterCap';
  return {
    ...lessonKeys(
      p,
      'Reservoir capacitor',
      'After rectification, C charges near the peaks and supplies the load between peaks.',
      'Ripple trade-off',
      'Smaller C or heavier load → more voltage droop between peaks (ripple).'
    ),
    ...quizKeys(
      p,
      ['Between peaks the capacitor mostly…', 'Discharges into the load', 'Charges from ground only', 'Acts as an open forever', 'Supplies the load.'],
      ['Larger C generally…', 'Reduces ripple', 'Increases ripple always', 'Removes the diode', 'More stored charge.'],
      ['Use which analysis?', 'Transient', 'DC operating point only', 'AC phasor only', 'Need time-domain waveform.']
    ),
    ...challengeKeys(p, 'Simulation succeeds.', 'Transient analysis is selected.')
  };
}

function zenerAssessment() {
  const p = 'learn.project.zener';
  return {
    ...lessonKeys(
      p,
      'Shunt clamp',
      'Series Rs drops excess voltage; the Zener conducts in reverse near Vz to hold the load node.',
      'Orientation',
      'Cathode to the regulated node, anode to ground — reverse breakdown is the regulation mode.'
    ),
    ...quizKeys(
      p,
      ['Zener regulation uses…', 'Reverse breakdown near Vz', 'Only forward Vf', 'Open circuit always', 'Clamps when reverse biased.'],
      ['Series resistor Rs is needed to…', 'Limit Zener/load current', 'Short the supply', 'Remove ground', 'Drop excess voltage safely.'],
      ['Best first analysis?', 'DC', 'AC sweep only', 'Transient mandatory', 'Steady clamp is DC.']
    ),
    ...challengeKeys(p, 'Simulation succeeds.', 'Wiring passes circuit checks.')
  };
}

function vreg7805Assessment() {
  const p = 'learn.project.vreg7805';
  return {
    ...lessonKeys(
      p,
      'Series regulator',
      'A 7805-style IC holds ~5 V on OUT when IN is high enough above dropout.',
      'Heat & dropout',
      'The IN−OUT difference is dissipated as heat in a real part; too little headroom and regulation collapses.'
    ),
    ...quizKeys(
      p,
      ['With enough Vin, OUT is about…', '5 V (teaching default)', 'Equal to Vin always', '0 V always', 'Regulates to vOut.'],
      ['If Vin falls near dropout…', 'OUT may sag below 5 V', 'OUT doubles', 'Fuse opens always', 'Needs headroom.'],
      ['Compared with a Zener shunt…', '7805 is a series regulator', 'Identical topology', 'No ground pin', 'Different teaching model.']
    ),
    ...challengeKeys(p, 'Simulation succeeds.', 'Wiring passes circuit checks.')
  };
}

function reversePolarityAssessment() {
  const p = 'learn.project.reversePolarity';
  return {
    ...lessonKeys(
      p,
      'Series protection diode',
      'If the battery is reversed, the diode blocks — the load never sees reverse voltage.',
      'Cost of protection',
      'You pay ~Vf drop in normal operation — budget that into LED current calculations.'
    ),
    ...quizKeys(
      p,
      ['With correct polarity the series diode…', 'Conducts (drops ~Vf)', 'Always open', 'Shorts ground', 'Forward path.'],
      ['Reversed battery means…', 'Diode blocks; load off', 'LED brighter', 'Fuse optional only', 'Protection job.'],
      ['Trade-off is…', 'Lost voltage budget (~Vf)', 'Higher frequency', 'No ground needed', 'Forward drop cost.']
    ),
    ...challengeKeys(p, 'Simulation succeeds.', 'LED conducts with correct polarity.')
  };
}

function fuseProtectAssessment() {
  const p = 'learn.project.fuseProtect';
  return {
    ...lessonKeys(
      p,
      'Trip on overcurrent',
      'The teaching fuse stays low-Ron until |I| exceeds iMax, then opens like a burned-open part.',
      'After a trip',
      'Replace the fuse — Lab opens closed switches so the new fuse is not instantly overloaded. Fix the fault before closing the short again.'
    ),
    ...quizKeys(
      p,
      ['A fuse opens when…', 'Current exceeds iMax', 'Voltage is exactly 5 V', 'Ground is removed only', 'Overcurrent trip.'],
      ['After burnout you should…', 'Replace the fuse', 'Wire around it forever', 'Remove ground', 'Restore protection.'],
      ['S1 closed across RL means…', 'A short that overloads the fuse', 'Safe normal load forever', 'AC analysis only', 'Bypass path dumps current through F1.']
    ),
    ...challengeKeys(p, 'Simulation succeeds.', 'Wiring passes circuit checks.')
  };
}

function rippleAssessment() {
  const p = 'learn.project.ripple';
  return {
    ...lessonKeys(
      p,
      'What ripple is',
      'Residual AC riding on filtered DC — the droop between rectifier peaks.',
      'How to see it',
      'Transient + probe on the filter node. Smaller C or heavier load makes ripple easier to spot.'
    ),
    ...quizKeys(
      p,
      ['Ripple is…', 'AC leftover on DC', 'Only DC offset', 'Gate threshold', 'Peak-to-peak residual.'],
      ['Heavier load usually…', 'Increases ripple', 'Removes diodes', 'Stops AC forever', 'Faster discharge between peaks.'],
      ['Use…', 'Transient analysis', 'DC only forever', 'No probe ever', 'Time-domain view.']
    ),
    ...challengeKeys(p, 'Simulation succeeds.', 'Transient analysis is selected.')
  };
}

function buckAssessment() {
  const p = 'learn.project.buck';
  return {
    ...lessonKeys(
      p,
      'Step-down idea',
      'A high-side switch chops Vin; L and C average the pulses into a lower DC.',
      'Duty cycle',
      'Longer on-time (higher duty) raises the average output toward Vin.'
    ),
    ...quizKeys(
      p,
      ['A buck converter ideally…', 'Steps voltage down', 'Always boosts', 'Removes inductors', 'Vout < Vin typically.'],
      ['Higher duty cycle tends to…', 'Raise average Vout', 'Guarantee zero current', 'Open the diode forever', 'More on-time → higher average.'],
      ['This sample needs…', 'Transient (PWM)', 'DC only', 'AC phasor only', 'Switching is time-domain.']
    ),
    ...challengeKeys(p, 'Simulation succeeds.', 'Transient analysis is selected.')
  };
}

function boostAssessment() {
  const p = 'learn.project.boost';
  return {
    ...lessonKeys(
      p,
      'Step-up idea',
      'Low-side switch stores energy in L, then the diode delivers it to a higher Vout capacitor.',
      'Energy per cycle',
      'Longer on-time stores more inductor energy — Vout can rise above Vin.'
    ),
    ...quizKeys(
      p,
      ['A boost converter ideally…', 'Steps voltage up', 'Always bucks', 'Needs no diode', 'Vout > Vin typically.'],
      ['Inductor energy is stored mainly when…', 'The switch is on', 'The fuse opens', 'Ground floats', 'L charges to ground.'],
      ['Analysis mode?', 'Transient', 'DC only', 'AC small-signal only', 'PWM needs time.']
    ),
    ...challengeKeys(p, 'Simulation succeeds.', 'Transient analysis is selected.')
  };
}


function opampFollowerAssessment() {
  const p = 'learn.project.opampFollower';
  return {
    ...lessonKeys(
      p,
      "Unity gain buffer",
      "Negative feedback forces −in ≈ +in. With OUT wired to −in, Vout equals Vin. The op-amp supplies the load current so the source is not loaded.",
      "When to use it",
      "Followers isolate stages, drive low impedances, and copy sensor voltages without dropping them across source resistance."
    ),
    ...quizKeys(
      p,
      ["In a voltage follower, feedback connects OUT to…", "The inverting input (−in)", "The non-inverting input (+in)", "Neither input", "OUT ties to −in so the loop keeps −in = +in = Vin."],
      ["Ideal follower voltage gain is…", "−10", "1 (unity)", "∞", "Vout / Vin ≈ 1."],
      ["Main teaching benefit of a follower is…", "Clipping the rails harder", "Inverting the signal", "Buffering without loading the source", "It copies voltage while the amp drives the load."]
    ),
    ...challengeKeys(
      p,
      "Simulation completes without errors.",
      "Circuit has an op-amp and a load resistor."
    )
  };
}

function opampAssessment() {
  const p = 'learn.project.opamp';
  return {
    ...lessonKeys(
      p,
      "Virtual ground",
      "Negative feedback holds −in at the same potential as +in (ground here). Current through Rin continues through Rf, so Vout = −Vin·Rf/Rin.",
      "Rails",
      "If the ideal gain asks for more than ±vMax/vMin, the teaching model clamps — OUT sticks at the rail."
    ),
    ...quizKeys(
      p,
      ["Ideal inverting gain is…", "−Rf / Rin", "1 + Rf / Rin", "Rf only", "Closed-loop gain for the inverting topology."],
      ["With +in grounded, the summing node sits near…", "Vcc", "0 V (virtual ground)", "Vin", "Feedback keeps −in ≈ +in = 0."],
      ["If |ideal Vout| exceeds the rail…", "Gain doubles", "Nothing changes", "OUT clamps at the rail", "Teaching op-amp saturates at vMax/vMin."]
    ),
    ...challengeKeys(
      p,
      "Simulation completes without errors.",
      "Circuit includes op-amp and resistors."
    )
  };
}

function opampNonInvAssessment() {
  const p = 'learn.project.opampNonInv';
  return {
    ...lessonKeys(
      p,
      "Gain formula",
      "Feedback sets V− = Vin. Divider Rf/Rg gives Vout = Vin·(1 + Rf/Rg).",
      "Same polarity",
      "Unlike the inverter, the output moves the same direction as the input."
    ),
    ...quizKeys(
      p,
      ["Ideal non-inverting gain is…", "−Rf / Rg", "1 + Rf / Rg", "Rf − Rg", "Closed-loop non-inverting gain."],
      ["Input signal connects to…", "−in only", "+in", "OUT", "Vin drives the non-inverting pin."],
      ["Compared with the inverter, polarity is…", "Always opposite", "Undefined", "The same as Vin", "Non-inverting keeps sign."]
    ),
    ...challengeKeys(
      p,
      "Simulation completes without errors.",
      "Circuit includes op-amp and feedback resistors."
    )
  };
}

function opampComparatorAssessment() {
  const p = 'learn.project.opampComparator';
  return {
    ...lessonKeys(
      p,
      "Open loop",
      "Without feedback the teaching gain is huge, so OUT saturates high or low depending on which input is larger.",
      "Threshold",
      "The resistor divider sets the trip voltage. A pot lets you sweep Vin across that threshold."
    ),
    ...quizKeys(
      p,
      ["A comparator usually uses…", "Heavy negative feedback", "Open-loop (or tiny feedback) gain", "An inductor only", "High gain drives the output to a rail."],
      ["When Vin > Vth on this sample, OUT goes…", "Toward the positive rail", "Exactly Vin", "Always 0 V", "+in above −in → high out."],
      ["Moving the pot Wiper…", "Changes timing capacitance", "Does nothing", "Sweeps Vin across the threshold", "Wiper is the variable input."]
    ),
    ...challengeKeys(
      p,
      "Simulation completes without errors.",
      "Circuit includes op-amp and potentiometer."
    )
  };
}

function opampSchmittAssessment() {
  const p = 'learn.project.opampSchmitt';
  return {
    ...lessonKeys(
      p,
      "Hysteresis",
      "Positive feedback adds a fraction of OUT to the trip level, so rising and falling thresholds differ — noise near the threshold does not chatter.",
      "Vs plain comparator",
      "A plain comparator trips at one voltage both ways; Schmitt needs a larger swing to switch back."
    ),
    ...quizKeys(
      p,
      ["Schmitt triggers add…", "Hysteresis via positive feedback", "Only series inductance", "Unity-gain buffering", "Feedback shifts the threshold with output state."],
      ["Rising vs falling trip points are…", "Always identical", "Different (hysteresis band)", "Random each run", "Two thresholds by design."],
      ["Hysteresis helps against…", "Rail voltage", "LED color", "Noise chatter near the threshold", "Small noise cannot flip the state without crossing the other trip point."]
    ),
    ...challengeKeys(
      p,
      "Simulation completes without errors.",
      "Circuit includes op-amp with feedback."
    )
  };
}

function opampSummingAssessment() {
  const p = 'learn.project.opampSumming';
  return {
    ...lessonKeys(
      p,
      "Weighted sum",
      "Each input current Vin/Rn adds at the summing node. With equal R and Rf, Vout = −(V1 + V2).",
      "Audio / DAC intuition",
      "Summing amps mix signals or binary-weighted currents in teaching DACs."
    ),
    ...quizKeys(
      p,
      ["With equal Rin and Rf, Vout is…", "−(V1 + V2)", "V1 − V2", "V1 × V2", "Equal-weight inverting summer."],
      ["Extra input channels connect through…", "More resistors into the summing node", "The +in pin only", "Shorting OUT to ground", "Each source needs its own input resistor."],
      ["The summing node is held near…", "Vcc", "Virtual ground", "V1 only", "Same as the inverting amp."]
    ),
    ...challengeKeys(
      p,
      "Simulation completes without errors.",
      "Circuit includes op-amp and two input sources."
    )
  };
}

function opampIntegratorAssessment() {
  const p = 'learn.project.opampIntegrator';
  return {
    ...lessonKeys(
      p,
      "Ramp from current",
      "Feedback current charges Cf. Ideal Vout falls as −(1/Rin·Cf)·∫Vin dt for the inverting integrator.",
      "Teaching limits",
      "Real integrators need a large DC feedback resistor to limit drift; this sample shows the ideal ramp behaviour."
    ),
    ...quizKeys(
      p,
      ["Feedback element in this integrator is…", "A capacitor", "Only a wire", "An inductor", "Cf stores the integrated charge."],
      ["A constant positive Vin makes ideal Vout…", "Stay at Vin", "Ramp (negative direction for inverting)", "Oscillate forever", "Integral of a constant is a ramp."],
      ["Best analysis mode here is…", "DC only", "AC single-frequency only", "Transient", "You need time to see the ramp."]
    ),
    ...challengeKeys(
      p,
      "Simulation completes without errors.",
      "Analysis mode is Transient."
    )
  };
}

function opampDifferentiatorAssessment() {
  const p = 'learn.project.opampDifferentiator';
  return {
    ...lessonKeys(
      p,
      "Edges only",
      "Capacitor current is C·dV/dt, so flat levels produce little output; edges produce spikes.",
      "Noise caution",
      "Differentiators emphasise fast changes — teaching models stay tame; real circuits often add a series R to limit gain at HF."
    ),
    ...quizKeys(
      p,
      ["Series input element here is…", "A capacitor", "Only a battery", "A fuse", "Cin couples dV/dt into the amp."],
      ["A flat DC input ideally yields…", "Huge DC gain", "Near-zero output", "A triangle wave", "dV/dt ≈ 0 on a flat level."],
      ["You mainly watch…", "Only the DC operating point", "Nothing", "Transient spikes on edges", "Edges are the teaching signal."]
    ),
    ...challengeKeys(
      p,
      "Simulation completes without errors.",
      "Analysis mode is Transient."
    )
  };
}

function opampActiveFilterAssessment() {
  const p = 'learn.project.opampActiveFilter';
  return {
    ...lessonKeys(
      p,
      "First-order LPF",
      "At low f, C is open and gain ≈ −Rf/Rin. At high f, C shunts Rf and gain falls.",
      "Why active?",
      "The op-amp isolates the filter and can provide gain; passive RC alone cannot boost."
    ),
    ...quizKeys(
      p,
      ["Raising frequency well above cutoff…", "Increases |Vout|", "Leaves gain unchanged", "Attenuates the output", "Low-pass behaviour."],
      ["Feedback capacitor mainly affects…", "Only LED colour", "High-frequency gain (shunts Rf)", "Battery ESR only", "C shorts Rf as f rises."],
      ["Best analysis mode for this sample is…", "AC", "DC only", "No simulation", "Frequency response is an AC story."]
    ),
    ...challengeKeys(
      p,
      "Simulation completes without errors.",
      "Analysis mode is AC."
    )
  };
}

function rcLowPassAssessment() {
  const p = 'learn.project.rcLowPass';
  return {
    ...lessonKeys(p, "First-order LPF", "At low f the capacitor is open so Vout ≈ Vin. Above fc ≈ 1/(2πRC) the shunt C shorts AC to ground and |Vout| rolls off ~20 dB/decade.", "Where you see it", "Sensor smoothing, anti-aliasing before ADCs, and simple tone control all start from this topology."),
    ...quizKeys(
      p,
      ["An RC low-pass puts the capacitor…", "Across the output (shunt to return)", "Only in series with the source", "Floating with no ground", "Series R + shunt C is the classic LPF."],
      ["Cutoff frequency scales as…", "RC", "1 / (2πRC)", "2πRC", "fc = 1/(2πRC) for the first-order RC LPF."],
      ["Well above cutoff, |Vout|…", "Equals Vin", "Grows without bound", "Falls as frequency rises", "The shunt C steals more AC current as f increases."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Analysis mode is AC.")
  };
}

function rcHighPassAssessment() {
  const p = 'learn.project.rcHighPass';
  return {
    ...lessonKeys(p, "First-order HPF", "At high f the capacitor is a short so Vout ≈ Vin across R. Near DC the C blocks and |Vout| falls toward zero.", "Uses", "AC coupling between stages, removing DC offsets, and simple treble-pass networks."),
    ...quizKeys(
      p,
      ["An RC high-pass puts the capacitor…", "In series with the signal path", "Only as a shunt to ground", "Across the battery", "Series C + shunt R is the classic HPF."],
      ["Near DC, ideal HPF output…", "Equals Vin", "Approaches zero", "Oscillates", "The series C blocks DC."],
      ["Raising C (same R) moves fc…", "Higher", "Nowhere", "Lower", "fc = 1/(2πRC) — larger C lowers the knee."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Analysis mode is AC.")
  };
}

function rlcSeriesAssessment() {
  const p = 'learn.project.rlcSeries';
  return {
    ...lessonKeys(p, "Resonance", "At fr the inductive and capacitive reactances cancel. Series impedance is near R, so current is largest for a given drive.", "Teaching takeaway", "Filters and tuned tanks are just RLC with different pick-off points — start by feeling the resonance peak."),
    ...quizKeys(
      p,
      ["Series resonance occurs when…", "XL ≈ XC", "R = 0 only", "L = C numerically", "Reactances cancel; impedance ≈ R."],
      ["Resonant frequency scales as…", "LC", "1 / (2π√(LC))", "2πLC", "fr = 1/(2π√(LC))."],
      ["At resonance, series impedance is closest to…", "∞", "jωL only", "R", "L and C cancel; R remains."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Analysis mode is AC.")
  };
}

function bandPassAssessment() {
  const p = 'learn.project.bandPass';
  return {
    ...lessonKeys(p, "Pass a band", "Around resonance the network transfers signal; far off-resonance reactive mismatch attenuates. Bandwidth depends on Q (R vs √(L/C)).", "Vs LPF/HPF", "A band-pass needs both a high-side and low-side roll-off — RLC (or cascaded RC) gives that shape."),
    ...quizKeys(
      p,
      ["A band-pass ideally…", "Passes a mid band, attenuates ends", "Only blocks DC", "Amplifies all frequencies equally", "That is the definition of band-pass."],
      ["Center frequency is set mainly by…", "Only R", "L and C (resonance)", "Wire length alone", "fr follows the LC product."],
      ["Higher Q usually means…", "Wider pass band", "No resonance", "Narrower peak around fr", "Q sharpens the resonance peak."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Analysis mode is AC.")
  };
}

function notchFilterAssessment() {
  const p = 'learn.project.notchFilter';
  return {
    ...lessonKeys(p, "Reject a tone", "At the notch frequency the network presents a path that cancels transfer to the load — |Vout| plunges in a narrow band.", "Uses", "Killing mains hum, removing a whistle, or scrubbing one interferer before amplification."),
    ...quizKeys(
      p,
      ["A notch filter…", "Rejects a narrow band", "Only passes DC", "Always amplifies", "Notch = band-stop around one frequency."],
      ["Far from the notch frequency, |Vout|…", "Is always zero", "Recovers toward the pass level", "Must oscillate", "Rejection is local to the notch."],
      ["Tuning the notch mainly means changing…", "Only the battery ESR", "Wire color", "L and/or C", "The reject frequency tracks the LC resonance."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Analysis mode is AC.")
  };
}

function voltageDividerAssessment() {
  const p = 'learn.project.voltageDivider';
  return {
    ...lessonKeys(p, "Ratio rule", "With no load, Vmid = Vsource · Rbottom / (Rtop + Rbottom). Current is V / (R1+R2).", "Loading", "Anything attached to the mid node is another parallel path — it lowers effective Rbottom and drops Vmid."),
    ...quizKeys(
      p,
      ["Unloaded divider mid voltage is…", "V · R2 / (R1 + R2)", "V · R1 only", "Always V/2 regardless of R", "Ohm’s law on the series string."],
      ["Equal resistors give…", "Zero volts", "Half the source (ideal)", "Twice the source", "R2/(R1+R2) = 1/2."],
      ["A heavy load on the mid node…", "Raises Vmid", "Does nothing", "Pulls Vmid down", "Load parallels Rbottom."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit has no structural errors.")
  };
}

function potDividerAssessment() {
  const p = 'learn.project.potDivider';
  return {
    ...lessonKeys(p, "Moving tap", "A potentiometer is two resistors in series whose ratio tracks the mechanical (or slider) position.", "Same math as fixed dividers", "Vwiper ≈ V · pos when unloaded. Volume controls and setpoint knobs are this idea in hardware."),
    ...quizKeys(
      p,
      ["A pot used as a divider…", "Takes a tap between two end terminals", "Must be floating with one pin", "Only works with AC", "Ends on the rail; wiper is the mid."],
      ["Moving the wiper toward ground…", "Raises Vwiper to Vcc", "Lowers Vwiper toward 0", "Disconnects the circuit", "More resistance above the tap → lower ratio."],
      ["Heavy load on the wiper…", "Never matters", "Increases supply voltage", "Distorts the expected linear sweep", "Loading parallels the lower arm."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit includes a potentiometer.")
  };
}

function measureAcAssessment() {
  const p = 'learn.project.measureAc';
  return {
    ...lessonKeys(p, "AC observables", "AC mode reports phasor magnitude/phase at the analysis frequency — think “how big is this tone here?”", "Lab habit", "Pick one frequency, probe one node, change one parameter — that is how you build intuition without drowning in plots."),
    ...quizKeys(
      p,
      ["AC analysis in this Lab is best for…", "Tone magnitude at a frequency", "Only DC battery ESR", "Mechanical switch bounce", "AC solves the linear network at f."],
      ["Doubling source mag (linear network)…", "Zeros the output", "Roughly doubles probed mag", "Inverts DC only", "Linear scaling."],
      ["Good measurement discipline is…", "Change everything at once", "Never use a voltmeter", "Change one thing and re-probe", "Isolation builds understanding."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Analysis mode is AC.")
  };
}

function motorMosfetAssessment() {
  const p = 'learn.project.motorMosfet';
  return {
    ...lessonKeys(p, "Low-side switch", "NMOS between motor (−) and ground lets a logic-level gate control a higher-current path from the supply through the motor.", "Always plan the diode", "Motors are inductive — when the FET opens, current needs a freewheel path (flyback diode)."),
    ...quizKeys(
      p,
      ["Low-side NMOS motor drive puts the FET…", "Between motor return and ground", "Only across the battery", "In series with nothing", "Classic low-side switch."],
      ["Gate high (above threshold)…", "Always burns the motor", "Allows drain–source current", "Opens the channel forever", "Enhancement NMOS conducts when Vgs is high enough."],
      ["Flyback diode orientation…", "Anode to +V", "Optional decoration", "Cathode toward +V across the motor", "It freewheels inductive current when the switch opens."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit has no structural errors.")
  };
}

function motorPwmAssessment() {
  const p = 'learn.project.motorPwm';
  return {
    ...lessonKeys(p, "Average voltage", "PWM switches fully on/off. The motor inductance/mechanics average the pulses — higher duty ≈ higher effective voltage.", "Why not a linear resistor?", "Switching keeps the FET in low-loss on/off states instead of dissipating as a series rheostat."),
    ...quizKeys(
      p,
      ["PWM motor control mainly varies…", "Duty cycle (on-time fraction)", "Wire color", "Only diode Vf forever", "Duty sets average voltage."],
      ["During the off interval, inductive current…", "Needs a freewheel path", "Instantly becomes zero safely always", "Charges the gate only", "Flyback diode (or sync path) matters."],
      ["Higher duty cycle tends to…", "Stop the motor always", "Lower average voltage", "Raise average motor voltage", "More on-time → more average V."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Analysis mode is transient.")
  };
}

function motorSpeedAssessment() {
  const p = 'learn.project.motorSpeed';
  return {
    ...lessonKeys(
      p,
      'Speed ≈ average voltage',
      'In the teaching model, raising PWM duty raises the average voltage across the motor — it spins harder.',
      'Tune carefully',
      'Change pulse width (duty), Run Transient, and watch motor current / animation. Keep the flyback path intact.'
    ),
    ...quizKeys(
      p,
      [
        'To spin faster you usually…',
        'Increase PWM duty cycle',
        'Remove the flyback diode',
        'Delete ground',
        'More on-time raises average voltage.'
      ],
      [
        'Best analysis mode to see PWM…',
        'Import JSON only',
        'Transient',
        'SEO mode',
        'Need time to see the pulses.'
      ],
      [
        'Lowering duty cycle tends to…',
        'Always burn the FET',
        'Raise speed forever',
        'Reduce average motor voltage',
        'Less on-time → slower / weaker drive.'
      ]
    ),
    ...challengeKeys(p, 'Simulation completes without errors.', 'Use Transient analysis.')
  };
}

function motorFlybackAssessment() {
  const p = 'learn.project.motorFlyback';
  return {
    ...lessonKeys(p, "Inductive kick", "Current in an inductor cannot stop instantly. Without a path, voltage spikes and can avalanche the transistor.", "Placement", "Diode anti-parallel to the inductive load: cathode to the more positive motor terminal (toward +V on a low-side switch)."),
    ...quizKeys(
      p,
      ["Flyback diodes protect against…", "Inductive voltage spikes at turn-off", "Only LED color", "USB enumeration", "They freewheel L·di/dt energy."],
      ["On a low-side motor switch, cathode faces…", "Ground only", "Toward +V (across the motor)", "The gate resistor", "Standard freewheel orientation."],
      ["Omitting the diode when switching a motor…", "Is always fine", "Speeds PWM forever", "Risks killing the transistor", "Spike energy has nowhere safe to go."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit has no structural errors.")
  };
}

function hBridgeAssessment() {
  const p = 'learn.project.hBridge';
  return {
    ...lessonKeys(p, "Diagonal drive", "Forward: top-left + bottom-right. Reverse: the other diagonal. Both highs or both lows on one side shorts the supply.", "Teaching model", "Ideal switches stand in for MOSFET half-bridges — focus on current path, not gate-drive ICs yet."),
    ...quizKeys(
      p,
      ["Forward H-bridge conduction uses…", "One diagonal pair of switches", "All four switches closed", "Only the flyback LEDs", "Diagonal path through the motor."],
      ["Closing both switches on one leg…", "Is required", "Shoot-through / shorts the rail", "Charges the motor safely", "High and low both on = supply short."],
      ["Reversing the motor means…", "Removing ground", "Changing wire color only", "Closing the other diagonal pair", "Current through the motor flips."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit has no structural errors.")
  };
}

function motorDirectionAssessment() {
  const p = 'learn.project.motorDirection';
  return {
    ...lessonKeys(p, "Flip the diagonal", "Reversing is not a second motor — it is the other pair of switches so current enters the opposite motor terminal.", "Safe sequencing", "Real drivers insert dead time so both FETs on a leg are never on together."),
    ...quizKeys(
      p,
      ["To reverse with an H-bridge…", "Close the opposite diagonal", "Short both rails", "Remove the motor", "Other diagonal flips current."],
      ["Forward and reverse diagonals should be…", "Closed at the same time", "Mutually exclusive", "Irrelevant", "Overlap causes shoot-through."],
      ["Dead time is…", "Extra LED brightness", "USB delay only", "A brief both-off gap when changing direction", "Prevents leg shoot-through."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit has no structural errors.")
  };
}

function pullUpDownAssessment() {
  const p = 'learn.project.pullUpDown';
  return {
    ...lessonKeys(p, "Idle level", "Inputs must not float. A pull-up weakly holds HIGH until the switch (or open-drain) strongly pulls LOW.", "Strong vs weak", "The switch wins when closed; the resistor wins when open. Choose R so leakage and speed still work."),
    ...quizKeys(
      p,
      ["A pull-up resistor…", "Holds the node high when the switch is open", "Always shorts VCC to ground", "Replaces the battery", "Weak HIGH idle."],
      ["Closing a switch to ground on a pull-up input…", "Leaves the node floating", "Drives the node low", "Raises VCC", "Strong low overrides the weak pull-up."],
      ["Floating inputs are bad because…", "They are always 5.000 V", "LEDs become brighter", "Noise can randomly trip logic", "Undefined voltage = unreliable reads."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit has no structural errors.")
  };
}

function debounceAssessment() {
  const p = 'learn.project.debounce';
  return {
    ...lessonKeys(p, "Bounce", "Mechanical contacts chatter for milliseconds. Logic that samples raw edges may see many false transitions.", "RC softens edges", "A capacitor to ground (with pull-up) low-pass filters the switch node. Firmware debounce is the digital twin of this idea."),
    ...quizKeys(
      p,
      ["Switch bounce causes…", "Multiple edges from one press", "Higher battery voltage", "Perfect single edges always", "Contacts chatter."],
      ["An RC on the switch node…", "Removes the need for ground", "Slows/filters fast chatter", "Increases bounce", "Low-pass softens edges."],
      ["Debounce belongs with…", "Only RF antennas", "Only transformers", "Buttons, limit switches, and noisy contacts", "Any mechanical contact benefits."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit has no structural errors.")
  };
}

function sensorLdrAssessment() {
  const p = 'learn.project.sensorLdr';
  return {
    ...lessonKeys(p, "Resistance to voltage", "Most sensors do not output a clean volt by themselves. An LDR is a variable R; a fixed resistor completes a divider so you get a voltage that tracks light.", "Usable signal", "That mid-node voltage can drive a FET, a comparator, or (later) an ADC pin. Same idea for many resistive sensors."),
    ...quizKeys(
      p,
      ["An LDR mainly changes…", "Resistance with light", "Only battery ESR", "Wire color", "Photoresistance varies with illumination."],
      ["A series resistor with the LDR makes…", "A short across VCC", "A voltage divider (usable signal)", "An antenna", "Divider mid-node is the sensor voltage."],
      ["Raising light (lower LDR R to ground) tends to…", "Raise the mid node forever", "Disconnect ground", "Pull the mid node toward ground", "Lower bottom R drops the divider ratio."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit has no structural errors.")
  };
}

function sensorPotAssessment() {
  const p = 'learn.project.sensorPot';
  return {
    ...lessonKeys(p, "Position → voltage", "Mechanical travel changes the divider ratio. The wiper is already a usable analog signal.", "Loading", "Whatever you attach to the wiper (ADC, amp, FET) must not drag the voltage if you need accuracy — buffer or high impedance helps."),
    ...quizKeys(
      p,
      ["A pot used as a sensor outputs…", "A tap voltage between the rails", "Only digital pulses", "RF only", "Wiper is the analog signal."],
      ["Moving the wiper changes…", "Nothing electrical", "The divider ratio (and Vwiper)", "Only LED color", "Position sets the resistive split."],
      ["Heavy load on the wiper…", "Never matters", "Raises VCC", "Can distort the expected voltage", "Loading parallels the lower arm."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit has no structural errors.")
  };
}

function ntcDividerAssessment() {
  const p = 'learn.project.ntcDivider';
  return {
    ...lessonKeys(p, "Thermistor idea", "NTCs drop resistance as they warm. In a divider that moves the mid voltage — that is your temperature signal.", "Why a stand-in", "Lab v1 has no dedicated NTC model yet. A pot lets you feel the divider math before a future sensor ADR."),
    ...quizKeys(
      p,
      ["An NTC in a divider mainly gives…", "A voltage that tracks temperature", "Only PWM", "Galvanic isolation", "R(T) → Vmid."],
      ["If NTC resistance falls (warmer) on the bottom arm…", "Vmid usually falls", "Vmid must rise to VCC", "The battery shorts", "Lower bottom R lowers the ratio."],
      ["This sample uses a pot because…", "Pots are NTCs", "It is a teaching stand-in for variable R", "AC analysis requires it", "Interactive R without a dedicated NTC model."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit has no structural errors.")
  };
}

function sensorThresholdAssessment() {
  const p = 'learn.project.sensorThreshold';
  return {
    ...lessonKeys(p, "Threshold decision", "Many sensor apps need a trip point, not a continuous number. A comparator (or MCU digital read after conditioning) turns analog into on/off.", "Hysteresis next", "Real systems add Schmitt feedback so noise does not chatter at the trip point — see the Schmitt unit."),
    ...quizKeys(
      p,
      ["A comparator on a sensor voltage…", "Compares it to a threshold", "Always integrates", "Removes the need for ground", "Open-loop amp rails high/low vs −in."],
      ["Crossing the threshold…", "Leaves OUT unchanged", "Flips OUT toward a rail", "Burns the pot always", "That is the decision edge."],
      ["Sensor dividers feed comparators because…", "They already output USB", "They only work at 24 V", "They produce a voltage you can compare", "Analog mid-node → decision."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit has no structural errors.")
  };
}

function commsI2cAssessment() {
  const p = 'learn.project.commsI2c';
  return {
    ...lessonKeys(p, "Open-drain bus", "I²C lines idle high via pull-ups; devices only pull low. Missing pull-ups = a stuck or flaky bus.", "Why it matters", "Sensors, EEPROMs, and displays share this pattern. UART/SPI/RS-485 need their own wiring stories (later ADRs)."),
    ...quizKeys(
      p,
      ["I²C SDA/SCL idle state relies on…", "Pull-up resistors to VCC", "Series inductors only", "Floating pins", "Open-drain needs pull-ups."],
      ["Two devices on one I²C bus share…", "SDA and SCL (plus ground)", "Only TX", "Only CAN_H", "Multi-drop on two wires + GND."],
      ["UART / SPI / RS-485 in this Lab…", "Are fully simulated today", "Need future models (documented gaps)", "Replace I²C pull-ups", "Only I²C wiring is ready in Lab v1."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit has no structural errors.")
  };
}

function adcFrontEndAssessment() {
  const p = 'learn.project.adcFrontEnd';
  return {
    ...lessonKeys(p, "Sample a voltage", "ADC converts Vin into an integer using Vref and bit depth. The front-end job is delivering a clean Vin in range.", "Sensors → ADC", "Dividers, amps, and filters condition the sensor so the MCU pin sees a friendly voltage — not raw milliamp loops."),
    ...quizKeys(
      p,
      ["An ADC primarily converts…", "A voltage into a number", "Only resistance into light", "UART into SPI", "Quantization of Vin vs Vref."],
      ["The wiper voltage here stands in for…", "Vin at an analog pin", "A crystal oscillator", "CAN differential only", "Front-end voltage before digitizing."],
      ["If Vin exceeds Vref…", "Codes keep growing forever", "Nothing happens", "The reading saturates / clips", "Full-scale is Vref."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit has no structural errors.")
  };
}

function adcReferenceAssessment() {
  const p = 'learn.project.adcReference';
  return {
    ...lessonKeys(p, "Vref sets the ruler", "Resolution is Vref / 2^N per count (ideal). A noisy or wrong Vref scales every reading.", "Sampling", "How often you convert (sample rate) is separate from bits — both matter for faithful reconstruction."),
    ...quizKeys(
      p,
      ["ADC full-scale is set by…", "The reference voltage (Vref)", "Only wire gauge", "LED color", "Codes span 0…Vref."],
      ["More bits (same Vref) means…", "Coarser steps", "Finer voltage steps", "No change", "Step ≈ Vref/2^N."],
      ["A resistive divider helps teach…", "Known fractions of a rail", "I²C addressing", "CAN arbitration", "Ratio → predictable mid voltage."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit has no structural errors.")
  };
}

function pwmFilterAssessment() {
  const p = 'learn.project.pwmFilter';
  return {
    ...lessonKeys(p, "Average is the “analog”", "PWM is still digital edges. An RC (or the load’s own filtering) averages them into a DC-ish voltage.", "Vs true DAC", "A real DAC outputs a held level with better linearity/noise. PWM+filter is the teaching stand-in and a common MCU trick."),
    ...quizKeys(
      p,
      ["PWM as a DAC mainly varies…", "Duty cycle", "Only crystal ppm", "Wire color", "Average tracks duty."],
      ["The RC after PWM…", "Low-pass filters / averages the pulses", "Creates I²C addresses", "Removes ground", "That is the pseudo-analog stage."],
      ["Higher duty tends to…", "Lower average voltage", "Stop the pulse source", "Raise the filtered average", "More high-time → higher mean."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Analysis mode is transient.")
  };
}

function relayBjtAssessment() {
  const p = 'learn.project.relayBjt';
  return {
    ...lessonKeys(p, "Why a driver", "Relay coils take tens of mA. A transistor (or MOSFET) lets a small base/gate current control that coil.", "Still need the diode", "Turning the coil off dumps inductive energy — Dfly protects the transistor."),
    ...quizKeys(
      p,
      ["The BJT in this sample…", "Switches the relay coil current", "Is the contact load", "Replaces the flyback diode", "Low-side coil driver."],
      ["Flyback diode belongs…", "Across the coil", "Only across the LED", "In series with VCC forever", "Freewheels inductive kick."],
      ["Contacts are for…", "The load circuit", "Base bias only", "Crystal drive", "Galvanically separate switch path."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit has no structural errors.")
  };
}

function mosfetDriverAssessment() {
  const p = 'learn.project.mosfetDriver';
  return {
    ...lessonKeys(p, "Gate is the control", "Enhancement NMOS conducts when Vgs is high enough. Almost no DC gate current vs BJT base current.", "Industrial cousin", "MOSFET drivers and SSR inputs are this idea scaled — still a control side and a load side."),
    ...quizKeys(
      p,
      ["NMOS low-side switch needs…", "Adequate gate voltage", "Only a floating gate", "No ground return", "Vgs above threshold."],
      ["Gate resistor mainly…", "Limits gate charge current / softens edges", "Sets LED color", "Creates I²C pull-ups", "Series RG is standard practice."],
      ["Pull-down on the gate…", "Holds OFF when drive is open", "Always turns the FET on", "Removes the need for a load", "Defined idle level."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "At least one switch is closed.")
  };
}

function coilProtectAssessment() {
  const p = 'learn.project.coilProtect';
  return {
    ...lessonKeys(p, "L·di/dt", "Current in a coil cannot stop instantly. Without a path, voltage rises until something breaks down.", "Orientation", "Diode cathode toward the positive coil supply so it is reverse-biased in steady on-state."),
    ...quizKeys(
      p,
      ["Flyback diodes protect against…", "Inductive turn-off spikes", "Only ESD on USB", "Crystal drift", "Freewheel path for coil current."],
      ["Diode across a DC coil: cathode faces…", "The positive coil supply", "Always ground only", "The LED anode only", "Reverse-biased when coil is energized."],
      ["Skipping the diode when switching a coil…", "Is always fine", "Risks killing the transistor/driver", "Speeds I²C", "Spike energy needs a path."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit has no structural errors.")
  };
}

function inductiveLoadAssessment() {
  const p = 'learn.project.inductiveLoad';
  return {
    ...lessonKeys(p, "Not a resistor", "Inductive loads fight current change. DC motors look resistive when spinning, but turn-off still spikes.", "Design habit", "Whenever you switch L, plan the freewheel path and the voltage rating of the switch."),
    ...quizKeys(
      p,
      ["Inductive loads need attention at…", "Turn-off (current interruption)", "Only silk-screen fonts", "Only Wi-Fi channels", "That is when energy has nowhere to go."],
      ["A flyback diode on a motor…", "Provides a freewheel path", "Increases PWM frequency magically", "Removes the MOSFET", "Clamps the kick."],
      ["Industrial coils and hobby motors share…", "The need for kick protection", "Identical pinouts always", "Only USB power", "Same physics, different scale."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit has no structural errors.")
  };
}

function estopRelayAssessment() {
  const p = 'learn.project.estopRelay';
  return {
    ...lessonKeys(p, "Series interrupt", "Emergency stop removes energy from the actuator path. A contact in series with the coil is the clearest teaching picture.", "Not a full safety system", "Standards (dual channels, monitoring, category/PL) go far beyond this sample — treat it as the first mental model."),
    ...quizKeys(
      p,
      ["In this sample, SESTOP is…", "In series with the coil supply", "Across the LED only", "An I²C pull-up", "Series path must stay closed."],
      ["Opening SESTOP while S1 is closed…", "Should drop the coil", "Does nothing", "Forces the LED brighter", "Path is broken."],
      ["This Lab sample is…", "A teaching principle, not a certified e-stop", "A SIL-3 certified system", "A replacement for contactors", "Pedagogy first."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit has no structural errors.")
  };
}

function industrial24vAssessment() {
  const p = 'learn.project.industrial24v';
  return {
    ...lessonKeys(p, "Control voltage", "24 V DC is common for industrial I/O and relay coils. Logic may still be 3.3/5 V behind drivers/isolation.", "Same rules scale", "Coil protection, e-stop series paths, and rated contacts still apply — only the numbers change."),
    ...quizKeys(
      p,
      ["This sample’s supply is…", "24 V DC", "Only 3.3 V logic", "Mains AC directly on the LED", "Industrial-ish control rail."],
      ["Flyback at 24 V…", "Still required on the coil", "Is optional decoration", "Only for USB", "Inductive kick scales with the circuit."],
      ["LED series R is larger because…", "Higher voltage would over-current a small R", "LEDs need 24 V across them", "I²C requires it", "Ohm’s law on the load."]
    ),
    ...challengeKeys(p, "Simulation completes without errors.", "Circuit has no structural errors.")
  };
}


function fundamentalsLoopAssessment() {
  const p = 'learn.project.fundamentalsLoop';
  return {
    ...lessonKeys(
      p,
      'Closed loop',
      'Current only flows when there is a complete path from the supply through the load and back.',
      'Ground is a return',
      'In Lab, ground is the shared return reference — every teaching circuit needs it.'
    ),
    ...quizKeys(
      p,
      ['A circuit needs…', 'A closed path for current', 'Only a battery', 'Only an LED', 'Supply and return must connect through the load.'],
      ['Ground in these labs is mainly…', 'Decoration', 'The return reference', 'A second battery', 'It closes the loop back to the supply.'],
      ['If the return wire is missing…', 'Current still flows normally', 'Voltage doubles', 'Nothing useful lights', 'An open loop stops current.']
    ),
    ...challengeKeys(p, 'Simulation completes without errors.', 'LED conducts above ~1 mA.')
  };
}


function ohmExploreAssessment() {
  const p = 'learn.project.ohmExplore';
  return {
    ...lessonKeys(
      p,
      'I ≈ V / R (teaching)',
      'For a fixed supply and LED drop, series R is the knob that sets current.',
      'Probe, don’t guess',
      'Use the ammeter or LED current label after each change.'
    ),
    ...quizKeys(
      p,
      ['If R doubles (same V), current roughly…', 'Halves', 'Doubles', 'Stays identical', 'Ohm’s law: larger R → smaller I.'],
      ['You want less LED current. You usually…', 'Lower series R', 'Raise series R', 'Remove ground', 'More resistance limits current.'],
      ['Best habit after changing R…', 'Skip Run', 'Delete the LED', 'Run and read current', 'Always re-simulate and probe.']
    ),
    ...challengeKeys(p, 'Simulation completes without errors.', 'LED conducts above ~1 mA.')
  };
}


function ledBurnLimitAssessment() {
  const p = 'learn.project.ledBurnLimit';
  return {
    ...lessonKeys(
      p,
      'Current limit',
      'Teaching LEDs burn when average current stays above ~35 mA — a stand-in for real overcurrent damage.',
      'Replace and recover',
      'Burnout is sticky until you replace the part and fix the overload (usually raise R).'
    ),
    ...quizKeys(
      p,
      ['Burnout here means…', 'Too much current for too long', 'Wrong wire color', 'AC mode only', 'Overcurrent trips the teaching model.'],
      ['After a burn you should…', 'Ignore it', 'Replace the LED and raise R', 'Delete ground', 'Recover the part and reduce current.'],
      ['Safer LED current in these labs is often…', 'Hundreds of amps', 'Zero always', 'Around 10–20 mA', 'Typical indicator current range.']
    ),
    ...challengeKeys(p, 'Simulation completes without errors.', 'LED conducts above ~1 mA.')
  };
}

function diodeDirectionAssessment() {
  const p = 'learn.project.diodeDirection';
  return {
    ...lessonKeys(
      p,
      'One-way street',
      'A diode conducts when the anode is more positive than the cathode (forward). Reverse bias blocks current.',
      'Orientation matters',
      'Swap the diode and the LED stays dark — polarity is not optional.'
    ),
    ...quizKeys(
      p,
      [
        'Forward bias means…',
        'Anode more positive than cathode',
        'Cathode more positive always',
        'No voltage ever',
        'Conventional current can flow anode→cathode when forward.'
      ],
      [
        'If you reverse the diode in this sample…',
        'LED gets brighter',
        'LED stays dark (blocked)',
        'Ground disappears',
        'Reverse bias blocks the series path.'
      ],
      [
        'The series resistor still…',
        'Stores charge like a capacitor',
        'Removes the need for ground',
        'Limits current when the diode conducts',
        'Protects the LED in the forward path.'
      ]
    ),
    ...challengeKeys(p, 'Simulation completes without errors.', 'LED conducts above ~1 mA.')
  };
}

function seriesParallelAssessment() {
  const p = 'learn.project.seriesParallel';
  return {
    ...lessonKeys(
      p,
      'Parallel shares voltage',
      'Both LED branches see the same supply voltage. Each branch has its own current set by its series R.',
      'Currents add',
      'Total supply current is roughly the sum of the branch currents — more branches, more load on the battery.'
    ),
    ...quizKeys(
      p,
      [
        'In this parallel sample, both LEDs see…',
        'Approximately the same supply voltage',
        'Half the voltage always',
        'Zero voltage',
        'Parallel branches share the rail voltage.'
      ],
      [
        'If you open one branch…',
        'The other branch also always dies',
        'The other branch can still light',
        'Ground vanishes',
        'Independent paths — one open does not kill the other.'
      ],
      [
        'Total battery current roughly…',
        'Equals the smaller branch only',
        'Is always zero',
        'Adds the branch currents',
        'Parallel loads stack current at the supply.'
      ]
    ),
    ...challengeKeys(p, 'Simulation completes without errors.', 'At least one LED conducts above ~1 mA.')
  };
}

function timeConstantAssessment() {
  const p = 'learn.project.timeConstant';
  return {
    ...lessonKeys(
      p,
      'τ ≈ R×C',
      'One time constant is the characteristic rise/fall scale of an RC network.',
      'By eye on the scope',
      'You do not need a calculator for intuition — stretch R or C and the curve follows.'
    ),
    ...quizKeys(
      p,
      ['τ is roughly…', 'R × C', 'R / C', 'C only', 'Product of resistance and capacitance.'],
      ['To stretch the rise, you can…', 'Increase R or C', 'Only decrease V', 'Remove C', 'Larger τ slows the curve.'],
      ['Which mode shows τ?', 'DC only', 'Import JSON', 'Transient', 'Watch voltage vs time.']
    ),
    ...challengeKeys(p, 'Simulation completes without errors.', 'Use Transient analysis.')
  };
}


function pulseRcAssessment() {
  const p = 'learn.project.pulseRc';
  return {
    ...lessonKeys(
      p,
      'Edges meet RC',
      'A fast pulse through R into C cannot jump instantly — the node rises and falls with τ.',
      'Pulse parameters',
      'Delay, width, and levels set the stimulus; R and C set how faithfully the node follows.'
    ),
    ...quizKeys(
      p,
      ['RC on a pulse mainly…', 'Rounds the edges', 'Creates RF permanently', 'Removes ground', 'τ filters sharp transitions.'],
      ['Best analysis here…', 'DC only', 'Transient', 'Delete wires', 'Time-domain edges need Transient.'],
      ['Larger C with same R…', 'Sharpens the edge', 'Does nothing', 'Slows the edge more', 'Larger τ → slower response.']
    ),
    ...challengeKeys(p, 'Simulation completes without errors.', 'Use Transient analysis.')
  };
}


function acRcLpfAssessment() {
  const p = 'learn.project.acRcLpf';
  return {
    ...lessonKeys(
      p,
      'Low-pass idea',
      'An RC low-pass passes slower changes and attenuates fast ones.',
      'AC vs Transient',
      'AC mode shows steady-state response at one frequency — great for intuition, not a full Bode plot yet.'
    ),
    ...quizKeys(
      p,
      ['A low-pass attenuates…', 'Higher frequencies more', 'Only DC forever', 'Ground only', 'Fast signals see more attenuation.'],
      ['AC analysis here means…', 'Deleting C', 'Single-frequency response', 'Only burnout', 'Probe magnitude at the chosen Hz.'],
      ['Raising frequency on an LPF usually…', 'Raises it forever', 'Removes R', 'Lowers output magnitude', 'Above cutoff, attenuation grows.']
    ),
    ...challengeKeys(p, 'Simulation completes without errors.', 'Use AC analysis.')
  };
}


function ne555PlayAssessment() {
  const p = 'learn.project.ne555Play';
  return {
    ...lessonKeys(
      p,
      'One timer, many loads',
      'The 555 still sets the period; each LED branch is just another load on the output.',
      'Current budget',
      'More LEDs share the output — keep series resistors sensible so branches stay healthy.'
    ),
    ...quizKeys(
      p,
      ['Blink rate is set mainly by…', 'RA, RB, and CT', 'LED color only', 'Wire thickness', 'Astable timing network.'],
      ['Best mode to see blinking…', 'Import only', 'Transient', 'DC forever', 'Time animation needs Transient.'],
      ['More LED branches usually means…', 'Zero current always', 'No ground needed', 'More output loading', 'Each branch draws current when on.']
    ),
    ...challengeKeys(p, 'Simulation completes without errors.', 'Use Transient analysis.')
  };
}


function ne555PotAssessment() {
  const p = 'learn.project.ne555Pot';
  return {
    ...lessonKeys(
      p,
      'Pot as timing R',
      'A potentiometer can stand in for part of the RA/RB network so you can sweep period live.',
      'Teaching model',
      'This is still an astable 555 — the pot is just a convenient knob on τ.'
    ),
    ...quizKeys(
      p,
      ['The pot here mainly adjusts…', 'Blink period', 'Battery chemistry', 'Wire color', 'Timing resistance changes period.'],
      ['Analysis mode for blinking…', 'SEO only', 'Transient', 'DC lock forever', 'Need time to see flashes.'],
      ['Turning the pot changes…', 'Ground symbol', 'I2C address', 'Effective timing R', 'R in the RC timing path.']
    ),
    ...challengeKeys(p, 'Simulation completes without errors.', 'Use Transient analysis.')
  };
}


function pinInputAssessment() {
  const p = 'learn.project.pinInput';
  return {
    ...lessonKeys(
      p,
      'Outputs vs inputs',
      'A digital output actively drives HIGH/LOW. An input only senses — it needs a defined voltage.',
      'Floating is bad',
      'An undriven input can read randomly; pull-ups/pull-downs fix that habit early.'
    ),
    ...quizKeys(
      p,
      ['A floating input is…', 'Undefined / noisy', 'Always safe HIGH', 'A battery', 'No defined drive → unreliable level.'],
      ['Pull-down resistor purpose…', 'Increase RF forever', 'Define LOW when switch open', 'Burn LEDs', 'Holds the node at a known level.'],
      ['Arduino LED sample pin is acting as…', 'An I2C clock only', 'A fuse', 'An output driver', 'It sources/sinks the LED path.']
    ),
    ...challengeKeys(p, 'Simulation completes without errors.', 'LED conducts above ~1 mA.')
  };
}


function i2cAddressAssessment() {
  const p = 'learn.project.i2cAddress';
  return {
    ...lessonKeys(
      p,
      'Shared wires',
      'I²C shares SDA/SCL; the address selects which chip should listen.',
      '0x3C vs 0x3D',
      'Many SSD1306 modules use 0x3C; some straps select 0x3D — same idea, different ID.'
    ),
    ...quizKeys(
      p,
      ['I²C address selects…', 'Which device talks/listens', 'Wire thickness', 'LED color', 'Multiple chips share the bus.'],
      ['Pull-ups on SDA/SCL…', 'Are optional decoration', 'Are required for open-drain I²C', 'Replace ground', 'Idle lines are pulled high.'],
      ['Two OLEDs on one bus need…', 'Identical shorts', 'No VCC', 'Different addresses', 'Unique IDs avoid collisions.']
    ),
    ...challengeKeys(p, 'Simulation completes without errors.', 'Wiring passes circuit checks.')
  };
}


function bjtVsMosAssessment() {
  const p = 'learn.project.bjtVsMos';
  return {
    ...lessonKeys(
      p,
      'BJT mental model',
      'A small base current enables a larger collector current — current controlled switch.',
      'MOSFET mental model',
      'Gate voltage turns the channel on — essentially no DC gate current in the teaching model.'
    ),
    ...quizKeys(
      p,
      ['BJT switch is mainly…', 'Current-controlled at the base', 'Optical only', 'I2C addressed', 'Base current enables collector path.'],
      ['NMOS teaching switch cares about…', 'Base μA only', 'Gate voltage vs source', 'SSD1306 address', 'Vgs turns the channel on.'],
      ['Gate resistor mainly…', 'Stores charge like a huge C', 'Removes ground', 'Limits gate charge spikes / softens drive', 'Series R on the gate node.']
    ),
    ...challengeKeys(p, 'Simulation completes without errors.', 'Switch is closed and load conducts.')
  };
}


function inductiveWhyDiodeAssessment() {
  const p = 'learn.project.inductiveWhyDiode';
  return {
    ...lessonKeys(
      p,
      'Coils fight change',
      'Inductive current wants to keep flowing when you open the switch — voltage spikes without a path.',
      'Diode path',
      'A flyback diode gives that current a safe loop around the coil instead of arcing the switch.'
    ),
    ...quizKeys(
      p,
      ['Flyback diode protects against…', 'Inductive voltage kick', 'LED color drift', 'SEO issues', 'Coil current needs a freewheel path.'],
      ['Diode orientation…', 'Anywhere random', 'Cathode toward coil+', 'Series with battery only', 'Classic anti-parallel across the coil.'],
      ['Without a diode, opening the switch can…', 'Improve I2C', 'Charge the LED forever', 'Spike voltage on the switch node', 'Energy in the coil has nowhere safe to go.']
    ),
    ...challengeKeys(p, 'Simulation completes without errors.', 'Switch closed and load conducts.')
  };
}
