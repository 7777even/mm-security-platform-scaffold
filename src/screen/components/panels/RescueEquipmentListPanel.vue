<script setup lang="ts">
import { computed } from 'vue';
import PanelCard from '../common/PanelCard.vue';
import {
  rescueEquipmentSquadrons,
  rescueEquipmentTotalSets,
} from '../../lib/data/rescueEquipmentMock';
import {
  closeRescueEquipmentView,
  goToRescueEquipmentPage,
  rescueEquipmentCurrentPage,
  rescueEquipmentKeyword,
  rescueEquipmentPagedItems,
  rescueEquipmentSquadronFilter,
  rescueEquipmentTotalPages,
  resetRescueEquipmentSearch,
  searchRescueEquipment,
  selectRescueEquipment,
  selectedRescueEquipmentId,
} from '../../lib/composables/useRescueEquipmentView';

const visiblePages = computed(() => {
  const pages: number[] = [];
  for (let i = 1; i <= rescueEquipmentTotalPages.value; i += 1) pages.push(i);
  return pages;
});

function handleSelect(id: number) {
  selectRescueEquipment(id);
}
</script>

<template>
  <PanelCard title="" variant="rescue" :show-more="false">
    <template #title>
      <div class="equip-list__title">
        <h3 class="equip-list__heading">救援装备</h3>
        <span class="equip-list__count">共 {{ rescueEquipmentTotalSets }} 套</span>
      </div>
    </template>

    <template #header-extra>
      <button type="button" class="equip-list__close" @click="closeRescueEquipmentView">×</button>
    </template>

    <div class="equip-list">
      <div class="equip-list__toolbar">
        <input
          v-model="rescueEquipmentKeyword"
          class="equip-list__input"
          type="text"
          placeholder="装备名称"
        />
        <select v-model="rescueEquipmentSquadronFilter" class="equip-list__select">
          <option value="全部中队">所属中队</option>
          <option
            v-for="s in rescueEquipmentSquadrons.filter((item) => item !== '全部中队')"
            :key="s"
            :value="s"
          >
            {{ s }}
          </option>
        </select>
        <button
          type="button"
          class="equip-list__btn equip-list__btn--primary"
          @click="searchRescueEquipment"
        >
          检索
        </button>
        <button type="button" class="equip-list__btn" @click="resetRescueEquipmentSearch">
          重置
        </button>
      </div>

      <div class="equip-table">
        <div class="equip-table__head">
          <span>装备名称</span>
          <span>所属中队</span>
          <span>数量</span>
          <span>负责人</span>
        </div>
        <button
          v-for="item in rescueEquipmentPagedItems"
          :key="item.id"
          type="button"
          class="equip-table__row"
          :class="{ 'equip-table__row--active': selectedRescueEquipmentId === item.id }"
          @click="handleSelect(item.id)"
        >
          <span class="equip-table__name">{{ item.name }}</span>
          <span class="equip-table__squad">{{ item.squadron }}</span>
          <span class="equip-table__qty">{{ item.quantity }}</span>
          <span class="equip-table__leader">
            {{ item.leaderName }}
            <em>{{ item.leaderPhone }}</em>
          </span>
        </button>
      </div>

      <div class="equip-list__pagination">
        <button
          type="button"
          class="page-btn"
          :disabled="rescueEquipmentCurrentPage <= 1"
          @click="goToRescueEquipmentPage(rescueEquipmentCurrentPage - 1)"
        >
          ‹
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          class="page-btn"
          :class="{ 'page-btn--active': rescueEquipmentCurrentPage === page }"
          @click="goToRescueEquipmentPage(page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          class="page-btn"
          :disabled="rescueEquipmentCurrentPage >= rescueEquipmentTotalPages"
          @click="goToRescueEquipmentPage(rescueEquipmentCurrentPage + 1)"
        >
          ›
        </button>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.equip-list__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.equip-list__heading {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
}

.equip-list__count {
  font-size: 13px;
  color: #8aa4c4;
  white-space: nowrap;
}

.equip-list__close {
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

.equip-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 10px;
}

.equip-list__toolbar {
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  gap: 6px;
  flex-shrink: 0;
}

.equip-list__input,
.equip-list__select {
  height: 30px;
  padding: 0 8px;
  border: 1px solid rgb(0 120 200 / 28%);
  border-radius: 2px;
  background: rgb(0 22 48 / 65%);
  color: #fff;
  font-size: 12px;
  font-family: var(--font-body);
  outline: none;
  min-width: 0;
}

.equip-list__select {
  appearance: none;
}

.equip-list__btn {
  height: 30px;
  padding: 0 10px;
  border: 1px solid rgb(0 120 200 / 28%);
  border-radius: 2px;
  background: rgb(0 22 48 / 65%);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.equip-list__btn--primary {
  color: #fff;
  border-color: rgb(0 180 255 / 45%);
  background: rgb(0 90 160 / 45%);
}

.equip-table {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.equip-table__head,
.equip-table__row {
  display: grid;
  grid-template-columns: 1.1fr 1fr 0.6fr 1.2fr;
  align-items: center;
  gap: 6px;
  text-align: left;
}

.equip-table__head {
  padding: 0 8px 4px;
  font-size: 12px;
  color: #8aa4c4;
  flex-shrink: 0;
}

.equip-table__row {
  width: 100%;
  padding: 8px;
  border: 1px solid rgb(0 130 210 / 18%);
  border-radius: 2px;
  background: rgb(0 24 50 / 45%);
  color: #fff;
  font-family: var(--font-body);
  cursor: pointer;
  flex-shrink: 0;
}

.equip-table__row--active {
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 55 100 / 45%);
  box-shadow: inset 0 0 10px rgb(0 170 255 / 8%);
}

.equip-table__name,
.equip-table__squad,
.equip-table__qty,
.equip-table__leader {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.equip-table__leader em {
  display: block;
  margin-top: 2px;
  font-style: normal;
  color: #8aa4c4;
  font-size: 11px;
}

.equip-list__pagination {
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
