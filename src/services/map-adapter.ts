/*
 * map-adapter.ts — 脚手架地图接口数据 → fire-monitoring 覆盖层数据形状适配
 * 对应 openspec/changes/screen-map-base-replace：
 * - /map/alarms、/map/devices 返回的 MapPoint（GeoJSON 归一化产物）
 * - 映射为 HTML 覆盖层所需的两类输入：
 *   1) WorldMarkerAnchor：useWorldMarkerScreenPositions 屏幕锚定（经纬度 + key）
 *   2) MonitoringPoint：AccidentRescueMarkersOverlay 监测点（status 三态）
 * 状态映射对齐《UI规范-大屏端》四级报警色阶：level 1-2（红/橙）→ alarm，
 * level 3-4（黄/紫）→ warning；设备 ONLINE → normal、FAULT → alarm、其余 → warning。
 */
import type { WorldMarkerAnchor } from '@/composables/useCesiumScreenAnchor';
import type {
  MonitoringPoint,
  MonitoringPointStatus,
} from '@/services/map-data/monitoringPointsMock';

/** 与 services/map.ts 的 MapPoint 结构一致（避免直接耦合引入请求层） */
export interface AdapterPoint {
  id: string;
  name: string;
  lng: number;
  lat: number;
  status?: string;
  level?: number;
  /** 可选挂载高度（米），透传给屏幕锚定 */
  height?: number;
}

export type AdapterKind = 'alarm' | 'device';

/** 经纬度有效性：必须是有限数值 */
function isValidCoord(lng: number, lat: number): boolean {
  return Number.isFinite(lng) && Number.isFinite(lat);
}

/** MapPoint[] → WorldMarkerAnchor[]（key 加 kind 前缀防跨类冲突） */
export function toWorldMarkers(points: AdapterPoint[], kind: AdapterKind): WorldMarkerAnchor[] {
  return points
    .filter((p) => isValidCoord(p.lng, p.lat))
    .map((p) => ({
      key: `${kind}:${p.id}`,
      longitude: p.lng,
      latitude: p.lat,
      ...(p.height !== undefined ? { height: p.height } : {}),
    }));
}

/** 报警点位等级 → 覆盖层三态（红/橙 → alarm，黄/紫 → warning，缺省 → alarm） */
function alarmLevelToStatus(level: number | undefined): MonitoringPointStatus {
  if (level === undefined) return 'alarm';
  return level <= 2 ? 'alarm' : 'warning';
}

/** 设备状态 → 覆盖层三态（ONLINE → normal，FAULT → alarm，其余 → warning） */
function deviceStatusToStatus(status: string | undefined): MonitoringPointStatus {
  if (status === 'ONLINE') return 'normal';
  if (status === 'FAULT') return 'alarm';
  return 'warning';
}

/** MapPoint[] → MonitoringPoint[]（AccidentRescueMarkersOverlay 监测点输入） */
export function toMonitoringPoints(points: AdapterPoint[], kind: AdapterKind): MonitoringPoint[] {
  return points
    .filter((p) => isValidCoord(p.lng, p.lat))
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: kind === 'alarm' ? '报警点位' : '监测设备',
      status: kind === 'alarm' ? alarmLevelToStatus(p.level) : deviceStatusToStatus(p.status),
      lastTime: '',
      org: kind === 'alarm' ? '安全管控' : '设备管理',
      longitude: p.lng,
      latitude: p.lat,
    }));
}
