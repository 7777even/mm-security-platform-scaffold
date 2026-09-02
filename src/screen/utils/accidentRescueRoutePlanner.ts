import lineGeoJsonText from '../../mapdata/line.geojson?raw';
import { distanceMeters, resolveFireIncidentPoint } from './accidentRescueGeo';

export interface RescueRouteWaypoint {
  longitude: number;
  latitude: number;
}

interface LineGeoJsonFeatureCollection {
  features: Array<{
    geometry?: {
      type: 'LineString' | 'MultiLineString';
      coordinates: number[][] | number[][][];
    };
  }>;
}

function dedupeRoutePoints(points: RescueRouteWaypoint[]): RescueRouteWaypoint[] {
  const out: RescueRouteWaypoint[] = [];
  for (const p of points) {
    const prev = out[out.length - 1];
    if (!prev || distanceMeters(prev, p) > 0.5) {
      out.push(p);
    }
  }
  return out;
}

/** 解析 mapdata/line.geojson 中绘制的航线 */
function parseDrawnRouteFromGeoJson(): RescueRouteWaypoint[] {
  const geojson = JSON.parse(lineGeoJsonText) as LineGeoJsonFeatureCollection;
  const points: RescueRouteWaypoint[] = [];

  for (const feature of geojson.features) {
    const geom = feature.geometry;
    if (!geom) continue;

    if (geom.type === 'LineString') {
      for (const [longitude, latitude] of geom.coordinates as number[][]) {
        points.push({ longitude, latitude });
      }
      continue;
    }

    if (geom.type === 'MultiLineString') {
      for (const line of geom.coordinates as number[][][]) {
        for (const [longitude, latitude] of line) {
          points.push({ longitude, latitude });
        }
      }
    }
  }

  return dedupeRoutePoints(points);
}

/** 导航路径：直接使用 line.geojson 绘制结果 */
export function buildAccidentRescueNavigationRoute(): RescueRouteWaypoint[] {
  const drawn = parseDrawnRouteFromGeoJson();
  if (drawn.length >= 2) return drawn;

  const fire = resolveFireIncidentPoint();
  return [fire, fire];
}

const routePoints = buildAccidentRescueNavigationRoute();

export const accidentRescueRouteWaypoints = {
  points: routePoints,
  initialProgress: 0,
  endProgress: 1,
  durationMs: 120000,
};

export const accidentRescueMapMarkers = (() => {
  const start = routePoints[0]!;
  const end = routePoints[routePoints.length - 1]!;
  return {
    fire: {
      ...end,
      location: '储罐区B-3',
      status: '主力扑救',
    },
    vehicle: {
      title: '消防救援车',
      location: '厂内道路',
    },
    gate: {
      ...start,
      label: '厂区西门',
      subLabel: '起点',
    },
    destination: {
      ...end,
      label: '储罐区B-3',
      subLabel: '事故点',
    },
  };
})();
