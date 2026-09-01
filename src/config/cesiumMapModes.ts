export type CesiumMapMode =
  | 'fire'
  | 'fire-emergency'
  | 'accident-rescue'
  | 'evacuation'
  | 'production'
  | 'preliminary'
  | 'security'
  | 'tv'
  | 'park-overview'
  | 'operation-monitoring'
  | 'ai-diagnosis'
  | 'cesium-test';

export interface CesiumMapModeConfig {
  showPlantZoneTags: boolean;
  enablePlantZoneSelection: boolean;
  /** 鼠标移动时对装置区做 drillPick（拖拽地图时开销大，展示页应关闭） */
  enablePlantZoneHover: boolean;
  suppressBlankClickDeselectWhenSelected: boolean;
}

export const CESIUM_MAP_MODES: Record<CesiumMapMode, CesiumMapModeConfig> = {
  fire: {
    showPlantZoneTags: true,
    enablePlantZoneSelection: false,
    enablePlantZoneHover: true,
    suppressBlankClickDeselectWhenSelected: false,
  },
  production: {
    showPlantZoneTags: false,
    enablePlantZoneSelection: false,
    enablePlantZoneHover: false,
    suppressBlankClickDeselectWhenSelected: false,
  },
  preliminary: {
    showPlantZoneTags: false,
    enablePlantZoneSelection: false,
    enablePlantZoneHover: false,
    suppressBlankClickDeselectWhenSelected: false,
  },
  'fire-emergency': {
    showPlantZoneTags: false,
    enablePlantZoneSelection: false,
    enablePlantZoneHover: false,
    suppressBlankClickDeselectWhenSelected: false,
  },
  'accident-rescue': {
    showPlantZoneTags: false,
    enablePlantZoneSelection: false,
    enablePlantZoneHover: false,
    suppressBlankClickDeselectWhenSelected: false,
  },
  evacuation: {
    showPlantZoneTags: false,
    enablePlantZoneSelection: false,
    enablePlantZoneHover: false,
    suppressBlankClickDeselectWhenSelected: true,
  },
  security: {
    showPlantZoneTags: false,
    enablePlantZoneSelection: false,
    enablePlantZoneHover: false,
    suppressBlankClickDeselectWhenSelected: false,
  },
  tv: {
    showPlantZoneTags: false,
    enablePlantZoneSelection: false,
    enablePlantZoneHover: false,
    suppressBlankClickDeselectWhenSelected: false,
  },
  'park-overview': {
    showPlantZoneTags: true,
    enablePlantZoneSelection: true,
    enablePlantZoneHover: true,
    suppressBlankClickDeselectWhenSelected: true,
  },
  'operation-monitoring': {
    showPlantZoneTags: false,
    enablePlantZoneSelection: false,
    enablePlantZoneHover: false,
    suppressBlankClickDeselectWhenSelected: false,
  },
  'ai-diagnosis': {
    showPlantZoneTags: false,
    enablePlantZoneSelection: false,
    enablePlantZoneHover: false,
    suppressBlankClickDeselectWhenSelected: false,
  },
  'cesium-test': {
    showPlantZoneTags: true,
    enablePlantZoneSelection: true,
    enablePlantZoneHover: true,
    suppressBlankClickDeselectWhenSelected: false,
  },
};

export function resolveCesiumMapModeConfig(mode: string): CesiumMapModeConfig {
  return CESIUM_MAP_MODES[mode as CesiumMapMode] ?? CESIUM_MAP_MODES.fire;
}

export interface CesiumMapFocus {
  focusRightInsetPx: number;
  /** 左侧 UI 占用宽度（px）；与右侧 inset 一起计算可视区水平中心 */
  focusLeftInsetPx?: number;
  focusTopInsetPx: number;
  /** 底部 UI 占用高度（px）；与顶部 inset 一起计算可视区垂直中心 */
  focusBottomInsetPx?: number;
  focusVerticalExtraPx: number;
  focusHorizontalScale: number;
  /** 边界总览 flyToBoundingSphere 距离系数，越大视野越远 */
  boundaryOverviewRangeMultiplier?: number;
}

export const FIRE_MAP_FOCUS: CesiumMapFocus = {
  focusRightInsetPx: 465,
  focusTopInsetPx: 98,
  focusVerticalExtraPx: 180,
  focusHorizontalScale: 0.55,
};

export const PRODUCTION_MAP_FOCUS: CesiumMapFocus = {
  focusRightInsetPx: 465,
  focusTopInsetPx: 98,
  focusVerticalExtraPx: 200,
  focusHorizontalScale: 0.55,
};

/** 生产区域详情：仅右侧面板 + 顶部指标条 */
export const PRODUCTION_AREA_MAP_FOCUS: CesiumMapFocus = {
  focusRightInsetPx: 455,
  focusTopInsetPx: 150,
  focusBottomInsetPx: 60,
  focusVerticalExtraPx: 120,
  focusHorizontalScale: 0.7,
};

/** 重大危险源列表：右侧列表较宽 */
export const MAJOR_HAZARD_LIST_MAP_FOCUS: CesiumMapFocus = {
  focusRightInsetPx: 555,
  focusTopInsetPx: 98,
  focusBottomInsetPx: 60,
  focusVerticalExtraPx: 140,
  focusHorizontalScale: 0.65,
};

/** 重大危险源详情：左侧详情面板 */
export const MAJOR_HAZARD_DETAIL_MAP_FOCUS: CesiumMapFocus = {
  focusLeftInsetPx: 455,
  focusRightInsetPx: 40,
  focusTopInsetPx: 98,
  focusBottomInsetPx: 60,
  focusVerticalExtraPx: 100,
  focusHorizontalScale: 0.75,
};

/** 应急事件详情：左右 419px 面板 + 页边距，飞入时标记居中于中间地图区 */
export const ACCIDENT_RESCUE_MAP_FOCUS: CesiumMapFocus = {
  focusLeftInsetPx: 439,
  focusRightInsetPx: 458,
  focusTopInsetPx: 95,
  focusBottomInsetPx: 110,
  focusVerticalExtraPx: 0,
  focusHorizontalScale: 1,
  boundaryOverviewRangeMultiplier: 2.05,
};

export interface RouteCesiumMeta {
  cesium: boolean;
  mapMode: CesiumMapMode;
  mapFocus: CesiumMapFocus | null;
}

const DEFAULT_FOCUS: CesiumMapFocus = {
  focusRightInsetPx: 0,
  focusTopInsetPx: 98,
  focusVerticalExtraPx: 160,
  focusHorizontalScale: 0.75,
  boundaryOverviewRangeMultiplier: 2.05,
};

/** 安防页需看到四向门禁标点，初始视角略远 */
export const SECURITY_MAP_FOCUS: CesiumMapFocus = {
  focusRightInsetPx: 465,
  focusTopInsetPx: 98,
  focusVerticalExtraPx: 120,
  focusHorizontalScale: 0.65,
  boundaryOverviewRangeMultiplier: 2.95,
};

export const ROUTE_CESIUM_META: Record<string, RouteCesiumMeta> = {
  // ⚠️ 临时 stopgap（wujie 子应用展示用）：子应用沙箱内路由名恒为 subapp-fallback，
  // 无法命中下方真实模块名。先强制 cesium:true + fire 模式，复刻参考项目大屏展示效果。
  // 后续离线底座改造 + 正确路由映射（openspec）落地后删除此项。
  'subapp-fallback': { cesium: true, mapMode: 'fire', mapFocus: FIRE_MAP_FOCUS },
  emergency: { cesium: true, mapMode: 'fire-emergency', mapFocus: FIRE_MAP_FOCUS },
  fire: { cesium: true, mapMode: 'fire', mapFocus: FIRE_MAP_FOCUS },
  fireAccidentRescue: {
    cesium: true,
    mapMode: 'accident-rescue',
    mapFocus: ACCIDENT_RESCUE_MAP_FOCUS,
  },
  drillEmergencyDetail: {
    cesium: true,
    mapMode: 'accident-rescue',
    mapFocus: ACCIDENT_RESCUE_MAP_FOCUS,
  },
  typhoonEmergencyDetail: {
    cesium: true,
    mapMode: 'accident-rescue',
    mapFocus: ACCIDENT_RESCUE_MAP_FOCUS,
  },
  production: { cesium: true, mapMode: 'production', mapFocus: PRODUCTION_MAP_FOCUS },
  productionArea: { cesium: true, mapMode: 'production', mapFocus: PRODUCTION_AREA_MAP_FOCUS },
  majorHazardList: { cesium: true, mapMode: 'production', mapFocus: MAJOR_HAZARD_LIST_MAP_FOCUS },
  majorHazardDetail: {
    cesium: true,
    mapMode: 'production',
    mapFocus: MAJOR_HAZARD_DETAIL_MAP_FOCUS,
  },
  preliminary: { cesium: true, mapMode: 'preliminary', mapFocus: PRODUCTION_MAP_FOCUS },
  security: { cesium: true, mapMode: 'security', mapFocus: SECURITY_MAP_FOCUS },
  tv: { cesium: true, mapMode: 'tv', mapFocus: DEFAULT_FOCUS },
};

export function resolveRouteCesiumMeta(routeName: string | null | undefined): RouteCesiumMeta {
  if (!routeName) return { cesium: false, mapMode: 'fire', mapFocus: null };
  return ROUTE_CESIUM_META[routeName] ?? { cesium: false, mapMode: 'fire', mapFocus: null };
}
