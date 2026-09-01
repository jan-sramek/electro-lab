/**
 * Embedded English fallback — keep in sync with
 * services/learning-api/Seed/TranslationSeeder.cs English dictionary.
 */
export const EN_FALLBACK: Record<string, string> = {
  'shell.brand': 'Electro Lab',
  'shell.nav.lab': 'Lab',
  'shell.nav.learn': 'Learn',
  'shell.nav.account': 'Account',

  'diag.empty_circuit': 'Place parts from the palette, then wire them and add Ground.',
  'diag.no_ground': 'Add a Ground symbol and wire it to your circuit return path.',
  'diag.ground_disconnected': 'Ground is not connected — wire Ground to the circuit.',
  'diag.floating_component':
    'Some parts are unwired (highlighted). Connect every pin you need, or delete unused parts.',
  'diag.dc_capacitor_island':
    'In DC mode capacitors are open. Use Transient, or add a resistive path.',
  'diag.shorted_voltage_source':
    'A voltage source has both terminals on the same net (highlighted). Separate the pins.',
  'diag.singular_fallback':
    'Circuit cannot be solved. Check Ground is wired and there are no floating parts.',
  'diag.ac_nonlinear_open':
    'LED, diode, and BJT are treated as open in AC analysis (highlighted). Use Transient for switching behavior.',
  'diag.ac_source_tran_no_freq':
    'AC source needs Frequency (Hz) > 0 for a sine wave in Transient. Without it the source is 0 V.',
  'diag.switch_inductor_spike':
    'Switching an inductor can make large voltage spikes (ideal teaching model). Use care with openAt/closeAt timing.',

  'lab.title': 'Circuit Lab',
  'lab.fromLearn': 'From Learn:',
  'lab.backToLearnSteps': '← Back to steps',
  'lab.intro': 'Build a schematic, wire pins, and run DC, transient, or AC analysis.',
  'lab.hint':
    'Drag parts from the palette onto the canvas (or click a part, then click to place). Wire pin-to-pin, then Run. When the circuit solves, green dashes on wires show current flowing. An LED is bright near 20 mA; above ~35 mA it burns out and becomes an open circuit (fire graphic) until you replace it — always use enough series resistance. Drag an empty area to box-select; drag any selected part to move the group. Ctrl/Cmd-click or Ctrl/Cmd-drag to add to the selection. Click a wire to select it, then Delete. Example circuits open in a new tab. Ctrl+D duplicate; Ctrl+C/V copy/paste. Wheel to zoom; Shift-drag to pan. Drag on the scope to scrub time.',
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
    'NE555 astable: Run Transient (~100 ms) — three LEDs blink from OUT. Watch playback or scrub OUT / CT on the scope. Too little R1–R3 or Vcc above ~18 V burns the timer open.',
  'lab.hint.christmasTree':
    'NE555 Christmas tree: Run Transient (~100 ms) — ten LEDs blink in a pyramid from OUT. Watch playback or probe any LED. Too little R1–R10 or high Vcc burns the timer open.',
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
  'lab.toolbar.christmasTreePreset': 'NE555 Christmas tree (transient)',
  'lab.toolbar.pushbuttonPreset': 'Pushbutton LED (DC)',
  'lab.toolbar.ldrPreset': 'LDR night-light (DC)',
  'lab.toolbar.buzzerPreset': 'Buzzer + button (DC)',
  'lab.toolbar.motorPreset': 'NMOS + DC motor (DC)',
  'lab.toolbar.arduinoPreset': 'Arduino LED pin (DC)',
  'lab.toolbar.i2cOledPreset': 'I2C OLED SSD1306 (DC)',
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
    'Fading: capacitor is discharging through the resistor and LED. Scrub the scope or watch playback.',
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
  'learn.module.switching.title': 'Transistors & relays',
  'learn.module.timing.title': 'Timing circuits',
  'learn.module.input.title': 'Buttons & sensors',
  'learn.module.actuators.title': 'Buzzers & motors',
  'learn.module.mcu.title': 'Arduino-style I/O',
  'learn.module.buses.title': 'Serial buses',

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
  'account.body': 'Sign-in and profile will live here. Coming soon.'
};

/** Ordered key list for guardrail tests — keep in sync with TranslationSeeder. */
export const I18N_CATALOG_KEYS: readonly string[] = Object.keys(EN_FALLBACK);

export const DEFAULT_LOCALE = 'en';
