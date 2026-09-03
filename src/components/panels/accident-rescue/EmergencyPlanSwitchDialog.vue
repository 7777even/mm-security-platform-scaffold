<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { IncidentDetailField } from '@/services/map-data/accidentRescueMock';
import {
  emergencyPlanSwitchOptions,
  emergencyPlanSwitchTabs,
  resolvePlansByTab,
  type EmergencyPlanSwitchTabKey,
  type SelectableEmergencyPlan,
} from '@/services/map-data/emergencyPlanSwitchMock';

const props = defineProps<{
  open: boolean;
  incidentFields: IncidentDetailField[];
  selectedPlanId?: string | null;
}>();

const emit = defineEmits<{
  close: [];
  select: [plan: SelectableEmergencyPlan];
}>();

const activeTab = ref<EmergencyPlanSwitchTabKey>('disposal');
const keyword = ref('');
const accidentType = ref(emergencyPlanSwitchOptions.accidentTypes[0]);
const facility = ref(emergencyPlanSwitchOptions.facilities[0]);
const localSelectedId = ref<string | null>(null);

const tabPlans = computed(() => resolvePlansByTab(activeTab.value));

const filteredPlans = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  return tabPlans.value.filter((plan) => {
    if (q && !plan.name.toLowerCase().includes(q)) return false;
    if (accidentType.value !== '全部类型' && plan.accidentType !== accidentType.value) {
      return false;
    }
    if (facility.value !== '全部装置' && plan.facility !== facility.value) {
      return false;
    }
    return true;
  });
});

const displayFields = computed(() => props.incidentFields);

watch(
  () => props.open,
  (visible) => {
    if (!visible) return;
    activeTab.value = 'disposal';
    keyword.value = '';
    accidentType.value = emergencyPlanSwitchOptions.accidentTypes[0];
    facility.value = emergencyPlanSwitchOptions.facilities[0];
    localSelectedId.value = props.selectedPlanId ?? null;
  },
);

function closeDialog() {
  emit('close');
}

function resetFilters() {
  keyword.value = '';
  accidentType.value = emergencyPlanSwitchOptions.accidentTypes[0];
  facility.value = emergencyPlanSwitchOptions.facilities[0];
}

function handleSelect(plan: SelectableEmergencyPlan) {
  localSelectedId.value = plan.id;
  emit('select', plan);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="plan-switch-fade">
      <div v-if="open" class="plan-switch-overlay" @click.self="closeDialog">
        <section
          class="plan-switch-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="启动预案"
          @click.stop
        >
          <header class="plan-switch__header">
            <h3 class="plan-switch__title">启动预案</h3>
            <button type="button" class="plan-switch__close" @click="closeDialog">×</button>
          </header>

          <div class="plan-switch__body">
            <aside class="plan-switch__incident">
              <h4 class="plan-switch__section-title">事件信息</h4>
              <div class="plan-switch__incident-list ar-scroll">
                <div
                  v-for="field in displayFields"
                  :key="field.label"
                  class="plan-switch__incident-row"
                >
                  <span class="plan-switch__incident-label">{{ field.label }}</span>
                  <span class="plan-switch__incident-value">{{ field.value }}</span>
                </div>
              </div>
            </aside>

            <section class="plan-switch__plans">
              <h4 class="plan-switch__section-title">预案选择</h4>

              <div class="plan-switch__tabs">
                <button
                  v-for="tab in emergencyPlanSwitchTabs"
                  :key="tab.key"
                  type="button"
                  class="plan-switch__tab"
                  :class="{ 'plan-switch__tab--active': activeTab === tab.key }"
                  @click="activeTab = tab.key"
                >
                  {{ tab.label }}
                </button>
              </div>

              <div class="plan-switch__filters">
                <input
                  v-model="keyword"
                  class="plan-switch__input"
                  type="search"
                  placeholder="请输入预案名称"
                />
                <select v-model="accidentType" class="plan-switch__select">
                  <option
                    v-for="opt in emergencyPlanSwitchOptions.accidentTypes"
                    :key="opt"
                    :value="opt"
                  >
                    {{ opt === '全部类型' ? '适用事故类型' : opt }}
                  </option>
                </select>
                <select v-model="facility" class="plan-switch__select">
                  <option
                    v-for="opt in emergencyPlanSwitchOptions.facilities"
                    :key="opt"
                    :value="opt"
                  >
                    {{ opt === '全部装置' ? '适用装置/设施' : opt }}
                  </option>
                </select>
                <button type="button" class="plan-switch__btn plan-switch__btn--primary">
                  查询
                </button>
                <button type="button" class="plan-switch__btn" @click="resetFilters">重置</button>
              </div>

              <div class="plan-switch__table-wrap ar-scroll">
                <table class="plan-switch__table">
                  <thead>
                    <tr>
                      <th>预案名称</th>
                      <th>适用事故类型</th>
                      <th>适用装置/设施</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="plan in filteredPlans" :key="plan.id">
                      <td>{{ plan.name }}</td>
                      <td>{{ plan.accidentType }}</td>
                      <td>{{ plan.facility }}</td>
                      <td>
                        <span v-if="localSelectedId === plan.id" class="plan-switch__picked">
                          已选择
                        </span>
                        <button
                          v-else
                          type="button"
                          class="plan-switch__pick-btn"
                          @click="handleSelect(plan)"
                        >
                          选择/切换
                        </button>
                      </td>
                    </tr>
                    <tr v-if="!filteredPlans.length">
                      <td colspan="4" class="plan-switch__empty">暂无匹配预案</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.plan-switch-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: rgb(0 12 28 / 72%);
}

.plan-switch-dialog {
  display: flex;
  flex-direction: column;
  width: min(1120px, 100%);
  height: min(640px, calc(100vh - 48px));
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%), rgb(5 20 40 / 98%));
  box-shadow: 0 16px 38px rgb(0 0 0 / 44%);
  overflow: hidden;
}

.plan-switch__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  min-height: 42px;
  padding: 0 14px;
  border-bottom: 1px solid rgb(0 110 190 / 35%);
  background: rgb(2 28 52 / 84%);
}

.plan-switch__title {
  margin: 0;
  font-size: 16px;
  color: #e6f3ff;
}

.plan-switch__close {
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

.plan-switch__close:hover {
  color: #fff;
}

.plan-switch__body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
}

.plan-switch__incident {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 12px;
  border-right: 1px solid rgb(0 110 190 / 28%);
  background: rgb(0 16 36 / 45%);
}

.plan-switch__plans {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 12px 14px;
  gap: 10px;
}

.plan-switch__section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #dce9f8;
  line-height: 1.3;
}

.plan-switch__incident-list {
  flex: 1;
  min-height: 0;
  margin-top: 8px;
  overflow: auto;
}

.plan-switch__incident-row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 6px;
  padding: 6px 0;
  font-size: 12px;
  line-height: 1.35;
  border-bottom: 1px solid rgb(0 80 140 / 22%);
}

.plan-switch__incident-label {
  color: #4f8dd3;
  white-space: nowrap;
}

.plan-switch__incident-value {
  color: #fff;
  word-break: break-all;
}

.plan-switch__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  border: 1px solid rgb(0 110 190 / 35%);
  border-radius: 2px;
  overflow: hidden;
}

.plan-switch__tab {
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 8px;
  border: none;
  border-right: 1px solid rgb(0 110 190 / 28%);
  background: rgb(0 22 48 / 82%);
  color: #a8b8cc;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.plan-switch__tab:last-child {
  border-right: none;
}

.plan-switch__tab--active {
  color: #fff;
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
}

.plan-switch__filters {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) auto auto;
  gap: 8px;
  align-items: center;
}

.plan-switch__input,
.plan-switch__select {
  height: 30px;
  padding: 0 8px;
  border: 1px solid rgb(0 110 190 / 35%);
  border-radius: 4px;
  background: rgb(0 20 45 / 82%);
  color: #fff;
  font-size: 12px;
  font-family: var(--font-body);
  outline: none;
}

.plan-switch__btn {
  min-width: 56px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid rgb(0 110 190 / 38%);
  border-radius: 4px;
  background: rgb(0 22 48 / 82%);
  color: #d8e8f8;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.plan-switch__btn--primary {
  border-color: rgb(0 160 240 / 55%);
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
  color: #fff;
}

.plan-switch__table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border: 1px solid rgb(0 110 190 / 28%);
  border-radius: 4px;
}

.plan-switch__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.plan-switch__table th {
  position: sticky;
  top: 0;
  z-index: var(--z-local-1);
  padding: 8px 10px;
  text-align: left;
  color: #8aa4c0;
  font-weight: 500;
  background: rgb(0 28 58 / 95%);
  border-bottom: 1px solid rgb(0 110 190 / 28%);
}

.plan-switch__table td {
  padding: 8px 10px;
  color: #e8f2fc;
  border-bottom: 1px solid rgb(0 80 140 / 18%);
}

.plan-switch__table tbody tr:hover td {
  background: rgb(0 40 78 / 35%);
}

.plan-switch__picked {
  color: #6fd08a;
  font-size: 12px;
}

.plan-switch__pick-btn {
  padding: 0;
  border: none;
  background: transparent;
  color: #7ec8ff;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.plan-switch__pick-btn:hover {
  color: #fff;
}

.plan-switch__empty {
  text-align: center;
  color: #7a90a8;
  padding: 24px 10px !important;
}

.plan-switch-fade-enter-active,
.plan-switch-fade-leave-active {
  transition: opacity 0.22s ease;
}

.plan-switch-fade-enter-active .plan-switch-dialog,
.plan-switch-fade-leave-active .plan-switch-dialog {
  transition:
    transform 0.26s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.22s ease;
}

.plan-switch-fade-enter-from,
.plan-switch-fade-leave-to {
  opacity: 0;
}

.plan-switch-fade-enter-from .plan-switch-dialog,
.plan-switch-fade-leave-to .plan-switch-dialog {
  opacity: 0;
  transform: translateY(10px);
}
</style>
