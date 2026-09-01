import { computed, ref } from 'vue';
import {
  planMatrixPlans,
  resolvePlanMatrixPlan,
  type PlanActionCard,
  type PlanCardStatus,
  type PlanInstance,
} from '@/services/map-data/planMatrixMock';

/** 预案矩阵演示级状态（模块级单例，供页面与弹窗共享） */
const planMatrixOpen = ref(false);
const activePlanId = ref(planMatrixPlans[0].id);
const viewMode = ref<'full' | 'focus'>('full');
const focusPhaseId = ref<string | null>(planMatrixPlans[0].majorPhases[0]?.id ?? null);
const selectedCardId = ref<string | null>(null);
const columnWidths = ref<Record<string, number>>({});

const currentPlan = computed<PlanInstance>(() => resolvePlanMatrixPlan(activePlanId.value));

const selectedCard = computed<PlanActionCard | null>(() => {
  const id = selectedCardId.value;
  if (!id) return null;
  return currentPlan.value.actionCards.find((card) => card.id === id) ?? null;
});

function openPlanMatrix(planId?: string) {
  if (planId && resolvePlanMatrixPlan(planId).id === planId) {
    activePlanId.value = planId;
  }
  focusPhaseId.value = currentPlan.value.majorPhases[0]?.id ?? null;
  viewMode.value = 'full';
  selectedCardId.value = null;
  loadColumnWidths();
  planMatrixOpen.value = true;
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

function selectPlan(planId: string) {
  activePlanId.value = planId;
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
    planMatrixOpen,
    activePlanId,
    viewMode,
    focusPhaseId,
    selectedCard,
    currentPlan,
    plans: planMatrixPlans,
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
  };
}
