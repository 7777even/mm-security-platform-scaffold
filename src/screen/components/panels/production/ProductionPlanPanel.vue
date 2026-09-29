<script setup lang="ts">
// 生产应急域「域内核预案浏览 + 一键调用」面板。
// - 按业务域过滤（domain=production）拉取生产域预案，核预案高亮标记；
// - 每条预案支持「一键调用」（激活 + 广播 + 留痕，不触达物理设备，符合零下行控制红线）；
// - 「升级/更换预案」复用应急指挥域的 EmergencyPlanSwitchDialog 提供预案切换入口。
import { onMounted, onUnmounted, ref } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import EmergencyPlanSwitchDialog from '../accident-rescue/EmergencyPlanSwitchDialog.vue';
import {
  fetchEmergencyPlanOptions,
  invokeEmergencyPlan,
  type SelectableEmergencyPlan,
} from '@/services/emergencyPlan';
import { subscribeDomainChange } from '@/services/realtime';

withDefaults(defineProps<{ eventTitle?: string }>(), {
  eventTitle: '茂名石化生产装置区突发事件应急处置',
});

const plans = ref<SelectableEmergencyPlan[]>([]);
const loading = ref(false);

async function loadPlans() {
  loading.value = true;
  try {
    const opt = await fetchEmergencyPlanOptions('production');
    plans.value = opt.plans ?? [];
  } catch {
    // 后端不可用时回落空态，不回灌假数据（零下行控制红线）
    plans.value = [];
  } finally {
    loading.value = false;
  }
}

// 升级/更换预案对话框（复用应急指挥域组件）
const switchOpen = ref(false);
const activePlanId = ref<string | null>(null);

// 一键调用确认弹窗
const invokeTarget = ref<SelectableEmergencyPlan | null>(null);
const invokeNote = ref('');
const invoking = ref(false);

// 轻量反馈条
const toast = ref<{ type: 'ok' | 'err'; text: string } | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | undefined;
function showToast(type: 'ok' | 'err', text: string) {
  toast.value = { type, text };
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = null), 2600);
}

function openInvoke(plan: SelectableEmergencyPlan) {
  invokeTarget.value = plan;
  invokeNote.value = '';
}
function closeInvoke() {
  invokeTarget.value = null;
  invokeNote.value = '';
}

async function confirmInvoke() {
  if (!invokeTarget.value) return;
  const plan = invokeTarget.value;
  invoking.value = true;
  try {
    const res = await invokeEmergencyPlan(plan.id, { note: invokeNote.value || undefined });
    if (!res) {
      showToast('err', '预案不存在或调用失败');
      return;
    }
    // 同域仅一个激活预案：刷新本地激活态与调用信息（后端 id 为数值，列表 id 为字符串）
    const planIdStr = String(res.planId);
    plans.value.forEach((p) => (p.isActive = p.id === planIdStr));
    const target = plans.value.find((p) => p.id === planIdStr);
    if (target) {
      target.invokeCount = res.invokeCount;
      target.lastInvokedAt = res.invokedAt;
    }
    activePlanId.value = planIdStr;
    showToast('ok', `已调用「${res.planName}」并完成广播`);
    closeInvoke();
  } catch (e) {
    showToast('err', e instanceof Error ? e.message : '调用失败');
  } finally {
    invoking.value = false;
  }
}

function openSwitch() {
  switchOpen.value = true;
}
async function handlePlanSelect(plan: SelectableEmergencyPlan) {
  activePlanId.value = plan.id;
  try {
    // 「升级/更换预案」= 对该预案发起一键调用（激活 + 广播 + 留痕），写后端持久化，避免仅本地置位丢失
    const res = await invokeEmergencyPlan(plan.id, { note: '升级/更换预案' });
    const planIdStr = String(res.planId);
    plans.value.forEach((p) => (p.isActive = p.id === planIdStr));
    const target = plans.value.find((p) => p.id === planIdStr);
    if (target) {
      target.invokeCount = res.invokeCount;
      target.lastInvokedAt = res.invokedAt;
    }
    activePlanId.value = planIdStr;
    showToast('ok', `已切换至「${res.planName}」并完成广播`);
  } catch (e) {
    showToast('err', e instanceof Error ? e.message : '切换预案失败');
  } finally {
    switchOpen.value = false;
  }
}

function formatTime(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

let unsubscribePlan: (() => void) | undefined;

onMounted(async () => {
  await loadPlans();
  // 后端 @RealtimeSync(emergency.plan) 广播（他人/他端调用预案）→ 本面板实时刷新，对齐 ProductionAlarmPanel
  unsubscribePlan = subscribeDomainChange('emergency.plan', () => {
    void loadPlans();
  });
});

onUnmounted(() => {
  unsubscribePlan?.();
});
</script>

<template>
  <PanelCard title="域内核预案 · 一键调用" variant="risk" module="production" :show-more="false">
    <div class="domain-plan">
      <div class="domain-plan__toolbar">
        <span class="domain-plan__count">生产域预案 {{ plans.length }} 项</span>
        <button type="button" class="domain-plan__switch-btn" @click="openSwitch">
          升级/更换预案
        </button>
      </div>

      <div class="domain-plan__list ar-scroll">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="domain-plan__row"
          :class="{ 'domain-plan__row--active': plan.isActive }"
        >
          <span v-if="plan.nuclear" class="domain-plan__nuclear">核</span>
          <span class="domain-plan__name" :title="plan.name">{{ plan.name }}</span>
          <span class="domain-plan__meta">
            调用 {{ plan.invokeCount ?? 0 }} 次 · {{ formatTime(plan.lastInvokedAt) }}
          </span>
          <button
            type="button"
            class="domain-plan__invoke-btn"
            :disabled="invoking"
            @click="openInvoke(plan)"
          >
            一键调用
          </button>
          <span v-if="plan.isActive" class="domain-plan__badge"> 当前激活 </span>
        </div>

        <div v-if="!loading && plans.length === 0" class="domain-plan__empty">暂无生产域预案</div>
      </div>

      <p class="domain-plan__hint">一键调用 = 激活 + 广播 + 留痕，不向任何物理设备下发控制指令。</p>
    </div>
  </PanelCard>

  <EmergencyPlanSwitchDialog
    :open="switchOpen"
    :incident-fields="[]"
    :selected-plan-id="activePlanId"
    domain="production"
    @close="switchOpen = false"
    @select="handlePlanSelect"
  />

  <!-- 一键调用确认 -->
  <Teleport to="#app">
    <Transition name="invoke-fade">
      <div v-if="invokeTarget" class="invoke-overlay" @click.self="closeInvoke">
        <section class="invoke-dialog" role="dialog" aria-modal="true" aria-label="一键调用预案">
          <header class="invoke__header">
            <h3 class="invoke__title">一键调用预案</h3>
            <button type="button" class="invoke__close" @click="closeInvoke">×</button>
          </header>

          <div class="invoke__body">
            <div class="invoke__plan">
              <span class="invoke__plan-label">预案</span>
              <span class="invoke__plan-name">{{ invokeTarget?.name }}</span>
              <span v-if="invokeTarget?.nuclear" class="invoke__nuclear">核预案</span>
            </div>
            <label class="invoke__field">
              <span class="invoke__field-label">调用备注（可选）</span>
              <textarea
                v-model="invokeNote"
                class="invoke__textarea"
                rows="3"
                placeholder="如：生产装置区乙烯储罐火情，启动专项处置预案"
              />
            </label>
            <p class="invoke__warn">激活 + 广播 + 留痕，不向物理设备下发控制指令。</p>
          </div>

          <footer class="invoke__footer">
            <button type="button" class="invoke__btn" :disabled="invoking" @click="closeInvoke">
              取消
            </button>
            <button
              type="button"
              class="invoke__btn invoke__btn--primary"
              :disabled="invoking"
              @click="confirmInvoke"
            >
              {{ invoking ? '调用中…' : '确认调用' }}
            </button>
          </footer>
        </section>
      </div>
    </Transition>

    <Transition name="toast-fade">
      <div v-if="toast" class="domain-toast" :class="`domain-toast--${toast.type}`">
        {{ toast.text }}
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.domain-plan {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 6px;
}

.domain-plan__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-shrink: 0;
  min-height: 22px;
}

.domain-plan__count {
  font-size: 12px;
  color: var(--color-text-strong);
  white-space: nowrap;
}

.domain-plan__switch-btn {
  height: 20px;
  padding: 0 8px;
  border: 1px solid var(--map-facility-btn-border);
  border-radius: 2px;
  background: var(--map-facility-btn-bg);
  color: #d8e8f8;
  font-size: 11px;
  font-family: var(--font-body);
  cursor: pointer;
}

.domain-plan__switch-btn:hover {
  color: var(--color-text-strong);
}

.domain-plan__list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.domain-plan__row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto auto;
  align-items: center;
  gap: 6px;
  min-height: 26px;
  padding: 2px 6px;
  border: 1px solid rgb(0 80 140 / 18%);
  border-radius: 3px;
  background: rgb(0 24 48 / 42%);
}

.domain-plan__row--active {
  border-color: rgb(0 140 230 / 40%);
  background: linear-gradient(90deg, rgb(0 120 210 / 24%), rgb(0 74 138 / 8%));
}

.domain-plan__nuclear {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  font-size: 10px;
  color: #fff;
  background: linear-gradient(180deg, #ff7a45, #e23b3b);
  border-radius: 2px;
}

.domain-plan__name {
  min-width: 0;
  font-size: 12px;
  line-height: 1.2;
  color: var(--color-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.domain-plan__meta {
  flex-shrink: 0;
  font-size: 10px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.domain-plan__invoke-btn {
  flex-shrink: 0;
  height: 18px;
  padding: 0 8px;
  border: none;
  border-radius: 2px;
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
  color: var(--color-text-strong);
  font-size: 11px;
  font-family: var(--font-body);
  cursor: pointer;
}

.domain-plan__invoke-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.domain-plan__badge {
  flex-shrink: 0;
  padding: 0 5px;
  height: 16px;
  line-height: 16px;
  font-size: 10px;
  color: var(--color-text-strong);
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
  border-radius: 2px;
}

.domain-plan__empty {
  text-align: center;
  color: #7a90a8;
  font-size: 12px;
  padding: 18px 0;
}

.domain-plan__hint {
  flex-shrink: 0;
  margin: 0;
  font-size: 10px;
  line-height: 1.3;
  color: var(--color-text-muted);
}

/* 一键调用确认弹窗 */
.invoke-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: rgb(0 12 28 / 72%);
}

.invoke-dialog {
  display: flex;
  flex-direction: column;
  width: min(460px, 100%);
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%), rgb(5 20 40 / 98%));
  box-shadow: 0 16px 38px rgb(0 0 0 / 44%);
  overflow: hidden;
}

.invoke__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  min-height: 42px;
  padding: 0 14px;
  border-bottom: 1px solid var(--panel-head-line);
  background: rgb(2 28 52 / 84%);
}

.invoke__title {
  margin: 0;
  font-size: 15px;
  color: #e6f3ff;
}

.invoke__close {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: #a8b8cc;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.invoke__close:hover {
  color: var(--color-text-strong);
}

.invoke__body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.invoke__plan {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid rgb(0 110 190 / 28%);
  border-radius: 6px;
  background: rgb(0 20 45 / 60%);
}

.invoke__plan-label {
  font-size: 12px;
  color: var(--map-facility-btn-fg);
  white-space: nowrap;
}

.invoke__plan-name {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: var(--color-text-strong);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.invoke__nuclear {
  flex-shrink: 0;
  padding: 0 6px;
  height: 18px;
  line-height: 18px;
  font-size: 10px;
  color: #fff;
  background: linear-gradient(180deg, #ff7a45, #e23b3b);
  border-radius: 2px;
}

.invoke__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.invoke__field-label {
  font-size: 12px;
  color: #8aa4c0;
}

.invoke__textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid var(--panel-head-line);
  border-radius: 4px;
  background: rgb(0 16 36 / 70%);
  color: var(--color-text-strong);
  font-size: 12px;
  font-family: var(--font-body);
  resize: vertical;
  outline: none;
}

.invoke__warn {
  margin: 0;
  font-size: 11px;
  color: var(--color-text-muted);
}

.invoke__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 14px;
  border-top: 1px solid var(--panel-head-line);
}

.invoke__btn {
  min-width: 72px;
  height: 30px;
  padding: 0 14px;
  border: 1px solid var(--map-facility-btn-border);
  border-radius: 4px;
  background: var(--map-facility-btn-bg);
  color: #d8e8f8;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.invoke__btn--primary {
  border-color: rgb(0 160 240 / 55%);
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
  color: var(--color-text-strong);
}

.invoke__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 反馈条 */
.domain-toast {
  position: fixed;
  left: 50%;
  top: 64px;
  transform: translateX(-50%);
  z-index: calc(var(--z-toast) + 1);
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 13px;
  color: #fff;
  box-shadow: 0 8px 22px rgb(0 0 0 / 40%);
}

.domain-toast--ok {
  background: linear-gradient(180deg, rgb(22 150 90 / 95%), rgb(16 120 72 / 95%));
}

.domain-toast--err {
  background: linear-gradient(180deg, rgb(200 60 60 / 95%), rgb(170 40 40 / 95%));
}

.invoke-fade-enter-active,
.invoke-fade-leave-active {
  transition: opacity 0.22s ease;
}

.invoke-fade-enter-from,
.invoke-fade-leave-to {
  opacity: 0;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.25s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
}
</style>
