import { SchematicDocument, assignNets } from './schematic.model';
import { SimulateResponse } from '../api/circuit-api.types';
import { SchematicPersistence } from '../services/schematic-persistence';
import { extractEnergyState, extractChargedCapState, extractEnergyStateAtIndex, TranEnergyState } from './tran-continuation';
import { allEnergyPathsClosed } from './switch-state';
import {
  capacitorStorageKey,
  energyTopologyFingerprint,
  inductorStorageKey
} from './circuit-topology';

function toStorageState(doc: SchematicDocument, byId: TranEnergyState): TranEnergyState {
  const nettled = assignNets(doc);
  const caps = new Map<string, number>();
  const inductors = new Map<string, number>();

  for (const c of nettled.components) {
    if (c.modelKey === 'capacitor') {
      const key = capacitorStorageKey(c);
      const v = byId.caps.get(c.id);
      if (key && v !== undefined) caps.set(key, v);
    }
    if (c.modelKey === 'inductor') {
      const key = inductorStorageKey(c);
      const i = byId.inductors.get(c.id);
      if (key && i !== undefined) inductors.set(key, i);
    }
  }
  return { caps, inductors };
}

function toComponentState(doc: SchematicDocument, stored: TranEnergyState): TranEnergyState {
  const nettled = assignNets(doc);
  const caps = new Map<string, number>();
  const inductors = new Map<string, number>();

  for (const c of nettled.components) {
    if (c.modelKey === 'capacitor') {
      const key = capacitorStorageKey(c);
      const v = key ? stored.caps.get(key) : undefined;
      if (key && v !== undefined) caps.set(c.id, v);
    }
    if (c.modelKey === 'inductor') {
      const key = inductorStorageKey(c);
      const i = key ? stored.inductors.get(key) : undefined;
      if (key && i !== undefined) inductors.set(c.id, i);
    }
  }
  return { caps, inductors };
}

/** Persisted C/L initial conditions between transient runs (charge, discharge, re-charge). */
export class EnergyStateStore {
  private fingerprint = '';
  private state: TranEnergyState = { caps: new Map(), inductors: new Map() };

  /** @param onChange invoked after every mutation so signal-based consumers can re-derive. */
  constructor(private readonly onChange?: () => void) {}

  maxCapVoltageAbs(): number {
    let best = 0;
    for (const v of this.state.caps.values()) {
      const abs = Math.abs(v);
      if (abs > best) best = abs;
    }
    return best;
  }

  hasSeed(): boolean {
    return this.state.caps.size > 0 || this.state.inductors.size > 0;
  }

  fingerprintMatches(doc: SchematicDocument): boolean {
    return !!this.fingerprint && this.fingerprint === energyTopologyFingerprint(doc);
  }

  /** Seed for the first segment of a transient (caps + inductors), keyed by component id. */
  seedForRun(doc: SchematicDocument): TranEnergyState | null {
    if (!this.fingerprintMatches(doc) || !this.hasSeed()) return null;
    return toComponentState(doc, this.state);
  }

  /**
   * Seed injected into the engine — only when the discharge path is open.
   * Closed-switch charge runs always start caps at 0 V so charging current is visible.
   */
  seedForDischargeRun(doc: SchematicDocument): TranEnergyState | null {
    if (allEnergyPathsClosed(doc)) return null;
    if (this.maxCapVoltageAbs() < 0.05) return null;
    return this.seedForRun(doc);
  }

  capture(doc: SchematicDocument, res: SimulateResponse): void {
    if (!res.ok || !res.tran?.time?.length) return;
    this.fingerprint = energyTopologyFingerprint(doc);
    this.state = toStorageState(doc, extractEnergyState(doc, res));
    this.onChange?.();
  }

  /** Snapshot peak charged Vc before opening the switch for discharge seeding. */
  captureChargePrior(doc: SchematicDocument, res: SimulateResponse): void {
    if (!res.ok || !res.tran?.time?.length) return;
    this.fingerprint = energyTopologyFingerprint(doc);
    this.state = toStorageState(doc, extractChargedCapState(doc, res));
    this.onChange?.();
  }

  /** Snapshot Vc at the current scrub frame before a mid-discharge re-solve. */
  captureAtIndex(doc: SchematicDocument, res: SimulateResponse, idx: number): void {
    if (!res.ok || !res.tran?.time?.length) return;
    this.fingerprint = energyTopologyFingerprint(doc);
    this.state = toStorageState(doc, extractEnergyStateAtIndex(doc, res, idx));
    this.onChange?.();
  }

  clear(): void {
    this.fingerprint = '';
    this.state = { caps: new Map(), inductors: new Map() };
    this.onChange?.();
  }

  clearIfStale(doc: SchematicDocument): void {
    const fp = energyTopologyFingerprint(doc);
    if (this.fingerprint && this.fingerprint !== fp) this.clear();
  }

  syncSlot(doc: SchematicDocument, slotId: string | null, persistence: SchematicPersistence): void {
    const fp = energyTopologyFingerprint(doc);
    const saved = persistence.loadCapIc();
    if (saved && slotId && saved.slotId === slotId && saved.fingerprint === fp) {
      this.fingerprint = saved.fingerprint;
      this.state = {
        caps: new Map(Object.entries(saved.voltages)),
        inductors: new Map()
      };
      this.onChange?.();
      return;
    }
    if (this.fingerprint && this.fingerprint !== fp) this.clear();
  }

  persist(slotId: string | null, persistence: SchematicPersistence): void {
    if (!slotId || !this.fingerprint || !this.state.caps.size) {
      persistence.clearCapIc();
      return;
    }
    const voltages: Record<string, number> = {};
    for (const [key, v] of this.state.caps) voltages[key] = v;
    persistence.saveCapIc({ slotId, fingerprint: this.fingerprint, voltages });
  }
}
