import { Component, computed, effect, input, output, signal } from '@angular/core';
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
  pinKey,
  pinWorldPos,
  polylineToPath,
  paramNumber,
  paramNumberOrNull,
  snap,
  splitWireAtJunction
} from '../../data/schematic.model';
import { SYMBOL_LIBRARY, glyphKeyOf } from '../../data/symbol-library';
import {
  JUNCTION_DOT_RADIUS,
  pinDotRadius,
  pinHitRadius,
  symbolDisplayScale
} from '../../data/symbol-scale';
import {
  clearWireWaypoints,
  nearestOrthogonalTee,
  routeOrthogonal,
  updateAxisLock,
  withWireWaypoint
} from '../../data/wire-routing';
import type { Point, PreferAxis } from '../../data/wire-routing';
import { PALETTE_DRAG_MIME } from '../../data/palette-drag';
import { SimulateResponse } from '../../api/circuit-api.types';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { SymbolGlyphComponent } from '../symbol-glyph/symbol-glyph.component';
import { WireFlowBuilder } from '../../data/wire-flow/wire-flow.builder';
import { resolveCapacitorBranchCurrent } from '../../data/cap-branch-current';
import { equalizeSeriesBranchCurrent } from '../../data/series-branch-current';
import { LED_BURN_A, LED_FULL_BRIGHT_A } from '../../data/led-limits';
import { canBurnOut } from '../../data/burnout';
import { normalizeLedColorId } from '../../data/led-colors';
import { placeAllPartLabels, placePartMeasurement } from '../../data/part-label-layout';

interface DragState {
  ids: string[];
  origins: Map<string, { x: number; y: number }>;
  pointer0: { x: number; y: number };
  /** Pushbutton hold — convert to move-drag after a small threshold. */
  pushHoldId?: string;
}

interface WireDragState {
  wireId: string;
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
  /** Request toolbar tool change (e.g. wire → select when clicking a part body). */
  readonly toolChange = output<EditorTool>();
  readonly placeAt = output<{ x: number; y: number }>();
  readonly dropPlace = output<{ modelKey: string; x: number; y: number }>();
  /** Momentary press on a pushbutton part (hold = pressed). */
  readonly pushbuttonPress = output<{ id: string; pressed: boolean }>();

  readonly wireFrom = signal<PinRef | null>(null);
  /** Cursor in SVG space while drawing a wire (rubber-band). */
  readonly wireCursor = signal<{ x: number; y: number } | null>(null);
  /** Recent cursor samples while rubber-banding (oldest → newest). */
  readonly wireMotion = signal<Point[]>([]);
  /** Sticky L orientation for the in-progress wire (follows first clear mouse pull). */
  readonly wireAxisLock = signal<PreferAxis | null>(null);
  readonly dragOver = signal(false);
  /** Normalized marquee rect while dragging on empty canvas. */
  readonly marqueeRect = signal<{ x: number; y: number; w: number; h: number } | null>(null);
  readonly lib = SYMBOL_LIBRARY;
  readonly glyphKeyOf = glyphKeyOf;
  readonly displayScaleFor = symbolDisplayScale;
  readonly pinHitR = pinHitRadius;
  readonly pinDotR = pinDotRadius;
  readonly junctionDotR = JUNCTION_DOT_RADIUS;

  /** viewBox: x y w h */
  readonly view = signal({ x: 0, y: 0, w: 720, h: 400 });
  private pan: { x0: number; y0: number; vx: number; vy: number } | null = null;
  private drag: DragState | null = null;
  private wireDrag: WireDragState | null = null;
  private marquee: MarqueeState | null = null;

  constructor() {
    // Leaving wire mode (e.g. Select toolbar) must drop the rubber-band / start pin.
    effect(() => {
      if (this.tool() !== 'wire') {
        this.clearWireGesture();
      }
    });
  }

  readonly nettled = computed(() => assignNets(this.doc()));

  /** Collision-aware id label placements for the current schematic. */
  readonly partLabelMap = computed(() => placeAllPartLabels(this.nettled().components));

  readonly viewBox = computed(() => {
    const v = this.view();
    return `${v.x} ${v.y} ${v.w} ${v.h}`;
  });

  readonly wirePaths = computed(() => {
    const d = this.nettled();
    const res = this.result();
    const live = !!res?.ok;
    // scrubIndex is read inside currentOf() for transient — keeps flow in sync with playback.
    this.scrubIndex();
    return WireFlowBuilder.build(d, live, (id) => this.branchCurrentOf(id));
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
    const d = this.nettled();
    const a = this.endpoint(d, from);
    if (!a) return null;
    return polylineToPath(
      routeOrthogonal(a.x, a.y, cursor.x, cursor.y, {
        motion: this.wireMotion(),
        axisLock: this.wireAxisLock()
      })
    );
  });

  private clearWireGesture(): void {
    this.wireFrom.set(null);
    this.wireCursor.set(null);
    this.wireMotion.set([]);
    this.wireAxisLock.set(null);
  }

  private pushWireMotion(from: Point, cursor: Point): void {
    const prev = this.wireMotion();
    const last = prev[prev.length - 1];
    if (last && Math.hypot(cursor.x - last.x, cursor.y - last.y) < 3) return;
    const next = [...prev, cursor].slice(-12);
    this.wireMotion.set(next);
    this.wireAxisLock.set(updateAxisLock(this.wireAxisLock(), next, from, cursor));
  }

  /** Interior elbow of an orthogonal route — stored so the drawn L survives commit. */
  private elbowWaypointFromRoute(pts: Point[]): Point | null {
    for (let i = 1; i < pts.length - 1; i++) {
      const a = pts[i - 1]!;
      const b = pts[i]!;
      const c = pts[i + 1]!;
      const abH = Math.abs(a.y - b.y) < 0.5;
      const bcH = Math.abs(b.y - c.y) < 0.5;
      if (abH === bcH) continue;
      // Skip tiny exit-stub corners.
      if (Math.hypot(b.x - a.x, b.y - a.y) < 12) continue;
      return { x: b.x, y: b.y };
    }
    return null;
  }
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
      this.clearWireGesture();
    }
  }

  onSchematicPointerMove(ev: PointerEvent): void {
    if (this.tool() !== 'wire' || !this.wireFrom()) return;
    const svg = ev.currentTarget as SVGSVGElement;
    const pt = this.clientToSvg(svg, ev.clientX, ev.clientY);
    const from = this.wireFrom();
    const d = this.nettled();
    const a = from ? this.endpoint(d, from) : null;
    const snapped = this.snapWireCursor(a, pt);
    this.wireCursor.set(snapped);
    if (a) this.pushWireMotion(a, snapped);
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
    const s = symbolDisplayScale(c.modelKey);
    let bw = def.width * s + pad * 2;
    let bh = def.height * s + pad * 2;
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
    if (tool === 'place') return;

    // Wire tool: pin clicks still wire; clicking the part body exits to Select + inspector.
    if (tool === 'wire') {
      this.toolChange.emit('select');
      this.select.emit({ id: c.id, additive: false });
      this.beginSymbolDrag(ev, c, [c.id]);
      return;
    }

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

    this.beginSymbolDrag(ev, c, ids);
  }

  private beginSymbolDrag(ev: PointerEvent, c: SchematicComponent, ids: string[]): void {
    const svg = (ev.currentTarget as SVGElement).ownerSVGElement!;
    const pt = this.clientToSvg(svg, ev.clientX, ev.clientY);
    const origins = new Map<string, { x: number; y: number }>();
    for (const comp of this.doc().components) {
      if (ids.includes(comp.id)) origins.set(comp.id, { x: comp.x, y: comp.y });
    }

    const pushHoldId = c.modelKey === 'pushbutton' ? c.id : undefined;
    if (pushHoldId) {
      this.pushbuttonPress.emit({ id: pushHoldId, pressed: true });
    }

    this.drag = { ids, origins, pointer0: { x: pt.x, y: pt.y }, pushHoldId };
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

    if (this.drag.pushHoldId) {
      // Stay pressed in place until the pointer clearly wants to move the part.
      if (Math.hypot(rawDx, rawDy) < 10) return;
      this.pushbuttonPress.emit({ id: this.drag.pushHoldId, pressed: false });
      this.drag = { ...this.drag, pushHoldId: undefined };
    }

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
      }),
      // Re-auto-route when endpoints move so manual elbows do not drift.
      wires: this.doc().wires.map((w) =>
        moving.has(w.a.componentId) || moving.has(w.b.componentId)
          ? clearWireWaypoints(w)
          : w
      )
    });
  }

  onSymbolPointerUp(ev: PointerEvent): void {
    if (this.drag?.pushHoldId) {
      this.pushbuttonPress.emit({ id: this.drag.pushHoldId, pressed: false });
    }
    if (this.drag) {
      try {
        (ev.currentTarget as Element).releasePointerCapture(ev.pointerId);
      } catch {
        /* ignore */
      }
    }
    this.drag = null;
  }

  onSymbolLostPointerCapture(): void {
    if (this.drag?.pushHoldId) {
      this.pushbuttonPress.emit({ id: this.drag.pushHoldId, pressed: false });
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
      this.wireMotion.set([]);
      this.wireAxisLock.set(null);
      this.wireCursor.set(null);
      return;
    }
    if (pinKey(from) === pinKey(ref)) {
      this.clearWireGesture();
      return;
    }
    if (this.wireExists(from, ref)) {
      this.clearWireGesture();
      return;
    }

    const d = this.nettled();
    const a = this.endpoint(d, from);
    const b = this.endpoint(d, ref);
    let wire: SchematicWire = {
      id: `W${Date.now()}`,
      a: from,
      b: ref
    };
    if (a && b) {
      const pts = routeOrthogonal(a.x, a.y, b.x, b.y, {
        motion: this.wireMotion(),
        axisLock: this.wireAxisLock()
      });
      const elbow = this.elbowWaypointFromRoute(pts);
      if (elbow) wire = withWireWaypoint(wire, elbow);
    }

    this.docChange.emit({
      ...this.doc(),
      wires: [...this.doc().wires, wire]
    });
    this.clearWireGesture();
  }

  onWireClick(ev: MouseEvent, wireId: string): void {
    ev.stopPropagation();
    const tool = this.tool();

    if (tool === 'wire') {
      const path = this.wirePaths().find((w) => w.id === wireId);
      if (!path) return;
      const svg = (ev.currentTarget as SVGElement).ownerSVGElement!;
      const pt = this.clientToSvg(svg, ev.clientX, ev.clientY);
      const startPin = this.wireFrom()
        ? this.endpoint(this.nettled(), this.wireFrom()!)
        : null;
      const tee = startPin
        ? nearestOrthogonalTee(startPin, [path.pts], { x: pt.x, y: pt.y }, 24)
        : null;
      const hit =
        tee ?? closestPointOnOrthogonalWire(pt.x, pt.y, path.pts, 16);
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
        const start = this.endpoint(next, from);
        let branch: SchematicWire = { id: `W${Date.now()}`, a: from, b: jRef };
        if (start) {
          const pts = routeOrthogonal(start.x, start.y, hit.x, hit.y, {
            motion: this.wireMotion(),
            axisLock: this.wireAxisLock()
          });
          const elbow = this.elbowWaypointFromRoute(pts);
          if (elbow) branch = withWireWaypoint(branch, elbow);
        }
        next = {
          ...next,
          wires: [...next.wires, branch]
        };
        this.docChange.emit(next);
        this.clearWireGesture();
        return;
      }

      // Start a branch from the tap point.
      this.docChange.emit(next);
      this.wireFrom.set(jRef);
      this.wireMotion.set([]);
      this.wireAxisLock.set(null);
      this.wireCursor.set(null);
      return;
    }

    if (tool !== 'select') return;
    // Selection handled on pointerdown; ignore click after drag.
  }

  onWirePointerDown(ev: PointerEvent, wireId: string): void {
    if (this.tool() !== 'select' || ev.button !== 0) return;
    ev.stopPropagation();
    this.selectWire.emit({
      id: wireId,
      additive: ev.ctrlKey || ev.metaKey
    });
    const svg = (ev.currentTarget as SVGElement).ownerSVGElement!;
    const pt = this.clientToSvg(svg, ev.clientX, ev.clientY);
    this.wireDrag = { wireId, pointer0: { x: pt.x, y: pt.y } };
    (ev.currentTarget as Element).setPointerCapture(ev.pointerId);
  }

  onWirePointerMove(ev: PointerEvent): void {
    if (!this.wireDrag) return;
    const svg = (ev.currentTarget as SVGElement).ownerSVGElement!;
    const pt = this.clientToSvg(svg, ev.clientX, ev.clientY);
    const moved = Math.hypot(pt.x - this.wireDrag.pointer0.x, pt.y - this.wireDrag.pointer0.y);
    if (moved < 3) return;
    const id = this.wireDrag.wireId;
    this.docChange.emit({
      ...this.doc(),
      wires: this.doc().wires.map((w) =>
        w.id === id ? withWireWaypoint(w, { x: pt.x, y: pt.y }) : w
      )
    });
  }

  onWirePointerUp(ev: PointerEvent): void {
    if (this.wireDrag) {
      try {
        (ev.currentTarget as Element).releasePointerCapture(ev.pointerId);
      } catch {
        /* ignore */
      }
    }
    this.wireDrag = null;
  }

  onWireDblClick(ev: MouseEvent, wireId: string): void {
    if (this.tool() !== 'select') return;
    ev.stopPropagation();
    this.docChange.emit({
      ...this.doc(),
      wires: this.doc().wires.map((w) => (w.id === wireId ? clearWireWaypoints(w) : w))
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
    const ground = this.nettled().groundNet;
    if (net === ground) return 0;
    if (res?.tran && res.analysisType === 'tran') {
      const s = res.tran.nodeVoltages.find((x) => x.id === net);
      const idx = Math.max(0, Math.min(this.scrubIndex(), (s?.values.length ?? 1) - 1));
      const v = s?.values[idx];
      return typeof v === 'number' ? v : null;
    }
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

  /** Branch current with capacitor I = C·dV/dt fallback when the engine reports ~0. */
  branchCurrentOf(id: string): number | null {
    return this.branchCurrentOfInner(id, new Set());
  }

  private branchCurrentOfInner(id: string, visiting: Set<string>): number | null {
    if (visiting.has(id)) return this.rawResolvedCurrent(id);
    visiting.add(id);

    const raw = this.rawResolvedCurrent(id);
    const equalized = equalizeSeriesBranchCurrent(this.doc(), id, raw, (otherId) =>
      this.branchCurrentOfInner(otherId, visiting)
    );
    if (typeof equalized === 'number' && Math.abs(equalized) < 1e-5) return 0;
    return equalized;
  }

  private rawResolvedCurrent(id: string): number | null {
    const res = this.result();
    const comp = this.doc().components.find((c) => c.id === id);
    let i: number | null;
    if (comp?.modelKey === 'capacitor' && res?.tran) {
      const raw = this.rawBranchCurrent(id);
      i = resolveCapacitorBranchCurrent(this.doc(), id, res, this.scrubIndex(), raw);
    } else {
      i = this.rawBranchCurrent(id);
    }
    if (typeof i === 'number' && Math.abs(i) < 1e-5) return 0;
    return i;
  }

  private rawBranchCurrent(id: string): number | null {
    const res = this.result();
    if (res?.tran && res.analysisType === 'tran') {
      const s = res.tran.branchCurrents.find((x) => x.id === id);
      const idx = Math.max(0, Math.min(this.scrubIndex(), (s?.values.length ?? 1) - 1));
      const i = s?.values[idx];
      return typeof i === 'number' ? i : null;
    }
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
      if (!ph) return null;
      const rad = (ph.phaseDeg * Math.PI) / 180;
      return ph.mag * Math.cos(rad);
    }
    return null;
  }

  currentOf(id: string): number | null {
    return this.branchCurrentOf(id);
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
   * Near-linear so the glow tracks the mA label during RC discharge (sqrt looked “dead” early).
   */
  ledBrightness(id: string): number {
    const c = this.doc().components.find((x) => x.id === id);
    if (c?.params['burned']) return 0;
    const i = this.currentOf(id);
    if (typeof i !== 'number' || Math.abs(i) <= 1e-5) return 0;
    // Mild curve keeps low-mA glow visible without racing ahead of the resistor label.
    return Math.pow(Math.min(1, Math.abs(i) / LED_FULL_BRIGHT_A), 0.7);
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

  /** LED or other burnable overload visual (sticky burned → full fire). */
  deviceBurn(c: SchematicComponent): number {
    if (c.modelKey === 'led') return this.ledBurn(c.id);
    if (canBurnOut(c.modelKey) && c.params['burned']) return 1;
    return 0;
  }

  isLedFailedOpen(id: string): boolean {
    return !!this.doc().components.find((x) => x.id === id)?.params['burned'];
  }

  /** Hide branch current when a burnable part failed open. */
  isDeviceFailedOpen(c: SchematicComponent): boolean {
    return canBurnOut(c.modelKey) && !!c.params['burned'];
  }

  /** Switch / relay contact glyph: timeline override, then closed flag, else coil voltage for relay. */
  contactsClosed(c: SchematicComponent): boolean {
    if (c.modelKey === 'switch' || c.modelKey === 'pushbutton') return this.switchClosed(c);
    if (c.modelKey === 'relay') return this.relayClosed(c);
    return !!c.params['closed'];
  }

  /** Switch / pushbutton glyph follows scrub time when openAt/closeAt timeline is active. */
  switchClosed(c: SchematicComponent): boolean {
    if (c.modelKey !== 'switch' && c.modelKey !== 'pushbutton') return !!c.params['closed'];
    const openAt = paramNumberOrNull(c.params, 'openAt');
    const closeAt = paramNumberOrNull(c.params, 'closeAt');
    const hasOpen = openAt !== null && openAt >= 0;
    const hasClose = closeAt !== null && closeAt >= 0;
    const res = this.result();
    if ((hasOpen || hasClose) && res?.tran?.time?.length) {
      const idx = Math.max(0, Math.min(this.scrubIndex(), res.tran.time.length - 1));
      const t = res.tran.time[idx] ?? 0;
      if (hasOpen && hasClose && openAt !== null && closeAt !== null) {
        return closeAt <= openAt
          ? t >= closeAt && t < openAt
          : !(t >= openAt && t < closeAt);
      }
      if (hasOpen && openAt !== null) return t < openAt;
      if (closeAt !== null) return t >= closeAt;
    }
    return !!c.params['closed'];
  }

  /** Relay contacts: timeline / manual closed, else |Vcoil| ≥ vPull from sim. */
  relayClosed(c: SchematicComponent): boolean {
    if (c.modelKey !== 'relay') return !!c.params['closed'];
    const openAt = paramNumberOrNull(c.params, 'openAt');
    const closeAt = paramNumberOrNull(c.params, 'closeAt');
    const hasOpen = openAt !== null && openAt >= 0;
    const hasClose = closeAt !== null && closeAt >= 0;
    const res = this.result();
    if ((hasOpen || hasClose) && res?.tran?.time?.length) {
      const idx = Math.max(0, Math.min(this.scrubIndex(), res.tran.time.length - 1));
      const t = res.tran.time[idx] ?? 0;
      if (hasOpen && hasClose && openAt !== null && closeAt !== null) {
        return closeAt <= openAt
          ? t >= closeAt && t < openAt
          : !(t >= openAt && t < closeAt);
      }
      if (hasOpen && openAt !== null) return t < openAt;
      if (closeAt !== null) return t >= closeAt;
    }
    if (c.params['closed']) return true;

    const cp = c.pins['cp']?.net;
    const cn = c.pins['cn']?.net;
    if (!cp || !cn) return false;
    const vPull = paramNumber(c.params, 'vPull', 3.5);
    const vp = this.voltageOf(cp);
    const vn = this.voltageOf(cn);
    if (vp === null || vn === null) return false;
    return Math.abs(vp - vn) >= vPull;
  }

  ledColorOf(c: { modelKey: string; params: Record<string, number | boolean> }): number {
    if (c.modelKey !== 'led') return 0;
    return normalizeLedColorId(c.params['color']);
  }

  pinPos(c: SchematicComponent, pinName: string): { x: number; y: number } {
    return pinWorldPos(c, pinName) ?? { x: c.x, y: c.y };
  }

  /** Grid + pin + orthogonal T onto an existing rail (so preview is a drop, not a bus run). */
  private snapWireCursor(from: Point | null, raw: Point): Point {
    let x = snap(raw.x);
    let y = snap(raw.y);
    const d = this.nettled();
    let bestPin: { x: number; y: number; dist: number } | null = null;
    for (const c of d.components) {
      for (const name of Object.keys(c.pins)) {
        const p = pinWorldPos(c, name);
        if (!p) continue;
        const dist = Math.hypot(p.x - raw.x, p.y - raw.y);
        if (dist > 12) continue;
        if (!bestPin || dist < bestPin.dist) bestPin = { x: p.x, y: p.y, dist };
      }
    }
    if (bestPin) return { x: bestPin.x, y: bestPin.y };
    if (from) {
      const tee = nearestOrthogonalTee(
        from,
        this.wirePaths().map((w) => w.pts),
        { x, y },
        14
      );
      if (tee) return tee;
    }
    return { x, y };
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

  /** Short polarity / terminal labels when a part is selected. */
  pinDisplayName(modelKey: string, pin: string): string {
    if (pin === 'p') return '+';
    if (pin === 'n') return '−';
    if ((modelKey === 'led' || modelKey === 'diode' || modelKey === 'buzzer') && pin === 'a') return 'A';
    if ((modelKey === 'led' || modelKey === 'diode' || modelKey === 'buzzer') && pin === 'c') return 'K';
    if (modelKey === 'arduino_dio' && pin === 'sig') return 'IO';
    if (modelKey === 'arduino_dio' && pin === 'gnd') return 'GND';
    if (modelKey === 'arduino_i2c' && pin === 'v5') return '5V';
    if (modelKey === 'arduino_i2c' && pin === 'gnd') return 'GND';
    if (modelKey === 'arduino_i2c' && pin === 'scl') return 'SCL';
    if (modelKey === 'arduino_i2c' && pin === 'sda') return 'SDA';
    if (modelKey === 'ssd1306' && pin === 'vcc') return 'VCC';
    if (modelKey === 'ssd1306' && pin === 'gnd') return 'GND';
    if (modelKey === 'ssd1306' && pin === 'scl') return 'SCL';
    if (modelKey === 'ssd1306' && pin === 'sda') return 'SDA';
    if (modelKey === 'relay' && pin === 'cp') return '+';
    if (modelKey === 'relay' && pin === 'cn') return '−';
    if (modelKey === 'nmos' && pin === 'g') return 'G';
    if (modelKey === 'nmos' && pin === 'd') return 'D';
    if (modelKey === 'nmos' && pin === 's') return 'S';
    if (modelKey === 'ne555') {
      const map: Record<string, string> = {
        gnd: '1',
        trig: '2',
        out: '3',
        reset: '4',
        ctrl: '5',
        thr: '6',
        dis: '7',
        vcc: '8'
      };
      return map[pin] ?? pin;
    }
    return pin;
  }

  /** Offset pin label slightly outward from the component body. */
  pinLabelPos(c: SchematicComponent, pinName: string): { x: number; y: number } {
    const pos = this.pinPos(c, pinName);
    const dx = pos.x - c.x;
    const dy = pos.y - c.y;
    const len = Math.hypot(dx, dy) || 1;
    const out = 8 * symbolDisplayScale(c.modelKey) + 2;
    return { x: pos.x + (dx / len) * out, y: pos.y + (dy / len) * out };
  }

  partLabel(c: SchematicComponent) {
    return this.partLabelMap().get(c.id) ?? placeAllPartLabels([c]).get(c.id)!;
  }

  partMeas(c: SchematicComponent) {
    return placePartMeasurement(c, this.partLabel(c));
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
