<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import ProductionAlarmCard from '../../common/ProductionAlarmCard.vue';
import type { ProductionAlarmItem } from '@/services/production';
import { fetchAlarmPage } from '@/services/alarm';
import { toProductionAlarmItem } from '../../../lib/adapters/alarmAdapter';
import { usePlantArea } from '../../../lib/composables/usePlantArea';

const { filterByPlantArea } = usePlantArea();
const realAlarms = ref<ProductionAlarmItem[]>([]);
const visibleProductionAlarms = computed(() => filterByPlantArea(realAlarms.value));

onMounted(async () => {
  try {
    const page = await fetchAlarmPage(1, 20);
    realAlarms.value = page.list.map((alarm, i) => toProductionAlarmItem(alarm, i));
  } catch {
    // 暴露式降级：后端不可用时保持空列表，不静默回落硬编码假数据
    realAlarms.value = [];
  }
});
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
