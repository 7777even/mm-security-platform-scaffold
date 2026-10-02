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
  /** 知识分类说明（真实可编辑文案，后端 sys_knowledge_item.description）。 */
  description?: string | null;
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

// ==================== 写侧：知识库台账 CRUD ====================
// 权限码：emergency:knowledge:write（V94 登记，授权 ADMIN / COMMANDER / SCHEDULER）。
// 编辑一律局部更新：字段为 undefined 表示不修改。

/** 知识库条目新增 / 编辑入参（字段名对齐 KnowledgeItem）。 */
export interface KnowledgeWriteRequest {
  title?: string;
  count?: number;
  icon?: string;
  description?: string;
}

/** 新增知识库条目。 */
export async function createKnowledge(payload: KnowledgeWriteRequest): Promise<KnowledgeItem> {
  return request<KnowledgeItem>({
    url: '/emergency/knowledge',
    method: 'POST',
    data: payload,
  });
}

/** 编辑知识库条目（局部更新）。 */
export async function updateKnowledge(
  id: number,
  payload: KnowledgeWriteRequest,
): Promise<KnowledgeItem> {
  return request<KnowledgeItem>({
    url: `/emergency/knowledge/${id}`,
    method: 'PUT',
    data: payload,
  });
}

/** 删除知识库条目。 */
export async function deleteKnowledge(id: number): Promise<void> {
  await request<null>({ url: `/emergency/knowledge/${id}`, method: 'DELETE' });
}
