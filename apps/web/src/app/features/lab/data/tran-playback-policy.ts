import { SchematicDocument } from './schematic.model';
import { SimulateResponse } from '../api/circuit-api.types';
import { effectiveCapCurrentAtIndex } from './cap-branch-current';
import { hasRcEnergyNetwork } from './circuit-topology';
import { allEnergyPathsClosed, allEnergyPathsOpen, hasControllableSwitch } from './switch-state';
import { estimateDominantTau, estimateSettlingTStop, DISCHARGE_SETTLING_TAU_MULT } from './tran-continuation';

export type PlaybackMode = 'none' | 'charge-once' | 'discharge-once' | 'blink-loop';

export interface TranPlaybackContext {
  doc: SchematicDocument;
  activePreset: string | null;
  /** True when this transient injected stored C/L initial conditions. */
  usedEnergySeed: boolean;
  /** Stored |Vc| before applying this result (charge must complete before discharge). */
  storedCapVoltageAbs: number;
  /** Play the one-shot discharge scrub animation (only on switch-open, not param re-runs). */
  animateDischargePlayback: boolean;
  tStop: number;
}

export interface PlaybackTiming {
  mode: 'once' | 'loop';
  framesPerSweep: number;
  frameMs: number;
  /** Override sample count (e.g. stop at visible charge window instead of full tStop). */
  sampleCount?: number;
  /** First scrub index for charge playback (skip t=0 zero-cap-current sample). */
  startIndex?: number;
}

export interface TranPlaybackPlan {
  scrubIndex: number;
  /** Scrub index to show after a one-shot playback completes (peak teaching frame). */
  endScrubIndex: number;
  playback: PlaybackMode;
  timing: PlaybackTiming | null;
}

/** Decides scrub start index and whether to animate transient results on the canvas. */
export class TranPlaybackPolicy {
  resolve(ctx: TranPlaybackContext, res: SimulateResponse): TranPlaybackPlan {
    const tran = res.tran;
    if (!tran?.time?.length) {
      return { scrubIndex: 0, endScrubIndex: 0, playback: 'none', timing: null };
    }

    if (this.shouldAnimateDischarge(ctx)) {
      const startIdx = this.firstDischargeCurrentIndex(ctx.doc, tran) ?? 0;
      const endIdx = this.dischargePlaybackEndIndex(ctx.doc, tran, startIdx);
      const dt = tran.time.length > 1 ? tran.time[1]! - tran.time[0]! : 0.002;
      return {
        scrubIndex: startIdx,
        endScrubIndex: endIdx,
        playback: 'discharge-once',
        timing: {
          ...this.dischargeSweepTiming(startIdx, endIdx, dt),
          sampleCount: endIdx + 1,
          startIndex: startIdx
        }
      };
    }

    if (this.shouldAnimateCharge(ctx)) {
      const settleIdx = this.chargeSettleIndex(ctx.doc, tran);
      const startIdx = this.firstCapCurrentIndex(ctx.doc, tran, settleIdx) ?? 0;
      const endIdx = this.lastVisibleCapCurrentIndex(ctx.doc, tran, startIdx, settleIdx);
      const dt = tran.time.length > 1 ? tran.time[1]! - tran.time[0]! : 0.002;
      // Animate the inrush, then park on the settled frame so C1 shows ~0 mA (not the peak).
      const settled = this.settledCapCurrentIndex(ctx.doc, tran, endIdx, settleIdx) ?? settleIdx;
      return {
        scrubIndex: startIdx,
        endScrubIndex: settled,
        playback: 'charge-once',
        timing: {
          ...this.chargeSweepTiming(startIdx, endIdx, dt),
          sampleCount: endIdx + 1,
          startIndex: startIdx
        }
      };
    }

    // Buck/boost (and similar): loop the PWM window so MOSFET vs freewheel paths alternate.
    if (this.isSwitchingConverter(ctx.doc) || ctx.activePreset === 'buck' || ctx.activePreset === 'boost') {
      return {
        scrubIndex: 0,
        endScrubIndex: 0,
        playback: 'blink-loop',
        timing: { mode: 'loop', framesPerSweep: 100, frameMs: 35 }
      };
    }

    // AC rectifiers: last sample is often a blocked half-cycle (I≈0) — loop so conduction is visible.
    if (
      this.hasAcSource(ctx.doc) ||
      ctx.activePreset === 'halfWave' ||
      ctx.activePreset === 'bridge' ||
      ctx.activePreset === 'filterCap' ||
      ctx.activePreset === 'ripple'
    ) {
      return {
        scrubIndex: 0,
        endScrubIndex: 0,
        playback: 'blink-loop',
        timing: { mode: 'loop', framesPerSweep: 120, frameMs: 30 }
      };
    }

    // NE555 (and similar): loop so OUT-driven LEDs keep blinking on the canvas.
    if (
      this.hasNe555(ctx.doc) ||
      ctx.activePreset === 'ne555' ||
      ctx.activePreset === 'ne555Pot' ||
      ctx.activePreset === 'christmasTree'
    ) {
      return {
        scrubIndex: 0,
        endScrubIndex: 0,
        playback: 'blink-loop',
        timing: { mode: 'loop', framesPerSweep: 80, frameMs: 40 }
      };
    }

    const endScrub = this.defaultScrubIndex(ctx.doc, tran);
    return {
      scrubIndex: endScrub,
      endScrubIndex: endScrub,
      playback: 'none',
      timing: null
    };
  }

  /** Best teaching frame when not animating — peak cap / diode / load current, else end. */
  defaultScrubIndex(
    doc: SchematicDocument,
    tran: NonNullable<SimulateResponse['tran']>
  ): number {
    const capIdx = this.peakCapCurrentIndex(doc, tran);
    if (capIdx !== null) return capIdx;
    const branchIdx = this.peakBranchCurrentIndex(doc, tran);
    if (branchIdx !== null) return branchIdx;
    return this.peakLedOrEndIndex(doc, tran);
  }

  /** Peak |I| on diodes / resistors / fuses — useful for AC rectifiers with no LED. */
  peakBranchCurrentIndex(
    doc: SchematicDocument,
    tran: NonNullable<SimulateResponse['tran']>
  ): number | null {
    const ids = doc.components
      .filter((c) =>
        c.modelKey === 'diode' ||
        c.modelKey === 'zener' ||
        c.modelKey === 'resistor' ||
        c.modelKey === 'fuse' ||
        c.modelKey === 'ac_source'
      )
      .map((c) => c.id);
    if (!ids.length) return null;
    let bestIdx: number | null = null;
    let bestMag = 1e-4;
    for (const id of ids) {
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
    return bestIdx;
  }

  /** Index of largest |I| on any capacitor in the first half of the run (charge phase). */
  peakCapCurrentIndex(
    doc: SchematicDocument,
    tran: NonNullable<SimulateResponse['tran']>,
    maxIdx?: number
  ): number | null {
    const capIds = doc.components.filter((c) => c.modelKey === 'capacitor').map((c) => c.id);
    if (!capIds.length) return null;

    const last = maxIdx ?? tran.time.length - 1;
    const searchEnd = Math.min(last, Math.max(1, Math.floor(tran.time.length * 0.6)));
    let bestIdx: number | null = null;
    let bestMag = 1e-6;

    for (const id of capIds) {
      const series = tran.branchCurrents.find((s) => s.id === id);
      if (!series?.values.length) continue;
      const limit = Math.min(searchEnd, series.values.length - 1);
      for (let i = 1; i <= limit; i++) {
        const iCap = effectiveCapCurrentAtIndex(doc, tran, id, i);
        if (typeof iCap !== 'number') continue;
        const mag = Math.abs(iCap);
        if (mag > bestMag) {
          bestMag = mag;
          bestIdx = i;
        }
      }
    }
    return bestIdx;
  }

  /** First sample with visible capacitor branch current (BE often reports I=0 at t=0). */
  firstCapCurrentIndex(
    doc: SchematicDocument,
    tran: NonNullable<SimulateResponse['tran']>,
    maxIdx?: number
  ): number | null {
    const capIds = doc.components.filter((c) => c.modelKey === 'capacitor').map((c) => c.id);
    if (!capIds.length) return null;
    const limit = maxIdx ?? tran.time.length - 1;
    for (let i = 1; i <= limit; i++) {
      for (const id of capIds) {
        const iCap = effectiveCapCurrentAtIndex(doc, tran, id, i);
        if (typeof iCap === 'number' && Math.abs(iCap) > 1e-6) return i;
      }
    }
    return null;
  }

  shouldAnimateDischarge(ctx: TranPlaybackContext): boolean {
    if (!this.hasCapacitor(ctx.doc)) return false;
    if (!ctx.animateDischargePlayback) return false;
    if (ctx.usedEnergySeed) return true;
    if (!allEnergyPathsOpen(ctx.doc)) return false;
    return ctx.storedCapVoltageAbs > 0.05;
  }

  /** First sample with LED or cap branch current during discharge (skip t=0 BE zero). */
  firstDischargeCurrentIndex(
    doc: SchematicDocument,
    tran: NonNullable<SimulateResponse['tran']>
  ): number | null {
    const ids = [
      ...doc.components.filter((c) => c.modelKey === 'led').map((c) => c.id),
      ...doc.components.filter((c) => c.modelKey === 'capacitor').map((c) => c.id)
    ];
    if (!ids.length) return null;
    const limit = Math.min(tran.time.length - 1, Math.max(1, Math.floor(tran.time.length * 0.15)));
    for (let i = 1; i <= limit; i++) {
      for (const id of ids) {
        const cap = doc.components.find((c) => c.id === id && c.modelKey === 'capacitor');
        if (cap) {
          const iCap = effectiveCapCurrentAtIndex(doc, tran, id, i);
          if (typeof iCap === 'number' && Math.abs(iCap) > 1e-6) return i;
          continue;
        }
        const series = tran.branchCurrents.find((s) => s.id === id);
        const iBranch = series?.values[i];
        if (typeof iBranch === 'number' && Math.abs(iBranch) > 1e-6) return i;
      }
    }
    return null;
  }

  shouldAnimateCharge(ctx: TranPlaybackContext): boolean {
    if (!this.hasCapacitor(ctx.doc)) return false;
    if (ctx.usedEnergySeed) return false;
    if (allEnergyPathsOpen(ctx.doc)) return false;
    // PWM converters have Cout but must not use the RC “charge once then park” scrub.
    if (this.isSwitchingConverter(ctx.doc)) return false;
    // Line-frequency rectifiers with filter C need a looping AC scrub, not one-shot charge.
    if (this.hasAcSource(ctx.doc)) return false;
    // NE555 astable timing caps must loop so LEDs keep blinking (not park after one charge).
    if (this.hasNe555(ctx.doc)) return false;
    if (hasControllableSwitch(ctx.doc)) return allEnergyPathsClosed(ctx.doc);
    return hasRcEnergyNetwork(ctx.doc);
  }

  /** Pulse-driven inductive switcher (buck / boost teaching samples). */
  isSwitchingConverter(doc: SchematicDocument): boolean {
    const hasL = doc.components.some((c) => c.modelKey === 'inductor');
    const hasPulse = doc.components.some((c) => c.modelKey === 'pulse_source');
    const hasSwitchDevice = doc.components.some(
      (c) => c.modelKey === 'nmos' || c.modelKey === 'switch'
    );
    return hasL && hasPulse && hasSwitchDevice;
  }

  hasAcSource(doc: SchematicDocument): boolean {
    return doc.components.some((c) => c.modelKey === 'ac_source');
  }

  hasNe555(doc: SchematicDocument): boolean {
    return doc.components.some((c) => c.modelKey === 'ne555');
  }

  private hasCapacitor(doc: SchematicDocument): boolean {
    return doc.components.some((c) => c.modelKey === 'capacitor');
  }

  /** Last sample index through ~5τ so charge playback shows cap branch current. */
  chargeSettleIndex(
    doc: SchematicDocument,
    tran: NonNullable<SimulateResponse['tran']>
  ): number {
    const last = tran.time.length - 1;
    if (last <= 0) return 0;
    const dt = tran.time.length > 1 ? tran.time[1]! - tran.time[0]! : 0.002;
    const settling = estimateSettlingTStop(doc, dt);
    const targetT = settling ?? tran.time[last]!;
    for (let i = 0; i <= last; i++) {
      if (tran.time[i]! >= targetT) return i;
    }
    return last;
  }

  /** First sample after fromIdx where |I_cap| is teaching-idle (steady state after charge). */
  settledCapCurrentIndex(
    doc: SchematicDocument,
    tran: NonNullable<SimulateResponse['tran']>,
    fromIdx: number,
    maxIdx?: number
  ): number | null {
    const capIds = doc.components.filter((c) => c.modelKey === 'capacitor').map((c) => c.id);
    if (!capIds.length) return null;
    const limit = maxIdx ?? tran.time.length - 1;
    const idle = 1e-5;
    for (let i = Math.max(fromIdx, 1); i <= limit; i++) {
      let any = false;
      let allIdle = true;
      for (const id of capIds) {
        const iCap = effectiveCapCurrentAtIndex(doc, tran, id, i);
        if (typeof iCap !== 'number') continue;
        any = true;
        if (Math.abs(iCap) > idle) allIdle = false;
      }
      if (any && allIdle) return i;
    }
    return limit;
  }

  /**
   * Last sample with visible cap branch current after startIdx.
   * Parallel RC+LED can charge in only a few BE steps — do not scrub through 5τ of I≈0.
   */
  lastVisibleCapCurrentIndex(
    doc: SchematicDocument,
    tran: NonNullable<SimulateResponse['tran']>,
    fromIdx: number,
    maxIdx?: number
  ): number {
    const capIds = doc.components.filter((c) => c.modelKey === 'capacitor').map((c) => c.id);
    if (!capIds.length) return fromIdx;

    const hardLimit = maxIdx ?? tran.time.length - 1;
    const dt = tran.time.length > 1 ? tran.time[1]! - tran.time[0]! : 0.002;
    const tau = estimateDominantTau(doc) ?? 0.5;
    const timeCutoff = (tran.time[fromIdx] ?? 0) + Math.min(tau * 2, 0.25);

    let peakMag = 0;
    for (let i = fromIdx; i <= hardLimit; i++) {
      if ((tran.time[i] ?? 0) > timeCutoff) break;
      for (const id of capIds) {
        const iCap = effectiveCapCurrentAtIndex(doc, tran, id, i);
        if (typeof iCap === 'number') peakMag = Math.max(peakMag, Math.abs(iCap));
      }
    }

    const floor = Math.max(1e-6, peakMag * 0.02);
    let lastIdx = fromIdx;
    for (let i = fromIdx; i <= hardLimit; i++) {
      if ((tran.time[i] ?? 0) > timeCutoff) break;
      for (const id of capIds) {
        const iCap = effectiveCapCurrentAtIndex(doc, tran, id, i);
        if (typeof iCap === 'number' && Math.abs(iCap) >= floor) lastIdx = i;
      }
    }
    return Math.max(lastIdx, fromIdx);
  }

  /** Discharge playback through ~8τ so branch current and LED reach ~0. */
  dischargePlaybackEndIndex(
    doc: SchematicDocument,
    tran: NonNullable<SimulateResponse['tran']>,
    startIdx: number
  ): number {
    const last = tran.time.length - 1;
    const tau = estimateDominantTau(doc) ?? 0.5;
    const startT = tran.time[startIdx] ?? 0;
    const windowEndT = startT + DISCHARGE_SETTLING_TAU_MULT * tau;

    let limit = last;
    for (let i = startIdx; i <= last; i++) {
      if ((tran.time[i] ?? 0) >= windowEndT) {
        limit = i;
        break;
      }
    }
    return Math.max(limit, startIdx + 1);
  }

  peakLedOrEndIndex(
    doc: SchematicDocument,
    tran: NonNullable<SimulateResponse['tran']>
  ): number {
    const last = tran.time.length - 1;
    const ledIds = doc.components.filter((c) => c.modelKey === 'led').map((c) => c.id);
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

  private chargeSweepTiming(startIdx: number, endIdx: number, dt: number): PlaybackTiming {
    const span = Math.max(1, endIdx - startIdx);
    const spanMs = span * dt * 1000;
    const durationMs = Math.min(2800, Math.max(900, spanMs * 12));
    const frames = Math.min(Math.max(span * 6, 28), 72);
    const frameMs = Math.max(28, Math.round(durationMs / frames));
    return { mode: 'once', framesPerSweep: frames, frameMs, sampleCount: endIdx + 1, startIndex: startIdx };
  }

  /** Stretch LED fade discharge so branch current visibly dims (not a single scrub jump). */
  private dischargeSweepTiming(startIdx: number, endIdx: number, dt: number): PlaybackTiming {
    const span = Math.max(1, endIdx - startIdx);
    const spanMs = span * dt * 1000;
    const durationMs = Math.min(8000, Math.max(2000, spanMs * 8));
    const frames = Math.min(Math.max(span * 2, 60), 180);
    const frameMs = Math.max(30, Math.round(durationMs / frames));
    return { mode: 'once', framesPerSweep: frames, frameMs, sampleCount: endIdx + 1, startIndex: startIdx };
  }

  private sweepTiming(tStop: number, sampleCount: number, startIndex = 0): PlaybackTiming {
    const frames = Math.min(Math.max(Math.round(tStop * 45), 60), 240);
    const frameMs = Math.max(25, Math.min(60, Math.round((tStop * 1000) / frames)));
    return { mode: 'once', framesPerSweep: frames, frameMs, sampleCount, startIndex };
  }
}
