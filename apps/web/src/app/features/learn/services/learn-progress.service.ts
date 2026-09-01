import { Injectable } from '@angular/core';
import { LearnUnit } from '../data/learn-catalog.model';

const STORAGE_PREFIX = 'learn.progress.';

@Injectable({ providedIn: 'root' })
export class LearnProgressService {
  private storageKey(unit: LearnUnit): string {
    return `${STORAGE_PREFIX}${unit.moduleSlug}/${unit.unitSlug}`;
  }

  isStepDone(unit: LearnUnit, step: number): boolean {
    if (typeof localStorage === 'undefined') return false;
    try {
      const raw = localStorage.getItem(this.storageKey(unit));
      if (!raw) return false;
      const done: number[] = JSON.parse(raw);
      return Array.isArray(done) && done.includes(step);
    } catch {
      return false;
    }
  }

  toggleStep(unit: LearnUnit, step: number, done: boolean): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const key = this.storageKey(unit);
      const current = new Set<number>(this.readSteps(key));
      if (done) current.add(step);
      else current.delete(step);
      localStorage.setItem(key, JSON.stringify([...current].sort((a, b) => a - b)));
    } catch {
      // localStorage blocked — progress simply won't persist
    }
  }

  hasAnyStepDone(unit: LearnUnit): boolean {
    for (let step = 1; step <= unit.stepCount; step++) {
      if (this.isStepDone(unit, step)) return true;
    }
    return false;
  }

  private readSteps(key: string): number[] {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === 'number') : [];
  }
}
