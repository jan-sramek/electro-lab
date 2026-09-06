import { Point } from '../wire-routing';

/** Amperes along a wire from endpoint A toward B. */
export type WireCurrentMap = ReadonlyMap<string, number>;

export interface WireFlowOverlay {
  path: string;
  periodMs: number;
  strength: number;
  /** Magnitude used for visibility threshold checks. */
  amps: number;
  /** SVG stroke-dasharray — shortened on stubs so part of the wire is always lit. */
  dash: string;
}

export interface WireRenderPath {
  id: string;
  d: string;
  pts: Point[];
  flow: WireFlowOverlay | null;
}

export type BranchCurrentLookup = (componentId: string) => number | null;
