import { request } from '@/services/http';

// 应急值班值守（B3 Mock 契约 §3.6）
export interface DutyPerson {
  id: string;
  role: '值班长' | '副员' | '应急通讯' | '智能联动' | '热成像' | '白板' | '地图详情';
  name: string;
  phone: string;
  online: boolean;
}

export interface DutyStatus {
  view3d: boolean;
  heatmap: boolean;
  labelsDefault: boolean;
}

export interface DutyRoster {
  status: DutyStatus;
  persons: DutyPerson[];
  actions: Array<'热成像' | '白板' | '地图详情'>;
}

// 开发期自包含 mock（无 VITE_API_BASE 时启用，便于前端脚手架独立演示）
const DEV_FIXTURE: DutyRoster = {
  status: { view3d: true, heatmap: false, labelsDefault: true },
  persons: [
    { id: 'p1', role: '值班长', name: '韩俊', phone: '13792038966', online: true },
    { id: 'p2', role: '副员', name: '王斌', phone: '13303056145', online: true },
    { id: 'p3', role: '应急通讯', name: '高峰', phone: '13303056145', online: false },
    { id: 'p4', role: '智能联动', name: '张林', phone: '13303056145', online: true },
  ],
  actions: ['热成像', '白板', '地图详情'],
};

export async function fetchDutyRoster(): Promise<DutyRoster> {
  if (!import.meta.env.VITE_API_BASE) return Promise.resolve(DEV_FIXTURE);
  try {
    const data = await request<DutyRoster>({ url: '/emergency/duty', method: 'GET' });
    if (!data || !Array.isArray(data.persons) || !data.status) return DEV_FIXTURE;
    return data;
  } catch {
    return DEV_FIXTURE;
  }
}