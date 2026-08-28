// 应急事件本地 in-memory mock store（B3 脚手架阶段 dev mock；后端契约就位后该文件可整体废弃）
// 用法：crud service 先尝试访问本地 mock（有 VITE_USE_DEV_MOCK=true 或无 VITE_API_BASE），
// 再 fallback HTTP，确保前端 CRUD 全链路可独立演示。

import type {
  AlarmItem,
  AlarmLevel,
  AlarmType,
  AlarmStatus,
  EmergencyCategory,
} from '@/services/alarm';

const KEY = 'em.events.v3';

function seed(): AlarmItem[] {
  // 图示演示数据：覆盖 3 个分类、共 6 条，分页 size=3 时呈现 "1 2"
  return [
    {
      alarmId: 'AE-2026-001',
      level: 2,
      type: 'SOS',
      status: 'DISPATCHED',
      category: 'WEATHER' as EmergencyCategory,
      warned: true,
      title: '台风沙潮向台防灾工作',
      deviceCode: 'WX-EXT-001',
      location: '全厂范围',
      ts: '2026-06-25T08:12:00.000Z',
      description: '台风"沙涌"逼近，启动防台风Ⅱ级响应，重点监测内容与排涝设施',
    },
    {
      alarmId: 'AE-2026-002',
      level: 3,
      type: 'FIRE',
      status: 'ACKED',
      category: 'FIRE_PHONE' as EmergencyCategory,
      warned: true,
      title: 'A装置电话报警',
      deviceCode: 'DT-A-3012',
      location: '为厂区-A装置东北角',
      ts: '2026-03-17T14:21:54.000Z',
      description: 'A装置1#机-第二层防异常报警',
    },
    {
      alarmId: 'AE-2026-003',
      level: 1,
      type: 'FIRE',
      status: 'ACTIVE',
      category: 'FIRE_PHONE' as EmergencyCategory,
      warned: true,
      title: 'B装置烟感触发',
      deviceCode: 'DT-B-3008',
      location: '为厂区-B装置西侧',
      ts: '2026-03-17T13:58:12.000Z',
      description: '烟感探测报警铃持续报警',
    },
    {
      alarmId: 'AE-2026-004',
      level: 2,
      type: 'SOS',
      status: 'ACKED',
      category: 'FIRE_PHONE' as EmergencyCategory,
      warned: false,
      title: 'C装置手动报警',
      deviceCode: 'DT-C-3001',
      location: '为厂区-C装置西南角',
      ts: '2026-03-17T13:12:08.000Z',
      description: '现场人员按下手动火灾报警按钮',
    },
    {
      alarmId: 'AE-2026-005',
      level: 1,
      type: 'GAS',
      status: 'CLOSED',
      category: 'STORAGE_FIRE' as EmergencyCategory,
      warned: true,
      title: '储罐区B-3压力异常',
      deviceCode: 'GS-B-2003',
      location: '储罐区B-3',
      ts: '2026-03-17T12:45:45.000Z',
      description: '储罐顶部压力表读数持续偏高',
    },
    {
      alarmId: 'AE-2026-006',
      level: 2,
      type: 'TEMP',
      status: 'DISPATCHED',
      category: 'STORAGE_FIRE' as EmergencyCategory,
      warned: true,
      title: '储罐区A-1温度越限',
      deviceCode: 'TP-A-0117',
      location: '储罐区A-1',
      ts: '2026-03-17T11:30:08.000Z',
      description: '储罐顶部温度传感器读数持续高于阈值',
    },
    // 以下为扩充的演示数据（前 5 条即图示内容，落在第 1 页）
    {
      alarmId: 'AE-2026-007',
      level: 2,
      type: 'TEMP',
      status: 'ACKED',
      category: 'WEATHER' as EmergencyCategory,
      warned: true,
      title: '暴雨内涝蓝色预警',
      deviceCode: 'WX-RN-014',
      location: '厂区低洼地',
      ts: '2026-03-17T09:42:31.000Z',
      description: '24h 累计降雨超 80mm，低洼路段出现积水',
    },
    {
      alarmId: 'AE-2026-008',
      level: 2,
      type: 'FIRE',
      status: 'DISPATCHED',
      category: 'FIRE_PHONE' as EmergencyCategory,
      warned: true,
      title: 'D装置电气火灾',
      deviceCode: 'DT-D-2019',
      location: '为厂区-D装置配电间',
      ts: '2026-03-17T10:05:47.000Z',
      description: '配电柜温度异常升高触发报警',
    },
    {
      alarmId: 'AE-2026-009',
      level: 3,
      type: 'GAS',
      status: 'ACTIVE',
      category: 'STORAGE_FIRE' as EmergencyCategory,
      warned: false,
      title: '储罐区C-2液位异常',
      deviceCode: 'LV-C-0521',
      location: '储罐区C-2',
      ts: '2026-03-17T10:58:20.000Z',
      description: '液位计读数波动异常，疑似泄漏',
    },
  ];
}

function load(): AlarmItem[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    if (raw) return JSON.parse(raw) as AlarmItem[];
  } catch {
    /* localStorage 不可用，忽略 */
  }
  const initial = seed();
  save(initial);
  return initial;
}

function save(list: AlarmItem[]): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* 忽略持久化失败 */
  }
}

let cache: AlarmItem[] | null = null;

function list(): AlarmItem[] {
  if (!cache) cache = load();
  return cache;
}

// 依据 type 推导 category（图示分类）
function deriveCategory(type: AlarmType): EmergencyCategory {
  switch (type) {
    case 'TEMP':
    case 'SOS':
      return 'WEATHER';
    case 'FIRE':
      return 'FIRE_PHONE';
    case 'GAS':
      return 'STORAGE_FIRE';
    case 'CCTV':
    default:
      return 'OTHER';
  }
}

// 依据 level 推导是否预警（演示用）
function deriveWarned(level: AlarmLevel): boolean {
  return level <= 2;
}

// 依据 type + location 推导事件名称（演示用）
function deriveTitle(type: AlarmType, location: string): string {
  const map: Record<AlarmType, string> = {
    FIRE: '电话报警',
    GAS: '气体越限',
    TEMP: '温度异常',
    CCTV: '视频遮挡',
    SOS: '应急告警',
  };
  return `${location || '现场'}${map[type] ?? '告警'}`;
}

export interface EmergencyEventPayload {
  level: AlarmLevel;
  type: AlarmType;
  status?: AlarmStatus;
  deviceCode: string;
  location: string;
  description: string;
}

export function mockPage(page: number, size: number) {
  const items = list();
  const start = (page - 1) * size;
  return {
    list: items.slice(start, start + size),
    total: items.length,
    page,
    size,
  };
}

export function mockCreate(p: EmergencyEventPayload): AlarmItem {
  const item: AlarmItem = {
    alarmId: `AE-${Date.now().toString(36).toUpperCase()}`,
    level: p.level,
    type: p.type,
    status: (p.status ?? 'ACTIVE') as AlarmStatus,
    deviceCode: p.deviceCode,
    location: p.location,
    ts: new Date().toISOString(),
    description: p.description,
    category: deriveCategory(p.type),
    warned: deriveWarned(p.level),
    title: deriveTitle(p.type, p.location),
  };
  cache = [item, ...list()];
  save(cache);
  return item;
}

export function mockUpdate(id: string, p: EmergencyEventPayload): AlarmItem | null {
  const items = list();
  const idx = items.findIndex((e) => e.alarmId === id);
  if (idx < 0) return null;
  const next: AlarmItem = {
    ...items[idx],
    ...p,
    category: deriveCategory(p.type),
    warned: deriveWarned(p.level),
    title: deriveTitle(p.type, p.location),
  };
  items[idx] = next;
  cache = items;
  save(next as unknown as AlarmItem[]);
  return next;
}

export function mockDelete(id: string): boolean {
  const items = list();
  const next = items.filter((e) => e.alarmId !== id);
  if (next.length === items.length) return false;
  cache = next;
  save(next);
  return true;
}
