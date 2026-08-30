import { Injectable, NgZone, computed, effect, inject, signal } from '@angular/core';
import { Subject, catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CircuitApiClient } from '../api/circuit-api.client';
import { SimulateRequest, SimulateResponse } from '../api/circuit-api.types';
import { AnalysisMode, SchematicDocument, SchematicComponent, assignNets, parseHighlightedIds } from '../data/schematic.model';
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
import { SchematicPersistence } from './schematic-persistence';
import { I18nService } from '../../../core/i18n/i18n.service';
import { LED_BURN_A } from '../data/led-limits';
import { BJT_BASE_BURN_A } from '../data/bjt-limits';
import {
  AMMETER_BURN_A,
  BurnKind,
  CAP_DEFAULT_VMAX,
  DIODE_BURN_A,
  RESISTOR_BURN_W,
  burnKindOf,
  burnWarningKey,
  canBurnOut
} from '../data/burnout';
import { isBjtNpnPart } from '../data/symbol-library';

function peakBranchCurrent(res: SimulateResponse, id: string): number | null {
  const dc = res.dcOp?.branchCurrents?.[id];
  if (typeof dc === 'number') return dc;
  const series = res.tran?.branchCurrents.find((s) => s.id === id);
  if (!series?.values.length) return null;
  return series.values.reduce(
    (best, v) => (Math.abs(v) > Math.abs(best) ? v : best),
    series.values[0]!
  );
}

/** DC value, or final transient sample — used for sticky LED burn (not brief spikes). */
function sustainedBranchCurrent(res: SimulateResponse, id: string): number | null {
  const dc = res.dcOp?.branchCurrents?.[id];
  if (typeof dc === 'number') return dc;
  const series = res.tran?.branchCurrents.find((s) => s.id === id);
  if (!series?.values.length) return null;
  return series.values[series.values.length - 1]!;
}

function nodeVoltageFromResult(res: SimulateResponse, net: string, scrubIndex: number): number | null {
  const dc = res.dcOp?.nodeVoltages?.[net];
  if (typeof dc === 'number') return dc;
  const series = res.tran?.nodeVoltages.find((s) => s.id === net);
  if (!series?.values.length) return null;
  const idx = Math.min(Math.max(0, scrubIndex), series.values.length - 1);
  return series.values[idx] ?? null;
}

/** Teaching Ib from BE companion + current into the base pin from series feeders. */
function baseCurrentAt(
  res: SimulateResponse,
  doc: SchematicDocument,
  c: SchematicComponent,
  sampleIndex: number | 'last' | 'peak'
): number | null {
  const bNet = c.pins['b']?.net;
  const eNet = c.pins['e']?.net;
  if (!bNet || !eNet) return null;
  const vf = typeof c.params['vf'] === 'number' ? (c.params['vf'] as number) : 0.7;
  const rb = typeof c.params['rb'] === 'number' ? (c.params['rb'] as number) : 0;
  if (!(rb > 0)) return null;

  const ibFromVoltage = (idx: number): number => {
    const vb = nodeVoltageFromResult(res, bNet, idx);
    const ve = nodeVoltageFromResult(res, eNet, idx);
    if (vb == null || ve == null) return 0;
    const ib = (vb - ve - vf) / rb;
    return ib > 1e-12 ? ib : 0;
  };

  const ibFromFeeders = (pick: (id: string) => number | null): number => {
    let best = 0;
    for (const other of doc.components) {
      if (other.id === c.id || other.params['burned']) continue;
      const pinsOnBase = Object.values(other.pins).filter((p) => p.net === bNet);
      if (pinsOnBase.length !== 1) continue;
      const i = pick(other.id);
      if (typeof i === 'number') best = Math.max(best, Math.abs(i));
    }
    return best;
  };

  if (res.dcOp?.nodeVoltages) {
    return Math.max(ibFromVoltage(0), ibFromFeeders((id) => peakBranchCurrent(res, id)));
  }
  const n = res.tran?.time?.length ?? 0;
  if (!n) return null;
  if (sampleIndex === 'last') {
    return Math.max(
      ibFromVoltage(n - 1),
      ibFromFeeders((id) => sustainedBranchCurrent(res, id))
    );
  }
  if (sampleIndex === 'peak') {
    let best = 0;
    for (let i = 0; i < n; i++) best = Math.max(best, ibFromVoltage(i));
    return Math.max(best, ibFromFeeders((id) => peakBranchCurrent(res, id)));
  }
  return Math.max(
    ibFromVoltage(sampleIndex),
    ibFromFeeders((id) => sustainedBranchCurrent(res, id))
  );
}

function peakBaseCurrent(
  res: SimulateResponse,
  doc: SchematicDocument,
  c: SchematicComponent
): number | null {
  return baseCurrentAt(res, doc, c, res.tran?.time?.length ? 'peak' : 0);
}

function sustainedBaseCurrent(
  res: SimulateResponse,
  doc: SchematicDocument,
  c: SchematicComponent
): number | null {
  return baseCurrentAt(res, doc, c, res.tran?.time?.length ? 'last' : 0);
}

function pinVoltageAbsAt(
  res: SimulateResponse,
  c: SchematicComponent,
  pinA: string,
  pinB: string,
  sampleIndex: number | 'last' | 'peak'
): number | null {
  const aNet = c.pins[pinA]?.net;
  const bNet = c.pins[pinB]?.net;
  if (!aNet || !bNet) return null;
  const vAt = (idx: number): number => {
    const va = nodeVoltageFromResult(res, aNet, idx);
    const vb = nodeVoltageFromResult(res, bNet, idx);
    if (va == null || vb == null) return 0;
    return Math.abs(va - vb);
  };
  if (res.dcOp?.nodeVoltages) return vAt(0);
  const n = res.tran?.time?.length ?? 0;
  if (!n) return null;
  if (sampleIndex === 'last') return vAt(n - 1);
  if (sampleIndex === 'peak') {
    let best = 0;
    for (let i = 0; i < n; i++) best = Math.max(best, vAt(i));
    return best;
  }
  return vAt(sampleIndex);
}

function peakPinVoltageAbs(
  res: SimulateResponse,
  c: SchematicComponent,
  pinA: string,
  pinB: string
): number | null {
  return pinVoltageAbsAt(res, c, pinA, pinB, res.tran?.time?.length ? 'peak' : 0);
}

function sustainedPinVoltageAbs(
  res: SimulateResponse,
  c: SchematicComponent,
  pinA: string,
  pinB: string
): number | null {
  return pinVoltageAbsAt(res, c, pinA, pinB, res.tran?.time?.length ? 'last' : 0);
}

@Injectable()
export class CircuitSimulationFacade {
  private readonly api = inject(CircuitApiClient);
  private readonly editor = inject(LabEditorStore);
  private readonly editorPersistence = inject(SchematicPersistence);
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
  /** Client diagnostic warnings kept across the API response merge. */
  private clientWarningKeys: string[] = [];

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
        this.appendLedPolarityTips(res, warn);
        this.warnings.set([...this.clientWarningKeys, ...warn]);
        if (!res.ok) {
          const errs = res.errors ?? [];
          this.error.set(this.mapEngineErrors(errs));
          if (errs.some(isSingularMatrixMessage)) {
            this.mergeSingularHighlights();
          }
          return;
        }
        this.applyLedOverloadFailures(res);
        this.applyBjtBaseOverloadFailures(res);
        this.applyDiodeOverloadFailures(res);
        this.applyResistorPowerFailures(res);
        this.applyCapacitorOvervoltageFailures(res);
        this.applyAmmeterOverloadFailures(res);
      });

    this.autoRun$.pipe(debounceTime(280), takeUntilDestroyed()).subscribe(() => {
      this.runInternal(false);
    });

    effect(() => {
      this.editor.revision();
      this.editor.activeSlotId();
      this.editor.analysisMode();
      this.editor.tStop();
      this.editor.dt();
      this.editor.acFreq();
      this.editor.initFromDc();
      this.editor.doc();
      this.syncCapIcFromStorage();
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
    this.persistCapIc();
  }

  private clearCapIcIfStale(): void {
    this.syncCapIcFromStorage();
    const fp = schematicCapFingerprint(this.editor.doc());
    if (fp !== this.storedCapFingerprint) {
      this.storedCapIc = new Map();
      this.storedCapFingerprint = '';
      this.storedCapIcVolts.set(null);
      this.editorPersistence.clearCapIc();
    }
  }

  private persistCapIc(): void {
    const slotId = this.editor.activeSlotId();
    if (!slotId || this.storedCapIc.size === 0 || !this.storedCapFingerprint) {
      this.editorPersistence.clearCapIc();
      return;
    }
    const voltages: Record<string, number> = {};
    for (const [id, v] of this.storedCapIc) voltages[id] = v;
    this.editorPersistence.saveCapIc({
      slotId,
      fingerprint: this.storedCapFingerprint,
      voltages
    });
  }

  /** Keep in-memory Vc in sync with localStorage (survives F5). */
  private syncCapIcFromStorage(): void {
    const slotId = this.editor.activeSlotId();
    const fp = schematicCapFingerprint(this.editor.doc());
    const saved = this.editorPersistence.loadCapIc();
    if (saved && slotId && saved.slotId === slotId && saved.fingerprint === fp) {
      this.storedCapFingerprint = saved.fingerprint;
      this.storedCapIc = new Map(Object.entries(saved.voltages));
      this.publishCapIcVolts();
      return;
    }
    if (this.storedCapFingerprint && this.storedCapFingerprint !== fp) {
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
    const burned = doc.components.filter((c) => canBurnOut(c.modelKey) && c.params['burned']);
    if (burned.length) {
      const byKind = new Map<string, string[]>();
      for (const c of burned) {
        const kind = burnKindOf(c.modelKey);
        if (!kind) continue;
        const list = byKind.get(kind) ?? [];
        list.push(c.id);
        byKind.set(kind, list);
      }
      for (const [kind, ids] of byKind) {
        warnKeys.push(this.i18n.t(burnWarningKey(kind as BurnKind), { ids: ids.join(', ') }));
      }
      this.highlightComponentIds.set([
        ...new Set([...this.highlightComponentIds(), ...burned.map((c) => c.id)])
      ]);
    }
    this.clientWarningKeys = warnKeys;
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
              dt: this.editor.dt(),
              initFromDc: this.editor.initFromDc()
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
   * Burn LEDs only when overload is sustained (DC or final tran sample).
   * Brief peak spikes warn without permanently killing the part.
   */
  private applyLedOverloadFailures(res: SimulateResponse): void {
    const peakBurnIds: string[] = [];
    const sustainedBurnIds: string[] = [];
    for (const c of this.editor.doc().components) {
      if (c.modelKey !== 'led' || c.params['burned']) continue;
      const peak = peakBranchCurrent(res, c.id);
      if (typeof peak === 'number' && Math.abs(peak) >= LED_BURN_A) {
        peakBurnIds.push(c.id);
      }
      const sustained = sustainedBranchCurrent(res, c.id);
      if (typeof sustained === 'number' && Math.abs(sustained) >= LED_BURN_A) {
        sustainedBurnIds.push(c.id);
      }
    }

    const notes = [...this.warnings()];
    if (peakBurnIds.length && !sustainedBurnIds.length) {
      notes.push(
        this.i18n.t('lab.led.peakOverloadWarning', { ids: peakBurnIds.join(', ') })
      );
      this.highlightComponentIds.set([
        ...new Set([...this.highlightComponentIds(), ...peakBurnIds])
      ]);
      this.warnings.set(notes);
      return;
    }

    if (!sustainedBurnIds.length) return;

    notes.push(this.i18n.t('lab.led.burnedWarning', { ids: sustainedBurnIds.join(', ') }));
    this.warnings.set(notes);
    this.highlightComponentIds.set([
      ...new Set([...this.highlightComponentIds(), ...sustainedBurnIds])
    ]);
    this.editor.markBurned(sustainedBurnIds);
  }

  /**
   * Teaching BJT burnout from base current Ib = (Vb−Ve−Vf)/rb (model BE branch).
   * Branch current on Q is Ic — do not use it for this check.
   */
  private applyBjtBaseOverloadFailures(res: SimulateResponse): void {
    const doc = assignNets(this.editor.doc());
    const peakBurnIds: string[] = [];
    const sustainedBurnIds: string[] = [];

    for (const c of doc.components) {
      if (!isBjtNpnPart(c.modelKey) || c.params['burned']) continue;
      const peak = peakBaseCurrent(res, doc, c);
      if (peak != null && peak >= BJT_BASE_BURN_A) peakBurnIds.push(c.id);
      const sustained = sustainedBaseCurrent(res, doc, c);
      if (sustained != null && sustained >= BJT_BASE_BURN_A) sustainedBurnIds.push(c.id);
    }

    const notes = [...this.warnings()];
    if (peakBurnIds.length && !sustainedBurnIds.length) {
      notes.push(
        this.i18n.t('lab.bjt.peakBaseOverloadWarning', { ids: peakBurnIds.join(', ') })
      );
      this.highlightComponentIds.set([
        ...new Set([...this.highlightComponentIds(), ...peakBurnIds])
      ]);
      this.warnings.set(notes);
      return;
    }

    if (!sustainedBurnIds.length) return;

    notes.push(this.i18n.t('lab.bjt.burnedWarning', { ids: sustainedBurnIds.join(', ') }));
    this.warnings.set(notes);
    this.highlightComponentIds.set([
      ...new Set([...this.highlightComponentIds(), ...sustainedBurnIds])
    ]);
    this.editor.markBurned(sustainedBurnIds);
  }

  /** Silicon diode overload — same fail-open teaching as LED, higher current threshold. */
  private applyDiodeOverloadFailures(res: SimulateResponse): void {
    this.applyBranchCurrentBurn(
      res,
      (c) => c.modelKey === 'diode',
      DIODE_BURN_A,
      'lab.diode.peakOverloadWarning',
      'lab.diode.burnedWarning'
    );
  }

  /** Ammeter fuse — burned open if series current is far beyond a teaching meter range. */
  private applyAmmeterOverloadFailures(res: SimulateResponse): void {
    this.applyBranchCurrentBurn(
      res,
      (c) => c.modelKey === 'ammeter',
      AMMETER_BURN_A,
      'lab.ammeter.peakOverloadWarning',
      'lab.ammeter.burnedWarning'
    );
  }

  private applyBranchCurrentBurn(
    res: SimulateResponse,
    match: (c: SchematicComponent) => boolean,
    limitA: number,
    peakKey: string,
    burnKey: string
  ): void {
    const peakBurnIds: string[] = [];
    const sustainedBurnIds: string[] = [];
    for (const c of this.editor.doc().components) {
      if (!match(c) || c.params['burned']) continue;
      const peak = peakBranchCurrent(res, c.id);
      if (typeof peak === 'number' && Math.abs(peak) >= limitA) peakBurnIds.push(c.id);
      const sustained = sustainedBranchCurrent(res, c.id);
      if (typeof sustained === 'number' && Math.abs(sustained) >= limitA) {
        sustainedBurnIds.push(c.id);
      }
    }
    this.publishBurnResult(peakBurnIds, sustainedBurnIds, peakKey, burnKey);
  }

  /** ¼ W resistor teaching burnout from P = I²R. */
  private applyResistorPowerFailures(res: SimulateResponse): void {
    const peakBurnIds: string[] = [];
    const sustainedBurnIds: string[] = [];
    for (const c of this.editor.doc().components) {
      if (c.modelKey !== 'resistor' || c.params['burned']) continue;
      const r = typeof c.params['r'] === 'number' ? (c.params['r'] as number) : 0;
      if (!(r > 0)) continue;
      const peakI = peakBranchCurrent(res, c.id);
      if (typeof peakI === 'number' && peakI * peakI * r >= RESISTOR_BURN_W) {
        peakBurnIds.push(c.id);
      }
      const sustI = sustainedBranchCurrent(res, c.id);
      if (typeof sustI === 'number' && sustI * sustI * r >= RESISTOR_BURN_W) {
        sustainedBurnIds.push(c.id);
      }
    }
    this.publishBurnResult(
      peakBurnIds,
      sustainedBurnIds,
      'lab.resistor.peakOverloadWarning',
      'lab.resistor.burnedWarning'
    );
  }

  /** Capacitor overvoltage vs params.vmax (default 16 V). */
  private applyCapacitorOvervoltageFailures(res: SimulateResponse): void {
    const doc = assignNets(this.editor.doc());
    const peakBurnIds: string[] = [];
    const sustainedBurnIds: string[] = [];
    for (const c of doc.components) {
      if (c.modelKey !== 'capacitor' || c.params['burned']) continue;
      const vmax =
        typeof c.params['vmax'] === 'number' ? (c.params['vmax'] as number) : CAP_DEFAULT_VMAX;
      if (!(vmax > 0)) continue;
      const peak = peakPinVoltageAbs(res, c, 'a', 'b');
      if (peak != null && peak >= vmax) peakBurnIds.push(c.id);
      const sustained = sustainedPinVoltageAbs(res, c, 'a', 'b');
      if (sustained != null && sustained >= vmax) sustainedBurnIds.push(c.id);
    }
    this.publishBurnResult(
      peakBurnIds,
      sustainedBurnIds,
      'lab.capacitor.peakOverloadWarning',
      'lab.capacitor.burnedWarning'
    );
  }

  private publishBurnResult(
    peakBurnIds: string[],
    sustainedBurnIds: string[],
    peakKey: string,
    burnKey: string
  ): void {
    const notes = [...this.warnings()];
    if (peakBurnIds.length && !sustainedBurnIds.length) {
      notes.push(this.i18n.t(peakKey, { ids: peakBurnIds.join(', ') }));
      this.highlightComponentIds.set([
        ...new Set([...this.highlightComponentIds(), ...peakBurnIds])
      ]);
      this.warnings.set(notes);
      return;
    }
    if (!sustainedBurnIds.length) return;
    notes.push(this.i18n.t(burnKey, { ids: sustainedBurnIds.join(', ') }));
    this.warnings.set(notes);
    this.highlightComponentIds.set([
      ...new Set([...this.highlightComponentIds(), ...sustainedBurnIds])
    ]);
    this.editor.markBurned(sustainedBurnIds);
  }

  /** Soft tip when an LED sits reverse-biased / dark with significant |V|. */
  private appendLedPolarityTips(res: SimulateResponse, warn: string[]): void {
    const scrub = this.scrubIndex();
    for (const c of this.editor.doc().components) {
      if (c.modelKey !== 'led' || c.params['burned']) continue;
      const i = sustainedBranchCurrent(res, c.id);
      if (i == null || Math.abs(i) > 1e-5) continue;
      const aNet = c.pins['a']?.net;
      const cNet = c.pins['c']?.net;
      if (!aNet || !cNet) continue;
      const va = nodeVoltageFromResult(res, aNet, scrub);
      const vc = nodeVoltageFromResult(res, cNet, scrub);
      if (va == null || vc == null) continue;
      const vac = va - vc;
      const vf = typeof c.params['vf'] === 'number' ? (c.params['vf'] as number) : 2;
      if (vac < -0.3 || (Math.abs(vac) > vf * 0.5 && vac < 0)) {
        warn.push(this.i18n.t('lab.led.reverseBiasTip', { id: c.id }));
        this.highlightComponentIds.set([
          ...new Set([...this.highlightComponentIds(), c.id])
        ]);
      }
    }
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
