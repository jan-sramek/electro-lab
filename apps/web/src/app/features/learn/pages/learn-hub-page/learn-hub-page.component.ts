import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { learnUnitPath } from '../../data/learn-catalog.model';
import { LearnModuleDto, LearnUnitSummaryDto } from '../../api/learning-api.types';
import { LearnCatalogService } from '../../services/learn-catalog.service';
import { LearnProgressService } from '../../services/learn-progress.service';
import { LEARN_POINTS, quizQuestionCountFor, totalPoints, unitPointsEarned, unitPointsMax } from '../../data/learn-points';
import { findLearnUnit, LEARN_MODULES } from '../../data/learn-catalog';
import { unitHasLab, unitIsOptional } from '../../data/learn-catalog.model';
import { LearnSeoService } from '../../services/learn-seo.service';

@Component({
  selector: 'app-learn-hub-page',
  standalone: true,
  imports: [TranslatePipe, RouterLink],
  template: `
    <section class="learn">
      <h1>{{ 'learn.title' | t }}</h1>
      <p class="intro">{{ 'learn.body' | t }}</p>
      <p class="points-total" role="status">
        <strong>{{ 'learn.points.total' | t: { earned: total().earned, max: total().max } }}</strong>
        <span>{{ 'learn.points.explain' | t: { read: pts.read, quiz: pts.quiz, lab: pts.lab } }}</span>
      </p>

      @for (track of tracks(); track track.id) {
        <header class="track-head">
          <h2 class="track-title">{{ track.titleKey | t }}</h2>
          <p class="track-intro">{{ track.introKey | t }}</p>
        </header>
        @for (row of track.modules; track row.slug) {
          <section class="module">
            <h3 class="module-title">{{ row.titleKey | t }}</h3>
            @for (unit of row.units; track unit.unitSlug) {
              <article class="project" [class.locked]="unit.availability === 'locked'">
                <div class="project-head">
                  <h4>
                    <a [routerLink]="unitPath(unit)">{{ unit.i18nKeyPrefix + '.title' | t }}</a>
                  </h4>
                  @if (isOptional(unit)) {
                    <span class="status optional">{{ 'learn.hub.optional' | t }}</span>
                  }
                  <span class="unit-points">{{ 'learn.points.unit' | t: unitPoints(unit) }}</span>
                  <span class="status" [attr.data-status]="unit.availability">
                    {{ statusKey(unit.availability) | t }}
                  </span>
                </div>
                <p>{{ unit.i18nKeyPrefix + '.summary' | t }}</p>
                @if (unit.availability !== 'locked') {
                  <a class="cta-link" [routerLink]="unitPath(unit)">{{ 'learn.hub.readUnit' | t }}</a>
                }
              </article>
            }
          </section>
        }
      }
    </section>
  `,
  styles: `
    .learn { max-width: 40rem; }
    h1 { margin: 0 0 0.5rem; color: #12263a; font-size: 1.75rem; }
    .intro { color: #5a6b7d; margin: 0 0 1rem; line-height: 1.5; }
    .points-total {
      display: flex; flex-wrap: wrap; gap: 0.35rem 1rem; align-items: baseline; margin: 0 0 1.75rem;
      padding: 0.6rem 0.85rem; border-radius: 8px; background: #f0f7f4; border: 1px solid #c5e6d8; color: #12263a;
    }
    .points-total strong { color: #0b6e4f; font-size: 1.05rem; }
    .points-total span { color: #5a6b7d; font-size: 0.9rem; }
    .unit-points { font-size: 0.8rem; color: #0b6e4f; font-weight: 600; white-space: nowrap; }
    .track-head { margin: 0 0 1rem; padding-top: 0.5rem; }
    .track-title {
      margin: 0 0 0.35rem; color: #12263a; font-size: 1.35rem; font-weight: 700;
    }
    .track-intro { margin: 0 0 1.25rem; color: #5a6b7d; line-height: 1.45; font-size: 0.95rem; }
    .module { margin-bottom: 2rem; }
    .module-title {
      margin: 0 0 0.75rem; color: #0b6e4f; font-size: 1.1rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .project { border-top: 1px solid #d8dee6; padding-top: 1rem; margin-bottom: 1rem; }
    .project.locked { opacity: 0.65; }
    .project-head { display: flex; justify-content: space-between; gap: 0.75rem; align-items: baseline; }
    .project h4 { margin: 0 0 0.5rem; font-size: 1.2rem; flex: 1; font-weight: 600; }
    .project h4 a { color: #12263a; text-decoration: none; }
    .project h4 a:hover { text-decoration: underline; }
    .status {
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
      padding: 0.15rem 0.45rem; border-radius: 4px; background: #eef2f6; color: #5a6b7d;
    }
    .status[data-status='available'] { background: #e8f5f0; color: #0b6e4f; }
    .status[data-status='inProgress'] { background: #fff7ed; color: #c2410c; }
    .status[data-status='complete'] { background: #0b6e4f; color: #fff; }
    .status.optional { background: #eef2f6; color: #4a5d73; border: 1px dashed #94a3b8; }
    .project p { margin: 0 0 0.75rem; color: #5a6b7d; line-height: 1.45; }
    .cta-link { color: #0b6e4f; font-weight: 600; text-decoration: none; }
    .cta-link:hover { text-decoration: underline; }
  `
})
export class LearnHubPageComponent implements OnInit {
  private readonly seo = inject(LearnSeoService);
  private readonly catalog = inject(LearnCatalogService);
  private readonly progress = inject(LearnProgressService);

  readonly modules = signal(this.catalog.modules());
  readonly pts = LEARN_POINTS;
  readonly total = computed(() => totalPoints(this.progress.progressSnapshot()));

  readonly tracks = computed(() => {
    const bySlug = new Map(this.modules().map((m) => [m.slug, m]));
    const starter: LearnModuleDto[] = [];
    const advanced: LearnModuleDto[] = [];
    for (const def of [...LEARN_MODULES].sort((a, b) => a.order - b.order)) {
      const row = bySlug.get(def.moduleSlug);
      if (!row?.units.length) continue;
      if (def.track === 'advanced') advanced.push(row);
      else starter.push(row);
    }
    return [
      {
        id: 'starter',
        titleKey: 'learn.hub.track.starter.title',
        introKey: 'learn.hub.track.starter.intro',
        modules: starter
      },
      {
        id: 'advanced',
        titleKey: 'learn.hub.track.advanced.title',
        introKey: 'learn.hub.track.advanced.intro',
        modules: advanced
      }
    ].filter((t) => t.modules.length > 0);
  });

  isOptional(unit: LearnUnitSummaryDto): boolean {
    return unitIsOptional(findLearnUnit(unit.moduleSlug, unit.unitSlug));
  }

  unitPoints(unit: LearnUnitSummaryDto): { earned: number; max: number } {
    const def = findLearnUnit(unit.moduleSlug, unit.unitSlug);
    const hasLab = unitHasLab(def);
    const finalQuiz = !!def?.finalQuiz;
    return {
      earned: unitPointsEarned(
        this.progress.progressFor(unit.moduleSlug, unit.unitSlug),
        hasLab,
        finalQuiz,
        quizQuestionCountFor(unit.unitSlug)
      ),
      max: unitPointsMax(hasLab, finalQuiz, unit.unitSlug)
    };
  }

  readonly unitPath = (unit: LearnUnitSummaryDto) =>
    learnUnitPath({ moduleSlug: unit.moduleSlug, unitSlug: unit.unitSlug });

  statusKey(availability: string): string {
    if (availability === 'inProgress') return 'learn.hub.status.in_progress';
    return `learn.hub.status.${availability}`;
  }

  ngOnInit(): void {
    this.seo.applyHub();
    void this.catalog.loadCatalog().then(() => this.modules.set(this.catalog.modules()));
  }
}
