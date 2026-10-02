import { request } from '@/services/http';
import {
  backendUnavailableWarn,
  REASON_CONTRACT_MISMATCH,
  resolveOfflineFetch,
} from '@/services/backendFallback';

// 事故案例库（可编辑台账，B3 Mock 契约 §3.6）
export interface EmergencyCaseItem {
  id: string;
  title: string;
  accidentType?: string | null;
  location?: string | null;
  /** 发生时间（yyyy-MM-dd HH:mm:ss） */
  occurredAt?: string | null;
  summary?: string | null;
  lessons?: string | null;
}

export interface EmergencyCaseList {
  items: EmergencyCaseItem[];
}

// 开发期自包含 mock：2 条示例案例（仅 demo 模式 VITE_USE_DEV_MOCK=true 回落，不冒充后端）
const DEV_FIXTURE: EmergencyCaseList = {
  items: [
    {
      id: '1',
      title: 'T-301 罐区泄漏处置复盘',
      accidentType: '泄漏',
      location: '储运部 T-301 罐区',
      occurredAt: '2026-08-21 09:03:00',
      summary: '初起泄漏点位于进料线阀门法兰，巡检及时发现并启动围堵，未扩大。',
      lessons: '法兰螺栓定期紧固 + 巡检路线覆盖进料线是关键。',
    },
    {
      id: '2',
      title: '泵房电气火灾应急案例',
      accidentType: '火灾',
      location: '动力车间 3# 泵房',
      occurredAt: '2026-09-05 14:20:00',
      summary: '电机过载引燃周边线缆，断电后干粉灭火成功。',
      lessons: '过载保护定值复核 + 电缆桥架防火封堵需加强。',
    },
  ],
};

/** 后端不可用时的空态：不再回落 DEV_FIXTURE，避免假数据冒充后端。 */
const EMPTY: EmergencyCaseList = { items: [] };

export async function fetchEmergencyCases(): Promise<EmergencyCaseList> {
  const fb = resolveOfflineFetch('case', '/emergency/cases', DEV_FIXTURE, EMPTY);
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<EmergencyCaseList>({ url: '/emergency/cases', method: 'GET' });
    if (!data || !Array.isArray(data.items)) {
      backendUnavailableWarn('case', '/emergency/cases', REASON_CONTRACT_MISMATCH);
      return EMPTY;
    }
    return data;
  } catch {
    backendUnavailableWarn('case', '/emergency/cases');
    return EMPTY;
  }
}

// ==================== 写侧：案例库台账 CRUD ====================
// 权限码：emergency:case:write（V96 登记，授权 ADMIN / COMMANDER / SCHEDULER）。

/** 案例库条目新增 / 编辑入参（字段名对齐 EmergencyCaseItem）。 */
export interface EmergencyCaseWriteRequest {
  title?: string;
  accidentType?: string;
  location?: string;
  occurredAt?: string;
  summary?: string;
  lessons?: string;
}

/** 新增事故案例。 */
export async function createEmergencyCase(
  payload: EmergencyCaseWriteRequest,
): Promise<EmergencyCaseItem> {
  return request<EmergencyCaseItem>({
    url: '/emergency/cases',
    method: 'POST',
    data: payload,
  });
}

/** 编辑事故案例（局部更新）。 */
export async function updateEmergencyCase(
  id: number,
  payload: EmergencyCaseWriteRequest,
): Promise<EmergencyCaseItem> {
  return request<EmergencyCaseItem>({
    url: `/emergency/cases/${id}`,
    method: 'PUT',
    data: payload,
  });
}

/** 删除事故案例。 */
export async function deleteEmergencyCase(id: number): Promise<void> {
  await request<null>({ url: `/emergency/cases/${id}`, method: 'DELETE' });
}
