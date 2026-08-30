import { Component, computed, input, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  EditorTool,
  PinRef,
  SchematicComponent,
  SchematicDocument,
  SchematicWire,
  assignNets,
  closestPointOnOrthogonalWire,
  createComponent,
  orthogonalPolyline,
  pinKey,
  pinWorldPos,
  polylineToPath,
  snap,
  splitWireAtJunction
} from '../../data/schematic.model';
import { SYMBOL_LIBRARY } from '../../data/symbol-library';
import { PALETTE_DRAG_MIME } from '../../data/palette-drag';
import { SimulateResponse } from '../../api/circuit-api.types';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { SymbolGlyphComponent } from '../symbol-glyph/symbol-glyph.component';
import { estimateAllWireCurrents } from '../../data/wire-current';
import { LED_BURN_A, LED_FULL_BRIGHT_A } from '../../data/led-limits';
import { normalizeLedColorId } from '../../data/led-colors';

interface DragState {
  ids: string[];
  origins: Map<string, { x: number; y: number }>;
  pointer0: { x: number; y: number };
}

interface MarqueeState {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  additive: boolean;
}

@Component({
  selector: 'app-schematic-canvas',
  standalone: true,
  imports: [DecimalPipe, TranslatePipe, SymbolGlyphComponent],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class SchematicCanvasComponent {
  readonly doc = input.required<SchematicDocument>();
  readonly tool = input.required<EditorTool>();
  readonly placeModel = input<string | null>(null);
  readonly selectedId = input<string | null>(null);
  readonly selectedIds = input<string[]>([]);
  readonly selectedWireIds = input<string[]>([]);
  readonly result = input<SimulateResponse | null>(null);
  readonly scrubIndex = input(0);
  readonly probeTarget = input<{ kind: 'net' | 'component'; id: string } | null>(null);
  readonly highlightedIds = input<string[]>([]);
  readonly highlightedNets = input<string[]>([]);

  readonly docChange = output<SchematicDocument>();
  readonly select = output<{ id: string | null; additive: boolean }>();
  readonly selectMany = output<{ ids: string[]; additive: boolean }>();
  readonly selectWire = output<{ id: string | null; additive: boolean }>();
  readonly probe = output<{ kind: 'net' | 'component'; id: string } | null>();
  readonly placeAt = output<{ x: number; y: number }>();
  readonly dropPlace = output<{ modelKey: string; x: number; y: number }>();

  readonly wireFrom = signal<PinRef | null>(null);
  /** Cursor in SVG space while drawing a wire (rubber-band). */
  readonly wireCursor = signal<{ x: number; y: number } | null>(null);
  readonly dragOver = signal(false);
  /** Normalized marquee rect while dragging on empty canvas. */
  readonly marqueeRect = signal<{ x: number; y: number; w: number; h: number } | null>(null);
  readonly lib = SYMBOL_LIBRARY;

  /** viewBox: x y w h */
  readonly view = signal({ x: 0, y: 0, w: 720, h: 400 });
  private pan: { x0: number; y0: number; vx: number; vy: number } | null = null;
  private drag: DragState | null = null;
  private marquee: MarqueeState | null = null;

  readonly nettled = computed(() => assignNets(this.doc()));

  readonly viewBox = computed(() => {
    const v = this.view();
    return `${v.x} ${v.y} ${v.w} ${v.h}`;
  });

  readonly wirePaths = computed(() => {
    const d = this.nettled();
    const res = this.result();
    const live = !!res?.ok;
    const wireCurrents = live
      ? estimateAllWireCurrents(d.components, d.wires, (id) => this.currentOf(id))
      : null;
    const out: {
      id: string;
      d: string;
      pts: { x: number; y: number }[];
      flow: { path: string; periodMs: number; strength: number } | null;
    }[] = [];
    for (const w of d.wires) {
      const a = this.endpoint(d, w.a);
      const b = this.endpoint(d, w.b);
      if (!a || !b) continue;
      const pts = orthogonalPolyline(a.x, a.y, b.x, b.y);
      const path = polylineToPath(pts);
      let flow: { path: string; periodMs: number; strength: number } | null = null;
      if (wireCurrents) {
        const iAlong = wireCurrents.get(w.id) ?? 0;
        if (Math.abs(iAlong) > 1e-6) {
          const mag = Math.abs(iAlong);
          const strength = Math.min(1, mag / 0.012);
          const periodMs = Math.round(
            Math.max(220, Math.min(900, 480 / Math.sqrt(strength + 0.2)))
          );
          const drawPts = iAlong >= 0 ? pts : [...pts].reverse();
          flow = { path: polylineToPath(drawPts), periodMs, strength };
        }
      }
      out.push({ id: w.id, d: path, pts, flow });
    }
    return out;
  });

  readonly junctionDots = computed(() => {
    const d = this.nettled();
    const count = new Map<string, { x: number; y: number; n: number }>();
    for (const c of d.components) {
      for (const name of Object.keys(c.pins)) {
        const pos = pinWorldPos(c, name);
        if (!pos) continue;
        const key = `${Math.round(pos.x)},${Math.round(pos.y)}`;
        const cur = count.get(key) ?? { x: pos.x, y: pos.y, n: 0 };
        cur.n += 1;
        count.set(key, cur);
      }
    }
    return [...count.values()].filter((p) => p.n >= 3);
  });

  /** Orthogonal preview from the active wire start pin to the cursor. */
  readonly rubberBandPath = computed(() => {
    const from = this.wireFrom();
    const cursor = this.wireCursor();
    if (!from || !cursor) return null;
    const a = this.endpoint(this.nettled(), from);
    if (!a) return null;
    return polylineToPath(orthogonalPolyline(a.x, a.y, cursor.x, cursor.y));
  });

  readonly netTags = computed(() => {
    const d = this.nettled();
    const seen = new Set<string>();
    const tags: { net: string; x: number; y: number }[] = [];
    for (const c of d.components) {
      for (const name of Object.keys(c.pins)) {
        const net = c.pins[name].net;
        if (!net || seen.has(net)) continue;
        seen.add(net);
        const pos = pinWorldPos(c, name);
        if (pos) tags.push({ net, x: pos.x + 8, y: pos.y - 10 });
      }
    }
    return tags;
  });

  onWheel(ev: WheelEvent): void {
    ev.preventDefault();
    const svg = ev.currentTarget as SVGSVGElement;
    const pt = this.clientToSvg(svg, ev.clientX, ev.clientY);
    const factor = ev.deltaY > 0 ? 1.1 : 1 / 1.1;
    const v = this.view();
    const nw = Math.min(2400, Math.max(200, v.w * factor));
    const nh = (nw / v.w) * v.h;
    const nx = pt.x - ((pt.x - v.x) / v.w) * nw;
    const ny = pt.y - ((pt.y - v.y) / v.h) * nh;
    this.view.set({ x: nx, y: ny, w: nw, h: nh });
  }

  onDragOver(ev: DragEvent): void {
    const types = ev.dataTransfer?.types;
    if (!types) return;
    const list = [...types];
    if (!list.includes(PALETTE_DRAG_MIME) && !list.includes('text/plain')) return;
    ev.preventDefault();
    if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'copy';
    this.dragOver.set(true);
  }

  onDragLeave(ev: DragEvent): void {
    const svg = ev.currentTarget as Element;
    const related = ev.relatedTarget as Node | null;
    if (related && svg.contains(related)) return;
    this.dragOver.set(false);
  }

  onDrop(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOver.set(false);
    const modelKey =
      ev.dataTransfer?.getData(PALETTE_DRAG_MIME) ||
      ev.dataTransfer?.getData('text/plain') ||
      '';
    if (!modelKey || !SYMBOL_LIBRARY[modelKey]) return;
    const svg = ev.currentTarget as SVGSVGElement;
    const pt = this.clientToSvg(svg, ev.clientX, ev.clientY);
    this.dropPlace.emit({ modelKey, x: snap(pt.x), y: snap(pt.y) });
  }

  onBackgroundPointerDown(ev: PointerEvent): void {
    if (ev.button === 1 || ev.shiftKey) {
      const v = this.view();
      this.pan = { x0: ev.clientX, y0: ev.clientY, vx: v.x, vy: v.y };
      (ev.currentTarget as Element).setPointerCapture(ev.pointerId);
      return;
    }

    if (this.tool() === 'place' && this.placeModel()) {
      const svg = (ev.currentTarget as SVGElement).ownerSVGElement!;
      const pt = this.clientToSvg(svg, ev.clientX, ev.clientY);
      this.placeAt.emit({ x: snap(pt.x), y: snap(pt.y) });
      return;
    }

    if (this.tool() === 'select') {
      const svg = (ev.currentTarget as SVGElement).ownerSVGElement!;
      const pt = this.clientToSvg(svg, ev.clientX, ev.clientY);
      this.marquee = {
        x0: pt.x,
        y0: pt.y,
        x1: pt.x,
        y1: pt.y,
        additive: ev.ctrlKey || ev.metaKey
      };
      this.marqueeRect.set({ x: pt.x, y: pt.y, w: 0, h: 0 });
      this.probe.emit(null);
      (ev.currentTarget as Element).setPointerCapture(ev.pointerId);
      return;
    }

    if (this.tool() === 'wire') {
      this.wireFrom.set(null);
      this.wireCursor.set(null);
    }
  }

  onSchematicPointerMove(ev: PointerEvent): void {
    if (this.tool() !== 'wire' || !this.wireFrom()) return;
    const svg = ev.currentTarget as SVGSVGElement;
    const pt = this.clientToSvg(svg, ev.clientX, ev.clientY);
    this.wireCursor.set({ x: pt.x, y: pt.y });
  }

  onBackgroundPointerMove(ev: PointerEvent): void {
    if (this.marquee) {
      const svg = (ev.currentTarget as SVGElement).ownerSVGElement!;
      const pt = this.clientToSvg(svg, ev.clientX, ev.clientY);
      this.marquee.x1 = pt.x;
      this.marquee.y1 = pt.y;
      this.marqueeRect.set(this.normalizeMarquee(this.marquee));
      return;
    }
    if (!this.pan) return;
    const svg = (ev.currentTarget as SVGElement).ownerSVGElement!;
    const scale = this.view().w / svg.clientWidth;
    const dx = (ev.clientX - this.pan.x0) * scale;
    const dy = (ev.clientY - this.pan.y0) * scale;
    this.view.set({
      ...this.view(),
      x: this.pan.vx - dx,
      y: this.pan.vy - dy
    });
  }

  onBackgroundPointerUp(ev: PointerEvent): void {
    if (this.marquee) {
      const m = this.marquee;
      const rect = this.normalizeMarquee(m);
      const dragged = Math.hypot(m.x1 - m.x0, m.y1 - m.y0) > 4;
      if (!dragged) {
        if (!m.additive) {
          this.select.emit({ id: null, additive: false });
          this.selectWire.emit({ id: null, additive: false });
        }
      } else {
        const ids = this.doc()
          .components.filter((c) => this.boundsIntersectMarquee(c, rect))
          .map((c) => c.id);
        this.selectMany.emit({ ids, additive: m.additive });
      }
      this.marquee = null;
      this.marqueeRect.set(null);
      try {
        (ev.currentTarget as Element).releasePointerCapture(ev.pointerId);
      } catch {
        /* ignore */
      }
      return;
    }
    if (this.pan) {
      try {
        (ev.currentTarget as Element).releasePointerCapture(ev.pointerId);
      } catch {
        /* ignore */
      }
    }
    this.pan = null;
  }

  private normalizeMarquee(m: MarqueeState): { x: number; y: number; w: number; h: number } {
    const x = Math.min(m.x0, m.x1);
    const y = Math.min(m.y0, m.y1);
    return { x, y, w: Math.abs(m.x1 - m.x0), h: Math.abs(m.y1 - m.y0) };
  }

  private boundsIntersectMarquee(
    c: SchematicComponent,
    rect: { x: number; y: number; w: number; h: number }
  ): boolean {
    const def = SYMBOL_LIBRARY[c.modelKey];
    if (!def) return false;
    const pad = 8;
    let bw = def.width + pad * 2;
    let bh = def.height + pad * 2;
    if (c.rotation === 90 || c.rotation === 270) {
      const t = bw;
      bw = bh;
      bh = t;
    }
    const bx = c.x - bw / 2;
    const by = c.y - bh / 2;
    return bx < rect.x + rect.w && bx + bw > rect.x && by < rect.y + rect.h && by + bh > rect.y;
  }

  onSymbolPointerDown(ev: PointerEvent, c: SchematicComponent): void {
    ev.stopPropagation();
    const tool = this.tool();

    if (tool === 'probe') {
      this.select.emit({ id: c.id, additive: false });
      this.probe.emit({ kind: 'component', id: c.id });
      return;
    }
    if (tool === 'wire' || tool === 'place') return;

    const additive = ev.ctrlKey || ev.metaKey;
    if (additive) {
      this.select.emit({ id: c.id, additive: true });
      return;
    }

    const cur = this.selectedIds();
    const ids = cur.includes(c.id) && cur.length > 0 ? [...cur] : [c.id];
    if (!cur.includes(c.id) || cur.length === 0) {
      this.select.emit({ id: c.id, additive: false });
    }

    const svg = (ev.currentTarget as SVGElement).ownerSVGElement!;
    const pt = this.clientToSvg(svg, ev.clientX, ev.clientY);
    const origins = new Map<string, { x: number; y: number }>();
    for (const comp of this.doc().components) {
      if (ids.includes(comp.id)) origins.set(comp.id, { x: comp.x, y: comp.y });
    }
    this.drag = { ids, origins, pointer0: { x: pt.x, y: pt.y } };
    (ev.currentTarget as Element).setPointerCapture(ev.pointerId);
  }

  onSymbolPointerMove(ev: PointerEvent): void {
    if (!this.drag) return;
    const svg = (ev.currentTarget as SVGElement).ownerSVGElement!;
    const pt = this.clientToSvg(svg, ev.clientX, ev.clientY);
    const primaryId = this.drag.ids[0];
    const origin = this.drag.origins.get(primaryId);
    if (!origin) return;
    const rawDx = pt.x - this.drag.pointer0.x;
    const rawDy = pt.y - this.drag.pointer0.y;
    const dx = snap(origin.x + rawDx) - origin.x;
    const dy = snap(origin.y + rawDy) - origin.y;
    const moving = new Set(this.drag.ids);
    this.docChange.emit({
      ...this.doc(),
      components: this.doc().components.map((c) => {
        if (!moving.has(c.id)) return c;
        const o = this.drag!.origins.get(c.id);
        if (!o) return c;
        return { ...c, x: o.x + dx, y: o.y + dy };
      })
    });
  }

  onSymbolPointerUp(ev: PointerEvent): void {
    if (this.drag) {
      try {
        (ev.currentTarget as Element).releasePointerCapture(ev.pointerId);
      } catch {
        /* ignore */
      }
    }
    this.drag = null;
  }

  onPinClick(ev: MouseEvent, componentId: string, pin: string): void {
    ev.stopPropagation();
    const ref: PinRef = { componentId, pin };
    const tool = this.tool();

    if (tool === 'probe') {
      const c = this.nettled().components.find((x) => x.id === componentId);
      const net = c?.pins[pin]?.net;
      if (net) this.probe.emit({ kind: 'net', id: net });
      this.select.emit({ id: componentId, additive: false });
      return;
    }

    if (tool === 'select') {
      this.select.emit({ id: componentId, additive: ev.ctrlKey || ev.metaKey });
      return;
    }

    if (tool !== 'wire') return;

    const from = this.wireFrom();
    if (!from) {
      this.wireFrom.set(ref);
      return;
    }
    if (pinKey(from) === pinKey(ref)) {
      this.wireFrom.set(null);
      this.wireCursor.set(null);
      return;
    }
    if (this.wireExists(from, ref)) {
      this.wireFrom.set(null);
      this.wireCursor.set(null);
      return;
    }
    const wire: SchematicWire = {
      id: `W${Date.now()}`,
      a: from,
      b: ref
    };
    this.docChange.emit({
      ...this.doc(),
      wires: [...this.doc().wires, wire]
    });
    this.wireFrom.set(null);
    this.wireCursor.set(null);
  }

  onWireClick(ev: MouseEvent, wireId: string): void {
    ev.stopPropagation();
    const tool = this.tool();

    if (tool === 'wire') {
      const path = this.wirePaths().find((w) => w.id === wireId);
      if (!path) return;
      const svg = (ev.currentTarget as SVGElement).ownerSVGElement!;
      const pt = this.clientToSvg(svg, ev.clientX, ev.clientY);
      const hit = closestPointOnOrthogonalWire(pt.x, pt.y, path.pts, 16);
      if (!hit) return;
      const junction = createComponent('junction', hit.x, hit.y);
      const jRef: PinRef = { componentId: junction.id, pin: 'j' };
      let next = {
        ...this.doc(),
        components: [...this.doc().components, junction]
      };
      next = splitWireAtJunction(next, wireId, junction.id);

      const from = this.wireFrom();
      if (from && pinKey(from) !== pinKey(jRef) && !this.wireExists(from, jRef)) {
        // Finish an in-progress wire onto this wire (auto T-junction).
        next = {
          ...next,
          wires: [...next.wires, { id: `W${Date.now()}`, a: from, b: jRef }]
        };
        this.docChange.emit(next);
        this.wireFrom.set(null);
        this.wireCursor.set(null);
        return;
      }

      // Start a branch from the tap point.
      this.docChange.emit(next);
      this.wireFrom.set(jRef);
      return;
    }

    if (tool !== 'select') return;
    this.selectWire.emit({
      id: wireId,
      additive: ev.ctrlKey || ev.metaKey
    });
  }

  isWireSelected(id: string): boolean {
    return this.selectedWireIds().includes(id);
  }

  isHighlightedNet(net: string): boolean {
    return this.highlightedNets().includes(net);
  }

  voltageOf(net: string): number | null {
    const res = this.result();
    if (res?.dcOp) {
      const v = res.dcOp.nodeVoltages?.[net];
      return typeof v === 'number' ? v : null;
    }
    if (res?.tran) {
      const s = res.tran.nodeVoltages.find((x) => x.id === net);
      const idx = Math.max(0, Math.min(this.scrubIndex(), (s?.values.length ?? 1) - 1));
      const v = s?.values[idx];
      return typeof v === 'number' ? v : null;
    }
    if (res?.ac?.points?.length) {
      const ph = res.ac.points[0]!.nodeVoltages?.[net];
      return ph ? ph.mag : null;
    }
    return null;
  }

  currentOf(id: string): number | null {
    const res = this.result();
    if (res?.dcOp) {
      const i = res.dcOp.branchCurrents?.[id];
      return typeof i === 'number' ? i : null;
    }
    if (res?.tran) {
      const s = res.tran.branchCurrents.find((x) => x.id === id);
      const idx = Math.max(0, Math.min(this.scrubIndex(), (s?.values.length ?? 1) - 1));
      const i = s?.values[idx];
      return typeof i === 'number' ? i : null;
    }
    if (res?.ac?.points?.length) {
      const ph = res.ac.points[0]!.branchCurrents?.[id];
      return ph ? ph.mag : null;
    }
    return null;
  }

  /** Differential reading for schematic-only voltmeter (p − n). */
  voltmeterReading(c: { pins: Record<string, { net: string }> }): number | null {
    const p = c.pins['p']?.net;
    const n = c.pins['n']?.net;
    if (!p || !n) return null;
    const vp = this.voltageOf(p);
    const vn = this.voltageOf(n);
    if (vp === null || vn === null) return null;
    return vp - vn;
  }

  /**
   * LED teaching brightness from branch current.
   * 0 A → off; ~20 mA → full glow. Burned LEDs stay dark (fail open).
   */
  ledBrightness(id: string): number {
    const c = this.doc().components.find((x) => x.id === id);
    if (c?.params['burned']) return 0;
    const i = this.currentOf(id);
    if (typeof i !== 'number' || i <= 1e-6) return 0;
    // Sqrt curve keeps mid-fade glow visible (linear looked “instantly off”).
    return Math.sqrt(Math.min(1, i / LED_FULL_BRIGHT_A));
  }

  /**
   * LED overload / “on fire” intensity for teaching.
   * Sticky burned flag keeps the fire visual after the LED fails open.
   */
  ledBurn(id: string): number {
    const c = this.doc().components.find((x) => x.id === id);
    if (c?.params['burned']) return 1;
    const i = this.currentOf(id);
    if (typeof i !== 'number' || i < LED_BURN_A) return 0;
    return Math.min(1, (i - LED_BURN_A) / 0.045);
  }

  isLedFailedOpen(id: string): boolean {
    return !!this.doc().components.find((x) => x.id === id)?.params['burned'];
  }

  /** Switch glyph follows scrub time when openAt/closeAt timeline is active. */
  switchClosed(c: SchematicComponent): boolean {
    if (c.modelKey !== 'switch') return !!c.params['closed'];
    const openAt = c.params['openAt'];
    const closeAt = c.params['closeAt'];
    const hasOpen = typeof openAt === 'number' && openAt >= 0;
    const hasClose = typeof closeAt === 'number' && closeAt >= 0;
    const res = this.result();
    if ((hasOpen || hasClose) && res?.tran?.time?.length) {
      const idx = Math.max(0, Math.min(this.scrubIndex(), res.tran.time.length - 1));
      const t = res.tran.time[idx] ?? 0;
      if (hasOpen && hasClose) {
        return closeAt! <= openAt!
          ? t >= closeAt! && t < openAt!
          : !(t >= openAt! && t < closeAt!);
      }
      if (hasOpen) return t < openAt!;
      return t >= closeAt!;
    }
    return !!c.params['closed'];
  }

  ledColorOf(c: { modelKey: string; params: Record<string, number | boolean> }): number {
    if (c.modelKey !== 'led') return 0;
    return normalizeLedColorId(c.params['color']);
  }

  pinPos(c: SchematicComponent, pinName: string): { x: number; y: number } {
    return pinWorldPos(c, pinName) ?? { x: c.x, y: c.y };
  }

  isSelected(id: string): boolean {
    const multi = this.selectedIds();
    if (multi.length) return multi.includes(id);
    return this.selectedId() === id;
  }

  isHighlighted(id: string): boolean {
    return this.highlightedIds().includes(id);
  }

  isWireFrom(componentId: string, pin: string): boolean {
    const f = this.wireFrom();
    return !!f && f.componentId === componentId && f.pin === pin;
  }

  isProbedNet(net: string): boolean {
    const p = this.probeTarget();
    return !!p && p.kind === 'net' && p.id === net;
  }

  isProbedComponent(id: string): boolean {
    const p = this.probeTarget();
    return !!p && p.kind === 'component' && p.id === id;
  }

  pinNames(c: SchematicComponent): string[] {
    return Object.keys(c.pins);
  }

  private endpoint(doc: SchematicDocument, ref: PinRef) {
    const c = doc.components.find((x) => x.id === ref.componentId);
    if (!c) return null;
    return pinWorldPos(c, ref.pin);
  }

  private wireExists(a: PinRef, b: PinRef): boolean {
    const ka = pinKey(a);
    const kb = pinKey(b);
    return this.doc().wires.some((w) => {
      const wa = pinKey(w.a);
      const wb = pinKey(w.b);
      return (wa === ka && wb === kb) || (wa === kb && wb === ka);
    });
  }

  private clientToSvg(svg: SVGSVGElement, clientX: number, clientY: number) {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  }
}
