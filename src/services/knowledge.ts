import { request } from '@/services/http';

// 应急生产安全知识（B3 Mock 契约 §3.6）
export interface KnowledgeItem {
  id: string;
  title: string;
  category: '装置应急' | '罐区应急' | '装卸应急' | '公用应急';
  notMastered: number;
  mastered: number;
}

export interface KnowledgeList {
  items: KnowledgeItem[];
}

// 开发期自包含 mock：6 条知识条目，按装置 / 罐区 / 装卸 / 公用工程 4 大类均布
const DEV_FIXTURE: KnowledgeList = {
  items: [
    { id: 'k1', title: '岗位应急', category: '装置应急', notMastered: 158, mastered: 240 },
    { id: 'k2', title: '总化险', category: '装置应急', notMastered: 158, mastered: 200 },
    { id: 'k3', title: '生产区域', category: '装置应急', notMastered: 158, mastered: 320 },
    { id: 'k4', title: '防静电', category: '罐区应急', notMastered: 158, mastered: 180 },
    { id: 'k5', title: '总化险（罐区）', category: '罐区应急', notMastered: 158, mastered: 190 },
    { id: 'k6', title: '总化区域', category: '公用应急', notMastered: 158, mastered: 220 },
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