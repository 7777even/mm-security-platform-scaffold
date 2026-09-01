import boundaryGeoJsonText from '../../mapdata/边界.geojson?raw';
import plantGeoJsonText from '../../mapdata/装置区.geojson?raw';
import { stagePercentToWorldPosition, stagePixelToWorldPosition } from './mapDesignGeo';

export type LonLat = { longitude: number; latitude: number };

interface GeoJsonFeatureCollection {
  features: Array<{
    geometry?: {
      type: 'Polygon' | 'MultiPolygon';
      coordinates: number[][][] | number[][][][];
    };
  }>;
}

function getPolygonRings(geojson: GeoJsonFeatureCollection): LonLat[][] {
  const rings: LonLat[][] = [];
  for (const feature of geojson.features) {
    const geom = feature.geometry;
    if (!geom) continue;
    if (geom.type === 'Polygon') {
      for (const ring of geom.coordinates as number[][][]) {
        rings.push(ring.map(([lon, lat]) => ({ longitude: lon, latitude: lat })));
      }
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.coordinates as number[][][][]) {
        for (const ring of poly) {
          rings.push(ring.map(([lon, lat]) => ({ longitude: lon, latitude: lat })));
        }
      }
    }
  }
  return rings;
}

const boundaryRing =
  getPolygonRings(JSON.parse(boundaryGeoJsonText) as GeoJsonFeatureCollection)[0] ?? [];
const plantRings = getPolygonRings(JSON.parse(plantGeoJsonText) as GeoJsonFeatureCollection);

export function isInsideBoundary(point: LonLat): boolean {
  return pointInPolygon(point, boundaryRing);
}

export function isInsidePlantZone(point: LonLat): boolean {
  return plantRings.some((ring) => pointInPolygon(point, ring));
}

/** 射线法判断点是否在多边形内 */
export function pointInPolygon(point: LonLat, ring: LonLat[]): boolean {
  if (ring.length < 3) return false;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]!.longitude;
    const yi = ring[i]!.latitude;
    const xj = ring[j]!.longitude;
    const yj = ring[j]!.latitude;
    const intersect =
      yi > point.latitude !== yj > point.latitude &&
      point.longitude < ((xj - xi) * (point.latitude - yi)) / (yj - yi + 1e-15) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function cross(ax: number, ay: number, bx: number, by: number): number {
  return ax * by - ay * bx;
}

function segmentsIntersect(a1: LonLat, a2: LonLat, b1: LonLat, b2: LonLat): boolean {
  const r = { x: a2.longitude - a1.longitude, y: a2.latitude - a1.latitude };
  const s = { x: b2.longitude - b1.longitude, y: b2.latitude - b1.latitude };
  const qp = { x: b1.longitude - a1.longitude, y: b1.latitude - a1.latitude };
  const rxs = cross(r.x, r.y, s.x, s.y);
  const qpxr = cross(qp.x, qp.y, r.x, r.y);
  const qpxs = cross(qp.x, qp.y, s.x, s.y);
  if (Math.abs(rxs) < 1e-15) return false;
  const t = qpxs / rxs;
  const u = qpxr / rxs;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

export function segmentCrossesPlantZone(a: LonLat, b: LonLat): boolean {
  for (const ring of plantRings) {
    for (let i = 0; i < ring.length; i++) {
      const c = ring[i]!;
      const d = ring[(i + 1) % ring.length]!;
      if (segmentsIntersect(a, b, c, d)) return true;
    }
    const mid = {
      longitude: (a.longitude + b.longitude) / 2,
      latitude: (a.latitude + b.latitude) / 2,
    };
    if (pointInPolygon(mid, ring)) return true;
  }
  return false;
}

/** 点到折线最近点 */
export function nearestPointOnRing(point: LonLat, ring: LonLat[]): LonLat {
  let best = ring[0]!;
  let bestDist = Infinity;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]!;
    const b = ring[(i + 1) % ring.length]!;
    const projected = projectPointOnSegment(point, a, b);
    const dist = distanceSq(point, projected);
    if (dist < bestDist) {
      bestDist = dist;
      best = projected;
    }
  }
  return best;
}

function projectPointOnSegment(p: LonLat, a: LonLat, b: LonLat): LonLat {
  const dx = b.longitude - a.longitude;
  const dy = b.latitude - a.latitude;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-18) return { ...a };
  let t = ((p.longitude - a.longitude) * dx + (p.latitude - a.latitude) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return { longitude: a.longitude + t * dx, latitude: a.latitude + t * dy };
}

function distanceSq(a: LonLat, b: LonLat): number {
  const dx = a.longitude - b.longitude;
  const dy = a.latitude - b.latitude;
  return dx * dx + dy * dy;
}

export function distanceMeters(a: LonLat, b: LonLat): number {
  const meanLat = ((a.latitude + b.latitude) / 2) * (Math.PI / 180);
  const dx = (a.longitude - b.longitude) * Math.cos(meanLat) * 111320;
  const dy = (a.latitude - b.latitude) * 110540;
  return Math.hypot(dx, dy);
}

/** 厂区西门：设计锚点投影到企业边界最近道路入口 */
export function resolveBoundaryGateEntry(): LonLat {
  const gateAnchor = stagePixelToWorldPosition(590, 836);
  return nearestPointOnRing(gateAnchor, boundaryRing);
}

/** 可通行道路节点：在边界内且不在装置区内 */
export function isPassableRoadPoint(point: LonLat): boolean {
  return isInsideBoundary(point) && !isInsidePlantZone(point);
}

/** 路段不穿越装置区 */
export function isValidRouteSegment(a: LonLat, b: LonLat): boolean {
  return isPassableRoadPoint(a) && isPassableRoadPoint(b) && !segmentCrossesPlantZone(a, b);
}

/** 事故点：储罐区 B-3（与消防应急事件坐标一致），取可通行位置 */
export function resolveFireIncidentPoint(): LonLat {
  const candidates: LonLat[] = [
    stagePercentToWorldPosition(48.5, 29.6),
    stagePixelToWorldPosition(905, 374),
    stagePixelToWorldPosition(880, 360),
  ];
  for (const point of candidates) {
    if (isPassableRoadPoint(point)) return point;
  }
  return candidates[0]!;
}

export { stagePixelToWorldPosition, stagePercentToWorldPosition };
