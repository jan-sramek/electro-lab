import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LearningApiClient } from '../api/learning-api.client';
import { LearnLabCriterionDto, LearnUnitDetailResponse } from '../api/learning-api.types';
import {
  allCriteriaPassed,
  checkLabCriteria,
  CriterionCheckResult,
  LabChallengeContext
} from '../data/lab-challenge-checker';
import { LearnCatalogService } from './learn-catalog.service';
import { LearnProgressService } from './learn-progress.service';

export type ChallengeSubmitOutcome = 'failed' | 'passed' | 'verify_unavailable';

@Injectable({ providedIn: 'root' })
export class LearnLabChallengeService {
  private readonly catalog = inject(LearnCatalogService);
  private readonly api = inject(LearningApiClient);
  private readonly progress = inject(LearnProgressService);

  async loadChallengeUnit(moduleSlug: string, unitSlug: string): Promise<LearnUnitDetailResponse | null> {
    await this.catalog.loadCatalog();
    return this.catalog.getUnitDetail(moduleSlug, unitSlug);
  }

  evaluate(criteria: LearnLabCriterionDto[], ctx: LabChallengeContext): CriterionCheckResult[] {
    return checkLabCriteria(criteria, ctx);
  }

  async submitResults(
    moduleSlug: string,
    unitSlug: string,
    apiCriteria: LearnLabCriterionDto[],
    specResults: CriterionCheckResult[]
  ): Promise<ChallengeSubmitOutcome> {
    if (!allCriteriaPassed(specResults)) {
      return 'failed';
    }
    const apiResults = apiCriteria.map((c) => ({ criterionId: c.id, passed: true }));
    try {
      const response = await firstValueFrom(
        this.api.verifyLab(moduleSlug, unitSlug, {
          results: apiResults
        })
      );
      this.progress.applyProgress(response.progress);
      void this.catalog.reloadCatalog();
      return response.passed ? 'passed' : 'failed';
    } catch {
      // Local criteria already passed — don't present API outage as a failed circuit.
      return 'verify_unavailable';
    }
  }
}
