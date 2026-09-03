<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  firePatrolRecords,
  patrolCheckItemDefs,
  patrolShiftOptions,
  patrolStatusOptions,
  type PatrolRecord,
} from '../../lib/data/firePatrolMock';
import { useFirePatrolDialog } from '../../lib/composables/useFirePatrolDialog';
import { useFireFacilityMonitoringDialog } from '../../lib/composables/useFireFacilityMonitoringDialog';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

const { firePatrolPresetId, closeFirePatrol } = useFirePatrolDialog();
const { openFireFacilityMonitoring } = useFireFacilityMonitoringDialog();

const keyword = ref('');
const shiftFilter = ref<string>('全部班次');
const statusFilter = ref<string>('全部状态');
const currentPage = ref(1);
const PAGE_SIZE = 8;
const selectedRecord = ref<PatrolRecord | null>(null);

const filteredRecords = computed(() =>
  firePatrolRecords.filter((record) => {
    if (keyword.value.trim()) {
      const q = keyword.value.trim().toLowerCase();
      if (
        !record.dutyPerson.toLowerCase().includes(q) &&
        !record.locations.join(',').toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (shiftFilter.value !== '全部班次' && record.shift !== shiftFilter.value) return false;
    if (statusFilter.value === '已完成' && !record.completed) return false;
    if (statusFilter.value === '未完成' && record.completed) return false;
    return true;
  }),
);

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRecords.value.length / PAGE_SIZE)));

const pagedRecords = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredRecords.value.slice(start, start + PAGE_SIZE);
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  for (let i = 1; i <= totalPages.value; i += 1) pages.push(i);
  return pages;
});

const abnormalCount = (record: PatrolRecord) =>
  record.checkItems.filter((item) => item.result === '异常').length;

const groupedCheckItems = computed(() => {
  if (!selectedRecord.value) return [];
  const groups: { category: string; items: PatrolRecord['checkItems'] }[] = [];
  for (const def of patrolCheckItemDefs) {
    const item = selectedRecord.value.checkItems.find((check) => check.itemCode === def.itemCode);
    if (!item) continue;
    let group = groups.find((g) => g.category === def.category);
    if (!group) {
      group = { category: def.category, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
});

watch(
  () => props.open,
  (visible) => {
    if (!visible) return;
    const presetId = firePatrolPresetId.value;
    selectedRecord.value = presetId
      ? (firePatrolRecords.find((record) => record.id === presetId) ?? null)
      : null;
    keyword.value = '';
    shiftFilter.value = '全部班次';
    statusFilter.value = '全部状态';
    currentPage.value = 1;
  },
);

watch(filteredRecords, () => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
});

function closeDialog() {
  emit('close');
}

function search() {
  currentPage.value = 1;
}

function resetFilters() {
  keyword.value = '';
  shiftFilter.value = '全部班次';
  statusFilter.value = '全部状态';
  currentPage.value = 1;
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
}

function openDetail(record: PatrolRecord) {
  selectedRecord.value = record;
}

function backToList() {
  selectedRecord.value = null;
}

function resultClass(result: string) {
  if (result === '异常') return 'patrol-result--abnormal';
  if (result === '不适用') return 'patrol-result--na';
  return 'patrol-result--normal';
}

function openWorkOrder(workOrderNo: string) {
  closeFirePatrol();
  openFireFacilityMonitoring({ tab: 'workorder', keyword: workOrderNo });
}

function openSelectedWorkOrder() {
  if (selectedRecord.value?.workOrderNo) {
    openWorkOrder(selectedRecord.value.workOrderNo);
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="patrol-fade">
      <div v-if="open" class="patrol" @click.self="closeDialog">
        <section
          class="patrol__dialog"
          role="dialog"
          aria-modal="true"
          aria-label="消防巡检记录"
          @click.stop
        >
          <header class="patrol__header">
            <div class="patrol__header-main">
              <h3 class="patrol__title">消防巡检记录</h3>
              <span class="patrol__subtitle">日常防火巡查 · 15 项标准化检查表</span>
            </div>
            <button type="button" class="patrol__close" @click="closeDialog">×</button>
          </header>

          <div class="patrol__body">
            <template v-if="selectedRecord">
              <div class="patrol__detail-head">
                <button type="button" class="patrol__back" @click="backToList">‹ 返回</button>
                <h4 class="patrol__detail-title">
                  {{ selectedRecord.patrolDate }} {{ selectedRecord.shift }}班 · 第{{
                    selectedRecord.patrolCount.slice(1)
                  }}次巡查
                </h4>
              </div>

              <div class="patrol__detail-content">
                <section class="patrol__card">
                  <h5 class="patrol__section-title">巡查基本信息</h5>
                  <div class="patrol__info-grid">
                    <div class="patrol__info-item">
                      <span class="patrol__info-label">巡查日期</span>
                      <span class="patrol__info-value">{{ selectedRecord.patrolDate }}</span>
                    </div>
                    <div class="patrol__info-item">
                      <span class="patrol__info-label">班次</span>
                      <span class="patrol__info-value">{{ selectedRecord.shift }}</span>
                    </div>
                    <div class="patrol__info-item">
                      <span class="patrol__info-label">值班人员</span>
                      <span class="patrol__info-value">{{ selectedRecord.dutyPerson }}</span>
                    </div>
                    <div class="patrol__info-item">
                      <span class="patrol__info-label">巡查次数</span>
                      <span class="patrol__info-value">{{ selectedRecord.patrolCount }}</span>
                    </div>
                    <div class="patrol__info-item">
                      <span class="patrol__info-label">巡查部位</span>
                      <span class="patrol__info-value">{{
                        selectedRecord.locations.join('、')
                      }}</span>
                    </div>
                    <div class="patrol__info-item">
                      <span class="patrol__info-label">完成状态</span>
                      <span class="patrol__info-value">
                        <span
                          class="patrol__badge"
                          :class="
                            selectedRecord.completed
                              ? 'patrol-badge--done'
                              : 'patrol-badge--pending'
                          "
                        >
                          {{ selectedRecord.completed ? '已完成' : '未完成' }}
                        </span>
                      </span>
                    </div>
                    <div class="patrol__info-item">
                      <span class="patrol__info-label">异常项</span>
                      <span class="patrol__info-value patrol__info-value--abnormal">
                        {{ abnormalCount(selectedRecord) }} 项
                      </span>
                    </div>
                    <div v-if="selectedRecord.workOrderNo" class="patrol__info-item">
                      <span class="patrol__info-label">关联工单</span>
                      <span class="patrol__info-value">
                        <button type="button" class="patrol__link" @click="openSelectedWorkOrder">
                          {{ selectedRecord.workOrderNo }} ›
                        </button>
                      </span>
                    </div>
                  </div>
                </section>

                <section
                  v-for="group in groupedCheckItems"
                  :key="group.category"
                  class="patrol__card"
                >
                  <h5 class="patrol__section-title">{{ group.category }}</h5>
                  <table class="patrol__table">
                    <thead>
                      <tr>
                        <th>编号</th>
                        <th>检查内容</th>
                        <th>结果</th>
                        <th>异常描述</th>
                        <th>照片</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="item in group.items"
                        :key="item.itemCode"
                        :class="{ 'patrol__row--abnormal': item.result === '异常' }"
                      >
                        <td>{{ item.itemCode }}</td>
                        <td>{{ item.content }}</td>
                        <td>
                          <span class="patrol__badge" :class="resultClass(item.result)">
                            {{ item.result }}
                          </span>
                        </td>
                        <td>{{ item.abnormalDesc ?? '—' }}</td>
                        <td>{{ item.photoFile ? '已采集' : '—' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </section>
              </div>
            </template>

            <template v-else>
              <div class="patrol__toolbar">
                <input
                  v-model="keyword"
                  class="patrol__input"
                  type="text"
                  placeholder="搜索值班人员 / 巡查部位"
                />
                <select v-model="shiftFilter" class="patrol__select">
                  <option v-for="opt in patrolShiftOptions" :key="opt" :value="opt">
                    {{ opt }}
                  </option>
                </select>
                <select v-model="statusFilter" class="patrol__select">
                  <option v-for="opt in patrolStatusOptions" :key="opt" :value="opt">
                    {{ opt }}
                  </option>
                </select>
                <button type="button" class="patrol__btn patrol__btn--primary" @click="search">
                  查询
                </button>
                <button type="button" class="patrol__btn" @click="resetFilters">重置</button>
              </div>

              <div class="patrol__table-wrap">
                <table class="patrol__table">
                  <thead>
                    <tr>
                      <th>巡查日期</th>
                      <th>班次</th>
                      <th>值班人员</th>
                      <th>巡查次数</th>
                      <th>巡查部位</th>
                      <th>异常数</th>
                      <th>完成状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="record in pagedRecords" :key="record.id">
                      <td>{{ record.patrolDate }}</td>
                      <td>{{ record.shift }}</td>
                      <td>{{ record.dutyPerson }}</td>
                      <td>{{ record.patrolCount }}</td>
                      <td class="patrol__cell-location">{{ record.locations.join('、') }}</td>
                      <td>
                        <span
                          class="patrol__abnormal-count"
                          :class="{ 'patrol__abnormal-count--danger': abnormalCount(record) > 0 }"
                        >
                          {{ abnormalCount(record) }}
                        </span>
                      </td>
                      <td>
                        <span
                          class="patrol__badge"
                          :class="record.completed ? 'patrol-badge--done' : 'patrol-badge--pending'"
                        >
                          {{ record.completed ? '已完成' : '未完成' }}
                        </span>
                      </td>
                      <td>
                        <button type="button" class="patrol__link" @click="openDetail(record)">
                          详情
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="patrol__footer">
                <span class="patrol__total">共 {{ filteredRecords.length }} 条记录</span>
                <div class="patrol__pagination">
                  <button
                    type="button"
                    class="patrol__page-btn"
                    :disabled="currentPage <= 1"
                    @click="goToPage(currentPage - 1)"
                  >
                    ‹
                  </button>
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    type="button"
                    class="patrol__page-btn"
                    :class="{ 'patrol__page-btn--active': currentPage === page }"
                    @click="goToPage(page)"
                  >
                    {{ page }}
                  </button>
                  <button
                    type="button"
                    class="patrol__page-btn"
                    :disabled="currentPage >= totalPages"
                    @click="goToPage(currentPage + 1)"
                  >
                    ›
                  </button>
                </div>
              </div>
            </template>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.patrol {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(0 10 24 / 72%);
}

.patrol__dialog {
  display: flex;
  flex-direction: column;
  width: min(1100px, 100%);
  height: min(700px, calc(100vh - 40px));
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%), rgb(5 20 40 / 98%));
  box-shadow: 0 14px 36px rgb(0 0 0 / 42%);
  overflow: hidden;
}

.patrol__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 12px 16px;
  border-bottom: 1px solid var(--panel-head-line);
}

.patrol__header-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.patrol__title {
  margin: 0;
  font-size: 20px;
  color: var(--color-text-strong);
}

.patrol__subtitle {
  font-size: 12px;
  color: var(--map-device-offline);
}

.patrol__close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #c8d8ec;
  font-size: 22px;
  cursor: pointer;
  flex-shrink: 0;
}

.patrol__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 12px 16px 14px;
  gap: 10px;
  overflow: hidden;
}

.patrol__toolbar {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr auto auto;
  gap: 8px;
  flex-shrink: 0;
}

.patrol__input,
.patrol__select {
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

.patrol__select {
  appearance: none;
}

.patrol__btn {
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

.patrol__btn--primary {
  color: var(--color-text-strong);
  border-color: var(--border-glow);
  background: rgb(0 90 160 / 45%);
}

.patrol__table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border: 1px solid rgb(0 110 190 / 22%);
  border-radius: 4px;
  background: rgb(0 16 36 / 35%);
}

.patrol__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  color: var(--color-text-muted);
}

.patrol__table th {
  position: sticky;
  top: 0;
  z-index: var(--z-chrome);
  padding: 9px 8px;
  text-align: left;
  font-weight: 500;
  color: var(--map-device-offline);
  background: rgb(0 28 58 / 95%);
  border-bottom: 1px solid rgb(0 110 190 / 28%);
  white-space: nowrap;
}

.patrol__table td {
  padding: 9px 8px;
  border-bottom: 1px solid var(--list-divider);
  vertical-align: middle;
  line-height: 1.45;
}

.patrol__table tbody tr:hover {
  background: rgb(0 40 78 / 35%);
}

.patrol__row--abnormal {
  background: rgb(255 90 74 / 8%);
}

.patrol__cell-location {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.patrol__abnormal-count {
  font-weight: 700;
  color: var(--map-device-offline);
}

.patrol__abnormal-count--danger {
  display: inline-block;
  min-width: 22px;
  padding: 1px 5px;
  border-radius: 2px;
  background: var(--color-danger);
  color: var(--color-text-strong);
  text-align: center;
}

.patrol__badge {
  display: inline-block;
  padding: 1px 6px;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  font-size: 11px;
  white-space: nowrap;
}

.patrol-badge--done {
  color: var(--color-success);
  border-color: rgb(109 213 140 / 50%);
}

.patrol-badge--pending {
  color: var(--color-warning);
  border-color: rgb(255 159 67 / 50%);
}

.patrol-result--normal {
  color: #6eb5ff;
  border-color: rgb(110 181 255 / 50%);
}

.patrol-result--abnormal {
  color: var(--color-danger);
  border-color: rgb(255 90 74 / 55%);
  background: rgb(255 90 74 / 10%);
}

.patrol-result--na {
  color: var(--map-device-offline);
  border-color: rgb(138 164 196 / 40%);
}

.patrol__link {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-accent-2);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.patrol__link:hover {
  color: #6cf;
}

.patrol__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  gap: 12px;
}

.patrol__total {
  font-size: 12px;
  color: var(--map-device-offline);
}

.patrol__pagination {
  display: flex;
  align-items: center;
  gap: 6px;
}

.patrol__page-btn {
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

.patrol__page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.patrol__page-btn--active {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 55%);
}

.patrol__detail-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.patrol__back {
  padding: 4px 10px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.patrol__detail-title {
  margin: 0;
  font-size: 16px;
  color: var(--color-text-strong);
}

.patrol__detail-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 2px;
}

.patrol__card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid rgb(0 110 190 / 22%);
  border-radius: 4px;
  background: rgb(0 16 36 / 35%);
  flex-shrink: 0;
}

.patrol__section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #dce9f8;
}

.patrol__info-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px 12px;
}

.patrol__info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.patrol__info-label {
  font-size: 11px;
  color: #7d95b3;
}

.patrol__info-value {
  font-size: 13px;
  color: var(--color-text-muted);
  word-break: break-all;
}

.patrol__info-value--abnormal {
  color: var(--color-danger);
  font-weight: 700;
}

.patrol-fade-enter-active,
.patrol-fade-leave-active {
  transition: opacity 0.22s ease;
}

.patrol-fade-enter-from,
.patrol-fade-leave-to {
  opacity: 0;
}
</style>
