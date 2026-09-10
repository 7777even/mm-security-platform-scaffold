import {
  buildSecurityTrackWaypoints,
  type SecurityTrackWaypointsConfig,
} from '@/services/map-data/geo/securityTrackRoute';

export type { SecurityTrackWaypointsConfig };

export type SecurityTrackMode = 'vehicle' | 'person';

// 轨迹时间轴 / 起止点 / 车辆·人员详情已迁至后端（B5）：
// 见 services/security.ts 的 fetchSecurityTrackTimeline/fetchSecurityTrackSummary/
// fetchVehicleSearchDetail/fetchPersonSearchDetail。此处仅保留沿厂区路网 geojson
// 计算的**路线几何**（设计允许的本地几何，非展示数据）。
export function resolveSecurityTrackWaypoints(
  mode: SecurityTrackMode,
): SecurityTrackWaypointsConfig {
  return buildSecurityTrackWaypoints(mode);
}
