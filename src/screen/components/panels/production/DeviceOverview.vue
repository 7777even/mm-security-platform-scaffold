<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import PanelCard from '../../common/PanelCard.vue';
import OverviewGridItem from '../../common/OverviewGridItem.vue';
import {
  fetchProductionOverview,
  type OverviewGridItem as OverviewGridItemType,
  type ProductionDeviceCategory,
} from '@/services/production';
import { openProductionDeviceList } from '../../../lib/composables/useProductionDeviceListView';
import { usePlantArea } from '../../../lib/composables/usePlantArea';

const router = useRouter();
const { scaleAreaCount } = usePlantArea();

const deviceItems = ref<OverviewGridItemType[]>([]);

onMounted(async () => {
  try {
    const overview = await fetchProductionOverview();
    deviceItems.value = overview.devices;
  } catch {
    deviceItems.value = [];
  }
});

function openDevice(item: OverviewGridItemType) {
  if (item.name === '广播') {
    void router.push({ name: 'productionCommunication', query: { tab: 'broadcast' } });
    return;
  }
  if (item.name === '电话') {
    void router.push({ name: 'productionCommunication', query: { tab: 'phone' } });
    return;
  }
  openProductionDeviceList(item.name as ProductionDeviceCategory);
}
</script>

<template>
  <PanelCard title="设备总览" variant="devices" module="production">
    <div class="overview-grid">
      <button
        v-for="item in deviceItems"
        :key="item.id"
        type="button"
        class="overview-grid__btn"
        @click="openDevice(item)"
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
  grid-template-rows: repeat(4, 70px);
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
