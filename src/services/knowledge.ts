import { request } from '@/services/http';

// 应急生产安全知识（B3 Mock 契约 §3.6）
export interface KnowledgeItem {
  id: string;
  title: string;
  count: number;
  icon: string;
}

export interface KnowledgeList {
  items: KnowledgeItem[];
}

// 开发期自包含 mock：3 类知识卡 × 2 行 = 6 张
const DEV_FIXTURE: KnowledgeList = {
  items: [
    { id: 'k1', title: '岗位应急处置卡', count: 158, icon: 'Document' },
    { id: 'k2', title: '危险化学品知识库', count: 158, icon: 'WarningFilled' },
    { id: 'k3', title: '生产区域疏散路线', count: 158, icon: 'Guide' },
    { id: 'k4', title: '岗位应急处置卡', count: 158, icon: 'Document' },
    { id: 'k5', title: '危险化学品知识库', count: 158, icon: 'WarningFilled' },
    { id: 'k6', title: '生产区域疏散路线', count: 158, icon: 'Guide' },
  ],
};

export async function fetchEmergencyKnowledge(): Promise<KnowledgeList> {
  if (!import.meta.env.VITE_API_BASE) return Promise.resolve(DEV_FIXTURE);
  try {
    const data = await request<KnowledgeList>({ url: '/emergency/knowledge', method: 'GET' });
    if (!data || !Array.isArray(data.items)) return DEV_FIXTURE;
    return data;
  } catch {
    return DEV_FIXTURE;
  }
}
