<!--
  FireAlarmListDialog — 消防告警列表（二级界面 alarmList）
  对标参考 FireAlarmListDialog：过滤 + 表格 + 分页 + 行操作（详情 / 现场监控 / 处置调度 / 一键应急）。
  数据消费 fireAlarmListMock；行操作复用调度层打开下一级二级界面。
  表格为自定义深蓝表格（不使用 el-table，避免浅色组件破坏大屏规范）。
  图标：压缩包 fire-situation 图标（PkgIcon）。
-->
<script setup lang="ts">
import { computed, ref } from 'vue';
import ScreenDialog from './ScreenDialog.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import { useFireAlarmInteraction } from '@/composables/useFireAlarmInteraction';
import { showToast } from '@/composables/useToast';
import {
  fireAlarmListItems,
  fireAlarmSourceOptions,
  fireAlarmObjectTypeOptions,
  fireAlarmListTypeOptions,
  fireAlarmListStatusOptions,
} from '@/services/map-data/fireAlarmListMock';
import { sceneImageByTone } from '@/services/map-data/fireImages';
import type { FireAlarmListItem } from '@/services/map-data/fireAlarmListMock';

function thumbOf(row: FireAlarmListItem): string {
  return sceneImageByTone(row.typeTone);
}

const emit = defineEmits<{ close: [] }>();
const ia = useFireAlarmInteraction();

const source = ref<string>(fireAlarmSourceOptions[0]);
const objectType = ref<string>(fireAlarmObjectTypeOptions[0]);
const type = ref<string>(fireAlarmListTypeOptions[0]);
const status = ref<string>(fireAlarmListStatusOptions[0]);
const page = ref(1);
const size = 8;

const filtered = computed(() =>
  fireAlarmListItems.filter(
    (it) =>
      (source.value === '全部来源' || it.source === source.value) &&
      (objectType.value === '全部类型' || it.objectType === objectType.value) &&
      (type.value === '全部类型' || it.typeLabel === type.value) &&
      (status.value === '全部状态' || it.listStatus === status.value),
  ),
);
const total = computed(() => filtered.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / size)));
const pageRows = computed(() => {
  const s = (page.value - 1) * size;
  return filtered.value.slice(s, s + size);
});

function changePage(p: number): void {
  if (p >= 1 && p <= totalPages.value) page.value = p;
}
function rowStatusTone(s: string): 'success' | 'alarm' {
  return s === '已关闭' ? 'success' : 'alarm';
}

function goDetail(row: FireAlarmListItem): void {
  ia.openAlarmDetail(row);
}
function goVideo(row: FireAlarmListItem): void {
  ia.openVideo(row);
}
function goDispatch(row: FireAlarmListItem): void {
  ia.openOneKeyBroadcast(row);
}
function goEmergency(row: FireAlarmListItem): void {
  ia.openOneKeyBroadcast(row);
  showToast(`一键应急已触发：${row.title}`);
}
</script>

<template>
  <ScreenDialog :open="true" title="消防告警列表" icon="bell-ringing" @close="emit('close')">
    <div class="list">
      <div class="list__filters">
        <select v-model="source" class="filter-select">
          <option v-for="o in fireAlarmSourceOptions" :key="o" :value="o">{{ o }}</option>
        </select>
        <select v-model="objectType" class="filter-select">
          <option v-for="o in fireAlarmObjectTypeOptions" :key="o" :value="o">{{ o }}</option>
        </select>
        <select v-model="type" class="filter-select">
          <option v-for="o in fireAlarmListTypeOptions" :key="o" :value="o">{{ o }}</option>
        </select>
        <select v-model="status" class="filter-select">
          <option v-for="o in fireAlarmListStatusOptions" :key="o" :value="o">{{ o }}</option>
        </select>
      </div>

      <div class="table" role="table">
        <div class="table__head" role="row">
          <span>现场图</span>
          <span>编号</span>
          <span>类型</span>
          <span>来源</span>
          <span>对象</span>
          <span>等级</span>
          <span>位置</span>
          <span>时间</span>
          <span>状态</span>
          <span class="table__op">操作</span>
        </div>
        <div v-for="row in pageRows" :key="row.id" class="table__row" role="row">
          <span class="thumb">
            <img :src="thumbOf(row)" :alt="row.typeLabel" loading="lazy" />
          </span>
          <span class="num">{{ row.id }}</span>
          <span>{{ row.typeLabel }}</span>
          <span>{{ row.source }}</span>
          <span>{{ row.objectName }}</span>
          <span>{{ row.level }}</span>
          <span class="loc">{{ row.location }}</span>
          <span class="num">{{ row.time }}</span>
          <span :class="['table__status', `is-${rowStatusTone(row.listStatus)}`]">{{
            row.listStatus
          }}</span>
          <span class="table__op">
            <button type="button" class="link" @click="goDetail(row)">详情</button>
            <button type="button" class="link" @click="goVideo(row)">现场</button>
            <button type="button" class="link" @click="goDispatch(row)">调度</button>
            <button type="button" class="link link--danger" @click="goEmergency(row)">应急</button>
          </span>
        </div>
        <p v-if="pageRows.length === 0" class="table__empty">
          <PkgIcon name="bell-ringing" size="36px" class="empty__icon" />
          无匹配告警
        </p>
      </div>

      <div class="list__pager">
        <span class="list__total">共 {{ total }} 条</span>
        <div class="pager">
          <button type="button" :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
          <span class="pager__cur">{{ page }} / {{ totalPages }}</span>
          <button type="button" :disabled="page >= totalPages" @click="changePage(page + 1)">
            下一页
          </button>
        </div>
      </div>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  height: 100%;
}

.list__filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.filter-select {
  height: 32px;
  padding: 0 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text);
  font-size: var(--font-size-helper);
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-accent);
}

.table {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
}

.table__head,
.table__row {
  display: grid;
  grid-template-columns: 64px 56px 84px 84px 110px 56px 1fr 150px 72px 168px;
  align-items: center;
  gap: 8px;
  padding: 0 var(--space-md);
}

.table__head {
  height: 40px;
  position: sticky;
  top: 0;
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  color: var(--color-text-muted);
  font-size: var(--font-size-helper);
  border-bottom: 1px solid var(--panel-border);
}

.table__row {
  min-height: 44px;
  font-size: var(--font-size-biz);
  color: var(--color-text-strong);
  border-bottom: 1px dashed color-mix(in srgb, var(--panel-border) 55%, transparent);
}

.table__row:hover {
  background: color-mix(in srgb, var(--color-accent) 6%, transparent);
}

.table__row .num {
  font-family: var(--font-number);
}

.table__row .loc {
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thumb {
  width: 56px;
  height: 36px;
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--panel-border) 70%, transparent);
  background: var(--panel-inner-bg);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.table__status {
  font-size: var(--font-size-helper);
  font-weight: 600;
}

.table__status.is-alarm {
  color: var(--color-alarm-1);
}

.table__status.is-success {
  color: var(--color-success);
}

.table__op {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.link {
  border: none;
  background: transparent;
  color: var(--color-accent);
  font-size: var(--font-size-helper);
  cursor: pointer;
  padding: 0;
}

.link:hover {
  text-decoration: underline;
}

.link--danger {
  color: var(--color-alarm-1);
}

.table__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-lg);
}

.empty__icon {
  color: var(--color-text-muted);
}

.list__pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list__total {
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.pager {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.pager button {
  height: 30px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text);
  font-size: var(--font-size-helper);
  cursor: pointer;
}

.pager button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pager__cur {
  font-family: var(--font-number);
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}
</style>
