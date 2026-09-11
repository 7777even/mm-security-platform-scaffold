import { computed, ref } from 'vue';
import {
  createPlanActionCard,
  deletePlanActionCard,
  fetchEmergencyPlanOptions,
  fetchPlanMatrix,
  updatePlanActionCard,
  type PlanActionCard,
  type PlanCombatResource,
  type PlanInstance,
  type PlanMajorPhase,
  type PlanRiskEvent,
  type PlanSubPhase,
  type SelectableEmergencyPlan,
} from '@/services/emergencyPlan';
import {
  backendUnavailableWarn,
  isOfflineNoBackend,
  notifyBackendOffline,
} from '@/services/backendFallback';
import type { PlanCardStatus } from '../data/planMatrixMock';

/** 预案 Tab 键 → 面板行 id（联动高亮），与 emergencyPlanSwitchMock 对齐。 */
const planSwitchTabToRowId: Record<string, string> = {
  disposal: 'site',
  fire: 'branch',
  company: 'company',
  superior: 'superior',
};

// 对外保留的类型 / 常量（依赖组件零改动）
export { planSwitchTabToRowId };
export type {
  PlanActionCard,
  PlanCardStatus,
  PlanCombatResource,
  PlanInstance,
  PlanMajorPhase,
  PlanRiskEvent,
  PlanSubPhase,
  SelectableEmergencyPlan,
};

const EMPTY_PLAN: PlanInstance = {
  id: '',
  title: '',
  description: '',
  majorPhases: [],
  subPhases: [],
  riskEvents: [],
  resources: [],
  actionCards: [],
};

/* ------------------------------------------------------------------ *
 * 预案切换选项（取代 emergencyPlanSwitchMock 硬编码）
 * ------------------------------------------------------------------ */
const optionsLoaded = ref(false);
const optionsLoading = ref(false);
const optionsError = ref<string | null>(null);
const optionTabs = ref<{ key: string; label: string }[]>([]);
const optionAccidentTypes = ref<string[]>([]);
const optionFacilities = ref<string[]>([]);
const optionPlans = ref<SelectableEmergencyPlan[]>([]);

/** 顶部 Tab 列表（{key,label}） */
export const emergencyPlanSwitchTabs = computed(() => optionTabs.value);

/** 事故类型 / 设施下拉（保留「全部」占位项，与筛选逻辑一致） */
export const emergencyPlanSwitchOptions = computed(() => ({
  accidentTypes: ['全部类型', ...optionAccidentTypes.value],
  facilities: ['全部装置', ...optionFacilities.value],
}));

/** 按 Tab 过滤可选预案 */
export function resolvePlansByTab(tab: string): SelectableEmergencyPlan[] {
  return optionPlans.value.filter((item) => item.tab === tab);
}

async function loadOptions(): Promise<void> {
  if (optionsLoaded.value || optionsLoading.value) return;
  optionsLoading.value = true;
  optionsError.value = null;
  try {
    const data = await fetchEmergencyPlanOptions();
    optionTabs.value = data.tabs;
    optionAccidentTypes.value = data.accidentTypes;
    optionFacilities.value = data.facilities;
    optionPlans.value = data.plans;
    optionsLoaded.value = true;
  } catch (e) {
    optionsError.value = e instanceof Error ? e.message : '加载预案选项失败';
  } finally {
    optionsLoading.value = false;
  }
}

/* ------------------------------------------------------------------ *
 * 预案矩阵实例（取代 planMatrixPlans / resolvePlanMatrixPlan 硬编码）
 * ------------------------------------------------------------------ */
const planMatrixOpen = ref(false);
const activePlanId = ref<string>('');
const viewMode = ref<'full' | 'focus'>('full');
const focusPhaseId = ref<string | null>(null);
const selectedCardId = ref<string | null>(null);
const columnWidths = ref<Record<string, number>>({});

/** 当前预案矩阵实例（后端回填） */
const currentPlan = ref<PlanInstance>(EMPTY_PLAN);
/** 预案选择器列表（含 title/description，供 PlanPanoramaDialog 渲染） */
const plans = ref<PlanInstance[]>([]);

async function loadPlan(planId: string) {
  const data = await fetchPlanMatrix(planId || undefined);
  currentPlan.value = data;
  if (planId && data.id) activePlanId.value = data.id;
  focusPhaseId.value = data.majorPhases[0]?.id ?? null;
}

async function loadPlanList() {
  if (plans.value.length || !optionPlans.value.length) return;
  await Promise.all(
    optionPlans.value.map(async (p) => {
      try {
        const matrix = await fetchPlanMatrix(p.id);
        plans.value = [...plans.value, matrix];
      } catch {
        // 单个预案失败不影响其余
      }
    }),
  );
}

async function ensureMatrixData(planId?: string) {
  await loadOptions();
  await loadPlanList();
  const target =
    (planId && plans.value.some((p) => p.id === planId) && planId) ||
    activePlanId.value ||
    plans.value[0]?.id ||
    '';
  if (target) {
    await loadPlan(target);
  }
}

const selectedCard = computed<PlanActionCard | null>(() => {
  const id = selectedCardId.value;
  if (!id) return null;
  return currentPlan.value.actionCards.find((card) => card.id === id) ?? null;
});

function openPlanMatrix(planId?: string) {
  void ensureMatrixData(planId).then(() => {
    focusPhaseId.value = currentPlan.value.majorPhases[0]?.id ?? null;
    viewMode.value = 'full';
    selectedCardId.value = null;
    loadColumnWidths();
    planMatrixOpen.value = true;
  });
}

function closePlanMatrix() {
  planMatrixOpen.value = false;
  selectedCardId.value = null;
}

function togglePlanMatrix() {
  if (planMatrixOpen.value) {
    closePlanMatrix();
  } else {
    openPlanMatrix();
  }
}

async function selectPlan(planId: string) {
  await loadPlan(planId);
  focusPhaseId.value = currentPlan.value.majorPhases[0]?.id ?? null;
  viewMode.value = 'full';
  selectedCardId.value = null;
  loadColumnWidths();
}

function setViewMode(mode: 'full' | 'focus') {
  viewMode.value = mode;
}

function setFocusPhase(phaseId: string) {
  focusPhaseId.value = phaseId;
}

function openCard(card: PlanActionCard) {
  selectedCardId.value = card.id;
}

function closeCard() {
  selectedCardId.value = null;
}

/** 是否落库：配置了 VITE_API_BASE 且已加载到预案实例时才走后端写接口，否则维持本地改（纯静态演示）。 */
function planWritesToBackend(): boolean {
  return Boolean(import.meta.env.VITE_API_BASE) && Boolean(currentPlan.value.id);
}

async function setCardStatus(cardId: string, status: PlanCardStatus) {
  const card = currentPlan.value.actionCards.find((item) => item.id === cardId);
  if (!card) return;
  // 未连后端且未开演示：写操作显式报错，不做本地改
  if (isOfflineNoBackend()) {
    notifyBackendOffline(
      'plan-action-card',
      'PUT /emergency-plans/{planId}/action-cards/{cardId}',
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    return;
  }
  if (!planWritesToBackend()) {
    card.status = status;
    return;
  }
  try {
    const updated = await updatePlanActionCard(currentPlan.value.id, cardId, { status });
    card.status = (updated?.status ?? status) as PlanCardStatus;
  } catch {
    backendUnavailableWarn(
      'plan-action-card',
      'PUT /emergency-plans/{planId}/action-cards/{cardId}',
    );
  }
}

async function removeActionCard(cardId: string) {
  const index = currentPlan.value.actionCards.findIndex((item) => item.id === cardId);
  if (index < 0) return;
  // 未连后端且未开演示：写操作显式报错，不做本地改
  if (isOfflineNoBackend()) {
    notifyBackendOffline(
      'plan-action-card',
      'DELETE /emergency-plans/{planId}/action-cards/{cardId}',
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    return;
  }
  if (planWritesToBackend()) {
    try {
      await deletePlanActionCard(currentPlan.value.id, cardId);
    } catch {
      backendUnavailableWarn(
        'plan-action-card',
        'DELETE /emergency-plans/{planId}/action-cards/{cardId}',
      );
      return;
    }
  }
  currentPlan.value.actionCards.splice(index, 1);
  if (selectedCardId.value === cardId) {
    selectedCardId.value = null;
  }
}

async function addActionCard(card: PlanActionCard) {
  // 未连后端且未开演示：写操作显式报错，不做本地改
  if (isOfflineNoBackend()) {
    notifyBackendOffline(
      'plan-action-card',
      'POST /emergency-plans/{planId}/action-cards',
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    return;
  }
  if (!planWritesToBackend()) {
    currentPlan.value.actionCards.push({ ...card, id: card.id || `c-new-${Date.now()}` });
    return;
  }
  try {
    const created = await createPlanActionCard(currentPlan.value.id, {
      resourceId: card.resourceId,
      title: card.title,
      content: card.content,
      description: card.description,
      startSubPhaseId: card.startSubPhaseId,
      endSubPhaseId: card.endSubPhaseId,
      riskEventId: card.riskEventId,
      status: card.status,
      isGlobal: card.isGlobal,
    });
    if (created) {
      currentPlan.value.actionCards.push(created);
    }
  } catch {
    backendUnavailableWarn('plan-action-card', 'POST /emergency-plans/{planId}/action-cards');
  }
}

function loadColumnWidths() {
  columnWidths.value = {};
  try {
    const raw = localStorage.getItem(`plan_matrix_col_widths_${currentPlan.value.id}`);
    if (raw) {
      columnWidths.value = JSON.parse(raw);
    }
  } catch {
    columnWidths.value = {};
  }
}

function setColumnWidth(subPhaseId: string, width: number) {
  const clamped = Math.max(96, Math.round(width));
  columnWidths.value = { ...columnWidths.value, [subPhaseId]: clamped };
  try {
    localStorage.setItem(
      `plan_matrix_col_widths_${currentPlan.value.id}`,
      JSON.stringify(columnWidths.value),
    );
  } catch {
    // ignore
  }
}

export function usePlanMatrix() {
  return {
    // 矩阵状态
    planMatrixOpen,
    activePlanId,
    viewMode,
    focusPhaseId,
    selectedCard,
    currentPlan,
    plans,
    // 预案切换选项
    optionsLoading,
    optionsError,
    emergencyPlanSwitchTabs,
    emergencyPlanSwitchOptions,
    resolvePlansByTab,
    // 操作
    openPlanMatrix,
    closePlanMatrix,
    togglePlanMatrix,
    selectPlan,
    setViewMode,
    setFocusPhase,
    openCard,
    closeCard,
    setCardStatus,
    removeActionCard,
    addActionCard,
    columnWidths,
    setColumnWidth,
    loadOptions,
  };
}
