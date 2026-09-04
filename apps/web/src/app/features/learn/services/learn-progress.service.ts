import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { LearningApiClient } from '../api/learning-api.client';
import { LearnUnitProgressDto } from '../api/learning-api.types';
import { LearnCatalogService } from './learn-catalog.service';
import { isApiUnreachable } from './learn-api-errors';

const STORAGE_KEY = 'learn.progress.v1';

interface StoredProgress {
  units: Record<string, LearnUnitProgressDto>;
  /** Quiz answers that passed locally while offline — replayed to the server on the next sync. */
  pendingQuiz: Record<string, Record<number, string>>;
}

@Injectable({ providedIn: 'root' })
export class LearnProgressService {
  private readonly api = inject(LearningApiClient);
  private readonly catalog = inject(LearnCatalogService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly progressByKey = signal<Record<string, LearnUnitProgressDto>>({});
  private pendingQuiz: Record<string, Record<number, string>> = {};

  /** True while some progress exists only in this browser (server unreachable when it was made). */
  readonly savedLocally = signal(false);

  constructor() {
    const stored = this.readLocal();
    this.progressByKey.set(stored.units);
    this.pendingQuiz = stored.pendingQuiz;
    this.savedLocally.set(Object.keys(stored.pendingQuiz).length > 0);
  }

  async sync(): Promise<void> {
    let serverMap: Record<string, LearnUnitProgressDto>;
    try {
      const snapshot = await firstValueFrom(this.api.getProgress());
      serverMap = {};
      for (const row of snapshot.units) {
        serverMap[this.key(row.moduleSlug, row.unitSlug)] = row;
      }
      this.catalog.apiOnline.set(true);
    } catch {
      // Offline (or progress endpoint down): keep the locally persisted snapshot as the working view.
      this.progressByKey.set(this.mergeRows(this.readLocal().units, this.progressByKey()));
      return;
    }

    // Server is the source of truth; replay anything that only happened offline, then adopt server rows.
    const local = this.progressByKey();
    const rejected = await this.replayPending(local, serverMap);
    const localOnly = this.localOnlyRows(local, serverMap);
    for (const key of rejected) delete localOnly[key];
    this.progressByKey.set(this.mergeRows(serverMap, localOnly));
    this.persist();
  }

  progressFor(moduleSlug: string, unitSlug: string): LearnUnitProgressDto {
    return (
      this.progressByKey()[this.key(moduleSlug, unitSlug)] ?? {
        moduleSlug,
        unitSlug,
        readComplete: false,
        quizPassed: false,
        labPassed: false,
        complete: false
      }
    );
  }

  progressSnapshot(): Record<string, LearnUnitProgressDto> {
    return this.progressByKey();
  }

  async markRead(moduleSlug: string, unitSlug: string, complete: boolean): Promise<LearnUnitProgressDto> {
    const optimistic: LearnUnitProgressDto = {
      ...this.progressFor(moduleSlug, unitSlug),
      readComplete: complete
    };
    this.upsert(optimistic);

    if (!this.catalog.apiOnline()) {
      this.savedLocally.set(true);
      return optimistic;
    }

    try {
      const saved = await firstValueFrom(this.api.markRead(moduleSlug, unitSlug, complete));
      this.upsert(saved);
      return saved;
    } catch (err) {
      if (isApiUnreachable(err)) {
        this.savedLocally.set(true);
        return optimistic;
      }
      // Definitive rejection (e.g. 409 unit-locked): roll back the optimistic flag.
      const rolledBack: LearnUnitProgressDto = { ...optimistic, readComplete: false };
      this.upsert(rolledBack);
      throw err;
    }
  }

  /** Quiz graded locally because the API was unreachable — keep it and replay on next sync. */
  recordLocalQuizPass(
    moduleSlug: string,
    unitSlug: string,
    answers: Record<number, string>
  ): LearnUnitProgressDto {
    const row: LearnUnitProgressDto = {
      ...this.progressFor(moduleSlug, unitSlug),
      readComplete: true,
      quizPassed: true
    };
    this.pendingQuiz[this.key(moduleSlug, unitSlug)] = { ...answers };
    this.upsert(row);
    this.savedLocally.set(true);
    return row;
  }

  applyProgress(row: LearnUnitProgressDto): void {
    this.upsert(row);
  }

  private async replayPending(
    local: Record<string, LearnUnitProgressDto>,
    serverMap: Record<string, LearnUnitProgressDto>
  ): Promise<Set<string>> {
    let allReplayed = true;
    const rejected = new Set<string>();
    for (const [key, row] of Object.entries(local)) {
      const server = serverMap[key];
      const answers = this.pendingQuiz[key];
      try {
        if (row.readComplete && !server?.readComplete) {
          serverMap[key] = await firstValueFrom(this.api.markRead(row.moduleSlug, row.unitSlug, true));
        }
        if (answers && !server?.quizPassed) {
          const result = await firstValueFrom(
            this.api.submitQuiz(row.moduleSlug, row.unitSlug, { answers })
          );
          if (result.passed) {
            serverMap[key] = { ...(serverMap[key] ?? row), readComplete: true, quizPassed: true };
          }
        }
        delete this.pendingQuiz[key];
      } catch (err) {
        if (isApiUnreachable(err)) {
          allReplayed = false;
          continue;
        }
        // The server definitively rejected the replay (e.g. unit locked): the local-only
        // pass was invalid, so drop it rather than retrying forever or keeping a fake pass.
        delete this.pendingQuiz[key];
        rejected.add(key);
      }
    }
    if (allReplayed) this.savedLocally.set(false);
    return rejected;
  }

  /** Rows (or flags) that exist only locally — never drop progress the server has not seen yet. */
  private localOnlyRows(
    local: Record<string, LearnUnitProgressDto>,
    serverMap: Record<string, LearnUnitProgressDto>
  ): Record<string, LearnUnitProgressDto> {
    const out: Record<string, LearnUnitProgressDto> = {};
    for (const [key, row] of Object.entries(local)) {
      const server = serverMap[key];
      if (!server) {
        if (row.readComplete || row.quizPassed) out[key] = row;
        continue;
      }
      if ((row.readComplete && !server.readComplete) || (row.quizPassed && !server.quizPassed)) {
        out[key] = {
          ...server,
          readComplete: server.readComplete || row.readComplete,
          quizPassed: server.quizPassed || row.quizPassed
        };
      }
    }
    return out;
  }

  private mergeRows(
    base: Record<string, LearnUnitProgressDto>,
    overrides: Record<string, LearnUnitProgressDto>
  ): Record<string, LearnUnitProgressDto> {
    return { ...base, ...overrides };
  }

  private upsert(row: LearnUnitProgressDto): void {
    this.progressByKey.update((prev) => ({
      ...prev,
      [this.key(row.moduleSlug, row.unitSlug)]: row
    }));
    this.persist();
  }

  private key(moduleSlug: string, unitSlug: string): string {
    return `${moduleSlug}/${unitSlug}`;
  }

  private readLocal(): StoredProgress {
    const empty: StoredProgress = { units: {}, pendingQuiz: {} };
    if (!this.isBrowser || typeof localStorage === 'undefined') return empty;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return empty;
      const parsed = JSON.parse(raw) as Partial<StoredProgress>;
      return {
        units: parsed.units && typeof parsed.units === 'object' ? parsed.units : {},
        pendingQuiz: parsed.pendingQuiz && typeof parsed.pendingQuiz === 'object' ? parsed.pendingQuiz : {}
      };
    } catch {
      return empty;
    }
  }

  private persist(): void {
    if (!this.isBrowser || typeof localStorage === 'undefined') return;
    try {
      const payload: StoredProgress = { units: this.progressByKey(), pendingQuiz: this.pendingQuiz };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Storage full/blocked — in-memory progress still works for this session.
    }
  }
}
