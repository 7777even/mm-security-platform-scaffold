import http, { request } from '@/services/http';
import { backendUnavailableWarn, resolveOfflineFetch } from '@/services/backendFallback';
import * as searchFixture from '@/services/map-data/securitySearchMock';
import type { SecurityTrackMode } from '@/services/map-data/securityTrackMock';

// 安全防恐数据域：复用共享 fixture 层（services/map-data/*）作为 dev 降级源，
// 并叠加 B3 契约 GET 封装（生产环境 VITE_API_BASE 命中时走 request，否则返回 fixture）。
// 注：camera/gate/bollard 原仅存于 src/screen/lib/data/*，本文件内联为共享 fixture，
// 待 screen 接线轮改指向本服务后，screen 端旧副本统一删除。
export * from '@/services/map-data/securityMock';
export * from '@/services/map-data/securityTrackMock';
export * from '@/services/map-data/securitySearchMock';

// === B5 巡更/通行轨迹 + 检索详情（原 track/search 假数据已迁至后端） ===
export interface SecurityTrackTimelineItem {
  id: number;
  location: string;
  status: string;
  statusTone: 'enter' | 'exit' | 'pass';
  time: string;
  captureHint?: string;
}

export interface SecurityTrackSummary {
  startLabel: string;
  endLabel: string;
  timeRange: string;
}

export interface VehicleSearchDetail extends searchFixture.VehicleSearchResult {
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  company: string;
  appointmentNo: string;
  appointmentTime: string;
  visitPurpose: string;
  waybillNo: string;
  cargo: string;
  destination: string;
}

export interface PersonSearchDetail extends searchFixture.PersonSearchResult {
  gender: string;
  phone: string;
  company: string;
  idNumber: string;
  appointmentNo: string;
  appointmentTime: string;
  visitPurpose: string;
  specialOperation: string;
  operationArea: string;
}

const EMPTY_TIMELINE: SecurityTrackTimelineItem[] = [];

/** 巡更/通行轨迹时间轴：按模式 + 实体拉取；无 VITE_API_BASE 时返回空态（不回灌假数据）。 */
export async function fetchSecurityTrackTimeline(
  mode: SecurityTrackMode,
  entityId?: number | null,
): Promise<SecurityTrackTimelineItem[]> {
  if (!import.meta.env.VITE_API_BASE) return EMPTY_TIMELINE;
  try {
    const data = await request<SecurityTrackTimelineItem[]>({
      url: '/security/track/timeline',
      method: 'GET',
      params: entityId != null ? { mode, entityId } : { mode },
    });
    return Array.isArray(data) ? data : EMPTY_TIMELINE;
  } catch {
    backendUnavailableWarn('security', '/security/track/timeline');
    return EMPTY_TIMELINE;
  }
}

/** 轨迹概要（起止点标签 + 时间范围）。 */
export async function fetchSecurityTrackSummary(
  mode: SecurityTrackMode,
  entityId?: number | null,
): Promise<SecurityTrackSummary | null> {
  if (!import.meta.env.VITE_API_BASE) return null;
  try {
    const data = await request<SecurityTrackSummary>({
      url: '/security/track/summary',
      method: 'GET',
      params: entityId != null ? { mode, entityId } : { mode },
    });
    return data ?? null;
  } catch {
    backendUnavailableWarn('security', '/security/track/summary');
    return null;
  }
}

/** 车辆识别检索详情；未找到返回 null。 */
export async function fetchVehicleSearchDetail(id: number): Promise<VehicleSearchDetail | null> {
  if (!import.meta.env.VITE_API_BASE) return null;
  try {
    const data = await request<VehicleSearchDetail>({
      url: `/security/search/vehicle/${id}`,
      method: 'GET',
    });
    return data ?? null;
  } catch {
    backendUnavailableWarn('security', `/security/search/vehicle/${id}`);
    return null;
  }
}

/** 人员识别检索详情；未找到返回 null。 */
export async function fetchPersonSearchDetail(id: number): Promise<PersonSearchDetail | null> {
  if (!import.meta.env.VITE_API_BASE) return null;
  try {
    const data = await request<PersonSearchDetail>({
      url: `/security/search/person/${id}`,
      method: 'GET',
    });
    return data ?? null;
  } catch {
    backendUnavailableWarn('security', `/security/search/person/${id}`);
    return null;
  }
}

// === B6 周界入侵告警（原 SecurityStatusPanel 的 demo 常量已迁至后端） ===
export interface PerimeterAlarmDetail {
  id: number;
  alarmCode: string;
  title: string;
  alarmType: string;
  source: string;
  level: string;
  status: string;
  falseAlarm: string;
  time: string;
  objectType: string;
  objectName: string;
  location: string;
  description: string;
  deviceType: string;
  deviceId: string;
  point: string;
  intrusionPosition: string;
  intrusionMethod: string;
  relatedCamera: string;
  longitude: number;
  latitude: number;
  dispatchPersonnel: string[];
  notifyApp: boolean;
  notifySms: boolean;
  handleResult: string;
  handleTime: string;
  rescueEventId: number;
  monitorId: string;
  monitorLabel: string;
  workOrderNo: string;
  snapshotPath: string;
  snapshotLabel: string;
}

/** 最新一条周界入侵告警；无告警返回 null。 */
export async function fetchLatestPerimeterAlarm(): Promise<PerimeterAlarmDetail | null> {
  if (!import.meta.env.VITE_API_BASE) return null;
  try {
    const data = await request<PerimeterAlarmDetail>({
      url: '/security/perimeter-alarms/latest',
      method: 'GET',
    });
    return data ?? null;
  } catch {
    backendUnavailableWarn('security', '/security/perimeter-alarms/latest');
    return null;
  }
}

/** 指定周界入侵告警详情；未找到返回 null。 */
export async function fetchPerimeterAlarm(id: number): Promise<PerimeterAlarmDetail | null> {
  if (!import.meta.env.VITE_API_BASE) return null;
  try {
    const data = await request<PerimeterAlarmDetail>({
      url: `/security/perimeter-alarms/${id}`,
      method: 'GET',
    });
    return data ?? null;
  } catch {
    backendUnavailableWarn('security', `/security/perimeter-alarms/${id}`);
    return null;
  }
}

/**
 * 周界入侵告警现场抓拍（blob → objectURL）。
 * 鉴权 seam：抓拍端点需带 token，原生 <img src> 拿不到，故由带鉴权的 http 客户端取字节后转 objectURL。
 */
export async function fetchPerimeterAlarmSnapshotUrl(id: number): Promise<string | null> {
  if (!import.meta.env.VITE_API_BASE) return null;
  try {
    const resp = await http.get<Blob>(`/security/perimeter-alarms/${id}/snapshot`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(resp.data);
  } catch {
    return null;
  }
}

export type PatrolCameraStatus = '正常' | '离线' | '故障';

export interface PatrolCameraItem {
  id: number;
  name: string;
  zone: string;
  status: PatrolCameraStatus;
  longitude: number;
  latitude: number;
}

export const patrolCameraPageSize = 10;

// 本地占位数据：仅作为「未配置 VITE_API_BASE 的纯静态模式」下
// fetchPatrolCameras / fetchGateControls / fetchBollards 的 dev 回落源（见各 fetch* 函数首行判断）。
// 生产环境 VITE_API_BASE 命中时这些 const 不会被用到。大屏 src/screen 面板已改为调用 fetch* 并消费
// 响应式数据（useScreenSecurityData），不再直接 import 本 const。
// 切勿将其当作真实数据展示；仅作布局/联调占位。
export const patrolCameras: PatrolCameraItem[] = [
  {
    id: 1,
    name: '北环路1#',
    zone: '路网防控',
    status: '正常',
    longitude: 110.88165,
    latitude: 21.68112,
  },
  {
    id: 2,
    name: '北环路1#',
    zone: '路网防控',
    status: '离线',
    longitude: 110.8821,
    latitude: 21.6811,
  },
  {
    id: 3,
    name: '北环路1#',
    zone: '路网防控',
    status: '故障',
    longitude: 110.8826,
    latitude: 21.68108,
  },
  {
    id: 4,
    name: '北环路2#',
    zone: '路网防控',
    status: '正常',
    longitude: 110.8832,
    latitude: 21.68106,
  },
  {
    id: 5,
    name: '东卡口3#',
    zone: '门禁卡口防控',
    status: '正常',
    longitude: 110.89175,
    latitude: 21.67778,
  },
  {
    id: 6,
    name: '东卡口4#',
    zone: '门禁卡口防控',
    status: '离线',
    longitude: 110.8917,
    latitude: 21.6757,
  },
  {
    id: 7,
    name: '核心区A-1#',
    zone: '核心区防控',
    status: '正常',
    longitude: 110.88962,
    latitude: 21.67569,
  },
  {
    id: 8,
    name: '核心区A-2#',
    zone: '核心区防控',
    status: '故障',
    longitude: 110.88736,
    latitude: 21.6757,
  },
  {
    id: 9,
    name: '周界西段1#',
    zone: '周界防控',
    status: '正常',
    longitude: 110.87651,
    latitude: 21.68121,
  },
  {
    id: 10,
    name: '周界西段2#',
    zone: '周界防控',
    status: '离线',
    longitude: 110.87382,
    latitude: 21.68353,
  },
  {
    id: 11,
    name: '外围南门1#',
    zone: '外围防控',
    status: '正常',
    longitude: 110.88162,
    latitude: 21.67038,
  },
  {
    id: 12,
    name: '外围南门2#',
    zone: '外围防控',
    status: '正常',
    longitude: 110.88307,
    latitude: 21.67044,
  },
  {
    id: 13,
    name: '炼油大道5#',
    zone: '路网防控',
    status: '故障',
    longitude: 110.88731,
    latitude: 21.6778,
  },
  {
    id: 14,
    name: '炼油大道6#',
    zone: '路网防控',
    status: '正常',
    longitude: 110.8815,
    latitude: 21.67776,
  },
  {
    id: 15,
    name: '西门岗1#',
    zone: '门禁卡口防控',
    status: '离线',
    longitude: 110.87648,
    latitude: 21.68357,
  },
  {
    id: 16,
    name: '西门岗2#',
    zone: '门禁卡口防控',
    status: '正常',
    longitude: 110.87386,
    latitude: 21.68471,
  },
  {
    id: 17,
    name: '核心区B-1#',
    zone: '核心区防控',
    status: '正常',
    longitude: 110.88519,
    latitude: 21.67357,
  },
  {
    id: 18,
    name: '核心区B-2#',
    zone: '核心区防控',
    status: '离线',
    longitude: 110.88307,
    latitude: 21.67359,
  },
  {
    id: 19,
    name: '周界东段1#',
    zone: '周界防控',
    status: '正常',
    longitude: 110.8918,
    latitude: 21.67476,
  },
  {
    id: 20,
    name: '周界东段2#',
    zone: '周界防控',
    status: '故障',
    longitude: 110.89178,
    latitude: 21.67051,
  },
  {
    id: 21,
    name: '外围北门1#',
    zone: '外围防控',
    status: '正常',
    longitude: 110.87449,
    latitude: 21.6847,
  },
  {
    id: 22,
    name: '外围北门2#',
    zone: '外围防控',
    status: '离线',
    longitude: 110.88156,
    latitude: 21.68091,
  },
  {
    id: 23,
    name: '南环路3#',
    zone: '路网防控',
    status: '正常',
    longitude: 110.8898,
    latitude: 21.67808,
  },
  {
    id: 24,
    name: '南环路4#',
    zone: '路网防控',
    status: '正常',
    longitude: 110.8917,
    latitude: 21.67769,
  },
  {
    id: 25,
    name: '东门岗1#',
    zone: '门禁卡口防控',
    status: '故障',
    longitude: 110.89195,
    latitude: 21.6777,
  },
];

export function countPlayableCameras(items: PatrolCameraItem[]): number {
  return items.filter((item) => item.status === '正常').length;
}

export type GateControlStatus = '正常' | '离线' | '故障';

export interface GateControlItem {
  id: number;
  name: string;
  location: string;
  status: GateControlStatus;
  longitude: number;
  latitude: number;
}

export const gateControlPageSize = 10;

export const gateControls: GateControlItem[] = [
  {
    id: 1,
    name: '1#门-道闸1',
    location: '1#门',
    status: '正常',
    longitude: 110.89175,
    latitude: 21.67778,
  },
  {
    id: 2,
    name: '1#门-道闸2',
    location: '1#门',
    status: '正常',
    longitude: 110.8917,
    latitude: 21.6777,
  },
  {
    id: 3,
    name: '1#门-道闸3',
    location: '1#门',
    status: '离线',
    longitude: 110.89165,
    latitude: 21.67762,
  },
  {
    id: 4,
    name: '2#门-道闸1',
    location: '2#门',
    status: '正常',
    longitude: 110.88162,
    latitude: 21.68112,
  },
  {
    id: 5,
    name: '2#门-道闸2',
    location: '2#门',
    status: '故障',
    longitude: 110.88156,
    latitude: 21.68091,
  },
  {
    id: 6,
    name: '3#门-道闸1',
    location: '3#门',
    status: '正常',
    longitude: 110.87648,
    latitude: 21.68357,
  },
  {
    id: 7,
    name: '3#门-道闸2',
    location: '3#门',
    status: '离线',
    longitude: 110.87386,
    latitude: 21.68471,
  },
  {
    id: 8,
    name: '东门-道闸1',
    location: '东门',
    status: '正常',
    longitude: 110.894,
    latitude: 21.6855,
  },
  {
    id: 9,
    name: '南门-道闸1',
    location: '南门',
    status: '正常',
    longitude: 110.8806,
    latitude: 21.6707,
  },
  {
    id: 10,
    name: '西门-道闸1',
    location: '西门',
    status: '正常',
    longitude: 110.8664,
    latitude: 21.6784,
  },
  {
    id: 11,
    name: '北门-道闸1',
    location: '北门',
    status: '离线',
    longitude: 110.8776,
    latitude: 21.6898,
  },
];

export type BollardStatus = '正常' | '离线' | '故障';

export interface BollardItem {
  id: number;
  name: string;
  zone: string;
  status: BollardStatus;
  longitude: number;
  latitude: number;
}

export const bollardPageSize = 10;

export const bollards: BollardItem[] = [
  {
    id: 1,
    name: '1#门防恐柱',
    zone: '1#门',
    status: '正常',
    longitude: 110.89175,
    latitude: 21.67778,
  },
  {
    id: 2,
    name: '1#门防恐柱',
    zone: '1#门',
    status: '离线',
    longitude: 110.8917,
    latitude: 21.6777,
  },
  {
    id: 3,
    name: '1#门防恐柱',
    zone: '1#门',
    status: '故障',
    longitude: 110.89165,
    latitude: 21.67762,
  },
  {
    id: 4,
    name: '2#门防恐柱',
    zone: '2#门',
    status: '正常',
    longitude: 110.88162,
    latitude: 21.68112,
  },
  {
    id: 5,
    name: '2#门防恐柱',
    zone: '2#门',
    status: '正常',
    longitude: 110.88156,
    latitude: 21.68091,
  },
  {
    id: 6,
    name: '3#门防恐柱',
    zone: '3#门',
    status: '正常',
    longitude: 110.87648,
    latitude: 21.68357,
  },
  {
    id: 7,
    name: '3#门防恐柱',
    zone: '3#门',
    status: '离线',
    longitude: 110.87386,
    latitude: 21.68471,
  },
  {
    id: 8,
    name: '东门防恐柱',
    zone: '东门',
    status: '正常',
    longitude: 110.894,
    latitude: 21.6855,
  },
  {
    id: 9,
    name: '南门防恐柱',
    zone: '南门',
    status: '正常',
    longitude: 110.8806,
    latitude: 21.6707,
  },
  {
    id: 10,
    name: '西门防恐柱',
    zone: '西门',
    status: '正常',
    longitude: 110.8664,
    latitude: 21.6784,
  },
  {
    id: 11,
    name: '北门防恐柱',
    zone: '北门',
    status: '离线',
    longitude: 110.8776,
    latitude: 21.6898,
  },
];

/** B3 GET 封装：dev（无 VITE_API_BASE）降级到内置 fixture，生产走 request */
/**
 * 后端未接入降级：不再返回本地假数据，避免「假数据冒充后端」。
 * demo 模式（VITE_USE_DEV_MOCK=true）才使用本地 fixture；未连后端则显式报错 + 空态。
 * VITE_API_BASE 已配置但请求失败/返回非预期时，返回空集合并明确告警，让 UI 显示空态，
 * 待对应后端 controller 建成后（task #15/#16）移除告警、改用真实数据。
 */

export async function fetchPatrolCameras(): Promise<PatrolCameraItem[]> {
  // demo 模式(VITE_USE_DEV_MOCK=true)才走本地 fixture；未连后端则显式报错 + 空态
  const fb = resolveOfflineFetch('security', '/security/patrol-cameras', patrolCameras, []);
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<PatrolCameraItem[]>({
      url: '/security/patrol-cameras',
      method: 'GET',
    });
    return Array.isArray(data) ? data : [];
  } catch {
    backendUnavailableWarn('security', '/security/patrol-cameras');
    return [];
  }
}

export async function fetchGateControls(): Promise<GateControlItem[]> {
  // demo 模式(VITE_USE_DEV_MOCK=true)才走本地 fixture；未连后端则显式报错 + 空态
  const fb = resolveOfflineFetch('security', '/security/gate-controls', gateControls, []);
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<GateControlItem[]>({
      url: '/security/gate-controls',
      method: 'GET',
    });
    return Array.isArray(data) ? data : [];
  } catch {
    backendUnavailableWarn('security', '/security/gate-controls');
    return [];
  }
}

export async function fetchBollards(): Promise<BollardItem[]> {
  // demo 模式(VITE_USE_DEV_MOCK=true)才走本地 fixture；未连后端则显式报错 + 空态
  const fb = resolveOfflineFetch('security', '/security/bollards', bollards, []);
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<BollardItem[]>({ url: '/security/bollards', method: 'GET' });
    return Array.isArray(data) ? data : [];
  } catch {
    backendUnavailableWarn('security', '/security/bollards');
    return [];
  }
}

export async function fetchVehicleSearch(
  keyword?: string,
): Promise<searchFixture.VehicleSearchResult[]> {
  // demo 模式(VITE_USE_DEV_MOCK=true)才走本地 fixture；未连后端则显式报错 + 空态
  const fb = resolveOfflineFetch(
    'security',
    '/security/search/vehicle',
    searchFixture.vehicleSearchResults,
    [],
  );
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<searchFixture.VehicleSearchResult[]>({
      url: '/security/search/vehicle',
      method: 'GET',
      ...(keyword ? { params: { keyword } } : {}),
    });
    return Array.isArray(data) ? data : [];
  } catch {
    backendUnavailableWarn('security', '/security/search/vehicle');
    return [];
  }
}

export async function fetchPersonSearch(
  keyword?: string,
): Promise<searchFixture.PersonSearchResult[]> {
  // demo 模式(VITE_USE_DEV_MOCK=true)才走本地 fixture；未连后端则显式报错 + 空态
  const fb = resolveOfflineFetch(
    'security',
    '/security/search/person',
    searchFixture.personSearchResults,
    [],
  );
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<searchFixture.PersonSearchResult[]>({
      url: '/security/search/person',
      method: 'GET',
      ...(keyword ? { params: { keyword } } : {}),
    });
    return Array.isArray(data) ? data : [];
  } catch {
    backendUnavailableWarn('security', '/security/search/person');
    return [];
  }
}
