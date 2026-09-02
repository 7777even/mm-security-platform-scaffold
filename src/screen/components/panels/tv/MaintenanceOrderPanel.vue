<script setup lang="ts">
import PanelCard from '../../common/PanelCard.vue';
import { maintenanceOrders } from '../../../lib/data/tvMock';
import { usePlantArea } from '../../../lib/composables/usePlantArea';

const { scaleAreaCount } = usePlantArea();
</script>

<template>
  <PanelCard title="维修工单" variant="maintenance" module="tv">
    <div class="maintenance-orders">
      <div
        v-for="order in maintenanceOrders"
        :key="order.label"
        class="maintenance-orders__card"
        :class="`maintenance-orders__card--${order.tone}`"
      >
        <div class="maintenance-orders__value">{{ scaleAreaCount(order.value) }}</div>
        <div class="maintenance-orders__label">{{ order.label }}</div>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
:deep(.panel-card__content) {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 8px 10px 12px;
}

.maintenance-orders {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  height: 100%;
  align-content: center;
}

.maintenance-orders__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 72px;
  border-radius: 2px;
  border: 1px solid transparent;
  box-sizing: border-box;
}

.maintenance-orders__card--grey {
  background: linear-gradient(180deg, rgb(90 100 120 / 32%) 0%, rgb(45 52 65 / 55%) 100%);
  border-color: rgb(150 160 180 / 35%);
}

.maintenance-orders__card--blue {
  background: linear-gradient(180deg, rgb(0 110 210 / 42%) 0%, rgb(0 55 130 / 58%) 100%);
  border-color: rgb(0 150 255 / 42%);
}

.maintenance-orders__card--red {
  background: linear-gradient(180deg, rgb(210 55 45 / 42%) 0%, rgb(120 25 20 / 58%) 100%);
  border-color: rgb(255 85 65 / 42%);
}

.maintenance-orders__value {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-strong);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.maintenance-orders__label {
  margin-top: 6px;
  font-size: 13px;
  color: var(--map-popup-text-blue);
}
</style>
