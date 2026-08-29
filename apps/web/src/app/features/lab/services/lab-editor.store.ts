import { Injectable, computed, inject, signal } from '@angular/core';
import {
  AnalysisMode,
  EditorTool,
  SchematicDocument,
  assignNets,
  createComponent,
  emptyDocument
} from '../data/schematic.model';
import { createLedPreset } from '../data/presets/led-series.preset';
import { createRcStepPreset } from '../data/presets/rc-step.preset';
import { SchematicHistory, SchematicPersistence } from './schematic-persistence';

@Injectable()
export class LabEditorStore {
  private readonly persistence = inject(SchematicPersistence);
  private readonly history = new SchematicHistory();
  private dragHistoryPushed = false;

  readonly doc = signal<SchematicDocument>(createLedPreset());
  readonly tool = signal<EditorTool>('select');
  readonly placeModel = signal<string | null>(null);
  readonly selectedId = signal<string | null>(null);
  readonly probeTarget = signal<{ kind: 'net' | 'component'; id: string } | null>(null);
  readonly analysisMode = signal<AnalysisMode>('dcOp');
  readonly canUndo = signal(false);
  readonly canRedo = signal(false);

  /** Fired after doc commits so the simulation facade can re-run. */
  readonly revision = signal(0);

  readonly selected = computed(() => {
    const id = this.selectedId();
    if (!id) return null;
    return this.doc().components.find((c) => c.id === id) ?? null;
  });

  initFromStorage(): void {
    const saved = this.persistence.load();
    if (saved) {
      this.doc.set(assignNets(saved));
      this.bump();
    }
  }

  setTool(tool: EditorTool): void {
    this.tool.set(tool);
    if (tool !== 'place') this.placeModel.set(null);
    if (tool !== 'probe') this.probeTarget.set(null);
  }

  setAnalysisMode(mode: AnalysisMode): void {
    this.analysisMode.set(mode);
    this.bump();
  }

  onPalettePlace(modelKey: string): void {
    this.placeModel.set(modelKey);
    this.tool.set('place');
  }

  onPlaceAt(pt: { x: number; y: number }): void {
    const model = this.placeModel();
    if (!model) return;
    this.commit((doc) => ({
      ...doc,
      components: [...doc.components, createComponent(model, pt.x, pt.y)]
    }));
    this.setTool('select');
  }

  onDocChange(next: SchematicDocument): void {
    const prev = this.doc();
    const structural =
      prev.components.length !== next.components.length ||
      prev.wires.length !== next.wires.length ||
      prev.wires.some((w, i) => w.id !== next.wires[i]?.id);

    if (structural) {
      this.history.push(prev);
    } else {
      const moved = prev.components.some((c) => {
        const n = next.components.find((x) => x.id === c.id);
        return n && (n.x !== c.x || n.y !== c.y);
      });
      if (moved && !this.dragHistoryPushed) {
        this.history.push(prev);
        this.dragHistoryPushed = true;
      }
    }

    this.doc.set(assignNets(next));
    this.syncHistoryFlags();
    this.persist();
    this.bump();
  }

  onSelect(id: string | null): void {
    this.dragHistoryPushed = false;
    this.selectedId.set(id);
  }

  onProbe(target: { kind: 'net' | 'component'; id: string } | null): void {
    this.probeTarget.set(target);
  }

  onParamChange(ev: { key: string; value: number | boolean }): void {
    const id = this.selectedId();
    if (!id) return;
    this.commit((doc) => ({
      ...doc,
      components: doc.components.map((c) =>
        c.id === id ? { ...c, params: { ...c.params, [ev.key]: ev.value } } : c
      )
    }));
  }

  rotateSelected(): void {
    const id = this.selectedId();
    if (!id) return;
    this.commit((doc) => ({
      ...doc,
      components: doc.components.map((c) => {
        if (c.id !== id) return c;
        const rotation = ((c.rotation + 90) % 360) as 0 | 90 | 180 | 270;
        return { ...c, rotation };
      })
    }));
  }

  deleteSelected(): void {
    const id = this.selectedId();
    if (!id) return;
    this.commit((doc) => ({
      ...doc,
      components: doc.components.filter((c) => c.id !== id),
      wires: doc.wires.filter((w) => w.a.componentId !== id && w.b.componentId !== id)
    }));
    this.selectedId.set(null);
  }

  loadLedPreset(): void {
    this.commit(() => createLedPreset());
    this.selectedId.set(null);
    this.analysisMode.set('dcOp');
  }

  loadRcPreset(): void {
    this.commit(() => createRcStepPreset());
    this.selectedId.set(null);
    this.analysisMode.set('tran');
  }

  newSchematic(): void {
    this.commit(() => emptyDocument());
    this.selectedId.set(null);
    this.persistence.clear();
  }

  undo(): void {
    const prev = this.history.undo(this.doc());
    if (!prev) return;
    this.doc.set(assignNets(prev));
    this.syncHistoryFlags();
    this.persist();
    this.bump();
  }

  redo(): void {
    const next = this.history.redo(this.doc());
    if (!next) return;
    this.doc.set(assignNets(next));
    this.syncHistoryFlags();
    this.persist();
    this.bump();
  }

  escape(): void {
    this.setTool('select');
    this.selectedId.set(null);
    this.probeTarget.set(null);
  }

  private commit(mutator: (doc: SchematicDocument) => SchematicDocument): void {
    const prev = this.doc();
    this.history.push(prev);
    const next = assignNets(mutator(prev));
    this.doc.set(next);
    this.syncHistoryFlags();
    this.persist();
    this.bump();
  }

  private persist(): void {
    this.persistence.save(this.doc());
  }

  private syncHistoryFlags(): void {
    this.canUndo.set(this.history.canUndo());
    this.canRedo.set(this.history.canRedo());
  }

  private bump(): void {
    this.revision.update((n) => n + 1);
  }
}
