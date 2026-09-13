import { CS_MESSAGES } from './cs';
import { EN_FALLBACK } from './en-fallback';

describe('Czech dictionary', () => {
  it('only translates keys that exist in English', () => {
    const orphans = Object.keys(CS_MESSAGES).filter((k) => !(k in EN_FALLBACK));
    expect(orphans).withContext(orphans.join(', ')).toEqual([]);
  });

  it('keeps every {placeholder} of the English source', () => {
    const problems: string[] = [];
    for (const [k, cs] of Object.entries(CS_MESSAGES)) {
      const en = EN_FALLBACK[k];
      if (!en) continue;
      const want = (en.match(/\{\w+\}/g) ?? []).sort();
      const have = (cs.match(/\{\w+\}/g) ?? []).sort();
      if (want.join() !== have.join()) problems.push(`${k}: ${want.join(' ')} vs ${have.join(' ')}`);
    }
    expect(problems).withContext(problems.join('\n')).toEqual([]);
  });

  it('covers the whole basics module and the Learn / Lab chrome', () => {
    const basics = Object.keys(EN_FALLBACK).filter((k) =>
      /^learn\.project\.(voltageIntro|currentIntro|resistanceIntro|ohmsLaw|circuitElements|seriesParallelCircuits|acDc|fundamentalsLoop|led|diodeDirection|seriesLeds|ledBurnLimit|rc|ledFade|pulseRc|basicsFinal)\./.test(k)
    );
    const missing = basics.filter((k) => !(k in CS_MESSAGES) && !/\.challenge\.c\d\.label$/.test(k));
    expect(missing).withContext(missing.join(', ')).toEqual([]);
    for (const k of ['shell.nav.learn', 'lab.toolbar.run', 'learn.unit.phase.read', 'learn.slides.next', 'learn.points.total']) {
      expect(CS_MESSAGES[k]).withContext(k).toBeTruthy();
    }
  });
});
