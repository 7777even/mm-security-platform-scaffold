import { request } from '@/services/http';
import {
  backendUnavailableWarn,
  REASON_CONTRACT_MISMATCH,
  resolveOfflineFetch,
} from '@/services/backendFallback';

// 应急预案矩阵 / 预案切换接口（fm-accident-rescue 应急指挥），对齐 docs/api/emergency-plan.openapi.json。
// 取代 planMatrixMock / emergencyPlanSwitchMock 中的硬编码数据。

export interface EmergencyPlanTab {
  key: string;
  label: string;
}

export interface SelectableEmergencyPlan {
  id: string;
  tab: string;
  name: string;
  accidentType: string;
  facility: string;
}

export interface EmergencyPlanOptions {
  tabs: EmergencyPlanTab[];
  accidentTypes: string[];
  facilities: string[];
  plans: SelectableEmergencyPlan[];
}

export interface PlanMajorPhase {
  id: string;
  name: string;
  order: number;
  upgradeProcess?: string;
}

export interface PlanSubPhase {
  id: string;
  parentId: string;
  name: string;
  order: number;
  progress?: number;
}

export interface PlanRiskEvent {
  id: string;
  subPhaseId: string;
  name: string;
}

export interface PlanCombatResource {
  id: string;
  name: string;
  expectedCount: string;
  actualCount: string;
  leaderName?: string;
  contactPhone?: string;
  duties: string;
  lon?: number;
  lat?: number;
}

export type PlanActionCardStatus = 'pending' | 'in-progress' | 'completed';

export interface PlanActionCard {
  id: string;
  resourceId: string;
  title: string;
  content?: string;
  description?: string;
  startSubPhaseId: string;
  endSubPhaseId: string;
  riskEventId?: string;
  status: PlanActionCardStatus;
  isGlobal?: boolean;
}

export interface PlanInstance {
  id: string;
  title: string;
  description: string;
  majorPhases: PlanMajorPhase[];
  subPhases: PlanSubPhase[];
  riskEvents: PlanRiskEvent[];
  resources: PlanCombatResource[];
  actionCards: PlanActionCard[];
}

/** 应急预案选项聚合：Tab / 事故类型 / 设施 / 可选预案清单。 */
export async function fetchEmergencyPlanOptions(): Promise<EmergencyPlanOptions> {
  return request<EmergencyPlanOptions>({ url: '/emergency-plans/options', method: 'GET' });
}

/** 预案矩阵实例；planId 不传时返回默认（首个）预案矩阵。 */
export async function fetchPlanMatrix(planId?: string): Promise<PlanInstance> {
  return request<PlanInstance>({
    url: '/emergency-plans/matrix',
    method: 'GET',
    params: planId != null ? { planId } : undefined,
  });
}

/** 新建预案行动卡片入参（resourceId/title/startSubPhaseId/endSubPhaseId 必填）。 */
export interface PlanActionCardCreate {
  resourceId: string;
  title: string;
  content?: string;
  description?: string;
  startSubPhaseId: string;
  endSubPhaseId: string;
  riskEventId?: string;
  status?: PlanActionCardStatus;
  isGlobal?: boolean;
}

/** 更新预案行动卡片入参（局部更新，未传字段不覆盖）。 */
export interface PlanActionCardUpdate {
  resourceId?: string;
  title?: string;
  content?: string;
  description?: string;
  startSubPhaseId?: string;
  endSubPhaseId?: string;
  riskEventId?: string;
  status?: PlanActionCardStatus;
  isGlobal?: boolean;
}

function planActionCardUrl(planId: string, cardId?: string): string {
  const base = `/emergency-plans/${encodeURIComponent(planId)}/action-cards`;
  return cardId == null ? base : `${base}/${encodeURIComponent(cardId)}`;
}

/** 在指定预案实例下新建行动卡片，返回后端落库后的卡片（含生成的 id）。 */
export async function createPlanActionCard(
  planId: string,
  body: PlanActionCardCreate,
): Promise<PlanActionCard> {
  return request<PlanActionCard>({ url: planActionCardUrl(planId), method: 'POST', data: body });
}

/** 局部更新行动卡片（前端主要用于执行状态流转）。 */
export async function updatePlanActionCard(
  planId: string,
  cardId: string,
  body: PlanActionCardUpdate,
): Promise<PlanActionCard> {
  return request<PlanActionCard>({
    url: planActionCardUrl(planId, cardId),
    method: 'PUT',
    data: body,
  });
}

/** 删除行动卡片，返回是否删除成功。 */
export async function deletePlanActionCard(planId: string, cardId: string): Promise<boolean> {
  return request<boolean>({ url: planActionCardUrl(planId, cardId), method: 'DELETE' });
}

// 预案目录 / 详情（V39：取代 EmergencyPlanPanel 硬编码的 planRows / basicSections）
export interface EmergencyPlanCatalogItem {
  id: string;
  label: string;
  planName: string;
  canSwitch: boolean;
  isCurrent: boolean;
}

export interface EmergencyPlanCatalogSummary {
  items: EmergencyPlanCatalogItem[];
}

export interface EmergencyPlanDetailField {
  label: string;
  value: string;
}

export interface EmergencyPlanDetailSection {
  title: string;
  fields: EmergencyPlanDetailField[];
}

export interface EmergencyPlanDetailSummary {
  sections: EmergencyPlanDetailSection[];
}

const EMPTY_CATALOG: EmergencyPlanCatalogSummary = { items: [] };
const EMPTY_DETAIL: EmergencyPlanDetailSummary = { sections: [] };

/**
 * 应急预案目录（4 行层级：上级单位/公司级/消防救援/现场处置）。
 * 后端就绪时走 /emergency-plans/catalog；未连后端回落空态——不回灌假预案（零下行控制红线）。
 */
export async function fetchEmergencyPlanCatalog(): Promise<EmergencyPlanCatalogSummary> {
  const fb = resolveOfflineFetch(
    'emergency-plan',
    '/emergency-plans/catalog',
    EMPTY_CATALOG,
    EMPTY_CATALOG,
  );
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<EmergencyPlanCatalogSummary>({
      url: '/emergency-plans/catalog',
      method: 'GET',
    });
    if (!data || !Array.isArray(data.items)) {
      backendUnavailableWarn(
        'emergency-plan',
        '/emergency-plans/catalog',
        REASON_CONTRACT_MISMATCH,
      );
      return EMPTY_CATALOG;
    }
    return data;
  } catch {
    backendUnavailableWarn('emergency-plan', '/emergency-plans/catalog');
    return EMPTY_CATALOG;
  }
}

/**
 * 应急预案详情字段（5 段：基础/评审/备案/公布/评估信息）。
 * 后端就绪时走 /emergency-plans/catalog-detail；未连后端回落空态——不回灌假字段（零下行控制红线）。
 */
export async function fetchEmergencyPlanDetailSections(): Promise<EmergencyPlanDetailSummary> {
  const fb = resolveOfflineFetch(
    'emergency-plan',
    '/emergency-plans/catalog-detail',
    EMPTY_DETAIL,
    EMPTY_DETAIL,
  );
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<EmergencyPlanDetailSummary>({
      url: '/emergency-plans/catalog-detail',
      method: 'GET',
    });
    if (!data || !Array.isArray(data.sections)) {
      backendUnavailableWarn(
        'emergency-plan',
        '/emergency-plans/catalog-detail',
        REASON_CONTRACT_MISMATCH,
      );
      return EMPTY_DETAIL;
    }
    return data;
  } catch {
    backendUnavailableWarn('emergency-plan', '/emergency-plans/catalog-detail');
    return EMPTY_DETAIL;
  }
}
