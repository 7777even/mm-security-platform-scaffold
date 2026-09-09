import { request } from '@/services/http';
import { backendUnavailableWarn, REASON_CONTRACT_MISMATCH } from '@/services/backendFallback';

// 应急力量数据（B3 Mock 契约 §3.6）：按维度统计资源数量
export type EmergencyResourceKind =
  | '应急专家'
  | '应急物资'
  | '救援队伍'
  | '装备车辆'
  | '应急场所'
  | '医疗机构'
  | '应急车辆'
  | '消防设施';

export interface EmergencyResource {
  kind: EmergencyResourceKind;
  count: number;
  icon: string;
}

export interface EmergencyStrength {
  resources: EmergencyResource[];
}

// 开发期自包含 mock：8 个核心应急力量维度（2 列 × 4 行网格）
const DEV_FIXTURE: EmergencyStrength = {
  resources: [
    { kind: '应急专家', count: 47, icon: 'UserFilled' },
    { kind: '应急物资', count: 3510, icon: 'Box' },
    { kind: '救援队伍', count: 10, icon: 'Avatar' },
    { kind: '装备车辆', count: 55, icon: 'Tools' },
    { kind: '应急场所', count: 52, icon: 'OfficeBuilding' },
    { kind: '医疗机构', count: 80, icon: 'FirstAidKit' },
    { kind: '应急车辆', count: 33, icon: 'Van' },
    { kind: '消防设施', count: 11, icon: 'Warning' },
  ],
};

/** 后端不可用时的空态：不再回落 DEV_FIXTURE，避免假数据冒充后端（见 backendFallback.ts）。 */
const EMPTY: EmergencyStrength = { resources: [] };

export async function fetchEmergencyStrength(): Promise<EmergencyStrength> {
  // 纯静态 / 演示模式（未配置后端地址）仍用 fixture，此时不存在误判后端就绪的风险
  if (!import.meta.env.VITE_API_BASE) return Promise.resolve(DEV_FIXTURE);
  try {
    const data = await request<EmergencyStrength>({ url: '/emergency/strength', method: 'GET' });
    if (!data || !Array.isArray(data.resources)) {
      backendUnavailableWarn('emergency', '/emergency/strength', REASON_CONTRACT_MISMATCH);
      return EMPTY;
    }
    return data;
  } catch {
    backendUnavailableWarn('emergency', '/emergency/strength');
    return EMPTY;
  }
}
