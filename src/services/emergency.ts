import { request } from '@/services/http';

// 应急力量数据（B3 Mock 契约 §3.6）：车辆 / 处置力量 / 待命资源数
export type EmergencyResourceKind =
  '消防车' | '救护车' | '警用车' | '防化车' | '工程车' | '应急物资' | '消防站' | '医疗点';

export interface EmergencyResource {
  kind: EmergencyResourceKind;
  total: number;
  onDuty: number;
}

export interface EmergencyStrength {
  resources: EmergencyResource[];
}

// 开发期自包含 mock：8 个核心应急力量维度（2×4 救援网格）
const DEV_FIXTURE: EmergencyStrength = {
  resources: [
    { kind: '消防车', total: 47, onDuty: 32 },
    { kind: '救护车', total: 3510, onDuty: 0 },
    { kind: '警用车', total: 52, onDuty: 24 },
    { kind: '防化车', total: 10, onDuty: 8 },
    { kind: '工程车', total: 55, onDuty: 12 },
    { kind: '应急物资', total: 80, onDuty: 60 },
    { kind: '消防站', total: 12, onDuty: 12 },
    { kind: '医疗点', total: 36, onDuty: 30 },
  ],
};

export async function fetchEmergencyStrength(): Promise<EmergencyStrength> {
  if (!import.meta.env.VITE_API_BASE) return Promise.resolve(DEV_FIXTURE);
  try {
    const data = await request<EmergencyStrength>({ url: '/emergency/strength', method: 'GET' });
    if (!data || !Array.isArray(data.resources)) return DEV_FIXTURE;
    return data;
  } catch {
    return DEV_FIXTURE;
  }
}
