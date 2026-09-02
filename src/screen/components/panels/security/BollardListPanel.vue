<script setup lang="ts">
import PanelCard from '../../common/PanelCard.vue';
import { bollards, type BollardItem } from '../../../lib/data/securityBollardMock';
import {
  bollardCurrentPage,
  bollardPagedItems,
  bollardSearchKeyword,
  bollardTotalPages,
  bollardVisiblePages,
  closeBollardList,
  goToBollardPage,
  resetBollardSearch,
} from '../../../lib/composables/useBollardListView';
import { openBollardDetail } from '../../../lib/composables/useBollardDetailDialog';

function statusClass(status: BollardItem['status']) {
  if (status === '正常') return 'bollard-table__status--normal';
  if (status === '离线') return 'bollard-table__status--offline';
  return 'bollard-table__status--fault';
}

function handleRowClick(item: BollardItem) {
  openBollardDetail(item.id);
}
</script>

<template>
  <PanelCard title="" variant="rescue" :show-more="false">
    <template #title>
      <div class="bollard-list__title">
        <h3 class="bollard-list__heading">液压防恐柱列表</h3>
        <span class="bollard-list__count">共 {{ bollards.length }} 个</span>
      </div>
    </template>

    <template #header-extra>
      <button type="button" class="bollard-list__back" @click="closeBollardList">返回</button>
    </template>

    <div class="bollard-list">
      <div class="bollard-list__toolbar">
        <input
          v-model="bollardSearchKeyword"
          type="text"
          class="bollard-list__search"
          placeholder="请输入防恐柱名称 / 门禁卡口"
        />
        <button
          v-if="bollardSearchKeyword"
          type="button"
          class="bollard-list__reset"
          @click="resetBollardSearch"
        >
          重置
        </button>
      </div>

      <div class="bollard-table">
        <div class="bollard-table__head">
          <span>防恐柱名称</span>
          <span>门禁卡口</span>
          <span>状态</span>
        </div>

        <button
          v-for="item in bollardPagedItems"
          :key="item.id"
          type="button"
          class="bollard-table__row"
          @click="handleRowClick(item)"
        >
          <span class="bollard-table__name">{{ item.name }}</span>
          <span class="bollard-table__zone">{{ item.zone }}</span>
          <span class="bollard-table__status" :class="statusClass(item.status)">{{
            item.status
          }}</span>
        </button>
      </div>

      <div class="bollard-list__pagination">
        <button
          type="button"
          class="page-btn"
          :disabled="bollardCurrentPage <= 1"
          @click="goToBollardPage(bollardCurrentPage - 1)"
        >
          ‹
        </button>
        <button
          v-for="page in bollardVisiblePages"
          :key="page"
          type="button"
          class="page-btn"
          :class="{ 'page-btn--active': bollardCurrentPage === page }"
          @click="goToBollardPage(page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          class="page-btn"
          :disabled="bollardCurrentPage >= bollardTotalPages"
          @click="goToBollardPage(bollardCurrentPage + 1)"
        >
          ›
        </button>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.bollard-list__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.bollard-list__heading {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-strong);
  white-space: nowrap;
}

.bollard-list__count {
  font-size: 13px;
  color: var(--map-device-offline);
  white-space: nowrap;
}

.bollard-list__back {
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

.bollard-list__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.bollard-list__search {
  flex: 1;
  min-width: 0;
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--map-facility-btn-border);
  border-radius: 2px;
  background: rgb(0 22 48 / 75%);
  color: var(--color-text-strong);
  font-size: 13px;
  font-family: var(--font-body);
  outline: none;
}

.bollard-list__search::placeholder {
  color: #6a84a4;
}

.bollard-list__search:focus {
  border-color: rgb(0 180 255 / 70%);
}

.bollard-list__reset {
  height: 30px;
  padding: 0 12px;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  background: rgb(0 28 58 / 65%);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.bollard-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 10px;
}

.bollard-table {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: auto;
  padding-right: 2px;
}

.bollard-table__head,
.bollard-table__row {
  width: 100%;
  font-family: var(--font-body);
  cursor: pointer;
  border: 1px solid rgb(0 130 210 / 18%);
  background: rgb(0 24 50 / 45%);
  border-radius: 2px;
  padding: 10px;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 0.6fr;
  align-items: center;
  gap: 8px;
  text-align: left;
}

.bollard-table__head {
  padding: 0 10px 4px;
  font-size: 12px;
  color: var(--map-device-offline);
}

.bollard-table__row {
  padding: 10px;
  color: var(--color-text-strong);
}

.bollard-table__name {
  font-size: 14px;
  font-weight: 500;
}

.bollard-table__zone {
  font-size: 12px;
  color: #c8d8ec;
}

.bollard-table__status {
  font-size: 13px;
  font-weight: 600;
}

.bollard-table__status--normal {
  color: var(--color-success);
}

.bollard-table__status--offline {
  color: var(--map-device-offline);
}

.bollard-table__status--fault {
  color: var(--color-warning);
}

.bollard-list__pagination {
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
