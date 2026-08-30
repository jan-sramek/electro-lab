import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

/** Guided mini-projects that deep-link into Lab examples. */
@Component({
  selector: 'app-learn-page',
  standalone: true,
  imports: [TranslatePipe, RouterLink],
  template: `
    <section class="learn">
      <h1>{{ 'learn.title' | t }}</h1>
      <p class="intro">{{ 'learn.body' | t }}</p>

      <article class="project">
        <h2>{{ 'learn.project.bc547.title' | t }}</h2>
        <p>{{ 'learn.project.bc547.summary' | t }}</p>
        <ol class="checklist">
          <li>{{ 'learn.project.bc547.step1' | t }}</li>
          <li>{{ 'learn.project.bc547.step2' | t }}</li>
          <li>{{ 'learn.project.bc547.step3' | t }}</li>
          <li>{{ 'learn.project.bc547.step4' | t }}</li>
        </ol>
        <a class="cta" routerLink="/lab" [queryParams]="{ example: 'bjt' }">
          {{ 'learn.project.bc547.openLab' | t }}
        </a>
      </article>

      <article class="project">
        <h2>{{ 'learn.project.relay.title' | t }}</h2>
        <p>{{ 'learn.project.relay.summary' | t }}</p>
        <ol class="checklist">
          <li>{{ 'learn.project.relay.step1' | t }}</li>
          <li>{{ 'learn.project.relay.step2' | t }}</li>
          <li>{{ 'learn.project.relay.step3' | t }}</li>
          <li>{{ 'learn.project.relay.step4' | t }}</li>
        </ol>
        <a class="cta" routerLink="/lab" [queryParams]="{ example: 'relay' }">
          {{ 'learn.project.relay.openLab' | t }}
        </a>
      </article>
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
    .project {
      border-top: 1px solid #d8dee6;
      padding-top: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .project h2 {
      margin: 0 0 0.5rem;
      color: #12263a;
      font-size: 1.25rem;
    }
    .project p {
      margin: 0 0 0.85rem;
      color: #5a6b7d;
      line-height: 1.45;
    }
    .checklist {
      margin: 0 0 1.25rem;
      padding-left: 1.25rem;
      color: #334155;
      line-height: 1.55;
    }
    .checklist li {
      margin-bottom: 0.35rem;
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
  `
})
export class LearnPageComponent {}
