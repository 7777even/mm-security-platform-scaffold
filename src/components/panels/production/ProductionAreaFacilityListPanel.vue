<script setup lang="ts">
import { computed } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import { useProductionAreaInteraction } from '@/composables/useProductionAreaInteraction';
import { resolveFacilityItem } from '@/services/map-data/productionAreaMock';
import type { ProductionAreaMetric } from '@/services/map-data/productionAreaMock';

const props = defineProps<{
  facilityId: string;
  metrics: ProductionAreaMetric[];
}>();

const ia = useProductionAreaInteraction();
const sorted = computed(() => [...props.metrics]);
const facility = computed(() => resolveFacilityItem(props.facilityId));

function openDetail(): void {
  ia.openFacilityDetail(props.facilityId);
}
</script>

<template>
  <PanelCard
    title="生产区设备分类"
    icon="gas"
    variant="devices"
    module="production"
    :show-more="false"
  >
    <div class="area-facility">
      <button type="button" class="area-facility__facility" @click="openDetail">
        <span class="area-facility__facility-name">{{ facility.name }}</span>
        <span class="area-facility__facility-hint">查看设施详情 ›</span>
      </button>

      <div class="area-facility__head">
        <span>类别</span>
        <span>数量</span>
      </div>

      <div class="area-facility__list">
        <button
          v-for="item in sorted"
          :key="item.id"
          type="button"
          class="area-facility__row"
          @click="openDetail"
        >
          <span class="area-facility__name" :title="item.label">{{ item.label }}</span>
          <span class="area-facility__count">{{ item.value }}</span>
        </button>
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

.area-facility__facility {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 38px;
  padding: 0 12px;
  border-radius: 2px;
  border: 1px solid rgb(0 100 180 / 22%);
  background: rgb(0 28 58 / 55%);
  color: #e8f4ff;
  font-family: var(--font-body);
  cursor: pointer;
  text-align: left;
}

.area-facility__facility:hover {
  border-color: rgba(0 190 255 / 65%);
  background: rgb(0 40 78 / 70%);
}

.area-facility__facility-name {
  font-size: 13px;
  font-weight: 600;
}

.area-facility__facility-hint {
  font-size: 12px;
  color: var(--color-accent, #00b4ff);
  white-space: nowrap;
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
  color: #8aa4c4;
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
