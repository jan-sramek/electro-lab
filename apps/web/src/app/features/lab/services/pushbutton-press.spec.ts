import { TestBed } from '@angular/core/testing';
import { LabEditorStore } from './lab-editor.store';
import { SchematicPersistence } from './schematic-persistence';
import { createPushbuttonLedPreset } from '../data/presets/pushbutton-led.preset';

describe('pushbutton interactive press', () => {
  it('sample starts released so canvas hold can light the LED', () => {
    const btn = createPushbuttonLedPreset().components.find((c) => c.id === 'BTN1');
    expect(btn?.modelKey).toBe('pushbutton');
    expect(btn?.params['closed']).toBe(false);
  });

  it('setPushbuttonPressed closes and opens the part', () => {
    TestBed.configureTestingModule({
      providers: [SchematicPersistence, LabEditorStore]
    });
    const editor = TestBed.inject(LabEditorStore);
    editor.initFromStorage();
    editor.loadPushbuttonPreset();

    const id = editor.doc().components.find((c) => c.modelKey === 'pushbutton')!.id;
    expect(editor.doc().components.find((c) => c.id === id)!.params['closed']).toBe(false);

    editor.setPushbuttonPressed(id, true);
    expect(editor.doc().components.find((c) => c.id === id)!.params['closed']).toBe(true);

    editor.setPushbuttonPressed(id, false);
    expect(editor.doc().components.find((c) => c.id === id)!.params['closed']).toBe(false);
  });
});
