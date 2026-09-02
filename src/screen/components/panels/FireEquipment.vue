<script setup lang="ts">
import PanelCard from '../common/PanelCard.vue';
import EquipmentItemCard from '../common/EquipmentItemCard.vue';
import { fireEquipment } from '../../lib/data/mock';
import { useFireFacilityMonitoringDialog } from '../../lib/composables/useFireFacilityMonitoringDialog';
import { usePlantArea } from '../../lib/composables/usePlantArea';

const { openFireFacilityMonitoring } = useFireFacilityMonitoringDialog();
const { scaleAreaCount } = usePlantArea();

function openFromCard(equipmentType: string) {
  openFireFacilityMonitoring({ tab: 'problem', facilityType: equipmentType });
}
</script>

<template>
  <PanelCard
    title="消防设备"
    variant="equipment"
    :show-more="true"
    @more="openFireFacilityMonitoring({ tab: 'problem' })"
  >
    <div class="equipment-grid">
      <button
        v-for="item in fireEquipment"
        :key="item.id"
        type="button"
        class="equipment-grid__item"
        @click="openFromCard(item.name)"
      >
        <EquipmentItemCard
          :icon-index="(item.id - 1) % 9"
          :count="scaleAreaCount(item.count)"
          :name="item.name"
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
  padding: 6px 10px 12px;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 6px;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  align-content: start;
  padding-right: 2px;
  scrollbar-width: thin;
  scrollbar-color: rgb(0 160 255 / 45%) rgb(0 25 55 / 50%);
}

.equipment-grid__item {
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
}

.equipment-grid__item:hover :deep(.equip-card) {
  border-color: rgb(0 160 255 / 45%);
  background: rgb(0 55 100 / 42%);
}

.equipment-grid::-webkit-scrollbar {
  width: 4px;
}

.equipment-grid::-webkit-scrollbar-thumb {
  background: rgb(0 140 220 / 35%);
  border-radius: 2px;
}
</style>
