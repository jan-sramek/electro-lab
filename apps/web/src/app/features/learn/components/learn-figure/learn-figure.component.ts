import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { SymbolGlyphComponent } from '../../../lab/components/symbol-glyph/symbol-glyph.component';
import { LearnFigure } from '../../data/learn-slides.model';

/**
 * Inline-SVG teaching figures for slide lessons. Text inside the drawings is
 * limited to numbers, units and symbols; explanations live in the i18n caption.
 * Lab glyphs are reused so parts look exactly like they do on the canvas.
 */
@Component({
  selector: 'app-learn-figure',
  standalone: true,
  imports: [TranslatePipe, SymbolGlyphComponent],
  templateUrl: './learn-figure.component.html',
  styleUrl: './learn-figure.component.css'
})
export class LearnFigureComponent {
  readonly figure = input.required<LearnFigure>();

  readonly kind = computed(() => this.figure().kind);
  readonly p = computed(() => this.figure().params ?? {});

  str(key: string, fallback = ''): string {
    const v = this.p()[key];
    return v === undefined || v === null ? fallback : String(v);
  }

  num(key: string, fallback = 0): number {
    const v = Number(this.p()[key]);
    return Number.isFinite(v) ? v : fallback;
  }

  flag(key: string): boolean {
    return this.p()[key] === true;
  }

  list<T = unknown>(key: string): T[] {
    const v = this.p()[key];
    return Array.isArray(v) ? (v as T[]) : [];
  }

  /** Scale figure: tick labels with their 0..1 positions. */
  readonly scaleTicks = computed(() => {
    const labels = this.list<string>('ticks');
    const marks = this.list<number>('marks');
    return labels.map((label, i) => ({ label, x: 30 + (marks[i] ?? i / Math.max(1, labels.length - 1)) * 260 }));
  });

  /** Ohm graph: bars for [label, mA] rows. */
  readonly graphRows = computed(() => {
    const rows = this.list<[string, number]>('rows');
    const max = Math.max(1, ...rows.map((r) => Number(r[1]) || 0));
    return rows.map(([label, mA], i) => ({
      label,
      mA,
      x: 70 + i * 60,
      h: (Number(mA) / max) * 100
    }));
  });

  /** Potential ladder rungs (top → bottom). */
  readonly ladderLevels = computed(() => {
    const levels = this.list<string>('levels');
    const n = Math.max(1, levels.length - 1);
    return levels.map((label, i) => ({ label, y: 30 + (i / n) * 110 }));
  });

  /** Current-bar zone widths in px for a 260 px bar. */
  readonly currentZones = computed(() => {
    const max = Math.max(1, this.num('max', 45));
    const safe = Math.min(max, this.num('safeMax', 20));
    const burn = Math.min(max, Math.max(safe, this.num('burn', 35)));
    const px = (mA: number) => (mA / max) * 260;
    return { safe: px(safe), warn: px(burn) - px(safe), burn: 260 - px(burn), safeLabel: `${safe} mA`, burnLabel: `${burn} mA` };
  });

  /** Ohm graph I–V lines: [label, slope 0..1] → end point on a 0..200 x 0..100 plot. */
  readonly ivLines = computed(() => {
    const lines = this.list<[string, number]>('lines');
    return lines.map(([label, slope]) => ({ label, x2: 50 + 200, y2: 140 - Math.min(1, Number(slope)) * 100 }));
  });

  /** Sine wave path for the waveform figure (one or more cycles). */
  wavePath(x0: number, x1: number, yMid: number, amp: number, cycles: number, rectified = false): string {
    const steps = 96;
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x0 + (x1 - x0) * t;
      let v = Math.sin(t * cycles * 2 * Math.PI);
      if (rectified) v = Math.abs(v);
      const y = yMid - v * amp;
      d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    return d;
  }

  /** Smoothed (capacitor) envelope over rectified bumps. */
  smoothPath(x0: number, x1: number, yMid: number, amp: number, cycles: number): string {
    const steps = 96;
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x0 + (x1 - x0) * t;
      const phase = (t * cycles * 2) % 1; // two bumps per cycle
      const v = 1 - 0.18 * phase;
      d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${(yMid - v * amp).toFixed(1)} `;
    }
    return d;
  }

  /** Elements grid cells: glyph model keys with optional i18n label keys. */
  readonly gridCells = computed(() => {
    const parts = this.list<string>('parts');
    const labelKeys = this.list<string>('labelKeys');
    const n = Math.max(1, parts.length);
    const cellW = 320 / n;
    return parts.map((modelKey, i) => ({
      modelKey,
      labelKey: labelKeys[i] ?? null,
      x: cellW * i + cellW / 2,
      scale: Math.min(0.75, (cellW * 0.8) / 96)
    }));
  });

  /** Two-loads figure: labels for each load and an optional total. */
  readonly twoLoads = computed(() => ({
    parallel: this.str('topology') === 'parallel',
    led: this.str('parts') === 'led',
    labels: this.list<string>('labels'),
    total: this.str('showTotal')
  }));

  /** Loop figure options. */
  readonly loop = computed(() => ({
    switchOpen: this.flag('switchOpen'),
    hasSwitch: this.flag('switchOpen') || this.p()['switchOpen'] === false,
    flow: this.p()['flow'] !== false,
    drops: this.flag('drops'),
    designators: this.flag('designators'),
    meter: this.str('meter')
  }));
}
