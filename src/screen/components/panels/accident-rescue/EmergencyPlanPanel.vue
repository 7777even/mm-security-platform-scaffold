<script setup lang="ts">
import { onMounted, ref } from 'vue';
import AccidentRescueSidePanel from '../../common/AccidentRescueSidePanel.vue';
import EmergencyPlanSwitchDialog from './EmergencyPlanSwitchDialog.vue';
import PlanPanoramaDialog from './PlanPanoramaDialog.vue';
import {
  usePlanMatrix,
  planSwitchTabToRowId,
  type SelectableEmergencyPlan,
} from '../../../lib/composables/usePlanMatrix';
import type { IncidentDetailField } from '@/services/accidentRescue';
import {
  fetchEmergencyPlanCatalog,
  fetchEmergencyPlanDetailSections,
  type EmergencyPlanCatalogItem,
  type EmergencyPlanDetailSection,
} from '@/services/emergencyPlan';

const props = withDefaults(
  defineProps<{
    incidentFields?: IncidentDetailField[];
    eventTitle?: string;
    mode?: 'event' | 'drill';
  }>(),
  {
    incidentFields: () => [],
    eventTitle: '茂名石化装置区突发事件应急处置',
    mode: 'event',
  },
);

const { openPlanMatrix } = usePlanMatrix();

// 4 行预案层级来自后端 GET /emergency-plans/catalog（V39 fac_emergency_plan_catalog）
const planRows = ref<EmergencyPlanCatalogItem[]>([]);
// 当前激活预案 id（来自后端 isCurrent 标记，纯前端高亮态）
const activePlanId = ref<string>('');

const switchDialogOpen = ref(false);
const selectedCatalogPlanId = ref<string | null>('disposal-1');
// 预案详情 5 段字段来自后端 GET /emergency-plans/catalog-detail（V39 fac_emergency_plan_detail）
const detailSections = ref<EmergencyPlanDetailSection[]>([]);

function switchPlanById(planId: string) {
  activePlanId.value = planId;
}

const detailTabs = ['基本信息', '应急组织', '预案指令', '预案行动', '预案文本'] as const;
const detailOpen = ref(false);
const activeDetailTab = ref(0);
const detailPlanName = ref('');

// 载入预案目录（4 层级行）+ 详情字段（5 段）：失败由 service 层降级为空态并告警
onMounted(async () => {
  try {
    const [catalog, detail] = await Promise.all([
      fetchEmergencyPlanCatalog(),
      fetchEmergencyPlanDetailSections(),
    ]);
    planRows.value = catalog.items;
    const current = catalog.items.find((item) => item.isCurrent) ?? catalog.items[0];
    activePlanId.value = current?.id ?? '';
    selectedCatalogPlanId.value = current?.id ?? null;
    detailSections.value = detail.sections;
  } catch {
    /* 后端不可用已由 service 层告警并降级为空态 */
  }
});

function openSwitchDialog() {
  switchDialogOpen.value = true;
}

function closeSwitchDialog() {
  switchDialogOpen.value = false;
}

function handlePlanSelect(plan: SelectableEmergencyPlan) {
  selectedCatalogPlanId.value = plan.id;
  const rowId = planSwitchTabToRowId[plan.tab];
  activePlanId.value = rowId;
  const row = planRows.value.find((item) => item.id === rowId);
  if (row) row.planName = plan.name;
}

function isCurrent(rowId: string) {
  return activePlanId.value === rowId;
}

function canOpenDetail(planName: string) {
  return planName !== '未启动';
}

function openDetail(planName: string) {
  if (!canOpenDetail(planName)) return;
  detailPlanName.value = planName;
  activeDetailTab.value = 0;
  detailOpen.value = true;
}

function closeDetail() {
  detailOpen.value = false;
}
</script>

<template>
  <AccidentRescueSidePanel title="应急预案" variant="guidance" theme="accident">
    <div class="emergency-plan">
      <div class="emergency-plan__toolbar">
        <div class="emergency-plan__count">预案条目</div>
        <div class="emergency-plan__actions">
          <button type="button" class="emergency-plan__manage-btn" @click="openPlanMatrix()">
            预案矩阵
          </button>
          <button type="button" class="emergency-plan__manage-btn" @click="openSwitchDialog">
            升级/更换预案
          </button>
        </div>
      </div>

      <div class="emergency-plan__rows ar-scroll">
        <div
          v-for="row in planRows"
          :key="row.id"
          class="emergency-plan__row"
          :class="{ 'emergency-plan__row--current': isCurrent(row.id) }"
        >
          <span class="emergency-plan__label">{{ row.label }}</span>
          <button
            v-if="canOpenDetail(row.planName)"
            type="button"
            class="emergency-plan__value emergency-plan__value-btn"
            :title="`查看${row.planName}详情`"
            @click="openDetail(row.planName)"
          >
            {{ row.planName }}
          </button>
          <span v-else class="emergency-plan__value">{{ row.planName }}</span>

          <span v-if="isCurrent(row.id)" class="emergency-plan__badge"> 当前 </span>

          <button
            v-else-if="row.canSwitch"
            type="button"
            class="emergency-plan__switch-btn"
            @click="switchPlanById(row.id)"
          >
            切换
          </button>
        </div>
      </div>
    </div>
  </AccidentRescueSidePanel>

  <EmergencyPlanSwitchDialog
    :open="switchDialogOpen"
    :incident-fields="props.incidentFields"
    :selected-plan-id="selectedCatalogPlanId"
    @close="closeSwitchDialog"
    @select="handlePlanSelect"
  />

  <PlanPanoramaDialog :event-title="eventTitle" :mode="mode" />

  <Teleport to="body">
    <Transition name="plan-detail-fade">
      <div v-if="detailOpen" class="plan-detail-overlay" @click="closeDetail">
        <section
          class="plan-detail-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="预案详情"
          @click.stop
        >
          <header class="plan-detail__header">
            <h3 class="plan-detail__title">{{ detailPlanName }}详情</h3>
            <button type="button" class="plan-detail__close" @click="closeDetail">×</button>
          </header>

          <div class="plan-detail__tabs">
            <button
              v-for="(tab, index) in detailTabs"
              :key="tab"
              type="button"
              class="plan-detail__tab"
              :class="{ 'plan-detail__tab--active': activeDetailTab === index }"
              @click="activeDetailTab = index"
            >
              {{ tab }}
            </button>
          </div>

          <div class="plan-detail__content ar-scroll">
            <template v-if="activeDetailTab === 0">
              <section
                v-for="section in detailSections"
                :key="section.title"
                class="plan-detail__section"
              >
                <h4 class="plan-detail__section-title">{{ section.title }}</h4>
                <div class="plan-detail__fields">
                  <div
                    v-for="field in section.fields"
                    :key="field.label"
                    class="plan-detail__field"
                  >
                    <span class="plan-detail__field-label">{{ field.label }}</span>
                    <span class="plan-detail__field-value">{{ field.value }}</span>
                  </div>
                </div>
              </section>
            </template>
            <div v-else class="plan-detail__placeholder">
              {{ detailTabs[activeDetailTab] }}内容建设中
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.emergency-plan {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 4px;
}

.emergency-plan__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-shrink: 0;
  min-height: 22px;
}

.emergency-plan__count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-strong);
  white-space: nowrap;
}

.emergency-plan__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.emergency-plan__manage-btn {
  height: 20px;
  padding: 0 0 0 8px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 11px;
  font-family: var(--font-body);
  line-height: 1;
  cursor: pointer;
  white-space: nowrap;
  opacity: 0.9;
}

.emergency-plan__manage-btn:hover {
  opacity: 1;
}

.emergency-plan__rows {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.emergency-plan__row {
  display: grid;
  grid-template-columns: 74px minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  min-height: 24px;
  padding: 1px 4px;
  border-bottom: 1px solid rgb(0 80 140 / 18%);
  border-radius: 3px;
}

.emergency-plan__row--current {
  background: linear-gradient(90deg, rgb(0 120 210 / 26%), rgb(0 74 138 / 8%));
  border: 1px solid rgb(0 140 230 / 32%);
}

.emergency-plan__row:last-child {
  border-bottom: none;
}

.emergency-plan__label {
  font-size: 11px;
  line-height: 1.2;
  color: #a8b8cc;
  white-space: nowrap;
}

.emergency-plan__badge {
  flex-shrink: 0;
  padding: 0 5px;
  height: 16px;
  line-height: 16px;
  font-size: 10px;
  color: var(--color-text-strong);
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
  border-radius: 2px;
}

.emergency-plan__value {
  min-width: 0;
  font-size: 11px;
  line-height: 1.2;
  color: var(--color-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.emergency-plan__value-btn {
  text-align: left;
  padding: 0;
  border: none;
  background: transparent;
  font-family: var(--font-body);
  cursor: pointer;
}

.emergency-plan__value-btn:hover {
  color: var(--accent-gold);
  text-decoration: none;
}

.emergency-plan__switch-btn {
  flex-shrink: 0;
  height: 16px;
  padding: 0 4px;
  border: none;
  border-radius: 2px;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 1;
  font-family: var(--font-body);
  cursor: pointer;
  opacity: 0.9;
}

.emergency-plan__switch-btn:hover {
  opacity: 1;
}

.emergency-plan__row--current .emergency-plan__label,
.emergency-plan__row--current .emergency-plan__value {
  color: var(--color-text-strong);
}

.emergency-plan__row--current .emergency-plan__value-btn:hover {
  color: var(--accent-gold);
}

.emergency-plan__row--current .emergency-plan__badge {
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
  color: var(--color-text-strong);
}

:global(.plan-detail-overlay) {
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

:global(.plan-detail-fade-enter-active),
:global(.plan-detail-fade-leave-active) {
  transition: opacity 0.22s ease;
}

:global(.plan-detail-fade-enter-from),
:global(.plan-detail-fade-leave-to) {
  opacity: 0;
}

:global(.plan-detail-dialog) {
  width: min(1080px, 100%);
  height: min(620px, calc(100vh - 48px));
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, rgb(5 36 62 / 96%) 0%, rgb(4 24 44 / 96%) 100%),
    radial-gradient(circle at 25% 20%, rgb(0 148 236 / 18%), transparent 52%);
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 10px;
  box-shadow:
    0 16px 38px rgb(0 0 0 / 44%),
    inset 0 0 24px rgb(0 120 210 / 18%);
  overflow: hidden;
}

:global(.plan-detail-fade-enter-active .plan-detail-dialog),
:global(.plan-detail-fade-leave-active .plan-detail-dialog) {
  transition:
    transform 0.26s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.22s ease;
}

:global(.plan-detail-fade-enter-from .plan-detail-dialog),
:global(.plan-detail-fade-leave-to .plan-detail-dialog) {
  transform: translateY(10px) scale(0.985);
  opacity: 0;
}

:global(.plan-detail__header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 38px;
  padding: 0 14px;
  border-bottom: 1px solid rgb(0 120 210 / 36%);
  box-sizing: border-box;
  background: rgb(2 28 52 / 84%);
}

:global(.plan-detail__title) {
  margin: 0;
  color: #e6f3ff;
  font-size: 15px;
  line-height: 1.2;
  font-weight: 500;
}

:global(.plan-detail__close) {
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 2px;
  background: transparent;
  color: #a8b8cc;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

:global(.plan-detail__close:hover) {
  color: var(--color-text-strong);
  background: rgb(0 120 210 / 25%);
}

:global(.plan-detail__tabs) {
  display: flex;
  gap: 0;
  padding: 10px 12px 0;
}

:global(.plan-detail__tab) {
  min-width: 92px;
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--panel-head-line);
  border-right: none;
  background: var(--map-facility-btn-bg);
  color: #a8b8cc;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

:global(.plan-detail__tab:last-child) {
  border-right: 1px solid var(--panel-head-line);
}

:global(.plan-detail__tab--active) {
  color: var(--color-text-strong);
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
}

:global(.plan-detail__content) {
  flex: 1;
  min-height: 0;
  padding: 10px 12px 14px;
  overflow: auto;
  box-sizing: border-box;
}

:global(.plan-detail__section + .plan-detail__section) {
  margin-top: 10px;
}

:global(.plan-detail__section-title) {
  margin: 0 0 6px;
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1.2;
  font-weight: 500;
}

:global(.plan-detail__fields) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  border: 1px solid rgb(0 110 190 / 24%);
  background: rgb(0 30 58 / 72%);
}

:global(.plan-detail__field) {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  align-items: center;
  min-height: 30px;
  padding: 0 10px;
  border-right: 1px solid rgb(0 90 150 / 20%);
  border-bottom: 1px solid rgb(0 90 150 / 20%);
  box-sizing: border-box;
}

:global(.plan-detail__field:nth-child(2n)) {
  border-right: none;
}

:global(.plan-detail__field-label) {
  color: #7ea5ca;
  font-size: 11px;
  line-height: 1.2;
  white-space: nowrap;
}

:global(.plan-detail__field-value) {
  color: var(--color-text-strong);
  font-size: 11px;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.plan-detail__placeholder) {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  color: #7ea5ca;
  font-size: 13px;
}
</style>
