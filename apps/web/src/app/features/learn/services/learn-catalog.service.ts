import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LearningApiClient } from '../api/learning-api.client';
import {
  LearnCatalogResponse,
  LearnModuleDto,
  LearnUnitDetailResponse,
  LearnUnitProgressDto,
  LearnUnitSummaryDto,
  UnitAvailability
} from '../api/learning-api.types';
import { LEARN_MODULES, LEARN_UNITS } from '../data/learn-catalog';
import { findLearnUnit } from '../data/learn-catalog';

/** Builds offline catalog DTOs mirroring the LearningApi seeder shape. */
@Injectable({ providedIn: 'root' })
export class LearnCatalogService {
  private readonly api = inject(LearningApiClient);

  private readonly catalog = signal<LearnCatalogResponse | null>(null);
  private readonly unitCache = new Map<string, LearnUnitDetailResponse>();

  readonly loaded = signal(false);
  readonly apiOnline = signal(false);

  modules(): LearnModuleDto[] {
    return this.catalog()?.modules ?? this.fallbackCatalog().modules;
  }

  findUnitSummary(moduleSlug: string, unitSlug: string): LearnUnitSummaryDto | undefined {
    for (const mod of this.modules()) {
      const unit = mod.units.find((u) => u.moduleSlug === moduleSlug && u.unitSlug === unitSlug);
      if (unit) return unit;
    }
    return undefined;
  }

  async loadCatalog(): Promise<void> {
    await this.reloadCatalog();
  }

  /** Refetch catalog and clear cached unit details (e.g. after progress changes). */
  async reloadCatalog(): Promise<void> {
    this.unitCache.clear();
    try {
      const response = await firstValueFrom(this.api.getCatalog());
      this.catalog.set(response);
      this.apiOnline.set(true);
    } catch {
      this.catalog.set(this.fallbackCatalog());
      this.apiOnline.set(false);
    } finally {
      this.loaded.set(true);
    }
  }

  applyFallbackAvailability(progressByKey: Record<string, LearnUnitProgressDto>): void {
    if (this.apiOnline()) return;
    this.catalog.set(this.fallbackCatalog(progressByKey));
  }

  async getUnitDetail(
    moduleSlug: string,
    unitSlug: string,
    options?: { refresh?: boolean }
  ): Promise<LearnUnitDetailResponse | null> {
    const key = `${moduleSlug}/${unitSlug}`;
    if (!options?.refresh) {
      const cached = this.unitCache.get(key);
      if (cached) return cached;
    }

    if (this.apiOnline()) {
      try {
        const detail = await firstValueFrom(this.api.getUnit(moduleSlug, unitSlug));
        this.unitCache.set(key, detail);
        return detail;
      } catch {
        // fall through
      }
    }

    const fallback = this.buildFallbackUnit(moduleSlug, unitSlug);
    if (fallback) this.unitCache.set(key, fallback);
    return fallback;
  }

  private fallbackCatalog(progressByKey?: Record<string, LearnUnitProgressDto>): LearnCatalogResponse {
    const orderedUnits = [...LEARN_UNITS];
    const modules = [...LEARN_MODULES]
      .sort((a, b) => a.order - b.order)
      .map((mod) => ({
        slug: mod.moduleSlug,
        titleKey: mod.titleKey,
        order: mod.order,
        units: orderedUnits
          .filter((u) => u.moduleSlug === mod.moduleSlug)
          .map((u, idx, arr) => {
            const globalIdx = orderedUnits.findIndex(
              (x) => x.moduleSlug === u.moduleSlug && x.unitSlug === u.unitSlug
            );
            const next = globalIdx >= 0 ? orderedUnits[globalIdx + 1] : undefined;
            const progressKey = `${u.moduleSlug}/${u.unitSlug}`;
            return {
              moduleSlug: u.moduleSlug,
              unitSlug: u.unitSlug,
              exampleId: u.exampleId,
              i18nKeyPrefix: u.i18nKeyPrefix,
              order: idx + 1,
              nextModuleSlug: next?.moduleSlug ?? null,
              nextUnitSlug: next?.unitSlug ?? null,
              availability: this.resolveFallbackAvailability(globalIdx, orderedUnits, progressByKey)
            };
          })
      }));

    return { modules };
  }

  private resolveFallbackAvailability(
    globalIdx: number,
    orderedUnits: typeof LEARN_UNITS,
    progressByKey?: Record<string, LearnUnitProgressDto>
  ): UnitAvailability {
    const unit = orderedUnits[globalIdx];
    const key = `${unit.moduleSlug}/${unit.unitSlug}`;
    const row = progressByKey?.[key];
    if (row?.complete) return 'complete';
    if (row && (row.readComplete || row.quizPassed || row.labPassed)) return 'inProgress';
    if (globalIdx <= 0) return 'available';
    const prev = orderedUnits[globalIdx - 1];
    const prevKey = `${prev.moduleSlug}/${prev.unitSlug}`;
    if (progressByKey?.[prevKey]?.complete) return 'available';
    return 'locked';
  }

  private buildFallbackUnit(
    moduleSlug: string,
    unitSlug: string,
    progressByKey?: Record<string, LearnUnitProgressDto>
  ): LearnUnitDetailResponse | null {
    const unit = findLearnUnit(moduleSlug, unitSlug);
    if (!unit) return null;

    const prefix = unit.i18nKeyPrefix;
    const orderedUnits = [...LEARN_UNITS];
    const globalIdx = orderedUnits.findIndex(
      (u) => u.moduleSlug === moduleSlug && u.unitSlug === unitSlug
    );
    const next = globalIdx >= 0 ? orderedUnits[globalIdx + 1] : undefined;

    return {
      moduleSlug,
      unitSlug,
      exampleId: unit.exampleId,
      i18nKeyPrefix: prefix,
      order: globalIdx + 1,
      nextModuleSlug: next?.moduleSlug ?? null,
      nextUnitSlug: next?.unitSlug ?? null,
      availability: this.resolveFallbackAvailability(globalIdx, orderedUnits, progressByKey),
      lessonBlocks: [
        { id: 1, order: 1, titleKey: `${prefix}.lesson1.title`, bodyKey: `${prefix}.lesson1.body` },
        { id: 2, order: 2, titleKey: `${prefix}.lesson2.title`, bodyKey: `${prefix}.lesson2.body` }
      ],
      quiz: {
        passCount: 3,
        questions: [1, 2, 3].map((n) => ({
          id: n,
          order: n,
          promptKey: `${prefix}.quiz.q${n}.prompt`,
          options: [
            { id: 'a', labelKey: `${prefix}.quiz.q${n}.a` },
            { id: 'b', labelKey: `${prefix}.quiz.q${n}.b` },
            { id: 'c', labelKey: `${prefix}.quiz.q${n}.c` }
          ]
        }))
      },
      labChallenge: {
        criteria: [
          { id: 1, order: 1, labelKey: `${prefix}.challenge.c1.label`, type: 'sim_ok', paramsJson: '{}' },
          {
            id: 2,
            order: 2,
            labelKey: `${prefix}.challenge.c2.label`,
            type: 'branch_current_min',
            paramsJson: JSON.stringify({ refId: 'D1', minAmps: 0.001 })
          }
        ]
      },
      progress: {
        moduleSlug,
        unitSlug,
        readComplete: false,
        quizPassed: false,
        labPassed: false,
        complete: false
      }
    };
  }
}
