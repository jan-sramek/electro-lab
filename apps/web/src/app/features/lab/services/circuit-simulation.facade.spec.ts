import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { CircuitApiClient } from '../api/circuit-api.client';
import { SimulateResponse } from '../api/circuit-api.types';
import { createLedFadePreset } from '../data/presets/led-fade.preset';
import { I18nService } from '../../../core/i18n/i18n.service';
import { CircuitSimulationFacade } from './circuit-simulation.facade';
import { LabEditorStore } from './lab-editor.store';
import { SchematicPersistence } from './schematic-persistence';

describe('CircuitSimulationFacade.runAndWait', () => {
  let facade: CircuitSimulationFacade;
  let api: { simulate: jasmine.Spy };

  beforeEach(() => {
    api = {
      simulate: jasmine.createSpy('simulate').and.returnValue(
        of({
          schemaVersion: 1,
          ok: true,
          analysisType: 'dcOp',
          errors: [],
          warnings: [],
          dcOp: { nodeVoltages: {}, branchCurrents: {} }
        })
      )
    };
    TestBed.configureTestingModule({
      providers: [
        SchematicPersistence,
        LabEditorStore,
        CircuitSimulationFacade,
        { provide: CircuitApiClient, useValue: api },
        {
          provide: I18nService,
          useValue: { t: (k: string) => k }
        }
      ]
    });
    facade = TestBed.inject(CircuitSimulationFacade);
    const editor = TestBed.inject(LabEditorStore);
    editor.initFromStorage();
    editor.loadLedPreset();
  });

  it('resolves after a successful explicit run settles', async () => {
    await facade.runAndWait(5000);
    expect(facade.busy()).toBeFalse();
    expect(facade.result()?.ok).toBeTrue();
  });

  it('resolves on empty netlist without hanging', async () => {
    const editor = TestBed.inject(LabEditorStore);
    editor.newSchematic();
    api.simulate.calls.reset();
    await facade.runAndWait(2000);
    expect(facade.busy()).toBeFalse();
    expect(api.simulate).not.toHaveBeenCalled();
  });
});

describe('CircuitSimulationFacade job lifecycle', () => {
  let facade: CircuitSimulationFacade;
  let editor: LabEditorStore;
  let api: { simulate: jasmine.Spy };
  let pending: Subject<SimulateResponse>[];

  /** firstValueFrom() resolves on a microtask — let the pipeline observe emitted responses. */
  const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

  const dcOk = (): SimulateResponse => ({
    schemaVersion: 1,
    ok: true,
    analysisType: 'dcOp',
    errors: [],
    warnings: [],
    dcOp: { nodeVoltages: {}, branchCurrents: {} }
  });

  /** Capacitor still charging fast relative to τ so the continuation loop wants another segment. */
  const tranCharging = (): SimulateResponse => {
    const doc = editor.doc();
    const cap = doc.components.find((c) => c.modelKey === 'capacitor')!;
    const na = cap.pins['a'].net;
    return {
      schemaVersion: 1,
      ok: true,
      analysisType: 'tran',
      errors: [],
      warnings: [],
      tran: {
        time: [0, 1e-5, 2e-5],
        nodeVoltages: [{ id: na, values: [0, 1, 2] }],
        branchCurrents: []
      }
    };
  };

  beforeEach(() => {
    localStorage.clear();
    pending = [];
    api = {
      simulate: jasmine.createSpy('simulate').and.callFake(() => {
        const s = new Subject<SimulateResponse>();
        pending.push(s);
        return s.asObservable();
      })
    };
    TestBed.configureTestingModule({
      providers: [
        SchematicPersistence,
        LabEditorStore,
        CircuitSimulationFacade,
        { provide: CircuitApiClient, useValue: api },
        { provide: I18nService, useValue: { t: (k: string) => k } }
      ]
    });
    facade = TestBed.inject(CircuitSimulationFacade);
    editor = TestBed.inject(LabEditorStore);
    editor.initFromStorage();
    editor.loadLedPreset();
    // Let the revision effect see the initial tab (its slot-change branch clears `result`).
    TestBed.flushEffects();
  });

  afterEach(() => {
    editor.flushPersist();
    localStorage.clear();
  });

  it('clears busy when an explicit Run is superseded by a quiet auto-run', async () => {
    facade.run();
    expect(facade.busy()).toBeTrue();
    expect(pending.length).toBe(1);

    facade.runLive();
    expect(facade.busy()).withContext('superseded explicit run must release busy').toBeFalse();
    expect(pending.length).toBe(2);

    pending[1].next(dcOk());
    pending[1].complete();
    await settle();
    expect(facade.result()?.ok).toBeTrue();
    expect(facade.busy()).toBeFalse();
  });

  it('keeps busy while the superseding run is itself explicit', async () => {
    facade.run();
    facade.run();
    expect(facade.busy()).toBeTrue();
    pending[1].next(dcOk());
    pending[1].complete();
    await settle();
    expect(facade.busy()).toBeFalse();
    expect(facade.result()?.ok).toBeTrue();
  });

  it('drops a result whose circuit was edited while the job was in flight', async () => {
    facade.run();
    editor.placeModelAt('resistor', 0, 0); // electrical change after the job was created
    pending[0].next(dcOk());
    pending[0].complete();
    await settle();
    expect(facade.result()).toBeNull();
    expect(facade.busy()).toBeFalse();
  });

  it('chains transient segments while the job is current (control)', async () => {
    editor.loadRcPreset();
    editor.setTStop(3);
    editor.setDt(5e-5);
    facade.run();
    expect(pending.length).toBe(1);
    pending[0].next(tranCharging());
    pending[0].complete();
    await settle();
    expect(pending.length).withContext('second segment requested').toBe(2);
  });

  it('stops issuing transient segments once the job is superseded', async () => {
    editor.loadRcPreset();
    editor.setTStop(3);
    editor.setDt(5e-5);
    facade.run();
    expect(pending.length).toBe(1);
    const first = pending[0];
    expect(first.observers.length).toBe(1);

    facade.runLive();
    const callsAfterSupersede = api.simulate.calls.count();
    expect(first.observers.length).withContext('in-flight request aborted').toBe(0);
    expect(facade.busy()).toBeFalse();

    first.next(tranCharging());
    first.complete();
    await settle();
    expect(api.simulate.calls.count()).toBe(callsAfterSupersede);
  });

  it('applies RC teaching timing once and never overrides user tStop/dt afterwards', () => {
    editor.loadLedFadePreset();
    TestBed.flushEffects();
    expect(editor.analysisMode()).toBe('tran');
    expect(editor.tStop()).toBe(6);

    editor.setTStop(0.2);
    editor.setDt(2e-5);
    TestBed.flushEffects();
    expect(editor.tStop()).toBe(0.2);
    expect(editor.dt()).toBe(2e-5);

    // Switch toggle used to re-force the teaching defaults on every revision.
    const s1 = editor.doc().components.find((c) => c.modelKey === 'switch')!;
    editor.setSelection([s1.id]);
    editor.onParamChange({ key: 'closed', value: !s1.params['closed'] });
    TestBed.flushEffects();
    expect(editor.tStop()).toBe(0.2);
    expect(editor.dt()).toBe(2e-5);

    facade.run();
    TestBed.flushEffects();
    expect(editor.tStop()).toBe(0.2);
  });

  it('applies teaching defaults when a factory-timing tab first becomes an RC+switch circuit', () => {
    editor.addCircuitTab();
    TestBed.flushEffects();
    expect(editor.analysisMode()).toBe('dcOp');

    editor.onDocChange(createLedFadePreset());
    TestBed.flushEffects();
    expect(editor.analysisMode()).toBe('tran');
    expect(editor.tStop()).toBe(6);
    expect(editor.dt()).toBe(0.002);

    editor.setTStop(0.3);
    TestBed.flushEffects();
    expect(editor.tStop()).toBe(0.3);
  });
});
