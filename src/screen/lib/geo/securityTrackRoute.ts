import lineGeoJsonText from '../../../mapdata/line.geojson?raw';
import evacuationGeoJsonText from '../../../mapdata/疏散路径.geojson?raw';
import {
  buildEvacuationRouteFromGeoJson,
  extractEvacuationLinesFromGeoJson,
} from './evacuationRoute';
import type { RescueRouteWaypoint } from '../data/accidentRescueMock';
import type { SecurityTrackMode } from '../data/securityTrackMock';

export interface SecurityTrackWaypointsConfig {
  points: RescueRouteWaypoint[];
  initialProgress: number;
  endProgress: number;
  durationMs: number;
}

const ENDPOINT_MATCH_METERS = 3;

function haversineMeters(a: RescueRouteWaypoint, b: RescueRouteWaypoint): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(Math.max(0, Math.min(1, s))));
}

function nearPoint(a: RescueRouteWaypoint, b: RescueRouteWaypoint): boolean {
  return haversineMeters(a, b) <= ENDPOINT_MATCH_METERS;
}

function dedupeRoutePoints(points: RescueRouteWaypoint[]): RescueRouteWaypoint[] {
  const out: RescueRouteWaypoint[] = [];
  for (const point of points) {
    const prev = out[out.length - 1];
    if (!prev || haversineMeters(prev, point) > 0.5) {
      out.push(point);
    }
  }
  return out;
}

function mergeEvacuationNetwork(): RescueRouteWaypoint[] {
  const lines = extractEvacuationLinesFromGeoJson(JSON.parse(evacuationGeoJsonText));
  if (!lines.length) return [];

  const remaining = [...lines].sort((a, b) => b.lengthMeters - a.lengthMeters);
  let path = [...remaining.shift()!.positions];
  let changed = true;

  while (changed && remaining.length) {
    changed = false;
    for (let i = remaining.length - 1; i >= 0; i -= 1) {
      const seg = remaining[i]!.positions;
      if (seg.length < 2) continue;

      const head = path[0]!;
      const tail = path[path.length - 1]!;
      const s0 = seg[0]!;
      const s1 = seg[seg.length - 1]!;

      if (nearPoint(tail, s0)) {
        path = [...path, ...seg.slice(1)];
        remaining.splice(i, 1);
        changed = true;
      } else if (nearPoint(tail, s1)) {
        path = [...path, ...seg.slice(0, -1).reverse()];
        remaining.splice(i, 1);
        changed = true;
      } else if (nearPoint(head, s1)) {
        path = [...seg.slice(0, -1), ...path];
        remaining.splice(i, 1);
        changed = true;
      } else if (nearPoint(head, s0)) {
        path = [...seg.slice(1).reverse(), ...path];
        remaining.splice(i, 1);
        changed = true;
      }
    }
  }

  return dedupeRoutePoints(path);
}

/** 主通道 line.geojson + 厂内疏散路网合并，取点位更完整的一条 */
function buildRoadNetworkRoute(): RescueRouteWaypoint[] {
  const mainChannel = buildEvacuationRouteFromGeoJson(JSON.parse(lineGeoJsonText));
  const mergedEvacuation = mergeEvacuationNetwork();

  const candidates = [mainChannel.positions, mergedEvacuation].filter(
    (points) => points.length >= 2,
  );
  if (!candidates.length) return [];

  return dedupeRoutePoints(
    candidates.reduce((best, cur) => (cur.length > best.length ? cur : best), candidates[0]!),
  );
}

function estimateLengthMeters(points: RescueRouteWaypoint[]): number {
  let total = 0;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000;

  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const dLat = toRad(b.latitude - a.latitude);
    const dLng = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    total += 2 * R * Math.asin(Math.sqrt(Math.max(0, Math.min(1, s))));
  }

  return total;
}

function estimateDurationMs(mode: SecurityTrackMode, lengthMeters: number): number {
  const metersPerSecond = mode === 'vehicle' ? 8 : 1.4;
  return Math.max(35000, Math.min(180000, (lengthMeters / metersPerSecond) * 1000));
}

const roadNetworkRoute = buildRoadNetworkRoute();

const fallbackVehicleRoute: RescueRouteWaypoint[] = [
  { longitude: 110.894, latitude: 21.6855 },
  { longitude: 110.8895, latitude: 21.6832 },
  { longitude: 110.8848, latitude: 21.6808 },
  { longitude: 110.8802, latitude: 21.6782 },
];

const fallbackPersonRoute: RescueRouteWaypoint[] = [...fallbackVehicleRoute].reverse();

export function buildSecurityTrackWaypoints(mode: SecurityTrackMode): SecurityTrackWaypointsConfig {
  const base =
    roadNetworkRoute.length >= 2
      ? roadNetworkRoute
      : mode === 'vehicle'
        ? fallbackVehicleRoute
        : fallbackPersonRoute;

  const points = mode === 'person' ? [...base].reverse() : base;
  const lengthMeters = estimateLengthMeters(points);

  return {
    points,
    initialProgress: 0,
    endProgress: 1,
    durationMs: estimateDurationMs(mode, lengthMeters),
  };
}

export function securityTrackUsesRoadNetwork(): boolean {
  return roadNetworkRoute.length >= 2;
}
