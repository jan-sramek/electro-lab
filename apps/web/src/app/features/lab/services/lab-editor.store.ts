import { Injectable, computed, inject, signal } from '@angular/core';
import {
  AnalysisMode,
  EditorTool,
  SchematicComponent,
  SchematicDocument,
  SchematicWire,
  assignNets,
  createComponent,
  emptyDocument,
  nextId
} from '../data/schematic.model';
import { createLedPreset } from '../data/presets/led-series.preset';
import { createRcStepPreset } from '../data/presets/rc-step.preset';
import { createPotDividerPreset } from '../data/presets/pot-divider.preset';
import { createPulseRcPreset } from '../data/presets/pulse-rc.preset';
import { createOpAmpBufferPreset } from '../data/presets/opamp-buffer.preset';
import { createAcRcPreset } from '../data/presets/ac-rc.preset';
import { createBjtSwitchPreset } from '../data/presets/bjt-switch.preset';
import {
  CircuitSlot,
  SchematicHistory,
  SchematicPersistence
} from './schematic-persistence';

export type ExamplePresetId = 'led' | 'rc' | 'pot' | 'pulse' | 'opamp' | 'ac' | 'bjt';

@Injectable()
export class LabEditorStore {
  private readonly persistence = inject(SchematicPersistence);
  private readonly history = new SchematicHistory();
  private dragHistoryPushed = false;
  private clipboard: SchematicDocument | null = null;

  readonly doc = signal<SchematicDocument>(createLedPreset());
  readonly tool = signal<EditorTool>('select');
  readonly placeModel = signal<string | null>(null);
  readonly selectedIds = signal<string[]>([]);
  readonly selectedWireIds = signal<string[]>([]);
  readonly probeTarget = signal<{ kind: 'net' | 'component'; id: string } | null>(null);
  readonly analysisMode = signal<AnalysisMode>('dcOp');
  readonly tStop = signal(0.005);
  readonly dt = signal(5e-5);
  /** Single-frequency AC analysis (Hz). */
  readonly acFreq = signal(1000);
  readonly canUndo = signal(false);
  readonly canRedo = signal(false);
  readonly activeSlotId = signal<string | null>(null);
  readonly slots = signal<CircuitSlot[]>([]);
  /** Last loaded example circuit shown in the toolbar select. */
  readonly activeExamplePreset = signal<ExamplePresetId | null>(null);
  readonly revision = signal(0);

  readonly selectedId = computed(() => {
    const ids = this.selectedIds();
    return ids.length === 1 ? ids[0] : null;
  });

  readonly selected = computed(() => {
    const id = this.selectedId();
    if (!id) return null;
    return this.doc().components.find((c) => c.id === id) ?? null;
  });

  initFromStorage(): void {
    const ensured = this.persistence.ensureLibrary(this.doc());
    this.doc.set(assignNets(ensured.doc));
    this.activeSlotId.set(ensured.activeId);
    this.refreshSlots(ensured.activeId);
    this.bump();
  }

  /** Persist current tab, then switch. */
  switchCircuitTab(id: string): void {
    if (id === this.activeSlotId()) return;
    this.persist();
    const doc = this.persistence.activate(id);
    if (!doc) return;
    this.history.clear();
    this.doc.set(assignNets(doc));
    this.activeSlotId.set(id);
    this.selectedIds.set([]);
    this.selectedWireIds.set([]);
    this.activeExamplePreset.set(null);
    this.syncHistoryFlags();
    this.refreshSlots(id);
    this.bump();
  }

  addCircuitTab(): void {
    this.persist();
    const lib = this.persistence.loadLibrary();
    const name = this.persistence.nextDefaultName(lib.slots);
    const id = this.persistence.saveAs(name, emptyDocument());
    this.history.clear();
    this.doc.set(emptyDocument());
    this.activeSlotId.set(id);
    this.selectedIds.set([]);
    this.selectedWireIds.set([]);
    this.activeExamplePreset.set(null);
    this.syncHistoryFlags();
    this.refreshSlots(id);
    this.bump();
  }

  closeCircuitTab(id: string): void {
    const lib = this.persistence.loadLibrary();
    if (lib.slots.length <= 1) return;
    if (id === this.activeSlotId()) this.persist();
    this.persistence.deleteSlot(id);
    const next = this.persistence.loadLibrary();
    const activeId = next.activeId ?? next.slots[0]?.id ?? null;
    if (!activeId) return;
    const doc = this.persistence.activate(activeId);
    if (!doc) return;
    this.history.clear();
    this.doc.set(assignNets(doc));
    this.activeSlotId.set(activeId);
    this.selectedIds.set([]);
    this.selectedWireIds.set([]);
    this.activeExamplePreset.set(null);
    this.syncHistoryFlags();
    this.refreshSlots(activeId);
    this.bump();
  }

  renameCircuitTab(id: string, name: string): void {
    this.persistence.rename(id, name);
    this.refreshSlots(this.activeSlotId());
  }

  saveNamedSlot(name: string): void {
    const id = this.persistence.saveAs(name, this.doc());
    this.refreshSlots(id);
  }

  loadSlot(id: string): void {
    this.switchCircuitTab(id);
  }

  refreshSlots(activeId?: string | null): void {
    const lib = this.persistence.loadLibrary();
    this.slots.set(lib.slots);
    this.activeSlotId.set(activeId !== undefined ? activeId : lib.activeId);
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

  setTStop(raw: number | string): void {
    const v = Number(raw);
    if (!Number.isFinite(v) || v <= 0) return;
    this.tStop.set(v);
    this.bump();
  }

  setDt(raw: number | string): void {
    const v = Number(raw);
    if (!Number.isFinite(v) || v <= 0) return;
    this.dt.set(v);
    this.bump();
  }

  setAcFreq(raw: number | string): void {
    const v = Number(raw);
    if (!Number.isFinite(v) || v <= 0) return;
    this.acFreq.set(v);
    this.bump();
  }

  onPalettePlace(modelKey: string): void {
    this.placeModel.set(modelKey);
    this.tool.set('place');
  }

  onPlaceAt(pt: { x: number; y: number }): void {
    const model = this.placeModel();
    if (!model) return;
    this.placeModelAt(model, pt.x, pt.y);
  }

  placeModelAt(modelKey: string, x: number, y: number): void {
    this.commit((doc) => ({
      ...doc,
      components: [...doc.components, createComponent(modelKey, x, y)]
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

  onSelect(id: string | null, additive = false): void {
    this.dragHistoryPushed = false;
    if (!id) {
      this.selectedIds.set([]);
      return;
    }
    this.selectedWireIds.set([]);
    if (additive) {
      const cur = this.selectedIds();
      this.selectedIds.set(
        cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
      );
    } else {
      this.selectedIds.set([id]);
    }
  }

  /** Replace or union the component selection (marquee / box select). */
  setSelection(ids: string[], additive = false): void {
    this.dragHistoryPushed = false;
    this.selectedWireIds.set([]);
    if (additive) {
      const set = new Set([...this.selectedIds(), ...ids]);
      this.selectedIds.set([...set]);
    } else {
      this.selectedIds.set(ids);
    }
  }

  onSelectWire(id: string | null, additive = false): void {
    this.dragHistoryPushed = false;
    if (!id) {
      this.selectedWireIds.set([]);
      return;
    }
    this.selectedIds.set([]);
    if (additive) {
      const cur = this.selectedWireIds();
      this.selectedWireIds.set(
        cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
      );
    } else {
      this.selectedWireIds.set([id]);
    }
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

  /** Mark LEDs as failed-open after overload (sticky until replaced). */
  markLedsBurned(ids: string[]): void {
    const set = new Set(ids);
    const needs = this.doc().components.some(
      (c) => set.has(c.id) && c.modelKey === 'led' && !c.params['burned']
    );
    if (!needs) return;
    this.commit((doc) => ({
      ...doc,
      components: doc.components.map((c) =>
        set.has(c.id) && c.modelKey === 'led'
          ? { ...c, params: { ...c.params, burned: true } }
          : c
      )
    }));
  }

  /** Clear burned flag — teaching “replace the LED”. */
  replaceLed(id: string): void {
    const c = this.doc().components.find((x) => x.id === id);
    if (!c || c.modelKey !== 'led' || !c.params['burned']) return;
    this.commit((doc) => ({
      ...doc,
      components: doc.components.map((x) =>
        x.id === id ? { ...x, params: { ...x.params, burned: false } } : x
      )
    }));
  }

  rotateSelected(): void {
    const ids = new Set(this.selectedIds());
    if (!ids.size) return;
    this.commit((doc) => ({
      ...doc,
      components: doc.components.map((c) => {
        if (!ids.has(c.id)) return c;
        const rotation = ((c.rotation + 90) % 360) as 0 | 90 | 180 | 270;
        return { ...c, rotation };
      })
    }));
  }

  deleteSelected(): void {
    const ids = new Set(this.selectedIds());
    const wireIds = new Set(this.selectedWireIds());
    if (!ids.size && !wireIds.size) return;
    this.commit((doc) => ({
      ...doc,
      components: doc.components.filter((c) => !ids.has(c.id)),
      wires: doc.wires.filter(
        (w) =>
          !wireIds.has(w.id) &&
          !ids.has(w.a.componentId) &&
          !ids.has(w.b.componentId)
      )
    }));
    this.selectedIds.set([]);
    this.selectedWireIds.set([]);
  }

  duplicateSelected(): void {
    const ids = this.selectedIds();
    if (!ids.length) return;
    const doc = this.doc();
    const idSet = new Set(ids);
    const map = new Map<string, string>();
    const copies: SchematicComponent[] = [];
    for (const c of doc.components) {
      if (!idSet.has(c.id)) continue;
      const copy = structuredClone(c) as SchematicComponent;
      const prefix = c.id.replace(/\d+$/, '') || 'X';
      copy.id = nextId(prefix);
      copy.x += 40;
      copy.y += 40;
      map.set(c.id, copy.id);
      copies.push(copy);
    }
    const wires: SchematicWire[] = doc.wires
      .filter((w) => idSet.has(w.a.componentId) && idSet.has(w.b.componentId))
      .map((w) => ({
        id: nextId('W'),
        a: { componentId: map.get(w.a.componentId)!, pin: w.a.pin },
        b: { componentId: map.get(w.b.componentId)!, pin: w.b.pin }
      }));
    this.commit((d) => ({
      ...d,
      components: [...d.components, ...copies],
      wires: [...d.wires, ...wires]
    }));
    this.selectedIds.set(copies.map((c) => c.id));
  }

  copySelected(): void {
    const ids = new Set(this.selectedIds());
    if (!ids.size) return;
    const doc = this.doc();
    this.clipboard = {
      groundNet: doc.groundNet,
      components: doc.components.filter((c) => ids.has(c.id)).map((c) => structuredClone(c)),
      wires: doc.wires
        .filter((w) => ids.has(w.a.componentId) && ids.has(w.b.componentId))
        .map((w) => structuredClone(w))
    };
  }

  pasteClipboard(): void {
    const clip = this.clipboard;
    if (!clip?.components.length) return;
    const map = new Map<string, string>();
    const copies: SchematicComponent[] = clip.components.map((c) => {
      const copy = structuredClone(c) as SchematicComponent;
      const prefix = c.id.replace(/\d+$/, '') || 'X';
      copy.id = nextId(prefix);
      copy.x += 40;
      copy.y += 40;
      map.set(c.id, copy.id);
      return copy;
    });
    const wires: SchematicWire[] = clip.wires.map((w) => ({
      id: nextId('W'),
      a: { componentId: map.get(w.a.componentId)!, pin: w.a.pin },
      b: { componentId: map.get(w.b.componentId)!, pin: w.b.pin }
    }));
    this.commit((d) => ({
      ...d,
      components: [...d.components, ...copies],
      wires: [...d.wires, ...wires]
    }));
    this.selectedIds.set(copies.map((c) => c.id));
  }

  exportJson(): void {
    const blob = new Blob([JSON.stringify(this.doc(), null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `electro-lab-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importJson(file: File): Promise<void> {
    const text = await file.text();
    const parsed = JSON.parse(text) as SchematicDocument;
    if (!parsed?.components || !Array.isArray(parsed.components)) {
      throw new Error('Invalid schematic JSON');
    }
    this.commit(() =>
      assignNets({
        groundNet: parsed.groundNet || 'gnd',
        components: parsed.components,
        wires: parsed.wires ?? []
      })
    );
    this.selectedIds.set([]);
    this.selectedWireIds.set([]);
    this.activeExamplePreset.set(null);
  }

  loadLedPreset(): void {
    this.openExampleInNewTab('led', 'LED series', createLedPreset, 'dcOp');
  }

  loadRcPreset(): void {
    this.openExampleInNewTab('rc', 'RC charge', createRcStepPreset, 'tran', 0.005, 5e-5);
  }

  loadPotPreset(): void {
    this.openExampleInNewTab('pot', 'Pot divider', createPotDividerPreset, 'dcOp');
  }

  loadPulsePreset(): void {
    this.openExampleInNewTab('pulse', 'Pulse RC', createPulseRcPreset, 'tran', 0.01, 5e-5);
  }

  loadOpAmpPreset(): void {
    this.openExampleInNewTab('opamp', 'Op-amp buffer', createOpAmpBufferPreset, 'dcOp');
  }

  loadAcPreset(): void {
    this.openExampleInNewTab('ac', 'AC low-pass', createAcRcPreset, 'ac', undefined, undefined, 1000);
  }

  loadBjtPreset(): void {
    this.openExampleInNewTab('bjt', 'BJT switch', createBjtSwitchPreset, 'dcOp');
  }

  newSchematic(): void {
    if (typeof window !== 'undefined' && !window.confirm('Clear the current schematic?')) {
      return;
    }
    this.commit(() => emptyDocument());
    this.selectedIds.set([]);
    this.selectedWireIds.set([]);
    this.activeExamplePreset.set(null);
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
    this.selectedIds.set([]);
    this.selectedWireIds.set([]);
    this.probeTarget.set(null);
  }

  /** Open an example circuit in a new tab so the current tab is preserved. */
  private openExampleInNewTab(
    presetId: ExamplePresetId,
    tabName: string,
    factory: () => SchematicDocument,
    mode: AnalysisMode,
    tStop?: number,
    dt?: number,
    acFreq?: number
  ): void {
    this.persist();
    const doc = assignNets(factory());
    const id = this.persistence.saveAs(tabName, doc);
    this.history.clear();
    this.doc.set(doc);
    this.activeSlotId.set(id);
    this.selectedIds.set([]);
    this.selectedWireIds.set([]);
    this.activeExamplePreset.set(presetId);
    this.analysisMode.set(mode);
    if (tStop !== undefined) this.tStop.set(tStop);
    if (dt !== undefined) this.dt.set(dt);
    if (acFreq !== undefined) this.acFreq.set(acFreq);
    this.syncHistoryFlags();
    this.refreshSlots(id);
    this.bump();
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
    this.persistence.save(this.doc(), this.activeSlotId());
  }

  private syncHistoryFlags(): void {
    this.canUndo.set(this.history.canUndo());
    this.canRedo.set(this.history.canRedo());
  }

  private bump(): void {
    this.revision.update((n) => n + 1);
  }
}
