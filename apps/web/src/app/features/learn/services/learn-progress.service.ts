import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LearningApiClient } from '../api/learning-api.client';
import { LearnUnitProgressDto } from '../api/learning-api.types';
import { LearnCatalogService } from './learn-catalog.service';

@Injectable({ providedIn: 'root' })
export class LearnProgressService {
  private readonly api = inject(LearningApiClient);
  private readonly catalog = inject(LearnCatalogService);

  private readonly progressByKey = signal<Record<string, LearnUnitProgressDto>>({});

  async sync(): Promise<void> {
    try {
      const snapshot = await firstValueFrom(this.api.getProgress());
      const map: Record<string, LearnUnitProgressDto> = {};
      for (const row of snapshot.units) {
        map[this.key(row.moduleSlug, row.unitSlug)] = row;
      }
      this.progressByKey.set(map);
      this.catalog.apiOnline.set(true);
    } catch {
      if (!this.catalog.apiOnline()) return;
      // API was up but progress fetch failed — keep local view
    }
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

    if (!this.catalog.apiOnline()) return optimistic;

    try {
      const saved = await firstValueFrom(this.api.markRead(moduleSlug, unitSlug, complete));
      this.upsert(saved);
      return saved;
    } catch {
      return optimistic;
    }
  }

  applyProgress(row: LearnUnitProgressDto): void {
    this.upsert(row);
  }

  private upsert(row: LearnUnitProgressDto): void {
    this.progressByKey.update((prev) => ({
      ...prev,
      [this.key(row.moduleSlug, row.unitSlug)]: row
    }));
  }

  private key(moduleSlug: string, unitSlug: string): string {
    return `${moduleSlug}/${unitSlug}`;
  }
}
