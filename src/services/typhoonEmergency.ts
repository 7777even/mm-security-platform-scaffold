import { request } from '@/services/http';
import {
  backendUnavailableWarn,
  REASON_CONTRACT_MISMATCH,
  notifyBackendOffline,
} from '@/services/backendFallback';

// 台风应急大屏（fm-typhoon）数据（契约：docs/api/typhoon-emergency.openapi.json）。
// 后端数据源：V11 落地的 fac_typhoon_* 表；值班人员沿用 sys_duty_member。

export type MonitorObjectStatus = 'normal' | 'warning' | 'critical';

export interface TyphoonMonitorObject {
  id: string;
  name: string;
  value: string;
  unit: string;
  status: MonitorObjectStatus;
  statusText: string;
}

export interface TyphoonRiskWarning {
  id: string;
  time: string;
  type: string;
  content: string;
}

export interface TyphoonMapRiskPoint {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  status: MonitorObjectStatus;
  statusText: string;
  responsibleUnit: string;
  predeployed: boolean;
  deployment: string;
  labelOffsetX?: number;
  labelOffsetY?: number;
  clusterCount?: number;
  kind?: 'risk' | 'resource';
  videoIds?: string[];
}

export interface TyphoonLiveVideo {
  id: string;
  label: string;
  sceneIndex: number;
  angle: string;
  status: 'online' | 'offline';
  deviceCode: string;
}

export interface TyphoonAuxItem {
  id: number;
  line1: string;
  line2: string;
  count: number;
  countTone: 'lime' | 'cyan';
  iconIndex: number;
}

export interface TyphoonDutyPerson {
  id: number;
  name: string;
  role: string;
  phone: string;
  avatarIndex: number;
}

export interface TyphoonEventInfoField {
  label: string;
  value: string;
}

export interface TyphoonEmergencyIncident {
  eventId: number;
  title: string;
  location: string;
  longitude: number;
  latitude: number;
  startedAt: string;
  endedAt?: string;
  status: 'processing' | 'pending' | 'done';
  monitoringObjects: TyphoonMonitorObject[];
  meteorologySummary: string;
  riskWarnings: TyphoonRiskWarning[];
  weatherChartLabels: string[];
  precipitationSeries: number[];
  windSpeedSeries: number[];
  waterLevelLabels: string[];
  waterLevelSeries: number[];
  waterLevelWarn: number;
  waterLevelDanger: number;
  liveVideos: TyphoonLiveVideo[];
  auxiliaryItems: TyphoonAuxItem[];
  dutyPersons: TyphoonDutyPerson[];
  mapRiskPoints: TyphoonMapRiskPoint[];
  eventInfoFields: TyphoonEventInfoField[];
  /** istrongcloud 台风编号，如 202518 */
  typhoonApiCode?: string;
}

export interface TyphoonDispatchResource {
  id: string;
  type: string;
  name: string;
  code: string;
  organization: string;
  area: string;
  status: string;
  distanceKm: number;
  etaMinutes: number;
  capacity: string;
  contact: string;
  phone: string;
  longitude: number;
  latitude: number;
}

function isIncident(v: unknown): v is TyphoonEmergencyIncident {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.title === 'string' && Array.isArray(o.monitoringObjects);
}

function isDispatchResource(v: unknown): v is TyphoonDispatchResource {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.name === 'string';
}

/** 台风应急事件聚合：GET /typhoon/incident（eventId 省略时返回默认防台防汛事件） */
export async function fetchTyphoonIncident(
  eventId?: number,
): Promise<TyphoonEmergencyIncident | null> {
  if (!import.meta.env.VITE_API_BASE) {
    // 仅离线演示（显式 VITE_USE_DEV_MOCK=true）才走本地 fixture；否则显式报错 + 空态
    if (import.meta.env.VITE_USE_DEV_MOCK === 'true') {
      const { resolveTyphoonEmergencyIncidentV2 } =
        await import('@/screen/lib/data/typhoonEmergencyMock');
      return resolveTyphoonEmergencyIncidentV2(eventId);
    }
    notifyBackendOffline(
      'typhoon',
      '/typhoon/incident',
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    return null;
  }
  try {
    const url =
      eventId == null
        ? '/typhoon/incident'
        : `/typhoon/incident?eventId=${encodeURIComponent(eventId)}`;
    const data = await request<unknown>({ url, method: 'GET' });
    if (!isIncident(data)) {
      backendUnavailableWarn('typhoon', '/typhoon/incident', REASON_CONTRACT_MISMATCH);
      return null;
    }
    return data;
  } catch {
    backendUnavailableWarn('typhoon', '/typhoon/incident');
    return null;
  }
}

/** 防汛排涝可调度力量清单：GET /typhoon/dispatch-resources */
export async function fetchTyphoonDispatchResources(): Promise<TyphoonDispatchResource[]> {
  if (!import.meta.env.VITE_API_BASE) {
    // 仅离线演示（显式 VITE_USE_DEV_MOCK=true）才走本地 fixture；否则显式报错 + 空态
    if (import.meta.env.VITE_USE_DEV_MOCK === 'true') {
      const { typhoonDispatchResources } = await import('@/screen/lib/data/typhoonEmergencyMock');
      return typhoonDispatchResources;
    }
    notifyBackendOffline(
      'typhoon',
      '/typhoon/dispatch-resources',
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    return [];
  }
  try {
    const data = await request<unknown>({ url: '/typhoon/dispatch-resources', method: 'GET' });
    if (!Array.isArray(data)) {
      backendUnavailableWarn('typhoon', '/typhoon/dispatch-resources', REASON_CONTRACT_MISMATCH);
      return [];
    }
    return data.filter(isDispatchResource);
  } catch {
    backendUnavailableWarn('typhoon', '/typhoon/dispatch-resources');
    return [];
  }
}
