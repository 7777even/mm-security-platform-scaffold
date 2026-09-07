/**
 * 气象瓦片源注册表：把「地图层级 → 气象瓦片源」的映射收敛为单一真源，
 * 组件内不得散落 `if (zoom > 5)` 之类的层级分支。
 *
 * 层级实测结论（2026-09）：
 * - JMA 葵花 B13/TBB 最大层级 5，z>=6 返回 404。
 * - GIBS `Himawari_AHI_Band13_Clean_Infrared`（同 AHI 10 分钟语义）最大层级 6，2 km/px。
 * - 10 分钟级静止卫星原生分辨率即 2 km，z>=7 已无更高分辨率数据可用，只能上采样，故标记 capped。
 */

import { GIBS_MAX_ZOOM } from './gibsHimawariApi';

/** JMA 葵花 B13/TBB 瓦片最大可用层级，z>=6 返回 404 */
export const JMA_MAX_ZOOM = 5;

export type WeatherTileSourceId = 'jma' | 'gibs-ir';

export interface ResolvedWeatherTileSource {
  id: WeatherTileSourceId;
  /** 交给 Leaflet 的 maxNativeZoom：超出后由 Leaflet 上采样，不再请求更高层级 */
  maxNativeZoom: number;
  /** 是否已超出该时次语义下源的物理分辨率上限 */
  capped: boolean;
  /** 来源行展示用的标签 */
  label: string;
}

const JMA_SOURCE: ResolvedWeatherTileSource = {
  id: 'jma',
  maxNativeZoom: JMA_MAX_ZOOM,
  capped: false,
  label: 'JMA 葵花 B13/TBB',
};

const GIBS_SOURCE: ResolvedWeatherTileSource = {
  id: 'gibs-ir',
  maxNativeZoom: GIBS_MAX_ZOOM,
  capped: false,
  label: 'GIBS 葵花红外',
};

/**
 * 解析给定层级应使用哪个气象瓦片源。
 * z<=5 → JMA；z=6 → GIBS IR；z>=7 → GIBS IR 且 capped=true。
 * 非法层级（NaN / 负数）回落到 JMA，不抛错。
 */
export function resolveTileSource(zoom: number): ResolvedWeatherTileSource {
  const normalized = Number.isFinite(zoom) ? Math.max(0, Math.floor(zoom)) : 0;

  if (normalized <= JMA_MAX_ZOOM) return { ...JMA_SOURCE };
  if (normalized <= GIBS_MAX_ZOOM) return { ...GIBS_SOURCE };
  return { ...GIBS_SOURCE, capped: true };
}
