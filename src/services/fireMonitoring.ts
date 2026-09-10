import { request } from '@/services/http';
import { backendUnavailableWarn, REASON_CONTRACT_MISMATCH } from '@/services/backendFallback';

// 消防监控大屏（fm-fire）统计与巡查数据（契约：docs/api/fire-monitoring.openapi.json）。
// 后端数据源：fac_rescue_force_stat / fac_special_operation_stat / fac_fire_equipment_status /
// fac_fire_patrol(+item_def/item_result)，由 V10 迁移落地。

/** 消防救援力量分项统计（StatCard 直接消费） */
export interface RescueForceStat {
  label: string;
  value: number;
  unit: string;
  /** squad 队伍 / person 人员 / vehicle 车辆 / equipment 装备 */
  iconType: 'squad' | 'person' | 'vehicle' | 'equipment';
}

/** 八大特殊作业在建数量统计 */
export interface SpecialOperationStat {
  id: number;
  label: string;
  count: number;
}

/** 消防设施设备整体状态；完好率 / 在线率为百分比整数 0-100 */
export interface FireEquipmentStatus {
  total: number;
  offline: number;
  fault: number;
  integrityRate: number;
  onlineRate: number;
}

/** 消防设备分类项（消防设备面板分类卡片网格） */
export interface FireEquipmentItem {
  id: number;
  name: string;
  count: number;
}

export type PatrolShift = '上午' | '下午' | '夜间';
export type PatrolResult = '正常' | '异常' | '不适用';

export interface FirePatrolCheckItem {
  itemCode: string;
  category: string;
  content: string;
  result: PatrolResult;
  abnormalDesc?: string | null;
  photoFile?: string | null;
}

export interface FirePatrolRecord {
  id: number;
  patrolDate: string;
  shift: PatrolShift;
  dutyPerson: string;
  patrolCount: string;
  locations: string[];
  completed: boolean;
  workOrderNo?: string | null;
  checkItems: FirePatrolCheckItem[];
}

/** 开发期自包含 mock（纯静态演示）：数值与 V10 种子保持一致，便于无后端时对照 UI */
const DEV_RESCUE_FORCES: RescueForceStat[] = [
  { label: '消防队伍', value: 10, unit: '支', iconType: 'squad' },
  { label: '救援人员', value: 398, unit: '人', iconType: 'person' },
  { label: '救援装备', value: 123, unit: '套', iconType: 'equipment' },
  { label: '救援车辆', value: 83, unit: '台', iconType: 'vehicle' },
];

const DEV_SPECIAL_OPERATIONS: SpecialOperationStat[] = [
  { id: 1, label: '动火作业', count: 48 },
  { id: 2, label: '盲板抽堵', count: 3 },
  { id: 3, label: '吊装作业', count: 2 },
  { id: 4, label: '动土作业', count: 0 },
  { id: 5, label: '受限空间', count: 9 },
  { id: 6, label: '高处作业', count: 35 },
  { id: 7, label: '临时用电', count: 25 },
  { id: 8, label: '断路作业', count: 1 },
];

const DEV_EQUIPMENT_STATUS: FireEquipmentStatus = {
  total: 1233,
  offline: 23,
  fault: 23,
  integrityRate: 98,
  onlineRate: 98,
};

const DEV_PATROLS: FirePatrolRecord[] = [];

function isRescueForceStat(v: unknown): v is RescueForceStat {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.label === 'string' && typeof o.value === 'number' && typeof o.unit === 'string';
}

function isSpecialOperationStat(v: unknown): v is SpecialOperationStat {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.label === 'string' && typeof o.count === 'number';
}

function isEquipmentStatus(v: unknown): v is FireEquipmentStatus {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.total === 'number' &&
    typeof o.offline === 'number' &&
    typeof o.fault === 'number' &&
    typeof o.integrityRate === 'number' &&
    typeof o.onlineRate === 'number'
  );
}

function isPatrolRecord(v: unknown): v is FirePatrolRecord {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.patrolDate === 'string' && typeof o.dutyPerson === 'string';
}

/** 数组型响应统一收口：结构不符时告警并返回空集合，绝不静默回落到写死假数据。 */
function asArray<T>(data: unknown, guard: (v: unknown) => v is T, endpoint: string): T[] {
  if (!Array.isArray(data)) {
    backendUnavailableWarn('fire-monitoring', endpoint, REASON_CONTRACT_MISMATCH);
    return [];
  }
  const list = data.filter(guard);
  if (list.length !== data.length) {
    backendUnavailableWarn('fire-monitoring', endpoint, '部分条目字段缺失已丢弃');
  }
  return list;
}

/** 消防救援力量统计：GET /fire/rescue-forces */
export async function fetchRescueForces(): Promise<RescueForceStat[]> {
  if (!import.meta.env.VITE_API_BASE) return Promise.resolve(DEV_RESCUE_FORCES);
  try {
    const data = await request<unknown>({ url: '/fire/rescue-forces', method: 'GET' });
    return asArray(data, isRescueForceStat, '/fire/rescue-forces');
  } catch {
    backendUnavailableWarn('fire-monitoring', '/fire/rescue-forces');
    return [];
  }
}

/** 特殊作业统计：GET /fire/special-operations */
export async function fetchSpecialOperations(): Promise<SpecialOperationStat[]> {
  if (!import.meta.env.VITE_API_BASE) return Promise.resolve(DEV_SPECIAL_OPERATIONS);
  try {
    const data = await request<unknown>({ url: '/fire/special-operations', method: 'GET' });
    return asArray(data, isSpecialOperationStat, '/fire/special-operations');
  } catch {
    backendUnavailableWarn('fire-monitoring', '/fire/special-operations');
    return [];
  }
}

/** 消防设施设备状态：GET /fire/equipment-status */
export async function fetchFireEquipmentStatus(): Promise<FireEquipmentStatus | null> {
  if (!import.meta.env.VITE_API_BASE) return Promise.resolve(DEV_EQUIPMENT_STATUS);
  try {
    const data = await request<unknown>({ url: '/fire/equipment-status', method: 'GET' });
    if (!isEquipmentStatus(data)) {
      backendUnavailableWarn('fire-monitoring', '/fire/equipment-status', REASON_CONTRACT_MISMATCH);
      return null;
    }
    return data;
  } catch {
    backendUnavailableWarn('fire-monitoring', '/fire/equipment-status');
    return null;
  }
}

/** 防火巡查记录：GET /fire/patrols */
export async function fetchFirePatrols(): Promise<FirePatrolRecord[]> {
  if (!import.meta.env.VITE_API_BASE) return Promise.resolve(DEV_PATROLS);
  try {
    const data = await request<unknown>({ url: '/fire/patrols', method: 'GET' });
    return asArray(data, isPatrolRecord, '/fire/patrols');
  } catch {
    backendUnavailableWarn('fire-monitoring', '/fire/patrols');
    return [];
  }
}

const DEV_FIRE_EQUIPMENT: FireEquipmentItem[] = [
  '火灾自动报警系统',
  '消防水源',
  '室外消火栓系统',
  '自动喷水灭火系统',
  '气体灭火系统',
  '泡沫灭火系统',
  '干粉灭火系统',
  '防烟排烟系统',
  '防火分隔设施',
  '消防应急广播',
  '应急照明及疏散指示系统',
  '消防电源',
].map((name, index) => ({ id: index + 1, name, count: 665 }));

function isFireEquipmentItem(v: unknown): v is FireEquipmentItem {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === 'number' && typeof o.name === 'string' && typeof o.count === 'number';
}

/** 消防设备分类清单：GET /fire/equipment（取代前端硬编码 fireEquipment） */
export async function fetchFireEquipment(): Promise<FireEquipmentItem[]> {
  if (!import.meta.env.VITE_API_BASE) return Promise.resolve(DEV_FIRE_EQUIPMENT);
  try {
    const data = await request<unknown>({ url: '/fire/equipment', method: 'GET' });
    return asArray(data, isFireEquipmentItem, '/fire/equipment');
  } catch {
    backendUnavailableWarn('fire-monitoring', '/fire/equipment');
    return [];
  }
}
