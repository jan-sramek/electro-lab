import { TransientPlayback } from './transient-playback';

describe('TransientPlayback', () => {
  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('loops indefinitely in loop mode', () => {
    jasmine.clock().install();
    const indices: number[] = [];
    const pb = new TransientPlayback(100, (idx) => indices.push(idx));
    pb.start({ mode: 'loop', framesPerSweep: 10, frameMs: 10 });

    jasmine.clock().tick(10 * 12);
    pb.stop();

    expect(indices[0]).toBe(0);
    expect(indices.length).toBeGreaterThan(10);
    const last = indices[indices.length - 1]!;
    expect(last).toBeLessThan(100);
    expect(indices.some((i) => i === 0 && indices.indexOf(0) !== indices.lastIndexOf(0))).toBeTrue();
  });

  it('stops at the last sample in once mode', () => {
    jasmine.clock().install();
    const indices: number[] = [];
    const pb = new TransientPlayback(50, (idx) => indices.push(idx));
    pb.start({ mode: 'once', framesPerSweep: 10, frameMs: 10 });

    jasmine.clock().tick(10 * 20);
    expect(pb.running).toBeFalse();
    expect(indices[indices.length - 1]).toBe(49);
  });
});
