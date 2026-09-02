<script setup lang="ts">
import { useRouter } from 'vue-router';
import PanelCard from '../../common/PanelCard.vue';
import OverviewGridItem from '../../common/OverviewGridItem.vue';
import { facilityItems } from '../../../lib/data/productionMock';
import { usePlantArea } from '../../../lib/composables/usePlantArea';

const router = useRouter();
const { scaleAreaCount } = usePlantArea();

/** 重大危险源卡片 id，与 productionMock.facilityItems 保持一致 */
const MAJOR_HAZARD_FACILITY_ID = 4;

function openFacility(facilityId: number) {
  if (facilityId === MAJOR_HAZARD_FACILITY_ID) {
    void router.push({ name: 'majorHazardList' });
    return;
  }
  void router.push({ name: 'productionArea', params: { facilityId: String(facilityId) } });
}
</script>

<template>
  <PanelCard title="生产设施总览" variant="facilities" module="production">
    <div class="overview-grid">
      <button
        v-for="item in facilityItems"
        :key="item.id"
        type="button"
        class="overview-grid__btn"
        @click="openFacility(item.id)"
      >
        <OverviewGridItem
          :image="item.image"
          :name="item.name"
          :count="scaleAreaCount(item.count)"
        />
      </button>
    </div>
  </PanelCard>
</template>

<style scoped>
:deep(.panel-card__content) {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 8px 12px 12px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 70px);
  gap: 12px;
  align-content: start;
}

.overview-grid__btn {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.overview-grid__btn:hover :deep(.overview-item) {
  border-color: rgb(0 180 255 / 50%);
  background: rgb(0 35 70 / 55%);
}
</style>
