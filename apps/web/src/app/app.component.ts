import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from './core/i18n/translate.pipe';
import { I18nService, SUPPORTED_LOCALES, SupportedLocale } from './core/i18n/i18n.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly i18n = inject(I18nService);
  readonly locales = SUPPORTED_LOCALES;

  setLocale(locale: SupportedLocale): void {
    void this.i18n.setLocale(locale);
  }
}
