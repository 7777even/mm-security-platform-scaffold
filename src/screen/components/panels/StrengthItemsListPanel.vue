<script setup lang="ts">
import { computed } from 'vue';
import PanelCard from '../common/PanelCard.vue';
import {
  closeRescueStrengthView,
  goToRescueStrengthPage,
  rescueStrengthCategory,
  rescueStrengthCurrentPage,
  rescueStrengthPagedItems,
  rescueStrengthTotal,
  rescueStrengthTotalPages,
  selectedRescueStrengthIndex,
  selectRescueStrength,
} from '../../lib/composables/useRescueStrengthView';

const visiblePages = computed(() => {
  const pages: number[] = [];
  for (let i = 1; i <= rescueStrengthTotalPages.value; i += 1) pages.push(i);
  return pages;
});

function handleSelect(index: number) {
  selectRescueStrength(index);
}
</script>

<template>
  <PanelCard title="" variant="rescue" :show-more="false">
    <template #title>
      <div class="strength-list__title">
        <h3 class="strength-list__heading">{{ rescueStrengthCategory }}</h3>
        <span class="strength-list__count">共 {{ rescueStrengthTotal }} 项</span>
      </div>
    </template>

    <template #header-extra>
      <button type="button" class="strength-list__close" @click="closeRescueStrengthView">×</button>
    </template>

    <div class="strength-list">
      <div v-if="rescueStrengthPagedItems.length === 0" class="strength-list__empty">
        该类别为统计口径，暂无逐项明细台账。
      </div>

      <div v-else class="strength-table">
        <div class="strength-table__head">
          <span>名称</span>
          <span>说明</span>
        </div>
        <button
          v-for="{ item, index } in rescueStrengthPagedItems"
          :key="index"
          type="button"
          class="strength-table__row"
          :class="{ 'strength-table__row--active': selectedRescueStrengthIndex === index }"
          @click="handleSelect(index)"
        >
          <span class="strength-table__name">{{ item.name }}</span>
          <span class="strength-table__meta">{{ item.meta ?? '—' }}</span>
        </button>
      </div>

      <div v-if="rescueStrengthTotalPages > 1" class="strength-list__pagination">
        <button
          type="button"
          class="page-btn"
          :disabled="rescueStrengthCurrentPage <= 1"
          @click="goToRescueStrengthPage(rescueStrengthCurrentPage - 1)"
        >
          ‹
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          class="page-btn"
          :class="{ 'page-btn--active': rescueStrengthCurrentPage === page }"
          @click="goToRescueStrengthPage(page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          class="page-btn"
          :disabled="rescueStrengthCurrentPage >= rescueStrengthTotalPages"
          @click="goToRescueStrengthPage(rescueStrengthCurrentPage + 1)"
        >
          ›
        </button>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.strength-list__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.strength-list__heading {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-strong);
  white-space: nowrap;
}

.strength-list__count {
  font-size: 13px;
  color: var(--map-device-offline);
  white-space: nowrap;
}

.strength-list__close {
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

.strength-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 10px;
}

.strength-list__empty {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  text-align: center;
  font-size: 13px;
  color: var(--map-device-offline);
}

.strength-table {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.strength-table__head,
.strength-table__row {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  align-items: center;
  gap: 6px;
  text-align: left;
}

.strength-table__head {
  padding: 0 8px 4px;
  font-size: 12px;
  color: var(--map-device-offline);
  flex-shrink: 0;
}

.strength-table__row {
  width: 100%;
  padding: 8px;
  border: 1px solid rgb(0 130 210 / 18%);
  border-radius: 2px;
  background: rgb(0 24 50 / 45%);
  color: var(--color-text-strong);
  font-family: var(--font-body);
  cursor: pointer;
  flex-shrink: 0;
}

.strength-table__row--active {
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 55 100 / 45%);
  box-shadow: inset 0 0 10px rgb(0 170 255 / 8%);
}

.strength-table__name,
.strength-table__meta {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.strength-table__meta {
  color: var(--map-device-offline);
}

.strength-list__pagination {
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
