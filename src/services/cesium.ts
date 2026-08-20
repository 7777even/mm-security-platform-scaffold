import type { MapPoint, RiskZone } from './map';

/**
 * Cesium.js 二三维一体化地图服务层（详细设计 4.2.2.2「地图集成服务 map」前端消费侧）。
 *
 * 本层保持纯函数设计：viewer 实例化（DOM/WebGL 依赖）由组件层 `BaseMap.vue` 负责，
 * 此处只做「业务数据 → Cesium 实体描述」的映射，可在 node 环境单测，无 DOM 依赖。
 * 底层引擎以 Cesium 替换原 OL(2D)+Three(3D) 双引擎，实现单一 viewer 二三维一体化。
 */

/** 地图实体类型 */
export type PointKind = 'alarm' | 'device';

/** viewer 初始化配置 */
export interface CesiumViewerOptions {
  tileUrl: string;
  sceneMode: '2d' | '3d';
  defaultView: { lng: number; lat: number; height: number };
}

/** 点位实体描述（待组件层转换为 Cesium Entity） */
export interface PointEntity {
  id: string;
  name: string;
  lng: number;
  lat: number;
  kind: PointKind;
  level?: number;
  status?: string;
  color: string;
}

/** 风险区实体描述 */
export interface ZoneEntity {
  name: string;
  score: number;
  coordinates: [number, number][];
  color: string;
}

// 茂名厂区示意中心（WGS84），与 services/map.ts ZONE_COORDS 同坐标系
export const MAP_CENTER = { lng: 110.952, lat: 21.672 };

// 报警/设备点位色（对齐设计稿图 5-1 预警色分级 + 语义色）：
//  - AlarmLevel=1 (一级/最高) → --color-alarm-1 #F46767
//  - AlarmLevel=2 (二级)      → --color-alarm-2 #F68A2E
//  - AlarmLevel=3 (三级)      → --color-alarm-3 #F6BA2E
//  - AlarmLevel=4 (四级/兜底) → --color-alarm-4 #2E7CF6
// 这里 hardcode 与 styles/tokens.css 保持一致；Cesium 引擎无法消费 CSS 变量。
const LEVEL_COLORS: Record<number, string> = {
  1: '#f46767',
  2: '#f68a2e',
  3: '#f6ba2e',
  4: '#2e7cf6',
};

// 设备状态色（设计规则 3：成功/警示/危险 + 设计稿语义色）
const STATUS_COLORS: Record<string, string> = {
  ONLINE: '#2ee6a8', // 成功/正常（绿）
  OFFLINE: '#8fa6c8', // 辅助文字（灰蓝）
  FAULT: '#ff5a5a', // 危险/报警（红）
};

/** 风险区评分 → 半透明填充色（与 dashboard zoneColor + 设计稿语义色一致） */
export function zoneColor(score: number): string {
  if (score >= 4) return 'rgba(255, 90, 90, 0.22)';
  if (score >= 3) return 'rgba(246, 186, 46, 0.2)';
  if (score >= 2) return 'rgba(46, 124, 246, 0.18)';
  return 'rgba(143, 166, 200, 0.14)';
}

/** 构建 viewer 初始化配置（瓦片 URL 可配置；默认 3D 二三维一体化模式） */
export function buildViewerOptions(opts: {
  tileUrl: string;
  sceneMode?: '2d' | '3d';
}): CesiumViewerOptions {
  return {
    tileUrl: opts.tileUrl,
    sceneMode: opts.sceneMode ?? '3d',
    defaultView: { ...MAP_CENTER, height: 600 },
  };
}

/** MapPoint → Cesium 点位实体（报警等级色 / 设备状态色） */
export function toPointEntity(p: MapPoint, kind: PointKind): PointEntity {
  let color: string;
  if (kind === 'alarm') {
    color = LEVEL_COLORS[p.level ?? 3] ?? LEVEL_COLORS[3]!;
  } else {
    color = STATUS_COLORS[p.status ?? 'OFFLINE'] ?? STATUS_COLORS.OFFLINE!;
  }
  return {
    id: p.id,
    name: p.name,
    lng: p.lng,
    lat: p.lat,
    kind,
    level: kind === 'alarm' ? p.level : undefined,
    status: kind === 'device' ? p.status : undefined,
    color,
  };
}

/** RiskZone → Cesium 面实体（评分色 + 名称） */
export function toZoneEntity(z: RiskZone): ZoneEntity {
  return {
    name: z.name,
    score: z.score,
    coordinates: z.polygon,
    color: zoneColor(z.score),
  };
}
