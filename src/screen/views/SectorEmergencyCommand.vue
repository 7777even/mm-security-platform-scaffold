<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { setCesiumMapModeOverride } from '../lib/composables/sharedCesiumBridge';
import DashboardLayout from '../components/layout/DashboardLayout.vue';
import MapPageShell from '../components/map/MapPageShell.vue';
import FireEmergencyMap from '../components/map/FireEmergencyMap.vue';
import EmergencyEventListPanel from '../components/panels/preliminary/EmergencyEventListPanel.vue';
import DutyWatchPanel from '../components/panels/preliminary/DutyWatchPanel.vue';
import EmergencyRescuePanel from '../components/panels/preliminary/EmergencyRescuePanel.vue';
import SafetyKnowledgePanel from '../components/panels/preliminary/SafetyKnowledgePanel.vue';

onMounted(() => {
  setCesiumMapModeOverride('fire-emergency');
});

onUnmounted(() => {
  setCesiumMapModeOverride(null);
});
</script>

<template>
  <MapPageShell min-width="1920px">
    <template #map>
      <FireEmergencyMap />
    </template>

    <DashboardLayout
      module="fireEmergency"
      active-nav="emergency"
      class="sector-emergency__layout sector-emergency__layout--emergency"
    >
      <div class="sector-emergency-body">
        <aside class="sidebar sidebar--left sidebar--left-emergency">
          <EmergencyEventListPanel module="fireEmergency" show-event-tabs />
        </aside>

        <aside class="sidebar sidebar--right sidebar--right-emergency">
          <DutyWatchPanel module="fireEmergency" />
          <EmergencyRescuePanel module="fireEmergency" />
          <SafetyKnowledgePanel module="fireEmergency" />
        </aside>
      </div>
    </DashboardLayout>
  </MapPageShell>
</template>

<style scoped>
.sector-emergency__layout--emergency :deep(.dashboard-layout__main) {
  padding: 0;
  min-height: 0;
}

.sector-emergency-body {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 5px 27px 0 17px;
  box-sizing: border-box;
  pointer-events: none;
  overflow: hidden;
}

.sidebar {
  display: grid;
  min-height: 0;
  pointer-events: auto;
}

.sidebar--left-emergency {
  width: 414px;
  height: 897px;
  max-height: calc(100% - 5px);
  grid-template-rows: minmax(0, 1fr);
  flex-shrink: 0;
  align-self: flex-start;
}

.sidebar--right-emergency {
  width: 419px;
  margin-top: 15px;
  grid-template-rows: 283px 318px 276px;
  gap: 7px;
  flex-shrink: 0;
}

.sector-emergency-body .sidebar > :deep(.preliminary-panel),
.sector-emergency-body .sidebar > :deep(.panel-card) {
  height: 100%;
  min-height: 0;
}
</style>
