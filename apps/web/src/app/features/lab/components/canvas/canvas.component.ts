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
import { SimulateResponse } from '../../api/circuit-api.types';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

interface DragState {
  id: string;
  ox: number;
  oy: number;
}

@Component({
  selector: 'app-schematic-canvas',
  standalone: true,
  imports: [DecimalPipe, TranslatePipe],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class SchematicCanvasComponent {
  readonly doc = input.required<SchematicDocument>();
  readonly tool = input.required<EditorTool>();
  readonly placeModel = input<string | null>(null);
  readonly selectedId = input<string | null>(null);
  readonly result = input<SimulateResponse | null>(null);
  readonly probeTarget = input<{ kind: 'net' | 'component'; id: string } | null>(null);
  readonly highlightedIds = input<string[]>([]);
  readonly highlightedNets = input<string[]>([]);

  readonly docChange = output<SchematicDocument>();
  readonly select = output<string | null>();
  readonly probe = output<{ kind: 'net' | 'component'; id: string } | null>();
  readonly placeAt = output<{ x: number; y: number }>();

  readonly wireFrom = signal<PinRef | null>(null);
  readonly lib = SYMBOL_LIBRARY;

  /** viewBox: x y w h */
  readonly view = signal({ x: 0, y: 0, w: 720, h: 400 });
  private pan: { x0: number; y0: number; vx: number; vy: number } | null = null;
  private drag: DragState | null = null;

  readonly nettled = computed(() => assignNets(this.doc()));

  readonly viewBox = computed(() => {
    const v = this.view();
    return `${v.x} ${v.y} ${v.w} ${v.h}`;
  });

  readonly wirePaths = computed(() => {
    const d = this.nettled();
    const out: {
      id: string;
      d: string;
      pts: { x: number; y: number }[];
    }[] = [];
    for (const w of d.wires) {
      const a = this.endpoint(d, w.a);
      const b = this.endpoint(d, w.b);
      if (!a || !b) continue;
      const pts = orthogonalPolyline(a.x, a.y, b.x, b.y);
      out.push({ id: w.id, d: polylineToPath(pts), pts });
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
      this.select.emit(null);
      this.probe.emit(null);
    }
    if (this.tool() === 'wire') {
      this.wireFrom.set(null);
    }
  }

  onBackgroundPointerMove(ev: PointerEvent): void {
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
    if (this.pan) {
      try {
        (ev.currentTarget as Element).releasePointerCapture(ev.pointerId);
      } catch {
        /* ignore */
      }
    }
    this.pan = null;
  }

  onSymbolPointerDown(ev: PointerEvent, c: SchematicComponent): void {
    ev.stopPropagation();
    const tool = this.tool();

    if (tool === 'probe') {
      this.select.emit(c.id);
      this.probe.emit({ kind: 'component', id: c.id });
      return;
    }
    if (tool === 'wire' || tool === 'place') return;

    this.select.emit(c.id);
    const svg = (ev.currentTarget as SVGElement).ownerSVGElement!;
    const pt = this.clientToSvg(svg, ev.clientX, ev.clientY);
    this.drag = { id: c.id, ox: pt.x - c.x, oy: pt.y - c.y };
    (ev.currentTarget as Element).setPointerCapture(ev.pointerId);
  }

  onSymbolPointerMove(ev: PointerEvent): void {
    if (!this.drag) return;
    const svg = (ev.currentTarget as SVGElement).ownerSVGElement!;
    const pt = this.clientToSvg(svg, ev.clientX, ev.clientY);
    const x = snap(pt.x - this.drag.ox);
    const y = snap(pt.y - this.drag.oy);
    const id = this.drag.id;
    this.docChange.emit({
      ...this.doc(),
      components: this.doc().components.map((c) => (c.id === id ? { ...c, x, y } : c))
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
      this.select.emit(componentId);
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
      return;
    }
    if (this.wireExists(from, ref)) {
      this.wireFrom.set(null);
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
  }

  onWireClick(ev: MouseEvent, wireId: string): void {
    ev.stopPropagation();
    const tool = this.tool();

    if (tool === 'wire') {
      const path = this.wirePaths().find((w) => w.id === wireId);
      if (!path) return;
      const svg = (ev.currentTarget as SVGElement).ownerSVGElement!;
      const pt = this.clientToSvg(svg, ev.clientX, ev.clientY);
      const hit = closestPointOnOrthogonalWire(pt.x, pt.y, path.pts);
      if (!hit) return;
      const junction = createComponent('junction', hit.x, hit.y);
      let next = {
        ...this.doc(),
        components: [...this.doc().components, junction]
      };
      next = splitWireAtJunction(next, wireId, junction.id);
      this.docChange.emit(next);
      this.wireFrom.set({ componentId: junction.id, pin: 'j' });
      return;
    }

    if (tool !== 'select') return;
    this.docChange.emit({
      ...this.doc(),
      wires: this.doc().wires.filter((w) => w.id !== wireId)
    });
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
      const last = s?.values.at(-1);
      return typeof last === 'number' ? last : null;
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
      const last = s?.values.at(-1);
      return typeof last === 'number' ? last : null;
    }
    return null;
  }

  ledOn(id: string): boolean {
    const i = this.currentOf(id);
    return typeof i === 'number' && i > 1e-6;
  }

  pinPos(c: SchematicComponent, pinName: string): { x: number; y: number } {
    return pinWorldPos(c, pinName) ?? { x: c.x, y: c.y };
  }

  isSelected(id: string): boolean {
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
