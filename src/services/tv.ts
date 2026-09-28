import http, { request } from '@/services/http';
import { ref } from 'vue';
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

/** 录像截图审核状态。 */
export type TvSnapshotReviewStatus = 'PENDING' | 'ACKED';

/** 录像截图采集入库请求（设备/采集端上报）。 */
export interface TvSnapshotIngestRequest {
  /** 监控点位编码（关联 fac_tv_monitor.monitor_code） */
  monitorCode: string;
  /** 点位名称（可选；缺省后端按 monitor_code 回查） */
  monitorName?: string | null;
  /** 采集时刻（设备上报，字符串避免时区/方言差异）；缺省用服务端入库时刻 */
  captureTime?: string | null;
  /** 事件类型：人员闯入/烟火检测/区域入侵/手动抓拍；缺省=设备自动 */
  eventType?: string | null;
  /** base64 JPEG（可带 data:image/jpeg;base64, 前缀，后端自动剥离） */
  imageBase64: string;
  /** 来源：DEVICE 设备采集 / MANUAL 手工；缺省 DEVICE */
  source?: string | null;
}

/** 录像截图采集入库结果。 */
export interface TvSnapshotIngestResult {
  id: number;
  monitorCode: string;
  captureTime?: string | null;
  /** PENDING 待确认（落库默认态） */
  reviewStatus?: TvSnapshotReviewStatus;
  createdAt?: string | null;
}

/** 录像截图列表项。 */
export interface TvSnapshotItem {
  id: number;
  monitorCode: string;
  monitorName?: string | null;
  captureTime?: string | null;
  eventType?: string | null;
  /** PENDING 待确认 / ACKED 已确认 */
  reviewStatus?: TvSnapshotReviewStatus;
  /** DEVICE 设备采集 / MANUAL 手工 */
  source?: string | null;
  createdAt?: string | null;
  /** 是否含截图字节（供前端决定是否请求 blob 端点） */
  hasImage?: boolean;
}

/** 录像截图分页列表。 */
export interface TvSnapshotPage {
  total: number;
  page: number;
  size: number;
  pages: number;
  list: TvSnapshotItem[];
}

/** 录像截图确认结果。 */
export interface TvSnapshotAckResult {
  id: number;
  /** ACKED 已确认（PENDING→ACKED） */
  reviewStatus?: TvSnapshotReviewStatus;
}

const EMPTY_TV_SNAPSHOT_PAGE: TvSnapshotPage = {
  total: 0,
  page: 1,
  size: 20,
  pages: 0,
  list: [],
};

/**
 * 录像截图采集入库变更信号：本端写回（采集/确认）成功后置位，
 * 面板 watch 后即时重拉（覆盖 ws 尚未连通/延迟场景）；跨端/跨标签页由后端
 * @RealtimeSync 广播 tv.snapshot.changed 经 subscribeDomainChange 触发。
 */
export const tvSnapshotChanged = ref(0);

export function touchTvSnapshotChanged(): void {
  tvSnapshotChanged.value += 1;
}

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

/** 录像截图分页列表：GET /tv/snapshots?page=&size=。前端订阅 tv.snapshot.changed 实时刷新。 */
export async function fetchTvSnapshots(page = 1, size = 20): Promise<TvSnapshotPage> {
  try {
    const data = await request<TvSnapshotPage>({
      url: '/tv/snapshots',
      method: 'GET',
      params: { page, size },
    });
    if (!data || !Array.isArray(data.list)) {
      backendUnavailableWarn('tv', '/tv/snapshots', REASON_CONTRACT_MISMATCH);
      return EMPTY_TV_SNAPSHOT_PAGE;
    }
    return data;
  } catch {
    backendUnavailableWarn('tv', '/tv/snapshots');
    return EMPTY_TV_SNAPSHOT_PAGE;
  }
}

/**
 * 录像截图字节（blob → objectURL）。
 * 鉴权 seam：截图端点需带 token，原生 <img src> 拿不到，故由带鉴权的 http 客户端取字节后转 objectURL。
 * 无截图数据时后端按设计返 404，此处抹平为 null（与周界抓拍同口径）。
 */
export async function fetchTvSnapshotUrl(id: number): Promise<string | null> {
  if (!import.meta.env.VITE_API_BASE) return null;
  try {
    const resp = await http.get<Blob>(`/tv/snapshots/${id}/snapshot`, { responseType: 'blob' });
    return URL.createObjectURL(resp.data);
  } catch {
    return null;
  }
}

/**
 * 录像截图采集入库（设备/采集端自助上报）。仅登录态即可（同 Uplink 口径）。
 * 成功后后端广播 tv.snapshot.changed，调用方通常再 touchTvSnapshotChanged 触发同端即时刷新。
 * 失败（含 403 无权限）抛出，由调用方面板 toast 具体原因。
 */
export async function submitTvSnapshot(
  payload: TvSnapshotIngestRequest,
): Promise<TvSnapshotIngestResult> {
  return request<TvSnapshotIngestResult>({
    url: '/tv/snapshots',
    method: 'POST',
    data: payload,
  });
}

/**
 * 确认录像截图（PENDING→ACKED）。需权限码 video:snapshot:ack（V79 已登记并授权 ADMIN 及岗位角色）。
 * 成功后后端广播 tv.snapshot.changed；失败（含 403 无权限）抛出，由调用方面板 toast 具体原因。
 */
export async function ackTvSnapshot(id: number): Promise<TvSnapshotAckResult> {
  return request<TvSnapshotAckResult>({
    url: `/tv/snapshots/${id}/ack`,
    method: 'POST',
  });
}
