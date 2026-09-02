<script setup lang="ts">
import PanelCard from '../../common/PanelCard.vue';
import ProductionAlarmCard from '../../common/ProductionAlarmCard.vue';
import { productionAlarms } from '../../../lib/data/productionMock';
import { usePlantArea } from '../../../lib/composables/usePlantArea';

const { areaScopedItems } = usePlantArea();
const visibleProductionAlarms = areaScopedItems(productionAlarms);
</script>

<template>
  <PanelCard title="生产区域安全告警" variant="alarm" module="production" :show-more="false">
    <div class="alarm-list">
      <ProductionAlarmCard
        v-for="alarm in visibleProductionAlarms"
        :key="alarm.id"
        :alarm="alarm"
      />
    </div>
  </PanelCard>
</template>

<style scoped>
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
