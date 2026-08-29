import { Component, input } from '@angular/core';

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
      }
      @case ('resistor') {
        <svg:polyline
          class="sym"
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
      @case ('led') {
        @if (ledBrightness() > 0.02) {
          <svg:ellipse
            cx="0"
            cy="4"
            rx="26"
            ry="28"
            class="led-glow"
            [attr.opacity]="ledGlowOpacity()"
          />
        }
        <svg:line x1="0" y1="-36" x2="0" y2="-10" class="sym" />
        <svg:polygon
          points="0,-10 -14,14 14,14"
          class="led"
          [attr.fill]="ledFill()"
        />
        <svg:line x1="-14" y1="14" x2="14" y2="14" class="sym thick" />
        <svg:line x1="0" y1="14" x2="0" y2="40" class="sym" />
      }
      @case ('diode') {
        <svg:line x1="-36" y1="0" x2="-8" y2="0" class="sym" />
        <svg:polygon points="-8,0 -8,-14 12,0 -8,14" class="diode" />
        <svg:line x1="12" y1="-14" x2="12" y2="14" class="sym thick" />
        <svg:line x1="12" y1="0" x2="36" y2="0" class="sym" />
      }
      @case ('current_source') {
        <svg:circle cx="0" cy="0" r="22" class="sym" />
        <svg:line x1="0" y1="12" x2="0" y2="-12" class="sym thick" />
        <svg:polyline class="sym" fill="none" points="-6,-4 0,-12 6,-4" />
      }
      @case ('capacitor') {
        <svg:line x1="-36" y1="0" x2="-8" y2="0" class="sym" />
        <svg:line x1="-8" y1="-18" x2="-8" y2="18" class="sym thick" />
        <svg:line x1="8" y1="-18" x2="8" y2="18" class="sym thick" />
        <svg:line x1="8" y1="0" x2="36" y2="0" class="sym" />
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
    .led-glow {
      fill: #ff4d6d;
      pointer-events: none;
      filter: blur(1.5px);
    }
    .diode {
      fill: #12263a;
      stroke: #12263a;
      pointer-events: all;
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

  ledFill(): string {
    const b = Math.max(0, Math.min(1, this.ledBrightness()));
    const r = Math.round(226 + (255 - 226) * b);
    const g = Math.round(232 + (61 - 232) * b);
    const bl = Math.round(240 + (109 - 240) * b);
    return `rgb(${r}, ${g}, ${bl})`;
  }

  ledGlowOpacity(): number {
    return Math.max(0, Math.min(1, this.ledBrightness())) * 0.55;
  }
}
