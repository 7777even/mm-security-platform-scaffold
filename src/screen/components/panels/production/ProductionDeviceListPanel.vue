<script setup lang="ts">
import { computed } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import {
  productionDeviceStatusOptions,
  resolveDeviceCategoryTitle,
  statusTone,
  type ProductionDeviceStatus,
} from '../../../lib/data/productionDeviceMock';
import {
  applyProductionDeviceSearch,
  closeProductionDeviceList,
  goToProductionDevicePage,
  productionDeviceCategory,
  productionDeviceCurrentPage,
  productionDeviceFilteredItems,
  productionDeviceNameFilter,
  productionDevicePagedItems,
  productionDeviceStatusFilter,
  productionDeviceTotalPages,
  productionDeviceTypeFilter,
  productionDeviceTypeOptions,
  productionDeviceVisiblePages,
  resetProductionDeviceSearch,
} from '../../../lib/composables/useProductionDeviceListView';

const title = computed(() => resolveDeviceCategoryTitle(productionDeviceCategory.value));

function statusClass(status: ProductionDeviceStatus) {
  return `device-table__status--${statusTone(status)}`;
}
</script>

<template>
  <PanelCard title="" variant="devices" module="production" :show-more="false">
    <template #title>
      <div class="device-list__title">
        <h3 class="device-list__heading">{{ title }}</h3>
        <span class="device-list__count">共 {{ productionDeviceFilteredItems.length }} 个</span>
      </div>
    </template>

    <template #header-extra>
      <button type="button" class="device-list__back" @click="closeProductionDeviceList">
        返回
      </button>
    </template>

    <div class="device-list">
      <div class="device-list__filters">
        <input
          v-model="productionDeviceNameFilter"
          class="device-list__input"
          type="text"
          placeholder="名称"
        />
        <select v-model="productionDeviceTypeFilter" class="device-list__select">
          <option v-for="opt in productionDeviceTypeOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
        <select v-model="productionDeviceStatusFilter" class="device-list__select">
          <option v-for="opt in productionDeviceStatusOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
        <button type="button" class="device-list__btn" @click="applyProductionDeviceSearch">
          检索
        </button>
        <button
          type="button"
          class="device-list__btn device-list__btn--ghost"
          @click="resetProductionDeviceSearch"
        >
          重置
        </button>
      </div>

      <div class="device-table">
        <div class="device-table__head">
          <span>设备名称</span>
          <span>类型</span>
          <span>所属区域</span>
          <span>状态</span>
        </div>

        <div v-for="item in productionDevicePagedItems" :key="item.id" class="device-table__row">
          <span class="device-table__name" :title="item.name">{{ item.name }}</span>
          <span class="device-table__type" :title="item.type">{{ item.type }}</span>
          <span>{{ item.area }}</span>
          <span class="device-table__status" :class="statusClass(item.status)">{{
            item.status
          }}</span>
        </div>

        <div v-if="!productionDevicePagedItems.length" class="device-table__empty">
          暂无匹配数据
        </div>
      </div>

      <div class="device-list__pagination">
        <button
          type="button"
          class="page-btn"
          :disabled="productionDeviceCurrentPage <= 1"
          @click="goToProductionDevicePage(productionDeviceCurrentPage - 1)"
        >
          ‹
        </button>
        <button
          v-for="page in productionDeviceVisiblePages"
          :key="page"
          type="button"
          class="page-btn"
          :class="{ 'page-btn--active': productionDeviceCurrentPage === page }"
          @click="goToProductionDevicePage(page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          class="page-btn"
          :disabled="productionDeviceCurrentPage >= productionDeviceTotalPages"
          @click="goToProductionDevicePage(productionDeviceCurrentPage + 1)"
        >
          ›
        </button>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.device-list__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.device-list__heading {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-list__count {
  font-size: 13px;
  color: #8aa4c4;
  flex-shrink: 0;
}

.device-list__back {
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

.device-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 10px;
}

.device-list__filters {
  display: grid;
  grid-template-columns: 1.2fr 1fr 0.9fr auto auto;
  gap: 6px;
  flex-shrink: 0;
}

.device-list__input,
.device-list__select {
  height: 30px;
  padding: 0 8px;
  border: 1px solid rgb(0 120 200 / 30%);
  border-radius: 2px;
  background: rgb(0 22 48 / 70%);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  outline: none;
  min-width: 0;
}

.device-list__input::placeholder {
  color: #6a829e;
}

.device-list__btn {
  height: 30px;
  padding: 0 10px;
  border: 1px solid rgb(0 160 255 / 45%);
  border-radius: 2px;
  background: rgb(0 90 160 / 55%);
  color: #e8f4ff;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.device-list__btn--ghost {
  border-color: rgb(0 120 200 / 30%);
  background: rgb(0 28 58 / 55%);
  color: #8aa4c4;
}

.device-table {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgb(0 160 255 / 45%) rgb(0 25 55 / 50%);
}

.device-table__head,
.device-table__row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 0.8fr 0.6fr;
  gap: 6px;
  align-items: center;
  padding: 0 8px;
  box-sizing: border-box;
}

.device-table__head {
  height: 32px;
  flex-shrink: 0;
  font-size: 12px;
  color: #8aa4c4;
  background: rgb(0 40 78 / 45%);
  border: 1px solid rgb(0 120 200 / 20%);
  border-radius: 2px;
}

.device-table__row {
  min-height: 40px;
  border: 1px solid rgb(0 100 180 / 16%);
  border-radius: 2px;
  background: rgb(0 24 50 / 40%);
  color: #e8f2fc;
  font-size: 12px;
}

.device-table__name,
.device-table__type {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-table__status--ok {
  color: #3ecf8e;
}

.device-table__status--offline {
  color: #8aa4c4;
}

.device-table__status--fault {
  color: #ff6b5a;
}

.device-table__empty {
  padding: 24px 0;
  text-align: center;
  color: #8aa4c4;
  font-size: 13px;
}

.device-list__pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  padding-top: 2px;
}

.page-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border: 1px solid rgb(0 120 200 / 28%);
  border-radius: 2px;
  background: rgb(0 22 48 / 55%);
  color: #8aa4c4;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.page-btn--active {
  color: #fff;
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 50%);
}
</style>
