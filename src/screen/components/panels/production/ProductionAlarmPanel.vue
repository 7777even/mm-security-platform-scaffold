<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import ProductionAlarmCard from '../../common/ProductionAlarmCard.vue';
import {
  fetchProductionAlarms,
  productionAlarmChanged,
  type ProductionAlarmItem,
} from '@/services/production';
import { subscribeDomainChange } from '@/services/realtime';
import { usePlantArea } from '../../../lib/composables/usePlantArea';

const { filterByPlantArea } = usePlantArea();
const realAlarms = ref<ProductionAlarmItem[]>([]);
const visibleProductionAlarms = computed(() => filterByPlantArea(realAlarms.value));

async function loadAlarms() {
  try {
    // 同源修正：生产区域安全告警走生产域专属端点 /production/alarms（fac_production_alarm），
    // 不再误用通用报警 /alarms（fac_alarm）——两者本是不同表、不同业务。
    realAlarms.value = await fetchProductionAlarms();
  } catch {
    // 暴露式降级：后端不可用时保持空列表，不静默回落硬编码假数据
    realAlarms.value = [];
  }
}

let unsubscribeProduction: (() => void) | undefined;

onMounted(async () => {
  await loadAlarms();
  // 后端 @RealtimeSync(production.alarm) 广播 + 详情面板写回后的本地信号，均触发列表重载
  unsubscribeProduction = subscribeDomainChange('production.alarm', () => {
    void loadAlarms();
  });
});

onUnmounted(() => {
  unsubscribeProduction?.();
});

watch(productionAlarmChanged, () => {
  void loadAlarms();
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
