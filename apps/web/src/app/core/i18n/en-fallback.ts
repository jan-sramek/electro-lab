/**
 * Embedded English fallback — keep in sync with
 * services/learning-api/Seed/TranslationSeeder.cs English dictionary.
 */
import { LEARN_ASSESSMENT_I18N } from '../../features/learn/data/learn-assessment-i18n';

export const EN_FALLBACK: Record<string, string> = {
  'shell.brand': 'Electro Lab',
  'shell.nav.lab': 'Lab',
  'shell.nav.learn': 'Learn',
  'shell.nav.account': 'Account',

  'diag.empty_circuit': 'Place parts from the palette, then wire them and add Ground.',
  'diag.no_ground': 'Add a Ground symbol and wire it to your circuit return path.',
  'diag.ground_disconnected': 'Ground is not connected — wire Ground to the circuit.',
  'diag.floating_component':
    'Unwired parts: {ids}. Connect every pin you need, or delete unused parts.',
  'diag.dc_capacitor_island':
    'In DC mode capacitors are open. Use Transient, or add a resistive path.',
  'diag.shorted_voltage_source':
    'Voltage source shorted ({ids}): both terminals share a net. Separate the pins.',
  'diag.singular_fallback':
    'Circuit cannot be solved. Check Ground is wired and there are no floating parts.',
  'diag.ac_nonlinear_open':
    'Nonlinear / switching parts are treated as open in AC ({ids}). Use Transient for LEDs, diodes, transistors, relays, motors, and MCU pins.',
  'diag.ac_source_tran_no_freq':
    'AC source needs Frequency (Hz) > 0 for a sine wave in Transient. Without it the source is 0 V.',
  'diag.switch_inductor_spike':
    'Switching an inductor can make large voltage spikes (ideal teaching model). Use care with openAt/closeAt timing.',
  'diag.dc_rc_needs_tran':
    'Capacitors need Transient analysis for charge and discharge — switch to Transient and set tStop long enough (e.g. 6 s for LED fade).',

  'lab.title': 'Circuit Lab',
  'lab.fromLearn': 'From Learn:',
  'lab.backToLearnSteps': '← Back to steps',
  'lab.intro': 'Build a schematic, wire pins, and run DC, transient, or AC analysis.',
  'lab.hint':
    'Drag parts from the palette onto the canvas (or click a part, then click to place). Wire pin-to-pin, then Run. When the circuit solves, green dashes on wires show current flowing. An LED is bright near 20 mA; above ~35 mA it burns out and becomes an open circuit (fire graphic) until you replace it — always use enough series resistance. Drag an empty area to box-select; drag any selected part to move the group. Ctrl/Cmd-click or Ctrl/Cmd-drag to add to the selection. Click a wire to select it, then Delete. Example circuits open in a new tab. Ctrl+D duplicate; Ctrl+C/V copy/paste. Wheel to zoom; Shift-drag to pan. Drag on the scope to scrub time.',
  'lab.hint.challenge':
    'Build the circuit described in Learn from an empty canvas. Place parts, wire pin-to-pin, pick the right analysis mode, Run, then Check my work.',
  'lab.hint.wire':
    'Wire mode: click a pin to start (blue preview follows the cursor), then click another pin — or click an existing wire to make a T-junction. In Select mode, drag a wire to reshape it; double-click a wire to reset auto-route. Click empty canvas to cancel.',
  'lab.hint.probe':
    'Probe mode: click a part body to read branch current (mA), or a net/wire node for voltage (V). The value appears in the status banner. In Transient, scrub the scope — the probe and canvas follow that time.',
  'lab.hint.led':
    'LED series: Run DC. Current flows battery → resistor → LED → ground. Try lowering the resistor until the LED burns out (~35 mA), then Replace LED and restore ~220 Ω.',
  'lab.hint.ledFade':
    'LED fade: 1) Keep the switch Closed and Run — the capacitor charges and the LED lights. 2) Uncheck Closed. 3) Run again — the capacitor discharges through the resistor and the LED fades. After the switch opens, current only flows on the LED side (that is expected).',
  'lab.hint.rc':
    'RC charge: Transient from 0 V. Scrub the scope to watch the capacitor voltage rise toward the supply through R. Compare τ ≈ R·C with the curve.',
  'lab.hint.pot':
    'Potentiometer divider: Run DC, then change Wiper (0–1) in the inspector — the mid-point voltage tracks the wiper. Probe the wiper net to read it.',
  'lab.hint.pulse':
    'Pulse into RC: Transient — the pulse source steps high then low. Scrub through the edges to see charge and discharge on the capacitor.',
  'lab.hint.opamp':
    'Op-amp inverting amp (teaching model with ±15 V rails by default). Run DC — gain ≈ −Rf/Rin. Probe the output; try changing Rf, Rin, or rail limits in the inspector.',
  'lab.hint.ac':
    'AC RC low-pass: set analysis to AC and pick a frequency. Below the cutoff the load sees more of the source; far above it, the capacitor shunts AC to ground. Nonlinear parts are open in AC.',
  'lab.hint.bjt':
    'BC547 LED switch: Run DC with S1 Closed — base current turns Q1 on and the LED lights. Open S1 (uncheck Closed) and Run again — the LED goes out. Probe AM1 for collector current; try changing RB.',
  'lab.hint.relay':
    'Relay + diode: Run DC with S1 Closed — coil energizes K1 and the LED lights through the contacts. Dfly is the flyback diode across the coil (cathode to coil+). Open S1 — contacts open and the LED goes out.',
  'lab.hint.nmos':
    'NMOS LED switch: Run DC with S1 Closed — gate high, LED on. Open S1 (RPD pulls the gate down) and Run again — LED off. Drain overcurrent or |Vgs| ≳ 20 V burns M1 open.',
  'lab.hint.ne555':
    'NE555 astable: Transient auto-runs — three LEDs blink from OUT right away. Watch playback or scrub OUT / CT on the scope. Too little R1–R3 or Vcc above ~18 V burns the timer open.',
  'lab.hint.ne555Pot':
    'NE555 + pot blink: Transient auto-runs — one LED blinks from OUT. Change POT1 Wiper to change Rb and the blink rate (higher → slower).',
  'lab.hint.christmasTree':
    'NE555 Christmas tree: Transient auto-runs — ten LEDs blink in a pyramid from OUT. Watch playback or probe any LED. Too little R1–R10 or high Vcc burns the timer open.',
  'lab.hint.pushbutton':
    'Pushbutton LED: hold BTN1 on the canvas or the Hold to press control in the inspector — LED lights while pressed.',
  'lab.hint.ldr':
    'LDR night-light: Run DC — with Light low the LED is on. Raise Light on LDR1 toward 1 and Run again — gate falls and the LED goes dark.',
  'lab.hint.buzzer':
    'Buzzer + button: hold BTN1 on the canvas or in the inspector — BZ1 draws current (teaching “sound”). Release — silent.',
  'lab.hint.motor':
    'NMOS + motor: Run DC with S1 closed — motor current flows; Dfly is the flyback diode. Open S1 — motor stops.',
  'lab.hint.arduino':
    'Arduino LED: D2 is a teaching digital pin (Output / HIGH). Run DC — LED lights. Set Level to LOW or Mode to Input and Run again.',
  'lab.hint.i2cOled':
    'I2C OLED: Run DC — with VCC powered, OLED1 shows “Hello” and SDA/SCL sit near 5 V via the pull-ups. Probe a bus line; remove a pull-up to see idle level collapse.',
  'lab.hint.halfWave':
    'Half-wave rectifier: Run Transient — cycles loop on the canvas. Current flows only on positive half-cycles; the reverse half stays idle (diode blocks). Probe R1.',
  'lab.hint.bridge':
    'Bridge rectifier: Run Transient — cycles loop. Both AC half-cycles feed the load as pulsating DC (four diodes).',
  'lab.hint.filterCap':
    'Filter capacitor: Run Transient — cycles loop; C1 smooths the rectified peaks. Try smaller C or heavier R to see more ripple.',
  'lab.hint.zener':
    'Zener regulator: Run DC and probe JM — voltage should sit near Vz (~5.1 V) despite a 12 V supply.',
  'lab.hint.vreg7805':
    '7805 regulator: Run DC — OUT should be ~5 V with 12 V in. Lower Vin toward dropout to see regulation fail.',
  'lab.hint.reversePolarity':
    'Reverse-polarity diode: Run DC — LED on. Flip the battery polarity (swap thinking) — series diode blocks reverse connection.',
  'lab.hint.fuseProtect':
    'Fuse protection: Run DC with S1 open — safe current through RL. Close S1 and Run — F1 opens (short across RL). Replace F1 (S1 opens automatically) and Run again.',
  'lab.hint.ripple':
    'Ripple: Run Transient and probe JT — residual AC on the filtered DC is the ripple. Smaller C / heavier load → more ripple.',
  'lab.hint.buck':
    'Buck converter: Run Transient — PWM loops on the canvas. On: current through M1→L1; off: freewheel in Dfly. Gate wires stay idle. Probe JO; change pulse width (duty) to change the average.',
  'lab.hint.boost':
    'Boost converter: Run Transient — PWM loops on the canvas. On: L1 charges via M1; off: diode feeds the load. Gate / VP1 wires stay idle (like buck). Probe JO; longer on-time stores more energy in L1.',
  'lab.toolbar.select': 'Select',
  'lab.toolbar.wire': 'Wire',
  'lab.toolbar.probe': 'Probe',
  'lab.toolbar.tools': 'Canvas tools',
  'lab.toolbar.dc': 'DC',
  'lab.toolbar.transient': 'Transient',
  'lab.toolbar.ac': 'AC',
  'lab.toolbar.tStop': 'tStop (s)',
  'lab.toolbar.dt': 'dt (s)',
  'lab.toolbar.initFromDc': 'Init from DC',
  'lab.toolbar.freq': 'f (Hz)',
  'lab.toolbar.undo': 'Undo',
  'lab.toolbar.redo': 'Redo',
  'lab.toolbar.duplicate': 'Duplicate',
  'lab.toolbar.delete': 'Delete',
  'lab.toolbar.presets': 'Open example…',
  'lab.toolbar.group.basics': 'Basics & RC',
  'lab.toolbar.group.power': 'Power supplies',
  'lab.toolbar.group.opamps': 'Op-amps',
  'lab.toolbar.group.filters': 'Filters & AC',
  'lab.toolbar.group.switching': 'Transistors & relays',
  'lab.toolbar.group.motors': 'Motors',
  'lab.toolbar.group.timing': 'Timing (555)',
  'lab.toolbar.group.input': 'Input & sensors',
  'lab.toolbar.group.actuators': 'Actuators',
  'lab.toolbar.group.mcu': 'MCU & buses',
  'lab.toolbar.group.industrial': 'Industrial',
  'lab.toolbar.ledPreset': 'LED series (DC)',
  'lab.toolbar.ledFadePreset': 'LED fade (capacitor)',
  'lab.toolbar.rcPreset': 'RC charge (transient)',
  'lab.toolbar.potPreset': 'Potentiometer divider (DC)',
  'lab.toolbar.pulsePreset': 'Pulse into RC (transient)',
  'lab.toolbar.opampPreset': 'Op-amp inverting (DC)',
  'lab.toolbar.acPreset': 'AC RC low-pass',
  'lab.toolbar.bjtPreset': 'BC547 LED switch (DC)',
  'lab.toolbar.relayPreset': 'Relay + flyback diode (DC)',
  'lab.toolbar.nmosPreset': 'NMOS LED switch (DC)',
  'lab.toolbar.ne555Preset': 'NE555 astable (transient)',
  'lab.toolbar.ne555PotPreset': 'NE555 + pot blink (transient)',
  'lab.toolbar.christmasTreePreset': 'NE555 Christmas tree (transient)',
  'lab.toolbar.pushbuttonPreset': 'Pushbutton LED (DC)',
  'lab.toolbar.ldrPreset': 'LDR night-light (DC)',
  'lab.toolbar.buzzerPreset': 'Buzzer + button (DC)',
  'lab.toolbar.motorPreset': 'NMOS + DC motor (DC)',
  'lab.toolbar.arduinoPreset': 'Arduino LED pin (DC)',
  'lab.toolbar.i2cOledPreset': 'I2C OLED SSD1306 (DC)',
  'lab.toolbar.halfWavePreset': 'Half-wave rectifier (transient)',
  'lab.toolbar.bridgePreset': 'Bridge rectifier (transient)',
  'lab.toolbar.filterCapPreset': 'Filter capacitor (transient)',
  'lab.toolbar.zenerPreset': 'Zener regulator (DC)',
  'lab.toolbar.vreg7805Preset': '7805 linear regulator (DC)',
  'lab.toolbar.reversePolarityPreset': 'Reverse-polarity diode (DC)',
  'lab.toolbar.fuseProtectPreset': 'Fuse + short protection (DC)',
  'lab.toolbar.ripplePreset': 'Ripple measurement (transient)',
  'lab.toolbar.buckPreset': 'Buck converter (transient)',
  'lab.toolbar.boostPreset': 'Boost converter (transient)',
  'lab.toolbar.export': 'Export',
  'lab.toolbar.import': 'Import',
  'lab.toolbar.new': 'New',
  'lab.toolbar.run': 'Run',
  'lab.toolbar.running': 'Running…',

  'lab.slots.saveAs': 'Save as',
  'lab.slots.namePlaceholder': 'Circuit name',
  'lab.slots.save': 'Save',

  'lab.tabs.aria': 'Circuit tabs',
  'lab.tabs.add': 'New circuit tab',
  'lab.tabs.close': 'Close circuit tab',
  'lab.tabs.menu': 'Tab actions',
  'lab.tabs.pin': 'Pin tab',
  'lab.tabs.unpin': 'Unpin tab',
  'lab.tabs.pinCurrent': 'Pin current tab',
  'lab.tabs.unpinCurrent': 'Unpin current tab',
  'lab.tabs.pinned': 'Pinned',
  'lab.tabs.closeOthers': 'Close other tabs',
  'lab.tabs.closeUnpinned': 'Close unpinned tabs',

  'lab.palette.title': 'Parts',
  'lab.palette.dragHint': 'Drag a symbol onto the canvas, or click then click to place. Hover a part for its teaching note.',
  'lab.palette.group.sources': 'Sources',
  'lab.palette.group.passives': 'Passives',
  'lab.palette.group.diodes': 'Diodes & LEDs',
  'lab.palette.group.power': 'Protection & regulators',
  'lab.palette.group.transistors': 'Transistors',
  'lab.palette.group.switches': 'Switches',
  'lab.palette.group.actuators': 'Actuators',
  'lab.palette.group.ics': 'ICs',
  'lab.palette.group.meters': 'Meters',
  'lab.palette.group.ground': 'Ground',

  'lab.symbol.battery': 'Battery',
  'lab.symbol.ac_source': 'AC source',
  'lab.symbol.resistor': 'Resistor',
  'lab.symbol.led': 'LED',
  'lab.symbol.diode': 'Diode',
  'lab.symbol.zener': 'Zener diode',
  'lab.symbol.fuse': 'Fuse',
  'lab.symbol.vreg7805': '7805 regulator',
  'lab.symbol.switch': 'Switch',
  'lab.symbol.relay': 'Relay',
  'lab.symbol.bjt_npn': 'NPN BJT',
  'lab.symbol.bc547': 'BC547',
  'lab.symbol.nmos': 'NMOS',
  'lab.symbol.ne555': 'NE555',
  'lab.symbol.pushbutton': 'Pushbutton',
  'lab.symbol.ldr': 'LDR',
  'lab.symbol.buzzer': 'Buzzer',
  'lab.symbol.dc_motor': 'DC motor',
  'lab.symbol.arduino_dio': 'Arduino pin',
  'lab.symbol.arduino_i2c': 'Arduino I2C',
  'lab.symbol.ssd1306': 'SSD1306 OLED',
  'lab.symbol.op_amp': 'Op-amp',
  'lab.modelNote.op_amp':
    'Teaching model: finite-gain VCVS with clamp to vMax/vMin (default ±15 V). AC stays linear (unclamped).',
  'lab.modelNote.bjt_npn':
    'Teaching model: base diode + small internal rb + collector–emitter on-resistance (not SPICE). Use an external base resistor — Ib above ~25 mA burns it open.',
  'lab.modelNote.bc547':
    'BC547-style NPN (TO-92). Teaching switch model — use a base resistor; Ib above ~25 mA burns the part open (not a datasheet/SPICE transistor).',
  'lab.modelNote.nmos':
    'Teaching N-channel MOSFET switch (Vgs ≥ vth → Ron). Drain overcurrent (~0.5 A) or |Vgs| ≳ 20 V burns it open — not a Level-1 SPICE model.',
  'lab.modelNote.ne555':
    'Teaching NE555: thr/trig SR latch, open-drain discharge, totem-pole OUT. Output ≳ 200 mA or Vcc ≳ 18 V burns it open — behavioral, not a full bipolar 555.',
  'lab.modelNote.pushbutton':
    'Momentary contact (teaching). Hold the button on the canvas or in the inspector to close — same electrical model as a switch.',
  'lab.modelNote.ldr':
    'Photoresistor: Light 0→dark (rDark), 1→bright (rLight). Use in a divider to sense light. Sustained power above ~¼ W burns it open.',
  'lab.modelNote.buzzer':
    'Teaching piezo: conducts when forward voltage ≥ vf (like an LED). Current means “sounding”. Above ~50 mA burns it open.',
  'lab.modelNote.dc_motor':
    'Teaching DC motor load: when |V| ≥ vStart it draws current through ron. Use a flyback diode. Sustained current above ~0.4 A burns it open.',
  'lab.modelNote.arduino_dio':
    'Teaching Arduino digital pin: Output drives vHigh or 0 V through ron; Input is open (add a pull-up/down). Not a full MCU.',
  'lab.modelNote.arduino_i2c':
    'Teaching Arduino Wire host: 5V rail vs GND; SDA/SCL are open-drain idle (high-Z). Add external pull-ups — same wiring lesson as real I2C. Not a bit-level protocol sim.',
  'lab.modelNote.ssd1306':
    'Teaching SSD1306 I2C OLED: VCC load + SDA/SCL high-Z. Pick address 0x3C/0x3D for the lesson; this model does not decode I2C traffic.',
  'lab.modelNote.resistor':
    '¼ W teaching resistor — sustained power above ~0.25 W burns it open.',
  'lab.modelNote.diode':
    'Teaching silicon diode. Current above ~100 mA burns it open.',
  'lab.modelNote.zener':
    'Teaching Zener: forward like a diode; reverse clamps near Vz. Cathode on the regulated node, anode to ground.',
  'lab.modelNote.fuse':
    'Teaching fuse: low series Ron until |I| exceeds iMax, then opens until you replace it.',
  'lab.modelNote.vreg7805':
    'Teaching 7805: OUT holds ~vOut vs GND when Vin ≥ vOut + dropout; otherwise it behaves like series Ron.',
  'lab.modelNote.capacitor':
    'Teaching capacitor. Voltage above vmax (default 16 V) burns it open.',
  'lab.modelNote.ammeter':
    'Series sense ammeter. Current above ~200 mA burns the meter open (do not place across a supply).',
  'lab.modelNote.relay':
    'Teaching SPST relay: coil resistance between +/−; contacts close when |Vcoil| ≥ pull-in (or Closed / timeline override).',
  'lab.param.pressed': 'Pressed',
  'lab.inspector.holdToPress': 'Hold to press',
  'lab.inspector.holding': 'Pressed — release to open',
  'lab.param.light': 'Light (0–1)',
  'lab.param.rDark': 'Dark resistance',
  'lab.param.rLight': 'Light resistance',
  'lab.param.vStart': 'Start voltage',
  'lab.param.pinMode': 'Pin mode',
  'lab.param.pinModeInput': 'Input',
  'lab.param.pinModeOutput': 'Output',
  'lab.param.pinLevel': 'Level',
  'lab.param.pinLevelLow': 'LOW',
  'lab.param.pinLevelHigh': 'HIGH',
  'lab.param.vHigh': 'HIGH voltage',
  'lab.param.i2cAddr': 'I2C address',
  'lab.param.i2cAddr3C': '0x3C (60)',
  'lab.param.i2cAddr3D': '0x3D (61)',
  'lab.param.supplyLoad': 'Supply load',
  'lab.param.capVmax': 'Max voltage',
  'lab.param.thresholdV': 'Threshold Vgs',
  'lab.param.rCoil': 'Coil resistance',
  'lab.param.vPull': 'Pull-in voltage',
  'lab.symbol.current_source': 'Current source',
  'lab.symbol.capacitor': 'Capacitor',
  'lab.symbol.inductor': 'Inductor',
  'lab.symbol.potentiometer': 'Potentiometer',
  'lab.symbol.pulse_source': 'Pulse source',
  'lab.symbol.ammeter': 'Ammeter',
  'lab.symbol.voltmeter': 'Voltmeter',
  'lab.symbol.ground': 'Ground',
  'lab.symbol.junction': 'Junction',

  'lab.param.voltage': 'Voltage',
  'lab.param.esr': 'Series R (ESR)',
  'lab.param.acMag': 'AC magnitude',
  'lab.param.acPhase': 'AC phase',
  'lab.param.acFreq': 'Frequency (tran sine)',
  'lab.param.gain': 'Open-loop gain',
  'lab.param.vMax': 'Positive rail',
  'lab.param.vMin': 'Negative rail',
  'lab.param.baseResistance': 'Base resistance',
  'lab.param.senseResistance': 'Sense resistance',
  'lab.param.resistance': 'Resistance',
  'lab.param.forwardV': 'Forward V',
  'lab.param.zenerV': 'Zener V',
  'lab.param.fuseIMax': 'Trip current',
  'lab.param.regVout': 'Output V',
  'lab.param.regDropout': 'Dropout',
  'lab.param.pulsePeriod': 'Period (0 = one-shot)',
  'lab.param.ledColor': 'Color',
  'lab.param.onResistance': 'On resistance',
  'lab.param.closed': 'Closed',
  'lab.param.openAt': 'Auto-open at (−1 = off)',
  'lab.param.closeAt': 'Auto-close at (−1 = off)',
  'lab.param.current': 'Current',
  'lab.param.capacitance': 'Capacitance',
  'lab.param.capIc': 'Initial V (tran)',
  'lab.param.inductance': 'Inductance',
  'lab.param.inductorIc': 'Initial I (tran)',
  'lab.param.wiper': 'Wiper (0–1)',
  'lab.param.vInitial': 'Initial V',
  'lab.param.vPulse': 'Pulse V',
  'lab.param.delay': 'Delay',
  'lab.param.pulseWidth': 'Pulse width',

  'lab.inspector.title': 'Inspector',
  'lab.inspector.rotate': 'Rotate 90°',
  'lab.inspector.delete': 'Delete',
  'lab.inspector.multi': '{count} parts selected',
  'lab.inspector.empty': 'Select a component to edit its parameters.',

  'lab.results.title': 'Results',
  'lab.results.nodeVoltages': 'Node voltages',
  'lab.results.branchCurrents': 'Branch currents',
  'lab.results.tranSamples': 'Transient: {count} samples (see scope).',
  'lab.results.finalNodeVoltages': 'Final node voltages',
  'lab.results.finalBranchCurrents': 'Final branch currents',
  'lab.results.acAt': 'AC phasors at {f} Hz',
  'lab.results.acSweepPoints': '{count} sweep points',
  'lab.results.nodePhasors': 'Node voltage phasors',
  'lab.results.branchPhasors': 'Branch current phasors',
  'lab.results.empty': 'Run a simulation to see results.',

  'lab.scope.title': 'Scope',
  'lab.scope.vsTime': '{id} vs time',
  'lab.scope.channelV': '{id} (V)',
  'lab.scope.channelI': '{id} (mA)',
  'lab.scope.scrubTime': 't = {t} s',
  'lab.scope.ariaWaveform': 'Transient waveform',
  'lab.scope.empty': 'Run transient analysis to plot waveforms.',

  'lab.canvas.aria': 'Schematic canvas',

  'lab.status.error': 'Error',
  'lab.status.warning': 'Warning',
  'lab.status.probe': 'Probe',
  'lab.status.info': 'Info',
  'lab.status.idle': 'Status messages and probe readings appear here.',
  'lab.capIc.ready':
    'Capacitor charge stored (≈ {v} V). Open the switch and Run again to watch the LED fade.',
  'lab.capIc.injecting':
    'Discharging from stored capacitor voltage (≈ {v} V). Scrub the scope to watch the fade.',
  'lab.energy.stored':
    'Stored capacitor energy (≈ {v} V) — Run with the switch closed to charge from the battery.',
  'lab.energy.discharging':
    'Continuing from stored energy (≈ {v} V) — open-circuit path.',

  'lab.led.overloaded': 'Overloaded!',
  'lab.led.failedOpen': 'Burned out!',
  'lab.led.color.red': 'Red',
  'lab.led.color.green': 'Green',
  'lab.led.color.yellow': 'Yellow',
  'lab.led.color.blue': 'Blue',
  'lab.led.color.white': 'White',
  'lab.led.burnedWarning':
    'LED {ids} burned out from too much current and is now an open circuit. Replace it and add enough series resistance.',
  'lab.led.peakOverloadWarning':
    'LED {ids} peaked above ~35 mA during the run (spike). It was not permanently burned — lower resistance or slow the switch if this persists at the end of the run.',
  'lab.led.reverseBiasTip':
    '{id} looks reverse-biased or dark — check anode (A) vs cathode (K) orientation.',
  'lab.bjt.burnedWarning':
    'Transistor {ids} burned out from too much base current (~25 mA) and is now open. Replace it and use enough series base resistance.',
  'lab.bjt.peakBaseOverloadWarning':
    'Transistor {ids} peaked above ~25 mA base current during the run (spike). It was not permanently burned — add base resistance if this persists.',
  'lab.diode.burnedWarning':
    'Diode {ids} burned out from too much current (~100 mA) and is now open. Replace it and add series resistance.',
  'lab.diode.peakOverloadWarning':
    'Diode {ids} peaked above ~100 mA during the run (spike). It was not permanently burned.',
  'lab.resistor.burnedWarning':
    'Resistor {ids} overheated (above ~¼ W) and is now open. Replace it and use a higher resistance or lower voltage.',
  'lab.resistor.peakOverloadWarning':
    'Resistor {ids} peaked above ~¼ W during the run (spike). It was not permanently burned.',
  'lab.capacitor.burnedWarning':
    'Capacitor {ids} exceeded its voltage rating and failed open. Replace it or lower the voltage / raise vmax.',
  'lab.capacitor.peakOverloadWarning':
    'Capacitor {ids} peaked above its voltage rating during the run (spike). It was not permanently burned.',
  'lab.ammeter.burnedWarning':
    'Ammeter {ids} overloaded (~200 mA) and is now open. Replace it — ammeters go in series, never across a supply.',
  'lab.ammeter.peakOverloadWarning':
    'Ammeter {ids} peaked above ~200 mA during the run (spike). It was not permanently burned.',
  'lab.fuse.burnedWarning':
    'Fuse {ids} opened after exceeding its trip current. Replace it and fix the overload (lower current or raise iMax).',
  'lab.fuse.peakOverloadWarning':
    'Fuse {ids} peaked above its trip current during the run (spike). It was not permanently burned.',
  'lab.nmos.burnedWarning':
    'MOSFET {ids} burned out (drain overcurrent or gate overvoltage) and is now open. Replace it and check gate drive / load current.',
  'lab.nmos.peakOverloadWarning':
    'MOSFET {ids} peaked above teaching drain/gate limits during the run (spike). It was not permanently burned.',
  'lab.ne555.burnedWarning':
    'Timer {ids} burned out (output overcurrent or Vcc too high) and is now open. Replace it and check ROUT / supply voltage.',
  'lab.ne555.peakOverloadWarning':
    'Timer {ids} peaked above teaching output/Vcc limits during the run (spike). It was not permanently burned.',
  'lab.buzzer.burnedWarning':
    'Buzzer {ids} burned out from too much current (~50 mA) and is now open. Replace it and add series resistance.',
  'lab.buzzer.peakOverloadWarning':
    'Buzzer {ids} peaked above ~50 mA during the run (spike). It was not permanently burned.',
  'lab.dc_motor.burnedWarning':
    'Motor {ids} burned out from too much current (~0.4 A) and is now open. Replace it and check drive / series resistance.',
  'lab.dc_motor.peakOverloadWarning':
    'Motor {ids} peaked above ~0.4 A during the run (spike). It was not permanently burned.',
  'lab.ldr.burnedWarning':
    'LDR {ids} overheated (above ~¼ W) and is now open. Replace it — dark LDRs are high-R; bright+high current can still burn them.',
  'lab.ldr.peakOverloadWarning':
    'LDR {ids} peaked above ~¼ W during the run (spike). It was not permanently burned.',
  'lab.ne555.blinkPlayback':
    'Blinking: all LEDs follow OUT. Scrub the scope or watch playback — change RA/RB/CT to alter the period.',
  'lab.led.fadePlayback':
    'Playing capacitor discharge — LED fades as stored charge drains.',
  'lab.led.chargePlayback':
    'Playing capacitor charge — watch current split between the cap branch and the LED.',
  'lab.led.fadeDischargeHint':
    'Using stored capacitor voltage from the last Run (switch is open).',
  'lab.led.fadeEngineStale':
    'LED did not fade. Restart CircuitEngine (capacitor ic support), then: Run with switch closed, open the switch, Run again.',
  'lab.inspector.ledBurned':
    'This LED burned out (open circuit). Current no longer flows through it. Replace the LED and use a proper series resistor (~220 Ω for 5 V).',
  'lab.inspector.replaceLed': 'Replace LED',
  'lab.inspector.bjtBurned':
    'This transistor burned out from excessive base current (open circuit). Replace it and keep a series base resistor (often a few kΩ).',
  'lab.inspector.replaceBjt': 'Replace transistor',
  'lab.inspector.diodeBurned':
    'This diode burned out from excessive current (open circuit). Replace it and add series resistance.',
  'lab.inspector.replaceDiode': 'Replace diode',
  'lab.inspector.resistorBurned':
    'This resistor overheated above ~¼ W and failed open. Replace it and check power (I²R).',
  'lab.inspector.replaceResistor': 'Replace resistor',
  'lab.inspector.capacitorBurned':
    'This capacitor exceeded its voltage rating and failed open. Replace it or raise vmax / lower the voltage.',
  'lab.inspector.replaceCapacitor': 'Replace capacitor',
  'lab.inspector.ammeterBurned':
    'This ammeter overloaded and failed open. Replace it — never place an ammeter directly across a voltage source.',
  'lab.inspector.replaceAmmeter': 'Replace ammeter',
  'lab.inspector.fuseBurned':
    'This fuse opened after exceeding its trip current. Replace it and reduce the load current or raise iMax.',
  'lab.inspector.replaceFuse': 'Replace fuse',
  'lab.inspector.fuseReplacedClearedSwitches':
    'Fuse replaced — closed switches were opened so the new fuse is not immediately overloaded. Close a switch again only after the fault is fixed.',
  'lab.inspector.nmosBurned':
    'This MOSFET burned out (open circuit) from drain overcurrent or excessive gate voltage. Replace it and check the load / gate drive.',
  'lab.inspector.replaceNmos': 'Replace MOSFET',
  'lab.inspector.ne555Burned':
    'This NE555 burned out (open circuit) from output overcurrent or excessive Vcc. Replace it and check ROUT / supply.',
  'lab.inspector.replaceNe555': 'Replace NE555',
  'lab.inspector.buzzerBurned':
    'This buzzer burned out from excessive current (open circuit). Replace it and add series resistance.',
  'lab.inspector.replaceBuzzer': 'Replace buzzer',
  'lab.inspector.dcMotorBurned':
    'This motor burned out from excessive current (open circuit). Replace it and check drive / series resistance.',
  'lab.inspector.replaceDcMotor': 'Replace motor',
  'lab.inspector.ldrBurned':
    'This LDR overheated above ~¼ W and failed open. Replace it and check power (I²R at the current light setting).',
  'lab.inspector.replaceLdr': 'Replace LDR',

  'lab.probe.netFinal': 'Net {id} (final): {v} V',
  'lab.probe.netAt': 'Net {id} @ {t} s: {v} V',
  'lab.probe.netEmpty': 'Net {id}: —',
  'lab.probe.netDc': 'Net {id}: {v} V',
  'lab.probe.netAc': 'Net {id} @ {f} Hz: {mag} V ∠ {phase}°',
  'lab.probe.branchFinal': '{id} (final): {i} mA',
  'lab.probe.branchAt': '{id} @ {t} s: {i} mA',
  'lab.probe.branchEmpty': '{id}: —',
  'lab.probe.branchDc': '{id}: {i} mA',
  'lab.probe.branchAc': '{id} @ {f} Hz: {mag} mA ∠ {phase}°',

  'lab.sim.requestFailed': 'Request failed',
  'lab.sim.failed': 'Simulation failed',

  'learn.title': 'Learn',
  'learn.body':
    'Short guided projects that open a ready-made circuit in the Lab. From LEDs and transistors up to Arduino-style digital pins.',
  'learn.meta.description':
    'Learn practical electronics with short guided projects and an online teaching circuit simulator.',
  'learn.hub.readUnit': 'Read project',
  'learn.unit.backToHub': '← All projects',
  'learn.unit.skimStepsBeforeLab':
    'Tip: skim the checklist above first — then try the circuit here in Lab.',

  'learn.module.basics.title': 'Voltage, LEDs & capacitors',
  'learn.module.power.title': 'Power supplies',
  'learn.module.switching.title': 'Transistors & relays',
  'learn.module.timing.title': 'Timing circuits',
  'learn.module.input.title': 'Buttons & sensors',
  'learn.module.actuators.title': 'Buzzers & motors',
  'learn.module.mcu.title': 'Arduino-style I/O',
  'learn.module.buses.title': 'Serial buses',

  'learn.project.halfWave.title': 'Half-wave rectifier',
  'learn.project.halfWave.summary':
    'See how a single diode turns AC into pulsating DC — the foundation of every mains supply.',
  'learn.project.halfWave.step1': 'Open the Lab example and Run Transient (~80 ms).',
  'learn.project.halfWave.step2': 'Probe the load resistor — voltage should appear only on positive half-cycles.',
  'learn.project.halfWave.step3': 'Flip the diode orientation (or imagine it) — reverse blocks the other half-cycle.',
  'learn.project.halfWave.step4': 'Compare the waveform shape to a full-wave bridge in the next project.',
  'learn.project.halfWave.openLab': 'Open in Lab',

  'learn.project.bridge.title': 'Bridge rectifier',
  'learn.project.bridge.summary':
    'Four diodes route both AC half-cycles into the load — denser pulsating DC than half-wave.',
  'learn.project.bridge.step1': 'Open the Lab example and Run Transient.',
  'learn.project.bridge.step2': 'Probe the load — you should see pulses every half-cycle (100 Hz for 50 Hz AC).',
  'learn.project.bridge.step3': 'Trace which diodes conduct on the positive AC half vs the negative half.',
  'learn.project.bridge.step4': 'Note DC− is tied to ground in this teaching layout for easy probing.',
  'learn.project.bridge.openLab': 'Open in Lab',

  'learn.project.filterCap.title': 'Filter capacitor',
  'learn.project.filterCap.summary':
    'A reservoir capacitor after the rectifier holds charge between peaks and smooths the DC.',
  'learn.project.filterCap.step1': 'Open the Lab example and Run Transient.',
  'learn.project.filterCap.step2': 'Probe across C1 — peaks charge the cap; the load discharges it between peaks.',
  'learn.project.filterCap.step3': 'Halve C1 (or lower R1) and Run again — ripple grows.',
  'learn.project.filterCap.step4': 'Larger C or lighter load → smoother DC (until ESR and inrush matter in real life).',
  'learn.project.filterCap.openLab': 'Open in Lab',

  'learn.project.zener.title': 'Zener shunt regulator',
  'learn.project.zener.summary':
    'A reverse-biased Zener clamps a node near Vz when fed through a series resistor.',
  'learn.project.zener.step1': 'Open the Lab example and Run DC.',
  'learn.project.zener.step2': 'Probe JM — voltage should sit near 5.1 V with a 12 V supply.',
  'learn.project.zener.step3': 'Change RL and Run again — light loads stay regulated; very heavy loads can collapse Vz.',
  'learn.project.zener.step4': 'Remember: cathode on the regulated node, anode to ground.',
  'learn.project.zener.openLab': 'Open in Lab',

  'learn.project.vreg7805.title': 'Linear 7805 regulator',
  'learn.project.vreg7805.summary':
    'A series regulator holds ~5 V out when the input stays above the dropout budget.',
  'learn.project.vreg7805.step1': 'Open the Lab example and Run DC — OUT should be ~5 V.',
  'learn.project.vreg7805.step2': 'Probe IN vs OUT — the difference is dropped as heat in a real 7805.',
  'learn.project.vreg7805.step3': 'Lower VB toward ~6 V and Run — regulation fails near dropout.',
  'learn.project.vreg7805.step4': 'Compare with the Zener sample: series IC vs shunt diode.',
  'learn.project.vreg7805.openLab': 'Open in Lab',

  'learn.project.reversePolarity.title': 'Reverse-polarity protection',
  'learn.project.reversePolarity.summary':
    'A series diode blocks current if the battery is connected backwards — cheap protection for a load.',
  'learn.project.reversePolarity.step1': 'Open the Lab example and Run DC — the LED should light.',
  'learn.project.reversePolarity.step2': 'Note the ~0.7 V drop across Dprot (teaching silicon diode).',
  'learn.project.reversePolarity.step3': 'Mentally reverse the battery — the diode blocks, so the LED stays dark.',
  'learn.project.reversePolarity.step4': 'Trade-off: you lose Vf from the supply budget.',
  'learn.project.reversePolarity.openLab': 'Open in Lab',

  'learn.project.fuseProtect.title': 'Fuse and short protection',
  'learn.project.fuseProtect.summary':
    'A teaching fuse opens when current exceeds iMax — practice what a short does to the supply path.',
  'learn.project.fuseProtect.step1':
    'Open the Lab example — S1 starts open (safe path through RL). Close S1 to short across RL.',
  'learn.project.fuseProtect.step2':
    'With S1 closed, Run DC — F1 opens; RL is bypassed so only the fuse fails.',
  'learn.project.fuseProtect.step3':
    'Replace F1 — S1 opens automatically. Run again for safe current through RL.',
  'learn.project.fuseProtect.step4': 'Never defeat a fuse with a wire in a real circuit.',
  'learn.project.fuseProtect.openLab': 'Open in Lab',

  'learn.project.ripple.title': 'Measuring ripple',
  'learn.project.ripple.summary':
    'Residual AC on filtered DC is ripple — see it on the scope after a rectifier + capacitor.',
  'learn.project.ripple.step1': 'Open the Lab example and Run Transient.',
  'learn.project.ripple.step2': 'Probe JT — zoom on the flat-top region between peaks.',
  'learn.project.ripple.step3': 'Reduce C1 or R1 and Run again — peak-to-peak ripple grows.',
  'learn.project.ripple.step4': 'In real supplies, ripple specs drive capacitor size and load current.',
  'learn.project.ripple.openLab': 'Open in Lab',

  'learn.project.buck.title': 'Basic buck converter',
  'learn.project.buck.summary':
    'PWM + inductor + diode + capacitor steps a higher DC voltage down — discrete teaching topology.',
  'learn.project.buck.step1': 'Open the Lab example and Run Transient (~10 ms).',
  'learn.project.buck.step2': 'Probe JO — average should be below Vin (duty × Vin ideally).',
  'learn.project.buck.step3': 'Widen pulse width (pw) toward the period — output average rises.',
  'learn.project.buck.step4': 'Gate drive is referenced to LX so the high-side NMOS sees real Vgs.',
  'learn.project.buck.openLab': 'Open in Lab',

  'learn.project.boost.title': 'Basic boost converter',
  'learn.project.boost.summary':
    'PWM + inductor + diode + capacitor steps a lower DC voltage up — energy stored in L each cycle.',
  'learn.project.boost.step1': 'Open the Lab example and Run Transient (~10 ms).',
  'learn.project.boost.step2': 'Probe JO — average should rise above the 5 V input after a few cycles.',
  'learn.project.boost.step3': 'Increase on-time (pw) carefully — more energy per cycle, higher Vout.',
  'learn.project.boost.step4': 'Compare with buck: low-side switch vs high-side switch placement.',
  'learn.project.boost.openLab': 'Open in Lab',

  'learn.project.led.title': 'LED + series resistor',
  'learn.project.led.summary':
    'See why an LED needs a current-limiting resistor and how series resistance sets brightness.',
  'learn.project.led.step1': 'Open the Lab example and Run DC — the LED should light at a safe current.',
  'learn.project.led.step2': 'Select R1 and lower its value — LED current rises (watch brightness in the model).',
  'learn.project.led.step3': 'Raise R1 again — current drops. Find a value that keeps the LED bright but not overloaded.',
  'learn.project.led.step4': 'Probe the LED or ammeter to read current in milliamps.',
  'learn.project.led.openLab': 'Open in Lab',

  'learn.project.rc.title': 'RC capacitor charging',
  'learn.project.rc.summary':
    'Watch a capacitor charge through a resistor — the curve behind timing circuits and debouncing.',
  'learn.project.rc.step1': 'Open the Lab example and Run Transient — probe the capacitor voltage.',
  'learn.project.rc.step2': 'Scrub the scope to see the voltage rise toward the supply.',
  'learn.project.rc.step3': 'Change R or C and Run again — time constant τ = R×C changes the curve.',
  'learn.project.rc.step4': 'Compare with the LED fade example next — same RC idea, different load.',
  'learn.project.rc.openLab': 'Open in Lab',

  'learn.project.ledFade.title': 'LED fade (RC discharge)',
  'learn.project.ledFade.summary':
    'Use a capacitor to store energy and fade an LED out — a gentle intro to timing without a 555.',
  'learn.project.ledFade.step1': 'Open the Lab example and Run Transient for several seconds.',
  'learn.project.ledFade.step2': 'Watch the LED dim as the capacitor discharges through the resistor.',
  'learn.project.ledFade.step3': 'Change C or the discharge resistor and compare fade time.',
  'learn.project.ledFade.step4': 'Enable init-from-DC if offered — see how starting voltage affects the first frame.',
  'learn.project.ledFade.openLab': 'Open in Lab',

  'learn.project.bc547.title': 'BC547 LED switch',
  'learn.project.bc547.summary':
    'Use a BC547 (teaching NPN) to turn an LED on and off from a base switch. Same idea as a real TO-92 switch circuit, with a simplified transistor model.',
  'learn.project.bc547.step1': 'Open the Lab example and Run DC — the LED should light.',
  'learn.project.bc547.step2': 'Select switch S1, uncheck Closed, Run again — the LED should go dark.',
  'learn.project.bc547.step3': 'Probe the ammeter (AM1) or LED to read collector current while the switch is closed.',
  'learn.project.bc547.step4':
    'Lower RB a lot (try ~100 Ω or less) — too much base current (~25 mA) burns the transistor open; use Replace transistor to recover.',
  'learn.project.bc547.openLab': 'Open in Lab',
  'learn.project.relay.title': 'Relay with flyback diode',
  'learn.project.relay.summary':
    'Drive a teaching SPST relay coil from a switch, protect the coil path with a flyback diode, and switch an LED load on the contacts.',
  'learn.project.relay.step1': 'Open the Lab example and Run DC — with S1 closed the coil pulls in and the LED lights.',
  'learn.project.relay.step2': 'Select S1, uncheck Closed, Run again — contacts open and the LED goes out.',
  'learn.project.relay.step3':
    'Select Dfly — cathode faces coil+ (toward the switch); anode returns to ground (classic flyback orientation).',
  'learn.project.relay.step4':
    'Raise K1 pull-in above 5 V (or open S1) so the coil cannot energize — the LED stays dark.',
  'learn.project.relay.openLab': 'Open in Lab',
  'learn.project.nmos.title': 'NMOS LED switch',
  'learn.project.nmos.summary':
    'Use a teaching NMOS to switch an LED from a gate switch. Same idea as a logic-level FET switch, with a simple Vgs threshold model.',
  'learn.project.nmos.step1': 'Open the Lab example and Run DC — the LED should light with S1 closed.',
  'learn.project.nmos.step2': 'Select S1, uncheck Closed, Run again — RPD pulls the gate down and the LED goes dark.',
  'learn.project.nmos.step3': 'Probe AM1 or the LED for drain current while the switch is closed.',
  'learn.project.nmos.step4':
    'Drop RD very low or raise the supply a lot — excess drain current or |Vgs| burns M1 open; use Replace MOSFET to recover.',
  'learn.project.nmos.openLab': 'Open in Lab',
  'learn.project.ne555.title': 'NE555 astable blinker',
  'learn.project.ne555.summary':
    'Build a classic 555 astable with Ra/Rb/C timing and watch three colored LEDs blink together in Transient analysis.',
  'learn.project.ne555.step1':
    'Open the Lab example and Run Transient (~100 ms) — red, green, and yellow LEDs should blink in sync.',
  'learn.project.ne555.step2':
    'Probe OUT or CT and scrub the scope to see the square wave and capacitor ramp.',
  'learn.project.ne555.step3':
    'Change RA/RB/CT to alter period (teaching approximation of the classic formulas).',
  'learn.project.ne555.step4':
    'Drop R1–R3 too low — output overcurrent burns the timer open; use Replace NE555 to recover.',
  'learn.project.ne555.openLab': 'Open in Lab',
  'learn.project.pushbutton.title': 'Pushbutton LED',
  'learn.project.pushbutton.summary':
    'Close a momentary button to light an LED — the same idea as reading a button on an Arduino pin.',
  'learn.project.pushbutton.step1': 'Open the Lab example. With Select tool, hold BTN1 on the canvas — the LED lights while pressed.',
  'learn.project.pushbutton.step2': 'Release the button — the LED goes dark. The inspector Hold to press control does the same.',
  'learn.project.pushbutton.step3': 'Probe the LED current while holding the button.',
  'learn.project.pushbutton.step4': 'Try wiring the button to ground instead (active-low) as a challenge.',
  'learn.project.pushbutton.openLab': 'Open in Lab',
  'learn.project.ldr.title': 'LDR night-light',
  'learn.project.ldr.summary':
    'A pull-up + LDR to ground drives an NMOS so the LED turns on in the dark — classic light sensor practice.',
  'learn.project.ldr.step1': 'Open the Lab example and Run DC — with Light low the LED should be on.',
  'learn.project.ldr.step2': 'Select LDR1, raise Light toward 1, Run again — the LED should go dark.',
  'learn.project.ldr.step3': 'Probe the MOSFET gate net to see the divider voltage change with Light.',
  'learn.project.ldr.step4': 'Change rDark / rLight (or R1) and watch the trip point move.',
  'learn.project.ldr.openLab': 'Open in Lab',
  'learn.project.buzzer.title': 'Buzzer + button',
  'learn.project.buzzer.summary':
    'Press a button to drive a teaching piezo buzzer — current means it is “sounding”.',
  'learn.project.buzzer.step1': 'Open the Lab example. Hold BTN1 on the canvas — BZ1 should show current.',
  'learn.project.buzzer.step2': 'Release the button — current should drop to ~0.',
  'learn.project.buzzer.step3': 'Probe BZ1 and compare with the LED sample (same button idea, different load).',
  'learn.project.buzzer.step4': 'Lower R1 carefully — too much current is hard on a real buzzer.',
  'learn.project.buzzer.openLab': 'Open in Lab',
  'learn.project.motor.title': 'NMOS DC motor switch',
  'learn.project.motor.summary':
    'Switch a DC motor with an NMOS and a flyback diode — how Arduino drives larger loads.',
  'learn.project.motor.step1': 'Open the Lab example and Run DC with S1 closed — motor current should flow.',
  'learn.project.motor.step2': 'Open S1 and Run again — motor current stops.',
  'learn.project.motor.step3': 'Note Dfly across the motor (cathode toward +V) for inductive kick.',
  'learn.project.motor.step4': 'Probe MOT1 current; try changing ron / vStart on the motor.',
  'learn.project.motor.openLab': 'Open in Lab',
  'learn.project.arduino.title': 'Arduino LED pin',
  'learn.project.arduino.summary':
    'A teaching Arduino digital pin drives an LED — digitalWrite HIGH/LOW without a full MCU sim.',
  'learn.project.arduino.step1': 'Open the Lab example and Run DC — Output/HIGH should light the LED.',
  'learn.project.arduino.step2': 'Select D2, set Level to LOW, Run again — LED off.',
  'learn.project.arduino.step3': 'Set Mode to Input — the pin goes high-Z; add a pull-down if you want a defined LED state.',
  'learn.project.arduino.step4': 'Change vHigh to 3.3 V to mimic a 3.3 V board.',
  'learn.project.arduino.openLab': 'Open in Lab',
  'learn.project.i2cOled.title': 'I2C OLED (SSD1306)',
  'learn.project.i2cOled.summary':
    'Wire an Arduino I2C host to an SSD1306 OLED with pull-ups — the core of every I2C lesson before software.',
  'learn.project.i2cOled.step1':
    'Open the Lab example and Run DC — SDA and SCL should sit near 5 V (pull-ups to the Arduino 5V rail).',
  'learn.project.i2cOled.step2':
    'Probe OLED1 supply current — the screen should show “Hello” when VCC is powered. Address 0x3C is the usual SSD1306 default.',
  'learn.project.i2cOled.step3':
    'Delete one pull-up (RpuSDA or RpuSCL) and Run again — that line no longer has a defined idle-high level (open-drain bus).',
  'learn.project.i2cOled.step4':
    'Restore the pull-up. Note: this Lab teaches wiring and idle levels, not Wire.begin() / ACK bit streams.',
  'learn.project.i2cOled.openLab': 'Open in Lab',

  'account.title': 'Account',
  'account.body': 'Sign-in and profile will live here. Coming soon.',

  'lab.toolbar.opampFollowerPreset':
    'Op-amp voltage follower (DC)',
  'lab.toolbar.opampNonInvPreset':
    'Op-amp non-inverting (DC)',
  'lab.toolbar.opampComparatorPreset':
    'Op-amp comparator (DC)',
  'lab.toolbar.opampSchmittPreset':
    'Op-amp Schmitt trigger (DC)',
  'lab.toolbar.opampSummingPreset':
    'Op-amp summing (DC)',
  'lab.toolbar.opampIntegratorPreset':
    'Op-amp integrator (transient)',
  'lab.toolbar.opampDifferentiatorPreset':
    'Op-amp differentiator (transient)',
  'lab.toolbar.opampActiveFilterPreset':
    'Op-amp active LPF (AC)',
  'lab.hint.opampFollower':
    'Voltage follower: Run DC — Vout ≈ Vin. Probe JO vs VIN; change VIN or RL and watch the buffer hold the voltage.',
  'lab.hint.opampNonInv':
    'Non-inverting amp: Run DC — gain ≈ 1+Rf/Rg. Probe OUT; raise Vin until the teaching rails clamp.',
  'lab.hint.opampComparator':
    'Comparator: Run DC and move POT1 Wiper — OUT rails high/low vs the ~2.5 V divider; LED follows.',
  'lab.hint.opampSchmitt':
    'Schmitt trigger: Run DC and sweep POT1 slowly up and down — trip points differ (hysteresis) thanks to positive feedback.',
  'lab.hint.opampSumming':
    'Summing amp: Run DC — Vout ≈ −(V1+V2) with equal resistors. Change V2 and confirm the sum.',
  'lab.hint.opampIntegrator':
    'Integrator: Run Transient (~30 ms) — OUT ramps while the pulse is high. Scrub the scope on OUT / CF.',
  'lab.hint.opampDifferentiator':
    'Differentiator: Run Transient (~30 ms) — OUT spikes on pulse edges. Scrub OUT around the rising/falling edge.',
  'lab.hint.opampActiveFilter':
    'Active LPF: Run AC at ~100 Hz then ~10 kHz — low frequencies pass, high frequencies drop. Adjust Cf/Rf to move fc.',
  'learn.module.opamps.title':
    'Operational amplifiers',
  'learn.challenge.tab.opampFollower':
    'Op-amp follower',
  'learn.challenge.tab.opampNonInv':
    'Op-amp non-inv',
  'learn.challenge.tab.opampComparator':
    'Op-amp comparator',
  'learn.challenge.tab.opampSchmitt':
    'Op-amp Schmitt',
  'learn.challenge.tab.opampSumming':
    'Op-amp summing',
  'learn.challenge.tab.opampIntegrator':
    'Op-amp integrator',
  'learn.challenge.tab.opampDifferentiator':
    'Op-amp differentiator',
  'learn.challenge.tab.opampActiveFilter':
    'Op-amp active filter',
  'learn.project.opampFollower.title':
    'Voltage follower',
  'learn.project.opampFollower.summary':
    'Unity-gain buffer: output follows the input without loading the source.',
  'learn.project.opampFollower.step1':
    'Open the sample — U1 is wired as a follower (OUT tied back to −in).',
  'learn.project.opampFollower.step2':
    'Run DC and probe VIN vs JO — voltages should nearly match.',
  'learn.project.opampFollower.step3':
    'Change VIN voltage in the inspector; the output tracks it.',
  'learn.project.opampFollower.step4':
    'Swap RL to a lighter/heavier load — the buffer still holds Vout ≈ Vin.',
  'learn.project.opampFollower.openLab':
    'Open in Lab',
  'learn.project.opampFollower.lesson1.title':
    'Unity gain buffer',
  'learn.project.opampFollower.lesson1.body':
    'Negative feedback forces −in ≈ +in. With OUT wired to −in, Vout equals Vin. The op-amp supplies the load current so the source is not loaded.',
  'learn.project.opampFollower.lesson2.title':
    'When to use it',
  'learn.project.opampFollower.lesson2.body':
    'Followers isolate stages, drive low impedances, and copy sensor voltages without dropping them across source resistance.',
  'learn.project.opampFollower.quiz.q1.prompt':
    'In a voltage follower, feedback connects OUT to…',
  'learn.project.opampFollower.quiz.q1.a':
    'The inverting input (−in)',
  'learn.project.opampFollower.quiz.q1.b':
    'The non-inverting input (+in)',
  'learn.project.opampFollower.quiz.q1.c':
    'Neither input',
  'learn.project.opampFollower.quiz.q1.explain':
    'OUT ties to −in so the loop keeps −in = +in = Vin.',
  'learn.project.opampFollower.quiz.q2.prompt':
    'Ideal follower voltage gain is…',
  'learn.project.opampFollower.quiz.q2.a':
    '−10',
  'learn.project.opampFollower.quiz.q2.b':
    '1 (unity)',
  'learn.project.opampFollower.quiz.q2.c':
    '∞',
  'learn.project.opampFollower.quiz.q2.explain':
    'Vout / Vin ≈ 1.',
  'learn.project.opampFollower.quiz.q3.prompt':
    'Main teaching benefit of a follower is…',
  'learn.project.opampFollower.quiz.q3.a':
    'Clipping the rails harder',
  'learn.project.opampFollower.quiz.q3.b':
    'Inverting the signal',
  'learn.project.opampFollower.quiz.q3.c':
    'Buffering without loading the source',
  'learn.project.opampFollower.quiz.q3.explain':
    'It copies voltage while the amp drives the load.',
  'learn.project.opampFollower.challenge.c1.label':
    'Simulation completes without errors.',
  'learn.project.opampFollower.challenge.c2.label':
    'Circuit has an op-amp and a load resistor.',
  'learn.project.opamp.title':
    'Inverting amplifier',
  'learn.project.opamp.summary':
    'Classic −Rf/Rin gain with virtual ground at the summing node.',
  'learn.project.opamp.step1':
    'Open the inverting sample — Rin into −in, Rf from OUT back to −in, +in grounded.',
  'learn.project.opamp.step2':
    'Run DC: with Vin=1 V, Rin=1 kΩ, Rf=10 kΩ expect Vout ≈ −10 V.',
  'learn.project.opamp.step3':
    'Probe the summing junction JS — it sits near 0 V (virtual ground).',
  'learn.project.opamp.step4':
    'Change Rf or Rin and confirm gain ≈ −Rf/Rin until the rails clamp.',
  'learn.project.opamp.openLab':
    'Open in Lab',
  'learn.project.opamp.lesson1.title':
    'Virtual ground',
  'learn.project.opamp.lesson1.body':
    'Negative feedback holds −in at the same potential as +in (ground here). Current through Rin continues through Rf, so Vout = −Vin·Rf/Rin.',
  'learn.project.opamp.lesson2.title':
    'Rails',
  'learn.project.opamp.lesson2.body':
    'If the ideal gain asks for more than ±vMax/vMin, the teaching model clamps — OUT sticks at the rail.',
  'learn.project.opamp.quiz.q1.prompt':
    'Ideal inverting gain is…',
  'learn.project.opamp.quiz.q1.a':
    '−Rf / Rin',
  'learn.project.opamp.quiz.q1.b':
    '1 + Rf / Rin',
  'learn.project.opamp.quiz.q1.c':
    'Rf only',
  'learn.project.opamp.quiz.q1.explain':
    'Closed-loop gain for the inverting topology.',
  'learn.project.opamp.quiz.q2.prompt':
    'With +in grounded, the summing node sits near…',
  'learn.project.opamp.quiz.q2.a':
    'Vcc',
  'learn.project.opamp.quiz.q2.b':
    '0 V (virtual ground)',
  'learn.project.opamp.quiz.q2.c':
    'Vin',
  'learn.project.opamp.quiz.q2.explain':
    'Feedback keeps −in ≈ +in = 0.',
  'learn.project.opamp.quiz.q3.prompt':
    'If |ideal Vout| exceeds the rail…',
  'learn.project.opamp.quiz.q3.a':
    'Gain doubles',
  'learn.project.opamp.quiz.q3.b':
    'Nothing changes',
  'learn.project.opamp.quiz.q3.c':
    'OUT clamps at the rail',
  'learn.project.opamp.quiz.q3.explain':
    'Teaching op-amp saturates at vMax/vMin.',
  'learn.project.opamp.challenge.c1.label':
    'Simulation completes without errors.',
  'learn.project.opamp.challenge.c2.label':
    'Circuit includes op-amp and resistors.',
  'learn.project.opampNonInv.title':
    'Non-inverting amplifier',
  'learn.project.opampNonInv.summary':
    'Gain = 1 + Rf/Rg with the signal into +in.',
  'learn.project.opampNonInv.step1':
    'Open the sample — Vin into +in; Rf/Rg divider feeds −in.',
  'learn.project.opampNonInv.step2':
    'Run DC: Vin=0.5 V, Rf=10 kΩ, Rg=1 kΩ → Vout ≈ 5.5 V.',
  'learn.project.opampNonInv.step3':
    'Probe OUT and confirm it is larger than Vin and same polarity.',
  'learn.project.opampNonInv.step4':
    'Raise Vin until OUT hits the +rail — see clamping.',
  'learn.project.opampNonInv.openLab':
    'Open in Lab',
  'learn.project.opampNonInv.lesson1.title':
    'Gain formula',
  'learn.project.opampNonInv.lesson1.body':
    'Feedback sets V− = Vin. Divider Rf/Rg gives Vout = Vin·(1 + Rf/Rg).',
  'learn.project.opampNonInv.lesson2.title':
    'Same polarity',
  'learn.project.opampNonInv.lesson2.body':
    'Unlike the inverter, the output moves the same direction as the input.',
  'learn.project.opampNonInv.quiz.q1.prompt':
    'Ideal non-inverting gain is…',
  'learn.project.opampNonInv.quiz.q1.a':
    '−Rf / Rg',
  'learn.project.opampNonInv.quiz.q1.b':
    '1 + Rf / Rg',
  'learn.project.opampNonInv.quiz.q1.c':
    'Rf − Rg',
  'learn.project.opampNonInv.quiz.q1.explain':
    'Closed-loop non-inverting gain.',
  'learn.project.opampNonInv.quiz.q2.prompt':
    'Input signal connects to…',
  'learn.project.opampNonInv.quiz.q2.a':
    '−in only',
  'learn.project.opampNonInv.quiz.q2.b':
    '+in',
  'learn.project.opampNonInv.quiz.q2.c':
    'OUT',
  'learn.project.opampNonInv.quiz.q2.explain':
    'Vin drives the non-inverting pin.',
  'learn.project.opampNonInv.quiz.q3.prompt':
    'Compared with the inverter, polarity is…',
  'learn.project.opampNonInv.quiz.q3.a':
    'Always opposite',
  'learn.project.opampNonInv.quiz.q3.b':
    'Undefined',
  'learn.project.opampNonInv.quiz.q3.c':
    'The same as Vin',
  'learn.project.opampNonInv.quiz.q3.explain':
    'Non-inverting keeps sign.',
  'learn.project.opampNonInv.challenge.c1.label':
    'Simulation completes without errors.',
  'learn.project.opampNonInv.challenge.c2.label':
    'Circuit includes op-amp and feedback resistors.',
  'learn.project.opampComparator.title':
    'Comparator',
  'learn.project.opampComparator.summary':
    'Open-loop compare: pot vs divider threshold; OUT rails high or low.',
  'learn.project.opampComparator.step1':
    'Open the sample — pot on +in, RA/RB set a ~2.5 V threshold on −in.',
  'learn.project.opampComparator.step2':
    'Run DC with pot Wiper high — LED should light (OUT near 5 V).',
  'learn.project.opampComparator.step3':
    'Lower the Wiper below the threshold — LED goes out.',
  'learn.project.opampComparator.step4':
    'Probe JO while dragging the Wiper slider to see the abrupt rail switch.',
  'learn.project.opampComparator.openLab':
    'Open in Lab',
  'learn.project.opampComparator.lesson1.title':
    'Open loop',
  'learn.project.opampComparator.lesson1.body':
    'Without feedback the teaching gain is huge, so OUT saturates high or low depending on which input is larger.',
  'learn.project.opampComparator.lesson2.title':
    'Threshold',
  'learn.project.opampComparator.lesson2.body':
    'The resistor divider sets the trip voltage. A pot lets you sweep Vin across that threshold.',
  'learn.project.opampComparator.quiz.q1.prompt':
    'A comparator usually uses…',
  'learn.project.opampComparator.quiz.q1.a':
    'Heavy negative feedback',
  'learn.project.opampComparator.quiz.q1.b':
    'Open-loop (or tiny feedback) gain',
  'learn.project.opampComparator.quiz.q1.c':
    'An inductor only',
  'learn.project.opampComparator.quiz.q1.explain':
    'High gain drives the output to a rail.',
  'learn.project.opampComparator.quiz.q2.prompt':
    'When Vin > Vth on this sample, OUT goes…',
  'learn.project.opampComparator.quiz.q2.a':
    'Toward the positive rail',
  'learn.project.opampComparator.quiz.q2.b':
    'Exactly Vin',
  'learn.project.opampComparator.quiz.q2.c':
    'Always 0 V',
  'learn.project.opampComparator.quiz.q2.explain':
    '+in above −in → high out.',
  'learn.project.opampComparator.quiz.q3.prompt':
    'Moving the pot Wiper…',
  'learn.project.opampComparator.quiz.q3.a':
    'Changes timing capacitance',
  'learn.project.opampComparator.quiz.q3.b':
    'Does nothing',
  'learn.project.opampComparator.quiz.q3.c':
    'Sweeps Vin across the threshold',
  'learn.project.opampComparator.quiz.q3.explain':
    'Wiper is the variable input.',
  'learn.project.opampComparator.challenge.c1.label':
    'Simulation completes without errors.',
  'learn.project.opampComparator.challenge.c2.label':
    'Circuit includes op-amp and potentiometer.',
  'learn.project.opampSchmitt.title':
    'Schmitt trigger',
  'learn.project.opampSchmitt.summary':
    'Comparator with hysteresis from positive feedback.',
  'learn.project.opampSchmitt.step1':
    'Open the sample — positive feedback Rf/Rg sets two trip points.',
  'learn.project.opampSchmitt.step2':
    'Run DC and move POT1 Wiper slowly up and down.',
  'learn.project.opampSchmitt.step3':
    'Notice the LED switches at different wiper positions going up vs down.',
  'learn.project.opampSchmitt.step4':
    'Probe +in (JP) — feedback shifts the effective threshold with OUT state.',
  'learn.project.opampSchmitt.openLab':
    'Open in Lab',
  'learn.project.opampSchmitt.lesson1.title':
    'Hysteresis',
  'learn.project.opampSchmitt.lesson1.body':
    'Positive feedback adds a fraction of OUT to the trip level, so rising and falling thresholds differ — noise near the threshold does not chatter.',
  'learn.project.opampSchmitt.lesson2.title':
    'Vs plain comparator',
  'learn.project.opampSchmitt.lesson2.body':
    'A plain comparator trips at one voltage both ways; Schmitt needs a larger swing to switch back.',
  'learn.project.opampSchmitt.quiz.q1.prompt':
    'Schmitt triggers add…',
  'learn.project.opampSchmitt.quiz.q1.a':
    'Hysteresis via positive feedback',
  'learn.project.opampSchmitt.quiz.q1.b':
    'Only series inductance',
  'learn.project.opampSchmitt.quiz.q1.c':
    'Unity-gain buffering',
  'learn.project.opampSchmitt.quiz.q1.explain':
    'Feedback shifts the threshold with output state.',
  'learn.project.opampSchmitt.quiz.q2.prompt':
    'Rising vs falling trip points are…',
  'learn.project.opampSchmitt.quiz.q2.a':
    'Always identical',
  'learn.project.opampSchmitt.quiz.q2.b':
    'Different (hysteresis band)',
  'learn.project.opampSchmitt.quiz.q2.c':
    'Random each run',
  'learn.project.opampSchmitt.quiz.q2.explain':
    'Two thresholds by design.',
  'learn.project.opampSchmitt.quiz.q3.prompt':
    'Hysteresis helps against…',
  'learn.project.opampSchmitt.quiz.q3.a':
    'Rail voltage',
  'learn.project.opampSchmitt.quiz.q3.b':
    'LED color',
  'learn.project.opampSchmitt.quiz.q3.c':
    'Noise chatter near the threshold',
  'learn.project.opampSchmitt.quiz.q3.explain':
    'Small noise cannot flip the state without crossing the other trip point.',
  'learn.project.opampSchmitt.challenge.c1.label':
    'Simulation completes without errors.',
  'learn.project.opampSchmitt.challenge.c2.label':
    'Circuit includes op-amp with feedback.',
  'learn.project.opampSumming.title':
    'Summing amplifier',
  'learn.project.opampSumming.summary':
    'Inverting summer: combine V1 and V2 through equal resistors.',
  'learn.project.opampSumming.step1':
    'Open the sample — V1 and V2 feed R1/R2 into the summing node.',
  'learn.project.opampSumming.step2':
    'Run DC: with R1=R2=Rf, Vout ≈ −(V1 + V2).',
  'learn.project.opampSumming.step3':
    'Change V2 and confirm the output tracks the sum.',
  'learn.project.opampSumming.step4':
    'Probe JS — virtual ground again.',
  'learn.project.opampSumming.openLab':
    'Open in Lab',
  'learn.project.opampSumming.lesson1.title':
    'Weighted sum',
  'learn.project.opampSumming.lesson1.body':
    'Each input current Vin/Rn adds at the summing node. With equal R and Rf, Vout = −(V1 + V2).',
  'learn.project.opampSumming.lesson2.title':
    'Audio / DAC intuition',
  'learn.project.opampSumming.lesson2.body':
    'Summing amps mix signals or binary-weighted currents in teaching DACs.',
  'learn.project.opampSumming.quiz.q1.prompt':
    'With equal Rin and Rf, Vout is…',
  'learn.project.opampSumming.quiz.q1.a':
    '−(V1 + V2)',
  'learn.project.opampSumming.quiz.q1.b':
    'V1 − V2',
  'learn.project.opampSumming.quiz.q1.c':
    'V1 × V2',
  'learn.project.opampSumming.quiz.q1.explain':
    'Equal-weight inverting summer.',
  'learn.project.opampSumming.quiz.q2.prompt':
    'Extra input channels connect through…',
  'learn.project.opampSumming.quiz.q2.a':
    'More resistors into the summing node',
  'learn.project.opampSumming.quiz.q2.b':
    'The +in pin only',
  'learn.project.opampSumming.quiz.q2.c':
    'Shorting OUT to ground',
  'learn.project.opampSumming.quiz.q2.explain':
    'Each source needs its own input resistor.',
  'learn.project.opampSumming.quiz.q3.prompt':
    'The summing node is held near…',
  'learn.project.opampSumming.quiz.q3.a':
    'Vcc',
  'learn.project.opampSumming.quiz.q3.b':
    'Virtual ground',
  'learn.project.opampSumming.quiz.q3.c':
    'V1 only',
  'learn.project.opampSumming.quiz.q3.explain':
    'Same as the inverting amp.',
  'learn.project.opampSumming.challenge.c1.label':
    'Simulation completes without errors.',
  'learn.project.opampSumming.challenge.c2.label':
    'Circuit includes op-amp and two input sources.',
  'learn.project.opampIntegrator.title':
    'Integrator',
  'learn.project.opampIntegrator.summary':
    'Inverting integrator: a pulse input makes OUT ramp over time.',
  'learn.project.opampIntegrator.step1':
    'Open the sample — pulse → Rin, capacitor Cf in the feedback path.',
  'learn.project.opampIntegrator.step2':
    'Confirm Transient mode (~30 ms) and Run.',
  'learn.project.opampIntegrator.step3':
    'Scrub the scope on OUT — it ramps while the pulse is high.',
  'learn.project.opampIntegrator.step4':
    'Try a longer pulse width or larger Cf and compare the slope.',
  'learn.project.opampIntegrator.openLab':
    'Open in Lab',
  'learn.project.opampIntegrator.lesson1.title':
    'Ramp from current',
  'learn.project.opampIntegrator.lesson1.body':
    'Feedback current charges Cf. Ideal Vout falls as −(1/Rin·Cf)·∫Vin dt for the inverting integrator.',
  'learn.project.opampIntegrator.lesson2.title':
    'Teaching limits',
  'learn.project.opampIntegrator.lesson2.body':
    'Real integrators need a large DC feedback resistor to limit drift; this sample shows the ideal ramp behaviour.',
  'learn.project.opampIntegrator.quiz.q1.prompt':
    'Feedback element in this integrator is…',
  'learn.project.opampIntegrator.quiz.q1.a':
    'A capacitor',
  'learn.project.opampIntegrator.quiz.q1.b':
    'Only a wire',
  'learn.project.opampIntegrator.quiz.q1.c':
    'An inductor',
  'learn.project.opampIntegrator.quiz.q1.explain':
    'Cf stores the integrated charge.',
  'learn.project.opampIntegrator.quiz.q2.prompt':
    'A constant positive Vin makes ideal Vout…',
  'learn.project.opampIntegrator.quiz.q2.a':
    'Stay at Vin',
  'learn.project.opampIntegrator.quiz.q2.b':
    'Ramp (negative direction for inverting)',
  'learn.project.opampIntegrator.quiz.q2.c':
    'Oscillate forever',
  'learn.project.opampIntegrator.quiz.q2.explain':
    'Integral of a constant is a ramp.',
  'learn.project.opampIntegrator.quiz.q3.prompt':
    'Best analysis mode here is…',
  'learn.project.opampIntegrator.quiz.q3.a':
    'DC only',
  'learn.project.opampIntegrator.quiz.q3.b':
    'AC single-frequency only',
  'learn.project.opampIntegrator.quiz.q3.c':
    'Transient',
  'learn.project.opampIntegrator.quiz.q3.explain':
    'You need time to see the ramp.',
  'learn.project.opampIntegrator.challenge.c1.label':
    'Simulation completes without errors.',
  'learn.project.opampIntegrator.challenge.c2.label':
    'Analysis mode is Transient.',
  'learn.project.opampDifferentiator.title':
    'Differentiator',
  'learn.project.opampDifferentiator.summary':
    'Inverting differentiator: OUT spikes on pulse edges.',
  'learn.project.opampDifferentiator.step1':
    'Open the sample — Cin in series with the pulse, Rf in feedback.',
  'learn.project.opampDifferentiator.step2':
    'Run Transient (~30 ms).',
  'learn.project.opampDifferentiator.step3':
    'Scrub OUT — sharp spikes appear at rising/falling edges.',
  'learn.project.opampDifferentiator.step4':
    'Increase Cin or Rf and observe taller/wider responses.',
  'learn.project.opampDifferentiator.openLab':
    'Open in Lab',
  'learn.project.opampDifferentiator.lesson1.title':
    'Edges only',
  'learn.project.opampDifferentiator.lesson1.body':
    'Capacitor current is C·dV/dt, so flat levels produce little output; edges produce spikes.',
  'learn.project.opampDifferentiator.lesson2.title':
    'Noise caution',
  'learn.project.opampDifferentiator.lesson2.body':
    'Differentiators emphasise fast changes — teaching models stay tame; real circuits often add a series R to limit gain at HF.',
  'learn.project.opampDifferentiator.quiz.q1.prompt':
    'Series input element here is…',
  'learn.project.opampDifferentiator.quiz.q1.a':
    'A capacitor',
  'learn.project.opampDifferentiator.quiz.q1.b':
    'Only a battery',
  'learn.project.opampDifferentiator.quiz.q1.c':
    'A fuse',
  'learn.project.opampDifferentiator.quiz.q1.explain':
    'Cin couples dV/dt into the amp.',
  'learn.project.opampDifferentiator.quiz.q2.prompt':
    'A flat DC input ideally yields…',
  'learn.project.opampDifferentiator.quiz.q2.a':
    'Huge DC gain',
  'learn.project.opampDifferentiator.quiz.q2.b':
    'Near-zero output',
  'learn.project.opampDifferentiator.quiz.q2.c':
    'A triangle wave',
  'learn.project.opampDifferentiator.quiz.q2.explain':
    'dV/dt ≈ 0 on a flat level.',
  'learn.project.opampDifferentiator.quiz.q3.prompt':
    'You mainly watch…',
  'learn.project.opampDifferentiator.quiz.q3.a':
    'Only the DC operating point',
  'learn.project.opampDifferentiator.quiz.q3.b':
    'Nothing',
  'learn.project.opampDifferentiator.quiz.q3.c':
    'Transient spikes on edges',
  'learn.project.opampDifferentiator.quiz.q3.explain':
    'Edges are the teaching signal.',
  'learn.project.opampDifferentiator.challenge.c1.label':
    'Simulation completes without errors.',
  'learn.project.opampDifferentiator.challenge.c2.label':
    'Analysis mode is Transient.',
  'learn.project.opampActiveFilter.title':
    'Active low-pass filter',
  'learn.project.opampActiveFilter.summary':
    'Inverting LPF: Rf∥C sets a cutoff near 1.6 kHz — explore with AC.',
  'learn.project.opampActiveFilter.step1':
    'Open the sample — AC source into Rin; Rf parallel Cf in feedback.',
  'learn.project.opampActiveFilter.step2':
    'Confirm AC mode (try 100 Hz, then 10 kHz).',
  'learn.project.opampActiveFilter.step3':
    'Run and compare |Vout| — low frequencies pass, high frequencies attenuate.',
  'learn.project.opampActiveFilter.step4':
    'Change Cf or Rf to move the cutoff and re-run.',
  'learn.project.opampActiveFilter.openLab':
    'Open in Lab',
  'learn.project.opampActiveFilter.lesson1.title':
    'First-order LPF',
  'learn.project.opampActiveFilter.lesson1.body':
    'At low f, C is open and gain ≈ −Rf/Rin. At high f, C shunts Rf and gain falls.',
  'learn.project.opampActiveFilter.lesson2.title':
    'Why active?',
  'learn.project.opampActiveFilter.lesson2.body':
    'The op-amp isolates the filter and can provide gain; passive RC alone cannot boost.',
  'learn.project.opampActiveFilter.quiz.q1.prompt':
    'Raising frequency well above cutoff…',
  'learn.project.opampActiveFilter.quiz.q1.a':
    'Increases |Vout|',
  'learn.project.opampActiveFilter.quiz.q1.b':
    'Leaves gain unchanged',
  'learn.project.opampActiveFilter.quiz.q1.c':
    'Attenuates the output',
  'learn.project.opampActiveFilter.quiz.q1.explain':
    'Low-pass behaviour.',
  'learn.project.opampActiveFilter.quiz.q2.prompt':
    'Feedback capacitor mainly affects…',
  'learn.project.opampActiveFilter.quiz.q2.a':
    'Only LED colour',
  'learn.project.opampActiveFilter.quiz.q2.b':
    'High-frequency gain (shunts Rf)',
  'learn.project.opampActiveFilter.quiz.q2.c':
    'Battery ESR only',
  'learn.project.opampActiveFilter.quiz.q2.explain':
    'C shorts Rf as f rises.',
  'learn.project.opampActiveFilter.quiz.q3.prompt':
    'Best analysis mode for this sample is…',
  'learn.project.opampActiveFilter.quiz.q3.a':
    'AC',
  'learn.project.opampActiveFilter.quiz.q3.b':
    'DC only',
  'learn.project.opampActiveFilter.quiz.q3.c':
    'No simulation',
  'learn.project.opampActiveFilter.quiz.q3.explain':
    'Frequency response is an AC story.',
  'learn.project.opampActiveFilter.challenge.c1.label':
    'Simulation completes without errors.',
  'learn.project.opampActiveFilter.challenge.c2.label':
    'Analysis mode is AC.',

  'learn.module.filters.title':
    'Filters & analog signals',
  'learn.module.motors.title':
    'Motors & power electronics',
  'learn.module.digital.title':
    'Digital logic',
  'learn.project.rcLowPass.title':
    'RC low-pass',
  'learn.project.rcLowPass.summary':
    'Series R and shunt C attenuate high frequencies — classic first-order LPF.',
  'learn.project.rcLowPass.step1':
    'Open the sample — AC drives R into C; voltmeter across C.',
  'learn.project.rcLowPass.step2':
    'Run AC at ~1 kHz (near the design fc) and note VM magnitude.',
  'learn.project.rcLowPass.step3':
    'Raise the AC frequency decade by decade — output should fall.',
  'learn.project.rcLowPass.step4':
    'Lower C or R to move fc; confirm the knee moves with 1/(2πRC).',
  'learn.project.rcLowPass.openLab':
    'Open in Lab',
  'lab.toolbar.rcLowPassPreset':
    'RC low-pass (AC)',
  'learn.challenge.tab.rcLowPass':
    'RC low-pass',
  'learn.project.rcLowPass.lesson1.title':
    'First-order LPF',
  'learn.project.rcLowPass.lesson2.title':
    'Where you see it',
  'learn.project.rcHighPass.title':
    'RC high-pass',
  'learn.project.rcHighPass.summary':
    'Series C and shunt R pass highs and block DC — first-order HPF.',
  'learn.project.rcHighPass.step1':
    'Open the sample — AC through C into R; probe across R.',
  'learn.project.rcHighPass.step2':
    'Run AC near the design fc and note the output magnitude.',
  'learn.project.rcHighPass.step3':
    'Drop frequency toward DC — output should collapse.',
  'learn.project.rcHighPass.step4':
    'Change C or R and watch fc = 1/(2πRC) move.',
  'learn.project.rcHighPass.openLab':
    'Open in Lab',
  'lab.toolbar.rcHighPassPreset':
    'RC high-pass (AC)',
  'learn.challenge.tab.rcHighPass':
    'RC high-pass',
  'learn.project.rcHighPass.lesson1.title':
    'First-order HPF',
  'learn.project.rcHighPass.lesson2.title':
    'Uses',
  'learn.project.rlcSeries.title':
    'Series RLC',
  'learn.project.rlcSeries.summary':
    'R, L, and C in series show resonance and impedance peaking.',
  'learn.project.rlcSeries.step1':
    'Open the series RLC sample with a voltmeter on the sense node.',
  'learn.project.rlcSeries.step2':
    'Sweep AC around the design resonance and find the peak response.',
  'learn.project.rlcSeries.step3':
    'Note how current (or drop on R) peaks when XL ≈ XC.',
  'learn.project.rlcSeries.step4':
    'Change L or C and confirm fr ≈ 1/(2π√(LC)) moves.',
  'learn.project.rlcSeries.openLab':
    'Open in Lab',
  'lab.toolbar.rlcSeriesPreset':
    'RLC series (AC)',
  'learn.challenge.tab.rlcSeries':
    'Series RLC',
  'learn.project.rlcSeries.lesson1.title':
    'Resonance',
  'learn.project.rlcSeries.lesson2.title':
    'Teaching takeaway',
  'learn.project.bandPass.title':
    'Band-pass filter',
  'learn.project.bandPass.summary':
    'RLC band-pass passes a band around resonance and rejects far above/below.',
  'learn.project.bandPass.step1':
    'Open the band-pass sample and Run AC near the center frequency.',
  'learn.project.bandPass.step2':
    'Move far below and far above — both ends should attenuate.',
  'learn.project.bandPass.step3':
    'Find the peak near resonance with the voltmeter.',
  'learn.project.bandPass.step4':
    'Tweak L/C to shift the pass band.',
  'learn.project.bandPass.openLab':
    'Open in Lab',
  'lab.toolbar.bandPassPreset':
    'Band-pass (AC)',
  'learn.challenge.tab.bandPass':
    'Band-pass filter',
  'learn.project.bandPass.lesson1.title':
    'Pass a band',
  'learn.project.bandPass.lesson2.title':
    'Vs LPF/HPF',
  'learn.project.notchFilter.title':
    'Notch filter',
  'learn.project.notchFilter.summary':
    'A notch (band-stop) rejects a narrow band — useful for killing one tone.',
  'learn.project.notchFilter.step1':
    'Open the notch sample (series Rs, load, shunt L–C) and Run AC near 1 kHz.',
  'learn.project.notchFilter.step2':
    'Voltmeter on the load should show a deep dip at the notch.',
  'learn.project.notchFilter.step3':
    'Move frequency away — |Vout| recovers toward the pass level.',
  'learn.project.notchFilter.step4':
    'Change L/C to retune the reject frequency.',
  'learn.project.notchFilter.openLab':
    'Open in Lab',
  'lab.toolbar.notchFilterPreset':
    'Notch filter (AC)',
  'learn.challenge.tab.notchFilter':
    'Notch filter',
  'learn.project.notchFilter.lesson1.title':
    'Reject a tone',
  'learn.project.notchFilter.lesson2.title':
    'Uses',
  'learn.project.voltageDivider.title':
    'Voltage divider',
  'learn.project.voltageDivider.summary':
    'Two resistors split a DC rail — the foundation of bias and reference levels.',
  'learn.project.voltageDivider.step1':
    'Open the divider — V1 → R1 → mid → R2 → gnd; probe the mid node.',
  'learn.project.voltageDivider.step2':
    'Run DC and confirm Vmid ≈ V1 · R2/(R1+R2).',
  'learn.project.voltageDivider.step3':
    'Swap R1/R2 values and re-run — the mid voltage tracks the ratio.',
  'learn.project.voltageDivider.step4':
    'Add a light load from mid to gnd and see the divider sag.',
  'learn.project.voltageDivider.openLab':
    'Open in Lab',
  'lab.toolbar.voltageDividerPreset':
    'Voltage divider (DC)',
  'learn.challenge.tab.voltageDivider':
    'Voltage divider',
  'learn.project.voltageDivider.lesson1.title':
    'Ratio rule',
  'learn.project.voltageDivider.lesson2.title':
    'Loading',
  'learn.project.potDivider.title':
    'Potentiometer as divider',
  'learn.project.potDivider.summary':
    'A pot is a continuous divider — wiper position sets the tap voltage.',
  'learn.project.potDivider.step1':
    'Open the pot sample — ends across the rail, wiper is the tap.',
  'learn.project.potDivider.step2':
    'Run DC and probe the wiper node.',
  'learn.project.potDivider.step3':
    'Move the wiper slider; Vwiper sweeps between the rails.',
  'learn.project.potDivider.step4':
    'Note loading: a low impedance on the wiper bends the “linear” feel.',
  'learn.project.potDivider.openLab':
    'Open in Lab',
  'learn.challenge.tab.pot':
    'Potentiometer as divider',
  'learn.project.potDivider.lesson1.title':
    'Moving tap',
  'learn.project.potDivider.lesson2.title':
    'Same math as fixed dividers',
  'learn.project.measureAc.title':
    'Measure frequency & amplitude',
  'learn.project.measureAc.summary':
    'Use AC analysis and a voltmeter to read magnitude at a chosen frequency.',
  'learn.project.measureAc.step1':
    'Open the measure-AC sample with source, path, and voltmeter.',
  'learn.project.measureAc.step2':
    'Run AC at the listed frequency — read VM magnitude.',
  'learn.project.measureAc.step3':
    'Change source mag and confirm the probe scales.',
  'learn.project.measureAc.step4':
    'Change frequency and watch reactive networks reshape the reading.',
  'learn.project.measureAc.openLab':
    'Open in Lab',
  'lab.toolbar.measureAcPreset':
    'Measure AC (AC)',
  'learn.challenge.tab.measureAc':
    'Measure frequency & amplitude',
  'learn.project.measureAc.lesson1.title':
    'AC observables',
  'learn.project.measureAc.lesson2.title':
    'Lab habit',
  'learn.project.motorMosfet.title':
    'DC motor + MOSFET',
  'learn.project.motorMosfet.summary':
    'Low-side NMOS switches a DC motor — gate high means current flows.',
  'learn.project.motorMosfet.step1':
    'Open the motor sample — battery, motor, NMOS, flyback diode, switch on the gate.',
  'learn.project.motorMosfet.step2':
    'Close S1, Run DC — motor current should flow.',
  'learn.project.motorMosfet.step3':
    'Open S1 and re-run — current stops.',
  'learn.project.motorMosfet.step4':
    'Confirm Dfly cathode toward +V across the motor.',
  'learn.project.motorMosfet.openLab':
    'Open in Lab',
  'learn.challenge.tab.motor':
    'DC motor + MOSFET',
  'learn.project.motorMosfet.lesson1.title':
    'Low-side switch',
  'learn.project.motorMosfet.lesson2.title':
    'Always plan the diode',
  'learn.project.motorPwm.title':
    'PWM motor speed',
  'learn.project.motorPwm.summary':
    'A pulse source on the MOSFET gate averages motor voltage — duty cycle sets speed.',
  'learn.project.motorPwm.step1':
    'Open the PWM motor sample — pulse → gate resistor → NMOS + flyback.',
  'learn.project.motorPwm.step2':
    'Run transient and watch motor current pulse with the gate.',
  'learn.project.motorPwm.step3':
    'Change pulse width (duty) — average drive should follow.',
  'learn.project.motorPwm.step4':
    'Keep the flyback diode; PWM without it is abusive to the switch.',
  'learn.project.motorPwm.openLab':
    'Open in Lab',
  'lab.toolbar.motorPwmPreset':
    'Motor PWM (transient)',
  'learn.challenge.tab.motorPwm':
    'PWM motor speed',
  'learn.project.motorPwm.lesson1.title':
    'Average voltage',
  'learn.project.motorPwm.lesson2.title':
    'Why not a linear resistor?',
  'learn.project.motorFlyback.title':
    'Flyback diode',
  'learn.project.motorFlyback.summary':
    'Focus on the diode across the motor — it clamps inductive kick when the switch opens.',
  'learn.project.motorFlyback.step1':
    'Open the motor sample and locate Dfly across MOT1.',
  'learn.project.motorFlyback.step2':
    'Run with S1 closed, then open S1 — the diode is there for the turn-off event.',
  'learn.project.motorFlyback.step3':
    'Mentally reverse Dfly: that would be wrong (crowbar risk).',
  'learn.project.motorFlyback.step4':
    'Compare with the relay flyback lesson — same inductive idea.',
  'learn.project.motorFlyback.openLab':
    'Open in Lab',
  'learn.project.motorFlyback.lesson1.title':
    'Inductive kick',
  'learn.project.motorFlyback.lesson2.title':
    'Placement',
  'learn.project.hBridge.title':
    'H-bridge',
  'learn.project.hBridge.summary':
    'Four switches around a motor — diagonal pairs set forward current.',
  'learn.project.hBridge.step1':
    'Open the H-bridge — S1+S4 closed (forward), S2+S3 open.',
  'learn.project.hBridge.step2':
    'Run DC and confirm motor current direction.',
  'learn.project.hBridge.step3':
    'Never close both high and low on the same leg (shoot-through).',
  'learn.project.hBridge.step4':
    'Compare with the reverse sample next.',
  'learn.project.hBridge.openLab':
    'Open in Lab',
  'lab.toolbar.hBridgePreset':
    'H-bridge (DC)',
  'learn.challenge.tab.hBridge':
    'H-bridge',
  'learn.project.hBridge.lesson1.title':
    'Diagonal drive',
  'learn.project.hBridge.lesson2.title':
    'Teaching model',
  'learn.project.motorDirection.title':
    'Motor reverse',
  'learn.project.motorDirection.summary':
    'Same H-bridge with the opposite diagonal closed — current (and spin) reverse.',
  'learn.project.motorDirection.step1':
    'Open the reverse sample — S2+S3 closed, S1+S4 open.',
  'learn.project.motorDirection.step2':
    'Run DC and compare motor current sign vs the forward bridge.',
  'learn.project.motorDirection.step3':
    'Toggle which diagonal is closed in your head before flipping switches.',
  'learn.project.motorDirection.step4':
    'Leave dead-time between diagonals in real hardware.',
  'learn.project.motorDirection.openLab':
    'Open in Lab',
  'lab.toolbar.motorDirectionPreset':
    'Motor reverse (DC)',
  'learn.challenge.tab.motorDirection':
    'Motor reverse',
  'learn.project.motorDirection.lesson1.title':
    'Flip the diagonal',
  'learn.project.motorDirection.lesson2.title':
    'Safe sequencing',
  'learn.project.pullUpDown.title':
    'Pull-up / pull-down',
  'learn.project.pullUpDown.summary':
    'A resistor defines the idle level so a switch to ground (or VCC) makes a clean digital edge.',
  'learn.project.pullUpDown.step1':
    'Open the pull-up sample — Rpu to VCC, switch to ground, LED shows the sense node.',
  'learn.project.pullUpDown.step2':
    'S1 open → sense high → LED on; close S1 → sense low → LED off.',
  'learn.project.pullUpDown.step3':
    'Imagine removing Rpu — the sense node would float when the switch is open.',
  'learn.project.pullUpDown.step4':
    'A pull-down is the mirror: resistor to ground, switch to VCC.',
  'learn.project.pullUpDown.openLab':
    'Open in Lab',
  'lab.toolbar.pullUpDownPreset':
    'Pull-up / pull-down (DC)',
  'learn.challenge.tab.pullUpDown':
    'Pull-up / pull-down',
  'learn.project.pullUpDown.lesson1.title':
    'Idle level',
  'learn.project.pullUpDown.lesson2.title':
    'Strong vs weak',
  'learn.project.debounce.title':
    'RC debounce',
  'learn.project.debounce.summary':
    'A capacitor on the switch node slows edges so contact bounce does not chatter the gate.',
  'learn.project.debounce.step1':
    'Open the debounce sample — pull-up, switch, C on the sense node, NMOS+LED.',
  'learn.project.debounce.step2':
    'Run DC with S1 open — LED state reflects the idle level through the FET.',
  'learn.project.debounce.step3':
    'Close S1 — C and R set a slower edge than raw bounce.',
  'learn.project.debounce.step4':
    'Think: without C, mechanical bounce could pulse the gate many times.',
  'learn.project.debounce.openLab':
    'Open in Lab',
  'lab.toolbar.debouncePreset':
    'RC debounce (DC)',
  'learn.challenge.tab.debounce':
    'RC debounce',
  'learn.project.debounce.lesson1.title':
    'Bounce',
  'learn.project.debounce.lesson2.title':
    'RC softens edges',

  'learn.module.sensors.title':
    'Sensors',
  'learn.module.comms.title':
    'Communication',
  'learn.module.adcDac.title':
    'ADC / DAC',
  'learn.module.industrial.title':
    'Relays & industrial control',
  'learn.project.sensorLdr.title':
    'LDR as a light sensor',
  'learn.project.sensorLdr.summary':
    'An LDR changes resistance with light — a divider turns that into a usable gate/ADC voltage.',
  'learn.project.sensorLdr.step1':
    'Open the LDR night-light sample — R1 and LDR form a divider into the MOSFET gate.',
  'learn.project.sensorLdr.step2':
    'Run DC with low Light — LED should be on (dark).',
  'learn.project.sensorLdr.step3':
    'Raise Light on LDR1 — gate voltage falls and the LED turns off.',
  'learn.project.sensorLdr.step4':
    'Probe JG: that voltage is the “sensor signal” the rest of the circuit uses.',
  'learn.project.sensorLdr.openLab':
    'Open in Lab',
  'learn.project.sensorPot.title':
    'Potentiometer as a sensor',
  'learn.project.sensorPot.summary':
    'A pot is a continuous position/angle sensor — the wiper voltage is the signal.',
  'learn.project.sensorPot.step1':
    'Open the pot sample — ends on the rail, wiper is the tap.',
  'learn.project.sensorPot.step2':
    'Run DC and probe the wiper.',
  'learn.project.sensorPot.step3':
    'Move the slider — Vwiper sweeps between the rails.',
  'learn.project.sensorPot.step4':
    'Think of joysticks, throttle pedals, and setpoints: same electrical idea.',
  'learn.project.sensorPot.openLab':
    'Open in Lab',
  'learn.project.ntcDivider.title':
    'NTC / thermistor divider',
  'learn.project.ntcDivider.summary':
    'A temperature-dependent R in a divider yields a voltage vs temperature — pot stands in for the NTC here.',
  'learn.project.ntcDivider.step1':
    'Open the sample — R1 and NTC1 (pot stand-in) form a divider; probe VM1.',
  'learn.project.ntcDivider.step2':
    'Run DC and note the mid voltage.',
  'learn.project.ntcDivider.step3':
    'Change NTC1 position (as if temperature changed R) and re-probe.',
  'learn.project.ntcDivider.step4':
    'Same wiring works for a real NTC: only the R-vs-T curve differs.',
  'learn.project.ntcDivider.openLab':
    'Open in Lab',
  'lab.toolbar.ntcDividerPreset':
    'NTC divider (DC)',
  'learn.challenge.tab.ntcDivider':
    'NTC / thermistor divider',
  'learn.project.sensorThreshold.title':
    'Sensor vs threshold',
  'learn.project.sensorThreshold.summary':
    'Compare a sensor-like voltage to a fixed threshold — digital high/low for “too dark / too hot”.',
  'learn.project.sensorThreshold.step1':
    'Open the comparator sample — pot is the “sensor”; RA/RB set ~2.5 V on −in.',
  'learn.project.sensorThreshold.step2':
    'Run DC and watch the LED / OUT rail.',
  'learn.project.sensorThreshold.step3':
    'Sweep the pot across the threshold — OUT flips.',
  'learn.project.sensorThreshold.step4':
    'Replace the pot mentally with an LDR or NTC divider mid-node.',
  'learn.project.sensorThreshold.openLab':
    'Open in Lab',
  'learn.project.commsI2c.title':
    'I²C wiring',
  'learn.project.commsI2c.summary':
    'Shared SDA/SCL need pull-ups — address the device, then talk bytes (wiring first).',
  'learn.project.commsI2c.step1':
    'Open the I²C OLED sample — Arduino I²C master, SSD1306, pull-ups.',
  'learn.project.commsI2c.step2':
    'Confirm SDA/SCL and the pull-ups to VCC.',
  'learn.project.commsI2c.step3':
    'Run DC — wiring should be clean; display is a teaching stand-in.',
  'learn.project.commsI2c.step4':
    'Note the address idea (0x3C vs 0x3D) without bit-banging yet.',
  'learn.project.commsI2c.openLab':
    'Open in Lab',
  'learn.project.adcFrontEnd.title':
    'ADC front-end voltage',
  'learn.project.adcFrontEnd.summary':
    'Before digits: an ADC samples a voltage between 0 and a reference — practice that voltage first.',
  'learn.project.adcFrontEnd.step1':
    'Open the pot sample — treat the wiper as the analog pin voltage.',
  'learn.project.adcFrontEnd.step2':
    'Run DC and probe the wiper.',
  'learn.project.adcFrontEnd.step3':
    'Sweep pos — this is what analogRead would quantize.',
  'learn.project.adcFrontEnd.step4':
    'Stay within 0…Vref; beyond that, real ADCs clip or risk damage.',
  'learn.project.adcFrontEnd.openLab':
    'Open in Lab',
  'learn.project.adcReference.title':
    'Reference / full-scale idea',
  'learn.project.adcReference.summary':
    'Full-scale and mid-scale voltages come from ratios — a divider makes the idea concrete.',
  'learn.project.adcReference.step1':
    'Open the voltage divider — mid node is a known fraction of the rail.',
  'learn.project.adcReference.step2':
    'Run DC and confirm Vmid ≈ V · R2/(R1+R2).',
  'learn.project.adcReference.step3':
    'Think of Vref as the top of the ADC ruler; codes count fractions of that span.',
  'learn.project.adcReference.step4':
    'Change R1/R2 — the “scale marks” move with the ratio.',
  'learn.project.adcReference.openLab':
    'Open in Lab',
  'learn.project.pwmFilter.title':
    'PWM as pseudo-DAC',
  'learn.project.pwmFilter.summary':
    'Duty cycle + RC low-pass approximates a DC level — cheap digital-to-analog.',
  'learn.project.pwmFilter.step1':
    'Open the PWM filter — pulse into R then C; voltmeter on the cap.',
  'learn.project.pwmFilter.step2':
    'Run transient and let the average settle on VM1.',
  'learn.project.pwmFilter.step3':
    'Change pulse width (duty) — average voltage should follow.',
  'learn.project.pwmFilter.step4':
    'Raise C or R to smooth more (slower response).',
  'learn.project.pwmFilter.openLab':
    'Open in Lab',
  'lab.toolbar.pwmFilterPreset':
    'PWM filter / DAC (transient)',
  'learn.challenge.tab.pwmFilter':
    'PWM as pseudo-DAC',
  'learn.project.relayBjt.title':
    'Relay + transistor driver',
  'learn.project.relayBjt.summary':
    'A BJT switches the coil so a weak logic/signal can control a stronger contact path.',
  'learn.project.relayBjt.step1':
    'Open the sample — S1 → RB → Q1 drives the relay coil; Dfly across the coil.',
  'learn.project.relayBjt.step2':
    'Run DC with S1 closed — contacts should pull and the LED light.',
  'learn.project.relayBjt.step3':
    'Open S1 — coil drops, LED off.',
  'learn.project.relayBjt.step4':
    'Note: MCU pins often need this (or a MOSFET/driver IC) — not the coil current directly.',
  'learn.project.relayBjt.openLab':
    'Open in Lab',
  'lab.toolbar.relayBjtPreset':
    'Relay + BJT (DC)',
  'learn.challenge.tab.relayBjt':
    'Relay + transistor driver',
  'learn.project.mosfetDriver.title':
    'MOSFET driver switch',
  'learn.project.mosfetDriver.summary':
    'NMOS as a solid-state switch for loads — gate control, low on drop when enhanced.',
  'learn.project.mosfetDriver.step1':
    'Open the NMOS LED switch — close S1, Run DC, LED on.',
  'learn.project.mosfetDriver.step2':
    'Open S1 — LED off.',
  'learn.project.mosfetDriver.step3':
    'Note RG and RPD: controlled gate, defined off state.',
  'learn.project.mosfetDriver.step4':
    'Same pattern drives relays, lamps, and (with care) motors.',
  'learn.project.mosfetDriver.openLab':
    'Open in Lab',
  'learn.project.coilProtect.title':
    'Coil protection (flyback)',
  'learn.project.coilProtect.summary':
    'Inductive coils spike when switched off — a diode (or snubber) protects the driver.',
  'learn.project.coilProtect.step1':
    'Open the relay sample and find Dfly across the coil.',
  'learn.project.coilProtect.step2':
    'Run with S1 closed — coil and load path work.',
  'learn.project.coilProtect.step3':
    'Mentally remove Dfly: turn-off spikes would hit the switch.',
  'learn.project.coilProtect.step4':
    'Same rule for solenoids, contactors, and many industrial coils.',
  'learn.project.coilProtect.openLab':
    'Open in Lab',
  'learn.project.inductiveLoad.title':
    'Inductive load awareness',
  'learn.project.inductiveLoad.summary':
    'Motors and coils store energy — switching them needs freewheel paths and rated drivers.',
  'learn.project.inductiveLoad.step1':
    'Open the motor + MOSFET sample with Dfly across the motor.',
  'learn.project.inductiveLoad.step2':
    'Run with the gate switch closed — current flows.',
  'learn.project.inductiveLoad.step3':
    'Open the switch — Dfly is there for the inductive kick.',
  'learn.project.inductiveLoad.step4':
    'Scale the lesson to contactors and big solenoids in industrial panels.',
  'learn.project.inductiveLoad.openLab':
    'Open in Lab',
  'learn.project.estopRelay.title':
    'E-stop principle',
  'learn.project.estopRelay.summary':
    'A series e-stop must stay closed for the coil path — opening it drops the load regardless of S1.',
  'learn.project.estopRelay.step1':
    'Open the sample — SESTOP then S1 feed the coil.',
  'learn.project.estopRelay.step2':
    'Run with both closed — LED/contacts active.',
  'learn.project.estopRelay.step3':
    'Open SESTOP — coil drops even if S1 stays closed.',
  'learn.project.estopRelay.step4':
    'Real e-stops are safety-rated devices; this teaches the series-interrupt idea only.',
  'learn.project.estopRelay.openLab':
    'Open in Lab',
  'lab.toolbar.estopRelayPreset':
    'E-stop relay (DC)',
  'learn.challenge.tab.estopRelay':
    'E-stop principle',
  'learn.project.industrial24v.title':
    'Basic 24 V control',
  'learn.project.industrial24v.summary':
    'Many panels use 24 V DC for coils and signals — same relay idea, higher rail, still need flyback.',
  'learn.project.industrial24v.step1':
    'Open the 24 V sample — VB is 24 V; S1 feeds the coil with Dfly.',
  'learn.project.industrial24v.step2':
    'Run DC with S1 closed — contacts and LED path energize.',
  'learn.project.industrial24v.step3':
    'Note series RC on the LED — higher voltage needs current limiting.',
  'learn.project.industrial24v.step4':
    'Open S1 — coil drops cleanly with the diode in place.',
  'learn.project.industrial24v.openLab':
    'Open in Lab',
  'lab.toolbar.industrial24vPreset':
    '24 V control (DC)',
  'learn.challenge.tab.industrial24v':
    'Basic 24 V control',


  // --- overnight soon units ---
  'learn.project.diodeDirection.title': 'Diode direction',
  'learn.project.diodeDirection.summary':
    'See why diode orientation matters — forward lights the LED; reverse blocks the path.',
  'learn.project.diodeDirection.step1': 'Open the diode direction example and Run DC — the LED should light.',
  'learn.project.diodeDirection.step2': 'Select D1 and note anode toward the supply, cathode toward the LED.',
  'learn.project.diodeDirection.step3': 'Rewire or rotate so the diode is reversed, Run again — the LED stays dark.',
  'learn.project.diodeDirection.step4': 'Put it back forward and confirm current returns.',
  'learn.project.diodeDirection.openLab': 'Open in Lab',

  'learn.project.seriesParallel.title': 'Series vs parallel intuition',
  'learn.project.seriesParallel.summary':
    'Two LED branches in parallel — same voltage on each path, currents add at the supply.',
  'learn.project.seriesParallel.step1': 'Open the parallel branches example and Run DC — both LEDs should light.',
  'learn.project.seriesParallel.step2': 'Probe each LED current — they should be similar with equal R.',
  'learn.project.seriesParallel.step3': 'Raise R2 a lot — D2 dims while D1 stays bright (independent branches).',
  'learn.project.seriesParallel.step4':
    'Open the Series LEDs sample too — same current through both LEDs, unlike parallel branches.',
  'learn.project.seriesParallel.openLab': 'Open in Lab',

  'learn.project.motorSpeed.title': 'Motor speed via PWM',
  'learn.project.motorSpeed.summary':
    'Same PWM motor drive — focus on duty cycle as the speed knob.',
  'learn.project.motorSpeed.step1': 'Open the PWM motor example and Run Transient.',
  'learn.project.motorSpeed.step2': 'Increase pulse width (duty) and compare motor drive.',
  'learn.project.motorSpeed.step3': 'Decrease duty — average voltage falls and the motor slows.',
  'learn.project.motorSpeed.step4': 'Keep the flyback diode in place while you tune.',
  'learn.project.motorSpeed.openLab': 'Open in Lab',

  'lab.toolbar.diodeDirectionPreset': 'Diode direction (DC)',
  'lab.toolbar.seriesParallelPreset': 'Parallel LED branches (DC)',
  'lab.toolbar.seriesLedsPreset': 'Series LEDs (DC)',
  'lab.hint.diodeDirection':
    'Diode direction: Run DC — LED on when D1 is forward. Reverse the diode and it blocks.',
  'lab.hint.seriesParallel':
    'Parallel LEDs: Run DC — both branches light. Change one R; only that branch dims.',
  'lab.hint.seriesLeds':
    'Series LEDs: Run DC — same current through both. Compare with the parallel branches sample.',

  'learn.project.fundamentalsLoop.title': 'The simple loop',
  'learn.project.fundamentalsLoop.summary':
    'Battery, resistor, LED, and ground — the smallest complete circuit that teaches current and return path.',
  'learn.project.fundamentalsLoop.step1': 'Open the Lab LED example and Run DC.',
  'learn.project.fundamentalsLoop.step2': 'Trace the loop: battery + → resistor → LED → ground → battery −.',
  'learn.project.fundamentalsLoop.step3': 'Remove the mental “mystery” — current needs a closed path.',
  'learn.project.fundamentalsLoop.step4': 'Probe a node or the LED to see voltage/current labels.',
  'learn.project.fundamentalsLoop.openLab': 'Open in Lab',

  'learn.project.ohmExplore.title': 'Ohm’s law by feel',
  'learn.project.ohmExplore.summary':
    'Change series resistance and watch LED current move — Ohm’s law without the spreadsheet.',
  'learn.project.ohmExplore.step1': 'Open the LED example and note the LED current after Run DC.',
  'learn.project.ohmExplore.step2': 'Lower R1 — current rises; raise R1 — current falls.',
  'learn.project.ohmExplore.step3': 'Keep the LED bright but not overloaded (~10–20 mA teaching range).',
  'learn.project.ohmExplore.step4': 'Write down one R and I pair so the “more R → less I” rule sticks.',
  'learn.project.ohmExplore.openLab': 'Open in Lab',

  'learn.project.ledBurnLimit.title': 'When an LED burns out',
  'learn.project.ledBurnLimit.summary':
    'Push current too high on purpose, see Lab burnout, then Replace the LED and restore a safe resistor.',
  'learn.project.ledBurnLimit.step1': 'Open the LED example and Run DC with a normal R1 (~220 Ω).',
  'learn.project.ledBurnLimit.step2': 'Lower R1 until the LED burns (teaching limit ~35 mA).',
  'learn.project.ledBurnLimit.step3': 'Use Replace LED, then raise R1 back to a safe value.',
  'learn.project.ledBurnLimit.step4': 'Run again — current should be healthy and the LED intact.',
  'learn.project.ledBurnLimit.openLab': 'Open in Lab',

  'learn.project.timeConstant.title': 'Estimate τ on the scope',
  'learn.project.timeConstant.summary':
    'Use Transient on the RC example and judge time constant by eye — where the curve reaches ~63% of the final rise.',
  'learn.project.timeConstant.step1': 'Open RC charge and Run Transient.',
  'learn.project.timeConstant.step2': 'Probe capacitor voltage and scrub the scope.',
  'learn.project.timeConstant.step3': 'Mentally mark ~63% of the final voltage — that time is about one τ.',
  'learn.project.timeConstant.step4': 'Change R or C and confirm τ stretches or shrinks.',
  'learn.project.timeConstant.openLab': 'Open in Lab',

  'learn.project.pulseRc.title': 'Pulse edges into RC',
  'learn.project.pulseRc.summary':
    'Drive an RC with a pulse source and watch edges get rounded — the bridge between digital edges and analog timing.',
  'learn.project.pulseRc.step1': 'Open the Pulse RC example and Run Transient.',
  'learn.project.pulseRc.step2': 'Probe the capacitor node — edges should soften vs the pulse.',
  'learn.project.pulseRc.step3': 'Change R or C and compare edge speed.',
  'learn.project.pulseRc.step4': 'Try a wider pulse width and see the capacitor approach the high level.',
  'learn.project.pulseRc.openLab': 'Open in Lab',

  'learn.project.acRcLpf.title': 'AC feel of a low-pass',
  'learn.project.acRcLpf.summary':
    'Use AC analysis on an RC low-pass — magnitude drops as frequency rises past the teaching cutoff.',
  'learn.project.acRcLpf.step1': 'Open the AC RC example and select AC analysis.',
  'learn.project.acRcLpf.step2': 'Run at a low frequency, then raise frequency and compare magnitude.',
  'learn.project.acRcLpf.step3': 'Identify that high frequencies are attenuated more.',
  'learn.project.acRcLpf.step4': 'Relate the feel back to the Transient RC charge story.',
  'learn.project.acRcLpf.openLab': 'Open in Lab',

  'learn.project.ne555Play.title': 'NE555 Christmas tree',
  'learn.project.ne555Play.summary':
    'Same astable 555 idea with many LEDs — practice seeing multiple loads blink together.',
  'learn.project.ne555Play.step1': 'Open the Christmas tree example and Run Transient.',
  'learn.project.ne555Play.step2': 'Watch several LEDs blink with the 555 output.',
  'learn.project.ne555Play.step3': 'Change RA/RB or CT and see the blink rate shift.',
  'learn.project.ne555Play.step4': 'Compare with the single-LED astable — same timer, richer load.',
  'learn.project.ne555Play.openLab': 'Open in Lab',

  'learn.project.ne555Pot.title': 'NE555 blink with a pot',
  'learn.project.ne555Pot.summary':
    'Tune blink rate with a potentiometer on the 555 timing network — same astable, live control.',
  'learn.project.ne555Pot.step1': 'Open the NE555 + pot example and Run Transient.',
  'learn.project.ne555Pot.step2': 'Move the potentiometer slider and watch period change.',
  'learn.project.ne555Pot.step3': 'Leave it mid-range and confirm stable blinking.',
  'learn.project.ne555Pot.step4': 'Relate pot position to effective timing resistance.',
  'learn.project.ne555Pot.openLab': 'Open in Lab',

  'learn.project.pinInput.title': 'Defined inputs vs floating',
  'learn.project.pinInput.summary':
    'MCU pins need defined levels — contrast a driven output LED with the idea of a floating input.',
  'learn.project.pinInput.step1': 'Open the Arduino LED example and Run DC with the pin driving the LED.',
  'learn.project.pinInput.step2': 'Think of the same pin as an input — without a pull, it can float.',
  'learn.project.pinInput.step3': 'Compare with the pull-up/pull-down Lab example if you have it open in another tab.',
  'learn.project.pinInput.step4': 'Remember: outputs drive; inputs should be defined.',
  'learn.project.pinInput.openLab': 'Open in Lab',

  'learn.project.i2cAddress.title': 'I²C address idea (0x3C)',
  'learn.project.i2cAddress.summary':
    'Same OLED wiring — focus on why devices need an address on a shared bus.',
  'learn.project.i2cAddress.step1': 'Open the I2C OLED sample and confirm pull-ups on SDA/SCL.',
  'learn.project.i2cAddress.step2': 'Find the teaching address (often 0x3C) in the part/inspector notes.',
  'learn.project.i2cAddress.step3': 'Imagine a second device — each needs a unique address on the bus.',
  'learn.project.i2cAddress.step4': 'Run DC to confirm the wiring still solves cleanly.',
  'learn.project.i2cAddress.openLab': 'Open in Lab',

  'learn.project.bjtVsMos.title': 'BJT vs MOSFET switch',
  'learn.project.bjtVsMos.summary':
    'Compare current-driven BJT switching with voltage-driven NMOS switching using the Lab examples.',
  'learn.project.bjtVsMos.step1': 'Open the NMOS LED switch and Run with the gate driven.',
  'learn.project.bjtVsMos.step2': 'Open the BC547 example in another tab and compare base current vs gate voltage thinking.',
  'learn.project.bjtVsMos.step3': 'Note series base resistor vs gate resistor roles.',
  'learn.project.bjtVsMos.step4': 'Remember: teaching models are switches — not full SPICE devices.',
  'learn.project.bjtVsMos.openLab': 'Open in Lab',

  'learn.project.inductiveWhyDiode.title': 'Why the flyback diode?',
  'learn.project.inductiveWhyDiode.summary':
    'Focus on the diode across a relay coil — what inductive kick is and how the diode protects the switch.',
  'learn.project.inductiveWhyDiode.step1': 'Open the relay + flyback example and Run with S1 closed.',
  'learn.project.inductiveWhyDiode.step2': 'Select the flyback diode and confirm cathode toward coil+.',
  'learn.project.inductiveWhyDiode.step3': 'Open S1 and think about coil current needing a path when the switch opens.',
  'learn.project.inductiveWhyDiode.step4': 'Compare with the motor + diode sample — same idea on a spinning load.',
  'learn.project.inductiveWhyDiode.openLab': 'Open in Lab',

  ...LEARN_ASSESSMENT_I18N
};

/** Ordered key list for guardrail tests — keep in sync with TranslationSeeder. */
export const I18N_CATALOG_KEYS: readonly string[] = Object.keys(EN_FALLBACK);

export const DEFAULT_LOCALE = 'en';
