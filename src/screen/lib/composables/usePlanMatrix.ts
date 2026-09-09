import { computed, ref } from 'vue';
import {
  fetchEmergencyPlanOptions,
  fetchPlanMatrix,
  type PlanActionCard,
  type PlanCombatResource,
  type PlanInstance,
  type PlanMajorPhase,
  type PlanRiskEvent,
  type PlanSubPhase,
  type SelectableEmergencyPlan,
} from '@/services/emergencyPlan';
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

function setCardStatus(cardId: string, status: PlanCardStatus) {
  const card = currentPlan.value.actionCards.find((item) => item.id === cardId);
  if (card) {
    card.status = status;
  }
}

function removeActionCard(cardId: string) {
  const index = currentPlan.value.actionCards.findIndex((item) => item.id === cardId);
  if (index >= 0) {
    currentPlan.value.actionCards.splice(index, 1);
  }
  if (selectedCardId.value === cardId) {
    selectedCardId.value = null;
  }
}

function addActionCard(card: PlanActionCard) {
  currentPlan.value.actionCards.push({ ...card, id: card.id || `c-new-${Date.now()}` });
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
