import { Component } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-learn-page',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <section class="learn">
      <h1>{{ 'learn.title' | t }}</h1>
      <p>{{ 'learn.body' | t }}</p>
    </section>
  `,
  styles: `
    h1 {
      margin: 0 0 0.5rem;
      color: #12263a;
    }
    p {
      color: #5a6b7d;
      max-width: 40rem;
    }
  `
})
export class LearnPageComponent {}
