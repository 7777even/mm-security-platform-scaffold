<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '../components/layout/DashboardLayout.vue';
import MapPageShell from '../components/map/MapPageShell.vue';
import MajorHazardMapOverlay from '../components/map/MajorHazardMapOverlay.vue';
import MajorHazardStatsBar from '../components/panels/production/MajorHazardStatsBar.vue';
import MajorHazardListPanel from '../components/panels/production/MajorHazardListPanel.vue';
import { getSharedMap, onSharedMapReady } from '../lib/composables/sharedCesiumBridge';
import { majorHazards } from '@/services/hazard';
import { usePlantArea } from '../lib/composables/usePlantArea';
import { resolvePlantAreaWorldPosition } from '../lib/data/plantAreas';

const router = useRouter();
const { filterByPlantArea, selectedPlantArea } = usePlantArea();
const visibleHazards = computed(() => filterByPlantArea(majorHazards));

async function flyToHazards() {
  const map = getSharedMap();
  if (!map?.flyToWorldPositions || !visibleHazards.value.length) return;
  const height = map.getBoundaryModelTopHeight?.() ?? 72.05;
  await map.flyToWorldPositions({
    positions: visibleHazards.value.map((h, index) => ({
      ...resolvePlantAreaWorldPosition(h, index, h.longitude, h.latitude),
      height,
    })),
    duration: 1.0,
    pitchDeg: -42,
    rangeMultiplier: 2.4,
  });
}

function goBack() {
  void router.push({ name: 'production' });
}

onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => void flyToHazards());
  });
  onSharedMapReady(() => void flyToHazards());
});

watch(selectedPlantArea, () => void flyToHazards());
</script>

<template>
  <MapPageShell min-width="1920px" class="hazard-list-shell">
    <template #map>
      <MajorHazardMapOverlay />
    </template>

    <DashboardLayout module="production" active-nav="production" class="hazard-list__layout">
      <div class="hazard-list-page">
        <MajorHazardStatsBar class="hazard-list-page__stats" />

        <aside class="hazard-list-page__right">
          <MajorHazardListPanel />
        </aside>

        <button type="button" class="hazard-list-page__back" @click="goBack">返回</button>
      </div>
    </DashboardLayout>
  </MapPageShell>
</template>

<style scoped>
.hazard-list__layout :deep(.dashboard-layout__main) {
  padding: 0;
  min-height: 0;
}

.hazard-list-page {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  pointer-events: none;
  padding: 14px 18px 24px;
}

.hazard-list-page__stats {
  align-self: flex-start;
  margin-top: 8px;
}

.hazard-list-page__right {
  width: 520px;
  min-height: 0;
  pointer-events: auto;
  flex-shrink: 0;
  align-self: stretch;
  max-height: calc(100% - 8px);
}

.hazard-list-page__right > :deep(.panel-card) {
  height: 100%;
  min-height: 0;
}

.hazard-list-page__back {
  position: absolute;
  left: 18px;
  bottom: 18px;
  z-index: var(--z-marker);
  height: 36px;
  padding: 0 18px;
  border: 1px solid rgb(0 150 230 / 45%);
  border-radius: 2px;
  background: var(--map-facility-btn-bg);
  color: #e8f4ff;
  font-size: 14px;
  font-family: var(--font-body);
  cursor: pointer;
  pointer-events: auto;
}

.hazard-list-page__back:hover {
  border-color: rgb(0 190 255 / 65%);
  background: rgb(0 40 78 / 90%);
}
</style>
