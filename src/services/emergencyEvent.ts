import { request } from '@/services/http';
import type { EmergencyEvent } from '@/types/generated';

// 消防应急 / 先期处置事件列表接口（fm-fire-emergency / fm-preliminary），对齐 docs/api/emergency-event.openapi.json。
// 取代 emergencyEventGroups / preliminaryMock / evacuationPeopleMock 硬编码数据。

export type EmergencyAreaCode = 'refinery' | 'chemical' | 'port';
export type EmergencyEventStatus = 'processing' | 'pending' | 'done';
export type EmergencyEventKind = 'event' | 'drill';
export type EmergencyEventCategory = 'default' | 'extremeWeather';

/** 前端「事件类型」可选项（对应新增应急事件表单的「事件类型」字段）。 */
export const EMERGENCY_EVENT_TYPE_OPTIONS = [
  '突发应急事件',
  '演练事件',
  '预警事件',
  '极端天气事件',
] as const;
export type EmergencyEventType = (typeof EMERGENCY_EVENT_TYPE_OPTIONS)[number];

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

/** 由前端事件类型反推 kind / eventCategory，供路由跳转与后端落库使用。 */
export function deriveKindCategory(eventType: string): {
  kind: EmergencyEventKind;
  eventCategory: EmergencyEventCategory;
} {
  if (eventType === '演练事件') return { kind: 'drill', eventCategory: 'default' };
  if (eventType === '极端天气事件') return { kind: 'event', eventCategory: 'extremeWeather' };
  return { kind: 'event', eventCategory: 'default' };
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
