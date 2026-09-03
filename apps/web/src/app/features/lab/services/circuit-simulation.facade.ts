import { Injectable, NgZone, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { Subject, catchError, debounceTime, from, map, of, switchMap, tap } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CircuitApiClient } from '../api/circuit-api.client';
import { SimulateRequest, SimulateResponse, TranResult } from '../api/circuit-api.types';
import { AnalysisMode, SchematicDocument, SchematicComponent, assignNets, compileNetlist, parseHighlightedIds, paramNumber } from '../data/schematic.model';
import {
  allEnergyPathsClosed,
  allEnergyPathsOpen,
  controllableSwitchStateKey
} from '../data/switch-state';
import { EnergyStateStore } from '../data/energy-state.store';
import {
  TranEnergyState,
  effectiveTargetTStop,
  estimateDischargeSettlingTStop,
  extractEnergyState,
  injectEnergyState,
  isEnergySettled,
  maxSegmentTStop,
  mergeTranSegment,
  planTranSegments
} from '../data/tran-continuation';
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
  BUZZER_BURN_A,
  BurnKind,
  CAP_DEFAULT_VMAX,
  DIODE_BURN_A,
  MOTOR_BURN_A,
  RESISTOR_BURN_W,
  burnKindOf,
  burnWarningKey,
  canBurnOut,
  ldrResistanceOhms
} from '../data/burnout';
import { isBjtNpnPart, isNmosPart, isNe555Part } from '../data/symbol-library';
import { NMOS_DRAIN_BURN_A, NMOS_VGS_BURN_V, NE555_OUT_BURN_A, NE555_VCC_BURN_V } from '../data/nmos-limits';
import { TransientPlayback } from '../data/wire-flow/transient-playback';
import { TranPlaybackPolicy, PlaybackMode } from '../data/tran-playback-policy';
import { electricalSimKey } from '../data/cap-ic';
import { hasRcEnergyNetwork } from '../data/circuit-topology';
import { isRcFadeTeachingCircuit, recommendedRcTranSettings } from '../data/rc-tran-defaults';

interface SimulateJob {
  body: SimulateRequest;
  showBusy: boolean;
  doc: SchematicDocument;
  energySeed: TranEnergyState | null;
  usedEnergySeed: boolean;
  userInitFromDc: boolean;
}

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
  const vf = paramNumber(c.params, 'vf', 0.7);
  const rb = paramNumber(c.params, 'rb', 0);
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly simulate$ = new Subject<SimulateJob>();
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
  private scrubPlayback: TransientPlayback | null = null;
  /** Tab that owns the active scrub playback (NE555 blink / LED fade charge). */
  private playbackSlotId: string | null = null;
  /** Bumped on tab change so stale onStop callbacks are ignored. */
  private playbackGeneration = 0;
  private activePlaybackMode: PlaybackMode | 'none' = 'none';
  private lastSwitchStateKey = '';
  private lastElectricalSimKey = '';
  private lastAutoRunSlotId: string | null = null;
  private pendingCapVoltageResult: SimulateResponse | null = null;
  private tranPlaybackActive = false;
  /** One-shot discharge fade when the switch opens — not on mid-discharge re-runs. */
  private pendingDischargePlayback = false;

  private readonly energyStore = new EnergyStateStore();
  private readonly playbackPolicy = new TranPlaybackPolicy();
  /** True when the last transient used persisted C/L initial conditions. */
  private lastRunUsedEnergySeed = false;
  /** tStop used for the in-flight / last transient request (may exceed toolbar value). */
  private lastRunTStop = 0;
  /** Client diagnostic warnings kept across the API response merge. */
  private clientWarningKeys: string[] = [];
  /** Shown through the next sim result, then cleared (e.g. fuse-replace note). */
  private stickyClientWarnings: string[] = [];

  readonly highlightedIds = computed(() => {
    const fromDiag = this.highlightComponentIds();
    if (fromDiag.length) return fromDiag;
    const msgs = [...(this.warnings() ?? []), ...(this.error() ? [this.error()!] : [])];
    const fromResult = this.result();
    if (fromResult?.errors?.length) msgs.push(...fromResult.errors);
    return parseHighlightedIds(msgs);
  });

  readonly highlightedNets = computed(() => this.highlightNetIds());

  /** Banner when a prior transient left stored capacitor / inductor energy. */
  readonly capIcStatus = computed(() => {
    this.editor.revision();
    const doc = this.editor.doc();
    if (!this.energyStore.fingerprintMatches(doc) || !this.energyStore.hasSeed()) return null;
    const v = this.energyStore.maxCapVoltageAbs();
    if (allEnergyPathsOpen(doc)) {
      return this.i18n.t('lab.energy.discharging', { v: v.toFixed(2) });
    }
    return this.i18n.t('lab.energy.stored', { v: v.toFixed(2) });
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
        tap((job) => {
          this.showBusyForRequest = job.showBusy;
          if (job.showBusy) this.busy.set(true);
        }),
        switchMap((job) =>
          from(this.runSimulationJob(job)).pipe(
            map((res) => ({ res, job })),
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
      .subscribe((payload) => {
        if (!payload) return;
        const { res, job } = payload;
        const priorRes = this.result();
        const priorScrub = this.scrubIndex();
        this.result.set(res);
        if (this.showBusyForRequest) this.busy.set(false);
        const warn = [...(res.warnings ?? [])];
        const doc = this.editor.doc();
        const storedBefore = this.energyStore.maxCapVoltageAbs();
        // Do not apply overload burns from a result whose switch topology no longer matches
        // (e.g. fuse replace opened the short while this short-circuit solve was in flight).
        const applyBurns =
          controllableSwitchStateKey(job.doc) === controllableSwitchStateKey(doc);

        let playback: ReturnType<TranPlaybackPolicy['resolve']> = {
          scrubIndex: 0,
          endScrubIndex: 0,
          playback: 'none',
          timing: null
        };

        if (res.tran?.time?.length) {
          const keepRunningPlayback =
            this.activePlaybackMode === 'blink-loop' &&
            this.scrubPlayback?.running &&
            !this.showBusyForRequest &&
            this.playbackSlotId === this.editor.activeSlotId();
          if (keepRunningPlayback) {
            /* NE555 blink loop only — charge/discharge always re-resolve on new results */
          } else {
            this.stopScrubPlayback();
            playback = this.playbackPolicy.resolve(
              {
                doc,
                activePreset: this.editor.activeExamplePreset(),
                usedEnergySeed: this.lastRunUsedEnergySeed,
                storedCapVoltageAbs: storedBefore,
                animateDischargePlayback: this.pendingDischargePlayback,
                tStop: this.lastRunTStop > 0 ? this.lastRunTStop : this.editor.tStop()
              },
              res
            );
            if (playback.playback === 'discharge-once') {
              this.pendingDischargePlayback = false;
            } else if (
              allEnergyPathsOpen(doc) &&
              this.lastRunUsedEnergySeed &&
              priorRes?.tran?.time?.length
            ) {
              this.scrubIndex.set(this.scrubIndexForSameTime(priorRes, priorScrub, res));
            } else {
              this.scrubIndex.set(playback.scrubIndex);
            }
            if (playback.playback === 'discharge-once' && playback.timing) {
              this.maybeStartTranPlayback(
                res,
                playback.timing,
                'lab.led.fadePlayback',
                playback.endScrubIndex
              );
            } else if (playback.playback === 'charge-once' && playback.timing) {
              this.maybeStartTranPlayback(
                res,
                playback.timing,
                'lab.led.chargePlayback',
                playback.endScrubIndex
              );
            } else if (playback.playback === 'blink-loop' && playback.timing) {
              this.maybeStartBlinkPlayback(res, playback.timing);
            }
          }
        }

        if (res.ok && res.tran?.time?.length) {
          if (playback.playback === 'discharge-once') {
            this.pendingCapVoltageResult = res;
          } else if (playback.playback === 'charge-once') {
            // Snapshot Vc immediately so opening the switch always has stored charge.
            this.captureEnergyState(res);
          } else if (this.tranPlaybackActive && this.scrubPlayback?.running) {
            this.pendingCapVoltageResult = res;
          } else {
            this.captureEnergyState(res);
          }
        }
        this.appendLedPolarityTips(res, warn);
        const sticky = this.stickyClientWarnings;
        this.stickyClientWarnings = [];
        this.warnings.set([...sticky, ...this.clientWarningKeys, ...warn]);
        if (!res.ok) {
          const errs = res.errors ?? [];
          this.error.set(this.mapEngineErrors(errs));
          if (errs.some(isSingularMatrixMessage)) {
            this.mergeSingularHighlights();
          }
          return;
        }
        if (!applyBurns) return;
        this.applyLedOverloadFailures(res);
        this.applyBjtBaseOverloadFailures(res);
        this.applyNmosOverloadFailures(res);
        this.applyNe555OverloadFailures(res);
        this.applyDiodeOverloadFailures(res);
        this.applyBuzzerOverloadFailures(res);
        this.applyMotorOverloadFailures(res);
        // Fuse before passives — an open fuse clears the overload for the next Run.
        this.applyFuseOverloadFailures(res);
        this.applyAmmeterOverloadFailures(res);
        this.applyResistorPowerFailures(res);
        this.applyLdrPowerFailures(res);
        this.applyCapacitorOvervoltageFailures(res);
      });

    this.autoRun$.pipe(debounceTime(280), takeUntilDestroyed()).subscribe(() => {
      this.runInternal(false);
    });

    effect(() => {
      this.editor.revision();
      const slotId = this.editor.activeSlotId();
      const mode = this.editor.analysisMode();
      const tStop = this.editor.tStop();
      const dt = this.editor.dt();
      const acFreq = this.editor.acFreq();
      const initFromDc = this.editor.initFromDc();
      const doc = this.editor.doc();
      this.energyStore.syncSlot(doc, slotId, this.editorPersistence);

      const switchKey = controllableSwitchStateKey(doc);
      if (switchKey !== this.lastSwitchStateKey) {
        if (isRcFadeTeachingCircuit(doc)) {
          this.ensureRcFadeTeachingReady(true);
        }
        if (allEnergyPathsOpen(doc) && this.lastSwitchStateKey !== '') {
          const prior = this.result();
          if (prior?.ok && prior.tran?.time?.length) {
            this.energyStore.captureChargePrior(doc, prior);
            this.energyStore.persist(this.editor.activeSlotId(), this.editorPersistence);
          }
          this.pendingDischargePlayback = true;
        }
        if (allEnergyPathsClosed(doc)) {
          this.pendingDischargePlayback = false;
        }
        this.lastSwitchStateKey = switchKey;
        this.invalidatePlayback();
      }

      if (slotId !== this.lastAutoRunSlotId) {
        this.lastAutoRunSlotId = slotId;
        this.lastElectricalSimKey = '';
        this.resetPlaybackForSlotChange();
      }

      if (mode === 'tran' && isRcFadeTeachingCircuit(doc)) {
        this.ensureRcFadeTeachingReady(false);
      }

      const key = electricalSimKey(doc, mode, tStop, dt, acFreq, initFromDc);
      if (key === this.lastElectricalSimKey) return;
      this.lastElectricalSimKey = key;

      const urgentDischarge =
        mode === 'tran' &&
        allEnergyPathsOpen(doc) &&
        this.energyStore.fingerprintMatches(doc) &&
        this.energyStore.maxCapVoltageAbs() > 0.05;

      if (urgentDischarge) {
        this.runInternal(false);
      } else {
        this.autoRun$.next();
      }
    });

    this.destroyRef.onDestroy(() => this.stopScrubPlayback());
  }

  setScrubIndex(idx: number): void {
    this.stopScrubPlayback();
    this.scrubIndex.set(idx);
  }

  /** Scrub 0→end for capacitor charge or discharge (LED fade teaching). */
  private maybeStartTranPlayback(
    res: SimulateResponse,
    timing: {
      mode: 'once' | 'loop';
      framesPerSweep: number;
      frameMs: number;
      sampleCount?: number;
      startIndex?: number;
    },
    noteKey: string,
    endScrubIndex?: number
  ): void {
    const tran = res.tran;
    if (!tran?.time?.length) return;
    const n = timing.sampleCount ?? tran.time.length;
    if (n <= 1) return;

    const note = this.i18n.t(noteKey);
    if (!this.warnings().includes(note)) {
      this.warnings.set([...this.warnings(), note]);
    }

    this.tranPlaybackActive = true;
    this.activePlaybackMode = noteKey.includes('charge') ? 'charge-once' : 'discharge-once';
    const gen = this.playbackGeneration;
    const ownerSlotId = this.editor.activeSlotId();
    this.startScrubPlayback(n, timing, () => {
      if (gen !== this.playbackGeneration) return;
      if (ownerSlotId !== this.editor.activeSlotId()) return;
      this.zone.run(() => {
        this.tranPlaybackActive = false;
        this.activePlaybackMode = 'none';
        if (typeof endScrubIndex === 'number') {
          this.scrubIndex.set(endScrubIndex);
        }
        const pending = this.pendingCapVoltageResult;
        if (pending) {
          this.captureEnergyState(pending);
          this.pendingCapVoltageResult = null;
        }
      });
    });
  }

  /** Loop transient scrub so NE555 LED branches visibly blink on the canvas. */
  private maybeStartBlinkPlayback(
    res: SimulateResponse,
    timing: { mode: 'once' | 'loop'; framesPerSweep: number; frameMs: number }
  ): void {
    const tran = res.tran;
    if (!tran?.time?.length) return;
    const n = tran.time.length;
    if (n <= 1) return;

    const note = this.i18n.t('lab.ne555.blinkPlayback');
    if (!this.warnings().includes(note)) {
      this.warnings.set([...this.warnings(), note]);
    }

    this.tranPlaybackActive = true;
    this.activePlaybackMode = 'blink-loop';
    this.startScrubPlayback(n, timing);
  }

  private startScrubPlayback(
    sampleCount: number,
    opts: {
      mode: 'loop' | 'once';
      framesPerSweep: number;
      frameMs: number;
      startIndex?: number;
    },
    onStop?: () => void
  ): void {
    this.stopScrubPlaybackTimer();
    this.playbackSlotId = this.editor.activeSlotId();
    this.zone.runOutsideAngular(() => {
      this.scrubPlayback = new TransientPlayback(
        sampleCount,
        (idx) => {
          this.zone.run(() => this.scrubIndex.set(idx));
        },
        onStop
      );
      this.scrubPlayback.start(opts);
    });
  }

  /** Stop the timer only — used when replacing playback without dropping mode. */
  private stopScrubPlaybackTimer(): void {
    this.playbackGeneration++;
    if (this.scrubPlayback) {
      this.scrubPlayback.stop();
      this.scrubPlayback = null;
    }
  }

  /** Stop scrub playback without clearing the latest simulation result. */
  private invalidatePlayback(): void {
    this.stopScrubPlaybackTimer();
    this.playbackSlotId = null;
    this.activePlaybackMode = 'none';
    this.tranPlaybackActive = false;
    this.pendingCapVoltageResult = null;
  }

  /** Drop playback when switching circuit tabs. */
  private resetPlaybackForSlotChange(): void {
    this.invalidatePlayback();
    this.scrubIndex.set(0);
    this.result.set(null);
    this.pendingDischargePlayback = false;
    this.lastSwitchStateKey = controllableSwitchStateKey(this.editor.doc());
  }

  private stopScrubPlayback(): void {
    this.invalidatePlayback();
  }

  private captureEnergyState(res: SimulateResponse): void {
    const doc = this.editor.doc();
    this.energyStore.capture(doc, res);
    this.energyStore.persist(this.editor.activeSlotId(), this.editorPersistence);
  }

  /** New RC+switch circuits need transient + longer tStop for fade playback (not DC / 5 ms). */
  private ensureRcFadeTeachingReady(switchToTran: boolean): void {
    const doc = this.editor.doc();
    if (!isRcFadeTeachingCircuit(doc)) return;
    const rec = recommendedRcTranSettings(this.editor.tStop(), this.editor.dt());
    if (rec) {
      this.editor.setTStop(rec.tStop);
      this.editor.setDt(rec.dt);
    }
    if (switchToTran && this.editor.analysisMode() !== 'tran') {
      this.editor.setAnalysisMode('tran');
    }
  }

  /** Keep the scope/canvas at the same simulated time after a mid-discharge re-solve. */
  private scrubIndexForSameTime(
    prior: SimulateResponse,
    priorScrub: number,
    next: SimulateResponse
  ): number {
    const prevTran = prior.tran;
    const nextTran = next.tran;
    if (!prevTran?.time?.length || !nextTran?.time?.length) return 0;
    const prevIdx = Math.max(0, Math.min(priorScrub, prevTran.time.length - 1));
    const t = prevTran.time[prevIdx] ?? 0;
    let best = 0;
    let bestDt = Infinity;
    for (let i = 0; i < nextTran.time.length; i++) {
      const dt = Math.abs((nextTran.time[i] ?? 0) - t);
      if (dt < bestDt) {
        bestDt = dt;
        best = i;
      }
    }
    return best;
  }

  /** Seed discharge from the current scrub frame before a parameter edit re-run. */
  private syncEnergyBeforeDischargeRerun(doc: SchematicDocument): void {
    if (!allEnergyPathsOpen(doc) || this.pendingDischargePlayback) return;
    const prior = this.result();
    if (!prior?.ok || !prior.tran?.time?.length) return;
    const idx = Math.max(0, Math.min(this.scrubIndex(), prior.tran.time.length - 1));
    this.energyStore.captureAtIndex(doc, prior, idx);
    this.energyStore.persist(this.editor.activeSlotId(), this.editorPersistence);
  }

  private syncEnergyStore(): void {
    const doc = this.editor.doc();
    this.energyStore.clearIfStale(doc);
    this.energyStore.syncSlot(doc, this.editor.activeSlotId(), this.editorPersistence);
  }

  /** Explicit toolbar Run — shows busy state on the button. */
  run(): void {
    this.stopScrubPlayback();
    this.runInternal(true);
  }

  /** Quiet re-solve after interactive edits (pushbutton hold). */
  runLive(): void {
    this.runInternal(false);
  }

  /** One-shot client note shown through the next simulation result. */
  notifyClientWarning(messageKey: string): void {
    const msg = this.i18n.t(messageKey);
    this.stickyClientWarnings = [
      msg,
      ...this.stickyClientWarnings.filter((w) => w !== msg)
    ];
    this.warnings.set([...this.stickyClientWarnings, ...this.clientWarningKeys]);
  }

  private runInternal(showBusy: boolean): void {
    const doc = this.editor.doc();
    let mode = this.editor.analysisMode();
    if (showBusy && mode === 'dcOp' && hasRcEnergyNetwork(doc)) {
      this.ensureRcFadeTeachingReady(true);
      mode = this.editor.analysisMode();
    } else if (isRcFadeTeachingCircuit(doc)) {
      this.ensureRcFadeTeachingReady(false);
    }
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
    this.warnings.set([...this.stickyClientWarnings, ...warnKeys]);

    if (errors.length > 0) {
      if (showBusy) this.busy.set(false);
      this.error.set(errors.map((e) => this.i18n.t(e.messageKey)).join(' '));
      this.result.set(null);
      return;
    }

    this.syncEnergyStore();
    this.syncEnergyBeforeDischargeRerun(doc);
    const energySeed = mode === 'tran' ? this.energyStore.seedForDischargeRun(doc) : null;
    this.lastRunUsedEnergySeed = energySeed !== null;

    const circuit = compileNetlist(doc);
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

    this.simulate$.next({
      body,
      showBusy,
      doc,
      energySeed,
      usedEnergySeed: this.lastRunUsedEnergySeed,
      userInitFromDc: this.editor.initFromDc()
    });
  }

  private async runSimulationJob(job: SimulateJob): Promise<SimulateResponse> {
    if (job.body.analysis.type !== 'tran') {
      return firstValueFrom(this.api.simulate(job.body));
    }
    return this.runTranContinuation(job);
  }

  /**
   * General long transient: chain engine segments (20 000-step cap each),
   * carry capacitor / inductor state forward, merge waveforms for scope + playback.
   */
  private async runTranContinuation(job: SimulateJob): Promise<SimulateResponse> {
    const dt = job.body.analysis.dt ?? this.editor.dt();
    const userTStop = job.body.analysis.tStop ?? this.editor.tStop();
    let targetTStop = effectiveTargetTStop(job.doc, userTStop, dt);
    if (job.usedEnergySeed) {
      const dischargeSettling = estimateDischargeSettlingTStop(job.doc, dt);
      if (dischargeSettling !== null) targetTStop = Math.max(targetTStop, dischargeSettling);
    }
    const segMax = maxSegmentTStop(dt);
    const needsContinuation =
      job.showBusy ||
      job.usedEnergySeed ||
      targetTStop > segMax * 1.001 ||
      targetTStop > userTStop * 1.001;

    if (!needsContinuation) {
      const base = compileNetlist(job.doc);
      const circuit = job.energySeed ? injectEnergyState(base, job.energySeed) : base;
      this.lastRunTStop = targetTStop;
      const body: SimulateRequest = {
        ...job.body,
        analysis: {
          ...job.body.analysis,
          type: 'tran',
          tStop: targetTStop,
          dt,
          initFromDc: job.userInitFromDc && !job.usedEnergySeed
        },
        circuit
      };
      return firstValueFrom(this.api.simulate(body));
    }

    const segmentStops = planTranSegments(targetTStop, dt);
    this.lastRunTStop = targetTStop;

    const baseCircuit = compileNetlist(job.doc);
    let merged: TranResult | null = null;
    let lastRes: SimulateResponse | null = null;
    let segmentEnergy: TranEnergyState | null = job.energySeed;
    const warnings: string[] = [];

    for (let i = 0; i < segmentStops.length; i++) {
      const segTStop = segmentStops[i]!;
      const circuit = segmentEnergy ? injectEnergyState(baseCircuit, segmentEnergy) : baseCircuit;
      const useInitFromDc =
        i === 0 &&
        job.userInitFromDc &&
        !segmentEnergy?.caps.size &&
        !segmentEnergy?.inductors.size;

      const body: SimulateRequest = {
        ...job.body,
        analysis: {
          ...job.body.analysis,
          type: 'tran',
          tStop: segTStop,
          dt,
          initFromDc: useInitFromDc
        },
        circuit
      };

      const res = await firstValueFrom(this.api.simulate(body));
      lastRes = res;
      if (!res.ok) return res;
      warnings.push(...(res.warnings ?? []));

      const offset = merged?.time.length ? merged.time[merged.time.length - 1]! : 0;
      merged = mergeTranSegment(merged, res.tran!, offset);
      segmentEnergy = extractEnergyState(job.doc, res);

      if (isEnergySettled(job.doc, res)) break;
    }

    if (!lastRes || !merged) return lastRes ?? { schemaVersion: 1, ok: false, analysisType: 'tran', errors: [], warnings: [] };

    return {
      ...lastRes,
      ok: true,
      analysisType: 'tran',
      warnings: [...new Set(warnings)],
      tran: merged
    };
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
      if (typeof peak === 'number' && peak >= BJT_BASE_BURN_A) peakBurnIds.push(c.id);
      const sustained = sustainedBaseCurrent(res, doc, c);
      if (typeof sustained === 'number' && sustained >= BJT_BASE_BURN_A) sustainedBurnIds.push(c.id);
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

  /** Piezo buzzer overload — fail open like an LED. */
  private applyBuzzerOverloadFailures(res: SimulateResponse): void {
    this.applyBranchCurrentBurn(
      res,
      (c) => c.modelKey === 'buzzer',
      BUZZER_BURN_A,
      'lab.buzzer.peakOverloadWarning',
      'lab.buzzer.burnedWarning'
    );
  }

  /** DC motor stall / overcurrent. */
  private applyMotorOverloadFailures(res: SimulateResponse): void {
    this.applyBranchCurrentBurn(
      res,
      (c) => c.modelKey === 'dc_motor',
      MOTOR_BURN_A,
      'lab.dc_motor.peakOverloadWarning',
      'lab.dc_motor.burnedWarning'
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

  /** Teaching fuse — opens when |I| exceeds the part's iMax. */
  private applyFuseOverloadFailures(res: SimulateResponse): void {
    const peakBurnIds: string[] = [];
    const sustainedBurnIds: string[] = [];
    for (const c of this.editor.doc().components) {
      if (c.modelKey !== 'fuse' || c.params['burned']) continue;
      const limitA = paramNumber(c.params, 'iMax', 0.1);
      if (!(limitA > 0)) continue;
      const peak = peakBranchCurrent(res, c.id);
      if (typeof peak === 'number' && Math.abs(peak) >= limitA) peakBurnIds.push(c.id);
      const sustained = sustainedBranchCurrent(res, c.id);
      if (typeof sustained === 'number' && Math.abs(sustained) >= limitA) {
        sustainedBurnIds.push(c.id);
      }
    }
    this.publishBurnResult(
      peakBurnIds,
      sustainedBurnIds,
      'lab.fuse.peakOverloadWarning',
      'lab.fuse.burnedWarning'
    );
  }

  /** NMOS: drain overcurrent or excessive |Vgs|. */
  private applyNmosOverloadFailures(res: SimulateResponse): void {
    const doc = assignNets(this.editor.doc());
    const peakBurnIds: string[] = [];
    const sustainedBurnIds: string[] = [];
    for (const c of doc.components) {
      if (!isNmosPart(c.modelKey) || c.params['burned']) continue;
      const peakI = peakBranchCurrent(res, c.id);
      const sustI = sustainedBranchCurrent(res, c.id);
      const peakVgs = peakPinVoltageAbs(res, c, 'g', 's');
      const sustVgs = sustainedPinVoltageAbs(res, c, 'g', 's');
      const peakHit =
        (typeof peakI === 'number' && Math.abs(peakI) >= NMOS_DRAIN_BURN_A) ||
        (typeof peakVgs === 'number' && peakVgs >= NMOS_VGS_BURN_V);
      const sustHit =
        (typeof sustI === 'number' && Math.abs(sustI) >= NMOS_DRAIN_BURN_A) ||
        (typeof sustVgs === 'number' && sustVgs >= NMOS_VGS_BURN_V);
      if (peakHit) peakBurnIds.push(c.id);
      if (sustHit) sustainedBurnIds.push(c.id);
    }
    this.publishBurnResult(
      peakBurnIds,
      sustainedBurnIds,
      'lab.nmos.peakOverloadWarning',
      'lab.nmos.burnedWarning'
    );
  }

  /** NE555: output overcurrent or excessive Vcc. */
  private applyNe555OverloadFailures(res: SimulateResponse): void {
    const doc = assignNets(this.editor.doc());
    const peakBurnIds: string[] = [];
    const sustainedBurnIds: string[] = [];
    for (const c of doc.components) {
      if (!isNe555Part(c.modelKey) || c.params['burned']) continue;
      const peakI = peakBranchCurrent(res, c.id);
      const sustI = sustainedBranchCurrent(res, c.id);
      const peakVcc = peakPinVoltageAbs(res, c, 'vcc', 'gnd');
      const sustVcc = sustainedPinVoltageAbs(res, c, 'vcc', 'gnd');
      const peakHit =
        (typeof peakI === 'number' && Math.abs(peakI) >= NE555_OUT_BURN_A) ||
        (typeof peakVcc === 'number' && peakVcc >= NE555_VCC_BURN_V);
      const sustHit =
        (typeof sustI === 'number' && Math.abs(sustI) >= NE555_OUT_BURN_A) ||
        (typeof sustVcc === 'number' && sustVcc >= NE555_VCC_BURN_V);
      if (peakHit) peakBurnIds.push(c.id);
      if (sustHit) sustainedBurnIds.push(c.id);
    }
    this.publishBurnResult(
      peakBurnIds,
      sustainedBurnIds,
      'lab.ne555.peakOverloadWarning',
      'lab.ne555.burnedWarning'
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
      const r = paramNumber(c.params, 'r', 0);
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

  /** LDR power burnout — same ¼ W teaching rating at the instantaneous resistance. */
  private applyLdrPowerFailures(res: SimulateResponse): void {
    const peakBurnIds: string[] = [];
    const sustainedBurnIds: string[] = [];
    for (const c of this.editor.doc().components) {
      if (c.modelKey !== 'ldr' || c.params['burned']) continue;
      const r = ldrResistanceOhms(c.params);
      if (r === null || !(r > 0)) continue;
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
      'lab.ldr.peakOverloadWarning',
      'lab.ldr.burnedWarning'
    );
  }

  /** Capacitor overvoltage vs params.vmax (default 16 V). */
  private applyCapacitorOvervoltageFailures(res: SimulateResponse): void {
    const doc = assignNets(this.editor.doc());
    const peakBurnIds: string[] = [];
    const sustainedBurnIds: string[] = [];
    for (const c of doc.components) {
      if (c.modelKey !== 'capacitor' || c.params['burned']) continue;
      const vmax = paramNumber(c.params, 'vmax', CAP_DEFAULT_VMAX);
      if (!(vmax > 0)) continue;
      const peak = peakPinVoltageAbs(res, c, 'a', 'b');
      if (typeof peak === 'number' && peak >= vmax) peakBurnIds.push(c.id);
      const sustained = sustainedPinVoltageAbs(res, c, 'a', 'b');
      if (typeof sustained === 'number' && sustained >= vmax) sustainedBurnIds.push(c.id);
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
      const vf = paramNumber(c.params, 'vf', 2);
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
