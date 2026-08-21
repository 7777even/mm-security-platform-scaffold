<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';
import AppButton from '@/components/common/AppButton.vue';
import {
  fetchAlarmPage,
  createEmergencyEvent,
  updateEmergencyEvent,
  deleteEmergencyEvent,
  type AlarmItem,
  type AlarmLevel,
  type AlarmType,
} from '@/services/alarm';

/**
 * 应急事件 CRUD 模块（应急指挥专题 §5.3.6.2）：
 * - 工具栏（关键词搜索 + 等级/类型筛选 + 新增按钮）
 * - 表格（事件 ID / 等级 / 类型 / 设备 / 时间 / 操作）
 * - 行内操作：查看 / 编辑 / 删除
 * - 表单弹窗：新增 + 编辑复用同一表单（受控 editing 状态）
 *
 * 数据来源：services/alarm.ts。写操作走 createEmergencyEvent / updateEmergencyEvent /
 * deleteEmergencyEvent；后端未启时统一在 service 内部 try/catch 兜底为 fixture，不影响 UI 演示。
 */

type FormState = {
  id: string;
  level: AlarmLevel;
  type: AlarmType;
  deviceCode: string;
  location: string;
  description: string;
};

const events = ref<AlarmItem[]>([]);
const loading = ref(true);
const keyword = ref('');
const filterLevel = ref<AlarmLevel | 0>(0);
const filterType = ref<AlarmType | ''>('');
const editing = ref<FormState | null>(null);
const viewing = ref<AlarmItem | null>(null);

const TYPE_OPTIONS: Array<{ value: AlarmType; label: string }> = [
  { value: 'FIRE', label: '火灾' },
  { value: 'GAS', label: '气体' },
  { value: 'TEMP', label: '温度' },
  { value: 'CCTV', label: '视频' },
  { value: 'SOS', label: '一键报警' },
];

const LEVEL_OPTIONS: Array<{ value: AlarmLevel; label: string }> = [
  { value: 1, label: '一级' },
  { value: 2, label: '二级' },
  { value: 3, label: '三级' },
  { value: 4, label: '四级' },
];

const filtered = computed<AlarmItem[]>(() => {
  const k = keyword.value.trim().toLowerCase();
  return events.value.filter((e) => {
    if (filterLevel.value && e.level !== filterLevel.value) return false;
    if (filterType.value && e.type !== filterType.value) return false;
    if (!k) return true;
    return (
      e.alarmId.toLowerCase().includes(k) ||
      e.deviceCode.toLowerCase().includes(k) ||
      e.location.toLowerCase().includes(k)
    );
  });
});

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const page = await fetchAlarmPage(1, 20);
    events.value = page.list;
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editing.value = {
    id: '',
    level: 3,
    type: 'FIRE',
    deviceCode: '',
    location: '',
    description: '',
  };
}

function openEdit(e: AlarmItem): void {
  editing.value = {
    id: e.alarmId,
    level: e.level,
    type: e.type,
    deviceCode: e.deviceCode,
    location: e.location,
    description: e.description,
  };
}

function openView(e: AlarmItem): void {
  viewing.value = e;
}

async function submitEdit(): Promise<void> {
  if (!editing.value) return;
  const form = editing.value;
  if (!form.deviceCode.trim() || !form.location.trim()) {
    // 必填校验：最少要有设备编号 + 位置；模板已在输入框提示
    return;
  }
  if (form.id) {
    await updateEmergencyEvent(form.id, form);
  } else {
    await createEmergencyEvent(form);
  }
  editing.value = null;
  await load();
}

async function remove(e: AlarmItem): Promise<void> {
  // 简化：直接删除（生产环境应用 confirm 弹窗二次确认）
  await deleteEmergencyEvent(e.alarmId);
  await load();
}

onMounted(load);
</script>

<template>
  <PanelCard title="应急事件" icon="BellFilled">
    <!-- 工具栏：搜索 + 筛选 + 新增 -->
    <div class="crud-toolbar" data-test="crud-toolbar">
      <input
        v-model="keyword"
        class="crud-toolbar__input"
        placeholder="搜索 事件 ID / 设备 / 位置"
        type="search"
      />
      <select v-model.number="filterLevel" class="crud-toolbar__select">
        <option :value="0">全部等级</option>
        <option v-for="l in LEVEL_OPTIONS" :key="l.value" :value="l.value">
          {{ l.label }}
        </option>
      </select>
      <select v-model="filterType" class="crud-toolbar__select">
        <option value="">全部类型</option>
        <option v-for="t in TYPE_OPTIONS" :key="t.value" :value="t.value">
          {{ t.label }}
        </option>
      </select>
      <AppButton variant="primary" size="sm" data-test="crud-create" @click="openCreate">
        新增
      </AppButton>
    </div>

    <!-- 卡片网格 -->
    <div class="crud-cards-wrap" data-test="crud-table">
      <ul v-if="!loading && filtered.length > 0" class="crud-cards">
        <li
          v-for="e in filtered"
          :key="e.alarmId"
          class="crud-card"
          :class="`tone-alarm-${e.level}`"
        >
          <div class="crud-card__top">
            <span class="crud-card__id font-number">{{ e.alarmId }}</span>
            <span class="crud-card__level tone-alarm-" :class="`tone-alarm-${e.level}`">
              {{ LEVEL_OPTIONS.find((l) => l.value === e.level)?.label ?? e.level }}
            </span>
          </div>
          <div class="crud-card__body">
            <span class="crud-card__type">{{
              TYPE_OPTIONS.find((t) => t.value === e.type)?.label ?? e.type
            }}</span>
            <span class="crud-card__sep">·</span>
            <span class="crud-card__device">{{ e.deviceCode }}</span>
          </div>
          <div class="crud-card__loc">{{ e.location }}</div>
          <div class="crud-card__footer">
            <span class="crud-card__time font-number">{{ formatTime(e.ts) }}</span>
            <div class="crud-card__actions">
              <button class="crud-link" title="查看" @click="openView(e)">查看</button>
              <button class="crud-link" title="编辑" @click="openEdit(e)">编辑</button>
              <button class="crud-link crud-link--danger" title="删除" @click="remove(e)">
                删除
              </button>
            </div>
          </div>
        </li>
      </ul>
      <p v-else-if="loading" class="crud-empty">应急事件加载中…</p>
      <p v-else class="crud-empty">暂无符合条件的事件</p>
    </div>

    <!-- 新增 / 编辑 弹窗 -->
    <div v-if="editing" class="crud-modal" data-test="crud-modal" role="dialog" aria-modal="true">
      <div class="crud-modal__panel">
        <h3 class="crud-modal__title">{{ editing.id ? '编辑应急事件' : '新增应急事件' }}</h3>
        <form class="crud-form" @submit.prevent="submitEdit">
          <label class="crud-form__field">
            <span class="设备编号">设备编号 <em>*</em></span>
            <input v-model="editing.deviceCode" required maxlength="32" />
          </label>
          <label class="crud-form__field">
            <span>事件等级</span>
            <select v-model.number="editing.level">
              <option v-for="l in LEVEL_OPTIONS" :key="l.value" :value="l.value">
                {{ l.label }}
              </option>
            </select>
          </label>
          <label class="crud-form__field">
            <span>事件类型</span>
            <select v-model="editing.type">
              <option v-for="t in TYPE_OPTIONS" :key="t.value" :value="t.value">
                {{ t.label }}
              </option>
            </select>
          </label>
          <label class="crud-form__field">
            <span>位置 <em>*</em></span>
            <input v-model="editing.location" required maxlength="64" />
          </label>
          <label class="crud-form__field">
            <span>描述</span>
            <textarea v-model="editing.description" rows="3" maxlength="200" />
          </label>
          <div class="crud-form__actions">
            <AppButton variant="ghost" type="button" @click="editing = null">取消</AppButton>
            <AppButton variant="primary" type="submit">保存</AppButton>
          </div>
        </form>
      </div>
    </div>

    <!-- 查看 弹窗 -->
    <div v-if="viewing" class="crud-modal" data-test="crud-view" role="dialog" aria-modal="true">
      <div class="crud-modal__panel">
        <h3 class="crud-modal__title">应急事件详情</h3>
        <dl class="crud-view">
          <dt>事件 ID</dt>
          <dd class="font-number">{{ viewing.alarmId }}</dd>
          <dt>等级</dt>
          <dd>
            {{ LEVEL_OPTIONS.find((l) => l.value === viewing.level)?.label ?? viewing.level }}
          </dd>
          <dt>类型</dt>
          <dd>{{ TYPE_OPTIONS.find((t) => t.value === viewing.type)?.label ?? viewing.type }}</dd>
          <dt>设备</dt>
          <dd>{{ viewing.deviceCode }}</dd>
          <dt>位置</dt>
          <dd>{{ viewing.location }}</dd>
          <dt>描述</dt>
          <dd>{{ viewing.description || '—' }}</dd>
          <dt>时间</dt>
          <dd class="font-number">{{ formatTime(viewing.ts) }}</dd>
        </dl>
        <div class="crud-form__actions">
          <AppButton variant="primary" @click="viewing = null">关闭</AppButton>
        </div>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.crud-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.crud-toolbar__input {
  flex: 1 1 160px;
  min-width: 140px;
  height: 32px;
  padding: 0 10px;
  background: var(--color-panel-2);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 12px;
  outline: none;
  transition:
    border-color 0.15s,
    background 0.15s;
}

.crud-toolbar__input:focus {
  border-color: var(--color-accent);
  background: var(--color-panel);
}

.crud-toolbar__input::placeholder {
  color: rgb(143 166 200 / 60%);
}

.crud-toolbar__select {
  height: 32px;
  padding: 0 8px;
  background: var(--color-panel-2);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 12px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
}

.crud-toolbar__select:focus,
.crud-toolbar__select:hover {
  border-color: var(--color-accent);
}

.crud-cards-wrap {
  overflow: hidden;
}

.crud-cards {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.crud-card {
  display: grid;
  grid-template-rows: auto auto auto auto;
  gap: 6px;
  padding: 12px 14px;
  background: linear-gradient(180deg, rgb(19 35 60 / 65%), rgb(11 21 38 / 65%));
  border: 1px solid var(--color-border-soft);
  border-radius: 8px;
  transition:
    border-color 0.15s,
    transform 0.15s,
    background 0.15s;
  position: relative;
}

.crud-card::before {
  /* 左侧 4px 状态色条，按事件等级着色（规范 §13.1） */
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--color-alarm-3);
}

.crud-card.tone-alarm-1::before {
  background: var(--color-alarm-1);
}

.crud-card.tone-alarm-2::before {
  background: var(--color-alarm-2);
}

.crud-card.tone-alarm-3::before {
  background: var(--color-alarm-3);
}

.crud-card.tone-alarm-4::before {
  background: var(--color-alarm-4);
}

.crud-card:hover {
  border-color: var(--color-accent);
  background: linear-gradient(180deg, var(--color-panel), rgb(11 21 38 / 75%));
}

.crud-card:hover::before {
  background: var(--color-accent);
}

.crud-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 6px;
}

.crud-card__id {
  font-size: 11px;
  color: var(--color-text-muted);
  letter-spacing: 0.4px;
}

.crud-card__level {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 11px;
  background: rgb(255 255 255 / 5%);
  border: 1px solid currentcolor;
  border-color: rgb(255 255 255 / 8%);
}

.crud-card__body {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 6px;
  font-size: 13px;
  color: var(--color-text);
  font-weight: 600;
}

.crud-card__type {
  color: var(--color-text);
}

.crud-card__sep {
  color: var(--color-text-muted);
}

.crud-card__device {
  color: var(--color-text);
  font-weight: 400;
}

.crud-card__loc {
  padding-left: 6px;
  font-size: 12px;
  color: var(--color-text);
  line-height: 1.4;

  /* 限制最多两行，避免卡片过高 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.crud-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 6px;
  padding-top: 4px;
  border-top: 1px dashed var(--color-border-soft);
}

.crud-card__time {
  font-size: 11px;
  color: var(--color-text-muted);
}

.crud-card__actions {
  display: flex;
  gap: 12px;
}

.crud-link {
  padding: 2px 0;
  background: transparent;
  border: none;
  color: var(--color-accent);
  cursor: pointer;
  font-size: 12px;
  transition: color 0.12s;
}

.crud-link:hover {
  color: var(--color-accent);
  text-decoration: underline;
}

.crud-link--danger {
  color: var(--color-danger, #ff5a5a);
}

.crud-link--danger:hover {
  color: #ff8a8a;
}

.tone-alarm-1 {
  color: var(--color-alarm-1, #f46767);
}

.tone-alarm-2 {
  color: var(--color-alarm-2, #f6882e);
}

.tone-alarm-3 {
  color: var(--color-alarm-3, #f6ba2e);
}

.tone-alarm-4 {
  color: var(--color-alarm-4, #2e7cf6);
}

.crud-empty {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 12px;
  padding: 16px 0;
}

/* 模态框 */
.crud-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 55%);
  backdrop-filter: blur(2px);
}

.crud-modal__panel {
  width: 420px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 64px);
  overflow-y: auto;
  padding: 20px;
  background: linear-gradient(180deg, rgb(19 35 60 / 98%), rgb(11 21 38 / 98%));
  border: 1px solid var(--color-accent);
  border-radius: 10px;
  box-shadow: 0 12px 36px rgb(0 0 0 / 60%);
  color: var(--color-text);
}

.crud-modal__title {
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 600;
}

.crud-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.crud-form__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text);
}

.crud-form__field em {
  color: var(--color-danger, #ff5a5a);
  font-style: normal;
}

.crud-form__field input,
.crud-form__field select,
.crud-form__field textarea {
  padding: 6px 8px;
  background: var(--color-panel-2);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  font-size: 12px;
  outline: none;
}

.crud-form__field input:focus,
.crud-form__field select:focus,
.crud-form__field textarea:focus {
  border-color: var(--color-accent);
}

.crud-form__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 6px;
}

.crud-view {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 12px;
  margin: 0 0 12px;
  font-size: 12px;
}

.crud-view dt {
  color: var(--color-text-muted);
}

.crud-view dd {
  margin: 0;
  color: var(--color-text);
}
</style>
