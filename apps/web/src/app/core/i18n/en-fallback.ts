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
  'diag.singular_fallback':
    'Circuit cannot be solved. Check Ground is wired and there are no floating parts.',

  'lab.title': 'Circuit Lab',
  'lab.intro': 'Build a schematic, wire pins, and run DC or transient analysis.',
  'lab.hint':
    'Place parts from the palette, switch to Wire and click two pins, then Run. In Wire mode, click an existing wire to add a T-junction. Wheel to zoom; Shift-drag to pan. In Select mode, click a wire to delete it.',

  'lab.toolbar.select': 'Select',
  'lab.toolbar.wire': 'Wire',
  'lab.toolbar.probe': 'Probe',
  'lab.toolbar.dc': 'DC',
  'lab.toolbar.transient': 'Transient',
  'lab.toolbar.undo': 'Undo',
  'lab.toolbar.redo': 'Redo',
  'lab.toolbar.ledPreset': 'LED preset',
  'lab.toolbar.rcPreset': 'RC preset',
  'lab.toolbar.new': 'New',
  'lab.toolbar.run': 'Run',
  'lab.toolbar.running': 'Running…',

  'lab.palette.title': 'Parts',

  'lab.symbol.battery': 'Battery',
  'lab.symbol.resistor': 'Resistor',
  'lab.symbol.led': 'LED',
  'lab.symbol.diode': 'Diode',
  'lab.symbol.switch': 'Switch',
  'lab.symbol.current_source': 'Current source',
  'lab.symbol.capacitor': 'Capacitor',
  'lab.symbol.inductor': 'Inductor',
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

  'lab.inspector.title': 'Inspector',
  'lab.inspector.rotate': 'Rotate 90°',
  'lab.inspector.delete': 'Delete',
  'lab.inspector.empty': 'Select a component to edit its parameters.',

  'lab.results.title': 'Results',
  'lab.results.nodeVoltages': 'Node voltages',
  'lab.results.branchCurrents': 'Branch currents',
  'lab.results.tranSamples': 'Transient: {count} samples (see scope).',
  'lab.results.finalNodeVoltages': 'Final node voltages',
  'lab.results.empty': 'Run a simulation to see results.',

  'lab.scope.title': 'Scope',
  'lab.scope.vsTime': '{id} vs time',
  'lab.scope.ariaWaveform': 'Transient waveform',
  'lab.scope.empty': 'Run transient analysis to plot waveforms.',

  'lab.canvas.aria': 'Schematic canvas',

  'lab.probe.netFinal': 'Net {id} (final): {v} V',
  'lab.probe.netEmpty': 'Net {id}: —',
  'lab.probe.netDc': 'Net {id}: {v} V',
  'lab.probe.branchFinal': '{id} (final): {i} mA',
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
