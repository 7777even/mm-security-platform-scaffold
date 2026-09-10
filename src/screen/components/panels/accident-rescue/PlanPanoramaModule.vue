<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import type { PlanActionCard, PlanCombatResource } from '../../../lib/data/planMatrixMock';
import { usePlanMatrix } from '../../../lib/composables/usePlanMatrix';
import { useEmergencyProcess } from '../../../lib/composables/useEmergencyProcess';
import { getSharedMap } from '../../../lib/composables/sharedCesiumBridge';
import type { EmergencyPhase } from '../../../lib/data/emergencyProcessData';
import ActionCardDetailDialog from './ActionCardDetailDialog.vue';
import NodeGuidanceDialog from './NodeGuidanceDialog.vue';
import EscalateConfirmDialog from './EscalateConfirmDialog.vue';
import NodeConfigDialog from './NodeConfigDialog.vue';
import PhaseDecisionDialog from './PhaseDecisionDialog.vue';

const props = withDefaults(
  defineProps<{
    eventTitle?: string;
    mode?: 'event' | 'drill';
    center?: { longitude: number; latitude: number };
  }>(),
  {
    eventTitle: '茂名石化装置区突发事件应急处置',
    mode: 'event',
    center: () => ({ longitude: 110.92681, latitude: 21.66224 }),
  },
);

const plan = usePlanMatrix();
const process = useEmergencyProcess();

/** 应急阶段（来自后端全景，`loadEmergencyProcessRemote()` 前为本地默认值）。 */
const phaseList = computed<EmergencyPhase[]>(() => process.phases.value);
/** 实时值班表（同上）。 */
const roster = computed(() => process.dutyRoster.value);

const presentLevel = ref<'strip' | 'panel'>(
  (sessionStorage.getItem('ppm_present_level') as 'strip' | 'panel' | null) ?? 'panel',
);
const planDetailOpen = ref(false);
const planViewportEl = ref<HTMLElement | null>(null);
const planTextEl = ref<HTMLElement | null>(null);
const planTextOverflow = ref(false);
const lastLevelBeforeModal = ref<'strip' | 'panel'>('panel');
let planMatrixWasOpen = false;

function setPresentLevel(level: 'strip' | 'panel') {
  presentLevel.value = level;
  try {
    sessionStorage.setItem('ppm_present_level', level);
  } catch {
    // ignore
  }
}

watch(
  () => plan.planMatrixOpen.value,
  (open) => {
    if (open) {
      lastLevelBeforeModal.value = presentLevel.value;
    } else if (planMatrixWasOpen) {
      setPresentLevel(lastLevelBeforeModal.value);
    }
    planMatrixWasOpen = open;
  },
);

const nodeRefs = ref<Record<number, HTMLElement | null>>({});
const topScrollEl = ref<HTMLElement | null>(null);
const railEl = ref<HTMLElement | null>(null);
const scrollState = reactive({
  max: 0,
  leftPx: 0,
  widthPx: 0,
  dragging: false,
  startX: 0,
  startLeft: 0,
});

function setNodeRef(stageId: number, el: HTMLElement | null) {
  nodeRefs.value[stageId] = el;
}

function scrollNodeIntoView(stageId: number) {
  const el = nodeRefs.value[stageId];
  const container = topScrollEl.value;
  if (el && container) {
    const targetLeft = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
    container.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
  }
}

function updateScrollState() {
  const sc = topScrollEl.value;
  const rail = railEl.value;
  if (!sc || !rail) return;
  const max = Math.max(0, sc.scrollWidth - sc.clientWidth);
  scrollState.max = max;
  if (max <= 0) {
    scrollState.widthPx = 0;
    scrollState.leftPx = 0;
    return;
  }
  const railWidth = rail.clientWidth;
  const thumbWidth = Math.max(36, (sc.clientWidth / sc.scrollWidth) * railWidth);
  scrollState.widthPx = thumbWidth;
  scrollState.leftPx = (sc.scrollLeft / max) * (railWidth - thumbWidth);
}

function onTopScroll() {
  updateScrollState();
}

function scrollStripBy(delta: number) {
  const sc = topScrollEl.value;
  if (sc) sc.scrollBy({ left: delta, behavior: 'smooth' });
}

function onRailClick(event: MouseEvent) {
  const rail = railEl.value;
  const sc = topScrollEl.value;
  if (!rail || !sc || scrollState.max <= 0) return;
  const rect = rail.getBoundingClientRect();
  const ratio =
    (event.clientX - rect.left - scrollState.widthPx / 2) / (rect.width - scrollState.widthPx);
  sc.scrollLeft = Math.max(0, Math.min(1, ratio)) * scrollState.max;
}

function onThumbDown(event: PointerEvent) {
  event.preventDefault();
  scrollState.dragging = true;
  scrollState.startX = event.clientX;
  scrollState.startLeft = scrollState.leftPx;
  (event.target as HTMLElement).setPointerCapture(event.pointerId);
}

function onThumbMove(event: PointerEvent) {
  if (!scrollState.dragging) return;
  const rail = railEl.value;
  const sc = topScrollEl.value;
  if (!rail || !sc || scrollState.max <= 0) return;
  const railWidth = rail.clientWidth;
  const delta = event.clientX - scrollState.startX;
  const nextLeft = Math.max(
    0,
    Math.min(railWidth - scrollState.widthPx, scrollState.startLeft + delta),
  );
  sc.scrollLeft = (nextLeft / (railWidth - scrollState.widthPx)) * scrollState.max;
}

function onThumbUp() {
  scrollState.dragging = false;
}

const activePhase = computed<EmergencyPhase>(
  () =>
    phaseList.value.find(
      (phase) =>
        process.state.activePhaseId >= phase.start && process.state.activePhaseId <= phase.end,
    ) ?? phaseList.value[0],
);

const nodeToPhaseMap = computed<Record<number, string>>(() => {
  const planId = plan.currentPlan.value.id;
  if (planId === 'plan-maoming-001') {
    return {
      1: 'm1',
      2: 'm1',
      3: 'm2',
      4: 'm2',
      5: 'm2',
      6: 'm2',
      7: 'm2',
      8: 'm3',
      9: 'm3',
      10: 'm3',
      11: 'm3',
      12: 'm3',
      13: 'm3',
      14: 'm4',
      15: 'm4',
    };
  }
  return {
    1: 'm3_1',
    2: 'm3_1',
    3: 'm3_2',
    4: 'm3_2',
    5: 'm3_3',
    6: 'm3_3',
    7: 'm3_3',
    8: 'm3_3',
    9: 'm3_3',
    10: 'm3_3',
    11: 'm3_3',
    12: 'm3_3',
    13: 'm3_3',
    14: 'm3_4',
    15: 'm3_4',
  };
});

function nodesOfPhase(phase: EmergencyPhase) {
  return process.stages.filter((stage) => stage.id >= phase.start && stage.id <= phase.end);
}

const unlockedPhases = computed(() =>
  phaseList.value.filter((phase) => process.isPhaseUnlocked(phase)),
);

interface ResponsePlanInfo {
  level: string;
  title: string;
  code: string;
  version: string;
  issuingAuthority: string;
  scope: string;
  trigger: string;
  summary: string;
  actions: string[];
}

const responsePlans: Record<'team' | 'plant' | 'company' | 'government', ResponsePlanInfo> = {
  team: {
    level: '现场处置方案',
    title: '加氢裂化装置 T103 塔泄漏着火现场处置方案',
    code: 'MMPC-LY-T103-XC-2026',
    version: '2026版',
    issuingAuthority: '炼油分部加氢裂化装置',
    scope: 'T103塔、塔底泵及相邻工艺管线发生泄漏、着火等先期事故处置。',
    trigger: '岗位发现泄漏、明火、可燃气体报警或设备温压异常时立即启动。',
    summary: '以岗位人员先期控制为核心，落实报警、工艺切断、人员疏散和初起火灾扑救。',
    actions: [
      '立即报警并确认风向',
      '紧急切断物料并实施氮气置换',
      '组织无关人员向上风向疏散',
      '在确保安全的前提下控制初起火灾',
    ],
  },
  plant: {
    level: '运行部级预案',
    title: '炼油运行部加氢裂化装置火灾事故专项应急预案',
    code: 'MMPC-LY-YXB-2026-03',
    version: '2026版',
    issuingAuthority: '炼油运行部',
    scope: '班组力量无法有效控制，需运行部统一调配工艺、消防、气防和警戒力量的事故。',
    trigger: '火势扩大、存在有毒介质扩散风险或班组处置资源不足时启动。',
    summary: '由运行部建立现场指挥，统筹工艺处置、消防主攻、气体检测、警戒疏散和医疗待命。',
    actions: [
      '成立运行部现场指挥组',
      '调集运行部应急队伍和物资',
      '扩大警戒并持续开展气体检测',
      '研判是否升级公司级响应',
    ],
  },
  company: {
    level: '公司级预案',
    title: '中国石化茂名分公司化工厂区突发事件综合应急预案',
    code: 'MMPC-ZHYA-2026',
    version: '2026版',
    issuingAuthority: '中国石化茂名分公司',
    scope: '事故影响跨运行部、可能造成较大人员伤亡或重大生产环境影响的公司级突发事件。',
    trigger: '运行部级力量无法控制、事故影响跨区域或存在重大次生灾害风险时启动。',
    summary: '启动公司应急指挥体系，统一调度消防、医疗、环保、生产和外部协作资源。',
    actions: [
      '成立公司应急指挥部',
      '实施跨部门资源统一调度',
      '开展环境监测与次生风险控制',
      '按规定向属地政府报告',
    ],
  },
  government: {
    level: '社会应急预案',
    title: '茂名市危险化学品生产安全事故应急预案',
    code: 'MM-YJ-HXP-2026',
    version: '2026版',
    issuingAuthority: '茂名市人民政府',
    scope: '事故影响超出企业控制能力，需要属地政府组织社会应急力量协同处置。',
    trigger: '事故可能影响周边区域、需实施社会面疏散或企业救援资源不足时启动。',
    summary: '纳入茂名市应急指挥体系，协调公安、消防救援、医疗、生态环境和属地力量联合处置。',
    actions: [
      '接入市级现场指挥体系',
      '联动社会消防与医疗资源',
      '组织周边交通管制和群众疏散',
      '统一发布事故及风险信息',
    ],
  },
};

const currentResponsePlan = computed<ResponsePlanInfo>(() => {
  const phaseMode: Record<string, 'team' | 'plant' | 'company' | 'government'> = {
    'phase-team': 'team',
    'phase-plant': 'plant',
    'phase-company': 'company',
    'phase-gov': 'government',
  };
  const mode = phaseMode[activePhase.value.id] ?? process.state.responseMode;
  return responsePlans[mode];
});

function updatePlanTextOverflow() {
  nextTick(() => {
    const viewport = planViewportEl.value;
    const text = planTextEl.value;
    planTextOverflow.value = Boolean(viewport && text && text.scrollWidth > viewport.clientWidth);
  });
}

/** 兼容保留：方案 B 分支不再启用 */
function stageVisibleInB(_stageId: number): boolean {
  return false;
}

function phaseMajorPhaseIds(phase: EmergencyPhase): string[] {
  const ids = new Set<string>();
  for (let id = phase.start; id <= phase.end; id += 1) {
    const mapped = nodeToPhaseMap.value[id];
    if (mapped) ids.add(mapped);
  }
  return [...ids];
}

const currentPhaseActionCards = computed<PlanActionCard[]>(() => {
  const majorIds = new Set(phaseMajorPhaseIds(activePhase.value));
  const subIds = new Set(
    plan.currentPlan.value.subPhases
      .filter((sub) => majorIds.has(sub.parentId))
      .map((sub) => sub.id),
  );
  return plan.currentPlan.value.actionCards.filter(
    (card) => subIds.has(card.startSubPhaseId) || subIds.has(card.endSubPhaseId),
  );
});

const currentPhaseCardsByResource = computed<
  Array<{
    resource: PlanCombatResource;
    cards: PlanActionCard[];
  }>
>(() => {
  const map = new Map<string, PlanCombatResource>();
  for (const resource of plan.currentPlan.value.resources) {
    map.set(resource.id, resource);
  }
  const grouped = new Map<string, PlanActionCard[]>();
  for (const card of currentPhaseActionCards.value) {
    const list = grouped.get(card.resourceId) ?? [];
    list.push(card);
    grouped.set(card.resourceId, list);
  }
  return [...grouped.entries()].map(([resourceId, cards]) => ({
    resource: map.get(resourceId) ?? {
      id: resourceId,
      name: resourceId,
      expectedCount: 0,
      actualCount: 0,
      duties: '',
    },
    cards,
  }));
});

const actionToggles = ref<Record<string, boolean>>({});

watch(
  () => process.state.activePhaseId,
  () => {
    const next: Record<string, boolean> = {};
    for (const action of process.currentStage.value.currentActions) {
      next[`${process.state.activePhaseId}-${action.id}`] = action.done;
    }
    actionToggles.value = next;
  },
  { immediate: true },
);

const cardStatusLabel: Record<PlanActionCard['status'], string> = {
  pending: '待执行',
  'in-progress': '执行中',
  completed: '已完成',
};

function handleNodeClick(stageId: number) {
  const stagePhase = phaseList.value.find(
    (phase) => stageId >= phase.start && stageId <= phase.end,
  );
  if (stagePhase && !process.canEnterPhase(stagePhase)) return;
  process.selectStage(stageId);
  scrollNodeIntoView(stageId);
  const { longitude, latitude } = props.center;
  void getSharedMap()?.flyToWorldPositions?.({
    positions: [{ longitude, latitude, height: 1200 }],
    duration: 1.15,
    pitchDeg: -42,
    rangeMultiplier: 1.35,
  });
}

function handlePhaseClick(phase: EmergencyPhase) {
  if (!process.canEnterPhase(phase)) return;
  const current = activePhase.value;
  if (phase.start > current.end) {
    const modeMap: Record<string, 'team' | 'plant' | 'company' | 'government'> = {
      'phase-team': 'team',
      'phase-plant': 'plant',
      'phase-company': 'company',
      'phase-gov': 'government',
    };
    const mode = modeMap[phase.id];
    if (mode) {
      process.requestEscalate(mode);
      return;
    }
  }
  process.selectStage(phase.start);
  scrollNodeIntoView(phase.start);
}

watch(
  () => process.state.responseMode,
  (mode) => {
    const planId =
      mode === 'company' || mode === 'government' ? 'plan-maoming-001' : 'plan-t103-002';
    if (plan.currentPlan.value.id !== planId) {
      plan.selectPlan(planId);
    }
  },
);

function handleOpenCard(card: PlanActionCard) {
  plan.openCard(card);
}

function toggleAction(actionId: string) {
  actionToggles.value[`${process.state.activePhaseId}-${actionId}`] =
    !actionToggles.value[`${process.state.activePhaseId}-${actionId}`];
}

onMounted(() => {
  void process.loadEmergencyProcessRemote();
  requestAnimationFrame(() => {
    scrollNodeIntoView(process.state.activePhaseId);
    nextTick(updateScrollState);
  });
  window.addEventListener('resize', updateScrollState);
  window.addEventListener('resize', updatePlanTextOverflow);
  updatePlanTextOverflow();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScrollState);
  window.removeEventListener('resize', updatePlanTextOverflow);
  process.stopAutoDemo();
});

watch([presentLevel, () => process.state.activePhaseId], () => {
  nextTick(() => {
    updateScrollState();
    requestAnimationFrame(() => scrollNodeIntoView(process.state.activePhaseId));
    updatePlanTextOverflow();
  });
});
</script>

<template>
  <section class="ppm" :class="[`ppm--${mode}`, { 'is-strip': presentLevel === 'strip' }]">
    <header class="ppm__header">
      <div class="ppm__title-group">
        <h2 class="ppm__title">应急响应流程</h2>
        <span class="ppm__divider">/</span>
        <button
          type="button"
          class="ppm__plan-link"
          :title="`查看${currentResponsePlan.level}：${currentResponsePlan.title}`"
          @click="planDetailOpen = true"
        >
          <span class="ppm__plan-level">{{ currentResponsePlan.level }}</span>
          <span ref="planViewportEl" class="ppm__plan-viewport">
            <span class="ppm__plan-track" :class="{ 'is-marquee': planTextOverflow }">
              <span ref="planTextEl" class="ppm__plan-text">{{ currentResponsePlan.title }}</span>
              <span v-if="planTextOverflow" class="ppm__plan-text" aria-hidden="true">{{
                currentResponsePlan.title
              }}</span>
            </span>
          </span>
          <span class="ppm__plan-detail">查看 ›</span>
        </button>
      </div>

      <div class="ppm__actions">
        <button
          type="button"
          class="ppm__advance-btn"
          :disabled="process.state.activePhaseId >= process.stages.length"
          title="标记当前节点完成并推进到下一节点"
          @click="process.advanceNext()"
        >
          ▶ 下一步
        </button>
        <button
          type="button"
          class="ppm__expand"
          @click="presentLevel === 'strip' ? setPresentLevel('panel') : setPresentLevel('strip')"
        >
          {{ presentLevel === 'strip' ? '▸ 展开' : '⤴ 收起' }}
        </button>
        <button type="button" class="ppm__modal-btn" @click="plan.openPlanMatrix()">▢ 详情</button>
      </div>
    </header>

    <div ref="topScrollEl" class="ppm__top-scroll" @scroll.passive="onTopScroll">
      <div class="ppm__top-inner">
        <div class="ppm__variant-a">
          <div
            v-for="phase in unlockedPhases"
            :key="phase.id"
            class="ppm__seg"
            :class="[
              `ppm__seg--${phase.tone}`,
              {
                'is-active': activePhase.id === phase.id,
                'is-disabled': !process.canEnterPhase(phase),
              },
            ]"
            :style="{ flexBasis: `${(phase.end - phase.start + 1) * 92}px` }"
            @click="handlePhaseClick(phase)"
          >
            <div class="ppm__seg-head">
              <span class="ppm__seg-dot" />
              <span>{{ phase.name }}</span>
            </div>
            <div class="ppm__seg-nodes">
              <div
                v-for="stage in nodesOfPhase(phase)"
                :key="stage.id"
                :ref="(el) => setNodeRef(stage.id, el as HTMLElement | null)"
                class="ppm__node ppm__node--seg"
                :class="{
                  'is-active': process.state.activePhaseId === stage.id,
                  'is-completed': process.isCompleted(stage.id),
                }"
                @click.stop="handleNodeClick(stage.id)"
              >
                <div class="ppm__node-circle">
                  <span v-if="process.isCompleted(stage.id)">✓</span>
                  <span v-else>{{ stage.id }}</span>
                </div>
                <div class="ppm__node-label">
                  <span class="ppm__node-name" :title="stage.shortName">{{ stage.shortName }}</span>
                  <button
                    type="button"
                    class="ppm__node-help"
                    title="查看处置过程指导"
                    @click.stop="process.openGuidance(String(stage.id))"
                  >
                    ?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="false" class="ppm__variant-b">
          <div class="ppm__pipeline" />
          <template v-for="stage in process.stages" :key="stage.id">
            <div
              v-if="stageVisibleInB(stage.id)"
              :ref="(el) => setNodeRef(stage.id, el as HTMLElement | null)"
              class="ppm__node"
              :class="{
                'is-active': process.state.activePhaseId === stage.id,
                'is-completed': process.isCompleted(stage.id),
              }"
              @click="handleNodeClick(stage.id)"
            >
              <div class="ppm__node-circle">
                <span v-if="process.isCompleted(stage.id)">✓</span>
                <span v-else>{{ stage.id }}</span>
              </div>
              <div class="ppm__node-label">
                <span class="ppm__node-name" :title="stage.shortName">{{ stage.shortName }}</span>
                <button
                  type="button"
                  class="ppm__node-help"
                  title="查看处置过程指导"
                  @click.stop="process.openGuidance(String(stage.id))"
                >
                  ?
                </button>
              </div>
            </div>
            <span
              v-else
              class="ppm__dot-mini"
              :title="stage.name"
              @click="handleNodeClick(stage.id)"
            />
          </template>
          <div class="ppm__b-chip">{{ activePhase.name }}</div>
        </div>

        <div v-if="false" class="ppm__variant-c">
          <div
            v-for="phase in phaseList"
            :key="phase.id"
            class="ppm__card"
            :class="[`ppm__card--${phase.tone}`, { 'is-active': activePhase.id === phase.id }]"
            @click="handlePhaseClick(phase)"
          >
            <div class="ppm__card-head">
              <span class="ppm__seg-dot" />
              <span>{{ phase.name }}</span>
            </div>
            <div class="ppm__card-nodes">
              <div
                v-for="stage in nodesOfPhase(phase)"
                :key="stage.id"
                :ref="(el) => setNodeRef(stage.id, el as HTMLElement | null)"
                class="ppm__node ppm__node--card"
                :class="{
                  'is-active': process.state.activePhaseId === stage.id,
                  'is-completed': process.isCompleted(stage.id),
                }"
                @click.stop="handleNodeClick(stage.id)"
              >
                <div class="ppm__node-circle">
                  <span v-if="process.isCompleted(stage.id)">✓</span>
                  <span v-else>{{ stage.id }}</span>
                </div>
                <div class="ppm__node-label">
                  <span class="ppm__node-name" :title="stage.shortName">{{ stage.shortName }}</span>
                  <button
                    type="button"
                    class="ppm__node-help"
                    title="查看处置过程指导"
                    @click.stop="process.openGuidance(String(stage.id))"
                  >
                    ?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="ppm__scrollbar">
      <button
        type="button"
        class="ppm__scrollbar__btn"
        aria-label="向左滚动"
        @click="scrollStripBy(-240)"
      >
        ‹
      </button>
      <div ref="railEl" class="ppm__scrollbar__rail" @click="onRailClick">
        <div
          class="ppm__scrollbar__thumb"
          :class="{ 'is-dragging': scrollState.dragging }"
          :style="{
            left: `${scrollState.leftPx}px`,
            width: `${scrollState.widthPx}px`,
          }"
          @pointerdown="onThumbDown"
          @pointermove="onThumbMove"
          @pointerup="onThumbUp"
          @pointercancel="onThumbUp"
        />
      </div>
      <button
        type="button"
        class="ppm__scrollbar__btn"
        aria-label="向右滚动"
        @click="scrollStripBy(240)"
      >
        ›
      </button>
    </div>

    <div v-show="presentLevel === 'panel'" class="ppm__stage">
      <div class="ppm__stage-card ppm__stage-info">
        <div class="ppm__stage-card__head">
          <span class="ppm__stage-card__title">当前节点指挥卡</span>
          <span class="ppm__stage-card__phase">{{ activePhase.name }}</span>
        </div>
        <div class="ppm__stage-card__body">
          <div class="ppm__node-head">
            <div class="ppm__node-head__name">{{ process.currentStage.value.name }}</div>
            <div class="ppm__node-head__level">{{ process.currentStage.value.commandLevel }}</div>
          </div>
          <div class="ppm__node-meta">
            <span>👤 {{ process.currentStage.value.leadRole }}</span>
            <span>🎯 {{ process.currentStage.value.leadTitle }}</span>
          </div>
          <p class="ppm__node-desc">{{ process.currentStage.value.description }}</p>

          <div class="ppm__section">
            <div class="ppm__section__title">标准响应操作</div>
            <label
              v-for="action in process.currentStage.value.currentActions"
              :key="action.id"
              class="ppm__action-row"
              :class="`ppm__action-row--${action.type ?? 'normal'}`"
            >
              <input
                type="checkbox"
                :checked="actionToggles[`${process.state.activePhaseId}-${action.id}`]"
                @change="toggleAction(action.id)"
              />
              <span>{{ action.label }}</span>
            </label>
          </div>

          <div class="ppm__section">
            <div class="ppm__section__title">完成标准</div>
            <div
              v-for="criteria in process.currentStage.value.criteriaChecklist"
              :key="criteria.id"
              class="ppm__criteria-row"
            >
              <span class="ppm__criteria-check">{{ criteria.checked ? '✅' : '⬜' }}</span>
              <span>{{ criteria.label }}</span>
            </div>
          </div>

          <div class="ppm__section ppm__escalation">
            <div class="ppm__section__title">升级规则</div>
            <div class="ppm__escalation-trigger">
              {{ process.currentStage.value.escalationRule.triggerCondition }}
            </div>
            <div class="ppm__escalation-flow">
              <span>{{ process.currentStage.value.escalationRule.fromRole }}</span>
              <span class="ppm__escalation-arrow">➤</span>
              <span>{{ process.currentStage.value.escalationRule.toRole }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="ppm__stage-card ppm__stage-command">
        <div class="ppm__stage-card__head">
          <span class="ppm__stage-card__title">当前阶段指挥与动作</span>
          <span class="ppm__stage-card__hint">点击动作卡查看详情/切换状态</span>
        </div>
        <div class="ppm__stage-card__body">
          <div class="ppm__roster">
            <span class="ppm__roster__group"
              >👥 实时值班表 <b>{{ roster.shiftGroup }}</b></span
            >
            <div class="ppm__roster__tags">
              <span class="ppm__roster__tag"
                >班组长 <b>{{ roster.supervisor }}</b></span
              >
              <span class="ppm__roster__tag"
                >内操 <b>{{ roster.boardOperator }}</b></span
              >
              <span class="ppm__roster__tag"
                >外操 <b>{{ roster.fieldOperator }}</b></span
              >
            </div>
          </div>

          <div
            v-for="group in currentPhaseCardsByResource"
            :key="group.resource.id"
            class="ppm__resource-group"
          >
            <div class="ppm__resource-group__head">
              <span class="ppm__resource-group__name">{{ group.resource.name }}</span>
              <span
                class="ppm__count-badge"
                :class="
                  Number(group.resource.actualCount) >= Number(group.resource.expectedCount)
                    ? 'is-ok'
                    : 'is-warn'
                "
              >
                实到 {{ group.resource.actualCount }} / 应到 {{ group.resource.expectedCount }}
              </span>
            </div>
            <button
              v-for="card in group.cards"
              :key="card.id"
              type="button"
              class="ppm__action-card"
              :class="`ppm__action-card--${card.status}`"
              @click="handleOpenCard(card)"
            >
              <span class="ppm__action-card__status">{{ cardStatusLabel[card.status] }}</span>
              <span class="ppm__action-card__title">{{ card.title }}</span>
            </button>
          </div>
          <div v-if="currentPhaseCardsByResource.length === 0" class="ppm__empty-tip">
            当前阶段暂无动作卡
          </div>
        </div>
      </div>
    </div>

    <ActionCardDetailDialog
      v-if="plan.selectedCard.value"
      :plan="plan.currentPlan.value"
      :card="plan.selectedCard.value"
      @close="plan.closeCard()"
    />

    <NodeGuidanceDialog />
    <EscalateConfirmDialog />
    <NodeConfigDialog />
    <PhaseDecisionDialog />

    <Teleport to="body">
      <Transition name="ppm-plan-dialog">
        <div v-if="planDetailOpen" class="ppm-plan-overlay" @click.self="planDetailOpen = false">
          <section
            class="ppm-plan-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="应急预案信息"
          >
            <header class="ppm-plan-dialog__header">
              <div>
                <span>{{ currentResponsePlan.level }}</span>
                <h3>{{ currentResponsePlan.title }}</h3>
              </div>
              <button type="button" aria-label="关闭" @click="planDetailOpen = false">×</button>
            </header>
            <div class="ppm-plan-dialog__body">
              <div class="ppm-plan-dialog__meta">
                <div>
                  <span>预案编号</span><b>{{ currentResponsePlan.code }}</b>
                </div>
                <div>
                  <span>版本</span><b>{{ currentResponsePlan.version }}</b>
                </div>
                <div>
                  <span>发布单位</span><b>{{ currentResponsePlan.issuingAuthority }}</b>
                </div>
              </div>
              <section>
                <h4>预案摘要</h4>
                <p>{{ currentResponsePlan.summary }}</p>
              </section>
              <section>
                <h4>适用范围</h4>
                <p>{{ currentResponsePlan.scope }}</p>
              </section>
              <section>
                <h4>启动条件</h4>
                <p>{{ currentResponsePlan.trigger }}</p>
              </section>
              <section>
                <h4>关键处置措施</h4>
                <ol>
                  <li v-for="action in currentResponsePlan.actions" :key="action">{{ action }}</li>
                </ol>
              </section>
            </div>
            <footer class="ppm-plan-dialog__footer">
              <span>当前响应阶段：{{ activePhase.name }}</span>
              <button
                type="button"
                @click="
                  plan.openPlanMatrix();
                  planDetailOpen = false;
                "
              >
                查看预案全景
              </button>
            </footer>
          </section>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.ppm {
  position: relative;
  display: flex;
  flex-direction: column;
  width: calc(100% - 120px);
  height: 100%;
  margin-right: 120px;
  min-height: 0;
  box-sizing: border-box;
  border: 1px solid #334155;
  border-radius: 10px;
  background: radial-gradient(circle at 25% 0%, rgb(56 189 248 / 8%), transparent 45%), #0b1220;
  box-shadow: 0 8px 26px rgb(0 0 0 / 40%);
  overflow: hidden;
}

.ppm.is-strip {
  height: auto;
  flex-shrink: 0;
}

.ppm:not(.is-strip) {
  height: auto;
  max-height: calc(100vh - 210px);
}

.ppm.is-strip .ppm__stage {
  display: none;
}

.ppm__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 42px;
  padding: 8px 12px;
  box-sizing: border-box;
  flex-shrink: 0;
  border-bottom: 1px solid #1e293b;
}

.ppm--drill .ppm__header {
  background: linear-gradient(90deg, rgb(23 37 84 / 95%), rgb(15 23 42 / 95%));
}

.ppm--event .ppm__header {
  background: linear-gradient(90deg, rgb(127 29 29 / 92%), rgb(20 10 10 / 92%));
}

.ppm__title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.ppm__badge {
  flex-shrink: 0;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.ppm__badge--drill {
  background: rgb(59 130 246 / 20%);
  border: 1px solid rgb(59 130 246 / 50%);
  color: #60a5fa;
}

.ppm__badge--event {
  background: rgb(239 68 68 / 20%);
  border: 1px solid rgb(239 68 68 / 50%);
  color: var(--color-danger);
}

.ppm__title {
  margin: 0;
  color: #f8fafc;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.2;
  white-space: nowrap;
}

.ppm__divider {
  color: #475569;
  font-size: 13px;
}

.ppm__plan-link {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  max-width: min(46vw, 610px);
  height: 28px;
  padding: 0 8px;
  overflow: hidden;
  border: 1px solid rgb(248 113 113 / 22%);
  border-radius: 4px;
  background: rgb(15 23 42 / 32%);
  color: #cbd5e1;
  font-family: var(--font-body);
  cursor: pointer;
}

.ppm__plan-link:hover {
  border-color: rgb(125 211 252 / 55%);
  background: rgb(2 132 199 / 13%);
}

.ppm__plan-level {
  flex-shrink: 0;
  padding-right: 7px;
  border-right: 1px solid rgb(148 163 184 / 25%);
  color: var(--color-danger);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.ppm__plan-viewport {
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.ppm__plan-track {
  display: flex;
  width: max-content;
  max-width: 100%;
  white-space: nowrap;
}

.ppm__plan-track.is-marquee {
  max-width: none;
  animation: ppm-plan-marquee 12s linear infinite;
}

.ppm__plan-link:hover .ppm__plan-track.is-marquee {
  animation-play-state: paused;
}

.ppm__plan-text {
  flex-shrink: 0;
  padding-right: 44px;
  font-size: 11px;
}

.ppm__plan-detail {
  flex-shrink: 0;
  color: var(--map-sky-soft);
  font-size: 10px;
  white-space: nowrap;
}

@keyframes ppm-plan-marquee {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

.ppm__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.ppm__advance-btn,
.ppm__demo-btn,
.ppm__finish-btn,
.ppm__expand,
.ppm__modal-btn {
  height: 26px;
  padding: 0 10px;
  border: 1px solid #475569;
  border-radius: 5px;
  background: #1e293b;
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.ppm__advance-btn:hover,
.ppm__demo-btn:hover,
.ppm__finish-btn:hover,
.ppm__expand:hover,
.ppm__modal-btn:hover {
  background: #334155;
  border-color: var(--map-sky);
  color: var(--color-text-strong);
}

.ppm__advance-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ppm__finish-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ppm__finish-btn:not(:disabled) {
  border-color: rgb(16 185 129 / 55%);
  background: rgb(16 185 129 / 16%);
  color: var(--color-success);
}

.ppm__demo-btn.is-running {
  border-color: var(--map-sky);
  background: rgb(2 132 199 / 24%);
  color: var(--map-sky-soft);
}

.ppm__top-scroll {
  flex-shrink: 0;
  overflow-x: auto;
  padding: 6px 12px 8px;
  border-bottom: 1px solid #1e293b;
  background: #0f172a;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
}

.ppm__top-scroll::-webkit-scrollbar {
  display: none;
}

.ppm__scrollbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 5px 12px 7px;
  border-bottom: 1px solid #1e293b;
  background: #0b1220;
}

.ppm__scrollbar__btn {
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid #334155;
  border-radius: 4px;
  background: #1e293b;
  color: var(--map-sky-soft);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.18s ease;
}

.ppm__scrollbar__btn:hover {
  border-color: var(--map-sky);
  color: var(--color-text-strong);
}

.ppm__scrollbar__rail {
  position: relative;
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgb(51 65 85 / 50%);
  cursor: pointer;
}

.ppm__scrollbar__thumb {
  position: absolute;
  top: 0;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #0284c7, var(--map-sky));
  box-shadow: 0 0 8px rgb(56 189 248 / 50%);
  cursor: grab;
  transition:
    width 0.12s ease,
    opacity 0.18s ease;
}

.ppm__scrollbar__thumb.is-dragging {
  cursor: grabbing;
  opacity: 0.85;
}

.ppm__scrollbar__thumb:active {
  cursor: grabbing;
}

.ppm *::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.ppm *::-webkit-scrollbar-track {
  background: rgb(15 23 42 / 80%);
}

.ppm *::-webkit-scrollbar-thumb {
  border-radius: 2px;
  background: rgb(56 189 248 / 45%);
}

.ppm *::-webkit-scrollbar-thumb:hover {
  background: rgb(56 189 248 / 70%);
}

.ppm__strip-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
  min-width: 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
}

.ppm__pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding: 0 10px;
  border: 1px solid #334155;
  border-radius: 12px;
  background: #1e293b;
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s ease;
}

.ppm__pill:hover {
  border-color: var(--map-sky);
}

.ppm__pill.is-active {
  border-color: var(--map-sky);
  background: rgb(2 132 199 / 20%);
  color: var(--color-text-strong);
}

.ppm__pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #64748b;
}

.ppm__pill--blue .ppm__pill-dot {
  background: var(--map-sky);
}

.ppm__pill--cyan .ppm__pill-dot {
  background: #22d3ee;
}

.ppm__pill--amber .ppm__pill-dot {
  background: var(--color-warning);
}

.ppm__pill--red .ppm__pill-dot {
  background: var(--color-danger);
}

.ppm__pill--green .ppm__pill-dot {
  background: var(--color-success);
}

.ppm__strip-current {
  margin-left: 8px;
  color: var(--map-sky-soft);
  font-size: 11px;
  white-space: nowrap;
}

.ppm__top-inner {
  min-width: max-content;
}

.ppm__phases {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.ppm__phase-tab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding: 0 10px;
  border: 1px solid #334155;
  border-radius: 5px;
  background: #1e293b;
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s ease;
}

.ppm__phase-tab:hover {
  border-color: var(--map-sky);
}

.ppm__phase-tab.is-active {
  border-color: var(--map-sky);
  background: rgb(2 132 199 / 20%);
  color: var(--color-text-strong);
  box-shadow: 0 0 10px rgb(56 189 248 / 20%);
}

.ppm__phase-tab__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.ppm__phase-tab--blue .ppm__phase-tab__dot {
  background: var(--map-sky);
}

.ppm__phase-tab--cyan .ppm__phase-tab__dot {
  background: #22d3ee;
}

.ppm__phase-tab--amber .ppm__phase-tab__dot {
  background: var(--color-warning);
}

.ppm__phase-tab--red .ppm__phase-tab__dot {
  background: var(--color-danger);
}

.ppm__phase-tab--green .ppm__phase-tab__dot {
  background: var(--color-success);
}

.ppm__phase-tab__range {
  color: #64748b;
  font-size: 9px;
}

.ppm__timeline-track {
  position: relative;
  display: flex;
  align-items: flex-start;
  min-width: 900px;
  height: 66px;
  padding-top: 8px;
}

.ppm__pipeline {
  position: absolute;
  top: 21px;
  left: 14px;
  right: 14px;
  height: 2px;
  background: #334155;
  z-index: var(--z-chrome);
}

.ppm__phase-band {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: var(--z-base);
  border-radius: 5px;
  pointer-events: none;
  transition: box-shadow 0.2s ease;
}

.ppm__phase-band--blue {
  background: rgb(2 132 199 / 10%);
  border: 1px solid rgb(2 132 199 / 25%);
}

.ppm__phase-band--cyan {
  background: rgb(34 211 238 / 8%);
  border: 1px solid rgb(34 211 238 / 22%);
}

.ppm__phase-band--amber {
  background: rgb(245 158 11 / 9%);
  border: 1px solid rgb(245 158 11 / 25%);
}

.ppm__phase-band--red {
  background: rgb(239 68 68 / 9%);
  border: 1px solid rgb(239 68 68 / 25%);
}

.ppm__phase-band--green {
  background: rgb(16 185 129 / 9%);
  border: 1px solid rgb(16 185 129 / 25%);
}

.ppm__phase-band.is-active {
  box-shadow:
    0 0 0 1px rgb(56 189 248 / 35%),
    0 0 14px rgb(56 189 248 / 18%);
}

.ppm__node {
  position: relative;
  z-index: var(--z-chrome);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  flex: 1 1 0;
  min-width: 88px;
  cursor: pointer;
  user-select: none;
}

.ppm__node-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #1e293b;
  border: 2px solid #475569;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.ppm__node:hover .ppm__node-circle {
  border-color: var(--map-sky);
  color: var(--map-sky-soft);
}

.ppm__node.is-active .ppm__node-circle {
  border-color: var(--map-sky);
  background: rgb(2 132 199 / 30%);
  color: var(--color-text-strong);
  box-shadow:
    0 0 0 4px rgb(56 189 248 / 16%),
    0 0 14px rgb(56 189 248 / 55%);
  animation: ppm-node-pulse 1.8s ease-out infinite;
}

.ppm__node.is-completed .ppm__node-circle {
  border-color: var(--color-success);
  background: rgb(16 185 129 / 22%);
  color: var(--color-success);
}

@keyframes ppm-node-pulse {
  0% {
    box-shadow:
      0 0 0 4px rgb(56 189 248 / 16%),
      0 0 14px rgb(56 189 248 / 55%);
  }

  70% {
    box-shadow:
      0 0 0 9px rgb(56 189 248 / 0%),
      0 0 14px rgb(56 189 248 / 55%);
  }

  100% {
    box-shadow:
      0 0 0 4px rgb(56 189 248 / 16%),
      0 0 14px rgb(56 189 248 / 55%);
  }
}

.ppm__node-label {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
  max-width: 100%;
}

.ppm__node-name {
  color: #94a3b8;
  font-size: 10px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ppm__node.is-active .ppm__node-name {
  color: #e2e8f0;
  font-weight: 700;
}

.ppm__node-help {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid #475569;
  background: #1e293b;
  color: var(--map-sky-soft);
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
}

.ppm__node-help:hover {
  border-color: var(--map-sky);
  background: rgb(2 132 199 / 30%);
  color: var(--color-text-strong);
}

.ppm__node-level {
  color: #64748b;
  font-size: 8px;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.ppm__node.is-active .ppm__node-level {
  color: var(--map-sky-soft);
}

.ppm__stage {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
  gap: 10px;
  padding: 10px 12px 12px;
  overflow: hidden;
  box-sizing: border-box;
}

.ppm__stage-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid #334155;
  border-radius: 8px;
  background: #0f172a;
  overflow: hidden;
}

.ppm__stage-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 34px;
  padding: 0 12px;
  border-bottom: 1px solid #1e293b;
  background: #1e293b;
  flex-shrink: 0;
}

.ppm__stage-card__title {
  color: #f8fafc;
  font-size: 12px;
  font-weight: 800;
}

.ppm__stage-card__phase {
  padding: 1px 8px;
  border-radius: 4px;
  background: rgb(56 189 248 / 16%);
  border: 1px solid rgb(56 189 248 / 40%);
  color: var(--map-sky-soft);
  font-size: 10px;
  font-weight: 700;
}

.ppm__stage-card__hint {
  color: #64748b;
  font-size: 10px;
}

.ppm__stage-card__body {
  flex: 1;
  min-height: 0;
  padding: 10px 12px;
  overflow-y: auto;
}

.ppm__node-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.ppm__node-head__name {
  color: #f8fafc;
  font-size: 16px;
  font-weight: 800;
}

.ppm__node-head__level {
  padding: 2px 8px;
  border-radius: 4px;
  background: rgb(239 68 68 / 14%);
  border: 1px solid rgb(239 68 68 / 40%);
  color: var(--color-danger);
  font-size: 10px;
  font-weight: 700;
}

.ppm__node-meta {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  color: #94a3b8;
  font-size: 11px;
}

.ppm__node-desc {
  margin: 8px 0 0;
  color: #cbd5e1;
  font-size: 12px;
  line-height: 1.6;
}

.ppm__section {
  margin-top: 10px;
  padding: 8px 10px;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #1e293b;
}

.ppm__section__title {
  margin-bottom: 6px;
  color: var(--map-sky-soft);
  font-size: 11px;
  font-weight: 700;
}

.ppm__action-row {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 4px 0;
  color: #cbd5e1;
  font-size: 11px;
  line-height: 1.4;
  cursor: pointer;
}

.ppm__action-row input {
  accent-color: var(--map-sky);
  flex-shrink: 0;
}

.ppm__action-row--danger .ppm__action-row-text {
  color: var(--color-danger);
}

.ppm__criteria-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
  color: #94a3b8;
  font-size: 11px;
}

.ppm__escalation {
  border-color: rgb(245 158 11 / 30%);
}

.ppm__escalation-trigger {
  color: #cbd5e1;
  font-size: 11px;
  line-height: 1.45;
}

.ppm__escalation-flow {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  color: var(--map-sky-soft);
  font-size: 11px;
}

.ppm__escalation-arrow {
  color: var(--color-warning);
}

.ppm__roster {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 10px;
  border: 1px solid rgb(56 189 248 / 25%);
  border-radius: 6px;
  background: rgb(2 132 199 / 8%);
}

.ppm__roster__group {
  color: #cbd5e1;
  font-size: 11px;
}

.ppm__roster__group b {
  color: var(--map-sky-soft);
}

.ppm__roster__tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ppm__roster__tag {
  color: #94a3b8;
  font-size: 10px;
}

.ppm__roster__tag b {
  color: #e2e8f0;
}

.ppm__resource-group {
  margin-top: 10px;
  padding: 8px 10px;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #1e293b;
}

.ppm__resource-group__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.ppm__resource-group__name {
  color: #f8fafc;
  font-size: 12px;
  font-weight: 700;
}

.ppm__count-badge {
  display: inline-flex;
  align-items: center;
  min-height: 16px;
  padding: 0 5px;
  border-radius: 3px;
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.ppm__count-badge.is-ok {
  background: rgb(16 185 129 / 14%);
  border: 1px solid rgb(16 185 129 / 40%);
  color: var(--color-success);
}

.ppm__count-badge.is-warn {
  background: rgb(245 158 11 / 14%);
  border: 1px solid rgb(245 158 11 / 45%);
  color: var(--color-warning);
}

.ppm__action-card {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 30px;
  margin-top: 5px;
  padding: 5px 8px;
  border: 1px solid #334155;
  border-radius: 5px;
  background: #0f172a;
  color: #e2e8f0;
  text-align: left;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.18s ease;
}

.ppm__action-card:hover {
  border-color: var(--map-sky);
  filter: brightness(1.1);
}

.ppm__action-card--in-progress {
  border-color: #0284c7;
  background: rgb(2 132 199 / 14%);
}

.ppm__action-card--completed {
  border-color: rgb(16 185 129 / 40%);
  background: rgb(16 185 129 / 10%);
}

.ppm__action-card__status {
  flex-shrink: 0;
  color: #94a3b8;
  font-size: 9px;
  font-weight: 700;
}

.ppm__action-card--in-progress .ppm__action-card__status {
  color: var(--map-sky);
}

.ppm__action-card--completed .ppm__action-card__status {
  color: var(--color-success);
}

.ppm__action-card__title {
  font-size: 11px;
  line-height: 1.35;
}

.ppm__empty-tip {
  margin-top: 12px;
  color: #64748b;
  font-size: 12px;
  text-align: center;
}

.ppm__variant-switch {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border: 1px solid #334155;
  border-radius: 5px;
  background: #0f172a;
}

.ppm__variant-switch button {
  width: 24px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font-body);
  cursor: pointer;
}

.ppm__variant-switch button.is-active {
  background: rgb(56 189 248 / 20%);
  color: var(--map-sky-soft);
}

/* 方案 A：阶段分区轨道 */
.ppm__variant-a {
  display: flex;
  align-items: stretch;
  gap: 4px;
  min-width: max-content;
}

.ppm__seg {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 0 0 auto;
  min-width: 0;
  width: auto;
  padding: 6px 8px;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #1e293b;
  cursor: pointer;
  transition: all 0.18s ease;
}

.ppm__seg--blue {
  border-color: rgb(2 132 199 / 35%);
  background: rgb(2 132 199 / 10%);
}

.ppm__seg--cyan {
  border-color: rgb(34 211 238 / 30%);
  background: rgb(34 211 238 / 8%);
}

.ppm__seg--amber {
  border-color: rgb(245 158 11 / 32%);
  background: rgb(245 158 11 / 8%);
}

.ppm__seg--red {
  border-color: rgb(239 68 68 / 32%);
  background: rgb(239 68 68 / 8%);
}

.ppm__seg--green {
  border-color: rgb(16 185 129 / 32%);
  background: rgb(16 185 129 / 8%);
}

.ppm__seg.is-active {
  border-color: var(--map-sky);
  box-shadow:
    0 0 0 1px rgb(56 189 248 / 40%),
    0 0 14px rgb(56 189 248 / 18%);
}

.ppm__seg.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ppm__seg.is-collapsed {
  min-width: 0;
  align-items: center;
  justify-content: center;
}

.ppm__seg-head {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e2e8f0;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.ppm__seg-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #64748b;
  flex-shrink: 0;
}

.ppm__seg--blue .ppm__seg-dot {
  background: var(--map-sky);
}

.ppm__seg--cyan .ppm__seg-dot {
  background: #22d3ee;
}

.ppm__seg--amber .ppm__seg-dot {
  background: var(--color-warning);
}

.ppm__seg--red .ppm__seg-dot {
  background: var(--color-danger);
}

.ppm__seg--green .ppm__seg-dot {
  background: var(--color-success);
}

.ppm__seg-nodes {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.ppm__node--seg {
  min-width: 72px;
}

.ppm__seg-collapsed {
  height: 28px;
  padding: 0 10px;
  border: 1px dashed #475569;
  border-radius: 5px;
  background: rgb(15 23 42 / 70%);
  color: #94a3b8;
  font-size: 11px;
  font-family: var(--font-body);
  cursor: pointer;
}

.ppm__seg-collapsed:hover {
  border-color: var(--map-sky);
  color: var(--map-sky-soft);
}

/* 方案 B：单轨聚焦 */
.ppm__variant-b {
  position: relative;
  display: flex;
  align-items: flex-start;
  min-width: max-content;
  height: 66px;
  padding-top: 8px;
}

.ppm__dot-mini {
  position: relative;
  z-index: var(--z-marker);
  align-self: center;
  width: 10px;
  height: 10px;
  margin: 8px 18px 0;
  border-radius: 50%;
  background: #334155;
  border: 1px solid #475569;
  cursor: pointer;
  transition: all 0.18s ease;
  flex-shrink: 0;
}

.ppm__dot-mini:hover {
  background: var(--map-sky);
  border-color: var(--map-sky);
}

.ppm__b-chip {
  position: absolute;
  top: 0;
  left: 8px;
  padding: 1px 8px;
  border-radius: 4px;
  background: rgb(56 189 248 / 18%);
  border: 1px solid rgb(56 189 248 / 40%);
  color: var(--map-sky-soft);
  font-size: 10px;
  font-weight: 700;
}

/* 方案 C：阶段卡片横向堆叠 */
.ppm__variant-c {
  display: flex;
  gap: 8px;
  min-width: max-content;
}

.ppm__card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 170px;
  padding: 8px;
  border: 1px solid #334155;
  border-radius: 8px;
  background: #1e293b;
  cursor: pointer;
  transition: all 0.18s ease;
}

.ppm__card--blue {
  border-color: rgb(2 132 199 / 35%);
}

.ppm__card--cyan {
  border-color: rgb(34 211 238 / 30%);
}

.ppm__card--amber {
  border-color: rgb(245 158 11 / 32%);
}

.ppm__card--red {
  border-color: rgb(239 68 68 / 32%);
}

.ppm__card--green {
  border-color: rgb(16 185 129 / 32%);
}

.ppm__card.is-active {
  border-color: var(--map-sky);
  box-shadow:
    0 0 0 1px rgb(56 189 248 / 40%),
    0 0 14px rgb(56 189 248 / 18%);
}

.ppm__card-head {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e2e8f0;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.ppm__card-nodes {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ppm__node--card {
  flex-direction: row;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.ppm__node--card .ppm__node-circle {
  width: 22px;
  height: 22px;
  font-size: 10px;
}

.ppm__node--card .ppm__node-label {
  flex-direction: row;
}
</style>

<style>
.ppm-plan-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgb(1 8 18 / 72%);
  backdrop-filter: blur(5px);
}

.ppm-plan-dialog {
  width: min(720px, calc(100vw - 48px));
  max-height: calc(100vh - 72px);
  overflow: hidden;
  border: 1px solid rgb(56 189 248 / 48%);
  border-radius: 8px;
  background: linear-gradient(145deg, #0b1a2d, #08111f 68%);
  box-shadow:
    0 24px 80px rgb(0 0 0 / 58%),
    inset 0 0 36px rgb(2 132 199 / 4%);
  color: #dbeafe;
  font-family: var(--font-body);
}

.ppm-plan-dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 16px 18px;
  border-bottom: 1px solid rgb(56 189 248 / 20%);
  background: linear-gradient(90deg, rgb(2 132 199 / 20%), rgb(15 23 42 / 10%));
}

.ppm-plan-dialog__header span {
  color: var(--map-sky);
  font-size: 11px;
  font-weight: 700;
}

.ppm-plan-dialog__header h3 {
  margin: 5px 0 0;
  color: #f8fafc;
  font-size: 18px;
  line-height: 1.35;
}

.ppm-plan-dialog__header button {
  width: 28px;
  height: 28px;
  padding: 0;
  flex-shrink: 0;
  border: 1px solid #334155;
  border-radius: 4px;
  background: #152238;
  color: #94a3b8;
  font-size: 20px;
  cursor: pointer;
}

.ppm-plan-dialog__header button:hover {
  border-color: var(--map-sky);
  color: var(--color-text-strong);
}

.ppm-plan-dialog__body {
  max-height: calc(100vh - 250px);
  padding: 16px 18px;
  overflow-y: auto;
}

.ppm-plan-dialog__meta {
  display: grid;
  grid-template-columns: 1.2fr 0.7fr 1.4fr;
  gap: 8px;
  margin-bottom: 14px;
}

.ppm-plan-dialog__meta > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
  padding: 9px 11px;
  border: 1px solid rgb(51 65 85 / 80%);
  border-radius: 5px;
  background: rgb(30 41 59 / 55%);
}

.ppm-plan-dialog__meta span {
  color: #64748b;
  font-size: 10px;
}

.ppm-plan-dialog__meta b {
  overflow: hidden;
  color: #dbeafe;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ppm-plan-dialog__body section {
  margin-top: 9px;
  padding: 11px 13px;
  border-left: 2px solid rgb(56 189 248 / 65%);
  background: rgb(15 23 42 / 66%);
}

.ppm-plan-dialog__body h4 {
  margin: 0 0 6px;
  color: var(--map-sky-soft);
  font-size: 12px;
}

.ppm-plan-dialog__body p,
.ppm-plan-dialog__body li {
  color: #b9c8d8;
  font-size: 12px;
  line-height: 1.7;
}

.ppm-plan-dialog__body p {
  margin: 0;
}

.ppm-plan-dialog__body ol {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 24px;
  margin: 0;
  padding-left: 20px;
}

.ppm-plan-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 18px;
  border-top: 1px solid rgb(56 189 248 / 18%);
  background: rgb(3 10 20 / 72%);
}

.ppm-plan-dialog__footer span {
  color: #7b94ad;
  font-size: 11px;
}

.ppm-plan-dialog__footer button {
  height: 30px;
  padding: 0 14px;
  border: 1px solid #0284c7;
  border-radius: 4px;
  background: rgb(2 132 199 / 22%);
  color: var(--map-sky-soft);
  font: 700 11px var(--font-body);
  cursor: pointer;
}

.ppm-plan-dialog__footer button:hover {
  background: #0369a1;
  color: var(--color-text-strong);
}

.ppm-plan-dialog-enter-active,
.ppm-plan-dialog-leave-active {
  transition: opacity 0.18s ease;
}

.ppm-plan-dialog-enter-active .ppm-plan-dialog,
.ppm-plan-dialog-leave-active .ppm-plan-dialog {
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
}

.ppm-plan-dialog-enter-from,
.ppm-plan-dialog-leave-to {
  opacity: 0;
}

.ppm-plan-dialog-enter-from .ppm-plan-dialog,
.ppm-plan-dialog-leave-to .ppm-plan-dialog {
  opacity: 0;
  transform: translateY(10px) scale(0.985);
}

@media (prefers-reduced-motion: reduce) {
  .ppm__plan-track.is-marquee {
    animation: none;
  }
}
</style>
