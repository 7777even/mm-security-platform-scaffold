<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import ProductionAlarmCard from '../../common/ProductionAlarmCard.vue';
import { fetchProductionAlarms, type ProductionAlarmItem } from '@/services/production';
import { usePlantArea } from '../../../lib/composables/usePlantArea';

const { filterByPlantArea } = usePlantArea();
const realAlarms = ref<ProductionAlarmItem[]>([]);
const visibleProductionAlarms = computed(() => filterByPlantArea(realAlarms.value));

onMounted(async () => {
  try {
    // 同源修正：生产区域安全告警走生产域专属端点 /production/alarms（fac_production_alarm），
    // 不再误用通用报警 /alarms（fac_alarm）——两者本是不同表、不同业务。
    realAlarms.value = await fetchProductionAlarms();
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
}
</style>
