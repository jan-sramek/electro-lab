import { Injectable, isDevMode } from '@angular/core';
import { LearnUnit } from '../data/learn-catalog.model';

/** Anonymous product metrics stub — wire to a vendor later. */
@Injectable({ providedIn: 'root' })
export class LearnAnalyticsService {
  track(event: 'learn_unit_view' | 'learn_open_lab', payload: Record<string, string>): void {
    if (isDevMode()) {
      console.debug('[learn-analytics]', event, payload);
    }
  }

  unitView(unit: LearnUnit): void {
    this.track('learn_unit_view', {
      module_slug: unit.moduleSlug,
      unit_slug: unit.unitSlug
    });
  }

  openLab(unit: LearnUnit): void {
    this.track('learn_open_lab', {
      module_slug: unit.moduleSlug,
      unit_slug: unit.unitSlug,
      example_id: unit.exampleId
    });
  }
}
