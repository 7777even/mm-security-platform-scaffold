<script setup lang="ts">
import PanelCard from '../common/PanelCard.vue';

import { specialOperations } from '../../lib/data/mock';

import { openSpecialOperationView } from '../../lib/composables/useSpecialOperationView';

import { closeFireBrigadeView } from '../../lib/composables/useFireBrigadeView';

import { closeRescueEquipmentView } from '../../lib/composables/useRescueEquipmentView';

import { closeRescuePersonnelView } from '../../lib/composables/useRescuePersonnelView';

import { closeRescueVehicleView } from '../../lib/composables/useRescueVehicleView';
import { usePlantArea } from '../../lib/composables/usePlantArea';

const { scaleAreaCount } = usePlantArea();

function handleItemClick(label: string) {
  closeFireBrigadeView();

  closeRescueEquipmentView();

  closeRescuePersonnelView();

  closeRescueVehicleView();

  openSpecialOperationView(label);
}
</script>

<template>
  <PanelCard title="特殊作业" variant="equipment" :show-more="false">
    <div class="special-ops">
      <button
        v-for="item in specialOperations"
        :key="item.id"
        type="button"
        class="special-ops__item"
        :class="{ 'special-ops__item--zero': item.count === 0 }"
        @click="handleItemClick(item.label)"
      >
        <div class="special-ops__ring">
          <span class="special-ops__count">{{ scaleAreaCount(item.count) }}</span>
        </div>

        <span class="special-ops__label">{{ item.label }}</span>
      </button>
    </div>
  </PanelCard>
</template>

<style scoped>
.special-ops {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 8px 6px;
  height: 100%;
  min-height: 0;
  padding: 4px 0 2px;
}

.special-ops__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: var(--font-body);
}

.special-ops__ring {
  width: 50px;
  aspect-ratio: 1 / 1;
  min-width: 50px;
  min-height: 50px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: transparent;
  position: relative;
  border: 1px solid rgb(0 95 150 / 50%);
  box-sizing: border-box;
  box-shadow: 0 0 6px rgb(0 150 255 / 12%);
}

.special-ops__ring::before {
  content: '';
  position: absolute;
  inset: 5px;
  border-radius: 999px;
  border: 2.5px solid rgb(0 190 255 / 85%);
  box-shadow:
    0 0 8px rgb(0 180 255 / 22%),
    inset 0 0 10px rgb(0 130 220 / 10%);
  pointer-events: none;
}

.special-ops__item--zero .special-ops__ring {
  border-color: rgb(110 130 155 / 38%);
  box-shadow: none;
}

.special-ops__item--zero .special-ops__ring::before {
  border-color: rgb(110 130 155 / 45%);
  box-shadow: none;
}

.special-ops__count {
  position: relative;
  z-index: var(--z-chrome);
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  color: var(--color-text-strong);
}

.special-ops__item--zero .special-ops__count {
  color: #8a9bb0;
}

.special-ops__label {
  font-size: 12px;
  color: #c8d8ec;
  text-align: center;
  line-height: 1.2;
  white-space: nowrap;
}
</style>
