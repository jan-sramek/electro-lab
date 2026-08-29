import { Injectable } from '@angular/core';
import { SchematicDocument, cloneDoc } from '../data/schematic.model';

const STORAGE_KEY = 'electro-lab.schematic.v1';

@Injectable()
export class SchematicPersistence {
  save(doc: SchematicDocument): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {
      /* ignore quota */
    }
  }

  load(): SchematicDocument | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<SchematicDocument>;
      if (!parsed?.components || !Array.isArray(parsed.components)) return null;
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
    } catch {
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
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
