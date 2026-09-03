<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { fireListItemToDetail } from '../../lib/data/alarmDetailMock';
import { useAlarmDetailPanel } from '../../lib/composables/useAlarmDetailPanel';
import { usePlantArea } from '../../lib/composables/usePlantArea';
import {
  fireAlarmListItems,
  fireAlarmListStatusOptions,
  fireAlarmListTypeOptions,
  fireAlarmObjectOptions,
  fireAlarmObjectTypeOptions,
  fireAlarmSourceOptions,
  type FireAlarmListItem,
} from '../../lib/data/fireAlarmListMock';

const props = defineProps<{
  open: boolean;
  initialSource?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const router = useRouter();
const { openAlarmDetail } = useAlarmDetailPanel();
const PAGE_SIZE = 10;

const typeFilter = ref(fireAlarmListTypeOptions[0]);
const sourceFilter = ref<string>(fireAlarmSourceOptions[0]);
const objectTypeFilter = ref(fireAlarmObjectTypeOptions[0]);
const objectFilter = ref(fireAlarmObjectOptions[0]);
const statusFilter = ref(fireAlarmListStatusOptions[0]);
const timeRange = ref('');
const currentPage = ref(1);
const { filterByPlantArea } = usePlantArea();

const filteredItems = computed(() =>
  filterByPlantArea(fireAlarmListItems).filter((item) => {
    if (typeFilter.value !== '全部类型' && item.typeLabel !== typeFilter.value) return false;
    if (sourceFilter.value !== '全部来源' && item.source !== sourceFilter.value) return false;
    if (objectTypeFilter.value !== '全部类型' && item.objectType !== objectTypeFilter.value)
      return false;
    if (objectFilter.value !== '全部对象' && item.objectName !== objectFilter.value) return false;
    if (statusFilter.value !== '全部状态' && item.listStatus !== statusFilter.value) return false;
    if (timeRange.value.trim() && !item.time.includes(timeRange.value.trim())) return false;
    return true;
  }),
);

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / PAGE_SIZE)));

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredItems.value.slice(start, start + PAGE_SIZE);
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  for (let i = 1; i <= totalPages.value; i += 1) pages.push(i);
  return pages;
});

watch(
  () => props.open,
  (visible) => {
    if (!visible) return;
    resetFilters();
  },
);

watch(filteredItems, () => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
});

function resetFilters() {
  typeFilter.value = fireAlarmListTypeOptions[0];
  sourceFilter.value = fireAlarmSourceOptions.includes(
    props.initialSource as (typeof fireAlarmSourceOptions)[number],
  )
    ? (props.initialSource as (typeof fireAlarmSourceOptions)[number])
    : fireAlarmSourceOptions[0];
  objectTypeFilter.value = fireAlarmObjectTypeOptions[0];
  objectFilter.value = fireAlarmObjectOptions[0];
  statusFilter.value = fireAlarmListStatusOptions[0];
  timeRange.value = '';
  currentPage.value = 1;
}

function closeDialog() {
  emit('close');
}

function search() {
  currentPage.value = 1;
}

function resetSearch() {
  resetFilters();
}

function exportList() {
  // 占位：后续对接导出接口
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
}

function openDetail(item: FireAlarmListItem) {
  emit('close');
  openAlarmDetail(fireListItemToDetail(item));
}

function openVideoMonitor(item: FireAlarmListItem) {
  router.push({
    name: 'tv',
    query: { monitor: item.onsiteMonitorId, monitorLabel: item.onsiteMonitorLabel },
  });
}

function openRescue(item: FireAlarmListItem, autoStart = false) {
  router.push({
    name: 'fireAccidentRescue',
    query: {
      eventId: String(item.rescueEventId),
      ...(autoStart ? { autostart: '1' } : {}),
    },
  });
}

type DialogAction = {
  key: string;
  label: string;
  handler: (item: FireAlarmListItem) => void;
  primary?: boolean;
};

const dialogActions: DialogAction[] = [
  { key: 'detail', label: '详情', handler: openDetail },
  { key: 'onsite', label: '现场监控', handler: openVideoMonitor },
  { key: 'dispatch', label: '处置调度', handler: (item) => openRescue(item, false) },
  { key: 'emergency', label: '一键应急', handler: (item) => openRescue(item, true), primary: true },
];
</script>

<template>
  <Teleport to="body">
    <Transition name="fire-alarm-list-fade">
      <div v-if="open" class="fire-alarm-list" @click.self="closeDialog">
        <section
          class="fire-alarm-list__dialog"
          role="dialog"
          aria-modal="true"
          aria-label="告警列表"
          @click.stop
        >
          <header class="fire-alarm-list__header">
            <h3 class="fire-alarm-list__title">告警列表</h3>
            <button type="button" class="fire-alarm-list__close" @click="closeDialog">×</button>
          </header>

          <div class="fire-alarm-list__body">
            <div class="fire-alarm-list__toolbar">
              <select v-model="typeFilter" class="fire-alarm-list__select">
                <option v-for="opt in fireAlarmListTypeOptions" :key="opt" :value="opt">
                  {{ opt === '全部类型' ? '告警类型' : opt }}
                </option>
              </select>
              <select v-model="sourceFilter" class="fire-alarm-list__select">
                <option v-for="opt in fireAlarmSourceOptions" :key="opt" :value="opt">
                  {{ opt === '全部来源' ? '告警来源' : opt }}
                </option>
              </select>
              <select v-model="objectTypeFilter" class="fire-alarm-list__select">
                <option v-for="opt in fireAlarmObjectTypeOptions" :key="opt" :value="opt">
                  {{ opt === '全部类型' ? '告警对象类型' : opt }}
                </option>
              </select>
              <select v-model="objectFilter" class="fire-alarm-list__select">
                <option v-for="opt in fireAlarmObjectOptions" :key="opt" :value="opt">
                  {{ opt === '全部对象' ? '告警对象' : opt }}
                </option>
              </select>
              <select v-model="statusFilter" class="fire-alarm-list__select">
                <option v-for="opt in fireAlarmListStatusOptions" :key="opt" :value="opt">
                  {{ opt === '全部状态' ? '告警状态' : opt }}
                </option>
              </select>
              <input
                v-model="timeRange"
                class="fire-alarm-list__input fire-alarm-list__input--time"
                type="text"
                placeholder="请选择告警时间"
              />
              <button
                type="button"
                class="fire-alarm-list__btn fire-alarm-list__btn--primary"
                @click="search"
              >
                查询
              </button>
              <button type="button" class="fire-alarm-list__btn" @click="resetSearch">重置</button>
              <button
                type="button"
                class="fire-alarm-list__btn fire-alarm-list__btn--export"
                @click="exportList"
              >
                导出
              </button>
            </div>

            <div class="fire-alarm-list__table-wrap">
              <table class="fire-alarm-list__table">
                <thead>
                  <tr>
                    <th>告警类型</th>
                    <th>告警对象类型</th>
                    <th>告警对象</th>
                    <th>告警等级</th>
                    <th>告警描述</th>
                    <th>告警位置</th>
                    <th>告警时间</th>
                    <th>是否误报</th>
                    <th>告警状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in pagedItems" :key="item.id">
                    <td>
                      <span class="type-label" :class="`type-label--${item.typeTone}`">{{
                        item.typeLabel
                      }}</span>
                    </td>
                    <td>{{ item.objectType }}</td>
                    <td>{{ item.objectName }}</td>
                    <td>{{ item.level }}</td>
                    <td class="cell-desc">{{ item.description }}</td>
                    <td>{{ item.location }}</td>
                    <td class="cell-time">{{ item.time }}</td>
                    <td>{{ item.falseAlarm }}</td>
                    <td>
                      <span
                        class="status-label"
                        :class="{ 'status-label--closed': item.listStatus === '已关闭' }"
                      >
                        {{ item.listStatus }}
                      </span>
                    </td>
                    <td>
                      <div class="row-actions">
                        <button
                          v-for="action in dialogActions"
                          :key="action.key"
                          type="button"
                          class="row-action"
                          :class="{ 'row-action--primary': action.primary }"
                          @click="action.handler(item)"
                        >
                          {{ action.label }}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="fire-alarm-list__pagination">
              <button
                type="button"
                class="page-btn"
                :disabled="currentPage <= 1"
                @click="goToPage(currentPage - 1)"
              >
                ‹
              </button>
              <button
                v-for="page in visiblePages"
                :key="page"
                type="button"
                class="page-btn"
                :class="{ 'page-btn--active': currentPage === page }"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
              <button
                type="button"
                class="page-btn"
                :disabled="currentPage >= totalPages"
                @click="goToPage(currentPage + 1)"
              >
                ›
              </button>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fire-alarm-list {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(0 10 24 / 72%);
}

.fire-alarm-list__dialog {
  display: flex;
  flex-direction: column;
  width: min(1280px, 100%);
  height: min(720px, calc(100vh - 40px));
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%), rgb(5 20 40 / 98%));
  box-shadow: 0 14px 36px rgb(0 0 0 / 42%);
  overflow: hidden;
}

.fire-alarm-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 12px 16px;
  border-bottom: 1px solid var(--panel-head-line);
}

.fire-alarm-list__title {
  margin: 0;
  font-size: 20px;
  color: var(--color-text-strong);
}

.fire-alarm-list__close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #c8d8ec;
  font-size: 22px;
  cursor: pointer;
}

.fire-alarm-list__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 12px 16px 14px;
  gap: 10px;
}

.fire-alarm-list__toolbar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  flex-shrink: 0;
}

.fire-alarm-list__select,
.fire-alarm-list__input {
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: var(--color-text-strong);
  font-size: 12px;
  font-family: var(--font-body);
  outline: none;
  min-width: 0;
}

.fire-alarm-list__input--time {
  grid-column: span 2;
}

.fire-alarm-list__select {
  appearance: none;
}

.fire-alarm-list__btn {
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.fire-alarm-list__btn--primary {
  color: var(--color-text-strong);
  border-color: var(--border-glow);
  background: rgb(0 90 160 / 45%);
}

.fire-alarm-list__btn--export {
  grid-column: 4;
  justify-self: end;
}

.fire-alarm-list__table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border: 1px solid rgb(0 110 190 / 22%);
  border-radius: 4px;
  background: rgb(0 16 36 / 35%);
}

.fire-alarm-list__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  color: var(--color-text-muted);
}

.fire-alarm-list__table th {
  position: sticky;
  top: 0;
  z-index: var(--z-chrome);
  padding: 10px 8px;
  text-align: left;
  font-weight: 500;
  color: var(--map-device-offline);
  background: rgb(0 28 58 / 95%);
  border-bottom: 1px solid rgb(0 110 190 / 28%);
  white-space: nowrap;
}

.fire-alarm-list__table td {
  padding: 10px 8px;
  border-bottom: 1px solid var(--list-divider);
  vertical-align: top;
  line-height: 1.45;
}

.fire-alarm-list__table tbody tr:hover {
  background: rgb(0 40 78 / 35%);
}

.cell-desc {
  min-width: 180px;
  max-width: 220px;
}

.cell-time {
  white-space: nowrap;
}

.type-label--fire {
  color: var(--color-danger);
}

.type-label--smoke {
  color: var(--color-warning);
}

.type-label--gds {
  color: var(--color-danger);
}

.type-label--muted {
  color: #6eb5ff;
}

.status-label {
  color: var(--color-danger);
}

.status-label--closed {
  color: var(--map-device-offline);
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 140px;
}

.row-action {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-accent-2);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.row-action:hover {
  color: #6cf;
}

.row-action--primary {
  color: var(--color-danger);
}

.row-action--primary:hover {
  color: var(--color-danger);
}

.fire-alarm-list__pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.page-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.page-btn--active {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 55%);
}

.fire-alarm-list-fade-enter-active,
.fire-alarm-list-fade-leave-active {
  transition: opacity 0.22s ease;
}

.fire-alarm-list-fade-enter-from,
.fire-alarm-list-fade-leave-to {
  opacity: 0;
}
</style>
