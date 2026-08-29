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

  it('accepts LED preset without errors', () => {
    const diags = diagnoseSchematic(createLedPreset(), 'dcOp');
    expect(diags.filter((d) => d.severity === 'error').length).toBe(0);
  });

  it('maps singular matrix and keeps i18n keys in sync with fallback', () => {
    expect(isSingularMatrixMessage('Singular circuit matrix (check ground...)')).toBeTrue();
    expect(SINGULAR_FALLBACK_KEY).toBe('diag.singular_fallback');
    expect(EN_FALLBACK[diagnosticMessageKey('no_ground')]).toContain('Ground');
    expect(EN_FALLBACK[SINGULAR_FALLBACK_KEY].length).toBeGreaterThan(10);
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
});
