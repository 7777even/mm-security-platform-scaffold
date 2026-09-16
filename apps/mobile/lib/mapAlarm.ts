import type { MapMarker } from '../components/MapPanel.vue';
import type { MapPoint } from '@/services/map';

/**
 * 移动端报警态势地图：后端撒点（GET /map/alarms，GeoJSON 归一化为 MapPoint）→ 地图标注。
 *
 * 后端 fac_alarm 经 device_code 关联 fac_device(lat,lon) 取得坐标；无坐标的报警不渲染。
 * 与「大屏地图撒点」同源（同一套 fac_alarm），符合三端报警口径（docs/system-facts.md §6.1）。
 *
 * 筛选维度按「等级」而非原演示的 kind（消防/GDS/DCS/周界/视频AI）：后端撒点无 kind 字段，
 * 且 kind 是「来源系统」维度、与移动端要展示的「报警等级」语义不符，故重构为按 level 分档。
 */

/** 报警等级 → 语义色档：1 红（一级）/ 2 橙（二级）/ 3 及以上绿（三级）。 */
export function alarmLevelColor(level?: number): string {
  if (level === 1) return 'var(--danger-mobile)';
  if (level === 2) return 'var(--warning-mobile)';
  return 'var(--success-mobile)';
}

/** 等级 → 分档（用于筛选页签与图例，与色档一致）。 */
export function alarmLevelTier(level?: number): '一级' | '二级' | '三级' {
  if (level === 1) return '一级';
  if (level === 2) return '二级';
  return '三级';
}

/** 后端地图报警点 → 移动端标注（等级决定色档，名称即标题）。 */
export function mapPointsToMarkers(points: MapPoint[] | null | undefined): MapMarker[] {
  return (points ?? []).map((p) => ({
    lat: p.lat,
    lng: p.lng,
    title: p.name,
    color: alarmLevelColor(p.level),
  }));
}
