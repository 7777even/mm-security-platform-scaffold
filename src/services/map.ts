import { request } from '@/services/http';
import {
  backendUnavailableWarn,
  REASON_CONTRACT_MISMATCH,
  resolveOfflineFetch,
} from '@/services/backendFallback';
import { logger } from '@/utils/logger';

// 地图点位/区域（B3 MAP-02/03 + DASH-03 对接；mock 为 GeoJSON Feature，坐标 WGS84 经纬度）

export interface MapPoint {
  id: string;
  name: string;
  lng: number;
  lat: number;
  status?: string;
  level?: number;
}

export interface RiskZone {
  name: string;
  score: number;
  /** 坐标数组围栏（WGS84）。 */
  polygon?: [number, number][];
  /** 可选：WKT 几何围栏（优先级高于 polygon；复用 geo.ts 解析，支持 Point/LineString/Polygon）。 */
  wkt?: string;
}

interface GeoJsonFeature {
  type: string;
  properties: Record<string, unknown>;
  geometry: { type: string; coordinates: number[] | number[][] };
}

/** 后端 /map/alarms、/map/devices 返回的是标准 GeoJSON FeatureCollection（Result.data 解包后即为该对象） */
interface GeoJsonFeatureCollection {
  type: string;
  features: GeoJsonFeature[];
}

// 区域静态坐标（茂名厂区示意，WGS84）；生产以真实地理围栏/GeoJSON 替换
const ZONE_COORDS: Record<string, [number, number][]> = {
  罐区: [
    [110.915, 21.668],
    [110.925, 21.668],
    [110.925, 21.66],
    [110.915, 21.66],
  ],
  装置区: [
    [110.923, 21.664],
    [110.932, 21.664],
    [110.932, 21.655],
    [110.923, 21.655],
  ],
  装卸区: [
    [110.91, 21.658],
    [110.918, 21.658],
    [110.918, 21.65],
    [110.91, 21.65],
  ],
  公用工程: [
    [110.928, 21.67],
    [110.935, 21.67],
    [110.935, 21.665],
    [110.928, 21.665],
  ],
  行政办公: [
    [110.918, 21.67],
    [110.926, 21.67],
    [110.926, 21.666],
    [110.918, 21.666],
  ],
};

/** GeoJSON Feature → MapPoint（alarm 取 alarmId/level，device 取 deviceCode/status） */
export function normalizeFeature(f: GeoJsonFeature, kind: 'alarm' | 'device'): MapPoint {
  const [lng, lat] = f.geometry.coordinates as [number, number];
  const props = f.properties;
  const id = kind === 'alarm' ? String(props.alarmId ?? '') : String(props.deviceCode ?? '');
  return {
    id,
    name: String(props.name ?? props.type ?? id),
    lng,
    lat,
    status: props.status !== undefined ? String(props.status) : undefined,
    level: typeof props.level === 'number' ? props.level : undefined,
  };
}

export async function fetchAlarmPoints(): Promise<MapPoint[]> {
  // demo 用静态兜底；offline 显式报错 + 空态（不再静默回退兜底假数据）
  const fb = resolveOfflineFetch('map', '/map/alarms', FALLBACK_ALARM_POINTS, []);
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const fc = await request<GeoJsonFeatureCollection>({ url: '/map/alarms', method: 'GET' });
    return (fc?.features ?? []).map((f) => normalizeFeature(f, 'alarm'));
  } catch (err) {
    logger.warn('[map] fetchAlarmPoints 失败', (err as Error)?.message);
    backendUnavailableWarn('map', '/map/alarms');
    return [];
  }
}

export async function fetchDevicePoints(): Promise<MapPoint[]> {
  // demo 用静态兜底；offline 显式报错 + 空态
  const fb = resolveOfflineFetch('map', '/map/devices', FALLBACK_DEVICE_POINTS, []);
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const fc = await request<GeoJsonFeatureCollection>({ url: '/map/devices', method: 'GET' });
    return (fc?.features ?? []).map((f) => normalizeFeature(f, 'device'));
  } catch (err) {
    logger.warn('[map] fetchDevicePoints 失败', (err as Error)?.message);
    backendUnavailableWarn('map', '/map/devices');
    return [];
  }
}

/** 真实后端 zone 名称可能带后缀（如「罐区A」），按前缀匹配落到同类区域围栏，避免真后端数据被过滤丢弃 */
function resolveZonePolygon(zone: string): [number, number][] | undefined {
  if (ZONE_COORDS[zone]) return ZONE_COORDS[zone];
  const byPrefix = Object.keys(ZONE_COORDS).find((k) => zone.startsWith(k));
  return byPrefix ? ZONE_COORDS[byPrefix] : undefined;
}

export async function fetchRiskZones(): Promise<RiskZone[]> {
  // demo 用静态兜底；offline 显式报错 + 空态
  const fb = resolveOfflineFetch('map', '/dashboard/risk-heatmap', FALLBACK_RISK_ZONES, []);
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const zones = await request<{ zone: string; score: number }[]>({
      url: '/dashboard/risk-heatmap',
      method: 'GET',
    });
    return zones.map((z) => ({
      name: z.zone,
      score: z.score,
      polygon: resolveZonePolygon(z.zone),
    }));
  } catch (err) {
    logger.warn('[map] fetchRiskZones 失败', (err as Error)?.message);
    backendUnavailableWarn('map', '/dashboard/risk-heatmap');
    return [];
  }
}

// ---------------------------------------------------------------- 装置区信息牌（V42）

/** 红色区块信息牌（MaomingPetroCesiumMap 的 plantZonePopups 项）。 */
export interface MapZoneSignPopup {
  title: string;
  location?: string | null;
  status: string;
  statusLevel?: string | null;
}

/** 青色信息牌（MaomingPetroCesiumMap 的 plantZoneTealTags 项）。 */
export interface MapZoneSignTealTag {
  title: string;
  status: string;
  value?: string | null;
}

/** 装置区信息牌聚合（取代前端 MAP_THEME 内硬编码文案）。 */
export interface MapZoneSigns {
  popups: MapZoneSignPopup[];
  tealTags: MapZoneSignTealTag[];
}

const EMPTY_ZONE_SIGNS: MapZoneSigns = { popups: [], tealTags: [] };

/**
 * 3D 地图装置区信息牌：GET /map/zone-signs。三态取数——
 * 失败 / 契约不符 → 显式告警 + 空信息牌（不回灌本地文案）。
 */
export async function fetchMapZoneSigns(): Promise<MapZoneSigns> {
  const fb = resolveOfflineFetch('map', '/map/zone-signs', EMPTY_ZONE_SIGNS, EMPTY_ZONE_SIGNS);
  if (fb.mode !== 'live') return fb.value;
  try {
    const data = await request<MapZoneSigns>({ url: '/map/zone-signs', method: 'GET' });
    if (!data || !Array.isArray(data.popups) || !Array.isArray(data.tealTags)) {
      backendUnavailableWarn('map', '/map/zone-signs', REASON_CONTRACT_MISMATCH);
      return EMPTY_ZONE_SIGNS;
    }
    return data;
  } catch (err) {
    logger.warn('[map] fetchMapZoneSigns 失败', (err as Error)?.message);
    backendUnavailableWarn('map', '/map/zone-signs');
    return EMPTY_ZONE_SIGNS;
  }
}

// 静态兜底：mock 不可达时保留展示，不白屏（坐标已对齐茂名厂区）
export const FALLBACK_ALARM_POINTS: MapPoint[] = [
  { id: 'A-FB-1', name: '罐区-01 烟感报警', lng: 110.921, lat: 21.663, level: 1 },
  { id: 'A-FB-2', name: '装置区-03 可燃报警', lng: 110.925, lat: 21.661, level: 2 },
  { id: 'A-FB-3', name: '装卸区-02 温度报警', lng: 110.914, lat: 21.656, level: 3 },
];

export const FALLBACK_DEVICE_POINTS: MapPoint[] = [
  { id: 'D-FB-1', name: '罐区-01 烟感', lng: 110.921, lat: 21.663, status: 'ONLINE' },
  { id: 'D-FB-2', name: '装置区-03 可燃', lng: 110.923, lat: 21.661, status: 'ONLINE' },
  { id: 'D-FB-3', name: '装卸区-02 温度', lng: 110.914, lat: 21.656, status: 'FAULT' },
];

export const FALLBACK_RISK_ZONES: RiskZone[] = Object.entries(ZONE_COORDS).map(
  ([name, polygon]) => ({
    name,
    score: name === '罐区' ? 4.2 : name === '装置区' ? 3.1 : name === '装卸区' ? 2.6 : 1.5,
    polygon,
  }),
);
