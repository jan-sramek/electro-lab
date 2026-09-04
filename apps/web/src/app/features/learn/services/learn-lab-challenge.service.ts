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
import { isApiUnreachable } from './learn-api-errors';

/** `rejected`: the server refused the submission (prerequisites not met) — unlike `verify_unavailable` this is not a pass. */
export type ChallengeSubmitOutcome = 'failed' | 'passed' | 'verify_unavailable' | 'rejected';

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
    // Attest only what the client actually evaluated: match seeded rows by criterion id
    // (specCriteriaForCheck reuses API ids), else by position when the lists are the same shape.
    // Anything the client could not evaluate is reported as failed — never fabricated as passed.
    const aligned = apiCriteria.length === specResults.length;
    const apiResults = apiCriteria.map((c, i) => {
      const byId = specResults.find((r) => r.criterionId === c.id);
      const match = byId ?? (aligned ? specResults[i] : undefined);
      return { criterionId: c.id, passed: match?.passed === true };
    });
    try {
      const response = await firstValueFrom(
        this.api.verifyLab(moduleSlug, unitSlug, {
          results: apiResults
        })
      );
      this.progress.applyProgress(response.progress);
      void this.catalog.reloadCatalog();
      return response.passed ? 'passed' : 'failed';
    } catch (err) {
      // Definitive server rejection (409 quiz-required / unit-locked, 400 bad payload) is not an outage.
      if (!isApiUnreachable(err)) return 'rejected';
      // Local criteria already passed — don't present API outage as a failed circuit.
      return 'verify_unavailable';
    }
  }
}
