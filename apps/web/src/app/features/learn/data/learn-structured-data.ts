import { LearnUnit, learnStepKey, learnUnitPath } from './learn-catalog.model';

export type I18nLookup = (key: string) => string;

/** Build JSON-LD for a Learn unit page (`LearningResource` + `HowTo`). */
export function buildUnitJsonLd(unit: LearnUnit, t: I18nLookup, origin: string): object {
  const path = learnUnitPath(unit);
  const base = origin.replace(/\/$/, '');
  const pageUrl = base ? `${base}${path}` : path;
  const title = t(`${unit.i18nKeyPrefix}.title`);
  const summary = t(`${unit.i18nKeyPrefix}.summary`);

  const steps = Array.from({ length: unit.stepCount }, (_, i) => {
    const n = i + 1;
    return {
      '@type': 'HowToStep',
      position: n,
      name: `Step ${n}`,
      text: t(learnStepKey(unit, n))
    };
  });

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LearningResource',
        '@id': `${pageUrl}#resource`,
        name: title,
        description: summary,
        url: pageUrl,
        learningResourceType: 'hands-on project',
        teaches: summary,
        isAccessibleForFree: true,
        inLanguage: 'en'
      },
      {
        '@type': 'HowTo',
        '@id': `${pageUrl}#howto`,
        name: title,
        description: summary,
        step: steps
      }
    ]
  };
}

/** Build JSON-LD for the Learn hub. */
export function buildLearnHubJsonLd(t: I18nLookup, origin: string): object {
  const base = origin.replace(/\/$/, '');
  const hubUrl = base ? `${base}/learn` : '/learn';
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t('learn.title'),
    description: t('learn.meta.description'),
    url: hubUrl,
    ...(base ? { isPartOf: { '@type': 'WebSite', name: 'Electro Lab', url: base } } : {})
  };
}
