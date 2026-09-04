import {
  SINGULAR_FALLBACK_KEY,
  diagnoseSchematic,
  diagnosticMessageKey,
  isSingularMatrixMessage
} from './circuit-diagnostics';
import {
  assignNets,
  compileNetlist,
  createComponent,
  emptyDocument,
  splitWireAtJunction
} from './schematic.model';
import { createLedPreset } from './presets/led-series.preset';
import { createRcStepPreset } from './presets/rc-step.preset';
import { EN_FALLBACK } from '../../../core/i18n/en-fallback';

describe('circuit-diagnostics', () => {
  it('reports empty_circuit when only empty doc', () => {
    const diags = diagnoseSchematic(emptyDocument(), 'dcOp');
    expect(diags.map((d) => d.code)).toEqual(['empty_circuit']);
    expect(diags[0].messageKey).toBe('diag.empty_circuit');
    expect(diags[0].severity).toBe('error');
  });

  it('reports no_ground when parts exist without ground', () => {
    const doc = {
      groundNet: 'gnd',
      components: [createComponent('battery', 0, 0, 'V1')],
      wires: []
    };
    const diags = diagnoseSchematic(doc, 'dcOp');
    expect(diags.some((d) => d.code === 'no_ground')).toBeTrue();
  });

  it('reports ground_disconnected and floating_component', () => {
    const v1 = createComponent('battery', 0, 0, 'V1');
    const gnd = createComponent('ground', 0, 100, 'GND1');
    const doc = { groundNet: 'gnd', components: [v1, gnd], wires: [] };
    const diags = diagnoseSchematic(doc, 'dcOp');
    expect(diags.some((d) => d.code === 'ground_disconnected')).toBeTrue();
    expect(diags.some((d) => d.code === 'floating_component')).toBeTrue();
    expect(diags.find((d) => d.code === 'floating_component')!.componentIds).toContain('V1');
  });

  it('reports floating_component when a two-pin part has only one terminal wired', () => {
    const v1 = createComponent('battery', 0, 0, 'V1');
    const r1 = createComponent('resistor', 100, 0, 'R1');
    const gnd = createComponent('ground', 0, 100, 'GND1');
    const doc = assignNets({
      groundNet: 'gnd',
      components: [v1, r1, gnd],
      wires: [
        { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'R1', pin: 'a' } },
        { id: 'W2', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
        // R1.b left dangling on purpose
      ]
    });
    const diags = diagnoseSchematic(doc, 'dcOp');
    const floating = diags.find((d) => d.code === 'floating_component');
    expect(floating).toBeTruthy();
    expect(floating!.componentIds).toContain('R1');
  });

  it('reports floating_component when an NMOS is missing the source pin', () => {
    const v1 = createComponent('battery', 0, 0, 'V1');
    const m1 = createComponent('nmos', 100, 0, 'M1');
    const gnd = createComponent('ground', 0, 100, 'GND1');
    const doc = assignNets({
      groundNet: 'gnd',
      components: [v1, m1, gnd],
      wires: [
        { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'M1', pin: 'd' } },
        { id: 'W2', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'M1', pin: 'g' } },
        { id: 'W3', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
        // M1.s dangling
      ]
    });
    const diags = diagnoseSchematic(doc, 'dcOp');
    expect(diags.find((d) => d.code === 'floating_component')?.componentIds).toContain('M1');
  });

  it('allows potentiometer rheostat use with only two pins wired', () => {
    const v1 = createComponent('battery', 0, 0, 'V1');
    const pot = createComponent('potentiometer', 100, 0, 'POT1');
    const gnd = createComponent('ground', 0, 100, 'GND1');
    const doc = assignNets({
      groundNet: 'gnd',
      components: [v1, pot, gnd],
      wires: [
        { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'POT1', pin: 'a' } },
        { id: 'W2', a: { componentId: 'POT1', pin: 'w' }, b: { componentId: 'GND1', pin: 'g' } },
        { id: 'W3', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
      ]
    });
    const diags = diagnoseSchematic(doc, 'dcOp');
    expect(diags.find((d) => d.code === 'floating_component')?.componentIds ?? []).not.toContain('POT1');
  });

  it('maps singular matrix and keeps i18n keys in sync with fallback', () => {
    expect(isSingularMatrixMessage('Singular circuit matrix (check ground...)')).toBeTrue();
    expect(SINGULAR_FALLBACK_KEY).toBe('diag.singular_fallback');
    expect(EN_FALLBACK[diagnosticMessageKey('no_ground')]).toContain('Ground');
    expect(EN_FALLBACK[SINGULAR_FALLBACK_KEY].length).toBeGreaterThan(10);
    expect(EN_FALLBACK[diagnosticMessageKey('ac_nonlinear_open')]).toContain('AC');
    expect(EN_FALLBACK[diagnosticMessageKey('ac_source_tran_no_freq')]).toContain('Frequency');
    expect(EN_FALLBACK[diagnosticMessageKey('switch_inductor_spike')]).toContain('inductor');
  });

  it('warns when nonlinear devices are present in AC mode', () => {
    const diags = diagnoseSchematic(createLedPreset(), 'ac');
    expect(diags.some((d) => d.code === 'ac_nonlinear_open')).toBeTrue();
  });

  it('warns when ac_source lacks freq in transient', () => {
    const ac = createComponent('ac_source', 0, 0, 'AC1');
    ac.params['freq'] = 0;
    const gnd = createComponent('ground', 0, 100, 'GND1');
    const doc = assignNets({
      groundNet: 'gnd',
      components: [ac, gnd],
      wires: [{ id: 'W1', a: { componentId: 'AC1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }]
    });
    const diags = diagnoseSchematic(doc, 'tran');
    expect(diags.some((d) => d.code === 'ac_source_tran_no_freq')).toBeTrue();
  });

  it('errors when a battery positives and negatives share one net', () => {
    const v1 = createComponent('battery', 0, 0, 'V1');
    const gnd = createComponent('ground', 0, 100, 'GND1');
    const j = createComponent('junction', 40, 0, 'J1');
    const doc = assignNets({
      groundNet: 'gnd',
      components: [v1, j, gnd],
      wires: [
        { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'J1', pin: 'j' } },
        { id: 'W2', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'J1', pin: 'j' } },
        { id: 'W3', a: { componentId: 'J1', pin: 'j' }, b: { componentId: 'GND1', pin: 'g' } }
      ]
    });
    const diags = diagnoseSchematic(doc, 'dcOp');
    expect(diags.find((d) => d.code === 'shorted_voltage_source')?.componentIds).toContain('V1');
  });

  it('warns that RC networks need transient in dcOp', () => {
    const diags = diagnoseSchematic(createRcStepPreset(), 'dcOp');
    expect(diags.some((d) => d.code === 'dc_rc_needs_tran')).toBeTrue();
    expect(diags.find((d) => d.code === 'dc_rc_needs_tran')!.severity).toBe('warning');
  });

  it('warns on capacitor-only islands in dcOp', () => {
    const v1 = createComponent('battery', 0, 0, 'V1');
    const c1 = createComponent('capacitor', 100, 0, 'C1');
    const c2 = createComponent('capacitor', 200, 0, 'C2');
    const gnd = createComponent('ground', 0, 100, 'GND1');
    const doc = assignNets({
      groundNet: 'gnd',
      components: [v1, c1, c2, gnd],
      wires: [
        { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'C1', pin: 'a' } },
        { id: 'W2', a: { componentId: 'C1', pin: 'b' }, b: { componentId: 'C2', pin: 'a' } },
        { id: 'W3', a: { componentId: 'C2', pin: 'b' }, b: { componentId: 'GND1', pin: 'g' } },
        { id: 'W4', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
      ]
    });
    const diags = diagnoseSchematic(doc, 'dcOp');
    const island = diags.find((d) => d.code === 'dc_capacitor_island');
    expect(island).toBeTruthy();
    expect(island!.componentIds).toContain('C1');
    expect(island!.componentIds).toContain('C2');
  });

  it('warns when a switch and inductor share a transient schematic', () => {
    const v1 = createComponent('battery', 0, 0, 'V1');
    const s1 = createComponent('switch', 80, 0, 'S1');
    const l1 = createComponent('inductor', 160, 0, 'L1');
    const gnd = createComponent('ground', 0, 100, 'GND1');
    const doc = assignNets({
      groundNet: 'gnd',
      components: [v1, s1, l1, gnd],
      wires: [
        { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'S1', pin: 'a' } },
        { id: 'W2', a: { componentId: 'S1', pin: 'b' }, b: { componentId: 'L1', pin: 'a' } },
        { id: 'W3', a: { componentId: 'L1', pin: 'b' }, b: { componentId: 'GND1', pin: 'g' } },
        { id: 'W4', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
      ]
    });
    const diags = diagnoseSchematic(doc, 'tran');
    expect(diags.some((d) => d.code === 'switch_inductor_spike')).toBeTrue();
  });
});

describe('junction nets', () => {
  it('unifies three resistors at a T-junction onto one net', () => {
    const r1 = createComponent('resistor', 100, 100, 'R1');
    const r2 = createComponent('resistor', 300, 100, 'R2');
    const r3 = createComponent('resistor', 200, 200, 'R3');
    const j = createComponent('junction', 200, 100, 'J1');
    const gnd = createComponent('ground', 100, 280, 'GND1');
    const v1 = createComponent('battery', 100, 180, 'V1');

    let doc = {
      groundNet: 'gnd',
      components: [v1, r1, r2, r3, j, gnd],
      wires: [
        { id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'R1', pin: 'a' } },
        { id: 'W2', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'J1', pin: 'j' } },
        { id: 'W3', a: { componentId: 'R2', pin: 'a' }, b: { componentId: 'J1', pin: 'j' } },
        { id: 'W4', a: { componentId: 'R3', pin: 'a' }, b: { componentId: 'J1', pin: 'j' } },
        { id: 'W5', a: { componentId: 'R2', pin: 'b' }, b: { componentId: 'GND1', pin: 'g' } },
        { id: 'W6', a: { componentId: 'R3', pin: 'b' }, b: { componentId: 'GND1', pin: 'g' } },
        { id: 'W7', a: { componentId: 'V1', pin: 'n' }, b: { componentId: 'GND1', pin: 'g' } }
      ]
    };
    doc = assignNets(doc);
    const midR1 = doc.components.find((c) => c.id === 'R1')!.pins['b'].net;
    const midR2 = doc.components.find((c) => c.id === 'R2')!.pins['a'].net;
    const midR3 = doc.components.find((c) => c.id === 'R3')!.pins['a'].net;
    expect(midR1).toBe(midR2);
    expect(midR2).toBe(midR3);

    const compiled = compileNetlist(doc);
    expect(compiled.elements.some((e) => e.model === 'junction')).toBeFalse();
  });

  it('splitWireAtJunction replaces one wire with two', () => {
    const a = createComponent('resistor', 0, 0, 'R1');
    const b = createComponent('resistor', 100, 0, 'R2');
    const j = createComponent('junction', 50, 0, 'J1');
    const doc = {
      groundNet: 'gnd',
      components: [a, b, j],
      wires: [{ id: 'W1', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'R2', pin: 'a' } }]
    };
    const next = splitWireAtJunction(doc, 'W1', 'J1');
    expect(next.wires.length).toBe(2);
    expect(next.wires.every((w) => w.a.componentId === 'J1' || w.b.componentId === 'J1')).toBeTrue();
  });

  it('pin finished onto a wire shares one net after junction split', () => {
    const r1 = createComponent('resistor', 0, 0, 'R1');
    const r2 = createComponent('resistor', 100, 0, 'R2');
    const r3 = createComponent('resistor', 50, 60, 'R3');
    const j = createComponent('junction', 50, 0, 'J1');
    let doc = {
      groundNet: 'gnd',
      components: [r1, r2, r3, j],
      wires: [{ id: 'W1', a: { componentId: 'R1', pin: 'b' }, b: { componentId: 'R2', pin: 'a' } }]
    };
    doc = splitWireAtJunction(doc, 'W1', 'J1');
    doc = {
      ...doc,
      wires: [
        ...doc.wires,
        { id: 'W2', a: { componentId: 'R3', pin: 'a' }, b: { componentId: 'J1', pin: 'j' } }
      ]
    };
    const nettled = assignNets(doc);
    const nR1 = nettled.components.find((c) => c.id === 'R1')!.pins['b'].net;
    const nR3 = nettled.components.find((c) => c.id === 'R3')!.pins['a'].net;
    const nJ = nettled.components.find((c) => c.id === 'J1')!.pins['j'].net;
    expect(nR1).toBe(nJ);
    expect(nR3).toBe(nJ);
  });
});
