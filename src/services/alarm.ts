import { request } from '@/services/http';
import { notifyBackendOffline } from '@/services/backendFallback';
import type { PageResult } from '@/types';
import {
  mockPage,
  mockCreate,
  mockUpdate,
  mockDelete,
  type EmergencyEventPayload,
} from '@/services/emergencyEventStore';

// 报警/态势数据接口（对齐 B3 Mock 契约：REST 包络 + 分页 {list,total,page,size}）
export type AlarmLevel = 1 | 2 | 3 | 4;
export type AlarmStatus = 'ACTIVE' | 'ACKED' | 'DISPATCHED' | 'CLOSED';
export type AlarmType = 'FIRE' | 'GAS' | 'TEMP' | 'CCTV' | 'SOS';

// 应急事件分类（图示分组：极端天气 / 消防电话报警 / 储罐消防报警 / 其他）
export type EmergencyCategory = 'WEATHER' | 'FIRE_PHONE' | 'STORAGE_FIRE' | 'OTHER';

export interface AlarmItem {
  alarmId: string;
  level: AlarmLevel;
  type: AlarmType;
  status: AlarmStatus;
  deviceCode: string;
  location: string;
  ts: string;
  description: string;
  // 应急事件扩展字段（图示卡片所需：分类、是否预警、事件名称）
  category?: EmergencyCategory;
  warned?: boolean;
  title?: string;
  planId?: string;
}

export interface DashboardOverview {
  activeAlarm: number;
  deviceOnline: number;
  deviceTotal: number;
  riskIndex: number;
  onlineWorkstation: number;
  ts: string;
}

export interface AlarmTrendPoint {
  hour: string;
  count: number;
}

/** dev mock 开关：仅显式 VITE_USE_DEV_MOCK=true 才走 in-memory store（离线演示）。 */
function useDevMock(): boolean {
  return import.meta.env.VITE_USE_DEV_MOCK === 'true';
}

/** 未连后端且未开演示：显式报错。 */
function isAlarmOffline(): boolean {
  return !import.meta.env.VITE_API_BASE && !useDevMock();
}

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  return request<DashboardOverview>({ url: '/dashboard/overview', method: 'GET' });
}

export async function fetchAlarmTrend(): Promise<AlarmTrendPoint[]> {
  return request<AlarmTrendPoint[]>({ url: '/dashboard/alarm-trend', method: 'GET' });
}

export async function fetchAlarmPage(page = 1, size = 5): Promise<PageResult<AlarmItem>> {
  if (useDevMock()) return Promise.resolve(mockPage(page, size));
  // 未连后端：显式报错 + 空态（不回灌内存 mock 假数据）
  if (isAlarmOffline()) {
    notifyBackendOffline(
      'alarm',
      '/alarms',
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    return { list: [], total: 0, page, size };
  }
  try {
    return await request<PageResult<AlarmItem>>({
      url: '/alarms',
      method: 'GET',
      params: { page, size },
    });
  } catch {
    notifyBackendOffline('alarm', '/alarms');
    return { list: [], total: 0, page, size };
  }
}

export async function createEmergencyEvent(p: EmergencyEventPayload): Promise<AlarmItem> {
  if (useDevMock()) return Promise.resolve(mockCreate(p));
  // 未连后端：写操作显式报错
  if (isAlarmOffline()) {
    notifyBackendOffline(
      'alarm',
      '/alarms',
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    throw new Error('后端未连接，无法创建应急事件');
  }
  return request<AlarmItem>({ url: '/alarms', method: 'POST', data: p });
}

export async function updateEmergencyEvent(
  id: string,
  p: EmergencyEventPayload,
): Promise<AlarmItem | null> {
  if (useDevMock()) return Promise.resolve(mockUpdate(id, p));
  if (isAlarmOffline()) {
    notifyBackendOffline(
      'alarm',
      `/alarms/${id}`,
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    throw new Error('后端未连接，无法更新应急事件');
  }
  return request<AlarmItem>({ url: `/alarms/${encodeURIComponent(id)}`, method: 'PUT', data: p });
}

export async function deleteEmergencyEvent(id: string): Promise<boolean> {
  if (useDevMock()) return Promise.resolve(mockDelete(id));
  if (isAlarmOffline()) {
    notifyBackendOffline(
      'alarm',
      `/alarms/${id}`,
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    throw new Error('后端未连接，无法删除应急事件');
  }
  return request<{ ok: boolean }>({
    url: `/alarms/${encodeURIComponent(id)}`,
    method: 'DELETE',
  }).then(() => true);
}

// —— 消防报警列表（fire-monitoring 域模型，区别于通用 AlarmItem）——
// 注：level 为 GDS 阈值文本（'-'/'高报'/'高高报'），与规范 AlarmLevel(1-4) 是不同维度；
// type/level 分类体系待后端契约 #TODO-确认，脚手架以 fire 富模型为临时真源，dev 降级保留当前行为。
export type FireAlarmTypeTone = 'fire' | 'smoke' | 'gds' | 'muted';

export interface FireAlarmItem {
  alarmId: string;
  typeLabel: string;
  typeTone: FireAlarmTypeTone;
  source: string;
  objectType: string;
  objectName: string;
  level: string;
  description: string;
  location: string;
  time: string;
  falseAlarm: string;
  status: AlarmStatus;
  rescueEventId?: string;
  monitorId?: string;
  monitorLabel?: string;
  onsiteMonitorId?: string;
  onsiteMonitorLabel?: string;
  title: string;
}

const FIRE_ALARM_TEMPLATES: Omit<FireAlarmItem, 'alarmId' | 'time'>[] = [
  {
    typeLabel: '火灾报警',
    typeTone: 'fire',
    source: '火灾报警',
    objectType: '装置',
    objectName: '蜡油加氢装置',
    level: '-',
    description: '蜡油加氢装置区疑似出现明火，请核实。',
    location: '化工区-蜡油加氢装置区',
    falseAlarm: '未核实',
    status: 'ACTIVE',
    rescueEventId: '1',
    monitorId: 'cam-a-east',
    monitorLabel: '蜡油加氢东侧监控',
    onsiteMonitorId: 'cam-a-site',
    onsiteMonitorLabel: '蜡油加氢现场监控',
    title: '蜡油加氢装置火灾',
  },
  {
    typeLabel: '烟雾报警',
    typeTone: 'smoke',
    source: '火灾报警',
    objectType: '储罐',
    objectName: '储罐区B-3',
    level: '-',
    description: '储罐区B-3顶部烟雾浓度异常升高，请现场复核。',
    location: '储运区-储罐区B-3',
    falseAlarm: '否',
    status: 'ACTIVE',
    rescueEventId: '2',
    monitorId: 'cam-tank-b3',
    monitorLabel: '储罐区B-3监控',
    onsiteMonitorId: 'cam-tank-b3-site',
    onsiteMonitorLabel: '储罐区现场监控',
    title: '储罐区B-3烟雾',
  },
  {
    typeLabel: 'GDS报警',
    typeTone: 'gds',
    source: 'DCS/GDS',
    objectType: '装置',
    objectName: '催化裂化装置',
    level: '高高报',
    description: '催化裂化装置可燃气检测点浓度超限，请立即处置。',
    location: '炼油区-催化裂化装置',
    falseAlarm: '未核实',
    status: 'ACTIVE',
    rescueEventId: '3',
    monitorId: 'cam-fcc-01',
    monitorLabel: '催化裂化监控',
    onsiteMonitorId: 'cam-fcc-site',
    onsiteMonitorLabel: '催化裂化现场监控',
    title: '催化裂化GDS报警',
  },
  {
    typeLabel: '烟雾报警',
    typeTone: 'muted',
    source: '视频识别',
    objectType: '仓库',
    objectName: '仓储区A库',
    level: '-',
    description: '仓储区A库视频监控识别烟雾，经核实为维保测试，已关闭。',
    location: '仓储区-A库',
    falseAlarm: '是',
    status: 'CLOSED',
    rescueEventId: '4',
    monitorId: 'cam-store-a',
    monitorLabel: '仓储区监控',
    onsiteMonitorId: 'cam-store-site',
    onsiteMonitorLabel: '仓库现场监控',
    title: '仓储区A库烟雾',
  },
  {
    typeLabel: '火灾报警',
    typeTone: 'fire',
    source: '火灾报警',
    objectType: '装置',
    objectName: '重整装置',
    level: '-',
    description: '重整装置泵房感温电缆报警，请派员现场确认。',
    location: '化工区-重整装置泵房',
    falseAlarm: '否',
    status: 'ACTIVE',
    rescueEventId: '5',
    monitorId: 'cam-reform-01',
    monitorLabel: '重整装置监控',
    onsiteMonitorId: 'cam-reform-site',
    onsiteMonitorLabel: '重整现场监控',
    title: '重整装置火灾',
  },
  {
    typeLabel: 'GDS报警',
    typeTone: 'gds',
    source: 'DCS/GDS',
    objectType: '管网',
    objectName: '火炬系统',
    level: '高报',
    description: '火炬系统周边可燃气检测短时波动，请关注。',
    location: '公用工程区-火炬系统',
    falseAlarm: '未核实',
    status: 'ACTIVE',
    rescueEventId: '6',
    monitorId: 'cam-torch-01',
    monitorLabel: '火炬系统监控',
    onsiteMonitorId: 'cam-torch-site',
    onsiteMonitorLabel: '火炬系统现场监控',
    title: '火炬系统GDS',
  },
  {
    typeLabel: '设备故障',
    typeTone: 'muted',
    source: '火灾报警',
    objectType: '装置',
    objectName: '蜡油加氢装置',
    level: '-',
    description: '感烟探测器通讯中断，已派维保人员检修。',
    location: '化工区-蜡油加氢装置区',
    falseAlarm: '否',
    status: 'CLOSED',
    rescueEventId: '7',
    monitorId: 'cam-a-east',
    monitorLabel: '蜡油加氢东侧监控',
    onsiteMonitorId: 'cam-a-site',
    onsiteMonitorLabel: '蜡油加氢现场监控',
    title: '蜡油加氢设备故障',
  },
  {
    typeLabel: '火灾报警',
    typeTone: 'fire',
    source: '人工上报',
    objectType: '储罐',
    objectName: '储罐区B-3',
    level: '-',
    description: '巡检人员报告储罐区有异味，请联动气体检测复核。',
    location: '储运区-储罐区B-3',
    falseAlarm: '未核实',
    status: 'ACTIVE',
    rescueEventId: '8',
    monitorId: 'cam-tank-b3',
    monitorLabel: '储罐区B-3监控',
    onsiteMonitorId: 'cam-tank-b3-site',
    onsiteMonitorLabel: '储罐区现场监控',
    title: '储罐区人工上报',
  },
  {
    typeLabel: '烟雾报警',
    typeTone: 'smoke',
    source: '视频识别',
    objectType: '装置',
    objectName: '催化裂化装置',
    level: '-',
    description: '催化裂化装置西侧视频识别到烟雾团，请核实。',
    location: '炼油区-催化裂化装置西侧',
    falseAlarm: '否',
    status: 'ACTIVE',
    rescueEventId: '9',
    monitorId: 'cam-fcc-01',
    monitorLabel: '催化裂化监控',
    onsiteMonitorId: 'cam-fcc-site',
    onsiteMonitorLabel: '催化裂化现场监控',
    title: '催化裂化烟雾',
  },
  {
    typeLabel: 'GDS报警',
    typeTone: 'gds',
    source: 'DCS/GDS',
    objectType: '装置',
    objectName: '蜡油加氢装置',
    level: '高高报',
    description: '蜡油加氢装置硫化氢检测点高高报，请启动应急预案。',
    location: '化工区-蜡油加氢装置区',
    falseAlarm: '否',
    status: 'ACTIVE',
    rescueEventId: '10',
    monitorId: 'cam-a-east',
    monitorLabel: '蜡油加氢东侧监控',
    onsiteMonitorId: 'cam-a-site',
    onsiteMonitorLabel: '蜡油加氢现场监控',
    title: '蜡油加氢GDS高高报',
  },
];

function formatFireAlarmTime(index: number): string {
  const day = 31 - Math.floor(index / 3);
  const hour = 10 + (index % 8);
  const minute = 14 + (index % 45);
  const second = 12 + (index % 48);
  return `2026.5.${day} ${hour}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
}

const FIRE_ALARM_FIXTURE: FireAlarmItem[] = Array.from({ length: 50 }, (_, index) => {
  const base = FIRE_ALARM_TEMPLATES[index % FIRE_ALARM_TEMPLATES.length]!;
  return { ...base, alarmId: String(index + 1), time: formatFireAlarmTime(index) };
});

/** 消防报警列表：仅离线演示（VITE_USE_DEV_MOCK=true）返回内置 fixture；有 base 走 /fire-alarms 真实接口；未连后端显式报错 + 空态 */
export async function fetchFireAlarmPage(page = 1, size = 10): Promise<PageResult<FireAlarmItem>> {
  if (useDevMock()) {
    const start = (page - 1) * size;
    return Promise.resolve({
      list: FIRE_ALARM_FIXTURE.slice(start, start + size),
      total: FIRE_ALARM_FIXTURE.length,
      page,
      size,
    });
  }
  // 未连后端：显式报错 + 空态（不回灌 fixture 假数据）
  if (isAlarmOffline()) {
    notifyBackendOffline(
      'alarm',
      '/fire-alarms',
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    return { list: [], total: 0, page, size };
  }
  try {
    return await request<PageResult<FireAlarmItem>>({
      url: '/fire-alarms',
      method: 'GET',
      params: { page, size },
    });
  } catch {
    notifyBackendOffline('alarm', '/fire-alarms');
    return { list: [], total: 0, page, size };
  }
}
