import { request } from '@/services/http';
import { backendUnavailableWarn, REASON_CONTRACT_MISMATCH } from '@/services/backendFallback';

// 消防态势地图聚合点位接口，对齐 docs/api/fire-situation.openapi.json。
// 取代 fireSituationMapMock 中的业务数据（事件/处置/告警聚合点位）。

export type FireSituationMarkerKind = 'event' | 'operation' | 'alarm';

export interface FireSituationMarkerItem {
  id: string;
  kind: FireSituationMarkerKind;
  title: string;
  subtitle: string;
  longitude: number;
  latitude: number;
  important: boolean;
  iconUrl: string;
  level?: string;
  targetId: number;
}

export interface FireSituationMarkerSummary {
  items: FireSituationMarkerItem[];
}

/** 后端不可用时的空态（绝不回灌假数据）。 */
const EMPTY_MARKERS: FireSituationMarkerSummary = { items: [] };

/** 消防态势地图聚合点位：事件/处置/告警三类点位。 */
export async function fetchFireSituationMarkers(): Promise<FireSituationMarkerSummary> {
  try {
    const data = await request<FireSituationMarkerSummary>({
      url: '/fire-situation/markers',
      method: 'GET',
    });
    if (!data || !Array.isArray(data.items)) {
      backendUnavailableWarn('fire-situation', '/fire-situation/markers', REASON_CONTRACT_MISMATCH);
      return EMPTY_MARKERS;
    }
    return data;
  } catch {
    backendUnavailableWarn('fire-situation', '/fire-situation/markers');
    return EMPTY_MARKERS;
  }
}

// 以下两类数据取代 SafetyAlarmPanel / FireMonitoredObjectsPanel 的硬编码业务数据，
// 由后端 /api/v1/fire-situation/areas 与 /monitored-objects 真实端点提供。

export type FireAreaStatus = 'normal' | 'attention';

export interface FireMonitorArea {
  id: string;
  scope: string;
  name: string;
  status: FireAreaStatus;
  statusLabel: string;
  equipment: number;
  cameras: number;
  personnel: number;
}

export interface FireMonitorAreaSummary {
  items: FireMonitorArea[];
}

export type FireObjectTone = 'danger' | 'warning' | 'normal';

export interface FireMonitoredObject {
  name: string;
  status: string;
  detail: string;
  tone: FireObjectTone;
}

export interface FireMonitoredObjectSummary {
  items: FireMonitoredObject[];
}

const EMPTY_AREAS: FireMonitorAreaSummary = { items: [] };
const EMPTY_OBJECTS: FireMonitoredObjectSummary = { items: [] };

/** 各装置区消防保障汇总（设备/视频/人员/状态）。 */
export async function fetchFireMonitorAreas(): Promise<FireMonitorAreaSummary> {
  try {
    const data = await request<FireMonitorAreaSummary>({
      url: '/fire-situation/areas',
      method: 'GET',
    });
    if (!data || !Array.isArray(data.items)) {
      backendUnavailableWarn('fire-situation', '/fire-situation/areas', REASON_CONTRACT_MISMATCH);
      return EMPTY_AREAS;
    }
    return data;
  } catch {
    backendUnavailableWarn('fire-situation', '/fire-situation/areas');
    return EMPTY_AREAS;
  }
}

/** 重点监控对象列表（状态/详情/配色）。 */
export async function fetchFireMonitoredObjects(): Promise<FireMonitoredObjectSummary> {
  try {
    const data = await request<FireMonitoredObjectSummary>({
      url: '/fire-situation/monitored-objects',
      method: 'GET',
    });
    if (!data || !Array.isArray(data.items)) {
      backendUnavailableWarn(
        'fire-situation',
        '/fire-situation/monitored-objects',
        REASON_CONTRACT_MISMATCH,
      );
      return EMPTY_OBJECTS;
    }
    return data;
  } catch {
    backendUnavailableWarn('fire-situation', '/fire-situation/monitored-objects');
    return EMPTY_OBJECTS;
  }
}
