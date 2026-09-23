<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import type { PerimeterAlarmCreatePayload } from '@/services/security';

const props = defineProps<{ open: boolean }>();

const emit = defineEmits<{
  close: [];
  submit: [payload: PerimeterAlarmCreatePayload];
}>();

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Date → datetime-local 输入框值（yyyy-MM-ddTHH:mm）。 */
function formatDatetimeLocal(date: Date): string {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** datetime-local 值（yyyy-MM-ddTHH:mm）→ 后端期望 yyyy-MM-dd HH:mm:ss。 */
function toBackendDatetime(local: string): string {
  if (!local) return '';
  const s = local.replace('T', ' ');
  return s.length === 16 ? `${s}:00` : s;
}

const alarmTypeOptions = ['周界入侵告警', '入侵检测告警', '异常徘徊告警', '翻越围栏告警'];
const levelOptions = ['一级', '二级', '三级', '四级'];

interface FormState {
  title: string;
  alarmType: string;
  levelCode: string;
  location: string;
  alarmTime: string;
  description: string;
  objectName: string;
  objectType: string;
  intrusionPosition: string;
  intrusionMethod: string;
  relatedCamera: string;
}

function createDefaultForm(): FormState {
  return {
    title: '',
    alarmType: '周界入侵告警',
    levelCode: '一级',
    location: '',
    alarmTime: formatDatetimeLocal(new Date()),
    description: '',
    objectName: '',
    objectType: '',
    intrusionPosition: '',
    intrusionMethod: '',
    relatedCamera: '',
  };
}

const form = reactive<FormState>(createDefaultForm());
const titleError = ref(false);

// 每次打开重置表单，避免上一次录入残留。
watch(
  () => props.open,
  (open) => {
    if (open) {
      Object.assign(form, createDefaultForm());
      titleError.value = false;
    }
  },
);

function close(): void {
  emit('close');
}

function handleSubmit(): void {
  if (!form.title.trim()) {
    titleError.value = true;
    return;
  }
  titleError.value = false;
  const payload: PerimeterAlarmCreatePayload = {
    title: form.title.trim(),
    alarmType: form.alarmType,
    levelCode: form.levelCode,
    location: form.location.trim() || undefined,
    alarmTime: toBackendDatetime(form.alarmTime) || undefined,
    description: form.description.trim() || undefined,
    objectName: form.objectName.trim() || undefined,
    objectType: form.objectType.trim() || undefined,
    intrusionPosition: form.intrusionPosition.trim() || undefined,
    intrusionMethod: form.intrusionMethod.trim() || undefined,
    relatedCamera: form.relatedCamera.trim() || undefined,
  };
  emit('submit', payload);
  close();
}
</script>

<template>
  <Teleport to="body">
    <Transition name="pac-fade">
      <div v-if="open" class="pac-overlay" @click.self="close">
        <div class="pac-dialog" role="dialog" aria-modal="true">
          <header class="pac-dialog__header">
            <h2 class="pac-dialog__title">新增治安报警</h2>
            <button type="button" class="pac-dialog__close" aria-label="关闭" @click="close">
              ×
            </button>
          </header>

          <div class="pac-dialog__body">
            <div class="pac-grid pac-grid--2">
              <label class="pac-field">
                <span class="pac-label pac-label--required">告警标题</span>
                <input
                  v-model="form.title"
                  class="pac-input"
                  :class="{ 'pac-input--error': titleError }"
                  type="text"
                  placeholder="请输入告警标题"
                  @input="titleError = false"
                />
                <span v-if="titleError" class="pac-error">告警标题不能为空</span>
              </label>
              <label class="pac-field">
                <span class="pac-label">告警类型</span>
                <select v-model="form.alarmType" class="pac-select">
                  <option v-for="opt in alarmTypeOptions" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </label>
            </div>

            <div class="pac-grid pac-grid--2">
              <label class="pac-field">
                <span class="pac-label">告警等级</span>
                <select v-model="form.levelCode" class="pac-select">
                  <option v-for="opt in levelOptions" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </label>
              <label class="pac-field">
                <span class="pac-label">发生时间</span>
                <input v-model="form.alarmTime" class="pac-input" type="datetime-local" />
              </label>
            </div>

            <label class="pac-field pac-field--full">
              <span class="pac-label">告警位置</span>
              <input
                v-model="form.location"
                class="pac-input"
                type="text"
                placeholder="如：厂区南门西侧 200 米"
              />
            </label>

            <label class="pac-field pac-field--full">
              <span class="pac-label">告警说明</span>
              <textarea
                v-model="form.description"
                class="pac-textarea"
                rows="3"
                placeholder="如：监控识别到人员翻越周界栅栏"
              />
            </label>

            <div class="pac-grid pac-grid--2">
              <label class="pac-field">
                <span class="pac-label">入侵对象名称</span>
                <input
                  v-model="form.objectName"
                  class="pac-input"
                  type="text"
                  placeholder="如：翻越人员"
                />
              </label>
              <label class="pac-field">
                <span class="pac-label">入侵对象类型</span>
                <input
                  v-model="form.objectType"
                  class="pac-input"
                  type="text"
                  placeholder="如：人员"
                />
              </label>
            </div>

            <div class="pac-grid pac-grid--2">
              <label class="pac-field">
                <span class="pac-label">入侵位置</span>
                <input
                  v-model="form.intrusionPosition"
                  class="pac-input"
                  type="text"
                  placeholder="如：栅栏中段"
                />
              </label>
              <label class="pac-field">
                <span class="pac-label">入侵方式</span>
                <input
                  v-model="form.intrusionMethod"
                  class="pac-input"
                  type="text"
                  placeholder="如：翻越"
                />
              </label>
            </div>

            <label class="pac-field pac-field--full">
              <span class="pac-label">关联摄像机</span>
              <input
                v-model="form.relatedCamera"
                class="pac-input"
                type="text"
                placeholder="如：CAM-007"
              />
            </label>
          </div>

          <footer class="pac-dialog__footer">
            <button type="button" class="pac-btn pac-btn--primary" @click="handleSubmit">
              提交
            </button>
            <button type="button" class="pac-btn pac-btn--ghost" @click="close">取消</button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.pac-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgb(0 8 20 / 72%);
  backdrop-filter: blur(2px);
}

.pac-dialog {
  width: min(640px, 100%);
  max-height: min(90vh, 760px);
  display: flex;
  flex-direction: column;
  border: 1px solid rgb(0 140 220 / 45%);
  border-radius: 4px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%) 0%, rgb(4 18 40 / 98%) 100%);
  box-shadow: 0 18px 48px rgb(0 0 0 / 45%);

  --pac-accent: #7cdbff;
  --pac-accent-rgb: 124, 219, 255;
  --pac-border: rgb(0 100 180 / 38%);
  --pac-border-strong: rgb(0 140 220 / 50%);
  --pac-btn-primary: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
  --pac-btn-primary-border: rgb(0 160 240 / 55%);
}

.pac-dialog__header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 12px;
  border-bottom: 1px solid var(--pac-border);
}

.pac-dialog__title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-strong);
}

.pac-dialog__close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 2px;
  background: transparent;
  color: #c8d8ec;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.pac-dialog__close:hover {
  color: var(--color-text-strong);
  background: rgb(255 255 255 / 6%);
}

.pac-dialog__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px 20px 8px;
}

.pac-dialog__body::-webkit-scrollbar {
  width: 5px;
}

.pac-dialog__body::-webkit-scrollbar-thumb {
  background: rgba(var(--pac-accent-rgb), 0.35);
  border-radius: 3px;
}

.pac-grid {
  display: grid;
  gap: 12px 16px;
  margin-bottom: 12px;
}

.pac-grid--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.pac-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.pac-field--full {
  margin-bottom: 12px;
}

.pac-label {
  font-size: 13px;
  color: #b8c8dc;
  line-height: 1.3;
}

.pac-label--required::before {
  content: '*';
  color: var(--color-danger);
  margin-right: 2px;
}

.pac-input,
.pac-select,
.pac-textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--pac-border);
  border-radius: 2px;
  background: rgb(0 20 45 / 82%);
  color: #e8f2ff;
  font-size: 13px;
  font-family: var(--font-body);
  outline: none;
}

.pac-input,
.pac-select {
  height: 34px;
  padding: 0 10px;
}

.pac-textarea {
  padding: 8px 10px;
  resize: vertical;
  min-height: 72px;
}

.pac-input:focus,
.pac-select:focus,
.pac-textarea:focus {
  border-color: var(--pac-border-strong);
  box-shadow: 0 0 0 1px rgba(var(--pac-accent-rgb), 0.25);
}

.pac-input--error {
  border-color: var(--color-danger);
}

.pac-error {
  font-size: 12px;
  color: var(--color-danger);
}

.pac-input::placeholder,
.pac-textarea::placeholder {
  color: #6a8098;
}

.pac-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 14px 20px 18px;
  border-top: 1px solid var(--pac-border);
}

.pac-btn {
  min-width: 96px;
  height: 34px;
  padding: 0 20px;
  border-radius: 2px;
  font-size: 14px;
  font-family: var(--font-body);
  cursor: pointer;
}

.pac-btn--primary {
  border: 1px solid var(--pac-btn-primary-border);
  background: var(--pac-btn-primary);
  color: var(--color-text-strong);
}

.pac-btn--ghost {
  border: 1px solid var(--pac-border-strong);
  background: var(--alarm-card-bg);
  color: #c8dcec;
}

.pac-fade-enter-active,
.pac-fade-leave-active {
  transition: opacity 0.22s ease;
}

.pac-fade-enter-from,
.pac-fade-leave-to {
  opacity: 0;
}

@media (width <= 720px) {
  .pac-grid--2 {
    grid-template-columns: 1fr;
  }
}
</style>
