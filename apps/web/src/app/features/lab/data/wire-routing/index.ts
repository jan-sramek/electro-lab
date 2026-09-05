/**
 * Functional orthogonal wire routing for the teaching Lab.
 *
 * Intent (mouse motion / axis lock) picks which two sides of the pin→target
 * rectangle to follow so squared circuits are drawable.
 */
export type { Point, PreferAxis, RouteOptions, RouteShape, RoutingIntent, WireSegment } from './types';

export {
  collinearOverlap,
  distanceToPolyline,
  distanceToSegment,
  dedupePoints,
  firstLegAxis,
  pathLength,
  polylineSegments,
  routeOverlapLength,
  simpleElbow
} from './geometry';

export {
  inferRoutingIntent,
  motionPrimaryAxis,
  spanPrimaryAxis,
  updateAxisLock
} from './intent';

export { buildCandidates, candidateElbows } from './candidates';
export { pickBestCandidate, scoreCandidate } from './score';
export { routeOrthogonal, usableWaypoints } from './route';
export { nearestOrthogonalTee, orthogonalTeeOnPolyline } from './tee';

export {
  SYMBOL_DISPLAY_SCALE,
  clearWireWaypoints,
  documentWireObstacles,
  pinExitDirection,
  routeAllWirePolylines,
  scaledPinWorldPos,
  symbolDisplayScale,
  symbolDisplaySize,
  wirePolyline,
  withWireWaypoint
} from './document';

/** @deprecated Use spanPrimaryAxis / inferRoutingIntent — kept for older tests. */
export { spanPrimaryAxis as inferPreferAxis } from './intent';
