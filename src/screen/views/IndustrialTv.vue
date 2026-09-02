<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DashboardLayout from '../components/layout/DashboardLayout.vue';
import MapPageShell from '../components/map/MapPageShell.vue';
import TvMap from '../components/map/TvMap.vue';
import VideoMonitoringManagementPanel from '../components/panels/tv/VideoMonitoringManagementPanel.vue';
import EventAnalysisPanel from '../components/panels/tv/EventAnalysisPanel.vue';
import ImportantVideoPanel from '../components/panels/tv/ImportantVideoPanel.vue';
import VideoMonitorDetailPanel from '../components/panels/tv/VideoMonitorDetailPanel.vue';
import {
  openTvVideoDetail,
  closeTvVideoDetail,
  tvVideoDetailMonitor,
  tvVideoDetailOpen,
} from '../lib/composables/useTvVideoDetail';

const route = useRoute();
const router = useRouter();
const showVideoDetail = computed(() => tvVideoDetailOpen.value && tvVideoDetailMonitor.value);

function handleVideoDetailBack() {
  closeTvVideoDetail();

  if (route.query.monitor || route.query.monitorLabel) {
    const query = { ...route.query };
    delete query.monitor;
    delete query.monitorLabel;
    void router.replace({ query });
  }
}

watch(
  () => [route.name, route.query.monitor, route.query.monitorLabel] as const,
  ([name, monitor, monitorLabel]) => {
    if (name !== 'tv' || typeof monitor !== 'string' || !monitor) return;
    openTvVideoDetail({
      id: monitor,
      label: typeof monitorLabel === 'string' ? monitorLabel : '现场监控',
    });
  },
  { immediate: true },
);
</script>

<template>
  <MapPageShell min-width="1920px">
    <template #map>
      <TvMap />
    </template>

    <DashboardLayout module="tv" active-nav="tv" class="industrial-tv__layout">
      <aside class="sidebar sidebar--left">
        <VideoMonitoringManagementPanel />
        <EventAnalysisPanel />
      </aside>

      <aside class="sidebar sidebar--right" :class="{ 'sidebar--right--hidden': showVideoDetail }">
        <ImportantVideoPanel />
      </aside>

      <aside class="video-detail-drawer" :class="{ 'video-detail-drawer--open': showVideoDetail }">
        <Transition name="video-detail-switch" mode="out-in">
          <VideoMonitorDetailPanel
            v-if="tvVideoDetailMonitor"
            :key="tvVideoDetailMonitor.id"
            :monitor="tvVideoDetailMonitor"
            @back="handleVideoDetailBack"
          />
        </Transition>
      </aside>
    </DashboardLayout>
  </MapPageShell>
</template>

<style scoped>
.industrial-tv__layout :deep(.dashboard-layout__main) {
  position: relative;
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px 38px 13px 19px;
  min-height: 0;
  height: 0;
  pointer-events: none;
}

.sidebar {
  display: grid;
  min-height: 0;
  pointer-events: auto;
  flex-shrink: 0;
}

.sidebar--left {
  width: 419px;
  grid-template-rows: 605px 289px;
  gap: 7px;
}

.sidebar--right {
  width: 419px;
  grid-template-rows: minmax(0, 1fr);
  height: 100%;
  transition:
    transform 0.38s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.28s ease;
}

.sidebar--right--hidden {
  transform: translateX(calc(100% + 24px));
  opacity: 0;
  pointer-events: none;
}

.video-detail-drawer {
  position: absolute;
  top: 14px;
  right: 38px;
  z-index: 8;
  transform: translateX(calc(100% + 40px));
  opacity: 0;
  pointer-events: none;
  transition:
    transform 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.32s ease;
}

.video-detail-drawer--open {
  transform: translateX(0);
  opacity: 1;
  pointer-events: auto;
}

.video-detail-switch-enter-active,
.video-detail-switch-leave-active {
  transition:
    opacity 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.36s cubic-bezier(0.22, 1, 0.36, 1);
}

.video-detail-switch-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.video-detail-switch-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

.sidebar > :deep(.panel-card) {
  height: 100%;
  min-height: 0;
}
</style>
