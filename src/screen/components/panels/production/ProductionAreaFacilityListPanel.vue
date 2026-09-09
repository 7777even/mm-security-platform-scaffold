<script setup lang="ts">
import { computed } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import type { ProductionAreaMetric } from '@/services/production';

const props = defineProps<{
  metrics: ProductionAreaMetric[];
}>();

const sorted = computed(() => [...props.metrics]);
</script>

<template>
  <PanelCard title="生产区设备分类" variant="devices" module="production" :show-more="false">
    <div class="area-facility">
      <div class="area-facility__head">
        <span>类别</span>
        <span>数量</span>
      </div>

      <div class="area-facility__list">
        <div v-for="item in sorted" :key="item.id" class="area-facility__row">
          <span class="area-facility__name" :title="item.label">{{ item.label }}</span>
          <span class="area-facility__count">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.area-facility {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 6px;
}

.area-facility__head,
.area-facility__row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 0 10px;
  box-sizing: border-box;
}

.area-facility__head {
  height: 30px;
  flex-shrink: 0;
  border: 1px solid rgb(0 120 200 / 20%);
  border-radius: 2px;
  background: rgb(0 40 78 / 45%);
  color: var(--map-device-offline);
  font-size: 12px;
}

.area-facility__list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgb(0 160 255 / 45%) rgb(0 25 55 / 50%);
}

.area-facility__row {
  min-height: 34px;
  border: 1px solid rgb(0 100 180 / 16%);
  border-radius: 2px;
  background: rgb(0 24 50 / 40%);
  color: #e8f2fc;
  font-size: 12px;
}

.area-facility__name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.area-facility__count {
  color: #4db8ff;
  font-variant-numeric: tabular-nums;
}
</style>
