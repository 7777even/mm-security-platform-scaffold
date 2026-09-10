<script setup lang="ts">
import PanelCard from '../common/PanelCard.vue';
import StatCard from '../common/StatCard.vue';
import { onMounted, ref } from 'vue';
import { fetchRescueForces, type RescueForceStat } from '@/services/fireMonitoring';
import {
  openFireBrigadeView,
  closeFireBrigadeView,
} from '../../lib/composables/useFireBrigadeView';
import {
  openRescueEquipmentView,
  closeRescueEquipmentView,
} from '../../lib/composables/useRescueEquipmentView';
import {
  openRescuePersonnelView,
  closeRescuePersonnelView,
} from '../../lib/composables/useRescuePersonnelView';
import {
  openRescueVehicleView,
  closeRescueVehicleView,
} from '../../lib/composables/useRescueVehicleView';

import { closeSpecialOperationView } from '../../lib/composables/useSpecialOperationView';
import { usePlantArea } from '../../lib/composables/usePlantArea';

const { scaleAreaCount } = usePlantArea();

// 消防救援力量统计：直连真后端 /fire/rescue-forces（无后端时 service 回落 dev fixture）。
const rescueStats = ref<RescueForceStat[]>([]);
onMounted(async () => {
  rescueStats.value = await fetchRescueForces();
});

function handleStatClick(label: string) {
  closeSpecialOperationView();
  if (label === '消防队伍') {
    closeRescueEquipmentView();
    closeRescuePersonnelView();
    closeRescueVehicleView();
    openFireBrigadeView();
  }
  if (label === '救援装备') {
    closeFireBrigadeView();
    closeRescuePersonnelView();
    closeRescueVehicleView();
    openRescueEquipmentView();
  }
  if (label === '救援人员') {
    closeFireBrigadeView();
    closeRescueEquipmentView();
    closeRescueVehicleView();
    openRescuePersonnelView();
  }
  if (label === '救援车辆') {
    closeFireBrigadeView();
    closeRescueEquipmentView();
    closeRescuePersonnelView();
    openRescueVehicleView();
  }
}
</script>

<template>
  <PanelCard title="消防救援力量" variant="rescue" :show-more="false">
    <div class="rescue-grid">
      <StatCard
        v-for="stat in rescueStats"
        :key="stat.label"
        :icon-type="stat.iconType"
        :value="scaleAreaCount(stat.value)"
        :unit="stat.unit"
        :label="stat.label"
        :clickable="
          stat.label === '消防队伍' ||
          stat.label === '救援装备' ||
          stat.label === '救援人员' ||
          stat.label === '救援车辆'
        "
        @click="handleStatClick(stat.label)"
      />
    </div>
  </PanelCard>
</template>

<style scoped>
.rescue-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 6px;
  height: 100%;
  min-height: 0;
  padding: 0;
}
</style>
