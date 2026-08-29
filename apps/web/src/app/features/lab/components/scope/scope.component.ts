import { Component, computed, input } from '@angular/core';
import { TranResult } from '../../api/circuit-api.types';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-scope',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './scope.component.html',
  styleUrl: './scope.component.css'
})
export class ScopeComponent {
  readonly tran = input<TranResult | null>(null);
  readonly preferredNet = input<string | null>(null);

  readonly series = computed(() => {
    const t = this.tran();
    if (!t?.nodeVoltages?.length) return null;
    const prefer = this.preferredNet();
    const pick =
      (prefer && t.nodeVoltages.find((s) => s.id === prefer)) ||
      t.nodeVoltages.find((s) => s.id !== 'gnd') ||
      t.nodeVoltages[0];
    return pick;
  });

  readonly path = computed(() => {
    const t = this.tran();
    const s = this.series();
    if (!t || !s || t.time.length < 2) return '';

    const w = 320;
    const h = 120;
    const pad = 8;
    const t0 = t.time[0];
    const t1 = t.time[t.time.length - 1] || 1;
    let vmin = Math.min(...s.values);
    let vmax = Math.max(...s.values);
    if (vmin === vmax) {
      vmin -= 1;
      vmax += 1;
    }

    return s.values
      .map((v, i) => {
        const x = pad + ((t.time[i] - t0) / (t1 - t0)) * (w - 2 * pad);
        const y = pad + (1 - (v - vmin) / (vmax - vmin)) * (h - 2 * pad);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  });
}
