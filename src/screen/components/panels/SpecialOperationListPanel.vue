<script setup lang="ts">
import { computed } from 'vue';
import PanelCard from '../common/PanelCard.vue';
import {
  closeSpecialOperationView,
  goToSpecialOperationPage,
  resetSpecialOperationSearch,
  searchSpecialOperation,
  selectSpecialOperation,
  selectedSpecialOperationId,
  specialOperationAreas,
  specialOperationAreaFilter,
  specialOperationCurrentPage,
  specialOperationLevels,
  specialOperationLevelFilter,
  specialOperationPagedItems,
  specialOperationStatuses,
  specialOperationStatusFilter,
  specialOperationTimeRange,
  specialOperationTotalCount,
  specialOperationTotalPages,
  specialOperationTypes,
  specialOperationTypeFilter,
} from '../../lib/composables/useSpecialOperationView';

// 下拉变更即触发服务端筛选（下拉文案原样传参，「全部xx」由后端忽略）
function handleFilterChange() {
  void searchSpecialOperation();
}

const visiblePages = computed(() => {
  const pages: number[] = [];
  for (let i = 1; i <= specialOperationTotalPages.value; i += 1) pages.push(i);
  return pages;
});

function handleSelect(id: number) {
  selectSpecialOperation(id);
}
</script>

<template>
  <PanelCard title="" variant="rescue" :show-more="false">
    <template #title>
      <div class="spec-op-list__title">
        <h3 class="spec-op-list__heading">特殊作业列表</h3>
        <span class="spec-op-list__count">共 {{ specialOperationTotalCount }} 个</span>
      </div>
    </template>

    <template #header-extra>
      <button type="button" class="spec-op-list__back" @click="closeSpecialOperationView">
        返回
      </button>
    </template>

    <div class="spec-op-list">
      <div class="spec-op-list__toolbar">
        <select
          v-model="specialOperationAreaFilter"
          class="spec-op-list__select"
          @change="handleFilterChange"
        >
          <option v-for="area in specialOperationAreas" :key="area" :value="area">
            {{ area === '全部区域' ? '作业区域' : area }}
          </option>
        </select>
        <select
          v-model="specialOperationTypeFilter"
          class="spec-op-list__select"
          @change="handleFilterChange"
        >
          <option v-for="type in specialOperationTypes" :key="type" :value="type">
            {{ type === '全部类型' ? '作业类型' : type }}
          </option>
        </select>
        <select
          v-model="specialOperationLevelFilter"
          class="spec-op-list__select"
          @change="handleFilterChange"
        >
          <option v-for="level in specialOperationLevels" :key="level" :value="level">
            {{ level === '全部等级' ? '作业等级' : level }}
          </option>
        </select>
        <select
          v-model="specialOperationStatusFilter"
          class="spec-op-list__select"
          @change="handleFilterChange"
        >
          <option v-for="status in specialOperationStatuses" :key="status" :value="status">
            {{ status === '全部状态' ? '状态' : status }}
          </option>
        </select>
        <input
          v-model="specialOperationTimeRange"
          class="spec-op-list__input spec-op-list__input--time"
          type="text"
          placeholder="请选择作业时间范围"
        />
        <button
          type="button"
          class="spec-op-list__btn spec-op-list__btn--primary"
          @click="searchSpecialOperation"
        >
          检索
        </button>
        <button type="button" class="spec-op-list__btn" @click="resetSpecialOperationSearch">
          重置
        </button>
      </div>

      <div class="spec-op-table">
        <div class="spec-op-table__head">
          <span>作业区域</span>
          <span>作业类型</span>
          <span>作业票等级</span>
          <span>状态</span>
          <span>作业时间</span>
        </div>
        <button
          v-for="item in specialOperationPagedItems"
          :key="item.id"
          type="button"
          class="spec-op-table__row"
          :class="{ 'spec-op-table__row--active': selectedSpecialOperationId === item.id }"
          @click="handleSelect(item.id)"
        >
          <span class="spec-op-table__cell">{{ item.area }}</span>
          <span class="spec-op-table__cell">{{ item.type }}</span>
          <span class="spec-op-table__cell">{{ item.level }}</span>
          <span class="spec-op-table__cell">{{ item.status }}</span>
          <span class="spec-op-table__cell spec-op-table__cell--time">{{ item.timeRange }}</span>
        </button>
      </div>

      <div class="spec-op-list__pagination">
        <button
          type="button"
          class="page-btn"
          :disabled="specialOperationCurrentPage <= 1"
          @click="goToSpecialOperationPage(specialOperationCurrentPage - 1)"
        >
          ‹
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          class="page-btn"
          :class="{ 'page-btn--active': specialOperationCurrentPage === page }"
          @click="goToSpecialOperationPage(page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          class="page-btn"
          :disabled="specialOperationCurrentPage >= specialOperationTotalPages"
          @click="goToSpecialOperationPage(specialOperationCurrentPage + 1)"
        >
          ›
        </button>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.spec-op-list__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.spec-op-list__heading {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-strong);
  white-space: nowrap;
}

.spec-op-list__count {
  font-size: 13px;
  color: var(--map-device-offline);
  white-space: nowrap;
}

.spec-op-list__back {
  height: 26px;
  padding: 0 10px;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  background: rgb(0 28 58 / 65%);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.spec-op-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 8px;
}

.spec-op-list__toolbar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  flex-shrink: 0;
}

.spec-op-list__input,
.spec-op-list__select {
  height: 30px;
  padding: 0 8px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: var(--color-text-strong);
  font-size: 12px;
  font-family: var(--font-body);
  outline: none;
  min-width: 0;
}

.spec-op-list__input--time {
  grid-column: span 2;
}

.spec-op-list__select {
  appearance: none;
}

.spec-op-list__btn {
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.spec-op-list__btn--primary {
  color: var(--color-text-strong);
  border-color: var(--border-glow);
  background: rgb(0 90 160 / 45%);
}

.spec-op-table {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.spec-op-table__head,
.spec-op-table__row {
  display: grid;
  grid-template-columns: 1fr 0.8fr 0.7fr 0.6fr 1.4fr;
  align-items: center;
  gap: 4px;
  text-align: left;
}

.spec-op-table__head {
  padding: 0 6px 4px;
  font-size: 11px;
  color: var(--map-device-offline);
  flex-shrink: 0;
}

.spec-op-table__row {
  width: 100%;
  padding: 8px 6px;
  border: 1px solid rgb(0 130 210 / 18%);
  border-radius: 2px;
  background: rgb(0 24 50 / 45%);
  color: var(--color-text-strong);
  font-family: var(--font-body);
  cursor: pointer;
  flex-shrink: 0;
}

.spec-op-table__row--active {
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 55 100 / 45%);
  box-shadow: inset 0 0 10px rgb(0 170 255 / 8%);
}

.spec-op-table__cell {
  font-size: 11px;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spec-op-table__cell--time {
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.spec-op-list__pagination {
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
</style>
