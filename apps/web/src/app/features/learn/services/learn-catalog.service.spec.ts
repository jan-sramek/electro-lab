import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { LearningApiClient } from '../api/learning-api.client';
import { LearnCatalogService } from './learn-catalog.service';

describe('LearnCatalogService offline fallback', () => {
  let service: LearnCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LearnCatalogService,
        {
          provide: LearningApiClient,
          useValue: {
            getCatalog: () => throwError(() => new Error('offline')),
            getUnit: () => throwError(() => new Error('offline'))
          }
        }
      ]
    });
    service = TestBed.inject(LearnCatalogService);
  });

  it('uses SPECS criteria for offline unit detail (not a D1 branch stub)', async () => {
    await service.loadCatalog();
    expect(service.apiOnline()).toBeFalse();
    const detail = await service.getUnitDetail('basics', 'led-series');
    expect(detail).toBeTruthy();
    const types = detail!.labChallenge.criteria.map((c) => c.type);
    expect(types).toContain('has_models');
    expect(types).toContain('any_model_current_min');
    expect(types).not.toContain('branch_current_min');
  });
});
