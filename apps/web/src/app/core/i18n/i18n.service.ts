import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_LOCALE, EN_FALLBACK } from './en-fallback';

export interface I18nResponse {
  locale: string;
  messages: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);

  readonly locale = signal(DEFAULT_LOCALE);
  readonly ready = signal(false);
  private messages: Record<string, string> = { ...EN_FALLBACK };

  /** Load dictionary from LearningApi; keep English fallback on failure. */
  async load(locale: string = DEFAULT_LOCALE): Promise<void> {
    const normalized = (locale || DEFAULT_LOCALE).toLowerCase();
    try {
      const res = await firstValueFrom(
        this.http.get<I18nResponse>(`/api/learning/i18n/${normalized}`)
      );
      this.messages = { ...EN_FALLBACK, ...(res.messages ?? {}) };
      this.locale.set(res.locale || normalized);
    } catch {
      this.messages = { ...EN_FALLBACK };
      this.locale.set(DEFAULT_LOCALE);
    } finally {
      this.ready.set(true);
    }
  }

  /**
   * Resolve a message key. Optional `params` replace `{name}` placeholders.
   */
  t(key: string, params?: Record<string, string | number>): string {
    let text = this.messages[key] ?? EN_FALLBACK[key] ?? key;
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.replaceAll(`{${name}}`, String(value));
      }
    }
    return text;
  }
}
