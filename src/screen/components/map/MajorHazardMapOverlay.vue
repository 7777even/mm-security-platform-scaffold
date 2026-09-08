<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWorldMarkerScreenPositions } from '../../lib/composables/useCesiumScreenAnchor';
import { getSharedMap } from '../../lib/composables/sharedCesiumBridge';
import { levelTone, type MajorHazardItem } from '@/services/hazard';
import { majorHazardsData, refreshMajorHazards } from '../../lib/composables/useScreenHazardData';
import { usePlantArea } from '../../lib/composables/usePlantArea';
import { resolvePlantAreaWorldPosition } from '../../lib/data/plantAreas';

const router = useRouter();
const { filterByPlantArea } = usePlantArea();
const markers = computed(() => filterByPlantArea(majorHazardsData.value));

const { styleFor } = useWorldMarkerScreenPositions(() => {
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72.05;
  return markers.value.map((item, index) => {
    const position = resolvePlantAreaWorldPosition(item, index, item.longitude, item.latitude);
    return { key: String(item.id), ...position, height };
  });
});

function openDetail(item: MajorHazardItem) {
  void router.push({ name: 'majorHazardDetail', params: { hazardId: String(item.id) } });
}

onMounted(() => void refreshMajorHazards());
</script>

<template>
  <div class="hazard-map">
    <button
      v-for="item in markers"
      :key="item.id"
      type="button"
      class="hazard-marker"
      :class="`hazard-marker--${levelTone(item.level)}`"
      :style="styleFor(String(item.id))"
      :title="item.name"
      @click="openDetail(item)"
    >
      <span class="hazard-marker__label">{{ item.name }}</span>
      <span class="hazard-marker__badge">危</span>
      <span class="hazard-marker__stem" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.hazard-map {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: var(--z-chrome);
}

.hazard-marker {
  position: absolute;
  z-index: var(--z-marker);
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -100%);
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
}

.hazard-marker__badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-strong);
  box-shadow: 0 0 10px rgb(0 0 0 / 35%);
}

.hazard-marker--l1 .hazard-marker__badge {
  background: var(--map-hazard-l1);
}

.hazard-marker--l2 .hazard-marker__badge {
  background: var(--map-hazard-l2);
}

.hazard-marker--l3 .hazard-marker__badge {
  background: var(--map-hazard-l3);
}

.hazard-marker--l4 .hazard-marker__badge {
  background: var(--map-hazard-l4);
}

.hazard-marker__stem {
  width: 2px;
  height: 16px;
  margin-top: -1px;
  background: linear-gradient(180deg, rgb(255 255 255 / 70%), rgb(255 255 255 / 0%));
}

.hazard-marker__label {
  margin-bottom: 4px;
  max-width: 140px;
  padding: 2px 6px;
  border-radius: 2px;
  background: var(--map-device-label-bg);
  border: 1px solid rgb(0 140 220 / 28%);
  color: var(--color-text-muted);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
