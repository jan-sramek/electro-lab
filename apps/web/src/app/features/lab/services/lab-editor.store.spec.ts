import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LabEditorStore, PERSIST_DEBOUNCE_MS } from './lab-editor.store';
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

describe('LabEditorStore ids, undo gestures, tabs, persistence, import', () => {
  let editor: LabEditorStore;
  let persistence: SchematicPersistence;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [SchematicPersistence, LabEditorStore]
    });
    persistence = TestBed.inject(SchematicPersistence);
    editor = TestBed.inject(LabEditorStore);
    editor.initFromStorage();
  });

  afterEach(() => {
    editor.flushPersist();
    localStorage.clear();
  });

  function allIds(): string[] {
    const d = editor.doc();
    return [...d.components.map((c) => c.id), ...d.wires.map((w) => w.id)];
  }

  function expectUniqueIds(): void {
    const ids = allIds();
    expect(new Set(ids).size).withContext(`duplicate ids in ${ids.join(',')}`).toBe(ids.length);
  }

  it('generates unique ids after loading the same preset in two tabs and switching back', () => {
    editor.loadLedPreset();
    const firstTab = editor.activeSlotId()!;
    editor.placeModelAt('resistor', 300, 300);
    const firstNew = editor.doc().components.at(-1)!.id;
    expectUniqueIds();

    editor.loadLedPreset(); // new tab — presets reset the legacy global counter
    editor.placeModelAt('resistor', 300, 300);
    expectUniqueIds();

    editor.switchCircuitTab(firstTab);
    expect(editor.doc().components.some((c) => c.id === firstNew)).toBeTrue();
    editor.placeModelAt('resistor', 320, 320);
    editor.placeModelAt('led', 340, 340);
    expectUniqueIds();
    expect(editor.doc().components.at(-2)!.id).not.toBe(firstNew);
  });

  it('duplicate and paste allocate ids that do not collide with existing parts or wires', () => {
    editor.loadLedPreset();
    editor.setSelection(editor.doc().components.map((c) => c.id));
    editor.duplicateSelected();
    expectUniqueIds();
    editor.copySelected();
    editor.pasteClipboard();
    editor.pasteClipboard();
    expectUniqueIds();
    expect(editor.doc().components.length).toBe(6 * 4);
  });

  it('groups a drag gesture into one undo step and records wire-waypoint edits', () => {
    editor.loadLedPreset();
    const r1 = editor.doc().components.find((c) => c.id === 'R1')!;
    const move = (dx: number) => ({
      ...editor.doc(),
      components: editor.doc().components.map((c) => (c.id === 'R1' ? { ...c, x: r1.x + dx } : c))
    });

    editor.beginGesture();
    editor.onDocChange(move(10));
    editor.onDocChange(move(20));
    editor.onDocChange(move(30));
    editor.endGesture();
    expect(editor.canUndo()).toBeTrue();
    editor.undo();
    expect(editor.doc().components.find((c) => c.id === 'R1')!.x).toBe(r1.x);
    expect(editor.canUndo()).toBeFalse();

    // Second drag of the SAME (still selected) part is its own step.
    editor.beginGesture();
    editor.onDocChange(move(50));
    editor.endGesture();
    editor.beginGesture();
    editor.onDocChange(move(80));
    editor.endGesture();
    editor.undo();
    expect(editor.doc().components.find((c) => c.id === 'R1')!.x).toBe(r1.x + 50);

    // Wire-waypoint edit (non-structural) outside a gesture is undoable.
    editor.redo();
    editor.undo();
    editor.undo();
    expect(editor.canUndo()).toBeFalse();
    const w1 = editor.doc().wires[0]!;
    editor.onDocChange({
      ...editor.doc(),
      wires: editor.doc().wires.map((w) => (w.id === w1.id ? { ...w, waypoints: [{ x: 5, y: 5 }] } : w))
    });
    expect(editor.canUndo()).toBeTrue();
    editor.undo();
    expect(editor.doc().wires[0]!.waypoints).toBeUndefined();
  });

  it('closing a background tab keeps the active tab and its undo stack', () => {
    editor.loadLedPreset();
    const a = editor.activeSlotId()!;
    editor.loadRcPreset();
    const b = editor.activeSlotId()!;
    editor.loadPotPreset();
    const c = editor.activeSlotId()!;
    editor.placeModelAt('resistor', 10, 10);
    expect(editor.canUndo()).toBeTrue();
    const docBefore = editor.doc();

    editor.closeCircuitTab(a);
    expect(editor.activeSlotId()).toBe(c);
    expect(editor.doc()).toBe(docBefore);
    expect(editor.canUndo()).toBeTrue();
    expect(editor.slots().map((s) => s.id)).not.toContain(a);
    expect(editor.slots().map((s) => s.id)).toContain(b);
  });

  it('closing the active tab activates the previous neighbour, else the next', () => {
    const first = editor.activeSlotId()!;
    editor.loadLedPreset();
    const led = editor.activeSlotId()!;
    editor.loadRcPreset();
    const rc = editor.activeSlotId()!;
    editor.loadPotPreset();
    const pot = editor.activeSlotId()!;

    editor.switchCircuitTab(rc);
    editor.closeCircuitTab(rc);
    expect(editor.activeSlotId()).toBe(led);

    editor.switchCircuitTab(first);
    editor.closeCircuitTab(first);
    expect(editor.activeSlotId()).toBe(led);
    expect(editor.slots().map((s) => s.id)).toEqual(jasmine.arrayContaining([led, pot]));
  });

  it('debounces persistence during edits and flushes on tab switch', fakeAsync(() => {
    editor.loadLedPreset();
    const save = spyOn(persistence, 'save').and.callThrough();
    const r1 = editor.doc().components.find((c) => c.id === 'R1')!;
    for (let i = 1; i <= 5; i++) {
      editor.onDocChange({
        ...editor.doc(),
        components: editor.doc().components.map((c) => (c.id === 'R1' ? { ...c, x: r1.x + i } : c))
      });
    }
    expect(save).not.toHaveBeenCalled();
    tick(PERSIST_DEBOUNCE_MS);
    expect(save).toHaveBeenCalledTimes(1);

    editor.placeModelAt('resistor', 0, 0);
    expect(save).toHaveBeenCalledTimes(1);
    editor.addCircuitTab(); // flushes before creating the new tab
    expect(save).toHaveBeenCalledTimes(2);
    tick(PERSIST_DEBOUNCE_MS);
    expect(save).toHaveBeenCalledTimes(2);
    editor.flushPersist();
    expect(save).toHaveBeenCalledTimes(2);
  }));

  it('rejects an invalid import without touching history', async () => {
    editor.loadLedPreset();
    expect(editor.canUndo()).toBeFalse();
    const before = editor.doc();

    const badFile = new File(['{"components":[{"id":"X1"}]}'], 'bad.json');
    await expectAsync(editor.importJson(badFile)).toBeRejectedWithError('Invalid schematic JSON');
    expect(editor.canUndo()).toBeFalse();
    expect(editor.doc()).toBe(before);

    const notJson = new File(['not json'], 'bad.json');
    await expectAsync(editor.importJson(notJson)).toBeRejected();
    expect(editor.canUndo()).toBeFalse();

    // Missing `pins` is repaired from the symbol definition instead of throwing inside commit.
    const noPins = new File(
      [
        JSON.stringify({
          groundNet: 'gnd',
          components: [
            { id: 'V1', modelKey: 'battery', x: 0, y: 0, rotation: 0, params: {} },
            { id: 'R1', modelKey: 'resistor', x: 100, y: 0, rotation: 0, params: {} }
          ],
          wires: [{ id: 'W1', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'R1', pin: 'a' } }]
        })
      ],
      'ok.json'
    );
    await editor.importJson(noPins);
    expect(editor.canUndo()).toBeTrue();
    expect(editor.doc().components.find((c) => c.id === 'R1')!.pins['a']).toBeDefined();
    expect(editor.doc().components.find((c) => c.id === 'R1')!.pins['a'].net).toBeTruthy();
  });
});
