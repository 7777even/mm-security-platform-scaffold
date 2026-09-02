<script setup lang="ts">
import PanelCard from '../../common/PanelCard.vue';
import ProductionAlarmCard from '../../common/ProductionAlarmCard.vue';
import type { ProductionAlarmItem } from '../../../lib/data/productionMock';

defineProps<{
  alarms: ProductionAlarmItem[];
}>();
</script>

<template>
  <PanelCard title="" variant="alarm" module="production" :show-more="true">
    <template #title>
      <div class="alarm-title">
        <h3 class="alarm-title__text">生产区域安全告警</h3>
        <span v-if="alarms.length" class="alarm-title__badge">{{ alarms.length }}</span>
      </div>
    </template>
    <div class="alarm-list">
      <ProductionAlarmCard v-for="alarm in alarms" :key="alarm.id" :alarm="alarm" />
    </div>
  </PanelCard>
</template>

<style scoped>
.alarm-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.alarm-title__text {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-strong);
  white-space: nowrap;
}

.alarm-title__badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--color-alarm-3);
  color: #1a1200;
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
}

:deep(.panel-card__content) {
  padding: 6px 10px 12px;
}

.alarm-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;
  overflow-y: auto;
  padding-right: 2px;
  scrollbar-width: thin;
  scrollbar-color: rgb(0 160 255 / 45%) rgb(0 25 55 / 50%);
}

.alarm-list::-webkit-scrollbar {
  width: 4px;
}

.alarm-list::-webkit-scrollbar-track {
  background: rgb(0 25 55 / 50%);
  border-radius: 2px;
}

.alarm-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgb(0 180 255 / 55%), rgb(0 120 200 / 45%));
  border-radius: 2px;
}
</style>
