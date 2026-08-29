import { Injectable } from '@angular/core';
import { SchematicDocument, cloneDoc } from '../data/schematic.model';

const LEGACY_KEY = 'electro-lab.schematic.v1';
const SLOTS_KEY = 'electro-lab.circuits.v1';

export interface CircuitSlot {
  id: string;
  name: string;
  doc: SchematicDocument;
  updatedAt: number;
}

export interface CircuitLibrary {
  schemaVersion: 1;
  activeId: string | null;
  slots: CircuitSlot[];
}

@Injectable()
export class SchematicPersistence {
  save(doc: SchematicDocument, activeId?: string | null): void {
    try {
      const lib = this.loadLibrary();
      const id = activeId ?? lib.activeId;
      if (id) {
        const slots = lib.slots.map((s) =>
          s.id === id ? { ...s, doc: cloneDoc(doc), updatedAt: Date.now() } : s
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
              doc: this.normalizeDoc(s.doc)
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

  saveAs(name: string, doc: SchematicDocument): string {
    const lib = this.loadLibrary();
    const id = `slot_${Date.now()}`;
    const slot: CircuitSlot = {
      id,
      name: name.trim() || this.nextDefaultName(lib.slots),
      doc: cloneDoc(doc),
      updatedAt: Date.now()
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
      return { activeId: slot.id, doc: cloneDoc(slot.doc) };
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
    return { activeId: id, doc: cloneDoc(seed) };
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
    return cloneDoc(slot.doc);
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
