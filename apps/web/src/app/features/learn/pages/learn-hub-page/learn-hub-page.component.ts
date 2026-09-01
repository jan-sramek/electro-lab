import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { learnModulesWithUnits } from '../../data/learn-catalog';
import { learnUnitPath } from '../../data/learn-catalog.model';
import { LearnSeoService } from '../../services/learn-seo.service';

@Component({
  selector: 'app-learn-hub-page',
  standalone: true,
  imports: [TranslatePipe, RouterLink],
  template: `
    <section class="learn">
      <h1>{{ 'learn.title' | t }}</h1>
      <p class="intro">{{ 'learn.body' | t }}</p>

      @for (row of modules(); track row.module.moduleSlug) {
        <section class="module">
          <h2 class="module-title">{{ row.module.titleKey | t }}</h2>
          @for (unit of row.units; track unit.unitSlug) {
            <article class="project">
              <h3>
                <a [routerLink]="unitPath(unit)">{{ unit.i18nKeyPrefix + '.title' | t }}</a>
              </h3>
              <p>{{ unit.i18nKeyPrefix + '.summary' | t }}</p>
              <a class="cta-link" [routerLink]="unitPath(unit)">{{ 'learn.hub.readUnit' | t }}</a>
            </article>
          }
        </section>
      }
    </section>
  `,
  styles: `
    .learn {
      max-width: 40rem;
    }
    h1 {
      margin: 0 0 0.5rem;
      color: #12263a;
      font-size: 1.75rem;
    }
    .intro {
      color: #5a6b7d;
      margin: 0 0 1.75rem;
      line-height: 1.5;
    }
    .module {
      margin-bottom: 2rem;
    }
    .module-title {
      margin: 0 0 0.75rem;
      color: #0b6e4f;
      font-size: 1.1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .project {
      border-top: 1px solid #d8dee6;
      padding-top: 1rem;
      margin-bottom: 1rem;
    }
    .project h3 {
      margin: 0 0 0.5rem;
      font-size: 1.2rem;
    }
    .project h3 a {
      color: #12263a;
      text-decoration: none;
    }
    .project h3 a:hover {
      text-decoration: underline;
    }
    .project p {
      margin: 0 0 0.75rem;
      color: #5a6b7d;
      line-height: 1.45;
    }
    .cta-link {
      color: #0b6e4f;
      font-weight: 600;
      text-decoration: none;
    }
    .cta-link:hover {
      text-decoration: underline;
    }
  `
})
export class LearnHubPageComponent implements OnInit {
  private readonly seo = inject(LearnSeoService);

  readonly modules = () => learnModulesWithUnits();
  readonly unitPath = learnUnitPath;

  ngOnInit(): void {
    this.seo.setHubPage();
  }
}
