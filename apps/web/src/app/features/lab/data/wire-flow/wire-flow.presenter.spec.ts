import { WireFlowPresenter, flowDashFor } from './wire-flow.presenter';

describe('WireFlowPresenter', () => {
  it('keeps the standard dash on normal wires', () => {
    expect(flowDashFor(16)).toBe('6 10');
    expect(flowDashFor(120)).toBe('6 10');
  });

  it('shrinks the dash period on stubs so part of the wire is always lit', () => {
    // A 7-unit junction→pin stub: half lit at every phase instead of dark for 10/16 of the cycle.
    expect(flowDashFor(7)).toBe('3.5 3.5');
    expect(flowDashFor(2)).toBe('1.5 1');
    const flow = WireFlowPresenter.overlay(
      [
        { x: 0, y: 0 },
        { x: 0, y: 7 }
      ],
      0.0125
    );
    expect(flow?.dash).toBe('3.5 3.5');
  });

  it('reverses the drawn path for negative current', () => {
    const flow = WireFlowPresenter.overlay(
      [
        { x: 0, y: 0 },
        { x: 40, y: 0 }
      ],
      -0.01
    );
    expect(flow?.path.startsWith('M 40 0')).toBeTrue();
  });
});
