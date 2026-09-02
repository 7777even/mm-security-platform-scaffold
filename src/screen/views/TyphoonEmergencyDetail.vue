<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  setCesiumMapModeOverride,
  getSharedMap,
  onSharedMapReady,
} from '../lib/composables/sharedCesiumBridge';
import MapPageShell from '../components/map/MapPageShell.vue';
import TyphoonRiskMapOverlay from '../components/map/TyphoonRiskMapOverlay.vue';
import AccidentRescueHeader from '../components/layout/AccidentRescueHeader.vue';
import TyphoonLeftPanel from '../components/panels/typhoon/TyphoonLeftPanel.vue';
import TyphoonRightPanel from '../components/panels/typhoon/TyphoonRightPanel.vue';
import TyphoonRiskVideoWallDialog from '../components/panels/typhoon/TyphoonRiskVideoWallDialog.vue';
import SatelliteCloudMapDialog from '../components/panels/typhoon/SatelliteCloudMapDialog.vue';
import { resolveTyphoonEmergencyIncident } from '../lib/data/typhoonEmergencyMock';
import type { TyphoonEmergencyIncident } from '../lib/data/typhoonEmergencyMock';
import type { EmergencyDispatchResource } from '../lib/data/accidentRescueMock';
import '../styles/accidentRescueScroll.css';

const route = useRoute();
const satelliteCloudMapOpen = ref(false);
const focusedResource = ref<EmergencyDispatchResource | null>(null);
const selectedRiskPoint = ref<TyphoonEmergencyIncident['mapRiskPoints'][number] | null>(null);

const incident = computed(() =>
  resolveTyphoonEmergencyIncident(Number(route.query.eventId) || undefined),
);

const displayRiskPoints = computed(() => {
  const resource = focusedResource.value;
  if (!resource) return incident.value.mapRiskPoints;
  return [
    ...incident.value.mapRiskPoints,
    {
      id: 'r9',
      name: resource.name,
      longitude: resource.longitude,
      latitude: resource.latitude,
      status: 'normal' as const,
      statusText: '调度资源',
      responsibleUnit: resource.organization,
      predeployed: true,
      deployment: resource.capacity,
      kind: 'resource' as const,
    },
  ];
});

const selectedRiskVideos = computed(() => {
  const ids = new Set(selectedRiskPoint.value?.videoIds ?? []);
  return incident.value.liveVideos.filter((video) => ids.has(video.id));
});

function openRiskVideo(point: TyphoonEmergencyIncident['mapRiskPoints'][number]) {
  if (!point.videoIds?.length) return;
  selectedRiskPoint.value = point;
}

async function focusResource(resource: EmergencyDispatchResource) {
  focusedResource.value = resource;
  await getSharedMap()?.flyToWorldPositions?.({
    positions: [{ longitude: resource.longitude, latitude: resource.latitude }],
    duration: 0.9,
    pitchDeg: -50,
    rangeMultiplier: 1.25,
  });
}

async function flyToIncident() {
  const map = getSharedMap();
  const height = map?.getBoundaryModelTopHeight?.() ?? 72.05;
  const positions = incident.value.mapRiskPoints.map((point) => ({
    longitude: point.longitude,
    latitude: point.latitude,
    height,
  }));

  if (positions.length >= 2) {
    await map?.flyToWorldPositions?.({
      positions,
      duration: 1.15,
      pitchDeg: -55,
      rangeMultiplier: 3.35,
    });
    return;
  }
}

onMounted(() => {
  setCesiumMapModeOverride('accident-rescue');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => void flyToIncident());
  });
  onSharedMapReady(() => void flyToIncident());
});

watch(
  () => incident.value.eventId,
  () => void flyToIncident(),
);

onUnmounted(() => {
  setCesiumMapModeOverride(null);
});
</script>

<template>
  <MapPageShell min-width="1920px">
    <template #map>
      <TyphoonRiskMapOverlay :points="displayRiskPoints" @open-video="openRiskVideo" />
    </template>

    <div class="typhoon-page__ui">
      <AccidentRescueHeader
        theme="weather"
        :event-id="incident.eventId"
        :incident-title="incident.title"
        :started-at="incident.startedAt"
        :ended-at="incident.endedAt"
        :weather-metrics="incident.weatherMetrics"
      />

      <main class="typhoon-page__main">
        <aside class="typhoon-page__left">
          <TyphoonLeftPanel
            :incident="incident"
            @open-cloud-map="satelliteCloudMapOpen = true"
            @focus-resource="focusResource"
          />
        </aside>

        <aside class="typhoon-page__right">
          <TyphoonRightPanel :incident="incident" />
        </aside>
      </main>

      <SatelliteCloudMapDialog
        :open="satelliteCloudMapOpen"
        :typhoon-code="incident.typhoonApiCode"
        @close="satelliteCloudMapOpen = false"
      />
      <TyphoonRiskVideoWallDialog
        :open="Boolean(selectedRiskPoint)"
        :point="selectedRiskPoint"
        :videos="selectedRiskVideos"
        @close="selectedRiskPoint = null"
      />
    </div>
  </MapPageShell>
</template>

<style scoped>
.typhoon-page__ui {
  position: relative;
  z-index: var(--z-chrome);
  display: flex;
  flex-direction: column;
  height: 100%;
  pointer-events: none;
}

.typhoon-page__ui > * {
  pointer-events: auto;
}

.typhoon-page__main {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  min-height: 0;
  padding: 12px 39px 16px 20px;
  box-sizing: border-box;
  pointer-events: none;
  overflow: hidden;
}

.typhoon-page__left,
.typhoon-page__right {
  width: 419px;
  flex-shrink: 0;
  pointer-events: auto;
  min-height: 0;
  height: 100%;
}

.typhoon-page__right {
  display: flex;
  flex-direction: column;
}
</style>
