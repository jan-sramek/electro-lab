import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { findLearnUnit } from '../../data/learn-catalog';
import { learnFromSlug, learnStepKey, LearnUnit } from '../../data/learn-catalog.model';
import { LearnAnalyticsService } from '../../services/learn-analytics.service';
import { LearnProgressService } from '../../services/learn-progress.service';
import { LearnSeoService } from '../../services/learn-seo.service';

@Component({
  selector: 'app-learn-unit-page',
  standalone: true,
  imports: [TranslatePipe, RouterLink],
  template: `
    @if (unit(); as u) {
      <article class="learn-unit">
        <p class="back">
          <a routerLink="/learn">{{ 'learn.unit.backToHub' | t }}</a>
        </p>
        <h1>{{ u.i18nKeyPrefix + '.title' | t }}</h1>
        <p class="summary">{{ u.i18nKeyPrefix + '.summary' | t }}</p>

        <ol class="checklist">
          @for (step of stepNumbers(); track step) {
            <li>
              <label class="step-row">
                <input
                  type="checkbox"
                  [checked]="progress.isStepDone(u, step)"
                  (change)="onStepToggle(u, step, $event)"
                />
                <span>{{ stepKey(u, step) | t }}</span>
              </label>
            </li>
          }
        </ol>

        @if (showStepNudge()) {
          <p class="nudge">{{ 'learn.unit.skimStepsBeforeLab' | t }}</p>
        }

        <a
          class="cta"
          routerLink="/lab"
          [queryParams]="labQueryParams(u)"
          (click)="onOpenLab(u)"
        >
          {{ u.i18nKeyPrefix + '.openLab' | t }}
        </a>
      </article>
    }
  `,
  styles: `
    .learn-unit {
      max-width: 40rem;
    }
    .back {
      margin: 0 0 1rem;
    }
    .back a {
      color: #0b6e4f;
      text-decoration: none;
      font-weight: 600;
    }
    .back a:hover {
      text-decoration: underline;
    }
    h1 {
      margin: 0 0 0.75rem;
      color: #12263a;
      font-size: 1.75rem;
    }
    .summary {
      color: #5a6b7d;
      margin: 0 0 1.25rem;
      line-height: 1.5;
    }
    .checklist {
      margin: 0 0 1.5rem;
      padding-left: 0;
      list-style: none;
      color: #334155;
      line-height: 1.55;
    }
    .step-row {
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;
      cursor: pointer;
    }
    .step-row input {
      margin-top: 0.25rem;
      flex-shrink: 0;
    }
    .checklist li {
      margin-bottom: 0.5rem;
    }
    .cta {
      display: inline-block;
      padding: 0.55rem 1rem;
      background: #0b6e4f;
      color: #fff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
    }
    .cta:hover {
      background: #095c42;
    }
    .nudge {
      margin: 0 0 1rem;
      padding: 0.65rem 0.85rem;
      background: #f0f7f4;
      border-left: 3px solid #0b6e4f;
      color: #334155;
      font-size: 0.95rem;
      line-height: 1.45;
    }
  `
})
export class LearnUnitPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seo = inject(LearnSeoService);
  private readonly analytics = inject(LearnAnalyticsService);
  readonly progress = inject(LearnProgressService);

  readonly unit = signal<LearnUnit | null>(null);
  readonly stepNumbers = computed(() => {
    const u = this.unit();
    if (!u) return [];
    return Array.from({ length: u.stepCount }, (_, i) => i + 1);
  });

  readonly stepKey = learnStepKey;
  readonly learnFromSlug = learnFromSlug;

  readonly showStepNudge = computed(() => {
    const u = this.unit();
    return u ? !this.progress.hasAnyStepDone(u) : false;
  });

  labQueryParams(unit: LearnUnit): { example: string; from: string } {
    return { example: unit.exampleId, from: learnFromSlug(unit) };
  }

  ngOnInit(): void {
    const moduleSlug = this.route.snapshot.paramMap.get('moduleSlug') ?? '';
    const unitSlug = this.route.snapshot.paramMap.get('unitSlug') ?? '';
    const found = findLearnUnit(moduleSlug, unitSlug);
    if (!found) {
      void this.router.navigateByUrl('/learn');
      return;
    }
    this.unit.set(found);
    this.seo.setUnitPage(found);
    this.analytics.unitView(found);
  }

  onStepToggle(unit: LearnUnit, step: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.progress.toggleStep(unit, step, input.checked);
  }

  onOpenLab(unit: LearnUnit): void {
    this.analytics.openLab(unit);
  }
}
