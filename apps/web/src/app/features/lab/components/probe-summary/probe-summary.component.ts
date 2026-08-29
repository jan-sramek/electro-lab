import { Component, input } from '@angular/core';

@Component({
  selector: 'app-probe-summary',
  standalone: true,
  template: `
    @if (summary()) {
      <p class="probe">{{ summary() }}</p>
    }
  `,
  styles: `
    .probe {
      color: #1d4ed8;
      font-size: 0.9rem;
      margin: 0 0 0.5rem;
      font-weight: 600;
    }
  `
})
export class ProbeSummaryComponent {
  readonly summary = input<string | null>(null);
}
