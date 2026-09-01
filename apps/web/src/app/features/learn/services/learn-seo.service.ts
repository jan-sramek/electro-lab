import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { absoluteSiteUrl, siteOrigin } from '../../../core/site-url';
import { I18nService } from '../../../core/i18n/i18n.service';
import { buildLearnHubJsonLd, buildUnitJsonLd } from '../data/learn-structured-data';
import { learnUnitPath, LearnUnit } from '../data/learn-catalog.model';

const JSON_LD_ID = 'learn-json-ld';

@Injectable({ providedIn: 'root' })
export class LearnSeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly i18n = inject(I18nService);
  private readonly doc = inject(DOCUMENT);

  setHubPage(): void {
    const pageTitle = `${this.i18n.t('learn.title')} — Electro Lab`;
    const description = this.i18n.t('learn.meta.description');
    const url = absoluteSiteUrl('/learn');

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.setOpenGraph(pageTitle, description, url, 'website');
    this.setCanonical(url);
    this.setJsonLd(buildLearnHubJsonLd((k) => this.i18n.t(k), siteOrigin()));
  }

  setUnitPage(unit: LearnUnit): void {
    const unitTitle = this.i18n.t(`${unit.i18nKeyPrefix}.title`);
    const pageTitle = `${unitTitle} — Learn`;
    const description = this.i18n.t(`${unit.i18nKeyPrefix}.summary`);
    const url = absoluteSiteUrl(learnUnitPath(unit));

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.setOpenGraph(pageTitle, description, url, 'article');
    this.setCanonical(url);
    this.setJsonLd(buildUnitJsonLd(unit, (k) => this.i18n.t(k), siteOrigin()));
  }

  /** Remove Learn JSON-LD when leaving Learn (e.g. client nav to Lab). */
  clearLearnSeo(): void {
    this.doc.getElementById(JSON_LD_ID)?.remove();
    this.doc.querySelector('link[rel="canonical"]')?.remove();
  }

  private setOpenGraph(title: string, description: string, url: string, type: string): void {
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:locale', content: 'en' });
  }

  private setCanonical(url: string): void {
    let link = this.doc.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.href = url;
  }

  private setJsonLd(data: object): void {
    this.doc.getElementById(JSON_LD_ID)?.remove();
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.id = JSON_LD_ID;
    script.text = JSON.stringify(data);
    this.doc.head.appendChild(script);
  }
}
