import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { EN_FALLBACK, I18N_CATALOG_KEYS } from './en-fallback';
import { I18nService } from './i18n.service';

describe('i18n catalog', () => {
  it('has a non-empty English value for every catalog key', () => {
    expect(I18N_CATALOG_KEYS.length).toBeGreaterThan(40);
    for (const key of I18N_CATALOG_KEYS) {
      const value = EN_FALLBACK[key];
      expect(value).withContext(key).toBeTruthy();
      expect(value.trim().length).withContext(key).toBeGreaterThan(0);
    }
  });

  it('I18N_CATALOG_KEYS matches EN_FALLBACK keys', () => {
    expect([...I18N_CATALOG_KEYS].sort()).toEqual(Object.keys(EN_FALLBACK).sort());
  });

  it('interpolates {name} placeholders', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), I18nService]
    });
    const i18n = TestBed.inject(I18nService);
    expect(i18n.t('lab.probe.netDc', { id: 'n1', v: '3.3000' })).toBe('Net n1: 3.3000 V');
    expect(i18n.t('lab.results.tranSamples', { count: 42 })).toContain('42');
  });

  // Keep in sync with TranslationSeeder.English — sample parity for critical prefixes.
  it('covers required key prefixes', () => {
    const prefixes = [
      'shell.',
      'diag.',
      'lab.title',
      'lab.toolbar.',
      'lab.palette.',
      'lab.symbol.',
      'lab.param.',
      'lab.inspector.',
      'lab.results.',
      'lab.scope.',
      'lab.canvas.',
      'lab.probe.',
      'lab.sim.',
      'learn.',
      'account.'
    ];
    for (const prefix of prefixes) {
      const hit = I18N_CATALOG_KEYS.some((k) => k === prefix || k.startsWith(prefix));
      expect(hit).withContext(prefix).toBeTrue();
    }
  });
});
