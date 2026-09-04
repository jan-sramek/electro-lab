import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { LearningApiClient } from '../api/learning-api.client';
import { LearnLabCriterionDto } from '../api/learning-api.types';
import { CriterionCheckResult } from '../data/lab-challenge-checker';
import { LearnCatalogService } from './learn-catalog.service';
import { LearnLabChallengeService } from './learn-lab-challenge.service';
import { LearnProgressService } from './learn-progress.service';

describe('LearnLabChallengeService.submitResults', () => {
  const apiCriteria: LearnLabCriterionDto[] = [
    { id: 1, order: 1, labelKey: 'x', type: 'sim_ok', paramsJson: '{}' }
  ];
  const passedLocal: CriterionCheckResult[] = [{ criterionId: 1, passed: true }];
  const failedLocal: CriterionCheckResult[] = [{ criterionId: 1, passed: false }];

  let api: { verifyLab: jasmine.Spy };
  let progress: { applyProgress: jasmine.Spy };
  let catalog: { reloadCatalog: jasmine.Spy; loadCatalog: jasmine.Spy };
  let service: LearnLabChallengeService;

  beforeEach(() => {
    api = { verifyLab: jasmine.createSpy('verifyLab') };
    progress = { applyProgress: jasmine.createSpy('applyProgress') };
    catalog = {
      reloadCatalog: jasmine.createSpy('reloadCatalog').and.returnValue(Promise.resolve()),
      loadCatalog: jasmine.createSpy('loadCatalog').and.returnValue(Promise.resolve())
    };
    TestBed.configureTestingModule({
      providers: [
        LearnLabChallengeService,
        { provide: LearningApiClient, useValue: api },
        { provide: LearnProgressService, useValue: progress },
        { provide: LearnCatalogService, useValue: catalog }
      ]
    });
    service = TestBed.inject(LearnLabChallengeService);
  });

  it('returns failed without calling the API when local criteria fail', async () => {
    const outcome = await service.submitResults('basics', 'led', apiCriteria, failedLocal);
    expect(outcome).toBe('failed');
    expect(api.verifyLab).not.toHaveBeenCalled();
    expect(progress.applyProgress).not.toHaveBeenCalled();
  });

  it('returns passed and applies progress when API verifies success', async () => {
    const snap = {
      moduleSlug: 'basics',
      unitSlug: 'led',
      readComplete: true,
      quizPassed: true,
      labPassed: true,
      complete: true
    };
    api.verifyLab.and.returnValue(of({ passed: true, progress: snap }));
    const outcome = await service.submitResults('basics', 'led', apiCriteria, passedLocal);
    expect(outcome).toBe('passed');
    expect(api.verifyLab).toHaveBeenCalled();
    expect(progress.applyProgress).toHaveBeenCalledWith(snap);
    expect(catalog.reloadCatalog).toHaveBeenCalled();
  });

  it('returns verify_unavailable on API error instead of failed', async () => {
    api.verifyLab.and.returnValue(throwError(() => new Error('network')));
    const outcome = await service.submitResults('basics', 'led', apiCriteria, passedLocal);
    expect(outcome).toBe('verify_unavailable');
    expect(progress.applyProgress).not.toHaveBeenCalled();
  });

  it('maps aligned SPECS results onto seeded API criterion ids by order', async () => {
    const seeded: LearnLabCriterionDto[] = [
      { id: 10, order: 1, labelKey: 'a', type: 'sim_ok', paramsJson: '{}' },
      { id: 11, order: 2, labelKey: 'b', type: 'has_models', paramsJson: '{}' }
    ];
    const local: CriterionCheckResult[] = [
      { criterionId: 1, passed: true },
      { criterionId: 2, passed: true }
    ];
    api.verifyLab.and.returnValue(
      of({
        passed: true,
        progress: {
          moduleSlug: 'basics',
          unitSlug: 'led',
          readComplete: true,
          quizPassed: true,
          labPassed: true,
          complete: true
        }
      })
    );
    await service.submitResults('basics', 'led', seeded, local);
    expect(api.verifyLab).toHaveBeenCalledWith('basics', 'led', {
      results: [
        { criterionId: 10, passed: true },
        { criterionId: 11, passed: true }
      ]
    });
  });
});
