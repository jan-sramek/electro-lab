import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { learnUnitPath } from '../../data/learn-catalog.model';
import { LearnUnitSummaryDto } from '../../api/learning-api.types';
import { LearnCatalogService } from '../../services/learn-catalog.service';
import { LearnProgressService } from '../../services/learn-progress.service';
import { LearnSeoService } from '../../services/learn-seo.service';

@Component({
  selector: 'app-learn-hub-page',
  standalone: true,
  imports: [TranslatePipe, RouterLink],
  template: `
    <section class="learn">
      <h1>{{ 'learn.title' | t }}</h1>
      <p class="intro">{{ 'learn.body' | t }}</p>

      @for (row of modules(); track row.slug) {
        <section class="module">
          <h2 class="module-title">{{ row.titleKey | t }}</h2>
          @for (unit of row.units; track unit.unitSlug) {
            <article class="project" [class.locked]="unit.availability === 'locked'">
              <div class="project-head">
                <h3>
                  <!-- Always a real link so crawlers discover every unit; the badge conveys lock state. -->
                  <a [routerLink]="unitPath(unit)">{{ unit.i18nKeyPrefix + '.title' | t }}</a>
                </h3>
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
    </section>
  `,
  styles: `
    .learn { max-width: 40rem; }
    h1 { margin: 0 0 0.5rem; color: #12263a; font-size: 1.75rem; }
    .intro { color: #5a6b7d; margin: 0 0 1.75rem; line-height: 1.5; }
    .module { margin-bottom: 2rem; }
    .module-title {
      margin: 0 0 0.75rem; color: #0b6e4f; font-size: 1.1rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .project { border-top: 1px solid #d8dee6; padding-top: 1rem; margin-bottom: 1rem; }
    .project.locked { opacity: 0.65; }
    .project-head { display: flex; justify-content: space-between; gap: 0.75rem; align-items: baseline; }
    .project h3 { margin: 0 0 0.5rem; font-size: 1.2rem; flex: 1; }
    .project h3 a { color: #12263a; text-decoration: none; }
    .project h3 a:hover { text-decoration: underline; }
    .status {
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
      padding: 0.15rem 0.45rem; border-radius: 4px; background: #eef2f6; color: #5a6b7d;
    }
    .status[data-status='available'] { background: #e8f5f0; color: #0b6e4f; }
    .status[data-status='inProgress'] { background: #fff7ed; color: #c2410c; }
    .status[data-status='complete'] { background: #0b6e4f; color: #fff; }
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

  readonly unitPath = (unit: LearnUnitSummaryDto) =>
    learnUnitPath({ moduleSlug: unit.moduleSlug, unitSlug: unit.unitSlug });

  statusKey(availability: string): string {
    if (availability === 'inProgress') return 'learn.hub.status.in_progress';
    return `learn.hub.status.${availability}`;
  }

  async ngOnInit(): Promise<void> {
    this.seo.setHubPage();
    await this.progress.sync();
    await this.catalog.reloadCatalog();
    this.catalog.applyFallbackAvailability(this.progress.progressSnapshot());
    this.modules.set(this.catalog.modules());
  }
}
