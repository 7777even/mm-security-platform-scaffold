import { request } from '@/services/http';

// 消防应急 / 先期处置事件列表接口（fm-fire-emergency / fm-preliminary），对齐 docs/api/emergency-event.openapi.json。
// 取代 emergencyEventGroups / preliminaryMock / evacuationPeopleMock 硬编码数据。

export type EmergencyAreaCode = 'refinery' | 'chemical' | 'port';
export type EmergencyEventStatus = 'processing' | 'pending' | 'done';
export type EmergencyEventKind = 'event' | 'drill';
export type EmergencyEventCategory = 'default' | 'extremeWeather';

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
