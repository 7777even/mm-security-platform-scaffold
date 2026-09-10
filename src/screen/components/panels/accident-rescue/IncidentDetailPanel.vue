<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import AccidentRescueSidePanel from '../../common/AccidentRescueSidePanel.vue';
import {
  eventCommandDetailTabs,
  eventCommandDispatchFields,
} from '../../../lib/data/accidentRescueMock';
import {
  drillDispatchFields,
  drillIncidentDetailTabs,
  drillResponseFields,
  drillVideoFields,
} from '../../../lib/data/drillRescueMock';
import type { IncidentDetailField } from '@/services/accidentRescue';
import EmergencyResponseCommandPanel from './EmergencyResponseCommandPanel.vue';

const props = withDefaults(
  defineProps<{
    fields: IncidentDetailField[];
    /** 面板样式统一为应急事件；仅控制底部按钮文案与配色 */
    actionKind?: 'event' | 'drill';
    panelTitle?: string;
    /** 已结束事件隐藏预警、终止按钮 */
    incidentStatus?: 'processing' | 'pending' | 'done';
    /** 已预警时事件预警按钮置灰不可点 */
    reported?: boolean;
    /** 是否已启动应急响应（页面级状态） */
    responseStarted?: boolean;
    showTabs?: boolean;
    hideHeader?: boolean;
  }>(),
  {
    actionKind: 'event',
    panelTitle: '乙烯装置火灾详情',
    showTabs: true,
    hideHeader: false,
  },
);

const isDrillAction = computed(() => props.actionKind === 'drill');
const isEventCommand = computed(() => props.actionKind === 'event');

const showActionButtons = computed(() => props.incidentStatus !== 'done');
const reportDisabled = computed(() =>
  props.incidentStatus === 'pending' ? false : props.reported === true,
);
const eventWarningDone = ref(false);
const emergencyResponseStarted = ref(false);
const warningModalOpen = ref(false);
const warningMessage = ref(
  '【发生时间】事件触发预警条件，已进入预警状态。请相关应急队伍保持待命，车辆器材进入临战状态。',
);
const warningChannel = ref<'app' | 'sms' | 'voice'>('app');

onMounted(() => {
  eventWarningDone.value = props.incidentStatus === 'pending' ? false : props.reported === true;
  emergencyResponseStarted.value = props.responseStarted ?? false;
});

watch(
  () => props.responseStarted,
  (value) => {
    if (typeof value === 'boolean') emergencyResponseStarted.value = value;
  },
);

const activeTab = ref(0);
const editOpen = ref(false);
const editableFields = ref<IncidentDetailField[]>(props.fields.map((field) => ({ ...field })));
const draftFields = ref<IncidentDetailField[]>([]);

watch(
  () => props.fields,
  (value) => {
    editableFields.value = value.map((field) => ({ ...field }));
  },
  { deep: true },
);

const tabs = computed(() =>
  isDrillAction.value ? drillIncidentDetailTabs : eventCommandDetailTabs,
);

const activeTabKey = computed(() => tabs.value[activeTab.value]?.key);

const isResponseTab = computed(() => isEventCommand.value && activeTabKey.value === 'response');

const tabFields = computed<IncidentDetailField[][]>(() => {
  if (isDrillAction.value) {
    return [editableFields.value, drillResponseFields, drillDispatchFields, drillVideoFields];
  }
  return [editableFields.value, [], eventCommandDispatchFields];
});

function openEdit() {
  draftFields.value = editableFields.value.map((field) => ({ ...field }));
  editOpen.value = true;
}

function saveEdit() {
  editableFields.value = draftFields.value.map((field) => ({ ...field }));
  editOpen.value = false;
}

function handleEventWarning() {
  if (reportDisabled.value || eventWarningDone.value) return;
  warningModalOpen.value = true;
}

function closeWarningModal() {
  warningModalOpen.value = false;
}

function confirmWarning() {
  eventWarningDone.value = true;
  warningModalOpen.value = false;
}

function handleStartEmergencyResponse() {
  if (emergencyResponseStarted.value) return;
  emergencyResponseStarted.value = true;
  emit('start-emergency-response');
}

const emit = defineEmits<{
  'start-emergency-response': [];
}>();
</script>

<template>
  <div class="incident-detail-wrap" :class="{ 'incident-detail-wrap--headerless': hideHeader }">
    <AccidentRescueSidePanel
      :title="panelTitle"
      variant="incidentDetail"
      theme="accident"
      show-more
    >
      <div class="incident-detail incident-detail--accident">
        <div
          v-if="showTabs"
          class="incident-detail__tabs"
          :class="{ 'incident-detail__tabs--event': isEventCommand }"
        >
          <button
            v-for="(tab, index) in tabs"
            :key="tab.key"
            type="button"
            class="incident-detail__tab"
            :class="{ 'incident-detail__tab--active': activeTab === index }"
            @click="activeTab = index"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-else class="incident-detail__section-head">
          <span>事件基础信息</span>
          <button type="button" @click="openEdit">✎ 编辑</button>
        </div>

        <EmergencyResponseCommandPanel v-if="isResponseTab" embedded />

        <div v-else class="incident-detail__fields ar-scroll">
          <div
            v-for="field in tabFields[activeTab] ?? []"
            :key="field.label"
            class="incident-detail__row"
          >
            <span class="incident-detail__label">{{ field.label }}：</span>
            <span class="incident-detail__value">{{ field.value }}</span>
          </div>
        </div>

        <div v-if="showActionButtons" class="incident-detail__actions">
          <button
            type="button"
            class="incident-detail__btn incident-detail__btn--primary"
            :class="{
              'incident-detail__btn--disabled': reportDisabled || eventWarningDone,
              'incident-detail__btn--primary-drill': isDrillAction,
            }"
            :disabled="reportDisabled || eventWarningDone"
            @click="handleEventWarning"
          >
            {{ eventWarningDone ? '已预警' : isDrillAction ? '演练预警' : '事件预警' }}
          </button>
          <button
            type="button"
            class="incident-detail__btn incident-detail__btn--start"
            :class="{
              'incident-detail__btn--start-drill': isDrillAction,
              'incident-detail__btn--disabled': emergencyResponseStarted,
            }"
            :disabled="emergencyResponseStarted"
            @click="handleStartEmergencyResponse"
          >
            {{
              emergencyResponseStarted
                ? isDrillAction
                  ? '演练已启动'
                  : '响应已启动'
                : isDrillAction
                  ? '启动演练响应'
                  : '启动应急响应'
            }}
          </button>
        </div>
      </div>
    </AccidentRescueSidePanel>

    <Teleport to="body">
      <Transition name="incident-warning-fade">
        <div
          v-if="warningModalOpen"
          class="incident-warning-overlay"
          @click.self="closeWarningModal"
        >
          <section
            class="incident-warning-dialog"
            role="dialog"
            aria-modal="true"
            :aria-label="isDrillAction ? '演练预警' : '事件预警'"
          >
            <header class="incident-warning__header">
              <h3 class="incident-warning__title">{{ isDrillAction ? '演练预警' : '事件预警' }}</h3>
              <button type="button" class="incident-warning__close" @click="closeWarningModal">
                ×
              </button>
            </header>

            <div class="incident-warning__body">
              <div class="incident-warning__row">
                <span class="incident-warning__label">通知范围</span>
                <div class="incident-warning__checks">
                  <label><input type="checkbox" checked /> 应急救援中心全体</label>
                  <label><input type="checkbox" /> 各中队长</label>
                  <label><input type="checkbox" /> 公司领导</label>
                </div>
              </div>

              <div class="incident-warning__row incident-warning__row--textarea">
                <span class="incident-warning__label">通知内容</span>
                <textarea v-model="warningMessage" rows="4" />
              </div>

              <div class="incident-warning__row">
                <span class="incident-warning__label">通知方式</span>
                <div class="incident-warning__radios">
                  <label><input v-model="warningChannel" type="radio" value="app" /> APP公告</label>
                  <label><input v-model="warningChannel" type="radio" value="sms" /> 短信</label>
                  <label
                    ><input v-model="warningChannel" type="radio" value="voice" /> 语音电话</label
                  >
                </div>
              </div>
            </div>

            <footer class="incident-warning__footer">
              <button
                type="button"
                class="incident-warning__btn incident-warning__btn--ghost"
                @click="closeWarningModal"
              >
                取消
              </button>
              <button
                type="button"
                class="incident-warning__btn incident-warning__btn--primary"
                @click="confirmWarning"
              >
                确认
              </button>
            </footer>
          </section>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <div v-if="editOpen" class="incident-edit-overlay" @click.self="editOpen = false">
        <section
          class="incident-edit-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="编辑事件信息"
        >
          <header>
            <h3>编辑事件信息</h3>
            <button type="button" @click="editOpen = false">×</button>
          </header>
          <div class="incident-edit__form ar-scroll">
            <label v-for="field in draftFields" :key="field.label">
              <span>{{ field.label }}</span>
              <textarea
                v-if="field.label === '事件描述' || field.label === '已采取措施'"
                v-model="field.value"
                rows="3"
              />
              <input v-else v-model="field.value" />
            </label>
          </div>
          <footer>
            <button type="button" @click="editOpen = false">取消</button
            ><button type="button" class="is-primary" @click="saveEdit">保存</button>
          </footer>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.incident-detail-wrap {
  position: relative;
  height: 100%;
  min-height: 0;
}

.incident-detail-wrap--headerless :deep(.accident-rescue-panel__icon),
.incident-detail-wrap--headerless :deep(.accident-rescue-panel__title),
.incident-detail-wrap--headerless :deep(.accident-rescue-panel__more) {
  display: none;
}

.incident-detail-wrap--headerless :deep(.accident-rescue-panel__content--incidentDetail) {
  margin-top: 8px;
}

.incident-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.incident-detail--accident {
  --incident-surface-bg: var(--map-facility-btn-bg);
  --incident-report-disabled-bg: rgb(0 34 62 / 88%);
  --incident-report-disabled-border: rgb(0 130 210 / 42%);
  --incident-report-disabled-text: #a8b8cc;
  --incident-report-disabled-bg-drill: rgb(64 46 18 / 88%);
  --incident-report-disabled-border-drill: rgb(210 150 70 / 40%);
  --incident-report-disabled-text-drill: #c8a878;
}

.incident-detail__tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  flex-shrink: 0;
  height: 32px;
  margin-bottom: 6px;
  border: 1px solid var(--panel-head-line);
  border-radius: 2px;
  overflow: hidden;
}

.incident-detail__tabs--event {
  grid-template-columns: repeat(3, 1fr);
}

.incident-detail__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  margin-bottom: 5px;
  border-bottom: 1px solid rgb(0 110 190 / 30%);
  color: #dbeafe;
  font-size: 13px;
}

.incident-detail__section-head button {
  height: 24px;
  padding: 0 9px;
  border: 1px solid rgb(14 165 233 / 42%);
  border-radius: 3px;
  background: rgb(3 38 72 / 86%);
  color: #68d4ff;
  font: 11px var(--font-body);
  cursor: pointer;
}

.incident-detail__tab {
  height: 32px;
  padding: 0;
  border: none;
  border-right: 1px solid rgb(0 110 190 / 28%);
  background: var(--map-facility-btn-bg);
  color: #a8b8cc;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.incident-detail__tab:last-child {
  border-right: none;
}

.incident-detail__tab--active {
  color: var(--color-text-strong);
  font-weight: 500;
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
}

.incident-detail__fields {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.incident-detail__row {
  display: grid;
  grid-template-columns: 102px minmax(0, 1fr);
  gap: 6px;
  padding: 5px 0;
  font-size: 12px;
  line-height: 1.28;
  border-bottom: 1px solid rgb(0 80 140 / 22%);
}

.incident-detail__row:last-child {
  border-bottom: none;
}

.incident-detail__label {
  color: var(--map-facility-btn-fg);
  white-space: nowrap;
}

.incident-detail__value {
  color: var(--color-text-strong);
  word-break: break-all;
}

.incident-detail__placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7a90a8;
  font-size: 14px;
}

.incident-detail__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  padding-top: 6px;
}

.incident-detail__btn {
  flex: 1;
  height: 36px;
  border: 1px solid var(--map-facility-btn-border);
  border-radius: 2px;
  background: var(--incident-surface-bg);
  color: #c8d4e8;
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
}

.incident-detail__btn--primary {
  color: var(--color-text-strong);
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
  border-color: rgb(0 160 240 / 55%);
}

.incident-detail__btn--primary-drill {
  background: linear-gradient(180deg, rgb(210 145 45 / 92%), rgb(160 105 25 / 92%));
  border-color: rgb(236 166 65 / 55%);
}

.incident-detail__btn--start {
  color: var(--color-text-strong);
  background: linear-gradient(180deg, rgb(186 26 36 / 94%), rgb(128 12 20 / 94%));
  border-color: rgb(254 4 4 / 62%);
  box-shadow:
    inset 0 0 10px rgb(254 4 4 / 14%),
    0 0 12px rgb(254 4 4 / 24%);
}

.incident-detail__btn--start-drill {
  background: linear-gradient(180deg, rgb(210 145 45 / 94%), rgb(152 96 22 / 94%));
  border-color: rgb(236 166 65 / 60%);
  box-shadow:
    inset 0 0 10px rgb(236 166 65 / 14%),
    0 0 12px rgb(236 166 65 / 24%);
}

.incident-detail__btn--primary.incident-detail__btn--disabled,
.incident-detail__btn--primary:disabled {
  color: var(--incident-report-disabled-text);
  background: var(--incident-report-disabled-bg);
  border: 1px dashed var(--incident-report-disabled-border);
  cursor: not-allowed;
}

.incident-detail__btn--primary-drill.incident-detail__btn--disabled,
.incident-detail__btn--primary-drill:disabled {
  color: var(--incident-report-disabled-text-drill);
  background: var(--incident-report-disabled-bg-drill);
  border: 1px dashed var(--incident-report-disabled-border-drill);
}

.incident-detail__btn--start.incident-detail__btn--disabled,
.incident-detail__btn--start:disabled {
  color: #d8b4b8;
  background: rgb(56 20 26 / 88%);
  border: 1px dashed rgb(186 74 84 / 45%);
  box-shadow: none;
}

.incident-detail__btn--start-drill.incident-detail__btn--disabled,
.incident-detail__btn--start-drill:disabled {
  color: #c8a878;
  background: rgb(64 46 18 / 88%);
  border: 1px dashed rgb(210 150 70 / 40%);
}

.incident-detail__btn--terminate {
  color: var(--map-rescue-red);
  background: rgb(56 10 16 / 78%);
  border: 1px solid rgb(254 4 4 / 62%);
  font-weight: 500;
  text-shadow: 0 0 12px rgb(254 4 4 / 28%);
  box-shadow:
    inset 0 0 14px rgb(254 4 4 / 14%),
    0 0 12px rgb(254 4 4 / 28%);
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.incident-detail__btn--terminate-drill {
  color: var(--accent-gold);
  background: rgb(56 38 12 / 78%);
  border: 1px solid rgb(236 166 65 / 62%);
  text-shadow: 0 0 12px rgb(236 166 65 / 32%);
  box-shadow:
    inset 0 0 14px rgb(236 166 65 / 14%),
    0 0 12px rgb(236 166 65 / 32%);
}

.incident-detail__btn--terminate:hover {
  background: rgb(88 14 22 / 88%);
  border-color: var(--map-rescue-red);
  box-shadow:
    inset 0 0 16px rgb(254 4 4 / 20%),
    0 0 16px rgb(254 4 4 / 34%);
}

.incident-detail__btn--terminate-drill:hover {
  background: rgb(80 54 16 / 88%);
  border-color: var(--accent-gold);
  box-shadow:
    inset 0 0 16px rgb(236 166 65 / 20%),
    0 0 16px rgb(236 166 65 / 36%);
}

.incident-warning-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(0 10 24 / 68%);
}

.incident-warning-dialog {
  width: min(860px, 100%);
  border: 1px solid rgb(0 148 236 / 42%);
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%), rgb(5 20 40 / 98%));
  box-shadow: 0 14px 36px rgb(0 0 0 / 42%);
}

.incident-warning__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--panel-head-line);
}

.incident-warning__title {
  margin: 0;
  font-size: 24px;
  color: var(--color-text-strong);
}

.incident-warning__close {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #c8d8ec;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.incident-warning__body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.incident-warning__row {
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr);
  align-items: start;
  gap: 8px;
}

.incident-warning__label {
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 32px;
}

.incident-warning__checks,
.incident-warning__radios {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 32px;
}

.incident-warning__checks input,
.incident-warning__radios input {
  accent-color: #1e7fff;
}

.incident-warning__row textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--panel-head-line);
  border-radius: 4px;
  background: rgb(0 20 45 / 82%);
  color: var(--color-text-strong);
  font-size: 13px;
  font-family: var(--font-body);
  line-height: 1.4;
  padding: 8px 10px;
  resize: vertical;
}

.incident-warning__footer {
  display: flex;
  justify-content: center;
  gap: 18px;
  padding: 10px 14px 14px;
}

.incident-warning__btn {
  min-width: 92px;
  height: 34px;
  border-radius: 4px;
  font-size: 14px;
  font-family: var(--font-body);
  cursor: pointer;
}

.incident-warning__btn--ghost {
  border: 1px solid var(--map-facility-btn-border);
  background: var(--map-facility-btn-bg);
  color: var(--color-text-muted);
}

.incident-warning__btn--primary {
  border: 1px solid rgb(0 160 240 / 55%);
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
  color: var(--color-text-strong);
}

.incident-warning-fade-enter-active,
.incident-warning-fade-leave-active {
  transition: opacity 0.22s ease;
}

.incident-warning-fade-enter-from,
.incident-warning-fade-leave-to {
  opacity: 0;
}

.incident-edit-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 10 24 / 72%);
}

.incident-edit-dialog {
  display: flex;
  flex-direction: column;
  width: 720px;
  max-height: 82vh;
  border: 1px solid rgb(14 165 233 / 55%);
  border-radius: 8px;
  background: linear-gradient(180deg, #08254a, #04182f);
  box-shadow: 0 20px 60px #0009;
  color: #dbeafe;
}

.incident-edit-dialog header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  border-bottom: 1px solid rgb(14 165 233 / 30%);
}

.incident-edit-dialog h3 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 18px;
}

.incident-edit-dialog header button {
  border: 0;
  background: none;
  color: #b9d9f5;
  font-size: 22px;
  cursor: pointer;
}

.incident-edit__form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 14px;
  min-height: 0;
  overflow: auto;
  padding: 16px;
}

.incident-edit__form label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: #83a8c7;
  font-size: 12px;
}

.incident-edit__form label:has(textarea) {
  grid-column: 1/-1;
}

.incident-edit__form input,
.incident-edit__form textarea {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid rgb(14 165 233 / 34%);
  border-radius: 3px;
  background: #041b36;
  color: var(--color-text-strong);
  padding: 7px 8px;
  font: 12px var(--font-body);
}

.incident-edit__form textarea {
  resize: vertical;
}

.incident-edit-dialog footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 16px 16px;
}

.incident-edit-dialog footer button {
  min-width: 88px;
  height: 32px;
  border: 1px solid rgb(14 165 233 / 45%);
  border-radius: 3px;
  background: #06284b;
  color: #9bdfff;
  cursor: pointer;
}

.incident-edit-dialog footer .is-primary {
  background: linear-gradient(180deg, #087bd4, #075aa7);
  color: var(--color-text-strong);
}
</style>
