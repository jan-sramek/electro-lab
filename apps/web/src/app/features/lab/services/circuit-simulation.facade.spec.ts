import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CircuitApiClient } from '../api/circuit-api.client';
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
    spyOn(window, 'confirm').and.returnValue(true);
    editor.newSchematic();
    api.simulate.calls.reset();
    await facade.runAndWait(2000);
    expect(facade.busy()).toBeFalse();
    expect(api.simulate).not.toHaveBeenCalled();
  });
});
