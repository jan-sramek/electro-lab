import { Component, computed, input, output, signal } from '@angular/core';
import { TranResult, TranSeries } from '../../api/circuit-api.types';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

export interface ScopeChannel {
  id: string;
  kind: 'voltage' | 'current';
  values: number[];
  color: string;
}

const COLORS = ['#0b6e4f', '#1d4ed8', '#b45309', '#7c3aed', '#be123c'];

@Component({
  selector: 'app-scope',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './scope.component.html',
  styleUrl: './scope.component.css'
})
export class ScopeComponent {
  readonly tran = input<TranResult | null>(null);
  readonly probeTarget = input<{ kind: 'net' | 'component'; id: string } | null>(null);
  readonly scrubIndex = input(0);
  readonly scrubIndexChange = output<number>();

  readonly channels = computed((): ScopeChannel[] => {
    const t = this.tran();
    if (!t?.time?.length) return [];
    const out: ScopeChannel[] = [];
    const probe = this.probeTarget();

    const addVoltage = (s: TranSeries | undefined, color: string) => {
      if (!s || s.id === 'gnd') return;
      if (out.some((c) => c.id === s.id && c.kind === 'voltage')) return;
      out.push({ id: s.id, kind: 'voltage', values: s.values, color });
    };
    const addCurrent = (s: TranSeries | undefined, color: string) => {
      if (!s) return;
      if (out.some((c) => c.id === s.id && c.kind === 'current')) return;
      out.push({
        id: s.id,
        kind: 'current',
        values: s.values.map((v) => v * 1000),
        color
      });
    };

    if (probe?.kind === 'net') {
      addVoltage(
        t.nodeVoltages.find((s) => s.id === probe.id),
        COLORS[0]
      );
    } else if (probe?.kind === 'component') {
      addCurrent(
        t.branchCurrents.find((s) => s.id === probe.id),
        COLORS[0]
      );
    }

    // Always show a second useful net when available (teaching default).
    const extras = t.nodeVoltages.filter((s) => s.id !== 'gnd');
    for (const s of extras) {
      if (out.length >= 3) break;
      addVoltage(s, COLORS[out.length % COLORS.length]);
    }

    return out;
  });

  readonly paths = computed(() => {
    const t = this.tran();
    const chans = this.channels();
    if (!t || t.time.length < 2 || !chans.length) return [];

    const w = 320;
    const h = 120;
    const pad = 8;
    const t0 = t.time[0];
    const t1 = t.time[t.time.length - 1] || 1;

    let vmin = Infinity;
    let vmax = -Infinity;
    for (const c of chans) {
      for (const v of c.values) {
        vmin = Math.min(vmin, v);
        vmax = Math.max(vmax, v);
      }
    }
    if (!Number.isFinite(vmin) || vmin === vmax) {
      vmin -= 1;
      vmax += 1;
    }

    return chans.map((c) => ({
      id: c.id,
      kind: c.kind,
      color: c.color,
      d: c.values
        .map((v, i) => {
          const x = pad + ((t.time[i] - t0) / (t1 - t0)) * (w - 2 * pad);
          const y = pad + (1 - (v - vmin) / (vmax - vmin)) * (h - 2 * pad);
          return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ')
    }));
  });

  readonly scrubX = computed(() => {
    const t = this.tran();
    if (!t?.time.length) return 8;
    const idx = Math.max(0, Math.min(this.scrubIndex(), t.time.length - 1));
    const pad = 8;
    const w = 320;
    const t0 = t.time[0];
    const t1 = t.time[t.time.length - 1] || 1;
    return pad + ((t.time[idx] - t0) / (t1 - t0)) * (w - 2 * pad);
  });

  readonly timeLabel = computed(() => {
    const t = this.tran();
    if (!t?.time.length) return '';
    const idx = Math.max(0, Math.min(this.scrubIndex(), t.time.length - 1));
    return t.time[idx].toExponential(2);
  });

  onPlotPointer(ev: PointerEvent): void {
    const t = this.tran();
    if (!t?.time.length) return;
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * 320;
    const pad = 8;
    const frac = Math.max(0, Math.min(1, (x - pad) / (320 - 2 * pad)));
    const idx = Math.round(frac * (t.time.length - 1));
    this.scrubIndexChange.emit(idx);
  }
}
