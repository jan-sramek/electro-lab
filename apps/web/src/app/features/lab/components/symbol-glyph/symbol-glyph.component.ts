import { Component, input } from '@angular/core';
import { ledColorById, normalizeLedColorId } from '../../data/led-colors';

/** Shared schematic glyph for canvas and palette thumbs. */
@Component({
  selector: 'g[appSymbolGlyph]',
  standalone: true,
  template: `
    @switch (modelKey()) {
      @case ('battery') {
        <svg:line x1="-18" y1="-28" x2="-18" y2="28" class="sym" />
        <svg:line x1="-8" y1="-16" x2="-8" y2="16" class="sym thick" />
        <svg:line x1="8" y1="-28" x2="8" y2="28" class="sym" />
        <svg:line x1="18" y1="-16" x2="18" y2="16" class="sym thick" />
        <!-- pins: p at +x (right), n at −x (left) -->
        <svg:text x="28" y="5" class="polarity-mark">+</svg:text>
        <svg:text x="-36" y="5" class="polarity-mark">−</svg:text>
      }
      @case ('ac_source') {
        <svg:circle cx="0" cy="0" r="20" class="sym" />
        <svg:path
          class="sym"
          fill="none"
          d="M -12 0 C -8 -14, -4 -14, 0 0 C 4 14, 8 14, 12 0"
        />
      }
      @case ('op_amp') {
        <svg:polygon points="-36,-28 -36,28 40,0" class="sym" fill="none" />
        <svg:line x1="-36" y1="-16" x2="-28" y2="-16" class="sym" />
        <svg:line x1="-36" y1="16" x2="-28" y2="16" class="sym" />
        <svg:text x="-22" y="-12" class="oa-mark">+</svg:text>
        <svg:text x="-22" y="20" class="oa-mark">−</svg:text>
      }
      @case ('bjt_npn') {
        @if (ledBurn() > 0.08) {
          <svg:g class="led-fire" [attr.opacity]="0.55 + ledBurn() * 0.45" pointer-events="none">
            <svg:ellipse class="fire-glow" cx="-4" cy="-4" rx="18" ry="22" />
            <svg:path
              class="flame flame-a"
              d="M 0 8 C -10 0, -12 -14, -2 -28 C 2 -18, 8 -8, 0 8 Z"
            />
          </svg:g>
        }
        <svg:line
          x1="-36"
          y1="0"
          x2="-8"
          y2="0"
          class="sym"
          [class.bjt-charred]="ledBurn() > 0.08"
        />
        <svg:line
          x1="-8"
          y1="-18"
          x2="-8"
          y2="18"
          class="sym thick"
          [class.bjt-charred]="ledBurn() > 0.08"
        />
        <svg:line x1="-8" y1="-10" x2="0" y2="-28" class="sym" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:line x1="-8" y1="10" x2="0" y2="28" class="sym" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:line x1="0" y1="-28" x2="0" y2="-40" class="sym" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:line x1="0" y1="28" x2="0" y2="40" class="sym" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:polyline
          class="sym"
          [class.bjt-charred]="ledBurn() > 0.08"
          fill="none"
          points="-2,22 0,28 6,22"
        />
      }
      @case ('nmos') {
        @if (ledBurn() > 0.08) {
          <svg:g class="led-fire" [attr.opacity]="0.55 + ledBurn() * 0.45" pointer-events="none">
            <svg:ellipse class="fire-glow" cx="-4" cy="-4" rx="18" ry="22" />
            <svg:path
              class="flame flame-a"
              d="M 0 8 C -10 0, -12 -14, -2 -28 C 2 -18, 8 -8, 0 8 Z"
            />
          </svg:g>
        }
        <svg:line x1="-36" y1="0" x2="-16" y2="0" class="sym" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:line x1="-16" y1="-14" x2="-16" y2="14" class="sym" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:line x1="-10" y1="-18" x2="-10" y2="18" class="sym thick" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:line x1="-10" y1="-12" x2="0" y2="-12" class="sym" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:line x1="-10" y1="12" x2="0" y2="12" class="sym" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:line x1="0" y1="-12" x2="0" y2="-40" class="sym" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:line x1="0" y1="12" x2="0" y2="40" class="sym" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:line x1="-4" y1="20" x2="0" y2="12" class="sym" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:polyline
          class="sym"
          [class.bjt-charred]="ledBurn() > 0.08"
          fill="none"
          points="-2,28 0,40 6,32"
        />
      }
      @case ('ne555') {
        @if (ledBurn() > 0.08) {
          <svg:g class="led-fire" [attr.opacity]="0.55 + ledBurn() * 0.45" pointer-events="none">
            <svg:ellipse class="fire-glow" cx="0" cy="-4" rx="28" ry="24" />
            <svg:path
              class="flame flame-a"
              d="M 0 8 C -12 0, -14 -16, -2 -30 C 2 -18, 10 -8, 0 8 Z"
            />
          </svg:g>
        }
        <svg:rect
          x="-28"
          y="-28"
          width="56"
          height="56"
          rx="4"
          class="sym"
          fill="none"
          [class.bjt-charred]="ledBurn() > 0.08"
        />
        <svg:text x="0" y="5" text-anchor="middle" class="meter-letter">555</svg:text>
      }
      @case ('ammeter') {
        @if (ledBurn() > 0.08) {
          <svg:g class="led-fire" [attr.opacity]="0.55 + ledBurn() * 0.45" pointer-events="none">
            <svg:ellipse class="fire-glow" cx="0" cy="-8" rx="18" ry="20" />
            <svg:path
              class="flame flame-a"
              d="M 0 4 C -8 -2, -10 -14, -2 -24 C 2 -16, 6 -6, 0 4 Z"
            />
          </svg:g>
        }
        <svg:circle cx="0" cy="0" r="18" class="sym" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:text x="0" y="5" text-anchor="middle" class="meter-letter">A</svg:text>
        <svg:line x1="-36" y1="0" x2="-18" y2="0" class="sym" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:line x1="18" y1="0" x2="36" y2="0" class="sym" [class.bjt-charred]="ledBurn() > 0.08" />
      }
      @case ('voltmeter') {
        <svg:circle cx="0" cy="0" r="18" class="sym" />
        <svg:text x="0" y="5" text-anchor="middle" class="meter-letter">V</svg:text>
        <svg:line x1="-36" y1="0" x2="-18" y2="0" class="sym" />
        <svg:line x1="18" y1="0" x2="36" y2="0" class="sym" />
      }
      @case ('resistor') {
        @if (ledBurn() > 0.08) {
          <svg:g class="led-fire" [attr.opacity]="0.55 + ledBurn() * 0.45" pointer-events="none">
            <svg:ellipse class="fire-glow" cx="0" cy="-10" rx="22" ry="18" />
            <svg:path
              class="flame flame-a"
              d="M 0 2 C -10 -4, -12 -16, -2 -26 C 2 -16, 8 -6, 0 2 Z"
            />
          </svg:g>
        }
        <svg:polyline
          class="sym"
          [class.bjt-charred]="ledBurn() > 0.08"
          fill="none"
          points="-40,0 -28,-12 -16,12 -4,-12 8,12 20,-12 32,0 40,0"
        />
      }
      @case ('switch') {
        <svg:circle cx="-30" cy="0" r="4" class="sym fill" />
        <svg:circle cx="30" cy="0" r="4" class="sym fill" />
        @if (closed()) {
          <svg:line x1="-26" y1="0" x2="26" y2="0" class="sym thick" />
        } @else {
          <svg:line x1="-26" y1="0" x2="18" y2="-16" class="sym thick" />
        }
      }
      @case ('relay') {
        <svg:rect x="-28" y="-18" width="20" height="36" class="sym" fill="none" />
        <svg:path
          class="sym"
          fill="none"
          d="M -24 -10 C -20 -18, -12 -18, -12 -10 C -12 -2, -20 -2, -20 -10 M -20 -10 C -16 -18, -8 -18, -8 -10"
        />
        <svg:line x1="-36" y1="-28" x2="-28" y2="-18" class="sym" />
        <svg:line x1="-36" y1="28" x2="-28" y2="18" class="sym" />
        <svg:text x="-40" y="-30" class="polarity-mark pin-hint">+</svg:text>
        <svg:circle cx="20" cy="-20" r="3" class="sym fill" />
        <svg:circle cx="20" cy="20" r="3" class="sym fill" />
        <svg:line x1="20" y1="-20" x2="36" y2="-20" class="sym" />
        <svg:line x1="20" y1="20" x2="36" y2="20" class="sym" />
        @if (closed()) {
          <svg:line x1="20" y1="-20" x2="20" y2="20" class="sym thick" />
        } @else {
          <svg:line x1="20" y1="-20" x2="28" y2="8" class="sym thick" />
        }
      }
      @case ('led') {
        @if (ledBurn() > 0.08) {
          <svg:g class="led-fire" [attr.opacity]="0.55 + ledBurn() * 0.45" pointer-events="none">
            <svg:ellipse class="fire-glow" cx="0" cy="-6" rx="22" ry="26" />
            <svg:path
              class="flame flame-a"
              d="M 0 8 C -10 0, -12 -14, -2 -28 C 2 -18, 8 -8, 0 8 Z"
            />
            <svg:path
              class="flame flame-b"
              d="M -6 6 C -14 -2, -8 -18, -4 -24 C -2 -14, 2 -4, -6 6 Z"
            />
            <svg:path
              class="flame flame-c"
              d="M 6 6 C 14 -2, 10 -16, 5 -22 C 4 -12, 0 -2, 6 6 Z"
            />
            <svg:path
              class="flame-core"
              d="M 0 4 C -5 -2, -4 -12, 0 -20 C 4 -12, 5 -2, 0 4 Z"
            />
            <svg:g class="smoke" [attr.opacity]="ledBurn() * 0.7">
              <svg:circle class="smoke-puff puff-1" cx="-8" cy="-34" r="5" />
              <svg:circle class="smoke-puff puff-2" cx="2" cy="-40" r="6" />
              <svg:circle class="smoke-puff puff-3" cx="10" cy="-36" r="4" />
            </svg:g>
          </svg:g>
        } @else if (ledBrightness() > 0.02) {
          <svg:ellipse
            cx="0"
            cy="4"
            rx="26"
            ry="28"
            class="led-glow"
            [attr.fill]="ledGlowFill()"
            [attr.opacity]="ledGlowOpacity()"
          />
        }
        <svg:line x1="0" y1="-36" x2="0" y2="-10" class="sym" />
        <svg:polygon
          points="0,-10 -14,14 14,14"
          class="led"
          [class.led-charred]="ledBurn() > 0.08"
          [attr.fill]="ledFill()"
        />
        <svg:line x1="-14" y1="14" x2="14" y2="14" class="sym thick" />
        <svg:line x1="0" y1="14" x2="0" y2="40" class="sym" />
        <svg:text x="16" y="-22" class="polarity-mark pin-hint">A</svg:text>
        <svg:text x="16" y="34" class="polarity-mark pin-hint">K</svg:text>
        @if (ledBurn() > 0.35) {
          <svg:g class="led-crack" pointer-events="none">
            <svg:line x1="-6" y1="-2" x2="4" y2="10" />
            <svg:line x1="2" y1="0" x2="-4" y2="12" />
          </svg:g>
        }
      }
      @case ('diode') {
        @if (ledBurn() > 0.08) {
          <svg:g class="led-fire" [attr.opacity]="0.55 + ledBurn() * 0.45" pointer-events="none">
            <svg:ellipse class="fire-glow" cx="0" cy="-8" rx="18" ry="20" />
            <svg:path
              class="flame flame-a"
              d="M 0 4 C -8 -2, -10 -14, -2 -24 C 2 -16, 6 -6, 0 4 Z"
            />
          </svg:g>
        }
        <svg:line x1="-36" y1="0" x2="-8" y2="0" class="sym" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:polygon
          points="-8,0 -8,-14 12,0 -8,14"
          class="diode"
          [class.led-charred]="ledBurn() > 0.08"
        />
        <svg:line x1="12" y1="-14" x2="12" y2="14" class="sym thick" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:line x1="12" y1="0" x2="36" y2="0" class="sym" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:text x="-28" y="-10" class="polarity-mark pin-hint">A</svg:text>
        <svg:text x="22" y="-10" class="polarity-mark pin-hint">K</svg:text>
      }
      @case ('current_source') {
        <svg:circle cx="0" cy="0" r="22" class="sym" />
        <svg:line x1="0" y1="12" x2="0" y2="-12" class="sym thick" />
        <svg:polyline class="sym" fill="none" points="-6,-4 0,-12 6,-4" />
        <svg:text x="0" y="-28" text-anchor="middle" class="polarity-mark">+</svg:text>
      }
      @case ('capacitor') {
        @if (ledBurn() > 0.08) {
          <svg:g class="led-fire" [attr.opacity]="0.55 + ledBurn() * 0.45" pointer-events="none">
            <svg:ellipse class="fire-glow" cx="0" cy="-10" rx="18" ry="18" />
            <svg:path
              class="flame flame-a"
              d="M 0 2 C -8 -4, -10 -14, -2 -24 C 2 -16, 6 -6, 0 2 Z"
            />
          </svg:g>
        }
        <svg:line x1="-36" y1="0" x2="-8" y2="0" class="sym" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:line x1="-8" y1="-18" x2="-8" y2="18" class="sym thick" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:line x1="8" y1="-18" x2="8" y2="18" class="sym thick" [class.bjt-charred]="ledBurn() > 0.08" />
        <svg:line x1="8" y1="0" x2="36" y2="0" class="sym" [class.bjt-charred]="ledBurn() > 0.08" />
      }
      @case ('inductor') {
        <svg:path
          class="sym"
          fill="none"
          d="M -40 0 L -28 0 C -28 -14, -14 -14, -14 0 C -14 -14, 0 -14, 0 0 C 0 -14, 14 -14, 14 0 C 14 -14, 28 -14, 28 0 L 40 0"
        />
      }
      @case ('potentiometer') {
        <svg:polyline
          class="sym"
          fill="none"
          points="-40,0 -28,-12 -16,12 -4,-12 8,12 20,-12 32,0 40,0"
        />
        <svg:line x1="0" y1="12" x2="0" y2="36" class="sym" />
        <svg:polyline class="sym" fill="none" points="-6,28 0,36 6,28" />
      }
      @case ('pulse_source') {
        <svg:rect x="-22" y="-18" width="44" height="36" class="sym" fill="none" />
        <svg:polyline class="sym" fill="none" points="-14,8 -6,8 -6,-8 6,-8 6,8 14,8" />
      }
      @case ('ground') {
        <svg:line x1="0" y1="-20" x2="0" y2="0" class="sym" />
        <svg:line x1="-16" y1="0" x2="16" y2="0" class="sym thick" />
        <svg:line x1="-10" y1="8" x2="10" y2="8" class="sym" />
        <svg:line x1="-4" y1="16" x2="4" y2="16" class="sym" />
      }
      @case ('junction') {
        <svg:circle cx="0" cy="0" r="4" class="junction-node" />
      }
      @default {
        <svg:rect x="-24" y="-16" width="48" height="32" class="sym" />
      }
    }
  `,
  styles: `
    :host {
      pointer-events: auto;
    }
    .sym {
      stroke: #12263a;
      stroke-width: 2;
      fill: none;
      pointer-events: stroke;
    }
    .sym.thick {
      stroke-width: 3;
    }
    .sym.fill {
      fill: #12263a;
      pointer-events: all;
    }
    .led {
      stroke: #12263a;
      stroke-width: 2;
      pointer-events: all;
    }
    .bjt-charred {
      stroke: #1c1917;
    }
    .led-glow {
      pointer-events: none;
      filter: blur(1.5px);
    }
    .fire-glow {
      fill: #fb923c;
      filter: blur(4px);
    }
    .flame {
      stroke: none;
      pointer-events: none;
      transform-origin: 0px 8px;
      animation: flicker 0.35s ease-in-out infinite alternate;
    }
    .flame-a {
      fill: #ea580c;
    }
    .flame-b {
      fill: #f97316;
      animation-duration: 0.28s;
      animation-delay: -0.1s;
    }
    .flame-c {
      fill: #fb923c;
      animation-duration: 0.32s;
      animation-delay: -0.18s;
    }
    .flame-core {
      fill: #fef08a;
      stroke: none;
      pointer-events: none;
      transform-origin: 0px 4px;
      animation: flicker 0.25s ease-in-out infinite alternate;
    }
    .smoke-puff {
      fill: #78716c;
      stroke: none;
      transform-origin: center;
      animation: smoke-rise 1.4s ease-out infinite;
    }
    .puff-2 {
      animation-delay: 0.35s;
      fill: #a8a29e;
    }
    .puff-3 {
      animation-delay: 0.7s;
      fill: #57534e;
    }
    .led-crack line {
      stroke: #fef3c7;
      stroke-width: 1.5;
      stroke-linecap: round;
    }
    @keyframes flicker {
      from {
        transform: scaleY(0.92) scaleX(1.04);
      }
      to {
        transform: scaleY(1.08) scaleX(0.96);
      }
    }
    @keyframes smoke-rise {
      0% {
        transform: translate(0, 0) scale(0.6);
        opacity: 0.55;
      }
      100% {
        transform: translate(4px, -16px) scale(1.35);
        opacity: 0;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .flame,
      .flame-core,
      .smoke-puff {
        animation: none;
      }
    }
    .diode {
      fill: #12263a;
      stroke: #12263a;
      pointer-events: all;
    }
    .oa-mark,
    .polarity-mark {
      font-size: 12px;
      font-family: ui-monospace, monospace;
      fill: #12263a;
      pointer-events: none;
    }
    .polarity-mark.pin-hint {
      font-size: 9px;
      fill: #475569;
    }
    .meter-letter {
      font-size: 14px;
      font-family: ui-monospace, monospace;
      font-weight: 700;
      fill: #12263a;
      pointer-events: none;
    }
    .junction-node {
      fill: #12263a;
      stroke: #12263a;
      pointer-events: all;
    }
    :host-context(.selected) .sym,
    :host-context(.selected) .junction-node {
      stroke: #0b6e4f;
    }
    :host-context(.selected) .sym.fill,
    :host-context(.selected) .junction-node {
      fill: #0b6e4f;
    }
    :host-context(.probed) .sym {
      stroke: #1d4ed8;
    }
    :host-context(.error) .sym,
    :host-context(.error) .junction-node {
      stroke: #b91c1c;
    }
    :host-context(.error) .sym.fill,
    :host-context(.error) .junction-node {
      fill: #b91c1c;
    }
  `
})
export class SymbolGlyphComponent {
  readonly modelKey = input.required<string>();
  readonly closed = input(true);
  /** 0 = off, 1 = full brightness (teaching scale ~20 mA). */
  readonly ledBrightness = input(0);
  /** 0 = ok, 1 = fully overloaded / on fire (teaching scale from ~35 mA). */
  readonly ledBurn = input(0);
  /** LED color preset id (see led-colors.ts). */
  readonly ledColor = input(0);

  private preset() {
    return ledColorById(normalizeLedColorId(this.ledColor()));
  }

  ledFill(): string {
    const burn = Math.max(0, Math.min(1, this.ledBurn()));
    if (burn > 0.08) {
      const t = Math.min(1, burn);
      const r = Math.round(120 - 70 * t);
      const g = Math.round(70 - 45 * t);
      const b = Math.round(55 - 35 * t);
      return `rgb(${r}, ${g}, ${b})`;
    }
    const bright = Math.max(0, Math.min(1, this.ledBrightness()));
    const { off, lit } = this.preset();
    const r = Math.round(off[0] + (lit[0] - off[0]) * bright);
    const g = Math.round(off[1] + (lit[1] - off[1]) * bright);
    const b = Math.round(off[2] + (lit[2] - off[2]) * bright);
    return `rgb(${r}, ${g}, ${b})`;
  }

  ledGlowFill(): string {
    const { glow } = this.preset();
    return `rgb(${glow[0]}, ${glow[1]}, ${glow[2]})`;
  }

  ledGlowOpacity(): number {
    if (this.ledBurn() > 0.08) return 0;
    return Math.max(0, Math.min(1, this.ledBrightness())) * 0.55;
  }
}
