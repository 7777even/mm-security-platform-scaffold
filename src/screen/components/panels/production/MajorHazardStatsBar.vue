<script setup lang="ts">
import { computed, onMounted } from 'vue';
import {
  majorHazardsData,
  refreshMajorHazards,
} from '../../../lib/composables/useScreenHazardData';
import { usePlantArea } from '../../../lib/composables/usePlantArea';

const { filterByPlantArea } = usePlantArea();
const visibleHazards = computed(() => filterByPlantArea(majorHazardsData.value));

onMounted(() => void refreshMajorHazards());
const levels = computed(() => [
  {
    key: '一级',
    label: '一级',
    value: visibleHazards.value.filter((item) => item.level === '一级').length,
    tone: 'l1',
  },
  {
    key: '二级',
    label: '二级',
    value: visibleHazards.value.filter((item) => item.level === '二级').length,
    tone: 'l2',
  },
  {
    key: '三级',
    label: '三级',
    value: visibleHazards.value.filter((item) => item.level === '三级').length,
    tone: 'l3',
  },
  {
    key: '四级',
    label: '四级',
    value: visibleHazards.value.filter((item) => item.level === '四级').length,
    tone: 'l4',
  },
]);
</script>

<template>
  <aside class="hazard-stats">
    <div class="hazard-stats__title">
      <div class="hazard-stats__heading">重大危险源管理</div>
      <div class="hazard-stats__sub">MAJOR HAZARD SOURCES</div>
    </div>

    <div class="hazard-stats__total">
      <span class="hazard-stats__total-label">全部重大危险源</span>
      <span class="hazard-stats__total-value">{{ visibleHazards.length }}</span>
    </div>

    <div
      v-for="item in levels"
      :key="item.key"
      class="hazard-stats__item"
      :class="`hazard-stats__item--${item.tone}`"
    >
      <span class="hazard-stats__item-label">{{ item.label }}</span>
      <span class="hazard-stats__item-value">{{ item.value }}</span>
    </div>
  </aside>
</template>

<style scoped>
.hazard-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 220px;
  pointer-events: auto;
}

.hazard-stats__title {
  margin-bottom: 6px;
}

.hazard-stats__heading {
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-strong);
  line-height: 1.2;
}

.hazard-stats__sub {
  margin-top: 4px;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: rgb(138 164 196 / 85%);
}

.hazard-stats__total,
.hazard-stats__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 14px;
  border: 1px solid rgb(0 130 210 / 28%);
  border-radius: 2px;
  background: rgb(0 20 45 / 62%);
}

.hazard-stats__total-label,
.hazard-stats__item-label {
  font-size: 13px;
  color: var(--map-device-offline);
}

.hazard-stats__total-value {
  font-size: 24px;
  font-weight: 700;
  color: #7cdbff;
  font-variant-numeric: tabular-nums;
}

.hazard-stats__item-value {
  font-size: 22px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.hazard-stats__item--l1 {
  border-left: 3px solid var(--color-danger);
}

.hazard-stats__item--l1 .hazard-stats__item-value {
  color: var(--color-danger);
}

.hazard-stats__item--l2 {
  border-left: 3px solid var(--color-alarm-2);
}

.hazard-stats__item--l2 .hazard-stats__item-value {
  color: var(--color-alarm-2);
}

.hazard-stats__item--l3 {
  border-left: 3px solid var(--color-alarm-3);
}

.hazard-stats__item--l3 .hazard-stats__item-value {
  color: var(--color-alarm-3);
}

.hazard-stats__item--l4 {
  border-left: 3px solid #4db8ff;
}

.hazard-stats__item--l4 .hazard-stats__item-value {
  color: #4db8ff;
}
</style>
