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

  'lab.title': 'Circuit Lab',
  'lab.intro': 'Build a schematic, wire pins, and run DC or transient analysis.',
  'lab.hint':
    'Drag parts from the palette onto the canvas (or click a part, then click to place). Wire pin-to-pin, then Run. When the circuit solves, green dashes on wires show current flowing. An LED is bright near 20 mA; above ~35 mA it burns out and becomes an open circuit (fire graphic) until you replace it — always use enough series resistance. Drag an empty area to box-select; drag any selected part to move the group. Ctrl/Cmd-click or Ctrl/Cmd-drag to add to the selection. Click a wire to select it, then Delete. Example circuits open in a new tab. Ctrl+D duplicate; Ctrl+C/V copy/paste. In Wire mode, click an existing wire for a T-junction. Wheel to zoom; Shift-drag to pan. Drag on the scope to scrub time.',

  'lab.toolbar.select': 'Select',
  'lab.toolbar.wire': 'Wire',
  'lab.toolbar.probe': 'Probe',
  'lab.toolbar.dc': 'DC',
  'lab.toolbar.transient': 'Transient',
  'lab.toolbar.tStop': 'tStop (s)',
  'lab.toolbar.dt': 'dt (s)',
  'lab.toolbar.undo': 'Undo',
  'lab.toolbar.redo': 'Redo',
  'lab.toolbar.duplicate': 'Duplicate',
  'lab.toolbar.delete': 'Delete',
  'lab.toolbar.presets': 'Open example…',
  'lab.toolbar.ledPreset': 'LED series (DC)',
  'lab.toolbar.rcPreset': 'RC charge (transient)',
  'lab.toolbar.potPreset': 'Potentiometer divider (DC)',
  'lab.toolbar.pulsePreset': 'Pulse into RC (transient)',
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

  'lab.palette.title': 'Parts',
  'lab.palette.dragHint': 'Drag a symbol onto the canvas, or click then click to place.',

  'lab.symbol.battery': 'Battery',
  'lab.symbol.resistor': 'Resistor',
  'lab.symbol.led': 'LED',
  'lab.symbol.diode': 'Diode',
  'lab.symbol.switch': 'Switch',
  'lab.symbol.current_source': 'Current source',
  'lab.symbol.capacitor': 'Capacitor',
  'lab.symbol.inductor': 'Inductor',
  'lab.symbol.potentiometer': 'Potentiometer',
  'lab.symbol.pulse_source': 'Pulse source',
  'lab.symbol.ground': 'Ground',
  'lab.symbol.junction': 'Junction',

  'lab.param.voltage': 'Voltage',
  'lab.param.resistance': 'Resistance',
  'lab.param.forwardV': 'Forward V',
  'lab.param.onResistance': 'On resistance',
  'lab.param.closed': 'Closed',
  'lab.param.current': 'Current',
  'lab.param.capacitance': 'Capacitance',
  'lab.param.inductance': 'Inductance',
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
  'lab.results.empty': 'Run a simulation to see results.',

  'lab.scope.title': 'Scope',
  'lab.scope.vsTime': '{id} vs time',
  'lab.scope.channelV': '{id} (V)',
  'lab.scope.channelI': '{id} (mA)',
  'lab.scope.scrubTime': 't = {t} s',
  'lab.scope.ariaWaveform': 'Transient waveform',
  'lab.scope.empty': 'Run transient analysis to plot waveforms.',

  'lab.canvas.aria': 'Schematic canvas',

  'lab.led.overloaded': 'Overloaded!',
  'lab.led.failedOpen': 'Burned out!',
  'lab.led.burnedWarning':
    'LED {ids} burned out from too much current and is now an open circuit. Replace it and add enough series resistance.',
  'lab.inspector.ledBurned':
    'This LED burned out (open circuit). Current no longer flows through it. Replace the LED and use a proper series resistor (~220 Ω for 5 V).',
  'lab.inspector.replaceLed': 'Replace LED',

  'lab.probe.netFinal': 'Net {id} (final): {v} V',
  'lab.probe.netAt': 'Net {id} @ {t} s: {v} V',
  'lab.probe.netEmpty': 'Net {id}: —',
  'lab.probe.netDc': 'Net {id}: {v} V',
  'lab.probe.branchFinal': '{id} (final): {i} mA',
  'lab.probe.branchAt': '{id} @ {t} s: {i} mA',
  'lab.probe.branchEmpty': '{id}: —',
  'lab.probe.branchDc': '{id}: {i} mA',

  'lab.sim.requestFailed': 'Request failed',
  'lab.sim.failed': 'Simulation failed',

  'learn.title': 'Learn',
  'learn.body':
    'Guided electronics projects will live here. The Circuit Lab is the active surface; this route is reserved in the product shell.',

  'account.title': 'Account',
  'account.body': 'Sign-in and profile will live here. Coming soon.'
};

/** Ordered key list for guardrail tests — keep in sync with TranslationSeeder. */
export const I18N_CATALOG_KEYS: readonly string[] = Object.keys(EN_FALLBACK);

export const DEFAULT_LOCALE = 'en';
