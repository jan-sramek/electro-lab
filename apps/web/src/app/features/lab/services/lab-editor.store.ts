import { Injectable, computed, inject, signal } from '@angular/core';
import {
  AnalysisMode,
  EditorTool,
  SchematicComponent,
  SchematicDocument,
  SchematicWire,
  assignNets,
  createComponent,
  emptyDocument,
  nextId
} from '../data/schematic.model';
import { createLedPreset } from '../data/presets/led-series.preset';
import { createLedFadePreset } from '../data/presets/led-fade.preset';
import { createRcStepPreset } from '../data/presets/rc-step.preset';
import { createPotDividerPreset } from '../data/presets/pot-divider.preset';
import { createPulseRcPreset } from '../data/presets/pulse-rc.preset';
import { createDiodeDirectionPreset } from '../data/presets/diode-direction.preset';
import { createSeriesParallelPreset } from '../data/presets/series-parallel.preset';
import { createOpAmpBufferPreset } from '../data/presets/opamp-buffer.preset';
import { createOpAmpFollowerPreset } from '../data/presets/opamp-follower.preset';
import { createOpAmpNonInvPreset } from '../data/presets/opamp-noninv.preset';
import { createOpAmpComparatorPreset } from '../data/presets/opamp-comparator.preset';
import { createOpAmpSchmittPreset } from '../data/presets/opamp-schmitt.preset';
import { createOpAmpSummingPreset } from '../data/presets/opamp-summing.preset';
import { createOpAmpIntegratorPreset } from '../data/presets/opamp-integrator.preset';
import { createOpAmpDifferentiatorPreset } from '../data/presets/opamp-differentiator.preset';
import { createOpAmpActiveFilterPreset } from '../data/presets/opamp-active-filter.preset';
import { createAcRcPreset } from '../data/presets/ac-rc.preset';
import { createRcLowPassPreset } from '../data/presets/rc-low-pass.preset';
import { createRcHighPassPreset } from '../data/presets/rc-high-pass.preset';
import { createRlcSeriesPreset } from '../data/presets/rlc-series.preset';
import { createBandPassPreset } from '../data/presets/band-pass.preset';
import { createNotchFilterPreset } from '../data/presets/notch-filter.preset';
import { createVoltageDividerPreset } from '../data/presets/voltage-divider.preset';
import { createMeasureAcPreset } from '../data/presets/measure-ac.preset';
import { createMotorPwmPreset } from '../data/presets/motor-pwm.preset';
import { createHBridgePreset } from '../data/presets/h-bridge.preset';
import { createMotorDirectionPreset } from '../data/presets/motor-direction.preset';
import { createPullUpDownPreset } from '../data/presets/pull-up-down.preset';
import { createDebouncePreset } from '../data/presets/debounce.preset';
import { createNtcDividerPreset } from '../data/presets/ntc-divider.preset';
import { createPwmFilterPreset } from '../data/presets/pwm-filter.preset';
import { createRelayBjtPreset } from '../data/presets/relay-bjt.preset';
import { createEstopRelayPreset } from '../data/presets/estop-relay.preset';
import { createIndustrial24vPreset } from '../data/presets/industrial-24v.preset';
import { createBjtSwitchPreset } from '../data/presets/bjt-switch.preset';
import { createRelayDiodePreset } from '../data/presets/relay-diode.preset';
import { createNmosSwitchPreset } from '../data/presets/nmos-switch.preset';
import { createNe555AstablePreset } from '../data/presets/ne555-astable.preset';
import { createNe555ChristmasTreePreset } from '../data/presets/ne555-christmas-tree.preset';
import { createNe555PotBlinkPreset } from '../data/presets/ne555-pot-blink.preset';
import { createPushbuttonLedPreset } from '../data/presets/pushbutton-led.preset';
import { createLdrNightLightPreset } from '../data/presets/ldr-nightlight.preset';
import { createBuzzerButtonPreset } from '../data/presets/buzzer-button.preset';
import { createMotorNmosPreset } from '../data/presets/motor-nmos.preset';
import { createArduinoLedPreset } from '../data/presets/arduino-led.preset';
import { createI2cOledPreset } from '../data/presets/i2c-oled.preset';
import { createHalfWavePreset } from '../data/presets/half-wave.preset';
import { createBridgePreset } from '../data/presets/bridge.preset';
import { createFilterCapPreset } from '../data/presets/filter-cap.preset';
import { createZenerPreset } from '../data/presets/zener.preset';
import { createVreg7805Preset } from '../data/presets/vreg-7805.preset';
import { createReversePolarityPreset } from '../data/presets/reverse-polarity.preset';
import { createFuseProtectPreset } from '../data/presets/fuse-protect.preset';
import { createRipplePreset } from '../data/presets/ripple.preset';
import { createBuckPreset } from '../data/presets/buck.preset';
import { createBoostPreset } from '../data/presets/boost.preset';
import { ledColorById } from '../data/led-colors';
import { canBurnOut } from '../data/burnout';
import {
  CircuitSlot,
  SchematicHistory,
  SchematicPersistence,
  SlotSimState
} from './schematic-persistence';

export type ExamplePresetId =
  | 'led'
  | 'ledFade'
  | 'rc'
  | 'pot'
  | 'pulse'
  | 'diodeDirection'
  | 'seriesParallel'
  | 'opamp'
  | 'opampFollower'
  | 'opampNonInv'
  | 'opampComparator'
  | 'opampSchmitt'
  | 'opampSumming'
  | 'opampIntegrator'
  | 'opampDifferentiator'
  | 'opampActiveFilter'
  | 'ac'
  | 'bjt'
  | 'relay'
  | 'nmos'
  | 'ne555'
  | 'ne555Pot'
  | 'christmasTree'
  | 'pushbutton'
  | 'ldr'
  | 'buzzer'
  | 'motor'
  | 'arduino'
  | 'i2cOled'
  | 'halfWave'
  | 'bridge'
  | 'filterCap'
  | 'zener'
  | 'vreg7805'
  | 'reversePolarity'
  | 'fuseProtect'
  | 'ripple'
  | 'buck'
  | 'boost'
  | 'rcLowPass'
  | 'rcHighPass'
  | 'rlcSeries'
  | 'bandPass'
  | 'notchFilter'
  | 'voltageDivider'
  | 'measureAc'
  | 'motorPwm'
  | 'hBridge'
  | 'motorDirection'
  | 'pullUpDown'
  | 'debounce'
  | 'ntcDivider'
  | 'pwmFilter'
  | 'relayBjt'
  | 'estopRelay'
  | 'industrial24v';

export const EXAMPLE_PRESET_IDS: readonly ExamplePresetId[] = [
  'led',
  'ledFade',
  'rc',
  'pot',
  'pulse',
  'diodeDirection',
  'seriesParallel',
  'opamp',
  'opampFollower',
  'opampNonInv',
  'opampComparator',
  'opampSchmitt',
  'opampSumming',
  'opampIntegrator',
  'opampDifferentiator',
  'opampActiveFilter',
  'ac',
  'bjt',
  'relay',
  'nmos',
  'ne555',
  'ne555Pot',
  'christmasTree',
  'pushbutton',
  'ldr',
  'buzzer',
  'motor',
  'arduino',
  'i2cOled',
  'halfWave',
  'bridge',
  'filterCap',
  'zener',
  'vreg7805',
  'reversePolarity',
  'fuseProtect',
  'ripple',
  'buck',
  'boost',
  'rcLowPass',
  'rcHighPass',
  'rlcSeries',
  'bandPass',
  'notchFilter',
  'voltageDivider',
  'measureAc',
  'motorPwm',
  'hBridge',
  'motorDirection',
  'pullUpDown',
  'debounce',
  'ntcDivider',
  'pwmFilter',
  'relayBjt',
  'estopRelay',
  'industrial24v'
];

export function isExamplePresetId(value: string): value is ExamplePresetId {
  return (EXAMPLE_PRESET_IDS as readonly string[]).includes(value);
}

@Injectable()
export class LabEditorStore {
  private readonly persistence = inject(SchematicPersistence);
  private readonly history = new SchematicHistory();
  private dragHistoryPushed = false;
  private clipboard: SchematicDocument | null = null;

  readonly doc = signal<SchematicDocument>(createLedPreset());
  readonly tool = signal<EditorTool>('select');
  readonly placeModel = signal<string | null>(null);
  readonly selectedIds = signal<string[]>([]);
  readonly selectedWireIds = signal<string[]>([]);
  readonly probeTarget = signal<{ kind: 'net' | 'component'; id: string } | null>(null);
  readonly analysisMode = signal<AnalysisMode>('dcOp');
  readonly tStop = signal(0.005);
  readonly dt = signal(5e-5);
  /** Single-frequency AC analysis (Hz). */
  readonly acFreq = signal(1000);
  /** Transient: seed C/L from DC at t=0 (overrides params.ic). */
  readonly initFromDc = signal(false);
  readonly canUndo = signal(false);
  readonly canRedo = signal(false);
  readonly activeSlotId = signal<string | null>(null);
  readonly slots = signal<CircuitSlot[]>([]);
  /** Last loaded example circuit shown in the toolbar select. */
  readonly activeExamplePreset = signal<ExamplePresetId | null>(null);
  /** Learn path challenge — single isolated tab, empty canvas, no library side effects. */
  readonly learnChallengeMode = signal(false);
  readonly revision = signal(0);

  readonly selectedId = computed(() => {
    const ids = this.selectedIds();
    return ids.length === 1 ? ids[0] : null;
  });

  readonly selected = computed(() => {
    const id = this.selectedId();
    if (!id) return null;
    return this.doc().components.find((c) => c.id === id) ?? null;
  });

  initFromStorage(): void {
    const ensured = this.persistence.ensureLibrary(this.doc());
    this.doc.set(assignNets(ensured.doc));
    this.activeSlotId.set(ensured.activeId);
    this.applySlotSim(this.persistence.slotSim(ensured.activeId));
    this.refreshSlots(ensured.activeId);
    this.bump();
  }

  beginLearnChallenge(opts: {
    tabName: string;
    analysisMode: AnalysisMode;
    tStop?: number;
    dt?: number;
    acFreq?: number;
    initFromDc?: boolean;
  }): void {
    const slotId = 'learn-challenge';
    const doc = emptyDocument();
    const sim: SlotSimState = {
      analysisMode: opts.analysisMode,
      tStop: opts.tStop ?? 0.005,
      dt: opts.dt ?? 5e-5,
      acFreq: opts.acFreq ?? 1000,
      examplePreset: null,
      initFromDc: !!opts.initFromDc
    };
    this.persistence.beginIsolatedSession({
      id: slotId,
      name: opts.tabName,
      doc,
      updatedAt: Date.now(),
      pinned: true,
      sim
    });
    this.learnChallengeMode.set(true);
    this.history.clear();
    this.doc.set(assignNets(doc));
    this.activeSlotId.set(slotId);
    this.selectedIds.set([]);
    this.selectedWireIds.set([]);
    this.activeExamplePreset.set(null);
    this.applySlotSim(sim);
    this.syncHistoryFlags();
    this.refreshSlots(slotId);
    this.bump();
  }

  endLearnChallenge(): void {
    if (!this.learnChallengeMode()) return;
    this.persistence.endIsolatedSession();
    this.learnChallengeMode.set(false);
  }

  /** Persist current tab, then switch. */
  switchCircuitTab(id: string): void {
    if (id === this.activeSlotId()) return;
    this.persist();
    const doc = this.persistence.activate(id);
    if (!doc) return;
    this.history.clear();
    this.doc.set(assignNets(doc));
    this.activeSlotId.set(id);
    this.selectedIds.set([]);
    this.selectedWireIds.set([]);
    this.applySlotSim(this.persistence.slotSim(id));
    this.syncHistoryFlags();
    this.refreshSlots(id);
    this.bump();
  }

  addCircuitTab(): void {
    if (this.learnChallengeMode()) return;
    this.persist();
    const lib = this.persistence.loadLibrary();
    const name = this.persistence.nextDefaultName(lib.slots);
    this.history.clear();
    this.doc.set(emptyDocument());
    this.selectedIds.set([]);
    this.selectedWireIds.set([]);
    this.activeExamplePreset.set(null);
    this.analysisMode.set('dcOp');
    this.tStop.set(0.005);
    this.dt.set(5e-5);
    this.acFreq.set(1000);
    this.initFromDc.set(false);
    const sim = this.currentSimState();
    const id = this.persistence.saveAs(name, emptyDocument(), sim);
    this.activeSlotId.set(id);
    this.syncHistoryFlags();
    this.refreshSlots(id);
    this.bump();
  }

  closeCircuitTab(id: string): void {
    if (this.learnChallengeMode()) return;
    const lib = this.persistence.loadLibrary();
    const slot = lib.slots.find((s) => s.id === id);
    if (!slot || slot.pinned || lib.slots.length <= 1) return;
    if (id === this.activeSlotId()) this.persist();
    if (!this.persistence.deleteSlot(id)) return;
    this.activateAfterTabClose();
  }

  toggleCircuitTabPinned(id: string): void {
    const lib = this.persistence.loadLibrary();
    const slot = lib.slots.find((s) => s.id === id);
    if (!slot) return;
    this.persistence.setPinned(id, !slot.pinned);
    this.refreshSlots(this.activeSlotId());
  }

  /** Close other unpinned tabs; keep the active tab and all pinned. */
  closeOtherCircuitTabs(): void {
    const keepId = this.activeSlotId();
    if (!keepId) return;
    this.persist();
    const nextId = this.persistence.deleteOthers(keepId);
    if (!nextId) return;
    if (nextId !== keepId) {
      this.activateAfterTabClose(nextId);
    } else {
      this.refreshSlots(keepId);
      this.bump();
    }
  }

  /** Close all unpinned tabs (keeps pinned; always leaves ≥1 tab). */
  closeUnpinnedCircuitTabs(): void {
    this.persist();
    const nextId = this.persistence.deleteUnpinned();
    if (!nextId) return;
    this.activateAfterTabClose(nextId);
  }

  private activateAfterTabClose(preferredId?: string | null): void {
    const next = this.persistence.loadLibrary();
    const activeId = preferredId ?? next.activeId ?? next.slots[0]?.id ?? null;
    if (!activeId) return;
    const doc = this.persistence.activate(activeId);
    if (!doc) return;
    this.history.clear();
    this.doc.set(assignNets(doc));
    this.activeSlotId.set(activeId);
    this.selectedIds.set([]);
    this.selectedWireIds.set([]);
    this.applySlotSim(this.persistence.slotSim(activeId));
    this.syncHistoryFlags();
    this.refreshSlots(activeId);
    this.bump();
  }

  renameCircuitTab(id: string, name: string): void {
    this.persistence.rename(id, name);
    this.refreshSlots(this.activeSlotId());
  }

  saveNamedSlot(name: string): void {
    const id = this.persistence.saveAs(name, this.doc());
    this.refreshSlots(id);
  }

  loadSlot(id: string): void {
    this.switchCircuitTab(id);
  }

  refreshSlots(activeId?: string | null): void {
    const lib = this.persistence.loadLibrary();
    const slots = [...lib.slots].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
    this.slots.set(slots);
    this.activeSlotId.set(activeId !== undefined ? activeId : lib.activeId);
  }

  setTool(tool: EditorTool): void {
    this.tool.set(tool);
    if (tool !== 'place') this.placeModel.set(null);
    if (tool !== 'probe') this.probeTarget.set(null);
  }

  setAnalysisMode(mode: AnalysisMode): void {
    this.analysisMode.set(mode);
    this.persist();
    this.bump();
  }

  setTStop(raw: number | string): void {
    const v = Number(raw);
    if (!Number.isFinite(v) || v <= 0) return;
    this.tStop.set(v);
    this.persist();
    this.bump();
  }

  setDt(raw: number | string): void {
    const v = Number(raw);
    if (!Number.isFinite(v) || v <= 0) return;
    this.dt.set(v);
    this.persist();
    this.bump();
  }

  setAcFreq(raw: number | string): void {
    const v = Number(raw);
    if (!Number.isFinite(v) || v <= 0) return;
    this.acFreq.set(v);
    this.persist();
    this.bump();
  }

  setInitFromDc(value: boolean): void {
    this.initFromDc.set(!!value);
    this.persist();
    this.bump();
  }

  onPalettePlace(modelKey: string): void {
    this.placeModel.set(modelKey);
    this.tool.set('place');
  }

  onPlaceAt(pt: { x: number; y: number }): void {
    const model = this.placeModel();
    if (!model) return;
    this.placeModelAt(model, pt.x, pt.y);
  }

  placeModelAt(modelKey: string, x: number, y: number): void {
    this.commit((doc) => ({
      ...doc,
      components: [...doc.components, createComponent(modelKey, x, y)]
    }));
    this.setTool('select');
  }

  onDocChange(next: SchematicDocument): void {
    const prev = this.doc();
    const structural =
      prev.components.length !== next.components.length ||
      prev.wires.length !== next.wires.length ||
      prev.wires.some((w, i) => w.id !== next.wires[i]?.id);

    if (structural) {
      this.history.push(prev);
    } else {
      const moved = prev.components.some((c) => {
        const n = next.components.find((x) => x.id === c.id);
        return n && (n.x !== c.x || n.y !== c.y);
      });
      if (moved && !this.dragHistoryPushed) {
        this.history.push(prev);
        this.dragHistoryPushed = true;
      }
    }

    this.doc.set(assignNets(next));
    this.syncHistoryFlags();
    this.persist();
    this.bump();
  }

  onSelect(id: string | null, additive = false): void {
    this.dragHistoryPushed = false;
    if (!id) {
      this.selectedIds.set([]);
      return;
    }
    this.selectedWireIds.set([]);
    if (additive) {
      const cur = this.selectedIds();
      this.selectedIds.set(
        cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
      );
    } else {
      this.selectedIds.set([id]);
    }
  }

  /** Replace or union the component selection (marquee / box select). */
  setSelection(ids: string[], additive = false): void {
    this.dragHistoryPushed = false;
    this.selectedWireIds.set([]);
    if (additive) {
      const set = new Set([...this.selectedIds(), ...ids]);
      this.selectedIds.set([...set]);
    } else {
      this.selectedIds.set(ids);
    }
  }

  onSelectWire(id: string | null, additive = false): void {
    this.dragHistoryPushed = false;
    if (!id) {
      this.selectedWireIds.set([]);
      return;
    }
    this.selectedIds.set([]);
    if (additive) {
      const cur = this.selectedWireIds();
      this.selectedWireIds.set(
        cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
      );
    } else {
      this.selectedWireIds.set([id]);
    }
  }

  onProbe(target: { kind: 'net' | 'component'; id: string } | null): void {
    this.probeTarget.set(target);
  }

  onParamChange(ev: { key: string; value: number | boolean }): void {
    const id = this.selectedId();
    if (!id) return;
    this.commit((doc) => ({
      ...doc,
      components: doc.components.map((c) => {
        if (c.id !== id) return c;
        let params = { ...c.params, [ev.key]: ev.value };
        if (c.modelKey === 'led' && ev.key === 'color' && typeof ev.value === 'number') {
          params = { ...params, vf: ledColorById(ev.value).vf };
        }
        // Keep openAt/closeAt when toggling Closed — timeline still wins in the engine when set.
        return { ...c, params };
      })
    }));
  }

  /**
   * Momentary canvas press on a pushbutton (no undo noise).
   * Clears openAt/closeAt so interactive hold is not overridden by a tran timeline.
   */
  setPushbuttonPressed(id: string, pressed: boolean): void {
    const c = this.doc().components.find((x) => x.id === id);
    if (!c || c.modelKey !== 'pushbutton') return;
    const already = !!c.params['closed'] === pressed;
    const timelineOff =
      (typeof c.params['openAt'] !== 'number' || (c.params['openAt'] as number) < 0) &&
      (typeof c.params['closeAt'] !== 'number' || (c.params['closeAt'] as number) < 0);
    if (already && timelineOff) return;

    const next = assignNets({
      ...this.doc(),
      components: this.doc().components.map((x) =>
        x.id === id
          ? {
              ...x,
              params: {
                ...x.params,
                closed: pressed,
                openAt: -1,
                closeAt: -1
              }
            }
          : x
      )
    });
    this.doc.set(next);
    this.persist();
    this.bump();
  }

  /** Mark burnable parts as failed-open after overload (sticky until replaced). */
  markBurned(ids: string[]): void {
    const set = new Set(ids);
    const needs = this.doc().components.some(
      (c) => set.has(c.id) && canBurnOut(c.modelKey) && !c.params['burned']
    );
    if (!needs) return;
    this.commit((doc) => ({
      ...doc,
      components: doc.components.map((c) =>
        set.has(c.id) && canBurnOut(c.modelKey)
          ? { ...c, params: { ...c.params, burned: true } }
          : c
      )
    }));
  }

  /**
   * Clear burned flag — teaching “replace the part”.
   * Replacing a fuse also opens closed switches/pushbuttons so auto-sim does not
   * immediately overload the new fuse while the fault path is still engaged.
   * @returns true when fault switches were opened
   */
  replaceBurned(id: string): boolean {
    const c = this.doc().components.find((x) => x.id === id);
    if (!c || !canBurnOut(c.modelKey) || !c.params['burned']) return false;
    const clearFaultSwitches = c.modelKey === 'fuse';
    let cleared = false;
    this.commit((doc) => ({
      ...doc,
      components: doc.components.map((x) => {
        if (x.id === id) {
          return { ...x, params: { ...x.params, burned: false } };
        }
        if (
          clearFaultSwitches &&
          (x.modelKey === 'switch' || x.modelKey === 'pushbutton') &&
          x.params['closed'] === true
        ) {
          cleared = true;
          return {
            ...x,
            params: { ...x.params, closed: false, openAt: -1, closeAt: -1 }
          };
        }
        return x;
      })
    }));
    return cleared;
  }

  /** @deprecated Use markBurned */
  markLedsBurned(ids: string[]): void {
    this.markBurned(ids);
  }

  /** @deprecated Use markBurned */
  markBjtsBurned(ids: string[]): void {
    this.markBurned(ids);
  }

  /** @deprecated Use replaceBurned */
  replaceBjt(id: string): void {
    this.replaceBurned(id);
  }

  /** @deprecated Use replaceBurned */
  replaceLed(id: string): void {
    this.replaceBurned(id);
  }

  rotateSelected(): void {
    const ids = new Set(this.selectedIds());
    if (!ids.size) return;
    this.commit((doc) => ({
      ...doc,
      components: doc.components.map((c) => {
        if (!ids.has(c.id)) return c;
        const rotation = ((c.rotation + 90) % 360) as 0 | 90 | 180 | 270;
        return { ...c, rotation };
      })
    }));
  }

  deleteSelected(): void {
    const ids = new Set(this.selectedIds());
    const wireIds = new Set(this.selectedWireIds());
    if (!ids.size && !wireIds.size) return;
    this.commit((doc) => ({
      ...doc,
      components: doc.components.filter((c) => !ids.has(c.id)),
      wires: doc.wires.filter(
        (w) =>
          !wireIds.has(w.id) &&
          !ids.has(w.a.componentId) &&
          !ids.has(w.b.componentId)
      )
    }));
    this.selectedIds.set([]);
    this.selectedWireIds.set([]);
  }

  duplicateSelected(): void {
    const ids = this.selectedIds();
    if (!ids.length) return;
    const doc = this.doc();
    const idSet = new Set(ids);
    const map = new Map<string, string>();
    const copies: SchematicComponent[] = [];
    for (const c of doc.components) {
      if (!idSet.has(c.id)) continue;
      const copy = structuredClone(c) as SchematicComponent;
      const prefix = c.id.replace(/\d+$/, '') || 'X';
      copy.id = nextId(prefix);
      copy.x += 40;
      copy.y += 40;
      map.set(c.id, copy.id);
      copies.push(copy);
    }
    const wires: SchematicWire[] = doc.wires
      .filter((w) => idSet.has(w.a.componentId) && idSet.has(w.b.componentId))
      .map((w) => ({
        id: nextId('W'),
        a: { componentId: map.get(w.a.componentId)!, pin: w.a.pin },
        b: { componentId: map.get(w.b.componentId)!, pin: w.b.pin }
      }));
    this.commit((d) => ({
      ...d,
      components: [...d.components, ...copies],
      wires: [...d.wires, ...wires]
    }));
    this.selectedIds.set(copies.map((c) => c.id));
  }

  copySelected(): void {
    const ids = new Set(this.selectedIds());
    if (!ids.size) return;
    const doc = this.doc();
    this.clipboard = {
      groundNet: doc.groundNet,
      components: doc.components.filter((c) => ids.has(c.id)).map((c) => structuredClone(c)),
      wires: doc.wires
        .filter((w) => ids.has(w.a.componentId) && ids.has(w.b.componentId))
        .map((w) => structuredClone(w))
    };
  }

  pasteClipboard(): void {
    const clip = this.clipboard;
    if (!clip?.components.length) return;
    const map = new Map<string, string>();
    const copies: SchematicComponent[] = clip.components.map((c) => {
      const copy = structuredClone(c) as SchematicComponent;
      const prefix = c.id.replace(/\d+$/, '') || 'X';
      copy.id = nextId(prefix);
      copy.x += 40;
      copy.y += 40;
      map.set(c.id, copy.id);
      return copy;
    });
    const wires: SchematicWire[] = clip.wires.map((w) => ({
      id: nextId('W'),
      a: { componentId: map.get(w.a.componentId)!, pin: w.a.pin },
      b: { componentId: map.get(w.b.componentId)!, pin: w.b.pin }
    }));
    this.commit((d) => ({
      ...d,
      components: [...d.components, ...copies],
      wires: [...d.wires, ...wires]
    }));
    this.selectedIds.set(copies.map((c) => c.id));
  }

  exportJson(): void {
    const blob = new Blob([JSON.stringify(this.doc(), null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `electro-lab-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importJson(file: File): Promise<void> {
    const text = await file.text();
    const parsed = JSON.parse(text) as SchematicDocument;
    if (!parsed?.components || !Array.isArray(parsed.components)) {
      throw new Error('Invalid schematic JSON');
    }
    this.commit(() =>
      assignNets({
        groundNet: parsed.groundNet || 'gnd',
        components: parsed.components,
        wires: parsed.wires ?? []
      })
    );
    this.selectedIds.set([]);
    this.selectedWireIds.set([]);
    this.activeExamplePreset.set(null);
  }

  loadLedPreset(): void {
    this.openExampleInNewTab('led', 'LED series', createLedPreset, 'dcOp');
  }

  loadLedFadePreset(): void {
    this.openExampleInNewTab('ledFade', 'LED fade', createLedFadePreset, 'tran', 6.0, 0.002);
    this.probeTarget.set({ kind: 'component', id: 'D1' });
    this.selectedIds.set(['S1']);
  }

  loadRcPreset(): void {
    this.openExampleInNewTab('rc', 'RC charge', createRcStepPreset, 'tran', 0.005, 5e-5);
  }

  loadPotPreset(): void {
    this.openExampleInNewTab('pot', 'Pot divider', createPotDividerPreset, 'dcOp');
  }

  loadPulsePreset(): void {
    this.openExampleInNewTab('pulse', 'Pulse RC', createPulseRcPreset, 'tran', 0.01, 5e-5);
  }

  loadDiodeDirectionPreset(): void {
    this.openExampleInNewTab('diodeDirection', 'Diode direction', createDiodeDirectionPreset, 'dcOp');
  }

  loadSeriesParallelPreset(): void {
    this.openExampleInNewTab('seriesParallel', 'Series vs parallel', createSeriesParallelPreset, 'dcOp');
  }

  loadOpAmpPreset(): void {
    this.openExampleInNewTab('opamp', 'Op-amp invert', createOpAmpBufferPreset, 'dcOp');
  }

  loadOpAmpFollowerPreset(): void {
    this.openExampleInNewTab('opampFollower', 'Op-amp follower', createOpAmpFollowerPreset, 'dcOp');
  }

  loadOpAmpNonInvPreset(): void {
    this.openExampleInNewTab('opampNonInv', 'Op-amp non-inv', createOpAmpNonInvPreset, 'dcOp');
  }

  loadOpAmpComparatorPreset(): void {
    this.openExampleInNewTab('opampComparator', 'Op-amp comparator', createOpAmpComparatorPreset, 'dcOp');
  }

  loadOpAmpSchmittPreset(): void {
    this.openExampleInNewTab('opampSchmitt', 'Op-amp Schmitt', createOpAmpSchmittPreset, 'dcOp');
  }

  loadOpAmpSummingPreset(): void {
    this.openExampleInNewTab('opampSumming', 'Op-amp summing', createOpAmpSummingPreset, 'dcOp');
  }

  loadOpAmpIntegratorPreset(): void {
    this.openExampleInNewTab(
      'opampIntegrator',
      'Op-amp integrator',
      createOpAmpIntegratorPreset,
      'tran',
      0.03,
      5e-5
    );
  }

  loadOpAmpDifferentiatorPreset(): void {
    this.openExampleInNewTab(
      'opampDifferentiator',
      'Op-amp differentiator',
      createOpAmpDifferentiatorPreset,
      'tran',
      0.03,
      5e-5
    );
  }

  loadOpAmpActiveFilterPreset(): void {
    this.openExampleInNewTab(
      'opampActiveFilter',
      'Op-amp active LPF',
      createOpAmpActiveFilterPreset,
      'ac',
      undefined,
      undefined,
      1000
    );
  }

  loadAcPreset(): void {
    this.openExampleInNewTab('ac', 'AC low-pass', createAcRcPreset, 'ac', undefined, undefined, 1000);
  }

  loadBjtPreset(): void {
    this.openExampleInNewTab('bjt', 'BC547 LED switch', createBjtSwitchPreset, 'dcOp');
  }

  loadRelayPreset(): void {
    this.openExampleInNewTab('relay', 'Relay + diode', createRelayDiodePreset, 'dcOp');
  }

  loadNmosPreset(): void {
    this.openExampleInNewTab('nmos', 'NMOS LED switch', createNmosSwitchPreset, 'dcOp');
  }

  loadNe555Preset(): void {
    this.openExampleInNewTab('ne555', 'NE555 astable', createNe555AstablePreset, 'tran', 0.1, 5e-5);
  }

  loadNe555PotBlinkPreset(): void {
    this.openExampleInNewTab(
      'ne555Pot',
      'NE555 pot blink',
      createNe555PotBlinkPreset,
      'tran',
      0.5,
      2e-4
    );
  }

  loadChristmasTreePreset(): void {
    this.openExampleInNewTab(
      'christmasTree',
      'NE555 Christmas tree',
      createNe555ChristmasTreePreset,
      'tran',
      0.1,
      5e-5
    );
  }

  loadPushbuttonPreset(): void {
    this.openExampleInNewTab('pushbutton', 'Pushbutton LED', createPushbuttonLedPreset, 'dcOp');
  }

  loadLdrPreset(): void {
    this.openExampleInNewTab('ldr', 'LDR night-light', createLdrNightLightPreset, 'dcOp');
  }

  loadBuzzerPreset(): void {
    this.openExampleInNewTab('buzzer', 'Buzzer + button', createBuzzerButtonPreset, 'dcOp');
  }

  loadMotorPreset(): void {
    this.openExampleInNewTab('motor', 'NMOS + DC motor', createMotorNmosPreset, 'dcOp');
  }

  loadArduinoPreset(): void {
    this.openExampleInNewTab('arduino', 'Arduino LED', createArduinoLedPreset, 'dcOp');
  }

  loadI2cOledPreset(): void {
    this.openExampleInNewTab('i2cOled', 'I2C OLED', createI2cOledPreset, 'dcOp');
  }

  loadHalfWavePreset(): void {
    this.openExampleInNewTab('halfWave', 'Half-wave rectifier', createHalfWavePreset, 'tran', 0.08, 2e-4);
  }

  loadBridgePreset(): void {
    this.openExampleInNewTab('bridge', 'Bridge rectifier', createBridgePreset, 'tran', 0.08, 2e-4);
  }

  loadFilterCapPreset(): void {
    this.openExampleInNewTab('filterCap', 'Filter capacitor', createFilterCapPreset, 'tran', 0.12, 2e-4);
  }

  loadZenerPreset(): void {
    this.openExampleInNewTab('zener', 'Zener regulator', createZenerPreset, 'dcOp');
  }

  loadVreg7805Preset(): void {
    this.openExampleInNewTab('vreg7805', '7805 regulator', createVreg7805Preset, 'dcOp');
  }

  loadReversePolarityPreset(): void {
    this.openExampleInNewTab(
      'reversePolarity',
      'Reverse-polarity diode',
      createReversePolarityPreset,
      'dcOp'
    );
  }

  loadFuseProtectPreset(): void {
    this.openExampleInNewTab('fuseProtect', 'Fuse protection', createFuseProtectPreset, 'dcOp');
  }

  loadRipplePreset(): void {
    this.openExampleInNewTab('ripple', 'Ripple measurement', createRipplePreset, 'tran', 0.12, 2e-4);
  }

  loadBuckPreset(): void {
    this.openExampleInNewTab('buck', 'Buck converter', createBuckPreset, 'tran', 0.01, 2e-5);
  }

  loadBoostPreset(): void {
    this.openExampleInNewTab('boost', 'Boost converter', createBoostPreset, 'tran', 0.01, 2e-5);
  }

  loadRcLowPassPreset(): void {
    this.openExampleInNewTab('rcLowPass', 'RC low-pass', createRcLowPassPreset, 'ac', undefined, undefined, 1000);
  }

  loadRcHighPassPreset(): void {
    this.openExampleInNewTab('rcHighPass', 'RC high-pass', createRcHighPassPreset, 'ac', undefined, undefined, 1000);
  }

  loadRlcSeriesPreset(): void {
    this.openExampleInNewTab('rlcSeries', 'RLC series', createRlcSeriesPreset, 'ac', undefined, undefined, 1000);
  }

  loadBandPassPreset(): void {
    this.openExampleInNewTab('bandPass', 'Band-pass', createBandPassPreset, 'ac', undefined, undefined, 1000);
  }

  loadNotchFilterPreset(): void {
    this.openExampleInNewTab('notchFilter', 'Notch filter', createNotchFilterPreset, 'ac', undefined, undefined, 1000);
  }

  loadVoltageDividerPreset(): void {
    this.openExampleInNewTab('voltageDivider', 'Voltage divider', createVoltageDividerPreset, 'dcOp');
  }

  loadMeasureAcPreset(): void {
    this.openExampleInNewTab('measureAc', 'Measure AC', createMeasureAcPreset, 'ac', undefined, undefined, 1000);
  }

  loadMotorPwmPreset(): void {
    this.openExampleInNewTab('motorPwm', 'Motor PWM', createMotorPwmPreset, 'tran', 0.01, 2e-5);
  }

  loadHBridgePreset(): void {
    this.openExampleInNewTab('hBridge', 'H-bridge', createHBridgePreset, 'dcOp');
  }

  loadMotorDirectionPreset(): void {
    this.openExampleInNewTab('motorDirection', 'Motor reverse', createMotorDirectionPreset, 'dcOp');
  }

  loadPullUpDownPreset(): void {
    this.openExampleInNewTab('pullUpDown', 'Pull-up / pull-down', createPullUpDownPreset, 'dcOp');
  }

  loadDebouncePreset(): void {
    this.openExampleInNewTab('debounce', 'RC debounce', createDebouncePreset, 'dcOp');
  }

  loadNtcDividerPreset(): void {
    this.openExampleInNewTab('ntcDivider', 'NTC divider', createNtcDividerPreset, 'dcOp');
  }

  loadPwmFilterPreset(): void {
    this.openExampleInNewTab('pwmFilter', 'PWM filter (DAC)', createPwmFilterPreset, 'tran', 0.02, 5e-5);
  }

  loadRelayBjtPreset(): void {
    this.openExampleInNewTab('relayBjt', 'Relay + BJT', createRelayBjtPreset, 'dcOp');
  }

  loadEstopRelayPreset(): void {
    this.openExampleInNewTab('estopRelay', 'E-stop relay', createEstopRelayPreset, 'dcOp');
  }

  loadIndustrial24vPreset(): void {
    this.openExampleInNewTab('industrial24v', '24 V control', createIndustrial24vPreset, 'dcOp');
  }

  newSchematic(): void {
    if (this.learnChallengeMode()) return;
    if (typeof window !== 'undefined' && !window.confirm('Clear the current schematic?')) {
      return;
    }
    this.commit(() => emptyDocument());
    this.selectedIds.set([]);
    this.selectedWireIds.set([]);
    this.activeExamplePreset.set(null);
    this.persistence.clear();
  }

  undo(): void {
    const prev = this.history.undo(this.doc());
    if (!prev) return;
    this.doc.set(assignNets(prev));
    this.syncHistoryFlags();
    this.persist();
    this.bump();
  }

  redo(): void {
    const next = this.history.redo(this.doc());
    if (!next) return;
    this.doc.set(assignNets(next));
    this.syncHistoryFlags();
    this.persist();
    this.bump();
  }

  escape(): void {
    this.setTool('select');
    this.selectedIds.set([]);
    this.selectedWireIds.set([]);
    this.probeTarget.set(null);
  }

  /** Open an example circuit in a new tab so the current tab is preserved. */
  private openExampleInNewTab(
    presetId: ExamplePresetId,
    tabName: string,
    factory: () => SchematicDocument,
    mode: AnalysisMode,
    tStop?: number,
    dt?: number,
    acFreq?: number
  ): void {
    this.persist();
    const doc = assignNets(factory());
    const sim: SlotSimState = {
      analysisMode: mode,
      tStop: tStop ?? this.tStop(),
      dt: dt ?? this.dt(),
      acFreq: acFreq ?? this.acFreq(),
      examplePreset: presetId,
      initFromDc: false
    };
    const id = this.persistence.saveAs(tabName, doc, sim);
    this.history.clear();
    this.doc.set(doc);
    this.activeSlotId.set(id);
    this.selectedIds.set([]);
    this.selectedWireIds.set([]);
    this.applySlotSim(sim);
    this.syncHistoryFlags();
    this.refreshSlots(id);
    this.bump();
  }

  private applySlotSim(sim: SlotSimState | undefined): void {
    if (!sim) {
      this.activeExamplePreset.set(null);
      this.analysisMode.set('dcOp');
      this.tStop.set(0.005);
      this.dt.set(5e-5);
      this.acFreq.set(1000);
      this.initFromDc.set(false);
      return;
    }
    this.analysisMode.set(sim.analysisMode);
    this.tStop.set(sim.tStop);
    this.dt.set(sim.dt);
    this.acFreq.set(sim.acFreq);
    this.initFromDc.set(!!sim.initFromDc);
    const p = sim.examplePreset;
    if (p && isExamplePresetId(p)) {
      this.activeExamplePreset.set(p);
    } else {
      this.activeExamplePreset.set(null);
    }
  }

  private currentSimState(): SlotSimState {
    return {
      analysisMode: this.analysisMode(),
      tStop: this.tStop(),
      dt: this.dt(),
      acFreq: this.acFreq(),
      examplePreset: this.activeExamplePreset(),
      initFromDc: this.initFromDc()
    };
  }

  private commit(mutator: (doc: SchematicDocument) => SchematicDocument): void {
    const prev = this.doc();
    this.history.push(prev);
    const next = assignNets(mutator(prev));
    this.doc.set(next);
    this.syncHistoryFlags();
    this.persist();
    this.bump();
  }

  private persist(): void {
    this.persistence.save(this.doc(), this.activeSlotId(), this.currentSimState());
  }

  private syncHistoryFlags(): void {
    this.canUndo.set(this.history.canUndo());
    this.canRedo.set(this.history.canRedo());
  }

  private bump(): void {
    this.revision.update((n) => n + 1);
  }
}
