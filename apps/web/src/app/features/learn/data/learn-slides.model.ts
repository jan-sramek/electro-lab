/**
 * Slide-style lessons for the Read phase of a Learn unit.
 *
 * Text is referenced by i18n key (like every other Learn string) so the deck
 * structure stays language-neutral; figures are drawn as inline SVG from a
 * small vocabulary of kinds so lessons ship without binary assets and prerender.
 */

/** Vocabulary of inline-SVG figures the LearnFigureComponent can draw. */
export type LearnFigureKind =
  | 'water-tanks'
  | 'battery-meter'
  | 'scale'
  | 'potential-ladder'
  | 'loop'
  | 'charge-flow'
  | 'junction'
  | 'pipes'
  | 'resistor-bands'
  | 'ohm-triangle'
  | 'ohm-graph'
  | 'series-resistors'
  | 'heat'
  | 'current-bar'
  | 'waveform'
  | 'two-loads'
  | 'elements-grid';

export interface LearnFigure {
  kind: LearnFigureKind;
  /** i18n key of the caption under the figure. */
  captionKey?: string;
  /** Kind-specific, language-neutral parameters (numbers, unit symbols, flags). */
  params?: Record<string, unknown>;
}

export type LearnCalloutKind = 'tip' | 'formula' | 'warning';

export interface LearnSlide {
  id: string;
  titleKey: string;
  /** One i18n key per paragraph. */
  bodyKeys: readonly string[];
  figure?: LearnFigure;
  callout?: { kind: LearnCalloutKind; textKey: string };
  /** Bullet list of i18n keys (e.g. a takeaways slide). */
  factKeys?: readonly string[];
}

export type LearnSlideDeck = readonly LearnSlide[];
