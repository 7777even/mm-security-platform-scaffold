<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
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

/* 通讯类设备：归属独立「通讯通知」域、数据源不同、点击跳转而非就地展开。
   同时作为「分组」与「点击行为」的单一事实源，避免按 name 散落写死。 */
const COMMUNICATION_DEVICE_NAMES = ['广播', '电话'];

const productionDevices = computed(() =>
  deviceItems.value.filter((i) => !COMMUNICATION_DEVICE_NAMES.includes(i.name)),
);
const communicationDevices = computed(() =>
  deviceItems.value.filter((i) => COMMUNICATION_DEVICE_NAMES.includes(i.name)),
);

function openDevice(item: OverviewGridItemType) {
  if (COMMUNICATION_DEVICE_NAMES.includes(item.name)) {
    const tab = item.name === '广播' ? 'broadcast' : 'phone';
    void router.push({ name: 'productionCommunication', query: { tab } });
    return;
  }
  openProductionDeviceList(item.name as ProductionDeviceCategory);
}
</script>

<template>
  <PanelCard title="设备总览" variant="devices" module="production">
    <div class="device-groups">
      <section v-if="productionDevices.length" class="device-group">
        <div class="device-group__title">生产设备</div>
        <div class="overview-grid">
          <button
            v-for="item in productionDevices"
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
      </section>

      <section v-if="communicationDevices.length" class="device-group">
        <div class="device-group__title">通讯设备</div>
        <div class="overview-grid">
          <button
            v-for="item in communicationDevices"
            :key="item.id"
            type="button"
            class="overview-grid__btn overview-grid__btn--link"
            @click="openDevice(item)"
          >
            <OverviewGridItem
              :image="item.image"
              :name="item.name"
              :count="scaleAreaCount(item.count)"
            />
          </button>
        </div>
      </section>
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

.device-groups {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.device-group__title {
  flex-shrink: 0;
  margin: 2px 0 6px;
  padding-left: 2px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--color-accent);
  opacity: 0.9;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 70px;
  gap: 12px;
  align-content: start;
}

.overview-grid__btn {
  position: relative;
  height: 100%;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.overview-grid__btn :deep(.overview-item) {
  height: 100%;
}

.overview-grid__btn:hover :deep(.overview-item) {
  border-color: var(--c-0-180-255-50);
  background: var(--c-0-35-70-55);
}

/* 通讯设备点击会跳转到独立页，用角标提前暗示「前往」行为 */
.overview-grid__btn--link::after {
  content: '›';
  position: absolute;
  top: 4px;
  right: 7px;
  font-size: 15px;
  line-height: 1;
  color: var(--color-accent);
  opacity: 0.85;
}
</style>
