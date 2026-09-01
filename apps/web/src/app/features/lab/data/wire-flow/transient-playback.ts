export type TransientPlaybackMode = 'once' | 'loop';

export interface TransientPlaybackOptions {
  /** Samples per full sweep (higher = smoother). */
  framesPerSweep?: number;
  /** Milliseconds between scrub steps. */
  frameMs?: number;
  /** `loop` wraps 0→end indefinitely; `once` stops at the last sample. */
  mode?: TransientPlaybackMode;
  /** First sample index (e.g. skip t=0 zero capacitor current). */
  startIndex?: number;
}

/**
 * Drives transient scrub index for canvas + scope.
 * Keeps animation alive until explicitly stopped (no arbitrary cycle cap).
 */
export class TransientPlayback {
  private timer: ReturnType<typeof setInterval> | null = null;
  private index = 0;

  constructor(
    private readonly sampleCount: number,
    private readonly onIndex: (idx: number) => void,
    private readonly onStop?: () => void
  ) {
    if (sampleCount < 1) throw new Error('TransientPlayback requires at least one sample');
  }

  get running(): boolean {
    return this.timer != null;
  }

  start(opts?: TransientPlaybackOptions): void {
    this.stop();
    const end = this.sampleCount - 1;
    const start = Math.min(Math.max(0, opts?.startIndex ?? 0), end);
    if (end <= start) {
      this.onIndex(start);
      return;
    }

    const frames = opts?.framesPerSweep ?? 90;
    const frameMs = opts?.frameMs ?? 42;
    const mode = opts?.mode ?? 'loop';
    const span = end - start;
    const step = Math.max(1, Math.ceil(span / frames));

    this.index = start;
    this.onIndex(start);

    this.timer = setInterval(() => {
      this.index += step;
      if (this.index >= end) {
        if (mode === 'once') {
          this.index = end;
          this.onIndex(end);
          this.stop();
          return;
        }
        this.index = start;
      }
      this.onIndex(this.index);
    }, frameMs);
  }

  stop(): void {
    if (this.timer != null) {
      clearInterval(this.timer);
      this.timer = null;
      this.onStop?.();
    }
  }
}
