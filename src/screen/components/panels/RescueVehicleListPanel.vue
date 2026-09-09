<script setup lang="ts">
import { computed } from 'vue';
import PanelCard from '../common/PanelCard.vue';
import {
  closeRescueVehicleView,
  goToRescueVehiclePage,
  rescueVehicleCurrentPage,
  rescueVehiclePagedItems,
  rescueVehiclePlateKeyword,
  rescueVehicleSquadronFilter,
  rescueVehicleSquadrons,
  rescueVehicleTotalCount,
  rescueVehicleTotalPages,
  rescueVehicleTypeFilter,
  rescueVehicleTypes,
  resetRescueVehicleSearch,
  searchRescueVehicle,
  selectRescueVehicle,
  selectedRescueVehicleId,
  statusBadgeClass,
} from '../../lib/composables/useRescueVehicleView';

const visiblePages = computed(() => {
  const pages: number[] = [];
  for (let i = 1; i <= rescueVehicleTotalPages.value; i += 1) pages.push(i);
  return pages;
});

function handleSelect(id: number) {
  selectRescueVehicle(id);
}
</script>

<template>
  <PanelCard title="" variant="rescue" :show-more="false">
    <template #title>
      <div class="vehicle-list__title">
        <h3 class="vehicle-list__heading">救援车辆列表</h3>
        <span class="vehicle-list__count">共 {{ rescueVehicleTotalCount }} 辆</span>
      </div>
    </template>

    <template #header-extra>
      <button type="button" class="vehicle-list__close" @click="closeRescueVehicleView">×</button>
    </template>

    <div class="vehicle-list">
      <div class="vehicle-list__toolbar">
        <input
          v-model="rescueVehiclePlateKeyword"
          class="vehicle-list__input"
          type="text"
          placeholder="车牌号"
        />
        <select v-model="rescueVehicleTypeFilter" class="vehicle-list__select">
          <option value="全部类型">车辆类型</option>
          <option
            v-for="type in rescueVehicleTypes.filter((item) => item !== '全部类型')"
            :key="type"
            :value="type"
          >
            {{ type }}
          </option>
        </select>
        <select v-model="rescueVehicleSquadronFilter" class="vehicle-list__select">
          <option value="全部中队">中队</option>
          <option
            v-for="s in rescueVehicleSquadrons.filter((item) => item !== '全部中队')"
            :key="s"
            :value="s"
          >
            {{ s }}
          </option>
        </select>
        <button
          type="button"
          class="vehicle-list__btn vehicle-list__btn--primary"
          @click="searchRescueVehicle"
        >
          检索
        </button>
        <button type="button" class="vehicle-list__btn" @click="resetRescueVehicleSearch">
          重置
        </button>
      </div>

      <div class="vehicle-table">
        <div class="vehicle-table__head">
          <span>车牌号</span>
          <span>车辆类型</span>
          <span>所属中队</span>
          <span>负责人</span>
        </div>
        <button
          v-for="item in rescueVehiclePagedItems"
          :key="item.id"
          type="button"
          class="vehicle-table__row"
          :class="{ 'vehicle-table__row--active': selectedRescueVehicleId === item.id }"
          @click="handleSelect(item.id)"
        >
          <div class="vehicle-table__plate">
            <span class="vehicle-table__plate-no">{{ item.plate }}</span>
            <span class="vehicle-status" :class="statusBadgeClass(item.status)">
              {{ item.status }}
            </span>
          </div>
          <span class="vehicle-table__type">{{ item.type }}</span>
          <span class="vehicle-table__squad">{{ item.squadron }}</span>
          <span class="vehicle-table__leader">
            {{ item.leaderName }}
            <em>{{ item.leaderPhone }}</em>
          </span>
        </button>
      </div>

      <div class="vehicle-list__pagination">
        <button
          type="button"
          class="page-btn"
          :disabled="rescueVehicleCurrentPage <= 1"
          @click="goToRescueVehiclePage(rescueVehicleCurrentPage - 1)"
        >
          ‹
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          class="page-btn"
          :class="{ 'page-btn--active': rescueVehicleCurrentPage === page }"
          @click="goToRescueVehiclePage(page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          class="page-btn"
          :disabled="rescueVehicleCurrentPage >= rescueVehicleTotalPages"
          @click="goToRescueVehiclePage(rescueVehicleCurrentPage + 1)"
        >
          ›
        </button>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.vehicle-list__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.vehicle-list__heading {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-strong);
  white-space: nowrap;
}

.vehicle-list__count {
  font-size: 13px;
  color: var(--map-device-offline);
  white-space: nowrap;
}

.vehicle-list__close {
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  background: rgb(0 28 58 / 65%);
  color: #c8d8ec;
  font-size: 18px;
  line-height: 1;
  font-family: var(--font-body);
  cursor: pointer;
}

.vehicle-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 10px;
}

.vehicle-list__toolbar {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto auto;
  gap: 6px;
  flex-shrink: 0;
}

.vehicle-list__input,
.vehicle-list__select {
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

.vehicle-list__select {
  appearance: none;
}

.vehicle-list__btn {
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

.vehicle-list__btn--primary {
  color: var(--color-text-strong);
  border-color: var(--border-glow);
  background: rgb(0 90 160 / 45%);
}

.vehicle-table {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgb(0 160 255 / 45%) rgb(0 25 55 / 50%);
}

.vehicle-table::-webkit-scrollbar {
  width: 4px;
}

.vehicle-table::-webkit-scrollbar-track {
  background: rgb(0 25 55 / 50%);
  border-radius: 2px;
}

.vehicle-table::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgb(0 180 255 / 55%), rgb(0 120 200 / 45%));
  border-radius: 2px;
}

.vehicle-table__head,
.vehicle-table__row {
  display: grid;
  grid-template-columns: 1.1fr 1fr 1fr 1.15fr;
  align-items: center;
  gap: 6px;
  text-align: left;
}

.vehicle-table__head {
  padding: 0 8px 4px;
  font-size: 12px;
  color: var(--map-device-offline);
  flex-shrink: 0;
}

.vehicle-table__row {
  width: 100%;
  padding: 8px;
  border: 1px solid rgb(0 130 210 / 18%);
  border-radius: 2px;
  background: rgb(0 24 50 / 45%);
  color: var(--color-text-strong);
  flex-shrink: 0;
  font-family: var(--font-body);
  cursor: pointer;
  text-align: left;
}

.vehicle-table__row--active {
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 55 100 / 45%);
}

.vehicle-table__plate {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
}

.vehicle-table__plate-no {
  font-size: 13px;
  white-space: nowrap;
}

.vehicle-status {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  border-radius: 2px;
  font-size: 11px;
  line-height: 1;
  white-space: nowrap;
}

.vehicle-status--dispatch {
  color: #7ec8ff;
  background: rgb(0 120 220 / 35%);
  border: 1px solid rgb(0 160 255 / 45%);
}

.vehicle-status--idle {
  color: var(--color-success);
  background: rgb(0 160 80 / 28%);
  border: 1px solid rgb(0 200 100 / 40%);
}

.vehicle-status--repair {
  color: var(--color-warning);
  background: rgb(200 120 0 / 28%);
  border: 1px solid rgb(255 160 0 / 45%);
}

.vehicle-table__type,
.vehicle-table__squad {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vehicle-table__leader {
  font-size: 12px;
  color: #c8d8ec;
  line-height: 1.35;
  min-width: 0;
}

.vehicle-table__leader em {
  display: block;
  margin-top: 2px;
  font-style: normal;
  color: var(--map-device-offline);
}

.vehicle-list__pagination {
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
