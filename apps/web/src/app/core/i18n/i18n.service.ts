import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { DEFAULT_LOCALE, EN_FALLBACK } from './en-fallback';
import { CS_MESSAGES } from './cs';

export interface I18nResponse {
  locale: string;
  messages: Record<string, string>;
}

/** App bootstrap must never hang on the Learning API — fall back to embedded English after this. */
export const I18N_LOAD_TIMEOUT_MS = 3000;
const RETRY_DELAYS_MS = [5000, 20000];

/** Locales the UI offers. Bundled dictionaries make each usable offline; the API can extend them. */
export const SUPPORTED_LOCALES = ['en', 'cs'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const LOCALE_STORAGE_KEY = 'app.locale';

const BUNDLES: Record<SupportedLocale, Record<string, string>> = {
  en: {},
  cs: CS_MESSAGES
};

export function isSupportedLocale(value: string | null | undefined): value is SupportedLocale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly document = inject(DOCUMENT);

  readonly locale = signal<string>(DEFAULT_LOCALE);
  readonly ready = signal(false);
  /** Bumped on every dictionary change so impure pipes and computed views refresh. */
  readonly version = signal(0);
  private messages: Record<string, string> = { ...EN_FALLBACK };

  /** Locale remembered on this device, else the default. */
  storedLocale(): SupportedLocale {
    if (!this.isBrowser) return DEFAULT_LOCALE as SupportedLocale;
    try {
      const v = localStorage.getItem(LOCALE_STORAGE_KEY);
      return isSupportedLocale(v) ? v : (DEFAULT_LOCALE as SupportedLocale);
    } catch {
      return DEFAULT_LOCALE as SupportedLocale;
    }
  }

  /** Switch language: apply the bundled dictionary at once, then refine from the API. */
  async setLocale(locale: SupportedLocale): Promise<void> {
    if (this.isBrowser) {
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      } catch {
        /* storage unavailable */
      }
    }
    await this.load(locale);
  }

  /** Load dictionary from LearningApi (bounded); keep the bundled dictionary on failure and retry in background. */
  async load(locale: string = DEFAULT_LOCALE): Promise<void> {
    const normalized = (locale || DEFAULT_LOCALE).toLowerCase();
    this.apply(normalized, {});
    const ok = await this.fetchAndApply(normalized);
    if (!ok && this.isBrowser) this.scheduleRetry(normalized, 0);
    this.ready.set(true);
  }

  /** True when a message exists for the key (server bundle or bundled fallback). */
  has(key: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.messages, key) || Object.prototype.hasOwnProperty.call(EN_FALLBACK, key);
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

  private apply(locale: string, server: Record<string, string>): void {
    const bundle = isSupportedLocale(locale) ? BUNDLES[locale] : {};
    this.messages = { ...EN_FALLBACK, ...bundle, ...server };
    this.locale.set(locale);
    this.document.documentElement?.setAttribute('lang', locale);
    this.version.update((v) => v + 1);
  }

  private async fetchAndApply(normalized: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.get<I18nResponse>(`/api/learning/i18n/${normalized}`).pipe(timeout(I18N_LOAD_TIMEOUT_MS))
      );
      // Ignore a late response for a locale the user has since switched away from.
      if (this.locale() !== normalized) return true;
      this.apply(res.locale || normalized, res.messages ?? {});
      return true;
    } catch {
      return false;
    }
  }

  private scheduleRetry(normalized: string, attempt: number): void {
    const delay = RETRY_DELAYS_MS[attempt];
    if (delay === undefined) return;
    setTimeout(() => {
      if (this.locale() !== normalized) return;
      void this.fetchAndApply(normalized).then((ok) => {
        if (!ok) this.scheduleRetry(normalized, attempt + 1);
      });
    }, delay);
  }
}
