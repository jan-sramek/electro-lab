import { TestBed } from '@angular/core/testing';
import { LabEditorStore } from './lab-editor.store';
import { SchematicPersistence } from './schematic-persistence';

describe('LabEditorStore challenge sim lock', () => {
  let editor: LabEditorStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SchematicPersistence, LabEditorStore]
    });
    editor = TestBed.inject(LabEditorStore);
    editor.beginLearnChallenge({
      tabName: 'Challenge',
      analysisMode: 'tran',
      tStop: 2,
      dt: 0.002,
      initFromDc: true
    });
    expect(editor.learnChallengeMode()).toBeTrue();
    expect(editor.tStop()).toBe(2);
  });

  it('keeps SPECS timing after peeking ledFade (openExample uses tStop 6)', () => {
    editor.loadLedFadePreset();
    expect(editor.learnChallengeMode()).toBeTrue();
    expect(editor.doc().components.some((c) => c.modelKey === 'capacitor')).toBeTrue();
    expect(editor.analysisMode()).toBe('tran');
    expect(editor.tStop()).withContext('must not adopt openExample tStop=6').toBe(2);
    expect(editor.dt()).toBe(0.002);
    expect(editor.initFromDc()).toBeTrue();
  });

  it('restores SPECS timing after clear canvas', () => {
    editor.loadLedFadePreset();
    editor.setAnalysisMode('dcOp'); // no-op in challenge mode
    editor.clearChallengeCanvas();
    expect(editor.doc().components.length).toBe(0);
    expect(editor.analysisMode()).toBe('tran');
    expect(editor.tStop()).toBe(2);
    expect(editor.initFromDc()).toBeTrue();
  });

  it('ignores newSchematic and analysis changes while challenge mode is on', () => {
    editor.loadLedPreset();
    const before = editor.doc().components.length;
    editor.newSchematic();
    expect(editor.doc().components.length).toBe(before);
    editor.setAnalysisMode('dcOp');
    expect(editor.analysisMode()).toBe('tran');
    editor.setTStop(9);
    expect(editor.tStop()).toBe(2);
  });

  it('ignores closeCircuitTab while challenge mode is on', () => {
    const id = editor.activeSlotId();
    expect(id).toBeTruthy();
    editor.closeCircuitTab(id!);
    expect(editor.activeSlotId()).toBe(id);
    expect(editor.learnChallengeMode()).toBeTrue();
  });
});
