import { request } from '@/services/http';

// 工业电视大屏接口（fm-tv），对齐 docs/api/tv.openapi.json。
// 取代 tvMock 中的业务数据（概览/运行统计/维保/事件/巡检记录）；
// 地图撒点、地图标签、巡检圆与扫描点位为前端静态几何，仍留在 tvMock。

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

/** 首屏聚合：概览卡片 + 运行统计 + 维保工单 + 事件分析。 */
export async function fetchTvOverview(): Promise<TvOverview> {
  return request<TvOverview>({ url: '/tv/overview', method: 'GET' });
}

/** 入厂巡检聚合：车辆列表 + 人员列表。 */
export async function fetchTvInspections(): Promise<TvInspectionSummary> {
  return request<TvInspectionSummary>({ url: '/tv/inspections', method: 'GET' });
}
