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

      <article class="project">
        <h2>{{ 'learn.project.nmos.title' | t }}</h2>
        <p>{{ 'learn.project.nmos.summary' | t }}</p>
        <ol class="checklist">
          <li>{{ 'learn.project.nmos.step1' | t }}</li>
          <li>{{ 'learn.project.nmos.step2' | t }}</li>
          <li>{{ 'learn.project.nmos.step3' | t }}</li>
          <li>{{ 'learn.project.nmos.step4' | t }}</li>
        </ol>
        <a class="cta" routerLink="/lab" [queryParams]="{ example: 'nmos' }">
          {{ 'learn.project.nmos.openLab' | t }}
        </a>
      </article>

      <article class="project">
        <h2>{{ 'learn.project.ne555.title' | t }}</h2>
        <p>{{ 'learn.project.ne555.summary' | t }}</p>
        <ol class="checklist">
          <li>{{ 'learn.project.ne555.step1' | t }}</li>
          <li>{{ 'learn.project.ne555.step2' | t }}</li>
          <li>{{ 'learn.project.ne555.step3' | t }}</li>
          <li>{{ 'learn.project.ne555.step4' | t }}</li>
        </ol>
        <a class="cta" routerLink="/lab" [queryParams]="{ example: 'ne555' }">
          {{ 'learn.project.ne555.openLab' | t }}
        </a>
      </article>

      <article class="project">
        <h2>{{ 'learn.project.pushbutton.title' | t }}</h2>
        <p>{{ 'learn.project.pushbutton.summary' | t }}</p>
        <ol class="checklist">
          <li>{{ 'learn.project.pushbutton.step1' | t }}</li>
          <li>{{ 'learn.project.pushbutton.step2' | t }}</li>
          <li>{{ 'learn.project.pushbutton.step3' | t }}</li>
          <li>{{ 'learn.project.pushbutton.step4' | t }}</li>
        </ol>
        <a class="cta" routerLink="/lab" [queryParams]="{ example: 'pushbutton' }">
          {{ 'learn.project.pushbutton.openLab' | t }}
        </a>
      </article>

      <article class="project">
        <h2>{{ 'learn.project.ldr.title' | t }}</h2>
        <p>{{ 'learn.project.ldr.summary' | t }}</p>
        <ol class="checklist">
          <li>{{ 'learn.project.ldr.step1' | t }}</li>
          <li>{{ 'learn.project.ldr.step2' | t }}</li>
          <li>{{ 'learn.project.ldr.step3' | t }}</li>
          <li>{{ 'learn.project.ldr.step4' | t }}</li>
        </ol>
        <a class="cta" routerLink="/lab" [queryParams]="{ example: 'ldr' }">
          {{ 'learn.project.ldr.openLab' | t }}
        </a>
      </article>

      <article class="project">
        <h2>{{ 'learn.project.buzzer.title' | t }}</h2>
        <p>{{ 'learn.project.buzzer.summary' | t }}</p>
        <ol class="checklist">
          <li>{{ 'learn.project.buzzer.step1' | t }}</li>
          <li>{{ 'learn.project.buzzer.step2' | t }}</li>
          <li>{{ 'learn.project.buzzer.step3' | t }}</li>
          <li>{{ 'learn.project.buzzer.step4' | t }}</li>
        </ol>
        <a class="cta" routerLink="/lab" [queryParams]="{ example: 'buzzer' }">
          {{ 'learn.project.buzzer.openLab' | t }}
        </a>
      </article>

      <article class="project">
        <h2>{{ 'learn.project.motor.title' | t }}</h2>
        <p>{{ 'learn.project.motor.summary' | t }}</p>
        <ol class="checklist">
          <li>{{ 'learn.project.motor.step1' | t }}</li>
          <li>{{ 'learn.project.motor.step2' | t }}</li>
          <li>{{ 'learn.project.motor.step3' | t }}</li>
          <li>{{ 'learn.project.motor.step4' | t }}</li>
        </ol>
        <a class="cta" routerLink="/lab" [queryParams]="{ example: 'motor' }">
          {{ 'learn.project.motor.openLab' | t }}
        </a>
      </article>

      <article class="project">
        <h2>{{ 'learn.project.arduino.title' | t }}</h2>
        <p>{{ 'learn.project.arduino.summary' | t }}</p>
        <ol class="checklist">
          <li>{{ 'learn.project.arduino.step1' | t }}</li>
          <li>{{ 'learn.project.arduino.step2' | t }}</li>
          <li>{{ 'learn.project.arduino.step3' | t }}</li>
          <li>{{ 'learn.project.arduino.step4' | t }}</li>
        </ol>
        <a class="cta" routerLink="/lab" [queryParams]="{ example: 'arduino' }">
          {{ 'learn.project.arduino.openLab' | t }}
        </a>
      </article>

      <article class="project">
        <h2>{{ 'learn.project.i2cOled.title' | t }}</h2>
        <p>{{ 'learn.project.i2cOled.summary' | t }}</p>
        <ol class="checklist">
          <li>{{ 'learn.project.i2cOled.step1' | t }}</li>
          <li>{{ 'learn.project.i2cOled.step2' | t }}</li>
          <li>{{ 'learn.project.i2cOled.step3' | t }}</li>
          <li>{{ 'learn.project.i2cOled.step4' | t }}</li>
        </ol>
        <a class="cta" routerLink="/lab" [queryParams]="{ example: 'i2cOled' }">
          {{ 'learn.project.i2cOled.openLab' | t }}
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
