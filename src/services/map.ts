import { request } from '@/services/http'

// 地图点位/区域（B3 MAP-02/03 + DASH-03 对接；mock 为 GeoJSON Feature，坐标 WGS84 经纬度）

export interface MapPoint {
  id: string
  name: string
  lng: number
  lat: number
  status?: string
  level?: number
}

export interface RiskZone {
  name: string
  score: number
  polygon: [number, number][]
}

interface GeoJsonFeature {
  type: string
  properties: Record<string, unknown>
  geometry: { type: string; coordinates: number[] | number[][] }
}

// 区域静态坐标（茂名厂区示意，WGS84）；生产以真实地理围栏/GeoJSON 替换
const ZONE_COORDS: Record<string, [number, number][]> = {
  罐区: [
    [110.945, 21.678],
    [110.955, 21.678],
    [110.955, 21.67],
    [110.945, 21.67],
  ],
  装置区: [
    [110.953, 21.674],
    [110.962, 21.674],
    [110.962, 21.665],
    [110.953, 21.665],
  ],
  装卸区: [
    [110.94, 21.668],
    [110.948, 21.668],
    [110.948, 21.66],
    [110.94, 21.66],
  ],
  公用工程: [
    [110.958, 21.68],
    [110.965, 21.68],
    [110.965, 21.675],
    [110.958, 21.675],
  ],
  行政办公: [
    [110.948, 21.68],
    [110.956, 21.68],
    [110.956, 21.676],
    [110.948, 21.676],
  ],
}

/** GeoJSON Feature → MapPoint（alarm 取 alarmId/level，device 取 deviceCode/status） */
export function normalizeFeature(f: GeoJsonFeature, kind: 'alarm' | 'device'): MapPoint {
  const [lng, lat] = f.geometry.coordinates as [number, number]
  const props = f.properties
  const id = kind === 'alarm' ? String(props.alarmId ?? '') : String(props.deviceCode ?? '')
  return {
    id,
    name: String(props.name ?? props.type ?? id),
    lng,
    lat,
    status: props.status !== undefined ? String(props.status) : undefined,
    level: typeof props.level === 'number' ? props.level : undefined,
  }
}

export async function fetchAlarmPoints(): Promise<MapPoint[]> {
  const features = await request<GeoJsonFeature[]>({ url: '/map/alarms', method: 'GET' })
  return features.map((f) => normalizeFeature(f, 'alarm'))
}

export async function fetchDevicePoints(): Promise<MapPoint[]> {
  const features = await request<GeoJsonFeature[]>({ url: '/map/devices', method: 'GET' })
  return features.map((f) => normalizeFeature(f, 'device'))
}

export async function fetchRiskZones(): Promise<RiskZone[]> {
  const zones = await request<{ zone: string; score: number }[]>({
    url: '/dashboard/risk-heatmap',
    method: 'GET',
  })
  return zones
    .filter((z) => ZONE_COORDS[z.zone])
    .map((z) => ({ name: z.zone, score: z.score, polygon: ZONE_COORDS[z.zone] }))
}

// 静态兜底：mock 不可达时保留展示，不白屏
export const FALLBACK_ALARM_POINTS: MapPoint[] = [
  { id: 'A-FB-1', name: '罐区-01 烟感报警', lng: 110.951, lat: 21.672, level: 1 },
  { id: 'A-FB-2', name: '装置区-03 可燃报警', lng: 110.955, lat: 21.67, level: 2 },
  { id: 'A-FB-3', name: '装卸区-02 温度报警', lng: 110.944, lat: 21.665, level: 3 },
]

export const FALLBACK_DEVICE_POINTS: MapPoint[] = [
  { id: 'D-FB-1', name: '罐区-01 烟感', lng: 110.951, lat: 21.672, status: 'ONLINE' },
  { id: 'D-FB-2', name: '装置区-03 可燃', lng: 110.953, lat: 21.67, status: 'ONLINE' },
  { id: 'D-FB-3', name: '装卸区-02 温度', lng: 110.944, lat: 21.665, status: 'FAULT' },
]

export const FALLBACK_RISK_ZONES: RiskZone[] = Object.entries(ZONE_COORDS).map(
  ([name, polygon]) => ({
    name,
    score:
      name === '罐区' ? 4.2 : name === '装置区' ? 3.1 : name === '装卸区' ? 2.6 : 1.5,
    polygon,
  }),
)
