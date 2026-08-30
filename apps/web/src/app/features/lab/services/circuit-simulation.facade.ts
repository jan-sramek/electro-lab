import { Injectable, NgZone, computed, effect, inject, signal } from '@angular/core';
import { Subject, catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CircuitApiClient } from '../api/circuit-api.client';
import { SimulateRequest, SimulateResponse } from '../api/circuit-api.types';
import { parseHighlightedIds } from '../data/schematic.model';
import {
  allSwitchesOpen,
  compileNetlistWithCapIc,
  finalCapVoltagesFromTran,
  schematicCapFingerprint
} from '../data/cap-ic';
import {
  SINGULAR_FALLBACK_KEY,
  diagnoseSchematic,
  diagnosticErrors,
  diagnosticWarnings,
  isSingularMatrixMessage
} from '../data/circuit-diagnostics';
import { LabEditorStore } from './lab-editor.store';
import { I18nService } from '../../../core/i18n/i18n.service';
import { LED_BURN_A } from '../data/led-limits';

function branchCurrentFromResult(res: SimulateResponse, id: string): number | null {
  const dc = res.dcOp?.branchCurrents?.[id];
  if (typeof dc === 'number') return dc;
  const series = res.tran?.branchCurrents.find((s) => s.id === id);
  if (!series?.values.length) return null;
  return series.values.reduce(
    (best, v) => (Math.abs(v) > Math.abs(best) ? v : best),
    series.values[0]!
  );
}

@Injectable()
export class CircuitSimulationFacade {
  private readonly api = inject(CircuitApiClient);
  private readonly editor = inject(LabEditorStore);
  private readonly i18n = inject(I18nService);
  private readonly zone = inject(NgZone);
  private readonly simulate$ = new Subject<{ body: SimulateRequest; showBusy: boolean }>();
  /** Debounced auto-sim after schematic edits (no Run-button flicker). */
  private readonly autoRun$ = new Subject<void>();
  private showBusyForRequest = false;

  readonly result = signal<SimulateResponse | null>(null);
  /** True only for an explicit toolbar Run — keeps the label from jumping on auto-sim. */
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly warnings = signal<string[]>([]);
  readonly highlightComponentIds = signal<string[]>([]);
  readonly highlightNetIds = signal<string[]>([]);
  /** Sample index into tran.time for canvas/probe scrubbing. */
  readonly scrubIndex = signal(0);
  private scrubPlayTimer: ReturnType<typeof setInterval> | null = null;

  /** Last final capacitor voltages after a successful tran (for open-switch discharge). */
  private storedCapIc = new Map<string, number>();
  private storedCapFingerprint = '';
  /** Reactive summary for status banner (max |Vc| among stored caps). */
  private readonly storedCapIcVolts = signal<number | null>(null);
  /** True when the last request injected capacitor IC (discharge / fade run). */
  private lastRunInjectedIc = false;

  readonly highlightedIds = computed(() => {
    const fromDiag = this.highlightComponentIds();
    if (fromDiag.length) return fromDiag;
    const msgs = [...(this.warnings() ?? []), ...(this.error() ? [this.error()!] : [])];
    const fromResult = this.result();
    if (fromResult?.errors?.length) msgs.push(...fromResult.errors);
    return parseHighlightedIds(msgs);
  });

  readonly highlightedNets = computed(() => this.highlightNetIds());

  /** Banner line when Lab has stored Vc for a discharge re-run. */
  readonly capIcStatus = computed(() => {
    this.editor.revision();
    const v = this.storedCapIcVolts();
    if (v === null || this.storedCapIc.size === 0) return null;
    const fp = schematicCapFingerprint(this.editor.doc());
    if (fp !== this.storedCapFingerprint) return null;
    const vs = Math.abs(v).toFixed(2);
    if (allSwitchesOpen(this.editor.doc())) {
      return this.i18n.t('lab.capIc.injecting', { v: vs });
    }
    return this.i18n.t('lab.capIc.ready', { v: vs });
  });

  readonly probeSummary = computed(() => {
    const p = this.editor.probeTarget();
    const res = this.result();
    if (!p || !res) return null;

    if (res.analysisType === 'tran' && res.tran) {
      const idx = Math.max(0, Math.min(this.scrubIndex(), res.tran.time.length - 1));
      const t = res.tran.time[idx];
      if (p.kind === 'net') {
        const series = res.tran.nodeVoltages.find((s) => s.id === p.id);
        const v = series?.values[idx];
        return typeof v === 'number'
          ? this.i18n.t('lab.probe.netAt', {
              id: p.id,
              v: v.toFixed(4),
              t: t.toExponential(2)
            })
          : this.i18n.t('lab.probe.netEmpty', { id: p.id });
      }
      const series = res.tran.branchCurrents.find((s) => s.id === p.id);
      const i = series?.values[idx];
      return typeof i === 'number'
        ? this.i18n.t('lab.probe.branchAt', {
            id: p.id,
            i: (i * 1000).toFixed(3),
            t: t.toExponential(2)
          })
        : this.i18n.t('lab.probe.branchEmpty', { id: p.id });
    }

    if (res.analysisType === 'ac' && res.ac?.points?.length) {
      const point = res.ac.points[0]!;
      if (p.kind === 'net') {
        const ph = point.nodeVoltages[p.id];
        return ph
          ? this.i18n.t('lab.probe.netAc', {
              id: p.id,
              mag: ph.mag.toFixed(4),
              phase: ph.phaseDeg.toFixed(1),
              f: point.frequency.toFixed(0)
            })
          : this.i18n.t('lab.probe.netEmpty', { id: p.id });
      }
      const ph = point.branchCurrents[p.id];
      return ph
        ? this.i18n.t('lab.probe.branchAc', {
            id: p.id,
            mag: (ph.mag * 1000).toFixed(3),
            phase: ph.phaseDeg.toFixed(1),
            f: point.frequency.toFixed(0)
          })
        : this.i18n.t('lab.probe.branchEmpty', { id: p.id });
    }

    const dc = res.dcOp;
    if (!dc) return null;
    if (p.kind === 'net') {
      const v = dc.nodeVoltages[p.id];
      return typeof v === 'number'
        ? this.i18n.t('lab.probe.netDc', { id: p.id, v: v.toFixed(4) })
        : this.i18n.t('lab.probe.netEmpty', { id: p.id });
    }
    const i = dc.branchCurrents[p.id];
    return typeof i === 'number'
      ? this.i18n.t('lab.probe.branchDc', { id: p.id, i: (i * 1000).toFixed(3) })
      : this.i18n.t('lab.probe.branchEmpty', { id: p.id });
  });

  constructor() {
    this.simulate$
      .pipe(
        tap((req) => {
          this.showBusyForRequest = req.showBusy;
          if (req.showBusy) this.busy.set(true);
        }),
        switchMap((req) =>
          this.api.simulate(req.body).pipe(
            catchError((err) => {
              if (this.showBusyForRequest) this.busy.set(false);
              const rawErrors: string[] =
                err?.error?.errors ??
                (err?.message ? [err.message] : [this.i18n.t('lab.sim.requestFailed')]);
              this.error.set(this.mapEngineErrors(rawErrors));
              this.warnings.set(err?.error?.warnings ?? []);
              this.result.set(err?.error ?? null);
              if (rawErrors.some(isSingularMatrixMessage)) {
                this.mergeSingularHighlights();
              }
              return of(null);
            })
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe((res) => {
        if (!res) return;
        this.result.set(res);
        if (this.showBusyForRequest) this.busy.set(false);
        const warn = [...(res.warnings ?? [])];
        this.warnings.set(warn);
        if (res.ok && res.tran?.time?.length) {
          this.rememberCapVoltages(res);
        }
        if (res.tran?.time?.length) {
          if (this.scrubPlayTimer != null && !this.showBusyForRequest) {
            /* keep playing */
          } else {
            this.stopScrubPlayback();
            const start = this.pickTranScrubIndex(res);
            this.scrubIndex.set(start);
            if (this.lastRunInjectedIc) {
              this.maybeStartDischargePlayback(res);
            }
          }
        }
        if (!res.ok) {
          const errs = res.errors ?? [];
          this.error.set(this.mapEngineErrors(errs));
          if (errs.some(isSingularMatrixMessage)) {
            this.mergeSingularHighlights();
          }
          return;
        }
        this.applyLedOverloadFailures(res);
      });

    this.autoRun$.pipe(debounceTime(280), takeUntilDestroyed()).subscribe(() => {
      this.runInternal(false);
    });

    effect(() => {
      this.editor.revision();
      this.editor.analysisMode();
      this.editor.tStop();
      this.editor.dt();
      this.editor.acFreq();
      this.editor.doc();
      this.autoRun$.next();
    });
  }

  setScrubIndex(idx: number): void {
    this.stopScrubPlayback();
    this.scrubIndex.set(idx);
  }

  /** Discharge runs start at t=0; otherwise prefer peak LED or final sample. */
  private pickTranScrubIndex(res: SimulateResponse): number {
    const tran = res.tran;
    if (!tran?.time?.length) return 0;
    if (this.lastRunInjectedIc) return 0;

    const last = tran.time.length - 1;
    const ledIds = this.editor
      .doc()
      .components.filter((c) => c.modelKey === 'led')
      .map((c) => c.id);
    if (!ledIds.length) return last;

    let bestIdx = last;
    let bestMag = 0;
    for (const id of ledIds) {
      const series = tran.branchCurrents.find((s) => s.id === id);
      if (!series?.values.length) continue;
      for (let i = 0; i < series.values.length; i++) {
        const mag = Math.abs(series.values[i]!);
        if (mag > bestMag) {
          bestMag = mag;
          bestIdx = i;
        }
      }
    }
    return bestMag > 1e-4 ? bestIdx : last;
  }

  /** Simple 0→end scrub so the student sees the LED fade after opening the switch. */
  private maybeStartDischargePlayback(res: SimulateResponse): void {
    const tran = res.tran;
    if (!tran?.time?.length) return;
    const end = tran.time.length - 1;
    if (end <= 0) return;

    const note = this.i18n.t('lab.led.fadePlayback');
    if (!this.warnings().includes(note)) {
      this.warnings.set([...this.warnings(), note]);
    }

    const frames = 60;
    const step = Math.max(1, Math.ceil(end / frames));
    let i = 0;
    this.zone.runOutsideAngular(() => {
      this.scrubPlayTimer = setInterval(() => {
        this.zone.run(() => {
          i += step;
          if (i >= end) {
            this.scrubIndex.set(end);
            this.stopScrubPlayback();
            return;
          }
          this.scrubIndex.set(i);
        });
      }, 50);
    });
  }

  private stopScrubPlayback(): void {
    if (this.scrubPlayTimer != null) {
      clearInterval(this.scrubPlayTimer);
      this.scrubPlayTimer = null;
    }
  }

  private rememberCapVoltages(res: SimulateResponse): void {
    const doc = this.editor.doc();
    const fp = schematicCapFingerprint(doc);
    // Always refresh store after a successful tran on the current topology.
    this.storedCapFingerprint = fp;
    this.storedCapIc = finalCapVoltagesFromTran(doc, res);
    this.publishCapIcVolts();
  }

  private clearCapIcIfStale(): void {
    const fp = schematicCapFingerprint(this.editor.doc());
    if (fp !== this.storedCapFingerprint) {
      this.storedCapIc = new Map();
      this.storedCapFingerprint = '';
      this.storedCapIcVolts.set(null);
    }
  }

  private publishCapIcVolts(): void {
    if (this.storedCapIc.size === 0) {
      this.storedCapIcVolts.set(null);
      return;
    }
    let best = 0;
    for (const v of this.storedCapIc.values()) {
      if (Math.abs(v) > Math.abs(best)) best = v;
    }
    this.storedCapIcVolts.set(best);
  }

  /** Explicit toolbar Run — shows busy state on the button. */
  run(): void {
    this.runInternal(true);
  }

  private runInternal(showBusy: boolean): void {
    const doc = this.editor.doc();
    const mode = this.editor.analysisMode();
    const diags = diagnoseSchematic(doc, mode);
    const errors = diagnosticErrors(diags);
    const warns = diagnosticWarnings(diags);

    this.highlightComponentIds.set(diags.flatMap((d) => d.componentIds));
    this.highlightNetIds.set(diags.flatMap((d) => d.netIds));
    const warnKeys = warns.map((w) => this.i18n.t(w.messageKey));
    const burned = doc.components.filter((c) => c.modelKey === 'led' && c.params['burned']);
    if (burned.length) {
      warnKeys.push(
        this.i18n.t('lab.led.burnedWarning', { ids: burned.map((c) => c.id).join(', ') })
      );
      this.highlightComponentIds.set([
        ...new Set([...this.highlightComponentIds(), ...burned.map((c) => c.id)])
      ]);
    }
    this.warnings.set(warnKeys);

    if (errors.length > 0) {
      if (showBusy) this.busy.set(false);
      this.error.set(errors.map((e) => this.i18n.t(e.messageKey)).join(' '));
      this.result.set(null);
      return;
    }

    this.clearCapIcIfStale();
    const injectIc = mode === 'tran' && allSwitchesOpen(doc) && this.storedCapIc.size > 0;
    this.lastRunInjectedIc = injectIc;

    const circuit = compileNetlistWithCapIc(doc, this.storedCapIc, injectIc);
    if (circuit.elements.length === 0) {
      this.result.set(null);
      this.error.set(null);
      if (showBusy) this.busy.set(false);
      return;
    }

    this.error.set(null);
    const body: SimulateRequest =
      mode === 'tran'
        ? {
            schemaVersion: 1,
            analysis: {
              type: 'tran',
              tStop: this.editor.tStop(),
              dt: this.editor.dt()
            },
            circuit
          }
        : mode === 'ac'
          ? {
              schemaVersion: 1,
              analysis: {
                type: 'ac',
                freq: this.editor.acFreq()
              },
              circuit
            }
          : {
              schemaVersion: 1,
              analysis: { type: 'dcOp' },
              circuit
            };

    this.simulate$.next({ body, showBusy });
  }

  /**
   * If an LED drew too much current, mark it burned (fail open) and re-sim via
   * the store revision bump. Sticky until the student replaces the LED.
   */
  private applyLedOverloadFailures(res: SimulateResponse): void {
    const burnedIds = this.editor
      .doc()
      .components.filter((c) => {
        if (c.modelKey !== 'led' || c.params['burned']) return false;
        const i = branchCurrentFromResult(res, c.id);
        return typeof i === 'number' && Math.abs(i) >= LED_BURN_A;
      })
      .map((c) => c.id);
    if (!burnedIds.length) return;

    const note = this.i18n.t('lab.led.burnedWarning', { ids: burnedIds.join(', ') });
    this.warnings.set([...this.warnings(), note]);
    this.highlightComponentIds.set([
      ...new Set([...this.highlightComponentIds(), ...burnedIds])
    ]);
    this.editor.markLedsBurned(burnedIds);
  }

  private mapEngineErrors(errors: string[]): string {
    if (errors.some(isSingularMatrixMessage)) {
      return this.i18n.t(SINGULAR_FALLBACK_KEY);
    }
    return errors.join('; ') || this.i18n.t('lab.sim.failed');
  }

  private mergeSingularHighlights(): void {
    if (this.highlightComponentIds().length) return;
    const simIds = this.editor
      .doc()
      .components.filter((c) => c.modelKey !== 'ground' && c.modelKey !== 'junction')
      .map((c) => c.id);
    this.highlightComponentIds.set(simIds);
  }
}
