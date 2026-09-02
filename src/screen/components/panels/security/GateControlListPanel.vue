<script setup lang="ts">
import PanelCard from '../../common/PanelCard.vue';
import { gateControls, type GateControlItem } from '../../../lib/data/securityGateControlMock';
import {
  closeGateControlList,
  gateControlCurrentPage,
  gateControlPagedItems,
  gateControlSearchKeyword,
  gateControlTotalPages,
  gateControlVisiblePages,
  goToGateControlPage,
  resetGateControlSearch,
} from '../../../lib/composables/useGateControlListView';
import { openGateControlDetail } from '../../../lib/composables/useGateControlDetailDialog';

function statusClass(status: GateControlItem['status']) {
  if (status === '正常') return 'gate-table__status--normal';
  if (status === '离线') return 'gate-table__status--offline';
  return 'gate-table__status--fault';
}

function handleRowClick(item: GateControlItem) {
  openGateControlDetail(item.id);
}
</script>

<template>
  <PanelCard title="" variant="rescue" :show-more="false">
    <template #title>
      <div class="gate-list__title">
        <h3 class="gate-list__heading">道闸列表</h3>
        <span class="gate-list__count">共 {{ gateControls.length }} 个</span>
      </div>
    </template>

    <template #header-extra>
      <button type="button" class="gate-list__back" @click="closeGateControlList">返回</button>
    </template>

    <div class="gate-list">
      <div class="gate-list__toolbar">
        <input
          v-model="gateControlSearchKeyword"
          type="text"
          class="gate-list__search"
          placeholder="请输入道闸名称 / 卡口"
        />
        <button
          v-if="gateControlSearchKeyword"
          type="button"
          class="gate-list__reset"
          @click="resetGateControlSearch"
        >
          重置
        </button>
      </div>

      <div class="gate-table">
        <div class="gate-table__head">
          <span>道闸名称</span>
          <span>卡口</span>
          <span>状态</span>
        </div>

        <button
          v-for="item in gateControlPagedItems"
          :key="item.id"
          type="button"
          class="gate-table__row"
          @click="handleRowClick(item)"
        >
          <span class="gate-table__name">{{ item.name }}</span>
          <span class="gate-table__zone">{{ item.location }}</span>
          <span class="gate-table__status" :class="statusClass(item.status)">{{
            item.status
          }}</span>
        </button>
      </div>

      <div class="gate-list__pagination">
        <button
          type="button"
          class="page-btn"
          :disabled="gateControlCurrentPage <= 1"
          @click="goToGateControlPage(gateControlCurrentPage - 1)"
        >
          ‹
        </button>
        <button
          v-for="page in gateControlVisiblePages"
          :key="page"
          type="button"
          class="page-btn"
          :class="{ 'page-btn--active': gateControlCurrentPage === page }"
          @click="goToGateControlPage(page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          class="page-btn"
          :disabled="gateControlCurrentPage >= gateControlTotalPages"
          @click="goToGateControlPage(gateControlCurrentPage + 1)"
        >
          ›
        </button>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.gate-list__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.gate-list__heading {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
}

.gate-list__count {
  font-size: 13px;
  color: #8aa4c4;
  white-space: nowrap;
}

.gate-list__back {
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

.gate-list__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.gate-list__search {
  flex: 1;
  min-width: 0;
  height: 30px;
  padding: 0 10px;
  border: 1px solid rgb(0 110 190 / 38%);
  border-radius: 2px;
  background: rgb(0 22 48 / 75%);
  color: #fff;
  font-size: 13px;
  font-family: var(--font-body);
  outline: none;
}

.gate-list__search::placeholder {
  color: #6a84a4;
}

.gate-list__search:focus {
  border-color: rgb(0 180 255 / 70%);
}

.gate-list__reset {
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

.gate-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 10px;
}

.gate-table {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: auto;
  padding-right: 2px;
}

.gate-table__head,
.gate-table__row {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 0.6fr;
  align-items: center;
  gap: 8px;
  text-align: left;
}

.gate-table__head {
  padding: 0 10px 4px;
  font-size: 12px;
  color: #8aa4c4;
}

.gate-table__row {
  width: 100%;
  text-align: left;
  font-family: var(--font-body);
  cursor: pointer;
  border: 1px solid rgb(0 130 210 / 18%);
  background: rgb(0 24 50 / 45%);
  border-radius: 2px;
  padding: 10px;
  color: #fff;
}

.gate-table__name {
  font-size: 14px;
  font-weight: 500;
}

.gate-table__zone {
  font-size: 12px;
  color: #c8d8ec;
}

.gate-table__status {
  font-size: 13px;
  font-weight: 600;
}

.gate-table__status--normal {
  color: #3dd68c;
}

.gate-table__status--offline {
  color: #8aa4c4;
}

.gate-table__status--fault {
  color: #f0b429;
}

.gate-list__pagination {
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
  border: 1px solid rgb(0 120 200 / 28%);
  border-radius: 2px;
  background: rgb(0 22 48 / 65%);
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
  color: #fff;
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 55%);
}
</style>
