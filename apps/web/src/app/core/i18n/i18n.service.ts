import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { DEFAULT_LOCALE, EN_FALLBACK } from './en-fallback';

export interface I18nResponse {
  locale: string;
  messages: Record<string, string>;
}

/** App bootstrap must never hang on the Learning API — fall back to embedded English after this. */
export const I18N_LOAD_TIMEOUT_MS = 3000;
const RETRY_DELAYS_MS = [5000, 20000];

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly locale = signal(DEFAULT_LOCALE);
  readonly ready = signal(false);
  private messages: Record<string, string> = { ...EN_FALLBACK };

  /** Load dictionary from LearningApi (bounded); keep English fallback on failure and retry in background. */
  async load(locale: string = DEFAULT_LOCALE): Promise<void> {
    const normalized = (locale || DEFAULT_LOCALE).toLowerCase();
    const ok = await this.fetchAndApply(normalized);
    if (!ok) {
      this.messages = { ...EN_FALLBACK };
      this.locale.set(DEFAULT_LOCALE);
      if (this.isBrowser) this.scheduleRetry(normalized, 0);
    }
    this.ready.set(true);
  }

  /**
   * Resolve a message key. Optional `params` replace `{name}` placeholders in a single pass,
   * so a substituted value containing `{x}` is never re-substituted.
   */
  t(key: string, params?: Record<string, string | number>): string {
    const text = this.messages[key] ?? EN_FALLBACK[key] ?? key;
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (match, name: string) =>
      Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
    );
  }

  private async fetchAndApply(normalized: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.get<I18nResponse>(`/api/learning/i18n/${normalized}`).pipe(timeout(I18N_LOAD_TIMEOUT_MS))
      );
      this.messages = { ...EN_FALLBACK, ...(res.messages ?? {}) };
      this.locale.set(res.locale || normalized);
      return true;
    } catch {
      return false;
    }
  }

  private scheduleRetry(normalized: string, attempt: number): void {
    const delay = RETRY_DELAYS_MS[attempt];
    if (delay === undefined) return;
    setTimeout(() => {
      void this.fetchAndApply(normalized).then((ok) => {
        if (!ok) this.scheduleRetry(normalized, attempt + 1);
      });
    }, delay);
  }
}
