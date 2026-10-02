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
  /** 业务域：production / fire / perimeter / superior */
  domain?: string;
  /** 核预案标记 */
  nuclear?: boolean;
  /** 当前是否激活 */
  isActive?: boolean;
  /** 累计一键调用次数 */
  invokeCount?: number;
  /** 最近一次调用时间（ISO8601，可空） */
  lastInvokedAt?: string | null;
}

/** 一键调用预案入参 */
export interface PlanInvokeRequest {
  note?: string;
}

/** 一键调用预案结果 */
export interface PlanInvokeResult {
  planId: number;
  planName: string;
  domain?: string;
  isActive: boolean;
  invokeCount: number;
  invokedAt: string;
  operator?: string;
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

/** 应急预案选项聚合：Tab / 事故类型 / 设施 / 可选预案清单。domain 非空时仅返回该业务域预案。 */
export async function fetchEmergencyPlanOptions(domain?: string): Promise<EmergencyPlanOptions> {
  return request<EmergencyPlanOptions>({
    url: '/emergency-plans/options',
    method: 'GET',
    params: domain != null ? { domain } : undefined,
  });
}

/** 一键调用预案：激活 + 广播 + 留痕（不触达物理设备）。 */
export async function invokeEmergencyPlan(
  id: number | string,
  body?: PlanInvokeRequest,
): Promise<PlanInvokeResult> {
  return request<PlanInvokeResult>({
    url: `/emergency-plans/${encodeURIComponent(String(id))}/invoke`,
    method: 'POST',
    data: body ?? {},
  });
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

// ==================== 管理端台账：应急预案目录（扁平台账，可编辑） ====================
// 区别于 /catalog 层次化只读摘要（大屏展示用），此处是管理端可维护的扁平行。
// 权限码：emergency:plan-catalog:write（V97 登记，授权 ADMIN / COMMANDER / SCHEDULER）。

/** 预案目录扁平行（id 为数值主键，区别于 /catalog 的层级编码）。 */
export interface EmergencyPlanCatalogRow {
  id: string;
  planCode?: string | null;
  label?: string | null;
  planName?: string | null;
  /** 是否可切换（0/1） */
  canSwitch?: number | null;
  /** 是否为当前激活（0/1） */
  isCurrent?: number | null;
  sortNo?: number | null;
}

/** 预案目录新增 / 编辑入参（label 必填，其余可选）。 */
export interface EmergencyPlanCatalogWriteRequest {
  planCode?: string;
  label?: string;
  planName?: string;
  canSwitch?: number;
  isCurrent?: number;
  sortNo?: number;
}

// 管理端台账：应急预案主记录
// 权限码：emergency:plan:write（V98 登记，授权 ADMIN / COMMANDER / SCHEDULER）。

/** 应急预案主记录（管理端编辑用，区别于 /options /matrix 大屏视图）。 */
export interface EmergencyPlanMetaItem {
  id: string;
  tabKey?: string | null;
  planName?: string | null;
  accidentType?: string | null;
  facility?: string | null;
  /** 业务域：production / fire / perimeter / superior */
  domain?: string | null;
  /** 核预案标记 */
  nuclear?: boolean | null;
  /** 当前是否激活 */
  isActive?: boolean | null;
  /** 累计一键调用次数 */
  invokeCount?: number | null;
  /** 最近一次调用时间（yyyy-MM-dd HH:mm:ss） */
  lastInvokedAt?: string | null;
}

/** 应急预案主记录新增 / 编辑入参（planName 必填，其余可选）。 */
export interface EmergencyPlanMetaWriteRequest {
  planName?: string;
  tabKey?: string;
  accidentType?: string;
  facility?: string;
  domain?: string;
  nuclear?: boolean;
  isActive?: boolean;
  sortNo?: number;
}

const EMPTY_CATALOG_ROWS: EmergencyPlanCatalogRow[] = [];
const EMPTY_PLAN_META: EmergencyPlanMetaItem[] = [];

/** 预案目录扁平行列表（管理端编辑用）。 */
export async function fetchEmergencyPlanCatalogRows(): Promise<EmergencyPlanCatalogRow[]> {
  const fb = resolveOfflineFetch(
    'plan-catalog',
    '/emergency-plans/catalog-items',
    EMPTY_CATALOG_ROWS,
    EMPTY_CATALOG_ROWS,
  );
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<EmergencyPlanCatalogRow[]>({
      url: '/emergency-plans/catalog-items',
      method: 'GET',
    });
    if (!Array.isArray(data)) {
      backendUnavailableWarn(
        'plan-catalog',
        '/emergency-plans/catalog-items',
        REASON_CONTRACT_MISMATCH,
      );
      return EMPTY_CATALOG_ROWS;
    }
    return data;
  } catch {
    backendUnavailableWarn('plan-catalog', '/emergency-plans/catalog-items');
    return EMPTY_CATALOG_ROWS;
  }
}

/** 新增预案目录行。 */
export async function createPlanCatalogRow(
  payload: EmergencyPlanCatalogWriteRequest,
): Promise<EmergencyPlanCatalogRow> {
  return request<EmergencyPlanCatalogRow>({
    url: '/emergency-plans/catalog-items',
    method: 'POST',
    data: payload,
  });
}

/** 编辑预案目录行（局部更新）。 */
export async function updatePlanCatalogRow(
  id: number,
  payload: EmergencyPlanCatalogWriteRequest,
): Promise<EmergencyPlanCatalogRow> {
  return request<EmergencyPlanCatalogRow>({
    url: `/emergency-plans/catalog-items/${id}`,
    method: 'PUT',
    data: payload,
  });
}

/** 删除预案目录行。 */
export async function deletePlanCatalogRow(id: number): Promise<void> {
  await request<null>({ url: `/emergency-plans/catalog-items/${id}`, method: 'DELETE' });
}

/** 应急预案主记录列表（管理端编辑用）。 */
export async function fetchEmergencyPlanMetaList(): Promise<EmergencyPlanMetaItem[]> {
  const fb = resolveOfflineFetch('plan-meta', '/emergency-plans', EMPTY_PLAN_META, EMPTY_PLAN_META);
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<EmergencyPlanMetaItem[]>({
      url: '/emergency-plans',
      method: 'GET',
    });
    if (!Array.isArray(data)) {
      backendUnavailableWarn('plan-meta', '/emergency-plans', REASON_CONTRACT_MISMATCH);
      return EMPTY_PLAN_META;
    }
    return data;
  } catch {
    backendUnavailableWarn('plan-meta', '/emergency-plans');
    return EMPTY_PLAN_META;
  }
}

/** 新增应急预案主记录。 */
export async function createEmergencyPlanMeta(
  payload: EmergencyPlanMetaWriteRequest,
): Promise<EmergencyPlanMetaItem> {
  return request<EmergencyPlanMetaItem>({ url: '/emergency-plans', method: 'POST', data: payload });
}

/** 编辑应急预案主记录（局部更新）。 */
export async function updateEmergencyPlanMeta(
  id: number,
  payload: EmergencyPlanMetaWriteRequest,
): Promise<EmergencyPlanMetaItem> {
  return request<EmergencyPlanMetaItem>({
    url: `/emergency-plans/${id}`,
    method: 'PUT',
    data: payload,
  });
}

/** 删除应急预案主记录。 */
export async function deleteEmergencyPlanMeta(id: number): Promise<void> {
  await request<null>({ url: `/emergency-plans/${id}`, method: 'DELETE' });
}
