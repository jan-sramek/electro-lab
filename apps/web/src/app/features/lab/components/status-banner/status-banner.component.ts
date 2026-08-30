import { Component, input } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

/** Circuit-level errors, warnings, info, and probe readout — sits on the canvas. */
@Component({
  selector: 'app-status-banner',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './status-banner.component.html',
  styleUrl: './status-banner.component.css'
})
export class StatusBannerComponent {
  readonly error = input<string | null>(null);
  readonly warnings = input<string[]>([]);
  readonly info = input<string | null>(null);
  readonly probe = input<string | null>(null);
}
