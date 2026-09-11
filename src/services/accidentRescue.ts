import { request } from '@/services/http';
import {
  backendUnavailableWarn,
  REASON_CONTRACT_MISMATCH,
  notifyBackendOffline,
} from '@/services/backendFallback';
import type { EmergencyDispatchResource } from '@/screen/lib/data/accidentRescueMock';

export interface IncidentDetailField {
  label: string;
  value: string;
}

export interface RescueDutyPerson {
  id: number;
  name: string;
  role?: string;
  phone?: string;
  avatarIndex?: number;
}

export interface RescueAuxiliaryStat {
  label: string;
  value: number;
  iconIndex: number;
}

export interface RescueDynamicEntry {
  id: number;
  /** 演练 fixture 不提供，真实后端按 rescue/command/brief/awareness 分类下发 */
  category?: string;
  title?: string;
  tag?: string;
  time?: string;
  command?: string;
  responder?: string;
  reply?: string;
  stageLabel?: string;
  /** 现场图文/语音回传（演练 fixture 提供，真实后端按需可选） */
  media?: Array<{
    id: string;
    type: 'image' | 'audio';
    name: string;
    src?: string;
    duration?: string;
  }>;
}

/** 事故救援事件聚合（含详情字段、调度资源、值班人员、辅助统计、动态快讯）。形状对齐 accident-rescue.openapi.json。 */
export interface AccidentRescuePayload {
  eventId: number;
  title: string;
  location: string;
  longitude: number;
  latitude: number;
  hazardSourceLevel?: string;
  mapStatus: string;
  startedAt?: string;
  endedAt?: string;
  status: 'processing' | 'pending' | 'done';
  reported: boolean;
  facilityName: string;
  detailFields: IncidentDetailField[];
  dispatchResources: EmergencyDispatchResource[];
  dutyPersons: RescueDutyPerson[];
  auxiliaryStats: RescueAuxiliaryStat[];
  dynamics: RescueDynamicEntry[];
}

const EMPTY: AccidentRescuePayload = {
  eventId: 0,
  title: '',
  location: '',
  longitude: 0,
  latitude: 0,
  hazardSourceLevel: undefined,
  mapStatus: '',
  startedAt: undefined,
  endedAt: undefined,
  status: 'pending',
  reported: false,
  facilityName: '',
  detailFields: [],
  dispatchResources: [],
  dutyPersons: [],
  auxiliaryStats: [],
  dynamics: [],
};

/**
 * 拉取事故救援事件聚合。纯静态演示（未配置 VITE_API_BASE）时回落本地 fixture；
 * 配置后端后走真实端点，后端失败/结构不符时暴露式降级为空数据并告警，绝不冒充真实数据。
 */
export async function fetchAccidentIncident(eventId?: number): Promise<AccidentRescuePayload> {
  if (!import.meta.env.VITE_API_BASE) {
    // 仅离线演示（显式 VITE_USE_DEV_MOCK=true）才走本地 fixture；否则显式报错 + 空态
    if (import.meta.env.VITE_USE_DEV_MOCK === 'true') {
      const { resolveAccidentRescueIncident } =
        await import('@/screen/lib/data/accidentRescueMock');
      return resolveAccidentRescueIncident(eventId) as unknown as AccidentRescuePayload;
    }
    notifyBackendOffline(
      'accident-rescue',
      '/accident/rescue-incident',
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    return EMPTY;
  }

  try {
    const data = await request<AccidentRescuePayload>({
      url: '/accident/rescue-incident',
      method: 'GET',
      params: eventId == null ? undefined : { eventId },
    });
    if (!data || !data.title) {
      backendUnavailableWarn(
        'accident-rescue',
        '/accident/rescue-incident',
        REASON_CONTRACT_MISMATCH,
      );
      return EMPTY;
    }
    return data;
  } catch {
    backendUnavailableWarn('accident-rescue', '/accident/rescue-incident');
    return EMPTY;
  }
}

export type { EmergencyDispatchResource };
