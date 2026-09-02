import { isInsideBoundary, type LonLat } from '../../utils/accidentRescueGeo';
import { fireBrigadeTeams, type FireBrigadeTeam } from './fireBrigadeMock';

const fallback = fireBrigadeTeams[0]!;

/** 边界.geojson 外接矩形（用于网格采样） */
const BOUNDARY_BBOX = {
  lngMin: 110.86640741656326,
  lngMax: 110.89426960295425,
  latMin: 21.670677598692706,
  latMax: 21.689795947432735,
} as const;

function nearlyEqual(a: LonLat, b: LonLat, eps = 1e-6) {
  return Math.abs(a.longitude - b.longitude) < eps && Math.abs(a.latitude - b.latitude) < eps;
}

/** 在边界多边形内均匀采样锚点 */
function buildBoundaryAnchors(): LonLat[] {
  const anchors: LonLat[] = [];
  const cols = 20;
  const rows = 18;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const point: LonLat = {
        longitude:
          BOUNDARY_BBOX.lngMin + (col / (cols - 1)) * (BOUNDARY_BBOX.lngMax - BOUNDARY_BBOX.lngMin),
        latitude:
          BOUNDARY_BBOX.latMin + (row / (rows - 1)) * (BOUNDARY_BBOX.latMax - BOUNDARY_BBOX.latMin),
      };
      if (isInsideBoundary(point)) anchors.push(point);
    }
  }

  for (const team of fireBrigadeTeams) {
    const point = { longitude: team.longitude, latitude: team.latitude };
    if (isInsideBoundary(point) && !anchors.some((anchor) => nearlyEqual(anchor, point))) {
      anchors.push(point);
    }
  }

  return anchors.length > 0
    ? anchors
    : [{ longitude: fallback.longitude, latitude: fallback.latitude }];
}

const BOUNDARY_ANCHORS = buildBoundaryAnchors();

/** 为当前页 N 个点选取边界内尽量分散的锚点 */
function pickSpreadAnchors(count: number, page: number): LonLat[] {
  const total = BOUNDARY_ANCHORS.length;
  if (count <= 0 || total === 0) return [];
  if (count === 1) {
    return [BOUNDARY_ANCHORS[((page - 1) * 19 + 7) % total] ?? fallback];
  }

  const step = Math.max(1, Math.floor(total / count));
  const start = ((page - 1) * (step + 11) + 17) % total;
  return Array.from({ length: count }, (_, index) => {
    const anchor = BOUNDARY_ANCHORS[(start + index * step) % total] ?? fallback;
    return { longitude: anchor.longitude, latitude: anchor.latitude };
  });
}

function ensureInsideBoundary(point: LonLat): LonLat {
  if (isInsideBoundary(point)) return point;

  let best = BOUNDARY_ANCHORS[0] ?? fallback;
  let bestDist = Infinity;
  for (const anchor of BOUNDARY_ANCHORS) {
    const dist =
      (anchor.longitude - point.longitude) ** 2 + (anchor.latitude - point.latitude) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = anchor;
    }
  }
  return best;
}

/** 当前页条目在边界内均匀撒点（按页内序号拉开间距） */
export function coordsForPagedSpread(
  indexInPage: number,
  itemsOnPage: number,
  page: number,
  itemId: number,
) {
  if (itemsOnPage <= 0) return coordsForRescueItem(itemId);

  const anchors = pickSpreadAnchors(itemsOnPage, page);
  const anchor = anchors[indexInPage] ?? anchors[0] ?? fallback;
  const jitterLng = (((itemId * 23) % 3) - 1) * 0.00003;
  const jitterLat = (((itemId * 31) % 3) - 1) * 0.00003;
  return ensureInsideBoundary({
    longitude: anchor.longitude + jitterLng,
    latitude: anchor.latitude + jitterLat,
  });
}

/** 按 id 在边界内锚点间均匀取样，并加微小抖动 */
export function coordsForRescueItem(id: number) {
  const slotIndex = (id * 17 + 3) % BOUNDARY_ANCHORS.length;
  const anchor = BOUNDARY_ANCHORS[slotIndex] ?? fallback;
  const jitterLng = (((id * 23) % 5) - 2) * 0.00007;
  const jitterLat = (((id * 31) % 5) - 2) * 0.00006;
  return ensureInsideBoundary({
    longitude: anchor.longitude + jitterLng,
    latitude: anchor.latitude + jitterLat,
  });
}

/** 装备/人员/车辆：按当前页在边界内分散布局 */
export function coordsForSquadronPaged(
  _squadron: string,
  id: number,
  indexInPage: number,
  itemsOnPage: number,
  page: number,
) {
  return coordsForPagedSpread(indexInPage, itemsOnPage, page, id);
}

/** @deprecated 使用 coordsForSquadronPaged */
export function coordsForSquadron(squadron: string, id: number) {
  return coordsForSquadronPaged(squadron, id, 0, 1, 1);
}

export function coordsForFireBrigadeTeam(
  team: FireBrigadeTeam,
  indexInPage: number,
  itemsOnPage: number,
  page: number,
) {
  return coordsForPagedSpread(indexInPage, itemsOnPage, page, team.id);
}

export interface RescueMapMarker {
  id: number;
  label: string;
  meta?: string;
  longitude: number;
  latitude: number;
}
