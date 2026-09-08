<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import MaomingPetroCesiumMap from './MaomingPetroCesiumMap.vue';
import MapToolBar from './MapToolBar.vue';
import {
  bindSharedMap,
  cesiumMapModeOverride,
  setSharedMapReady,
  type SharedCesiumMapExpose,
} from '@/composables/sharedCesiumBridge';
import { resolveRouteCesiumMeta } from '@/config/cesiumMapModes';
import { usePlantArea } from '@/composables/usePlantArea';

const route = useRoute();
const mapRef = ref<InstanceType<typeof MaomingPetroCesiumMap> | null>(null);
const { selectedPlantArea } = usePlantArea();

const INCIDENT_DETAIL_ROUTE_NAMES = new Set(['fm-typhoon', 'fm-fire-rescue', 'fm-drill']);

function shouldFlyToPlantArea(routeName: unknown) {
  return !INCIDENT_DETAIL_ROUTE_NAMES.has(String(routeName ?? ''));
}

const routeMeta = computed(() => resolveRouteCesiumMeta(String(route.name ?? '')));

const effectiveMapMode = computed(() => cesiumMapModeOverride.value ?? routeMeta.value.mapMode);

const showCesium = computed(() => routeMeta.value.cesium || cesiumMapModeOverride.value != null);

const mapFocus = computed(
  () =>
    routeMeta.value.mapFocus ?? {
      focusRightInsetPx: 0,
      focusLeftInsetPx: 0,
      focusTopInsetPx: 98,
      focusBottomInsetPx: 0,
      focusVerticalExtraPx: 160,
      focusHorizontalScale: 0.75,
      boundaryOverviewRangeMultiplier: 2.05,
    },
);

function onMapReady() {
  bindSharedMap(mapRef.value as unknown as SharedCesiumMapExpose);
  setSharedMapReady(true);
  void mapRef.value?.setPlantAreaSelection?.(selectedPlantArea.value, {
    fly: shouldFlyToPlantArea(route.name),
  });
}

const SKIP_RESTORE_ROUTE_NAMES = new Set([
  'fm-fire-rescue',
  'fm-drill',
  'fm-typhoon',
  'fm-fire',
  'fm-production-area',
  'fm-major-hazard-list',
  'fm-major-hazard-detail',
  'fm-communication',
]);

watch(
  () => route.name,
  async (name) => {
    if (!(name && SKIP_RESTORE_ROUTE_NAMES.has(String(name)))) {
      await mapRef.value?.restoreModuleDefaultView?.();
    }
    await mapRef.value?.waitForIdle?.();
    await mapRef.value?.setPlantAreaSelection?.(selectedPlantArea.value, {
      fly: shouldFlyToPlantArea(name),
    });
  },
);

watch(selectedPlantArea, (code) => {
  void mapRef.value?.setPlantAreaSelection?.(code, {
    fly: shouldFlyToPlantArea(route.name),
  });
});
</script>

<template>
  <div v-show="showCesium" class="shared-cesium-map">
    <MaomingPetroCesiumMap
      ref="mapRef"
      :map-mode="effectiveMapMode"
      :focus-right-inset-px="mapFocus.focusRightInsetPx"
      :focus-left-inset-px="mapFocus.focusLeftInsetPx ?? 0"
      :focus-top-inset-px="mapFocus.focusTopInsetPx"
      :focus-bottom-inset-px="mapFocus.focusBottomInsetPx ?? 0"
      :focus-vertical-extra-px="mapFocus.focusVerticalExtraPx"
      :focus-horizontal-scale="mapFocus.focusHorizontalScale"
      :boundary-overview-range-multiplier="mapFocus.boundaryOverviewRangeMultiplier ?? 2.05"
      @ready="onMapReady"
    />
    <MapToolBar />
  </div>
</template>

<style scoped>
.shared-cesium-map {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: auto;
}

.shared-cesium-map :deep(.maoming-petro-cesium-map),
.shared-cesium-map :deep(.cesium-container) {
  width: 100%;
  height: 100%;
}
</style>
