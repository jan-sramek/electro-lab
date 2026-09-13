import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { LearnFigureComponent } from './learn-figure.component';
import { LearnFigure, LearnFigureKind } from '../../data/learn-slides.model';

const SAMPLES: LearnFigure[] = [
  { kind: 'water-tanks' },
  { kind: 'battery-meter', params: { volts: '5 V' } },
  { kind: 'scale', params: { unit: 'V', ticks: ['1', '5'], marks: [0.1, 0.9] } },
  { kind: 'potential-ladder', params: { levels: ['5 V', '0 V'] } },
  { kind: 'loop', params: { flow: true, drops: true, designators: true } },
  { kind: 'loop', params: { switchOpen: true, meter: 'volt-switch' } },
  { kind: 'loop', params: { reverseLed: true } },
  { kind: 'loop', params: { ledBurn: true } },
  { kind: 'loop', params: { load: 'capacitor' } },
  { kind: 'charge-flow', params: { mode: 'directions' } },
  { kind: 'junction', params: { inA: '1', outA: '2', outB: '3' } },
  { kind: 'pipes' },
  { kind: 'resistor-bands', params: { colors: ['#000', '#000', '#000', '#000'], value: '220 Ω' } },
  { kind: 'ohm-triangle' },
  { kind: 'ohm-graph', params: { rows: [['100 Ω', 30]] } },
  { kind: 'ohm-graph', params: { mode: 'iv', lines: [['220 Ω', 1]] } },
  { kind: 'ohm-graph', params: { mode: 'iv-nonlinear' } },
  { kind: 'series-resistors', params: { r1: '1', r2: '2', total: '3' } },
  { kind: 'heat', params: { power: '1 W', rating: '2 W' } },
  { kind: 'current-bar', params: { safeMax: 20, burn: 35, max: 45 } },
  { kind: 'waveform', params: { mode: 'dc' } },
  { kind: 'waveform', params: { mode: 'ac' } },
  { kind: 'waveform', params: { mode: 'rms' } },
  { kind: 'waveform', params: { mode: 'rectified' } },
  { kind: 'waveform', params: { mode: 'pulse-rc' } },
  { kind: 'waveform' },
  { kind: 'two-loads', params: { topology: 'series', labels: ['a', 'b'] } },
  { kind: 'two-loads', params: { topology: 'series', parts: 'led', labels: ['a', 'b'], showTotal: '9 V' } },
  { kind: 'two-loads', params: { topology: 'parallel', parts: 'led', labels: ['a', 'b'], showTotal: 'x' } },
  { kind: 'elements-grid', params: { parts: ['battery', 'resistor'] } },
  { kind: 'rc-curve', params: { mode: 'charge', final: '5 V', tau: '1 ms' } },
  { kind: 'rc-curve', params: { mode: 'discharge' } }
];

describe('LearnFigureComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [LearnFigureComponent], providers: [provideHttpClient()] });
  });

  it('draws visible SVG content for every figure kind and variant', () => {
    const kinds = new Set<LearnFigureKind>();
    for (const sample of SAMPLES) {
      const fixture = TestBed.createComponent(LearnFigureComponent);
      fixture.componentRef.setInput('figure', sample);
      fixture.detectChanges();
      const svg: SVGElement = fixture.nativeElement.querySelector('svg');
      const drawn = svg.querySelectorAll('path, line, rect, circle, text, g').length;
      expect(drawn).withContext(`${sample.kind} ${JSON.stringify(sample.params ?? {})}`).toBeGreaterThan(2);
      kinds.add(sample.kind);
      fixture.destroy();
    }
    expect(kinds.size).toBe(18);
  });

  it('switches drawing when the figure input changes', () => {
    const fixture = TestBed.createComponent(LearnFigureComponent);
    fixture.componentRef.setInput('figure', { kind: 'elements-grid', params: { parts: ['battery'] } });
    fixture.detectChanges();
    fixture.componentRef.setInput('figure', { kind: 'rc-curve', params: { mode: 'charge', tau: '1 ms' } });
    fixture.detectChanges();
    const svg: SVGElement = fixture.nativeElement.querySelector('svg');
    expect(svg.querySelector('path.wave')).withContext('rc curve path after switch').not.toBeNull();
    expect(svg.textContent).toContain('τ = 1 ms');
  });
});
