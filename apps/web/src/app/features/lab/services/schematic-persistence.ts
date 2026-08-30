import { Injectable } from '@angular/core';
import { AnalysisMode, SchematicDocument, cloneDoc } from '../data/schematic.model';
import { isBjtNpnPart } from '../data/symbol-library';

const LEGACY_KEY = 'electro-lab.schematic.v1';
const SLOTS_KEY = 'electro-lab.circuits.v1';
const CAP_IC_KEY = 'electro-lab.cap-ic.v1';

/**
 * Old NPN default used rb=1000 which self-limits Ib (~4 mA at 5 V) so burnout never fired.
 * Migrate that legacy default to the teaching value (10 Ω).
 */
function migrateLegacyBjtRb(doc: SchematicDocument): SchematicDocument {
  let changed = false;
  const components = doc.components.map((c) => {
    if (!isBjtNpnPart(c.modelKey)) return c;
    if (c.params['rb'] !== 1000) return c;
    changed = true;
    return { ...c, params: { ...c.params, rb: 10 } };
  });
  return changed ? { ...doc, components } : doc;
}

/** Per-tab analysis settings — survive F5 so examples like LED fade keep Transient + tStop. */
export interface SlotSimState {
  analysisMode: AnalysisMode;
  tStop: number;
  dt: number;
  acFreq: number;
  examplePreset: string | null;
  /** Seed C/L from a DC solve at t=0 (overrides params.ic). */
  initFromDc?: boolean;
}

export interface CircuitSlot {
  id: string;
  name: string;
  doc: SchematicDocument;
  updatedAt: number;
  sim?: SlotSimState;
}

export interface CircuitLibrary {
  schemaVersion: 1;
  activeId: string | null;
  slots: CircuitSlot[];
}

export interface StoredCapIc {
  slotId: string;
  fingerprint: string;
  voltages: Record<string, number>;
}

@Injectable()
export class SchematicPersistence {
  save(doc: SchematicDocument, activeId?: string | null, sim?: SlotSimState): void {
    try {
      const lib = this.loadLibrary();
      const id = activeId ?? lib.activeId;
      if (id) {
        const slots = lib.slots.map((s) =>
          s.id === id
            ? {
                ...s,
                doc: cloneDoc(doc),
                updatedAt: Date.now(),
                sim: sim ?? s.sim
              }
            : s
        );
        this.writeLibrary({ ...lib, activeId: id, slots });
      } else {
        // Autosave unnamed working copy into legacy key for mid-edit safety.
        localStorage.setItem(LEGACY_KEY, JSON.stringify(doc));
      }
    } catch {
      /* ignore quota */
    }
  }

  /** Sim settings for a slot (after F5 / tab switch). */
  slotSim(id: string | null | undefined): SlotSimState | undefined {
    if (!id) return undefined;
    return this.loadLibrary().slots.find((s) => s.id === id)?.sim;
  }

  saveCapIc(data: StoredCapIc): void {
    try {
      localStorage.setItem(CAP_IC_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }

  loadCapIc(): StoredCapIc | null {
    try {
      const raw = localStorage.getItem(CAP_IC_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StoredCapIc;
      if (!parsed?.slotId || !parsed.fingerprint || !parsed.voltages) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  clearCapIc(): void {
    localStorage.removeItem(CAP_IC_KEY);
  }

  /** Load active circuit, migrating legacy single-key storage if needed. */
  load(): SchematicDocument | null {
    const lib = this.loadLibrary();
    if (lib.activeId) {
      const slot = lib.slots.find((s) => s.id === lib.activeId);
      if (slot) return cloneDoc(slot.doc);
    }
    return this.loadLegacy();
  }

  loadLibrary(): CircuitLibrary {
    try {
      const raw = localStorage.getItem(SLOTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CircuitLibrary;
        if (parsed?.schemaVersion === 1 && Array.isArray(parsed.slots)) {
          return {
            schemaVersion: 1,
            activeId: parsed.activeId ?? null,
            slots: parsed.slots.map((s) => ({
              ...s,
              doc: this.normalizeDoc(s.doc),
              sim: this.normalizeSim(s.sim)
            }))
          };
        }
      }
    } catch {
      /* fall through */
    }

    const legacy = this.loadLegacy();
    if (legacy) {
      const id = `slot_${Date.now()}`;
      const lib: CircuitLibrary = {
        schemaVersion: 1,
        activeId: id,
        slots: [
          {
            id,
            name: 'Untitled',
            doc: legacy,
            updatedAt: Date.now()
          }
        ]
      };
      this.writeLibrary(lib);
      localStorage.removeItem(LEGACY_KEY);
      return lib;
    }

    return { schemaVersion: 1, activeId: null, slots: [] };
  }

  listSlots(): CircuitSlot[] {
    return this.loadLibrary().slots;
  }

  activeSlotId(): string | null {
    return this.loadLibrary().activeId;
  }

  saveAs(name: string, doc: SchematicDocument, sim?: SlotSimState): string {
    const lib = this.loadLibrary();
    const id = `slot_${Date.now()}`;
    const slot: CircuitSlot = {
      id,
      name: name.trim() || this.nextDefaultName(lib.slots),
      doc: cloneDoc(doc),
      updatedAt: Date.now(),
      sim
    };
    this.writeLibrary({
      schemaVersion: 1,
      activeId: id,
      slots: [...lib.slots, slot]
    });
    localStorage.removeItem(LEGACY_KEY);
    return id;
  }

  /** Ensure at least one tab exists; returns active document. */
  ensureLibrary(seed: SchematicDocument): { activeId: string; doc: SchematicDocument } {
    const lib = this.loadLibrary();
    if (lib.slots.length) {
      const slot =
        (lib.activeId && lib.slots.find((s) => s.id === lib.activeId)) || lib.slots[0];
      if (slot.id !== lib.activeId) {
        this.writeLibrary({ ...lib, activeId: slot.id });
      }
      const doc = migrateLegacyBjtRb(cloneDoc(slot.doc));
      return { activeId: slot.id, doc };
    }
    const id = `slot_${Date.now()}`;
    const slot: CircuitSlot = {
      id,
      name: 'Circuit 1',
      doc: cloneDoc(seed),
      updatedAt: Date.now()
    };
    this.writeLibrary({ schemaVersion: 1, activeId: id, slots: [slot] });
    localStorage.removeItem(LEGACY_KEY);
    return { activeId: id, doc: migrateLegacyBjtRb(cloneDoc(seed)) };
  }

  nextDefaultName(slots: CircuitSlot[]): string {
    let n = slots.length + 1;
    const names = new Set(slots.map((s) => s.name));
    while (names.has(`Circuit ${n}`)) n += 1;
    return `Circuit ${n}`;
  }

  activate(id: string): SchematicDocument | null {
    const lib = this.loadLibrary();
    const slot = lib.slots.find((s) => s.id === id);
    if (!slot) return null;
    this.writeLibrary({ ...lib, activeId: id });
    return migrateLegacyBjtRb(cloneDoc(slot.doc));
  }

  rename(id: string, name: string): void {
    const lib = this.loadLibrary();
    this.writeLibrary({
      ...lib,
      slots: lib.slots.map((s) =>
        s.id === id ? { ...s, name: name.trim() || s.name } : s
      )
    });
  }

  deleteSlot(id: string): void {
    const lib = this.loadLibrary();
    const slots = lib.slots.filter((s) => s.id !== id);
    const activeId = lib.activeId === id ? (slots[0]?.id ?? null) : lib.activeId;
    this.writeLibrary({ schemaVersion: 1, activeId, slots });
  }

  clear(): void {
    localStorage.removeItem(LEGACY_KEY);
    const lib = this.loadLibrary();
    if (lib.activeId) {
      this.writeLibrary({
        ...lib,
        slots: lib.slots.map((s) =>
          s.id === lib.activeId
            ? {
                ...s,
                doc: { groundNet: 'gnd', components: [], wires: [] },
                updatedAt: Date.now()
              }
            : s
        )
      });
    }
  }

  private writeLibrary(lib: CircuitLibrary): void {
    localStorage.setItem(SLOTS_KEY, JSON.stringify(lib));
  }

  private loadLegacy(): SchematicDocument | null {
    try {
      const raw = localStorage.getItem(LEGACY_KEY);
      if (!raw) return null;
      return this.normalizeDoc(JSON.parse(raw) as Partial<SchematicDocument>);
    } catch {
      return null;
    }
  }

  private normalizeDoc(parsed: Partial<SchematicDocument> | null | undefined): SchematicDocument {
    if (!parsed?.components || !Array.isArray(parsed.components)) {
      return { groundNet: 'gnd', components: [], wires: [] };
    }
    return {
      groundNet: parsed.groundNet || 'gnd',
      components: parsed.components.map((c) => ({
        ...c,
        rotation: (c.rotation ?? 0) as 0 | 90 | 180 | 270,
        params: c.params ?? {},
        pins: c.pins ?? {}
      })),
      wires: Array.isArray(parsed.wires) ? parsed.wires : []
    };
  }

  private normalizeSim(sim: SlotSimState | undefined): SlotSimState | undefined {
    if (!sim) return undefined;
    const mode = sim.analysisMode;
    if (mode !== 'dcOp' && mode !== 'tran' && mode !== 'ac') return undefined;
    const tStop = Number(sim.tStop);
    const dt = Number(sim.dt);
    const acFreq = Number(sim.acFreq);
    if (!(tStop > 0) || !(dt > 0) || !(acFreq > 0)) return undefined;
    return {
      analysisMode: mode,
      tStop,
      dt,
      acFreq,
      examplePreset: typeof sim.examplePreset === 'string' ? sim.examplePreset : null,
      initFromDc: !!sim.initFromDc
    };
  }
}

export class SchematicHistory {
  private undoStack: SchematicDocument[] = [];
  private redoStack: SchematicDocument[] = [];
  private readonly limit = 80;

  push(before: SchematicDocument): void {
    this.undoStack.push(cloneDoc(before));
    if (this.undoStack.length > this.limit) this.undoStack.shift();
    this.redoStack = [];
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  undo(current: SchematicDocument): SchematicDocument | null {
    const prev = this.undoStack.pop();
    if (!prev) return null;
    this.redoStack.push(cloneDoc(current));
    return prev;
  }

  redo(current: SchematicDocument): SchematicDocument | null {
    const next = this.redoStack.pop();
    if (!next) return null;
    this.undoStack.push(cloneDoc(current));
    return next;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
