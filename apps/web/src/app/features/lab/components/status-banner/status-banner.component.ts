import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

export interface StatusTextSegment {
  text: string;
  /** When set, clicking selects this component id. */
  partId?: string;
}

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
  /** Part ids currently highlighted — turned into clickable links in messages. */
  readonly highlightIds = input<string[]>([]);
  readonly selectPart = output<string>();

  segments(text: string): StatusTextSegment[] {
    const ids = [...new Set(this.highlightIds().filter(Boolean))].sort((a, b) => b.length - a.length);
    if (!ids.length || !text) return [{ text }];
    const escaped = ids.map((id) => id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const re = new RegExp(`(${escaped.join('|')})`, 'g');
    const parts = text.split(re);
    return parts
      .filter((p) => p.length > 0)
      .map((p) => (ids.includes(p) ? { text: p, partId: p } : { text: p }));
  }

  onSelectPart(id: string, ev: Event): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.selectPart.emit(id);
  }
}
