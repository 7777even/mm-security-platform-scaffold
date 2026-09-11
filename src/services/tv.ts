import { request } from '@/services/http';
import { backendUnavailableWarn, REASON_CONTRACT_MISMATCH } from '@/services/backendFallback';

// 工业电视大屏接口（fm-tv），对齐 docs/api/tv.openapi.json。
// 取代 tvMock 中的业务数据（概览/运行统计/维保/事件/巡检记录）；
// 地图撒点、地图标签、巡检圆与扫描点位为前端静态几何，仍留在 tvMock。

/** 后端不可用时的空态（绝不回灌假数据）。 */
const EMPTY_TV_OVERVIEW: TvOverview = {
  overviewItems: [],
  operationStats: {
    total: 0,
    offline: 0,
    fault: 0,
    integrityRate: 0,
    onlineRate: 0,
    eventTotal: 0,
  },
  maintenanceOrders: [],
  eventBreakdown: [],
};
const EMPTY_TV_INSPECTIONS: TvInspectionSummary = { vehicles: [], persons: [] };
const EMPTY_TV_MAP_POINTS: TvMapPoint[] = [];
const EMPTY_TV_MONITOR: TvMonitorDetail = {
  id: '',
  name: '',
  online: false,
  integrity: '',
  monitorType: '',
  department: '',
  location: '',
  height: '',
  angle: '',
};

export interface TvOverviewItem {
  id: number;
  label: string;
  value: number;
  iconIndex: number;
}

export interface TvOperationStats {
  total: number;
  offline: number;
  fault: number;
  integrityRate: number;
  onlineRate: number;
  eventTotal: number;
}

export interface TvMaintenanceOrder {
  label: string;
  value: number;
  tone: 'grey' | 'blue' | 'red';
}

export interface TvEventBreakdownItem {
  label: string;
  value: number;
  color: string;
}

export interface TvOverview {
  overviewItems: TvOverviewItem[];
  operationStats: TvOperationStats;
  maintenanceOrders: TvMaintenanceOrder[];
  eventBreakdown: TvEventBreakdownItem[];
}

export type TvInspectionKind = 'VEHICLE' | 'PERSON';

export interface TvInspectionItem {
  id: number;
  kind: TvInspectionKind;
  areaCode: string;
  plate: string | null;
  name: string | null;
  badge: string;
  department: string | null;
  gate: string;
  time: string;
}

export interface TvInspectionSummary {
  vehicles: TvInspectionItem[];
  persons: TvInspectionItem[];
}

/** 工业电视地图视频点位（高空AR/重点部位/危险源/厂界四类） */
export interface TvMapPoint {
  id: string;
  label: string;
  /** high-ar 高空AR / focus 重点部位 / hazard 危险源 / boundary 厂界 */
  group: string;
  longitude: number;
  latitude: number;
  height: number;
  online: boolean;
}

/** 视频监控点位档案（点击地图撒点时调取） */
export interface TvMonitorDetail {
  id: string;
  name: string;
  online: boolean;
  /** 完好程度：良好 / 一般 / 损坏 */
  integrity: string;
  /** 监控类型：球机 / 枪机 */
  monitorType: string;
  department: string;
  location: string;
  height: string;
  angle: string;
}

/** 首屏聚合：概览卡片 + 运行统计 + 维保工单 + 事件分析。 */
export async function fetchTvOverview(): Promise<TvOverview> {
  try {
    const data = await request<TvOverview>({ url: '/tv/overview', method: 'GET' });
    if (!data || !Array.isArray(data.overviewItems) || !data.operationStats) {
      backendUnavailableWarn('tv', '/tv/overview', REASON_CONTRACT_MISMATCH);
      return EMPTY_TV_OVERVIEW;
    }
    return data;
  } catch {
    backendUnavailableWarn('tv', '/tv/overview');
    return EMPTY_TV_OVERVIEW;
  }
}

/** 入厂巡检聚合：车辆列表 + 人员列表。 */
export async function fetchTvInspections(): Promise<TvInspectionSummary> {
  try {
    const data = await request<TvInspectionSummary>({ url: '/tv/inspections', method: 'GET' });
    if (!data || !Array.isArray(data.vehicles) || !Array.isArray(data.persons)) {
      backendUnavailableWarn('tv', '/tv/inspections', REASON_CONTRACT_MISMATCH);
      return EMPTY_TV_INSPECTIONS;
    }
    return data;
  } catch {
    backendUnavailableWarn('tv', '/tv/inspections');
    return EMPTY_TV_INSPECTIONS;
  }
}

/** 工业电视地图撒点：GET /tv/map-points（取代前端硬编码 tvVideoMapPoints） */
export async function fetchTvMapPoints(): Promise<TvMapPoint[]> {
  try {
    const data = await request<TvMapPoint[]>({ url: '/tv/map-points', method: 'GET' });
    if (!Array.isArray(data)) {
      backendUnavailableWarn('tv', '/tv/map-points', REASON_CONTRACT_MISMATCH);
      return EMPTY_TV_MAP_POINTS;
    }
    return data;
  } catch {
    backendUnavailableWarn('tv', '/tv/map-points');
    return EMPTY_TV_MAP_POINTS;
  }
}

/** 视频监控点位档案：GET /tv/monitors/{code}（取代前端硬编码 tvVideoMonitorDetails） */
export async function fetchTvMonitor(code: string): Promise<TvMonitorDetail> {
  try {
    const data = await request<TvMonitorDetail>({ url: `/tv/monitors/${code}`, method: 'GET' });
    if (!data || !data.id) {
      backendUnavailableWarn('tv', `/tv/monitors/${code}`, REASON_CONTRACT_MISMATCH);
      return { ...EMPTY_TV_MONITOR, id: code };
    }
    return data;
  } catch {
    backendUnavailableWarn('tv', `/tv/monitors/${code}`);
    return { ...EMPTY_TV_MONITOR, id: code };
  }
}
