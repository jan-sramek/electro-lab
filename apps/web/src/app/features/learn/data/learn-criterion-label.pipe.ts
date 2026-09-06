import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../../../core/i18n/i18n.service';
import { LearnLabCriterionDto } from '../api/learning-api.types';
import { criterionText } from './learn-criterion-label';

/** `{{ criterion | criterionLabel }}` — concrete checklist wording with parameters. */
@Pipe({ name: 'criterionLabel', standalone: true, pure: false })
export class CriterionLabelPipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(c: LearnLabCriterionDto): string {
    return criterionText(c, this.i18n);
  }
}
