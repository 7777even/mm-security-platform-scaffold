import { request } from '@/services/http';
import {
  backendUnavailableWarn,
  REASON_CONTRACT_MISMATCH,
  resolveOfflineFetch,
} from '@/services/backendFallback';

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

/** 后端不可用时的空态：不再回落 DEV_FIXTURE，避免假数据冒充后端（见 backendFallback.ts）。 */
const EMPTY: KnowledgeList = { items: [] };

export async function fetchEmergencyKnowledge(): Promise<KnowledgeList> {
  // demo 模式(VITE_USE_DEV_MOCK=true)才走本地 fixture；未连后端则显式报错 + 空态
  const fb = resolveOfflineFetch('knowledge', '/emergency/knowledge', DEV_FIXTURE, EMPTY);
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<KnowledgeList>({ url: '/emergency/knowledge', method: 'GET' });
    if (!data || !Array.isArray(data.items)) {
      backendUnavailableWarn('knowledge', '/emergency/knowledge', REASON_CONTRACT_MISMATCH);
      return EMPTY;
    }
    return data;
  } catch {
    backendUnavailableWarn('knowledge', '/emergency/knowledge');
    return EMPTY;
  }
}
