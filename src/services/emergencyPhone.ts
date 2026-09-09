import { request } from '@/services/http';
import { backendUnavailableWarn, REASON_CONTRACT_MISMATCH } from '@/services/backendFallback';

// 应急电话通讯录（B3 Mock 契约 §3.6）
export interface EmergencyPhone {
  id: string;
  name: string;
  number: string;
  category: '消防' | '医疗' | '公安' | '厂内应急' | '保卫值班' | '应急通讯' | '智能联动';
}

export interface EmergencyPhoneBook {
  entries: EmergencyPhone[];
}

// 开发期自包含 mock：8 行关键应急电话
const DEV_FIXTURE: EmergencyPhoneBook = {
  entries: [
    { id: 'ph1', name: '消防报警', number: '119', category: '消防' },
    { id: 'ph2', name: '医疗急救', number: '120', category: '医疗' },
    { id: 'ph3', name: '公安报警', number: '110', category: '公安' },
    { id: 'ph4', name: '厂内应急指挥', number: '8001', category: '厂内应急' },
    { id: 'ph5', name: '保卫值班', number: '8002', category: '保卫值班' },
    { id: 'ph6', name: '应急通讯台', number: '8003', category: '应急通讯' },
    { id: 'ph7', name: '智能联动中心', number: '8004', category: '智能联动' },
    { id: 'ph8', name: '环保应急', number: '12369', category: '厂内应急' },
  ],
};

/** 后端不可用时的空态：不再回落 DEV_FIXTURE，避免假数据冒充后端（见 backendFallback.ts）。 */
const EMPTY: EmergencyPhoneBook = { entries: [] };

export async function fetchEmergencyPhones(): Promise<EmergencyPhoneBook> {
  // 纯静态 / 演示模式（未配置后端地址）仍用 fixture，此时不存在误判后端就绪的风险
  if (!import.meta.env.VITE_API_BASE) return Promise.resolve(DEV_FIXTURE);
  try {
    const data = await request<EmergencyPhoneBook>({ url: '/emergency/phones', method: 'GET' });
    if (!data || !Array.isArray(data.entries)) {
      backendUnavailableWarn('emergencyPhone', '/emergency/phones', REASON_CONTRACT_MISMATCH);
      return EMPTY;
    }
    return data;
  } catch {
    backendUnavailableWarn('emergencyPhone', '/emergency/phones');
    return EMPTY;
  }
}
