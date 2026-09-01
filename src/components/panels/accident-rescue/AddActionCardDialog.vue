<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { usePlanMatrix } from '@/composables/usePlanMatrix';
import type { PlanCardStatus } from '@/services/map-data/planMatrixMock';

const props = defineProps<{
  open: boolean;
  resourceId?: string;
  subPhaseId?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { currentPlan, addActionCard } = usePlanMatrix();

const form = reactive({
  title: '',
  resourceId: '',
  startSubPhaseId: '',
  endSubPhaseId: '',
  riskEventId: '',
  status: 'pending' as PlanCardStatus,
});

const statusOptions: Array<{ value: PlanCardStatus; label: string }> = [
  { value: 'pending', label: '待执行' },
  { value: 'in-progress', label: '执行中' },
  { value: 'completed', label: '已完成' },
];

const subPhaseOptions = computed(() => currentPlan.value.subPhases);

watch(
  () => props.open,
  (open) => {
    if (open) {
      form.title = '';
      form.resourceId = props.resourceId ?? currentPlan.value.resources[0]?.id ?? '';
      form.startSubPhaseId = props.subPhaseId ?? currentPlan.value.subPhases[0]?.id ?? '';
      form.endSubPhaseId = form.startSubPhaseId;
      form.riskEventId = '';
      form.status = 'pending';
    }
  },
  { immediate: true },
);

function handleSave() {
  if (!form.title.trim() || !form.resourceId || !form.startSubPhaseId) return;
  addActionCard({
    id: `c-new-${Date.now()}`,
    resourceId: form.resourceId,
    title: form.title.trim(),
    content: form.title.trim(),
    startSubPhaseId: form.startSubPhaseId,
    endSubPhaseId: form.endSubPhaseId || form.startSubPhaseId,
    riskEventId: form.riskEventId || undefined,
    status: form.status,
    isGlobal: false,
  });
  emit('close');
}
</script>

<template>
  <Teleport to="body">
    <Transition name="addcard-fade">
      <div v-if="open" class="addcard-mask" @click.self="emit('close')">
        <section class="addcard-dialog" role="dialog" aria-modal="true">
          <header class="addcard-header">
            <h3 class="addcard-header__title">➕ 新增响应动作卡</h3>
            <button
              type="button"
              class="addcard-header__close"
              aria-label="关闭"
              @click="emit('close')"
            >
              ×
            </button>
          </header>

          <div class="addcard-body">
            <label class="addcard-field">
              <span class="addcard-field__label">动作卡标题</span>
              <input
                v-model="form.title"
                type="text"
                class="addcard-field__input"
                placeholder="请输入处置动作标题"
              />
            </label>

            <label class="addcard-field">
              <span class="addcard-field__label">责任处置力量</span>
              <select v-model="form.resourceId" class="addcard-field__input">
                <option
                  v-for="resource in currentPlan.resources"
                  :key="resource.id"
                  :value="resource.id"
                >
                  {{ resource.name }}
                </option>
              </select>
            </label>

            <div class="addcard-grid">
              <label class="addcard-field">
                <span class="addcard-field__label">开始子阶段</span>
                <select v-model="form.startSubPhaseId" class="addcard-field__input">
                  <option v-for="sub in subPhaseOptions" :key="sub.id" :value="sub.id">
                    {{ sub.name }}
                  </option>
                </select>
              </label>
              <label class="addcard-field">
                <span class="addcard-field__label">结束子阶段</span>
                <select v-model="form.endSubPhaseId" class="addcard-field__input">
                  <option v-for="sub in subPhaseOptions" :key="sub.id" :value="sub.id">
                    {{ sub.name }}
                  </option>
                </select>
              </label>
            </div>

            <div class="addcard-grid">
              <label class="addcard-field">
                <span class="addcard-field__label">执行状态</span>
                <select v-model="form.status" class="addcard-field__input">
                  <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </label>
              <label class="addcard-field">
                <span class="addcard-field__label">关联风险（可选）</span>
                <select v-model="form.riskEventId" class="addcard-field__input">
                  <option value="">无</option>
                  <option v-for="event in currentPlan.riskEvents" :key="event.id" :value="event.id">
                    {{ event.name }}
                  </option>
                </select>
              </label>
            </div>
          </div>

          <footer class="addcard-footer">
            <button type="button" class="addcard-footer__cancel" @click="emit('close')">
              取消
            </button>
            <button type="button" class="addcard-footer__save" @click="handleSave">
              保存动作卡
            </button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
:global(.addcard-mask) {
  position: fixed;
  inset: 0;
  z-index: 1700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: rgb(2 6 23 / 85%);
}

:global(.addcard-fade-enter-active),
:global(.addcard-fade-leave-active) {
  transition: opacity 0.2s ease;
}

:global(.addcard-fade-enter-from),
:global(.addcard-fade-leave-to) {
  opacity: 0;
}

:global(.addcard-dialog) {
  width: min(560px, 100%);
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 25% 15%, rgb(56 189 248 / 10%), transparent 48%), #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  box-shadow: 0 22px 60px rgb(0 0 0 / 62%);
  overflow: hidden;
}

:global(.addcard-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 0 14px;
  border-bottom: 1px solid #1e293b;
  background: #1e293b;
}

:global(.addcard-header__title) {
  margin: 0;
  color: #f8fafc;
  font-size: 15px;
  font-weight: 700;
}

:global(.addcard-header__close) {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 18px;
  cursor: pointer;
}

:global(.addcard-body) {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

:global(.addcard-field) {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

:global(.addcard-field__label) {
  color: #94a3b8;
  font-size: 12px;
}

:global(.addcard-field__input) {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #475569;
  border-radius: 5px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 12px;
  font-family: var(--font-body);
  box-sizing: border-box;
  outline: none;
}

:global(.addcard-field__input:focus) {
  border-color: #38bdf8;
}

:global(.addcard-grid) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

:global(.addcard-footer) {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 14px;
  border-top: 1px solid #1e293b;
  background: #1e293b;
}

:global(.addcard-footer__cancel) {
  height: 30px;
  padding: 0 16px;
  border: 1px solid #475569;
  border-radius: 5px;
  background: #0f172a;
  color: #cbd5e1;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

:global(.addcard-footer__save) {
  height: 30px;
  padding: 0 18px;
  border: 1px solid #38bdf8;
  border-radius: 5px;
  background: linear-gradient(180deg, #0284c7, #0369a1);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  font-family: var(--font-body);
  cursor: pointer;
}
</style>
