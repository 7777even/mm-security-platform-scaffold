<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '../components/layout/DashboardLayout.vue';
import MapPageShell from '../components/map/MapPageShell.vue';
import ProductionMap from '../components/map/ProductionMap.vue';
import ProductionAreaTopBar from '../components/panels/production/ProductionAreaTopBar.vue';
import ProductionAreaPersonnelPanel from '../components/panels/production/ProductionAreaPersonnelPanel.vue';
import ProductionAreaAlarmPanel from '../components/panels/production/ProductionAreaAlarmPanel.vue';
import ProductionAreaFacilityListPanel from '../components/panels/production/ProductionAreaFacilityListPanel.vue';
import { getSharedMap, onSharedMapReady } from '../lib/composables/sharedCesiumBridge';
import { resolveProductionAreaDetail } from '../lib/data/productionAreaMock';

const props = defineProps<{
  facilityId: string;
}>();

const router = useRouter();
const detail = computed(() => resolveProductionAreaDetail(props.facilityId));
const activeZoneId = ref(detail.value.zones[0]?.id ?? 'a');

const activeZone = computed(
  () => detail.value.zones.find((z) => z.id === activeZoneId.value) ?? detail.value.zones[0],
);

async function flyToActiveZone() {
  const map = getSharedMap();
  const keys = map?.getPlantZoneKeys?.() ?? [];
  const zoneIndex = activeZone.value?.zoneIndex ?? 0;
  const key = keys[zoneIndex] ?? keys[0];
  if (!key) return;

  const world = map?.getPlantZoneWorldPosition?.(key);
  if (!world) return;

  await map?.flyToWorldPositions?.({
    positions: [{ longitude: world.longitude, latitude: world.latitude, height: world.height }],
    duration: 0.9,
    pitchDeg: -46,
    rangeMultiplier: 2.1,
    panOnly: true,
  });
}

function goBack() {
  void router.push({ name: 'production' });
}

watch(
  () => props.facilityId,
  () => {
    activeZoneId.value = detail.value.zones[0]?.id ?? 'a';
  },
);

watch(activeZoneId, () => {
  void flyToActiveZone();
});

onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => void flyToActiveZone());
  });
  onSharedMapReady(() => void flyToActiveZone());
});
</script>

<template>
  <MapPageShell min-width="1920px" class="production-area-shell">
    <template #map>
      <ProductionMap />
    </template>

    <DashboardLayout
      module="production"
      active-nav="production"
      class="production-area__layout"
      :hide-message-bar="false"
    >
      <div class="production-area">
        <ProductionAreaTopBar
          class="production-area__top"
          :zones="detail.zones"
          :active-zone-id="activeZoneId"
          :metrics="detail.metrics"
          @update:active-zone-id="activeZoneId = $event"
        />

        <aside class="production-area__left">
          <ProductionAreaFacilityListPanel :metrics="detail.metrics" />
        </aside>

        <aside class="production-area__right">
          <ProductionAreaPersonnelPanel
            :total="detail.personnelTotal"
            :slices="detail.personnelSlices"
          />
          <ProductionAreaAlarmPanel :alarms="detail.alarms" />
        </aside>

        <button type="button" class="production-area__back" @click="goBack">返回</button>
      </div>
    </DashboardLayout>
  </MapPageShell>
</template>

<style scoped>
.production-area__layout :deep(.dashboard-layout__main) {
  padding: 0;
  min-height: 0;
}

.production-area {
  position: relative;
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  pointer-events: none;
  padding: 14px 18px 24px;
}

.production-area__top {
  position: absolute;
  left: 18px;
  right: 455px;
  top: 14px;
  z-index: 4;
}

.production-area__left {
  position: absolute;
  left: 18px;
  top: 96px;
  bottom: 18px;
  width: 338px;
  z-index: 4;
  pointer-events: auto;
}

.production-area__left > :deep(.panel-card) {
  height: 100%;
  min-height: 0;
}

.production-area__right {
  width: 419px;
  display: grid;
  grid-template-rows: 280px 1fr;
  gap: 10px;
  min-height: 0;
  pointer-events: auto;
  flex-shrink: 0;
  align-self: stretch;
  max-height: calc(100% - 8px);
}

.production-area__right > :deep(.panel-card) {
  height: 100%;
  min-height: 0;
}

.production-area__back {
  position: absolute;
  left: 18px;
  bottom: 18px;
  z-index: 5;
  height: 36px;
  padding: 0 18px;
  border: 1px solid rgb(0 150 230 / 45%);
  border-radius: 2px;
  background: rgb(0 22 48 / 82%);
  color: #e8f4ff;
  font-size: 14px;
  font-family: var(--font-body);
  cursor: pointer;
  pointer-events: auto;
}

.production-area__back:hover {
  border-color: rgb(0 190 255 / 65%);
  background: rgb(0 40 78 / 90%);
}
</style>
