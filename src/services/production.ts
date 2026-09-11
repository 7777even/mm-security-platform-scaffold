import { request } from '@/services/http';
import {
  backendUnavailableWarn,
  REASON_CONTRACT_MISMATCH,
  resolveOfflineFetch,
} from '@/services/backendFallback';

// 生产应急大屏（fm-production / fm-production-area）数据服务（契约：docs/api/production.openapi.json）。
// 后端数据源：V13 落地的 fac_production_* 九张表（设施 / 设备分类 / 统计 / 报警 / 风险预警 /
// 人员定位 / 设备明细 / 装置区指标 / 装置区分区），取代硬编码的 productionMock 等三份 fixture。
// 降级口径与 fire-monitoring / emergency 一致：请求失败或结构不符 → 空集合 + 显式告警，
// 绝不静默回落假数据（仅未配置 VITE_API_BASE 的纯静态演示模式用 DEV_* 常量）。

/** 总览网格项（设施卡片或设备分类卡片共用） */
export interface OverviewGridItem {
  id: number;
  name: string;
  count: number;
  image: string;
}

/** 统计概览项 */
export interface StatOverviewItem {
  id: number;
  label: string;
  value: string;
  unit: string | null;
  trend: number;
  trendUp: boolean;
  iconIndex: number;
}

/** 风险等级汇总 */
export interface RiskSummary {
  red: number;
  orange: number;
  yellow: number;
}

/** 生产应急首屏总览 */
export interface ProductionOverview {
  facilities: OverviewGridItem[];
  devices: OverviewGridItem[];
  stats: StatOverviewItem[];
  riskSummary: RiskSummary;
}

/** 报警标题配色档位（与契约 enum 对齐） */
export type AlarmTitleColor = 'danger' | 'warning' | 'orange' | 'purple';

/** 生产报警项 */
export interface ProductionAlarmItem {
  id: number;
  title: string;
  titleColor: AlarmTitleColor;
  location: string;
  time: string;
  description: string;
  status: string;
  iconIndex: number;
  thumb: string | null;
}

/** 风险预警项 */
export interface RiskWarningItem {
  id: number;
  location: string;
  type: string;
  time: string;
  person: string;
  phone: string;
  level: 'red' | 'orange' | 'yellow';
  levelLabel: string;
}

/** 人员定位标记（left/top 为舞台百分比串，经纬度供地图打点） */
export interface PersonnelMarker {
  id: number;
  left: string;
  top: string;
  longitude: number;
  latitude: number;
  location: string;
  count: number;
  markerIcon: string | null;
  popupBg: string | null;
  markerDot: string | null;
  markerLine: string | null;
}

/** 装置区分区 */
export interface ProductionAreaZone {
  id: string;
  name: string;
  alarmCount: number;
  zoneIndex: number;
}

/** 装置区指标项 */
export interface ProductionAreaMetric {
  id: number;
  label: string;
  value: string;
}

/** 人员构成切片（环形图） */
export interface PersonnelSlice {
  name: string;
  value: number;
  color: string;
}

/** 装置区二级页聚合详情 */
export interface ProductionAreaDetail {
  facilityId: number;
  facilityName: string;
  zones: ProductionAreaZone[];
  metrics: ProductionAreaMetric[];
  personnelTotal: number;
  personnelSlices: PersonnelSlice[];
  alarms: ProductionAlarmItem[];
}

/** 设备状态 */
export type ProductionDeviceStatus = '正常' | '离线' | '故障';

/** 设备明细 */
export interface ProductionDeviceItem {
  id: number;
  name: string;
  type: string;
  category: string;
  area: string;
  status: ProductionDeviceStatus;
  longitude: number;
  latitude: number;
}

/** 设备分页结果 */
export interface ProductionDevicePage {
  page: number;
  size: number;
  total: number;
  items: ProductionDeviceItem[];
}

/** 设备查询参数（category/status 传空串或「全部状态」表示不过滤） */
export interface ProductionDeviceQuery {
  category?: string;
  status?: string;
  page?: number;
  size?: number;
}

// —— 开发期自包含 mock（纯静态演示）：与 V13 种子保持一致，便于无后端时对照 UI ——
const DEV_FACILITIES: OverviewGridItem[] = [
  { id: 1, name: '厂区', count: 596, image: 'image_0001.png' },
  { id: 2, name: '生产装置', count: 596, image: 'image_0008.png' },
  { id: 3, name: '仓库', count: 596, image: 'image_0006.png' },
  { id: 4, name: '重大危险源', count: 596, image: 'image_0012.png' },
  { id: 5, name: '储罐', count: 596, image: 'image_0007.png' },
];

const DEV_DEVICE_CATEGORIES: OverviewGridItem[] = [
  { id: 1, name: '卡口/通道', count: 596, image: 'image_0002.png' },
  { id: 2, name: '监测点', count: 596, image: 'image_0009.png' },
  { id: 3, name: '人员定位', count: 596, image: 'image_0003.png' },
  { id: 4, name: '消防设施', count: 596, image: 'image_0010.png' },
  { id: 5, name: '通风设备', count: 596, image: 'image_0004.png' },
  { id: 6, name: '广播', count: 596, image: 'image_0011.png' },
  { id: 7, name: '电话', count: 596, image: 'image_0005.png' },
];

const DEV_STATS: StatOverviewItem[] = [
  { id: 1, label: '今日报警', value: '128', unit: '起', trend: 12.5, trendUp: true, iconIndex: 0 },
  {
    id: 2,
    label: '在场人员',
    value: '1042',
    unit: '人',
    trend: -3.2,
    trendUp: false,
    iconIndex: 1,
  },
  { id: 3, label: '设备在线率', value: '96.8', unit: '%', trend: 0.4, trendUp: true, iconIndex: 2 },
  { id: 4, label: '特殊作业', value: '37', unit: '项', trend: 8.1, trendUp: true, iconIndex: 3 },
];

const DEV_RISK_SUMMARY: RiskSummary = { red: 2, orange: 3, yellow: 2 };

const DEV_OVERVIEW: ProductionOverview = {
  facilities: DEV_FACILITIES,
  devices: DEV_DEVICE_CATEGORIES,
  stats: DEV_STATS,
  riskSummary: DEV_RISK_SUMMARY,
};

const DEV_ALARMS: ProductionAlarmItem[] = [
  {
    id: 1,
    title: '人员跌倒',
    titleColor: 'warning',
    location: '化工区乙烯装置东侧',
    time: '2026-03-17 14:21:30',
    description: 'A装置区域发现人员跌倒。',
    status: '未处置',
    iconIndex: 0,
    thumb: 'person_fall.png',
  },
];

const DEV_RISK_WARNINGS: RiskWarningItem[] = [
  {
    id: 1,
    location: '化工区乙烯装置',
    type: '可燃气体泄漏',
    time: '2026-03-17 14:05:00',
    person: '张伟',
    phone: '13800138000',
    level: 'red',
    levelLabel: '重大风险',
  },
];

const DEV_PERSONNEL: PersonnelMarker[] = [];
const DEV_DEVICES: ProductionDevicePage = { page: 1, size: 10, total: 0, items: [] };

const EMPTY_OVERVIEW: ProductionOverview = {
  facilities: [],
  devices: [],
  stats: [],
  riskSummary: { red: 0, orange: 0, yellow: 0 },
};

const EMPTY_AREA_DETAIL = (facilityId: number): ProductionAreaDetail => ({
  facilityId,
  facilityName: '',
  zones: [],
  metrics: [],
  personnelTotal: 0,
  personnelSlices: [],
  alarms: [],
});

const EMPTY_DEVICE_PAGE: ProductionDevicePage = { page: 1, size: 10, total: 0, items: [] };

// —— 结构守卫：响应不符契约时丢弃并告警，避免脏字段流入 UI ——
function isOverviewGridItem(v: unknown): v is OverviewGridItem {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === 'number' && typeof o.name === 'string' && typeof o.count === 'number';
}

function isStatOverviewItem(v: unknown): v is StatOverviewItem {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.label === 'string' && typeof o.value === 'string';
}

function isProductionAlarmItem(v: unknown): v is ProductionAlarmItem {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === 'number' && typeof o.title === 'string' && typeof o.time === 'string';
}

function isRiskWarningItem(v: unknown): v is RiskWarningItem {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === 'number' && typeof o.location === 'string' && typeof o.level === 'string';
}

function isPersonnelMarker(v: unknown): v is PersonnelMarker {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'number' && typeof o.longitude === 'number' && typeof o.latitude === 'number'
  );
}

function isProductionDeviceItem(v: unknown): v is ProductionDeviceItem {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === 'number' && typeof o.name === 'string' && typeof o.status === 'string';
}

/** 数组型响应统一收口：结构不符时告警并返回空集合 */
function asArray<T>(data: unknown, guard: (v: unknown) => v is T, endpoint: string): T[] {
  if (!Array.isArray(data)) {
    backendUnavailableWarn('production', endpoint, REASON_CONTRACT_MISMATCH);
    return [];
  }
  const list = data.filter(guard);
  if (list.length !== data.length) {
    backendUnavailableWarn('production', endpoint, '部分条目字段缺失已丢弃');
  }
  return list;
}

function asRiskSummary(data: unknown): RiskSummary {
  if (!data || typeof data !== 'object') return { red: 0, orange: 0, yellow: 0 };
  const o = data as Record<string, unknown>;
  return {
    red: typeof o.red === 'number' ? o.red : 0,
    orange: typeof o.orange === 'number' ? o.orange : 0,
    yellow: typeof o.yellow === 'number' ? o.yellow : 0,
  };
}

/** 生产应急首屏总览：GET /production/overview */
export async function fetchProductionOverview(): Promise<ProductionOverview> {
  // demo 模式(VITE_USE_DEV_MOCK=true)才走本地 fixture；未连后端则显式报错 + 空态
  const fb = resolveOfflineFetch(
    'production',
    '/production/overview',
    DEV_OVERVIEW,
    EMPTY_OVERVIEW,
  );
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<unknown>({ url: '/production/overview', method: 'GET' });
    if (!data || typeof data !== 'object') {
      backendUnavailableWarn('production', '/production/overview', REASON_CONTRACT_MISMATCH);
      return EMPTY_OVERVIEW;
    }
    const o = data as Record<string, unknown>;
    return {
      facilities: asArray(o.facilities, isOverviewGridItem, '/production/overview(facilities)'),
      devices: asArray(o.devices, isOverviewGridItem, '/production/overview(devices)'),
      stats: asArray(o.stats, isStatOverviewItem, '/production/overview(stats)'),
      riskSummary: asRiskSummary(o.riskSummary),
    };
  } catch {
    backendUnavailableWarn('production', '/production/overview');
    return EMPTY_OVERVIEW;
  }
}

/** 生产报警列表：GET /production/alarms（facilityId 为空返回全部） */
export async function fetchProductionAlarms(facilityId?: number): Promise<ProductionAlarmItem[]> {
  // demo 模式(VITE_USE_DEV_MOCK=true)才走本地 fixture；未连后端则显式报错 + 空态
  const fb = resolveOfflineFetch('production', '/production/alarms', DEV_ALARMS, []);
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<unknown>({
      url: '/production/alarms',
      method: 'GET',
      params: facilityId == null ? undefined : { facilityId },
    });
    return asArray(data, isProductionAlarmItem, '/production/alarms');
  } catch {
    backendUnavailableWarn('production', '/production/alarms');
    return [];
  }
}

/** 风险预警列表：GET /production/risk-warnings */
export async function fetchProductionRiskWarnings(): Promise<RiskWarningItem[]> {
  // demo 模式(VITE_USE_DEV_MOCK=true)才走本地 fixture；未连后端则显式报错 + 空态
  const fb = resolveOfflineFetch('production', '/production/risk-warnings', DEV_RISK_WARNINGS, []);
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<unknown>({ url: '/production/risk-warnings', method: 'GET' });
    return asArray(data, isRiskWarningItem, '/production/risk-warnings');
  } catch {
    backendUnavailableWarn('production', '/production/risk-warnings');
    return [];
  }
}

/** 人员定位标记：GET /production/personnel */
export async function fetchProductionPersonnel(): Promise<PersonnelMarker[]> {
  // demo 模式(VITE_USE_DEV_MOCK=true)才走本地 fixture；未连后端则显式报错 + 空态
  const fb = resolveOfflineFetch('production', '/production/personnel', DEV_PERSONNEL, []);
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<unknown>({ url: '/production/personnel', method: 'GET' });
    return asArray(data, isPersonnelMarker, '/production/personnel');
  } catch {
    backendUnavailableWarn('production', '/production/personnel');
    return [];
  }
}

/** 装置区详情：GET /production/areas/{facilityId} */
export async function fetchProductionAreaDetail(facilityId: number): Promise<ProductionAreaDetail> {
  // 本域离线态与演示态同为 EMPTY_AREA_DETAIL（无假数据）；未连后端显式报错
  const fb = resolveOfflineFetch(
    'production',
    `/production/areas/${facilityId}`,
    EMPTY_AREA_DETAIL(facilityId),
    EMPTY_AREA_DETAIL(facilityId),
  );
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<unknown>({
      url: `/production/areas/${facilityId}`,
      method: 'GET',
    });
    if (!data || typeof data !== 'object') {
      backendUnavailableWarn(
        'production',
        `/production/areas/${facilityId}`,
        REASON_CONTRACT_MISMATCH,
      );
      return EMPTY_AREA_DETAIL(facilityId);
    }
    const o = data as Record<string, unknown> as Partial<ProductionAreaDetail>;
    return {
      facilityId: typeof o.facilityId === 'number' ? o.facilityId : facilityId,
      facilityName: typeof o.facilityName === 'string' ? o.facilityName : '',
      zones: Array.isArray(o.zones) ? (o.zones as ProductionAreaZone[]) : [],
      metrics: Array.isArray(o.metrics) ? (o.metrics as ProductionAreaMetric[]) : [],
      personnelTotal: typeof o.personnelTotal === 'number' ? o.personnelTotal : 0,
      personnelSlices: Array.isArray(o.personnelSlices)
        ? (o.personnelSlices as PersonnelSlice[])
        : [],
      alarms: asArray(o.alarms, isProductionAlarmItem, `/production/areas/${facilityId}(alarms)`),
    };
  } catch {
    backendUnavailableWarn('production', `/production/areas/${facilityId}`);
    return EMPTY_AREA_DETAIL(facilityId);
  }
}

/** 设备清单（分页）：GET /production/devices */
export async function fetchProductionDevices(
  query: ProductionDeviceQuery = {},
): Promise<ProductionDevicePage> {
  const page = query.page ?? 1;
  const size = query.size ?? 10;
  // demo 模式(VITE_USE_DEV_MOCK=true)才走本地 fixture；未连后端则显式报错 + 空态
  const fb = resolveOfflineFetch(
    'production',
    '/production/devices',
    DEV_DEVICES,
    EMPTY_DEVICE_PAGE,
  );
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<unknown>({
      url: '/production/devices',
      method: 'GET',
      params: { page, size, category: query.category, status: query.status },
    });
    if (!data || typeof data !== 'object') {
      backendUnavailableWarn('production', '/production/devices', REASON_CONTRACT_MISMATCH);
      return EMPTY_DEVICE_PAGE;
    }
    const o = data as Record<string, unknown>;
    return {
      page: typeof o.page === 'number' ? o.page : page,
      size: typeof o.size === 'number' ? o.size : size,
      total: typeof o.total === 'number' ? o.total : 0,
      items: asArray(o.items, isProductionDeviceItem, '/production/devices'),
    };
  } catch {
    backendUnavailableWarn('production', '/production/devices');
    return EMPTY_DEVICE_PAGE;
  }
}

// —— 共享域工具（原 productionDeviceMock 提供，接线后统一由此服务导出，避免平行 data 层）——
export type ProductionDeviceCategory =
  '卡口/通道' | '监测点' | '人员定位' | '消防设施' | '通风设备' | '广播' | '电话';

export const productionDevicePageSize = 10;

export const productionDeviceStatusOptions = ['全部状态', '正常', '离线', '故障'] as const;

export function statusTone(status: ProductionDeviceStatus): 'ok' | 'offline' | 'fault' {
  if (status === '正常') return 'ok';
  if (status === '离线') return 'offline';
  return 'fault';
}

export function resolveDeviceCategoryTitle(category: string | null): string {
  if (!category) return '设备列表';
  if (category === '消防设施') return '自动灭火设备';
  return `${category}列表`;
}

/** 装置区人员构成切片别名（与 productionAreaMock 既有命名保持一致） */
export type ProductionAreaPersonnelSlice = PersonnelSlice;

/** 按设备分类过滤（保留原 mock 的客户端收窄能力，数据来自 fetchProductionDevices） */
export function getDevicesByCategory(
  items: ProductionDeviceItem[],
  category: string | null,
): ProductionDeviceItem[] {
  if (!category) return items;
  return items.filter((d) => d.category === category);
}
