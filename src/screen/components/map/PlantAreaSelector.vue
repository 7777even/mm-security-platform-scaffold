<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePlantArea } from '../../lib/composables/usePlantArea';
import type { PlantAreaCode } from '../../lib/data/plantAreas';

const { plantAreaOptions, selectedPlantArea, setSelectedPlantArea } = usePlantArea();

const route = useRoute();
const hiddenOnIncidentDetail = computed(() =>
  ['typhoonEmergencyDetail', 'fireAccidentRescue', 'drillEmergencyDetail'].includes(
    String(route.name ?? ''),
  ),
);

function handleChange(event: Event) {
  setSelectedPlantArea((event.target as HTMLSelectElement).value as PlantAreaCode);
}
</script>

<template>
  <label
    v-if="!hiddenOnIncidentDetail"
    class="plant-area-selector"
    title="切换厂区后，页面数据与地图范围将同步更新"
  >
    <span class="plant-area-selector__icon" aria-hidden="true">⌖</span>
    <span class="plant-area-selector__label">厂区范围</span>
    <select
      class="plant-area-selector__select"
      :value="selectedPlantArea"
      aria-label="选择厂区范围"
      @change="handleChange"
    >
      <option v-for="area in plantAreaOptions" :key="area.code" :value="area.code">
        {{ area.label }}
      </option>
    </select>
  </label>
</template>

<style scoped>
.plant-area-selector {
  position: absolute;
  top: calc(var(--header-height) + 66px);
  left: calc(var(--sidebar-width) + 28px);
  z-index: 9;
  pointer-events: auto;
  display: flex;
  align-items: center;
  width: 170px;
  height: 34px;
  padding: 0 8px;
  box-sizing: border-box;
  border: 1px solid rgb(0 155 235 / 72%);
  border-radius: 2px;
  background: linear-gradient(180deg, rgb(4 48 83 / 95%), rgb(2 28 55 / 96%));
  box-shadow:
    inset 0 0 13px rgb(0 132 220 / 18%),
    0 0 10px rgb(0 70 130 / 28%);
  color: #d7efff;
  font-family: var(--font-body);
}

.plant-area-selector__icon {
  margin-right: 5px;
  color: #37c7ff;
  font-size: 16px;
  line-height: 1;
}

.plant-area-selector__label {
  flex-shrink: 0;
  font-size: 12px;
  color: #9fc9e8;
}

.plant-area-selector__select {
  min-width: 0;
  flex: 1;
  height: 28px;
  margin-left: 5px;
  padding: 0 20px 0 5px;
  border: 0;
  outline: 0;
  background: rgb(0 31 62 / 72%);
  color: #fff;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.plant-area-selector__select option {
  background: #062846;
  color: #fff;
}

:global(.map-page-shell--clean) .plant-area-selector {
  left: 24px;
}
</style>
