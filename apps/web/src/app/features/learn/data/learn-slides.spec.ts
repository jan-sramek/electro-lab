import { EN_FALLBACK } from '../../../core/i18n/en-fallback';
import { LEARN_UNITS } from './learn-catalog';
import { LEARN_SLIDE_DECKS, LEARN_SLIDES_I18N, learnSlideDeckFor } from './learn-slides-content';
import { LearnFigureKind } from './learn-slides.model';

const FIGURE_KINDS: readonly LearnFigureKind[] = [
  'water-tanks', 'battery-meter', 'scale', 'potential-ladder', 'loop', 'charge-flow', 'junction',
  'pipes', 'resistor-bands', 'ohm-triangle', 'ohm-graph', 'series-resistors', 'heat', 'current-bar',
  'waveform', 'two-loads', 'elements-grid'
];

describe('learn slide decks', () => {
  it('every deck belongs to a catalog unit', () => {
    for (const slug of Object.keys(LEARN_SLIDE_DECKS)) {
      expect(LEARN_UNITS.some((u) => u.unitSlug === slug)).withContext(slug).toBeTrue();
    }
  });

  it('the seven concept openers open the basics module with deep decks', () => {
    expect(LEARN_UNITS.slice(0, 7).map((u) => u.unitSlug)).toEqual([
      'voltage-intro', 'current-intro', 'resistance-intro', 'ohms-law', 'circuit-elements', 'series-parallel-circuits', 'ac-dc'
    ]);
    for (const slug of ['voltage-intro', 'current-intro', 'resistance-intro', 'ohms-law', 'circuit-elements', 'series-parallel-circuits', 'ac-dc']) {
      const deck = learnSlideDeckFor(slug)!;
      expect(deck.length).withContext(slug).toBeGreaterThanOrEqual(6);
      expect(deck.filter((s) => s.figure).length).withContext(`${slug} figures`).toBeGreaterThanOrEqual(5);
      expect(deck[deck.length - 1].factKeys?.length).withContext(`${slug} takeaways`).toBeGreaterThanOrEqual(3);
    }
  });

  it('every slide key resolves to non-empty English copy in EN_FALLBACK', () => {
    for (const [slug, deck] of Object.entries(LEARN_SLIDE_DECKS)) {
      for (const s of deck) {
        const keys = [s.titleKey, ...s.bodyKeys, ...(s.factKeys ?? [])];
        if (s.callout) keys.push(s.callout.textKey);
        if (s.figure?.captionKey) keys.push(s.figure.captionKey);
        const labelKeys = s.figure?.params?.['labelKeys'];
        if (Array.isArray(labelKeys)) keys.push(...(labelKeys as string[]));
        for (const k of keys) {
          expect(EN_FALLBACK[k]).withContext(`${slug} ${k}`).toBeTruthy();
          expect(LEARN_SLIDES_I18N[k]).withContext(`${slug} ${k} in slides i18n`).toBe(EN_FALLBACK[k]);
        }
        expect(s.bodyKeys.length).withContext(`${slug} ${s.id} paragraphs`).toBeGreaterThan(0);
      }
    }
  });

  it('slide ids are unique per deck and figure kinds are drawable', () => {
    for (const [slug, deck] of Object.entries(LEARN_SLIDE_DECKS)) {
      expect(new Set(deck.map((s) => s.id)).size).withContext(slug).toBe(deck.length);
      for (const s of deck) {
        if (s.figure) expect(FIGURE_KINDS).withContext(`${slug} ${s.id}`).toContain(s.figure.kind);
      }
    }
  });

  it('learnSlideDeckFor returns null for units without a deck', () => {
    expect(learnSlideDeckFor('fundamentals-loop')).toBeNull();
    expect(learnSlideDeckFor('nope')).toBeNull();
  });
});
