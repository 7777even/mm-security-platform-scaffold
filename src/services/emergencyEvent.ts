import { request } from '@/services/http';
import type { EmergencyEvent } from '@/types/generated';

// 消防应急 / 先期处置事件列表接口（fm-fire-emergency / fm-preliminary），对齐 docs/api/emergency-event.openapi.json。
// 取代 emergencyEventGroups / preliminaryMock / evacuationPeopleMock 硬编码数据。

export type EmergencyAreaCode = 'refinery' | 'chemical' | 'port';
export type EmergencyEventStatus = 'processing' | 'pending' | 'done';
export type EmergencyEventKind = 'event' | 'drill';
export type EmergencyEventCategory = 'default' | 'extremeWeather';

/** 单个「事件类型」的完整定义：
 * - kind / eventCategory 决定业务语义与明细页（event/drill、是否极端天气专用页）；
 * - groupCode / groupLabel 是落库分组（fac_emergency_event.group_code / group_label），决定大屏侧栏
 *   分组标题；与后端 V17 种子分组同码（phone/tank/facility/video/extreme-weather）的会在同一分组内合并展示。 */
export interface EmergencyEventTypeDef {
  kind: EmergencyEventKind;
  eventCategory: EmergencyEventCategory;
  groupCode: string;
  groupLabel: string;
}

/**
 * 事件类型主登记表 —— 表单「事件类型」下拉、创建落库分组、展示推导的唯一真源。
 * 新增「事件类型」只需在此登记：表单下拉随业务大类自动扩展（见 EMERGENCY_EVENT_TYPE_BY_BUSINESS），
 * 创建时按登记表的 groupCode/groupLabel 归组，无需再改表单与创建链路。
 */
export const EMERGENCY_EVENT_TYPE_DEFS = {
  突发应急事件: {
    kind: 'event',
    eventCategory: 'default',
    groupCode: 'manual-event',
    groupLabel: '突发应急事件',
  },
  预警事件: {
    kind: 'event',
    eventCategory: 'default',
    groupCode: 'manual-warning',
    groupLabel: '预警事件',
  },
  极端天气事件: {
    kind: 'event',
    eventCategory: 'extremeWeather',
    groupCode: 'extreme-weather',
    groupLabel: '极端天气',
  },
  消防电话报警: {
    kind: 'event',
    eventCategory: 'default',
    groupCode: 'phone',
    groupLabel: '消防电话报警',
  },
  储罐消防报警: {
    kind: 'event',
    eventCategory: 'default',
    groupCode: 'tank',
    groupLabel: '储罐消防报警',
  },
  消防设施异常: {
    kind: 'event',
    eventCategory: 'default',
    groupCode: 'facility',
    groupLabel: '消防设施异常',
  },
  视频烟火联动: {
    kind: 'event',
    eventCategory: 'default',
    groupCode: 'video',
    groupLabel: '视频烟火联动',
  },
  演练事件: {
    kind: 'drill',
    eventCategory: 'default',
    groupCode: 'manual-drill',
    groupLabel: '演练事件',
  },
} as const satisfies Record<string, EmergencyEventTypeDef>;

export type EmergencyEventType = keyof typeof EMERGENCY_EVENT_TYPE_DEFS;

/** 前端「事件类型」可选项（登记表全部键，对应新增应急事件表单的「事件类型」字段）。 */
export const EMERGENCY_EVENT_TYPE_OPTIONS = Object.keys(
  EMERGENCY_EVENT_TYPE_DEFS,
) as EmergencyEventType[];

/** 业务大类 ↔ 事件类型的映射（新增弹窗顶部单选用「大类」，下拉用具体事件类型）。
 * 极端天气事件与各报警来源（消防电话 / 储罐 / 消防设施 / 视频）均归在「应急事件」大类下。 */
export const EMERGENCY_EVENT_TYPE_BY_BUSINESS = {
  event: [
    '突发应急事件',
    '预警事件',
    '极端天气事件',
    '消防电话报警',
    '储罐消防报警',
    '消防设施异常',
    '视频烟火联动',
  ],
  drill: ['演练事件'],
} as const;

export type EmergencyEventBusinessType = keyof typeof EMERGENCY_EVENT_TYPE_BY_BUSINESS;

/** 由具体事件类型反推业务大类。 */
export function deriveBusinessType(eventType: string): EmergencyEventBusinessType {
  for (const [biz, types] of Object.entries(EMERGENCY_EVENT_TYPE_BY_BUSINESS)) {
    if ((types as readonly string[]).includes(eventType)) return biz as EmergencyEventBusinessType;
  }
  return 'event';
}

/**
 * 后端未持久化 eventType，按 kind / eventCategory 推导前端展示用事件类型（兜底）。
 * 表单新增事件则直接携带用户所选的 eventType。
 */
export function deriveEventType(
  kind?: EmergencyEventKind,
  eventCategory?: EmergencyEventCategory,
): string {
  if (kind === 'drill') return '演练事件';
  if (eventCategory === 'extremeWeather') return '极端天气事件';
  return '突发应急事件';
}

/**
 * 由前端事件类型反推 kind / eventCategory / groupCode / groupLabel，供路由跳转与后端落库使用。
 * 未登记的类型回落到「突发应急事件」分组，避免产生游离分组。
 */
export function deriveKindCategory(eventType: string): EmergencyEventTypeDef {
  const def = (EMERGENCY_EVENT_TYPE_DEFS as Record<string, EmergencyEventTypeDef>)[eventType];
  return def ? { ...def } : { ...EMERGENCY_EVENT_TYPE_DEFS['突发应急事件'] };
}

export interface EmergencyEventWeatherMeta {
  weatherType: string;
  warningLevel: string;
  affectedArea: string;
  monitoringPeriod: string;
  source: string;
  measures: string;
}

export interface EmergencyEventItem {
  id: number;
  areaCode?: EmergencyAreaCode;
  title: string;
  location: string;
  description: string;
  time: string;
  reported: boolean;
  status: EmergencyEventStatus;
  statusLabel: string;
  left: string;
  top: string;
  longitude: number;
  latitude: number;
  kind?: EmergencyEventKind;
  eventCategory?: EmergencyEventCategory;
  /** 前端展示用事件类型（新增应急事件表单「事件类型」字段）；后端未返回时由 kind/category 推导。 */
  eventType?: string;
  hazardSourceLevel?: string;
  endedAt?: string | null;
  weatherMeta?: EmergencyEventWeatherMeta;
}

export interface EmergencyEventGroup {
  id: string;
  label: string;
  events: EmergencyEventItem[];
}

export interface EvacuationPerson {
  id: string;
  name: string;
  org: string;
  job: string;
  routeProgress: number;
}

export type EmergencyEventScene = 'FIRE' | 'PRELIMINARY';

/** 新增应急事件入参（对齐后端 dto.EmergencyEventCreateRequest，由契约生成）。 */
export type EmergencyEventCreateRequest =
  EmergencyEvent.components['schemas']['EmergencyEventCreateRequest'];

/** 新增应急事件（仅登录态）。后端同事务写入 fac_emergency_event 与 fac_accident_incident（is_default=false），
 * 返回后端生成的真实事件 id，供「去处置」按 event_id 定位（不再回退默认事件）。 */
export async function createEmergencyEvent(
  payload: EmergencyEventCreateRequest,
): Promise<EmergencyEventItem> {
  return request<EmergencyEventItem>({
    url: '/emergency-events',
    method: 'POST',
    data: payload,
  });
}

/** 应急事件分组列表：scene=FIRE 仅消防、scene=PRELIMINARY 仅先期处置，缺省返回全部（FIRE 在前）。 */
export async function fetchEmergencyEvents(
  scene?: EmergencyEventScene,
): Promise<EmergencyEventGroup[]> {
  return request<EmergencyEventGroup[]>({
    url: '/emergency-events',
    method: 'GET',
    params: scene ? { scene } : undefined,
  });
}

/** 疏散人员进度列表，count 控制返回条数上限（不传返回全部）。 */
export async function fetchEvacuationPeople(count?: number): Promise<EvacuationPerson[]> {
  return request<EvacuationPerson[]>({
    url: '/emergency-events/evacuation-people',
    method: 'GET',
    params: count !== undefined ? { count } : undefined,
  });
}
