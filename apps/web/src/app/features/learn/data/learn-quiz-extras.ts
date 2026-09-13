/** Extra q4/q5 rows for standard quizzes. Correct options by order: q4→a, q5→b (matches STANDARD_QUIZ_CORRECT_BY_ORDER). */
export type QuizRow = readonly [prompt: string, a: string, b: string, c: string, explain: string];

export const STANDARD_QUIZ_EXTRAS: Record<string, readonly [QuizRow, QuizRow]> = {
  'learn.project.voltageIntro': [
    [
      'Voltage is measured…',
      'Between two points (a difference)',
      'Only as charge stored in a wire',
      'As electron speed alone',
      'A voltmeter reads the potential difference across the chosen nodes.'
    ],
    [
      'A battery sitting on the bench with nothing connected still…',
      'Has zero voltage until current flows',
      'Has its full open-circuit voltage',
      'Must be shorted to show volts',
      'Voltage is potential; current needs a closed path.'
    ]
  ],
  'learn.project.currentIntro': [
    [
      'Current needs…',
      'A closed path',
      'Only a high voltage with no return',
      'An open switch forever',
      'Charge must leave and return through a loop.'
    ],
    [
      'At a junction, the sum of currents into the node…',
      'Is always larger than the sum leaving',
      'Equals the sum leaving (Kirchhoff)',
      'Is unrelated to the branches',
      'Charge is conserved — incoming = outgoing.'
    ]
  ],
  'learn.project.resistanceIntro': [
    [
      'A resistor’s colour bands mainly tell you…',
      'Its resistance value (and tolerance)',
      'Its preferred polarity',
      'How much capacitance it stores',
      'Bands encode ohms; resistors have no polarity.'
    ],
    [
      'Power dissipated in a resistor is…',
      'Only V, never related to I',
      'P = I² · R (or U · I)',
      'Always zero in DC',
      'Current through resistance becomes heat.'
    ]
  ],
  'learn.project.ohmsLaw': [
    [
      'Ohm’s law links…',
      'Voltage, current, and resistance',
      'Only frequency and capacitance',
      'Wire colour and ground symbols',
      'U = I · R is the core relationship.'
    ],
    [
      'For a fixed voltage, larger R means…',
      'Larger current',
      'Smaller current',
      'Unchanged current always',
      'I = U / R — resistance limits current.'
    ]
  ],
  'learn.project.seriesParallelCircuits': [
    [
      'In a series string the current is…',
      'The same through every part',
      'Largest only at the battery',
      'Different in every resistor by definition',
      'One path → one current.'
    ],
    [
      'Parallel branches across a battery each see…',
      'A different random voltage',
      'The same voltage',
      'Zero volts unless in series',
      'Shared nodes share the rail voltage.'
    ]
  ],
  'learn.project.acDc': [
    [
      'DC current…',
      'Flows one way at a steady value',
      'Always reverses every half-cycle',
      'Has no polarity',
      'Steady direction and polarity define DC.'
    ],
    [
      'Frequency f and period T are related by…',
      'f = T',
      'f = 1 / T',
      'f = 2πT only',
      'One cycle per second is 1 Hz; T = 1/f.'
    ]
  ],
  'learn.project.led': [
    [
      'Without a series resistor an LED often…',
      'Draws unsafe current and may burn',
      'Stores charge like a capacitor',
      'Boosts the supply voltage',
      'The LED needs current limiting.'
    ],
    [
      'LED polarity matters because…',
      'LEDs have no anode/cathode',
      'It only conducts when forward-biased',
      'Ground is optional for LEDs',
      'Reverse bias blocks the teaching LED.'
    ]
  ],
  'learn.project.rc': [
    [
      'Just after connecting a discharged capacitor, current is…',
      'Largest (then falls as Vc rises)',
      'Zero forever',
      'Equal to battery voltage in amps',
      'Empty C looks like a short at the first instant.'
    ],
    [
      'After many τ, capacitor voltage approaches…',
      'Zero always',
      'The available DC supply (ideally)',
      'Infinity',
      'Exponential charge settles near the source.'
    ]
  ],
  'learn.project.ledFade': [
    [
      'The fade happens because…',
      'Stored charge leaves through the discharge path',
      'The battery voltage doubles each second',
      'The LED reverses polarity automatically',
      'C discharges; LED current falls with Vc.'
    ],
    [
      'A smaller discharge resistor usually…',
      'Makes the fade last much longer',
      'Shortens the fade (smaller τ)',
      'Removes the need for ground',
      'τ = R×C — less R → faster discharge.'
    ]
  ],
  'learn.project.bc547': [
    [
      'In saturation as a switch, the BJT mainly…',
      'Acts like a closed switch for collector current',
      'Stores energy like a large capacitor',
      'Blocks all current even with base drive',
      'Driven base → low Vce → load on.'
    ],
    [
      'Collector current is controlled by…',
      'Only the LED colour',
      'Base drive (with RB limiting)',
      'AC analysis frequency alone',
      'Small Ib enables larger Ic when on.'
    ]
  ],
  'learn.project.relay': [
    [
      'Energizing the coil…',
      'Pulls the contacts to switch the load path',
      'Deletes the need for a diode forever',
      'Charges the LED capacitor only',
      'Magnetic pull closes (or opens) the contact set.'
    ],
    [
      'The load on the contacts is…',
      'Always the same wire as the coil supply',
      'A separate switched path (isolation idea)',
      'Only the flyback diode',
      'Coil and contact circuits can be distinct.'
    ]
  ],
  'learn.project.nmos': [
    [
      'Enhancement NMOS turns on when…',
      'Gate is high enough vs source',
      'Gate is left floating forever',
      'Drain is disconnected',
      'Vgs above threshold opens the channel.'
    ],
    [
      'A pull-down on the gate…',
      'Forces the FET on when the switch opens',
      'Defines a reliable OFF when drive is open',
      'Replaces the drain resistor',
      'Weak low holds the off state.'
    ]
  ],
  'learn.project.motor': [
    [
      'Compared with an LED, a motor usually…',
      'Draws much larger current',
      'Needs no return path',
      'Is an I²C slave',
      'Actuator loads are heavier than indicators.'
    ],
    [
      'With the low-side switch open, the motor…',
      'Keeps full current from nowhere',
      'Sees no complete path (stops)',
      'Becomes a voltage regulator',
      'Open return → no drive current.'
    ]
  ],
  'learn.project.ne555': [
    [
      'In astable mode the 555 output…',
      'Toggles repeatedly as CT charges/discharges',
      'Stays one DC level forever',
      'Needs I²C addresses',
      'RA/RB/CT set the oscillation.'
    ],
    [
      'Raising RA and RB (C fixed) generally…',
      'Speeds blinking up',
      'Slows the blink rate',
      'Removes ground',
      'Larger timing R stretches the period.'
    ]
  ],
  'learn.project.pushbutton': [
    [
      'A pushbutton is…',
      'Momentary — closed only while pressed',
      'Always latched like a relay contact',
      'A capacitor only',
      'Release opens the path again.'
    ],
    [
      'In Lab, to verify the LED path you…',
      'Remove ground first',
      'Press/hold the button and run DC',
      'Switch to AC only',
      'Closed button completes the loop.'
    ]
  ],
  'learn.project.ldr': [
    [
      'Bright light on an LDR usually…',
      'Lowers its resistance',
      'Raises resistance toward open',
      'Shorts the battery permanently',
      'More light → lower R.'
    ],
    [
      'In this night-light divider, dark tends to…',
      'Turn the LED off always',
      'Raise the sense node and turn the LED on',
      'Remove the MOSFET',
      'High LDR R lifts the gate/divider node.'
    ]
  ],
  'learn.project.buzzer': [
    [
      'The series resistor mainly…',
      'Limits current into the buzzer',
      'Increases supply voltage',
      'Creates I²C pull-ups',
      'Protects the teaching load.'
    ],
    [
      'Closing the switch…',
      'Opens the path forever',
      'Lets current reach the buzzer',
      'Forces AC analysis',
      'Complete loop → sound (in the model).'
    ]
  ],
  'learn.project.motorControl': [
    [
      'The NMOS here mainly…',
      'Switches motor current on the return path',
      'Is an I²C sensor',
      'Replaces the flyback diode',
      'Low-side drive of the actuator.'
    ],
    [
      'Leaving out the flyback diode when switching…',
      'Is always safer',
      'Risks inductive kick on the switch',
      'Only affects LED colour',
      'Coil/motor energy needs a freewheel path.'
    ]
  ],
  'learn.project.arduino': [
    [
      'Pin HIGH on an output LED path…',
      'Can source current to light the LED',
      'Always floats randomly',
      'Removes the need for a resistor',
      'Active drive + series R = indicator on.'
    ],
    [
      'This unit focuses on…',
      'Uploading full firmware toolchains',
      'Wiring digital I/O and levels',
      'RF antenna layout',
      'Teaching model: levels and wiring first.'
    ]
  ],
  'learn.project.i2cOled': [
    [
      'SDA and SCL idle high because of…',
      'Pull-up resistors to the logic supply',
      'Series inductors only',
      'Floating pins by design',
      'Open-drain needs pull-ups.'
    ],
    [
      'The OLED and MCU must share…',
      'Only the clock wire, never ground',
      'Common ground (and proper supply)',
      'No VCC ever',
      'Same reference and power are required.'
    ]
  ],
  'learn.project.halfWave': [
    [
      'The diode in half-wave…',
      'Passes one polarity of the AC cycle',
      'Passes both halves equally',
      'Stores energy like a battery',
      'Single diode = one conducting half.'
    ],
    [
      'Compared with a bridge, half-wave output pulses…',
      'Twice as often for the same f',
      'Once per AC cycle (missing half)',
      'Never need filtering later',
      'Only one half reaches the load.'
    ]
  ],
  'learn.project.bridge': [
    [
      'Both AC half-cycles reach the load as…',
      'The same DC polarity',
      'Alternating polarity forever',
      'Zero average always',
      'Bridge steers both halves one way.'
    ],
    [
      'For 50 Hz AC, bridge pulsating DC is about…',
      '25 Hz',
      '100 Hz',
      '50 kHz',
      'Two pulses per cycle → 2f.'
    ]
  ],
  'learn.project.filterCap': [
    [
      'The filter capacitor’s job is to…',
      'Hold voltage between rectifier peaks',
      'Block all AC forever with no discharge',
      'Replace the diodes',
      'Reservoir supplies the load between peaks.'
    ],
    [
      'Smaller C (same load) usually means…',
      'Less ripple',
      'More ripple (faster droop)',
      'Higher diode Vf',
      'Less stored charge → deeper dips.'
    ]
  ],
  'learn.project.zener': [
    [
      'In regulation the Zener operates in…',
      'Reverse breakdown near Vz',
      'Forward Vf only',
      'Open-circuit forever',
      'Shunt clamp uses reverse breakdown.'
    ],
    [
      'Without series Rs, the Zener would…',
      'Regulate better with infinite current',
      'See uncontrolled current from the supply',
      'Become an inductor',
      'Rs drops excess voltage and limits current.'
    ]
  ],
  'learn.project.vreg7805': [
    [
      'A 7805-style part is a…',
      'Series regulator holding ~5 V out',
      'Shunt Zener only',
      'Boost converter',
      'IN–OUT drop dissipated; OUT regulated.'
    ],
    [
      'Vin must stay…',
      'Below 5 V always',
      'Above OUT by enough dropout headroom',
      'Exactly equal to OUT',
      'Too little headroom → OUT sags.'
    ]
  ],
  'learn.project.reversePolarity': [
    [
      'Correct battery polarity makes the series diode…',
      'Conduct (you pay ~Vf)',
      'Block forever',
      'Short ground to VCC',
      'Forward path enables the load.'
    ],
    [
      'Reversed supply with series diode…',
      'Lights the load brighter',
      'Blocks; load stays off',
      'Doubles the voltage',
      'Protection opens the reverse path.'
    ]
  ],
  'learn.project.fuseProtect': [
    [
      'The teaching fuse opens when…',
      'Current exceeds its iMax rating',
      'Voltage is exactly 5.000 V',
      'Ground is present',
      'Overcurrent trip clears the fault path.'
    ],
    [
      'After a fuse burns you should…',
      'Bypass it with a wire forever',
      'Replace it and fix the overload',
      'Remove all ground symbols',
      'Restore protection; don’t leave the fault.'
    ]
  ],
  'learn.project.ripple': [
    [
      'Ripple on a filtered rail is…',
      'Residual AC variation on the DC',
      'Only the battery ESR label',
      'Gate threshold voltage',
      'Peak-to-peak droop between charge peaks.'
    ],
    [
      'To make ripple easier to see you can…',
      'Use infinite C only',
      'Reduce C or increase load current',
      'Switch to DC-only forever',
      'Faster discharge deepens the dips.'
    ]
  ],
  'learn.project.buck': [
    [
      'A buck stage ideally produces…',
      'A lower average DC than Vin',
      'Always a higher voltage than Vin',
      'Only AC with no inductor',
      'Step-down by chopping and averaging.'
    ],
    [
      'The inductor and capacitor mainly…',
      'Create I²C addresses',
      'Smooth the chopped pulses into DC',
      'Remove the need for a switch',
      'LC averages the PWM into a lower rail.'
    ]
  ],
  'learn.project.boost': [
    [
      'A boost converter can produce…',
      'Vout higher than Vin',
      'Only voltages below Vin',
      'No diode ever',
      'Stored inductor energy is delivered up.'
    ],
    [
      'While the low-side switch is on, the inductor…',
      'Delivers to Vout only',
      'Stores energy (current ramps up)',
      'Acts as an open fuse',
      'L charges toward ground during on-time.'
    ]
  ],
  'learn.project.opampFollower': [
    [
      'In a follower, OUT is wired back to…',
      'The inverting input (−in)',
      'Only the positive rail',
      'Neither input',
      'Unity-gain feedback: −in tracks +in.'
    ],
    [
      'Followers are used mainly to…',
      'Invert and amplify by Rf/Rin',
      'Buffer a source without loading it',
      'Create hysteresis bands',
      'Amp drives the load; Vin is copied.'
    ]
  ],
  'learn.project.opamp': [
    [
      'Ideal closed-loop inverting gain is…',
      '−Rf / Rin',
      '1 + Rf / Rin',
      'Rf − Rin',
      'Gain set by the resistor ratio.'
    ],
    [
      'Virtual ground means −in sits near…',
      'Vcc',
      'The same potential as +in (0 V here)',
      'Vin always',
      'Feedback forces −in ≈ +in.'
    ]
  ],
  'learn.project.opampNonInv': [
    [
      'Ideal non-inverting closed-loop gain is…',
      '1 + Rf / Rg',
      '−Rf / Rg',
      'Rf only',
      'Non-inverting formula includes the +1.'
    ],
    [
      'Output polarity relative to Vin is…',
      'Always inverted',
      'The same sign as Vin',
      'Undefined without a diode',
      'Non-inverting keeps the signal direction.'
    ]
  ],
  'learn.project.opampComparator': [
    [
      'Without negative feedback a comparator…',
      'Saturates high or low vs the inputs',
      'Acts as a precise unity follower',
      'Integrates Vin into a ramp',
      'Huge open-loop gain → rail outputs.'
    ],
    [
      'The threshold here is set by…',
      'Only the LED series R',
      'A resistor divider (and pot for Vin)',
      'I²C address straps',
      'Trip voltage is a DC reference comparison.'
    ]
  ],
  'learn.project.opampSchmitt': [
    [
      'Positive feedback in a Schmitt trigger…',
      'Creates different rising/falling thresholds',
      'Forces unity-gain buffering only',
      'Removes all hysteresis',
      'Output state shifts the trip points.'
    ],
    [
      'Hysteresis mainly reduces…',
      'Supply voltage',
      'Noise chatter around the threshold',
      'LED forward voltage',
      'Need a larger swing to flip back.'
    ]
  ],
  'learn.project.opampSumming': [
    [
      'With equal Rin and Rf, Vout is…',
      '−(V1 + V2)',
      'V1 × V2',
      'V1 − V2 only',
      'Equal-weight inverting summer.'
    ],
    [
      'Each extra input channel needs…',
      'A short from OUT to ground',
      'Its own resistor into the summing node',
      'A separate op-amp always',
      'Currents add at the virtual ground.'
    ]
  ],
  'learn.project.opampIntegrator': [
    [
      'The feedback element that stores the integral is…',
      'A capacitor',
      'Only a wire',
      'An inductor',
      'Cf integrates input current over time.'
    ],
    [
      'A steady DC Vin ideally makes Vout…',
      'Stay fixed at Vin',
      'Ramp (inverting direction)',
      'Oscillate at 50 Hz always',
      'Integral of a constant is a ramp.'
    ]
  ],
  'learn.project.opampDifferentiator': [
    [
      'The series input element emphasises…',
      'dV/dt (edges)',
      'Only steady DC gain',
      'Battery ESR',
      'Capacitor current is C·dV/dt.'
    ],
    [
      'A flat DC level at the input ideally gives…',
      'Maximum DC output forever',
      'Near-zero output',
      'A triangle wave',
      'dV/dt ≈ 0 on a flat line.'
    ]
  ],
  'learn.project.opampActiveFilter': [
    [
      'Well above the cutoff, this active LPF…',
      'Attenuates the output',
      'Boosts gain without limit',
      'Ignores the feedback C',
      'C shunts Rf as frequency rises.'
    ],
    [
      'An active filter vs a passive RC alone can…',
      'Only reduce pin count',
      'Provide isolation and closed-loop gain',
      'Remove the need for AC analysis',
      'Op-amp drives the load and can amplify.'
    ]
  ],
  'learn.project.rcLowPass': [
    [
      'Classic RC LPF topology is…',
      'Series R with shunt C to return',
      'Series C with shunt R only',
      'Two inductors and no R',
      'Low f passes; high f shunts to ground.'
    ],
    [
      'Cutoff fc scales as…',
      '2πRC',
      '1 / (2πRC)',
      'RC²',
      'First-order RC knee frequency.'
    ]
  ],
  'learn.project.rcHighPass': [
    [
      'Classic RC HPF topology is…',
      'Series C with shunt R to return',
      'Series R with shunt C only',
      'A bridge rectifier',
      'Blocks DC; passes high f across R.'
    ],
    [
      'Raising C (R fixed) moves fc…',
      'Higher',
      'Lower',
      'To infinity always',
      'fc = 1/(2πRC) — larger C lowers the knee.'
    ]
  ],
  'learn.project.rlcSeries': [
    [
      'At series resonance, XL and XC…',
      'Cancel (impedance near R)',
      'Add to infinity',
      'Equal the battery ESR only',
      'Reactances cancel; current peaks.'
    ],
    [
      'Resonant frequency fr scales as…',
      'LC',
      '1 / (2π√(LC))',
      '2πR',
      'fr = 1/(2π√(LC)).'
    ]
  ],
  'learn.project.bandPass': [
    [
      'A band-pass network…',
      'Passes a mid band and attenuates outside',
      'Passes all frequencies equally',
      'Only blocks DC forever',
      'Both low and high sides roll off.'
    ],
    [
      'Higher Q typically means…',
      'A wider passband',
      'A narrower peak around fr',
      'No resonance at all',
      'Q sharpens the resonance.'
    ]
  ],
  'learn.project.notchFilter': [
    [
      'A notch (band-stop) filter…',
      'Rejects a narrow frequency band',
      'Amplifies every frequency',
      'Only passes DC',
      'Deep attenuation near the reject tone.'
    ],
    [
      'Far from the notch, |Vout|…',
      'Stays zero forever',
      'Returns toward the pass level',
      'Must oscillate',
      'Rejection is local to the notch frequency.'
    ]
  ],
  'learn.project.voltageDivider': [
    [
      'Unloaded mid voltage is…',
      'V · Rbottom / (Rtop + Rbottom)',
      'Always V regardless of R',
      'V · Rtop only',
      'Ohm’s law on the series string.'
    ],
    [
      'Loading the mid node usually…',
      'Raises Vmid',
      'Pulls Vmid down',
      'Doubles the supply',
      'Load parallels the bottom resistor.'
    ]
  ],
  'learn.project.dividerDesign': [
    [
      'To raise unloaded Vmid you can…',
      'Increase Rbottom relative to Rtop',
      'Short both resistors to zero',
      'Remove the supply',
      'Larger bottom share raises the tap.'
    ],
    [
      'After choosing R1/R2 you should…',
      'Never probe',
      'Run DC and probe Vmid',
      'Delete ground first',
      'Predict, then measure in Lab.'
    ]
  ],
  'learn.project.potDivider': [
    [
      'A pot as a divider uses…',
      'Ends on the rails and wiper as the tap',
      'Only one floating pin',
      'No resistive path',
      'Mechanical position sets the ratio.'
    ],
    [
      'Moving the wiper toward ground…',
      'Raises Vwiper to Vcc',
      'Lowers Vwiper toward 0',
      'Removes the supply',
      'More resistance above the tap → lower ratio.'
    ]
  ],
  'learn.project.measureAc': [
    [
      'AC analysis in Lab is best for…',
      'Magnitude (and phase) at a chosen frequency',
      'Mechanical bounce only',
      'Only DC battery ESR',
      'Linear network solved at f.'
    ],
    [
      'In a linear network, doubling source amplitude…',
      'Zeros every node',
      'Roughly doubles probed magnitude',
      'Inverts ground',
      'Superposition / linearity scales outputs.'
    ]
  ],
  'learn.project.bodeIntuition': [
    [
      'Bode thinking starts with…',
      'How |V| changes as frequency changes',
      'Wire colour charts only',
      'Deleting all capacitors',
      'Frequency response of magnitude (then phase).'
    ],
    [
      'On an RC low-pass, raising f above cutoff…',
      'Raises |Vout| without bound',
      'Lowers output magnitude',
      'Removes ground',
      'Attenuation grows with frequency.'
    ]
  ],
  'learn.project.motorMosfet': [
    [
      'Low-side motor drive places the NMOS…',
      'Between motor return and ground',
      'Only across the battery terminals',
      'In parallel with the gate resistor alone',
      'Classic low-side switch topology.'
    ],
    [
      'When the FET turns off, motor current…',
      'Stops instantly with no path needed',
      'Needs a flyback/freewheel path',
      'Charges the gate capacitance only',
      'Inductive energy must circulate safely.'
    ]
  ],
  'learn.project.motorPwm': [
    [
      'PWM motor control mainly varies…',
      'Duty cycle (on-time fraction)',
      'Wire insulation colour',
      'Only diode Vf forever',
      'Average voltage tracks duty.'
    ],
    [
      'Switching (vs a linear rheostat) keeps the FET…',
      'In the linear region dissipating max heat always',
      'Mostly fully on or fully off (lower loss)',
      'Floating with no gate drive',
      'PWM avoids continuous half-on dissipation.'
    ]
  ],
  'learn.project.motorSpeed': [
    [
      'To spin the teaching motor faster you usually…',
      'Increase PWM duty cycle',
      'Remove the flyback diode',
      'Delete ground',
      'More on-time → higher average voltage.'
    ],
    [
      'Lowering duty cycle tends to…',
      'Always burn the FET',
      'Reduce average motor voltage / speed',
      'Raise speed forever',
      'Less on-time → weaker drive.'
    ]
  ],
  'learn.project.motorFlyback': [
    [
      'Flyback diodes protect against…',
      'Inductive voltage spikes at turn-off',
      'Only LED colour drift',
      'USB enumeration timing',
      'They freewheel L·di/dt energy.'
    ],
    [
      'On a low-side motor switch, diode cathode faces…',
      'Ground only',
      'Toward +V across the motor',
      'The gate resistor',
      'Standard freewheel orientation.'
    ]
  ],
  'learn.project.hBridge': [
    [
      'Forward drive uses…',
      'One diagonal pair of switches',
      'All four switches closed together',
      'Only the flyback LEDs',
      'Diagonal path through the motor.'
    ],
    [
      'Both switches on one leg closed means…',
      'Safe normal reverse',
      'Shoot-through (rail short)',
      'Required startup',
      'High and low both on = disaster.'
    ]
  ],
  'learn.project.motorDirection': [
    [
      'To reverse with an H-bridge you…',
      'Close the opposite diagonal pair',
      'Short both supply rails',
      'Remove the motor',
      'Other diagonal flips current direction.'
    ],
    [
      'Dead time is…',
      'Extra LED brightness',
      'A brief both-off gap when changing direction',
      'USB delay only',
      'Prevents leg shoot-through during commutation.'
    ]
  ],
  'learn.project.pullUpDown': [
    [
      'A pull-up resistor…',
      'Holds the node high when the switch is open',
      'Always shorts VCC to ground',
      'Replaces the battery',
      'Weak HIGH defines the idle level.'
    ],
    [
      'Closing a switch to ground on a pull-up input…',
      'Leaves the node floating',
      'Drives the node strongly low',
      'Raises VCC',
      'Strong low overrides the weak pull-up.'
    ]
  ],
  'learn.project.debounce': [
    [
      'Switch bounce causes…',
      'Multiple edges from one physical press',
      'Higher battery voltage',
      'Perfect single edges always',
      'Contacts chatter for milliseconds.'
    ],
    [
      'An RC on the switch node…',
      'Increases bounce amplitude',
      'Low-pass filters / softens chatter',
      'Removes the need for ground',
      'Analog debounce idea.'
    ]
  ],
  'learn.project.debounceIdea': [
    [
      'Debounce exists because…',
      'One press is not one clean electrical edge',
      'Batteries double voltage on press',
      'Ground symbols are optional',
      'Mechanical contacts chatter.'
    ],
    [
      'Firmware debounce usually…',
      'Deletes the switch hardware',
      'Ignores edges until the contact settles',
      'Raises supply to 100 V',
      'Wait a few ms for a stable level.'
    ]
  ],
  'learn.project.sensorLdr': [
    [
      'An LDR primarily changes…',
      'Resistance with light level',
      'Only battery ESR',
      'Wire colour',
      'Photoresistance tracks illumination.'
    ],
    [
      'Pairing the LDR with a fixed resistor makes…',
      'A short across VCC',
      'A voltage divider (usable signal)',
      'An antenna',
      'Mid-node voltage is what you read.'
    ]
  ],
  'learn.project.sensorPot': [
    [
      'A pot used as a position sensor outputs…',
      'A tap voltage between the rails',
      'Only digital pulses',
      'RF only',
      'Wiper is the analog signal.'
    ],
    [
      'Heavy load on the wiper…',
      'Never matters electrically',
      'Can distort the expected voltage',
      'Raises VCC safely',
      'Loading parallels the lower arm.'
    ]
  ],
  'learn.project.ntcDivider': [
    [
      'An NTC in a divider mainly provides…',
      'A voltage that tracks temperature',
      'Only PWM edges',
      'Galvanic isolation',
      'R(T) becomes Vmid.'
    ],
    [
      'If bottom-arm NTC resistance falls (warmer)…',
      'Vmid must rise to VCC',
      'Vmid usually falls',
      'The battery shorts',
      'Lower bottom R lowers the divider ratio.'
    ]
  ],
  'learn.project.sensorThreshold': [
    [
      'A comparator on a sensor voltage…',
      'Compares it to a threshold and rails OUT',
      'Always integrates Vin',
      'Removes the need for ground',
      'Analog → on/off decision.'
    ],
    [
      'Crossing the trip point…',
      'Leaves OUT unchanged',
      'Flips OUT toward a supply rail',
      'Burns the pot always',
      'That edge is the threshold decision.'
    ]
  ],
  'learn.project.commsI2c': [
    [
      'I²C SDA/SCL idle high via…',
      'Pull-up resistors to VCC',
      'Series inductors only',
      'Floating pins',
      'Open-drain needs pull-ups.'
    ],
    [
      'Multiple I²C devices share…',
      'Only independent TX wires',
      'The same SDA and SCL (plus ground)',
      'Only CAN_H',
      'Multi-drop on two signal wires + GND.'
    ]
  ],
  'learn.project.adcFrontEnd': [
    [
      'An ADC primarily converts…',
      'A voltage into a digital code',
      'Only resistance into light',
      'UART into SPI',
      'Quantization of Vin relative to Vref.'
    ],
    [
      'If Vin exceeds Vref…',
      'Codes keep growing without limit',
      'The reading saturates / clips at full scale',
      'Nothing happens ever',
      'Full-scale is set by the reference.'
    ]
  ],
  'learn.project.adcReference': [
    [
      'ADC full-scale range is set by…',
      'The reference voltage (Vref)',
      'Only wire gauge',
      'LED colour',
      'Codes span roughly 0…Vref.'
    ],
    [
      'More bits at the same Vref means…',
      'Coarser voltage steps',
      'Finer voltage steps',
      'No change in resolution',
      'Step size ≈ Vref / 2^N.'
    ]
  ],
  'learn.project.pwmFilter': [
    [
      'PWM as a pseudo-DAC mainly varies…',
      'Duty cycle',
      'Only crystal ppm',
      'Wire colour',
      'Average voltage tracks duty.'
    ],
    [
      'The RC after the PWM…',
      'Creates I²C addresses',
      'Low-pass filters / averages the pulses',
      'Removes ground',
      'That is the teaching analog stage.'
    ]
  ],
  'learn.project.relayBjt': [
    [
      'The BJT in this sample…',
      'Switches the relay coil current',
      'Is the contact load itself',
      'Replaces the flyback diode',
      'Low-side coil driver from a small base current.'
    ],
    [
      'Flyback diode belongs…',
      'Only across the indicator LED',
      'Across the coil',
      'In series with VCC forever',
      'Freewheels inductive kick when the coil turns off.'
    ]
  ],
  'learn.project.mosfetDriver': [
    [
      'NMOS low-side switching needs…',
      'Adequate gate-to-source voltage',
      'Only a floating gate',
      'No ground return',
      'Vgs above threshold turns the channel on.'
    ],
    [
      'A gate pull-down…',
      'Always forces the FET on',
      'Holds OFF when the drive is open',
      'Removes the need for a load',
      'Defined idle level on the gate.'
    ]
  ],
  'learn.project.coilProtect': [
    [
      'Flyback diodes protect against…',
      'Inductive turn-off voltage spikes',
      'Only ESD on USB',
      'Crystal drift',
      'Freewheel path for coil current.'
    ],
    [
      'Across a DC coil, diode cathode faces…',
      'Always ground only',
      'The positive coil supply',
      'The LED anode only',
      'Reverse-biased while the coil is energized.'
    ]
  ],
  'learn.project.inductiveLoad': [
    [
      'Inductive loads need special care at…',
      'Turn-off (current interruption)',
      'Only silk-screen fonts',
      'Only Wi-Fi channels',
      'Energy has nowhere to go when the path opens.'
    ],
    [
      'A flyback diode on a motor…',
      'Removes the MOSFET',
      'Provides a freewheel path for kick',
      'Increases PWM frequency magically',
      'Clamps the inductive spike.'
    ]
  ],
  'learn.project.estopRelay': [
    [
      'In this sample SESTOP sits…',
      'In series with the coil supply path',
      'Only across the LED',
      'As an I²C pull-up',
      'Series interrupt removes energy.'
    ],
    [
      'Opening SESTOP while the coil switch is closed…',
      'Forces the LED brighter',
      'Should drop / de-energize the coil',
      'Does nothing electrical',
      'Broken series path → no coil current.'
    ]
  ],
  'learn.project.industrial24v': [
    [
      'This sample’s control rail is…',
      '24 V DC',
      'Only 3.3 V logic directly on the coil',
      'Mains AC on the LED',
      'Industrial-style control voltage.'
    ],
    [
      'At 24 V, flyback on the coil is…',
      'Optional decoration',
      'Still required',
      'Only for USB devices',
      'Inductive kick physics does not go away.'
    ]
  ],
  'learn.project.ohmExplore': [
    [
      'With supply fixed, doubling series R roughly…',
      'Halves the current',
      'Doubles the current',
      'Leaves current identical',
      'I ≈ V/R in the teaching loop.'
    ],
    [
      'After changing R you should…',
      'Skip Run forever',
      'Run again and read the current',
      'Delete the LED',
      'Probe after every change.'
    ]
  ],
  'learn.project.ledBurnLimit': [
    [
      'Teaching LED burnout means…',
      'Too much current for too long',
      'Wrong wire colour only',
      'AC mode alone',
      'Overcurrent trips the model.'
    ],
    [
      'A safer indicator current here is often…',
      'Hundreds of amps',
      'Around 10–20 mA',
      'Zero always',
      'Typical LED indicator range.'
    ]
  ],
  'learn.project.diodeDirection': [
    [
      'Forward bias means…',
      'Anode more positive than cathode',
      'Cathode more positive always',
      'No voltage across the diode',
      'Conventional current can flow anode→cathode.'
    ],
    [
      'Reversing the diode in the sample…',
      'Makes the LED brighter',
      'Blocks the path; LED stays dark',
      'Removes ground',
      'Reverse bias opens the series loop.'
    ]
  ],
  'learn.project.seriesParallel': [
    [
      'Parallel LED branches share…',
      'Approximately the same supply voltage',
      'Half the voltage by definition',
      'Zero volts',
      'Shared rail nodes → same V on each branch.'
    ],
    [
      'Opening one parallel branch…',
      'Always kills every other branch',
      'Leaves the other branch able to light',
      'Removes ground from the board',
      'Independent paths fail independently.'
    ]
  ],
  'learn.project.seriesLeds': [
    [
      'Series LEDs share…',
      'The same loop current',
      'Independent branch currents',
      'No need for any resistor',
      'One current through every series part.'
    ],
    [
      'If one LED in the series string opens…',
      'The others still light alone',
      'The whole string goes dark',
      'Nothing changes',
      'An open breaks the single loop.'
    ]
  ],
  'learn.project.timeConstant': [
    [
      'The time constant τ is roughly…',
      'R × C',
      'R / C',
      'C only',
      'Product of resistance and capacitance.'
    ],
    [
      'To stretch the rise/fall you can…',
      'Only decrease the supply',
      'Increase R or C',
      'Remove C entirely',
      'Larger τ slows the exponential.'
    ]
  ],
  'learn.project.pulseRc': [
    [
      'RC on a pulse mainly…',
      'Rounds / slows the edges',
      'Creates RF permanently',
      'Removes ground',
      'τ filters sharp transitions.'
    ],
    [
      'Larger C with the same R…',
      'Sharpens the edge',
      'Slows the edge more',
      'Does nothing to τ',
      'Larger τ → slower response to the pulse.'
    ]
  ],
  'learn.project.acRcLpf': [
    [
      'A low-pass attenuates…',
      'Higher frequencies more',
      'Only DC forever',
      'Ground symbols only',
      'Fast signals see more attenuation.'
    ],
    [
      'Raising frequency on an LPF usually…',
      'Raises |Vout| forever',
      'Lowers output magnitude',
      'Removes R',
      'Above cutoff, attenuation grows.'
    ]
  ],
  'learn.project.ne555Play': [
    [
      'Blink rate is set mainly by…',
      'RA, RB, and CT',
      'LED colour only',
      'Wire thickness',
      'Astable timing network.'
    ],
    [
      'More LED branches on OUT usually mean…',
      'Zero current always',
      'More loading on the timer output',
      'No ground needed',
      'Each branch draws current when high.'
    ]
  ],
  'learn.project.ne555Pot': [
    [
      'The pot in this sample mainly adjusts…',
      'Blink period via timing resistance',
      'Battery chemistry',
      'Wire colour',
      'Changing R changes τ and the period.'
    ],
    [
      'Turning the pot changes…',
      'Ground symbol meaning',
      'Effective timing R in the network',
      'I²C address',
      'Mechanical knob on the RC timing path.'
    ]
  ],
  'learn.project.pinInput': [
    [
      'A floating digital input is…',
      'Undefined / noisy',
      'Always a guaranteed safe HIGH',
      'A battery substitute',
      'No defined drive → unreliable reads.'
    ],
    [
      'A pull-down’s job is to…',
      'Increase RF forever',
      'Define LOW when the switch is open',
      'Burn LEDs intentionally',
      'Holds a known idle level.'
    ]
  ],
  'learn.project.i2cAddress': [
    [
      'An I²C address selects…',
      'Which device should listen/talk',
      'Wire thickness',
      'LED colour',
      'Many chips share SDA/SCL.'
    ],
    [
      'Two OLEDs on one bus need…',
      'Identical addresses forever',
      'Different addresses',
      'No VCC',
      'Unique IDs avoid bus collisions.'
    ]
  ],
  'learn.project.spiVsI2c': [
    [
      'I²C typically needs…',
      'Two shared wires plus device addresses',
      'One CS line per clock forever',
      'No pull-ups ever',
      'SDA/SCL shared; address selects the chip.'
    ],
    [
      'SPI usually adds…',
      'Nothing beyond I²C wiring',
      'A chip-select (CS) per device',
      'Only a single global address field',
      'CS picks the slave without an address byte.'
    ]
  ],
  'learn.project.i2cMultiSlave': [
    [
      'Adding a second I²C slave usually…',
      'Reuses the same SDA/SCL wires',
      'Needs a brand-new bus pair per chip',
      'Removes all pull-ups',
      'Shared bus; addresses distinguish chips.'
    ],
    [
      'Two devices with the same address…',
      'Are fine forever',
      'Cause collisions / unreliable replies',
      'Increase VCC automatically',
      'Both may answer the same ID.'
    ]
  ],
  'learn.project.bjtVsMos': [
    [
      'A BJT switch is mainly…',
      'Current-controlled at the base',
      'Optical only',
      'I²C addressed',
      'Base current enables the collector path.'
    ],
    [
      'An NMOS teaching switch cares about…',
      'Base μA only',
      'Gate voltage versus source',
      'SSD1306 address',
      'Vgs turns the channel on — almost no DC gate current.'
    ]
  ],
  'learn.project.inductiveWhyDiode': [
    [
      'A flyback diode protects against…',
      'Inductive voltage kick at turn-off',
      'LED colour drift',
      'SEO issues',
      'Coil current needs a freewheel path.'
    ],
    [
      'Without a diode, opening the switch can…',
      'Improve I²C timing',
      'Spike voltage on the switch node',
      'Charge the LED forever safely',
      'Stored coil energy has nowhere safe to go.'
    ]
  ]
};
