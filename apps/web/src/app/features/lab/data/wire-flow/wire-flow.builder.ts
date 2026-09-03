import { SchematicDocument, SchematicWire } from '../schematic.model';
import { routeAllWirePolylines } from '../wire-routing';
import { polylineToPath } from '../schematic.model';
import { BranchCurrentLookup, WireRenderPath } from './wire-flow.model';
import { WireCurrentField } from './wire-current-field';
import { WireFlowPresenter } from './wire-flow.presenter';

/**
 * Builds canvas wire paths + flow overlays from a netlisted doc and branch currents.
 */
export class WireFlowBuilder {
  static build(
    doc: SchematicDocument,
    live: boolean,
    currentOf: BranchCurrentLookup
  ): WireRenderPath[] {
    const field = live
      ? new WireCurrentField(doc.components, doc.wires, currentOf).solve()
      : null;

    const routed = routeAllWirePolylines(doc);
    return doc.wires
      .map((w) => WireFlowBuilder.renderWire(w, routed.get(w.id) ?? [], field))
      .filter((r): r is WireRenderPath => r !== null);
  }

  private static renderWire(
    w: SchematicWire,
    pts: { x: number; y: number }[],
    field: ReadonlyMap<string, number> | null
  ): WireRenderPath | null {
    if (pts.length < 2) return null;

    const iAlong = field?.get(w.id) ?? 0;
    const flow = field ? WireFlowPresenter.overlay(pts, iAlong) : null;

    return {
      id: w.id,
      d: polylineToPath(pts),
      pts,
      flow
    };
  }
}
