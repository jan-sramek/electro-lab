import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Subject, catchError, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CircuitApiClient } from '../api/circuit-api.client';
import { SimulateRequest, SimulateResponse } from '../api/circuit-api.types';
import { compileNetlist, parseHighlightedIds } from '../data/schematic.model';
import {
  SINGULAR_FALLBACK_KEY,
  diagnoseSchematic,
  diagnosticErrors,
  diagnosticWarnings,
  isSingularMatrixMessage
} from '../data/circuit-diagnostics';
import { LabEditorStore } from './lab-editor.store';
import { I18nService } from '../../../core/i18n/i18n.service';

@Injectable()
export class CircuitSimulationFacade {
  private readonly api = inject(CircuitApiClient);
  private readonly editor = inject(LabEditorStore);
  private readonly i18n = inject(I18nService);
  private readonly simulate$ = new Subject<SimulateRequest>();

  readonly result = signal<SimulateResponse | null>(null);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly warnings = signal<string[]>([]);
  readonly highlightComponentIds = signal<string[]>([]);
  readonly highlightNetIds = signal<string[]>([]);
  /** Sample index into tran.time for canvas/probe scrubbing. */
  readonly scrubIndex = signal(0);

  readonly highlightedIds = computed(() => {
    const fromDiag = this.highlightComponentIds();
    if (fromDiag.length) return fromDiag;
    const msgs = [...(this.warnings() ?? []), ...(this.error() ? [this.error()!] : [])];
    const fromResult = this.result();
    if (fromResult?.errors?.length) msgs.push(...fromResult.errors);
    return parseHighlightedIds(msgs);
  });

  readonly highlightedNets = computed(() => this.highlightNetIds());

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
        tap(() => {
          this.busy.set(true);
        }),
        switchMap((body) =>
          this.api.simulate(body).pipe(
            catchError((err) => {
              this.busy.set(false);
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
        this.busy.set(false);
        const warn = [...(res.warnings ?? [])];
        this.warnings.set(warn);
        if (res.tran?.time?.length) {
          this.scrubIndex.set(res.tran.time.length - 1);
        }
        if (!res.ok) {
          const errs = res.errors ?? [];
          this.error.set(this.mapEngineErrors(errs));
          if (errs.some(isSingularMatrixMessage)) {
            this.mergeSingularHighlights();
          }
        }
      });

    effect(() => {
      this.editor.revision();
      this.editor.analysisMode();
      this.editor.tStop();
      this.editor.dt();
      this.editor.doc();
      this.run();
    });
  }

  setScrubIndex(idx: number): void {
    this.scrubIndex.set(idx);
  }

  run(): void {
    const doc = this.editor.doc();
    const mode = this.editor.analysisMode();
    const diags = diagnoseSchematic(doc, mode);
    const errors = diagnosticErrors(diags);
    const warns = diagnosticWarnings(diags);

    this.highlightComponentIds.set(diags.flatMap((d) => d.componentIds));
    this.highlightNetIds.set(diags.flatMap((d) => d.netIds));
    this.warnings.set(warns.map((w) => this.i18n.t(w.messageKey)));

    if (errors.length > 0) {
      this.busy.set(false);
      this.error.set(errors.map((e) => this.i18n.t(e.messageKey)).join(' '));
      this.result.set(null);
      return;
    }

    const circuit = compileNetlist(doc);
    if (circuit.elements.length === 0) {
      this.result.set(null);
      this.error.set(null);
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
        : {
            schemaVersion: 1,
            analysis: { type: 'dcOp' },
            circuit
          };

    this.simulate$.next(body);
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
