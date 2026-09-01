import { ApplicationConfig, provideAppInitializer, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { I18nService } from './core/i18n/i18n.service';
import { DEFAULT_LOCALE } from './core/i18n/en-fallback';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAppInitializer(() => {
      const i18n = inject(I18nService);
      return i18n.load(DEFAULT_LOCALE);
    }), provideClientHydration(withEventReplay())
  ]
};
