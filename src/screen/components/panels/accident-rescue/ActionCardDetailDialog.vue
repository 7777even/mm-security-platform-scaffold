<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  type PlanActionCard,
  type PlanCardStatus,
  type PlanInstance,
} from '../../../lib/data/planMatrixMock';
import { usePlanMatrix } from '../../../lib/composables/usePlanMatrix';

const props = defineProps<{
  plan: PlanInstance;
  card: PlanActionCard;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { setCardStatus } = usePlanMatrix();

const subPhaseById = computed(() => {
  const map = new Map(props.plan.subPhases.map((item) => [item.id, item]));
  return map;
});

const majorPhaseById = computed(() => {
  const map = new Map(props.plan.majorPhases.map((item) => [item.id, item]));
  return map;
});

const resource = computed(
  () => props.plan.resources.find((item) => item.id === props.card.resourceId) ?? null,
);

const riskEvent = computed(
  () => props.plan.riskEvents.find((item) => item.id === props.card.riskEventId) ?? null,
);

const startSubPhase = computed(() => subPhaseById.value.get(props.card.startSubPhaseId));
const endSubPhase = computed(() => subPhaseById.value.get(props.card.endSubPhaseId));
const majorPhaseName = computed(() => {
  const phase = majorPhaseById.value.get(startSubPhase.value?.parentId ?? '');
  return phase?.name ?? '--';
});

const bindScopeLabel = computed(() => {
  const start = startSubPhase.value?.name ?? '--';
  const end = endSubPhase.value?.name ?? '--';
  return start === end ? start : `${start} → ${end}`;
});

const statusLabel: Record<PlanCardStatus, string> = {
  pending: '待执行',
  'in-progress': '执行中',
  completed: '已完成',
};

const toastVisible = ref(false);
const toastText = ref('');
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(text: string) {
  toastText.value = text;
  toastVisible.value = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastVisible.value = false;
  }, 1800);
}

function handleStatusChange(status: PlanCardStatus) {
  setCardStatus(props.card.id, status);
  showToast(`状态已切换为「${statusLabel[status]}」`);
}

watch(
  () => props.card.id,
  () => {
    toastVisible.value = false;
  },
);
</script>

<template>
  <Teleport to="body">
    <Transition name="action-detail-fade">
      <div v-if="card" class="action-detail-mask" @click.self="emit('close')">
        <Transition name="action-toast-slide">
          <div v-if="toastVisible" class="action-detail-toast">
            <span class="action-detail-toast__dot" />
            <span class="action-detail-toast__text">{{ toastText }}</span>
          </div>
        </Transition>

        <section class="action-detail-dialog" role="dialog" aria-modal="true">
          <header class="action-detail__header">
            <div class="action-detail__title-area">
              <span class="action-detail__icon">&#128302;</span>
              <h3 class="action-detail__title">{{ card.title || card.content }}</h3>
            </div>
            <button
              type="button"
              class="action-detail__close"
              aria-label="关闭"
              @click="emit('close')"
            >
              ×
            </button>
          </header>

          <div class="action-detail__body">
            <div class="action-detail__status-section">
              <span class="action-detail__status-label">执行状态切换：</span>
              <div class="action-detail__status-group">
                <button
                  type="button"
                  class="action-detail__status-btn action-detail__status-btn--pending"
                  :class="{ 'is-active': card.status === 'pending' }"
                  @click="handleStatusChange('pending')"
                >
                  &#9679; 待执行
                </button>
                <button
                  type="button"
                  class="action-detail__status-btn action-detail__status-btn--in-progress"
                  :class="{ 'is-active': card.status === 'in-progress' }"
                  @click="handleStatusChange('in-progress')"
                >
                  &#128640; 执行中
                </button>
                <button
                  type="button"
                  class="action-detail__status-btn action-detail__status-btn--completed"
                  :class="{ 'is-active': card.status === 'completed' }"
                  @click="handleStatusChange('completed')"
                >
                  &#10004; 已完成
                </button>
              </div>
            </div>

            <div v-if="riskEvent" class="action-detail__card action-detail__risk-card">
              <span class="action-detail__card-tag">&#9888; 关联突发风险警示</span>
              <span class="action-detail__risk-name">{{ riskEvent.name }}</span>
            </div>

            <div class="action-detail__grid">
              <div class="action-detail__info-item">
                <span class="action-detail__info-label">所属大阶段：</span>
                <span class="action-detail__info-value action-detail__info-value--highlight">
                  {{ majorPhaseName }}
                </span>
              </div>
              <div class="action-detail__info-item">
                <span class="action-detail__info-label">绑定范围：</span>
                <span class="action-detail__info-value">{{ bindScopeLabel }}</span>
              </div>
              <div class="action-detail__info-item">
                <span class="action-detail__info-label">责任处置部门/力量：</span>
                <span class="action-detail__info-value action-detail__info-value--highlight">
                  {{ resource?.name ?? '--' }}
                </span>
              </div>
              <div class="action-detail__info-item">
                <span class="action-detail__info-label">应到/实到：</span>
                <span class="action-detail__info-value">
                  {{ resource?.expectedCount ?? '--' }} / {{ resource?.actualCount ?? '--' }}
                </span>
              </div>
              <div v-if="resource?.leaderName" class="action-detail__info-item">
                <span class="action-detail__info-label">现场负责人/职务：</span>
                <span class="action-detail__info-value">&#128100; {{ resource.leaderName }}</span>
              </div>
              <div v-if="resource?.contactPhone" class="action-detail__info-item">
                <span class="action-detail__info-label">调度联系电话：</span>
                <span class="action-detail__info-value">&#128222; {{ resource.contactPhone }}</span>
              </div>
            </div>

            <div class="action-detail__card action-detail__protocol-card">
              <span class="action-detail__card-tag">&#128209; 预案标准处置规程要点</span>
              <p class="action-detail__protocol-text">
                {{ card.description || card.content || '暂无补充规程说明。' }}
              </p>
            </div>

            <div class="action-detail__card action-detail__safety-card">
              <span class="action-detail__card-tag">&#128737;&#65039; 防爆与安全防护要求</span>
              <p class="action-detail__safety-text">
                落实双人同侪安全制；作业前须穿戴正压式空气呼吸器 (SCBA)
                及防静电/防化作业服；严禁单人盲目进入热区。
              </p>
            </div>
          </div>

          <footer class="action-detail__footer">
            <button type="button" class="action-detail__confirm" @click="emit('close')">
              确定
            </button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
:global(.action-detail-mask) {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: rgb(2 6 23 / 86%);
}

:global(.action-detail-fade-enter-active),
:global(.action-detail-fade-leave-active) {
  transition: opacity 0.22s ease;
}

:global(.action-detail-fade-enter-from),
:global(.action-detail-fade-leave-to) {
  opacity: 0;
}

:global(.action-detail-dialog) {
  width: min(760px, 100%);
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 25% 20%, rgb(56 189 248 / 10%), transparent 50%), #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  box-shadow: 0 22px 60px rgb(0 0 0 / 60%);
  overflow: hidden;
}

:global(.action-detail-fade-enter-active .action-detail-dialog),
:global(.action-detail-fade-leave-active .action-detail-dialog) {
  transition:
    transform 0.26s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.22s ease;
}

:global(.action-detail-fade-enter-from .action-detail-dialog),
:global(.action-detail-fade-leave-to .action-detail-dialog) {
  transform: translateY(10px) scale(0.985);
  opacity: 0;
}

:global(.action-detail__header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 0 14px;
  border-bottom: 1px solid #1e293b;
  box-sizing: border-box;
  background: #1e293b;
}

:global(.action-detail__title-area) {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

:global(.action-detail__icon) {
  color: var(--map-sky);
  font-size: 16px;
  line-height: 1;
}

:global(.action-detail__title) {
  margin: 0;
  color: #f8fafc;
  font-size: 15px;
  line-height: 1.3;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.action-detail__close) {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 2px;
  background: transparent;
  color: #94a3b8;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

:global(.action-detail__close:hover) {
  color: var(--color-text-strong);
  background: #334155;
}

:global(.action-detail__body) {
  flex: 1;
  min-height: 0;
  padding: 12px 14px 16px;
  overflow: auto;
  box-sizing: border-box;
}

:global(.action-detail__status-section) {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 10px;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #1e293b;
}

:global(.action-detail__status-label) {
  color: #94a3b8;
  font-size: 12px;
  white-space: nowrap;
}

:global(.action-detail__status-group) {
  display: flex;
  gap: 8px;
}

:global(.action-detail__status-btn) {
  min-width: 84px;
  height: 26px;
  padding: 0 10px;
  border: 1px solid #475569;
  border-radius: 4px;
  background: #0f172a;
  color: #cbd5e1;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    color 0.18s ease,
    filter 0.18s ease;
}

:global(.action-detail__status-btn:hover) {
  filter: brightness(1.12);
}

:global(.action-detail__status-btn--pending.is-active) {
  border-color: #64748b;
  color: var(--color-text-strong);
  background: linear-gradient(180deg, #64748b, #475569);
}

:global(.action-detail__status-btn--in-progress.is-active) {
  border-color: var(--map-sky);
  color: var(--color-text-strong);
  background: linear-gradient(180deg, #0284c7, #0369a1);
  box-shadow: 0 0 10px rgb(56 189 248 / 30%);
}

:global(.action-detail__status-btn--completed.is-active) {
  border-color: var(--color-success);
  color: var(--color-text-strong);
  background: linear-gradient(180deg, #059669, #047857);
}

:global(.action-detail__card) {
  margin-top: 10px;
  padding: 10px 12px;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #1e293b;
}

:global(.action-detail__card-tag) {
  display: inline-flex;
  align-items: center;
  margin-bottom: 6px;
  color: #94a3b8;
  font-size: 11px;
  line-height: 1;
}

:global(.action-detail__risk-card) {
  border-color: rgb(239 68 68 / 45%);
  background: rgb(127 29 29 / 18%);
}

:global(.action-detail__risk-name) {
  display: block;
  color: var(--color-danger);
  font-size: 13px;
  line-height: 1.45;
}

:global(.action-detail__grid) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  margin-top: 10px;
  border: 1px solid #334155;
  background: #1e293b;
}

:global(.action-detail__info-item) {
  display: grid;
  grid-template-columns: 148px minmax(0, 1fr);
  align-items: center;
  min-height: 32px;
  padding: 0 10px;
  border-right: 1px solid rgb(51 65 85 / 80%);
  border-bottom: 1px solid rgb(51 65 85 / 80%);
  box-sizing: border-box;
}

:global(.action-detail__info-item:nth-child(2n)) {
  border-right: none;
}

:global(.action-detail__info-label) {
  color: #94a3b8;
  font-size: 11px;
  white-space: nowrap;
}

:global(.action-detail__info-value) {
  color: #e2e8f0;
  font-size: 11px;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.action-detail__info-value--highlight) {
  color: var(--map-sky);
}

:global(.action-detail__protocol-card),
:global(.action-detail__safety-card) {
  margin-top: 10px;
}

:global(.action-detail__protocol-text),
:global(.action-detail__safety-text) {
  margin: 0;
  color: #cbd5e1;
  font-size: 12px;
  line-height: 1.65;
}

:global(.action-detail__footer) {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 14px;
  border-top: 1px solid #1e293b;
  background: #1e293b;
}

:global(.action-detail__confirm) {
  min-width: 96px;
  height: 30px;
  padding: 0 18px;
  border: 1px solid var(--map-sky);
  border-radius: 4px;
  background: linear-gradient(180deg, #0284c7, #0369a1);
  color: var(--color-text-strong);
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
  transition: filter 0.18s ease;
}

:global(.action-detail__confirm:hover) {
  filter: brightness(1.1);
}

:global(.action-detail-toast) {
  position: fixed;
  top: 48px;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-toast);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 16px;
  border: 1px solid rgb(61 214 140 / 55%);
  border-radius: 6px;
  background: rgb(8 38 30 / 94%);
  box-shadow: 0 8px 24px rgb(0 0 0 / 40%);
}

:global(.action-detail-toast__dot) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 8px rgb(61 214 140 / 80%);
}

:global(.action-detail-toast__text) {
  color: #e6f6ee;
  font-size: 12px;
}

:global(.action-toast-slide-enter-active),
:global(.action-toast-slide-leave-active) {
  transition:
    transform 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.2s ease;
}

:global(.action-toast-slide-enter-from),
:global(.action-toast-slide-leave-to) {
  transform: translate(-50%, -10px);
  opacity: 0;
}
</style>
