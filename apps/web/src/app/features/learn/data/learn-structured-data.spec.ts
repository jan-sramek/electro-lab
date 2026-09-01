import { buildLearnHubJsonLd, buildUnitJsonLd } from './learn-structured-data';
import { findLearnUnit } from './learn-catalog';

describe('learn-structured-data', () => {
  const t = (key: string) => key;

  it('builds HowTo steps from unit stepCount', () => {
    const unit = findLearnUnit('buses', 'i2c-oled-wiring');
    expect(unit).toBeDefined();
    const json = buildUnitJsonLd(unit!, t, 'https://example.com') as {
      '@graph': { '@type': string; step?: unknown[] }[];
    };
    const howTo = json['@graph'].find((n) => n['@type'] === 'HowTo');
    expect(howTo?.step?.length).toBe(4);
  });

  it('includes LearningResource with page url', () => {
    const unit = findLearnUnit('switching', 'bjt-switch');
    const json = buildUnitJsonLd(unit!, t, 'https://example.com') as {
      '@graph': { '@type': string; url?: string }[];
    };
    const resource = json['@graph'].find((n) => n['@type'] === 'LearningResource');
    expect(resource?.url).toBe('https://example.com/learn/switching/bjt-switch');
  });

  it('builds hub CollectionPage', () => {
    const json = buildLearnHubJsonLd(t, 'https://example.com') as { url?: string };
    expect(json.url).toBe('https://example.com/learn');
  });
});
