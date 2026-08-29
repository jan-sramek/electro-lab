import { Component } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <section class="account">
      <h1>{{ 'account.title' | t }}</h1>
      <p>{{ 'account.body' | t }}</p>
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
export class AccountPageComponent {}
