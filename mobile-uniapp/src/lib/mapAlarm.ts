// 告警点 → 地图标记转换。
//
// 后端 /map/alarms 返回 **WGS-84**（见 MapController.java），而移动端 uni <map> 底图为
// **GCJ-02**。在此数据源边界统一转换为 gcj02，使所有展示层标记与"我的位置"(gcj02) 对齐。
import type { MapPoint } from '@/platform/api';
import { wgs84ToGcj02 } from '@/lib/coord';

export interface MapMarker {
  id: string;
  lng: number;
  lat: number;
  label?: string;
  level?: number;
}

export function mapPointsToMarkers(pts: MapPoint[]): MapMarker[] {
  return pts.map((p) => {
    const g = wgs84ToGcj02(p.lng, p.lat);
    return { id: p.id, lng: g.lng, lat: g.lat, label: p.label, level: p.level };
  });
}
