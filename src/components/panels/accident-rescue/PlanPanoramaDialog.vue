<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type {
  PlanActionCard,
  PlanCombatResource,
  PlanMajorPhase,
  PlanSubPhase,
} from '@/services/map-data/planMatrixMock';
import { usePlanMatrix } from '@/composables/usePlanMatrix';
import { useEmergencyProcess } from '@/composables/useEmergencyProcess';
import AddActionCardDialog from './AddActionCardDialog.vue';

withDefaults(
  defineProps<{
    eventTitle?: string;
    mode?: 'event' | 'drill';
  }>(),
  {
    eventTitle: '茂名石化装置区突发事件应急处置',
    mode: 'event',
  },
);

const {
  planMatrixOpen,
  currentPlan,
  plans,
  viewMode,
  focusPhaseId,
  closePlanMatrix,
  selectPlan,
  setViewMode,
  setFocusPhase,
  openCard,
  removeActionCard,
  columnWidths,
  setColumnWidth,
} = usePlanMatrix();

const planSelectorOpen = ref(false);
const process = useEmergencyProcess();

const contextMenu = ref<{
  show: boolean;
  x: number;
  y: number;
  card: PlanActionCard | null;
}>({ show: false, x: 0, y: 0, card: null });
const addCardOpen = ref(false);
const addCardInit = ref<{ resourceId?: string; subPhaseId?: string }>({});

function columnWidth(subPhaseId: string): number {
  return columnWidths.value[subPhaseId] ?? 172;
}

const visibleSubPhases = computed<PlanSubPhase[]>(() => {
  if (viewMode.value === 'focus') {
    return currentPlan.value.subPhases.filter((item) => item.parentId === focusPhaseId.value);
  }
  return currentPlan.value.subPhases;
});

const visibleMajorPhases = computed<PlanMajorPhase[]>(() => {
  if (viewMode.value === 'focus') {
    return currentPlan.value.majorPhases.filter((item) => item.id === focusPhaseId.value);
  }
  return currentPlan.value.majorPhases;
});

const gridColumns = computed(() => {
  const cols = visibleSubPhases.value.map((sub) => `${columnWidth(sub.id)}px`);
  return `210px ${cols.join(' ')}`;
});

function majorPhaseSubPhaseCount(phase: PlanMajorPhase): number {
  return Math.max(1, visibleSubPhases.value.filter((item) => item.parentId === phase.id).length);
}

function majorPhaseProgress(phase: PlanMajorPhase): number {
  const items = currentPlan.value.subPhases.filter((item) => item.parentId === phase.id);
  if (items.length === 0) return 0;
  return Math.round(items.reduce((sum, item) => sum + (item.progress ?? 0), 0) / items.length);
}

function majorPhaseStatus(phase: PlanMajorPhase): 'completed' | 'active' | 'pending' {
  const items = currentPlan.value.subPhases.filter((item) => item.parentId === phase.id);
  if (items.length > 0 && items.every((item) => (item.progress ?? 0) >= 100)) {
    return 'completed';
  }
  if (items.some((item) => (item.progress ?? 0) > 0)) {
    return 'active';
  }
  return 'pending';
}

function majorPhaseRisks(phase: PlanMajorPhase) {
  const subIds = new Set(
    currentPlan.value.subPhases.filter((item) => item.parentId === phase.id).map((item) => item.id),
  );
  return currentPlan.value.riskEvents.filter((event) => subIds.has(event.subPhaseId));
}

function risksForSubPhase(subPhaseId: string) {
  return currentPlan.value.riskEvents.filter((event) => event.subPhaseId === subPhaseId);
}

interface PlacedCard {
  card: PlanActionCard;
  colStart: number;
  colEnd: number;
  rowTrack: number;
  riskEvent: { id: string; name: string } | null;
}

interface ResourceRowLayout {
  resource: PlanCombatResource;
  cards: PlacedCard[];
  maxTrack: number;
}

const resourceRows = computed<ResourceRowLayout[]>(() =>
  currentPlan.value.resources.map((resource) => {
    const vIds = visibleSubPhases.value.map((item) => item.id);
    const visibleCards = currentPlan.value.actionCards.filter((card) => {
      if (card.resourceId !== resource.id) return false;
      const sIdx = vIds.indexOf(card.startSubPhaseId);
      const eIdx = vIds.indexOf(card.endSubPhaseId);
      return sIdx !== -1 || eIdx !== -1 || (card.isGlobal && vIds.length > 0);
    });

    const raw = visibleCards.map((card) => {
      const sIdx = vIds.indexOf(card.startSubPhaseId);
      const eIdx = vIds.indexOf(card.endSubPhaseId);
      return {
        card,
        colStart: sIdx !== -1 ? sIdx : 0,
        colEnd: eIdx !== -1 ? eIdx : vIds.length - 1,
        rowTrack: 1,
        riskEvent:
          currentPlan.value.riskEvents.find((event) => event.id === card.riskEventId) ?? null,
      };
    });

    raw.sort((a, b) => a.colStart - b.colStart || b.colEnd - b.colStart - (a.colEnd - a.colStart));

    const rowsEnd: number[] = [];
    const placed = raw.map((item) => {
      let assignedRow = -1;
      for (let r = 0; r < rowsEnd.length; r += 1) {
        if (rowsEnd[r] <= item.colStart) {
          assignedRow = r;
          rowsEnd[r] = item.colEnd + 1;
          break;
        }
      }
      if (assignedRow === -1) {
        assignedRow = rowsEnd.length;
        rowsEnd.push(item.colEnd + 1);
      }
      return { ...item, rowTrack: assignedRow + 1 };
    });

    return {
      resource,
      cards: placed,
      maxTrack: Math.max(1, ...placed.map((item) => item.rowTrack)),
    };
  }),
);

function resourceGridStyle(row: ResourceRowLayout) {
  return {
    gridTemplateColumns: gridColumns.value,
    gridTemplateRows: `repeat(${row.maxTrack}, auto)`,
  };
}

function cardStyle(card: PlacedCard) {
  return {
    gridColumn: `${card.colStart + 2} / span ${card.colEnd - card.colStart + 1}`,
    gridRow: `${card.rowTrack}`,
  };
}

const cardStatusLabel: Record<PlanActionCard['status'], string> = {
  pending: '待执行',
  'in-progress': '执行中',
  completed: '已完成',
};

function planActive(planId: string) {
  return currentPlan.value.id === planId;
}

function handleOpenCard(card: PlanActionCard) {
  openCard(card);
}

function handleCardContextMenu(event: MouseEvent, card: PlanActionCard) {
  event.preventDefault();
  event.stopPropagation();
  contextMenu.value = { show: true, x: event.clientX, y: event.clientY, card };
}

function closeContextMenu() {
  contextMenu.value.show = false;
}

function handleContextAction(action: 'view' | 'add' | 'delete') {
  const card = contextMenu.value.card;
  closeContextMenu();
  if (!card) return;
  if (action === 'view') {
    openCard(card);
  } else if (action === 'add') {
    addCardInit.value = { resourceId: card.resourceId, subPhaseId: card.startSubPhaseId };
    addCardOpen.value = true;
  } else if (action === 'delete') {
    removeActionCard(card.id);
  }
}

function openAddCard() {
  closeContextMenu();
  addCardInit.value = {};
  addCardOpen.value = true;
}

const resizeState = ref<{ subPhaseId: string; startX: number; startWidth: number } | null>(null);

function startResize(subPhaseId: string, event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  resizeState.value = {
    subPhaseId,
    startX: event.clientX,
    startWidth: columnWidth(subPhaseId),
  };
}

function onWindowPointerMove(event: MouseEvent) {
  if (!resizeState.value) return;
  const delta = event.clientX - resizeState.value.startX;
  setColumnWidth(resizeState.value.subPhaseId, resizeState.value.startWidth + delta);
}

function onWindowPointerUp() {
  resizeState.value = null;
}

function onDocumentClick() {
  closeContextMenu();
}

onMounted(() => {
  window.addEventListener('mousemove', onWindowPointerMove);
  window.addEventListener('mouseup', onWindowPointerUp);
  document.addEventListener('click', onDocumentClick);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', onWindowPointerMove);
  window.removeEventListener('mouseup', onWindowPointerUp);
  document.removeEventListener('click', onDocumentClick);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="pano-fade">
      <div v-if="planMatrixOpen" class="pano-mask" @click.self="closePlanMatrix">
        <section
          class="pano-dialog"
          :class="mode === 'drill' ? 'pano-dialog--drill' : 'pano-dialog--event'"
          role="dialog"
          aria-modal="true"
        >
          <header class="pano-toolbar">
            <div class="pano-toolbar__title">
              <h2 class="pano-event-name">{{ eventTitle }}</h2>
              <span class="pano-divider">/</span>
              <h3 class="pano-plan-title">{{ currentPlan.title }}</h3>
              <button type="button" class="pano-switch-btn" @click="planSelectorOpen = true">
                ⇄ 切换预案
              </button>
            </div>

            <div class="pano-toolbar__actions">
              <div v-if="viewMode === 'focus'" class="pano-focus-select">
                <select
                  class="pano-focus-select__input"
                  :value="focusPhaseId ?? currentPlan.majorPhases[0]?.id"
                  @change="(e: Event) => setFocusPhase((e.target as HTMLSelectElement).value)"
                >
                  <option
                    v-for="phase in currentPlan.majorPhases"
                    :key="phase.id"
                    :value="phase.id"
                  >
                    {{ phase.name }}
                  </option>
                </select>
              </div>
              <button
                type="button"
                class="pano-view-btn"
                @click="viewMode === 'full' ? setViewMode('focus') : setViewMode('full')"
              >
                {{ viewMode === 'full' ? '◱ 全景模式' : '▦ 聚焦模式' }}
              </button>
              <button
                type="button"
                class="pano-view-btn"
                title="节点联动配置"
                @click="process.openNodeConfig()"
              >
                ⚙ 节点配置
              </button>
              <button
                type="button"
                class="pano-close-btn"
                aria-label="关闭"
                @click="closePlanMatrix"
              >
                ×
              </button>
            </div>
          </header>

          <div class="pano-legend">
            <span class="pano-legend__item pano-legend__item--pending">● 待执行</span>
            <span class="pano-legend__item pano-legend__item--in-progress">● 执行中</span>
            <span class="pano-legend__item pano-legend__item--completed">● 已完成</span>
            <span class="pano-legend__item pano-legend__item--risk">⚠ 关联突发风险</span>
          </div>

          <div class="pano-scroll">
            <div class="pano-matrix">
              <!-- 四行表头 -->
              <div
                class="pano-grid pano-grid--header"
                :style="{ gridTemplateColumns: gridColumns }"
              >
                <div class="pano-cell pano-cell--rowlabel">1、事件大阶段</div>
                <div
                  v-for="phase in visibleMajorPhases"
                  :key="phase.id"
                  class="pano-cell pano-phase"
                  :class="`pano-phase--${majorPhaseStatus(phase)}`"
                  :style="{ gridColumn: `span ${majorPhaseSubPhaseCount(phase)}` }"
                >
                  <div class="pano-phase__title">
                    <span>{{ phase.name }}</span>
                    <span class="pano-phase__pct">{{ majorPhaseProgress(phase) }}%</span>
                  </div>
                  <div class="pano-progress">
                    <div
                      class="pano-progress__bar"
                      :style="{ width: `${majorPhaseProgress(phase)}%` }"
                    />
                  </div>
                  <div v-if="majorPhaseRisks(phase).length > 0" class="pano-phase__risks">
                    <span
                      v-for="risk in majorPhaseRisks(phase)"
                      :key="risk.id"
                      class="pano-risk-badge"
                      :title="risk.name"
                    >
                      ⚠ {{ risk.name }}
                    </span>
                  </div>
                </div>

                <div class="pano-cell pano-cell--rowlabel">2、分项阶段</div>
                <div v-for="sub in visibleSubPhases" :key="sub.id" class="pano-cell pano-subphase">
                  <span class="pano-subphase__name" :title="sub.name">{{ sub.name }}</span>
                  <span
                    class="pano-resize-handle"
                    title="拖拽调整列宽"
                    @mousedown.prevent.stop="startResize(sub.id, $event)"
                  />
                </div>

                <div class="pano-cell pano-cell--rowlabel">3、可能的突发事件</div>
                <div
                  v-for="sub in visibleSubPhases"
                  :key="`risk-${sub.id}`"
                  class="pano-cell pano-risk"
                >
                  <div v-if="risksForSubPhase(sub.id).length > 0" class="pano-risk__list">
                    <span
                      v-for="event in risksForSubPhase(sub.id)"
                      :key="event.id"
                      class="pano-risk-badge"
                      :title="event.name"
                    >
                      ⚠ {{ event.name }}
                    </span>
                  </div>
                  <span v-else class="pano-risk__none">-</span>
                </div>

                <div class="pano-cell pano-cell--rowlabel pano-cell--upgrade-label">
                  4、上报与升级流程
                </div>
                <div
                  v-for="phase in visibleMajorPhases"
                  :key="`upgrade-${phase.id}`"
                  class="pano-cell pano-upgrade"
                  :style="{ gridColumn: `span ${majorPhaseSubPhaseCount(phase)}` }"
                >
                  <span class="pano-upgrade__icon">📚</span>
                  <span class="pano-upgrade__text">
                    {{ phase.upgradeProcess || '按照常规层级流程逐级上报指挥体系' }}
                  </span>
                </div>
              </div>

              <!-- 参战力量行 -->
              <div
                v-for="row in resourceRows"
                :key="row.resource.id"
                class="pano-grid pano-grid--resource"
                :style="resourceGridStyle(row)"
              >
                <div class="pano-cell pano-resource" :style="{ gridRow: '1 / -1' }">
                  <div class="pano-resource__name">{{ row.resource.name }}</div>
                  <div class="pano-resource__meta">
                    <span
                      class="pano-count-badge"
                      :class="
                        Number(row.resource.actualCount) >= Number(row.resource.expectedCount)
                          ? 'is-ok'
                          : 'is-warn'
                      "
                    >
                      实到 {{ row.resource.actualCount }} / 应到 {{ row.resource.expectedCount }}
                    </span>
                  </div>
                  <div
                    v-if="row.resource.leaderName || row.resource.contactPhone"
                    class="pano-resource__contacts"
                  >
                    <div v-if="row.resource.leaderName" class="pano-resource__contact">
                      <span class="pano-resource__contact-label">👨‍💼 负责人</span>
                      {{ row.resource.leaderName }}
                    </div>
                    <div v-if="row.resource.contactPhone" class="pano-resource__contact">
                      <span class="pano-resource__contact-label">📞 电话</span>
                      {{ row.resource.contactPhone }}
                    </div>
                  </div>
                  <div v-if="row.resource.duties" class="pano-resource__duties">
                    <span class="pano-resource__duty-tag">职责</span>
                    {{ row.resource.duties }}
                  </div>
                </div>

                <div
                  v-for="(sub, index) in visibleSubPhases"
                  :key="`bg-${row.resource.id}-${sub.id}`"
                  class="pano-cell pano-empty"
                  :style="{ gridColumn: `${index + 2}`, gridRow: '1 / -1' }"
                />

                <button
                  v-for="placed in row.cards"
                  :key="placed.card.id"
                  type="button"
                  class="pano-card"
                  :class="`pano-card--${placed.card.status}${placed.card.isGlobal ? ' is-global' : ''}`"
                  :style="cardStyle(placed)"
                  :title="placed.card.title"
                  @click="handleOpenCard(placed.card)"
                  @contextmenu.prevent.stop="handleCardContextMenu($event, placed.card)"
                >
                  <div class="pano-card__meta">
                    <span class="pano-card__status">
                      {{ cardStatusLabel[placed.card.status] }}
                    </span>
                    <span v-if="placed.riskEvent" class="pano-card__risk">⚠ 风险</span>
                  </div>
                  <div class="pano-card__title">{{ placed.card.title }}</div>
                </button>
              </div>

              <button type="button" class="pano-add-card" @click="openAddCard">
                ＋ 新增响应动作卡
              </button>
            </div>
          </div>
        </section>

        <!-- 切换预案弹窗 -->
        <div
          v-if="planSelectorOpen"
          class="pano-plan-selector"
          @click.self="planSelectorOpen = false"
        >
          <section class="pano-plan-selector__dialog">
            <header class="pano-plan-selector__header">
              <h3 class="pano-plan-selector__title">选择应急预案</h3>
              <button
                type="button"
                class="pano-plan-selector__close"
                @click="planSelectorOpen = false"
              >
                ×
              </button>
            </header>
            <div class="pano-plan-selector__body">
              <button
                v-for="plan in plans"
                :key="plan.id"
                type="button"
                class="pano-plan-card"
                :class="{ 'is-active': planActive(plan.id) }"
                @click="
                  selectPlan(plan.id);
                  planSelectorOpen = false;
                "
              >
                <span class="pano-plan-card__title">{{ plan.title }}</span>
                <span class="pano-plan-card__desc">{{ plan.description }}</span>
                <span v-if="planActive(plan.id)" class="pano-plan-card__badge">当前</span>
              </button>
            </div>
          </section>
        </div>

        <Teleport to="body">
          <div
            v-if="contextMenu.show"
            class="pano-ctx"
            :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
            @click.stop
          >
            <button type="button" @click="handleContextAction('view')">👁 查看详情</button>
            <button type="button" @click="handleContextAction('add')">➕ 在此新增动作卡</button>
            <button type="button" class="is-danger" @click="handleContextAction('delete')">
              🗑 删除动作卡
            </button>
          </div>
        </Teleport>

        <AddActionCardDialog
          :open="addCardOpen"
          :resource-id="addCardInit.resourceId"
          :sub-phase-id="addCardInit.subPhaseId"
          @close="addCardOpen = false"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
:global(.pano-mask) {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  background: rgb(2 6 23 / 88%);
}

:global(.pano-fade-enter-active),
:global(.pano-fade-leave-active) {
  transition: opacity 0.24s ease;
}

:global(.pano-fade-enter-from),
:global(.pano-fade-leave-to) {
  opacity: 0;
}

:global(.pano-dialog) {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 30% 12%, rgb(56 189 248 / 8%), transparent 42%), #0b1220;
  border: 1px solid #334155;
  border-radius: 10px;
  box-shadow: 0 22px 60px rgb(0 0 0 / 62%);
  overflow: hidden;
}

:global(.pano-fade-enter-active .pano-dialog),
:global(.pano-fade-leave-active .pano-dialog) {
  transition:
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.24s ease;
}

:global(.pano-fade-enter-from .pano-dialog),
:global(.pano-fade-leave-to .pano-dialog) {
  transform: translateY(12px) scale(0.988);
  opacity: 0;
}

:global(.pano-toolbar) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 58px;
  padding: 10px 18px;
  box-sizing: border-box;
  flex-shrink: 0;
}

:global(.pano-dialog--drill .pano-toolbar) {
  background: linear-gradient(90deg, rgb(23 37 84 / 96%), rgb(15 23 42 / 96%));
  border-bottom: 2px solid rgb(59 130 246 / 40%);
  box-shadow: 0 4px 15px rgb(0 0 0 / 30%);
}

:global(.pano-dialog--event .pano-toolbar) {
  background: linear-gradient(90deg, rgb(127 29 29 / 96%), rgb(20 10 10 / 96%));
  border-bottom: 2px solid rgb(239 68 68 / 40%);
  box-shadow: 0 4px 15px rgb(0 0 0 / 30%);
}

:global(.pano-toolbar__title) {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

:global(.pano-badge) {
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

:global(.pano-badge--drill) {
  background: rgb(59 130 246 / 20%);
  border: 1px solid rgb(59 130 246 / 50%);
  color: #60a5fa;
  text-shadow: 0 0 5px rgb(96 165 250 / 50%);
}

:global(.pano-badge--event) {
  background: rgb(239 68 68 / 20%);
  border: 1px solid rgb(239 68 68 / 50%);
  color: #f87171;
  text-shadow: 0 0 5px rgb(248 113 113 / 50%);
}

:global(.pano-event-name) {
  margin: 0;
  color: #f8fafc;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:global(.pano-divider) {
  color: #475569;
  font-size: 16px;
  font-weight: 300;
  user-select: none;
  margin: 0 2px;
}

:global(.pano-plan-title) {
  margin: 0;
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:global(.pano-switch-btn) {
  flex-shrink: 0;
  margin-left: 6px;
  padding: 5px 12px;
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 6px;
  background: rgb(255 255 255 / 8%);
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 700;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s ease;
}

:global(.pano-dialog--drill .pano-switch-btn) {
  border-color: rgb(59 130 246 / 40%);
  color: #93c5fd;
}

:global(.pano-dialog--event .pano-switch-btn) {
  border-color: rgb(239 68 68 / 40%);
  color: #fca5a5;
}

:global(.pano-switch-btn:hover) {
  background: rgb(255 255 255 / 16%);
  border-color: rgb(255 255 255 / 40%);
  color: #fff;
}

:global(.pano-toolbar__actions) {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

:global(.pano-focus-select__input) {
  min-width: 210px;
  height: 30px;
  padding: 0 8px;
  border: 1px solid #475569;
  border-radius: 6px;
  background: #1e293b;
  color: #cbd5e1;
  font-size: 12px;
  font-family: var(--font-body);
  outline: none;
}

:global(.pano-view-btn) {
  padding: 6px 14px;
  border: 1px solid #475569;
  border-radius: 6px;
  background: #1e293b;
  color: #cbd5e1;
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

:global(.pano-view-btn:hover) {
  background: #334155;
}

:global(.pano-close-btn) {
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid #475569;
  border-radius: 6px;
  background: #1e293b;
  color: #cbd5e1;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
}

:global(.pano-close-btn:hover) {
  background: #334155;
  color: #fff;
}

:global(.pano-legend) {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 30px;
  padding: 0 18px;
  border-bottom: 1px solid #1e293b;
  background: #0f172a;
  box-sizing: border-box;
  flex-shrink: 0;
}

:global(.pano-legend__item) {
  color: #94a3b8;
  font-size: 11px;
}

:global(.pano-legend__item--pending) {
  color: #94a3b8;
}

:global(.pano-legend__item--in-progress) {
  color: #38bdf8;
}

:global(.pano-legend__item--completed) {
  color: #10b981;
}

:global(.pano-legend__item--risk) {
  color: #f87171;
}

:global(.pano-scroll) {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.pano-matrix {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: max-content;
  padding: 14px;
  box-sizing: border-box;
}

.pano-grid {
  display: grid;
  gap: 3px;
  width: max-content;
  min-width: 100%;
}

.pano-grid--header {
  grid-auto-rows: auto;
}

.pano-cell {
  border-radius: 4px;
  box-sizing: border-box;
  overflow: hidden;
}

.pano-cell--rowlabel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  background: #1e293b;
  border: 1px solid #334155;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.pano-cell--upgrade-label {
  color: #60a5fa;
}

.pano-phase {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-height: 62px;
  padding: 8px 10px;
}

.pano-phase--completed {
  background: rgb(16 185 129 / 10%);
  border: 1px solid rgb(16 185 129 / 35%);
}

.pano-phase--active {
  background: rgb(2 132 199 / 16%);
  border: 1px solid #0284c7;
  box-shadow: inset 0 0 12px rgb(2 132 199 / 12%);
}

.pano-phase--pending {
  background: #1e293b;
  border: 1px solid #334155;
}

.pano-phase:not(:last-child)::after {
  content: '→';
  position: absolute;
  right: -13px;
  top: 50%;
  transform: translateY(-50%);
  z-index: var(--z-local-3);
  color: #38bdf8;
  font-size: 15px;
  text-shadow: 0 0 8px rgb(56 189 248 / 60%);
  pointer-events: none;
}

.pano-phase__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #f8fafc;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.25;
  white-space: nowrap;
}

.pano-phase__pct {
  color: #38bdf8;
  font-size: 11px;
  font-weight: 800;
}

.pano-progress {
  height: 5px;
  border-radius: 3px;
  background: rgb(51 65 85 / 70%);
  overflow: hidden;
}

.pano-progress__bar {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #0284c7, #38bdf8);
  transition: width 0.5s ease;
}

.pano-phase--completed .pano-progress__bar {
  background: linear-gradient(90deg, #059669, #10b981);
}

.pano-phase__risks {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.pano-subphase {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 42px;
  padding: 6px 8px;
  background: #1e293b;
  border: 1px solid #334155;
  color: #e2e8f0;
  font-size: 12px;
  text-align: center;
}

.pano-subphase__name {
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pano-resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  transition: background 0.18s ease;
}

.pano-resize-handle:hover {
  background: rgb(56 189 248 / 55%);
}

.pano-add-card {
  align-self: flex-start;
  height: 30px;
  padding: 0 14px;
  border: 1px dashed #475569;
  border-radius: 5px;
  background: rgb(30 41 59 / 50%);
  color: #94a3b8;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.18s ease;
}

.pano-add-card:hover {
  border-color: #38bdf8;
  color: #7dd3fc;
}

:global(.pano-ctx) {
  position: fixed;
  z-index: var(--z-overlay);
  min-width: 170px;
  padding: 5px;
  border: 1px solid #475569;
  border-radius: 6px;
  background: #1e293b;
  box-shadow: 0 12px 30px rgb(0 0 0 / 50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

:global(.pano-ctx button) {
  height: 30px;
  padding: 0 10px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #cbd5e1;
  font-size: 12px;
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
}

:global(.pano-ctx button:hover) {
  background: #334155;
  color: #fff;
}

:global(.pano-ctx button.is-danger:hover) {
  background: rgb(239 68 68 / 18%);
  color: #fca5a5;
}

.pano-risk {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 5px 6px;
  background: #0f172a;
  border: 1px solid #1e293b;
}

.pano-risk__list {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 3px;
  width: 100%;
}

.pano-risk__none {
  color: #475569;
  font-size: 13px;
}

.pano-risk-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  min-height: 18px;
  padding: 0 6px;
  border-radius: 3px;
  background: rgb(239 68 68 / 12%);
  border: 1px solid rgb(239 68 68 / 40%);
  color: #f87171;
  font-size: 10px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pano-upgrade {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  min-height: 54px;
  padding: 8px 10px;
  background: rgb(15 23 42 / 90%);
  border: 1px solid #1e293b;
}

.pano-upgrade__icon {
  flex-shrink: 0;
  color: #38bdf8;
  font-size: 13px;
  line-height: 1.3;
}

.pano-upgrade__text {
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pano-resource {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-height: 64px;
  padding: 8px 10px;
  background: #1e293b;
  border: 1px solid #334155;
  z-index: var(--z-local-2);
}

.pano-resource__name {
  color: #f8fafc;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
}

.pano-resource__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.pano-count-badge {
  display: inline-flex;
  align-items: center;
  min-height: 18px;
  padding: 0 7px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.pano-count-badge.is-ok {
  background: rgb(16 185 129 / 14%);
  border: 1px solid rgb(16 185 129 / 40%);
  color: #34d399;
}

.pano-count-badge.is-warn {
  background: rgb(245 158 11 / 14%);
  border: 1px solid rgb(245 158 11 / 45%);
  color: #fbbf24;
}

.pano-resource__contacts {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pano-resource__contact {
  color: #cbd5e1;
  font-size: 10px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pano-resource__contact-label {
  color: #64748b;
}

.pano-resource__duties {
  color: #94a3b8;
  font-size: 10px;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pano-resource__duty-tag {
  color: #38bdf8;
}

.pano-empty {
  background: rgb(30 41 59 / 32%);
  border: 1px solid rgb(51 65 85 / 50%);
}

.pano-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 46px;
  padding: 7px 10px;
  border-radius: 6px;
  color: #e2e8f0;
  text-align: left;
  font-family: var(--font-body);
  cursor: pointer;
  box-sizing: border-box;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  z-index: var(--z-local-1);
}

.pano-card--pending {
  background: #1e293b;
  border: 1px solid #334155;
  box-shadow: 0 2px 6px rgb(0 0 0 / 30%);
}

.pano-card--pending:hover {
  background: #334155;
  border-color: #38bdf8;
  transform: translateY(-1px);
}

.pano-card--in-progress {
  background: rgb(2 132 199 / 18%);
  border: 1px solid #0284c7;
  box-shadow: inset 0 0 10px rgb(2 132 199 / 15%);
}

.pano-card--in-progress:hover {
  background: rgb(2 132 199 / 28%);
  border-color: #38bdf8;
  transform: translateY(-1px);
}

.pano-card--completed {
  background: rgb(16 185 129 / 12%);
  border: 1px solid rgb(16 185 129 / 40%);
}

.pano-card--completed:hover {
  background: rgb(16 185 129 / 20%);
  border-color: #10b981;
  transform: translateY(-1px);
}

.pano-card.is-global {
  border-style: dashed;
}

.pano-card__meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pano-card__status {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
}

.pano-card--in-progress .pano-card__status {
  color: #38bdf8;
}

.pano-card--completed .pano-card__status {
  color: #34d399;
}

.pano-card__risk {
  display: inline-flex;
  align-items: center;
  min-height: 15px;
  padding: 0 5px;
  border-radius: 3px;
  background: rgb(239 68 68 / 14%);
  border: 1px solid rgb(239 68 68 / 40%);
  color: #f87171;
  font-size: 9px;
  line-height: 1;
}

.pano-card__title {
  font-size: 11px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

:global(.pano-process) {
  flex-shrink: 0;
  min-height: 78px;
  padding: 10px 18px 12px;
  border-top: 1px solid #1e293b;
  background: #0f172a;
  box-sizing: border-box;
}

:global(.pano-process__head) {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 8px;
}

:global(.pano-process__title) {
  color: #f8fafc;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.4px;
}

:global(.pano-process__hint) {
  color: #64748b;
  font-size: 10px;
}

:global(.pano-process__track) {
  display: flex;
  align-items: flex-start;
  min-width: 0;
}

:global(.pano-process__step) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  min-width: 108px;
  max-width: 150px;
}

:global(.pano-process__node) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #1e293b;
  border: 2px solid #334155;
}

:global(.pano-process__dot) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #64748b;
}

:global(.pano-process__step--done .pano-process__node) {
  border-color: rgb(16 185 129 / 70%);
  background: rgb(16 185 129 / 16%);
}

:global(.pano-process__step--done .pano-process__dot) {
  background: #10b981;
  box-shadow: 0 0 7px rgb(16 185 129 / 70%);
}

:global(.pano-process__step--active .pano-process__node) {
  border-color: rgb(56 189 248 / 80%);
  background: rgb(2 132 199 / 20%);
  box-shadow: 0 0 12px rgb(56 189 248 / 35%);
}

:global(.pano-process__step--active .pano-process__dot) {
  background: #38bdf8;
  box-shadow: 0 0 8px rgb(56 189 248 / 90%);
  animation: pano-dot-pulse 1.5s ease-in-out infinite;
}

:global(.pano-process__label) {
  color: #cbd5e1;
  font-size: 11px;
  line-height: 1.3;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

:global(.pano-process__status) {
  color: #64748b;
  font-size: 10px;
  line-height: 1;
}

:global(.pano-process__step--done .pano-process__status) {
  color: #34d399;
}

:global(.pano-process__step--active .pano-process__status) {
  color: #38bdf8;
}

:global(.pano-process__connector) {
  flex: 1;
  min-width: 18px;
  height: 2px;
  margin-top: 10px;
  background: #334155;
}

:global(.pano-process__connector.is-done) {
  background: linear-gradient(90deg, #059669, #38bdf8);
  box-shadow: 0 0 6px rgb(56 189 248 / 40%);
}

@keyframes pano-dot-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.55;
    transform: scale(1.4);
  }
}

:global(.pano-plan-selector) {
  position: absolute;
  inset: 0;
  z-index: var(--z-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: rgb(2 6 23 / 82%);
}

:global(.pano-plan-selector__dialog) {
  width: min(1020px, 100%);
  display: flex;
  flex-direction: column;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  box-shadow: 0 22px 60px rgb(0 0 0 / 60%);
  overflow: hidden;
}

:global(.pano-plan-selector__header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 0 14px;
  border-bottom: 1px solid #1e293b;
  background: #1e293b;
}

:global(.pano-plan-selector__title) {
  margin: 0;
  color: #f8fafc;
  font-size: 15px;
  font-weight: 700;
}

:global(.pano-plan-selector__close) {
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #94a3b8;
  font-size: 18px;
  cursor: pointer;
}

:global(.pano-plan-selector__close:hover) {
  background: #334155;
  color: #fff;
}

:global(.pano-plan-selector__body) {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 16px;
  box-sizing: border-box;
}

.pano-plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 150px;
  padding: 14px;
  border: 1px solid #334155;
  border-radius: 8px;
  background: #1e293b;
  color: #e2e8f0;
  text-align: left;
  font-family: var(--font-body);
  cursor: pointer;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.pano-plan-card:hover {
  border-color: #38bdf8;
  background: #263449;
}

.pano-plan-card.is-active {
  border-color: #38bdf8;
  box-shadow:
    0 0 18px rgb(56 189 248 / 22%),
    inset 0 0 16px rgb(56 189 248 / 8%);
}

.pano-plan-card__title {
  color: #f8fafc;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
}

.pano-plan-card__desc {
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.6;
}

.pano-plan-card__badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 2px 7px;
  border-radius: 4px;
  background: rgb(56 189 248 / 18%);
  border: 1px solid rgb(56 189 248 / 50%);
  color: #7dd3fc;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}
</style>
