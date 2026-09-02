<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import DashboardLayout from '../components/layout/DashboardLayout.vue';
import MapPageShell from '../components/map/MapPageShell.vue';
import SecurityMap from '../components/map/SecurityMap.vue';
import AlarmDetailMapOverlay from '../components/map/AlarmDetailMapOverlay.vue';
import MapAlarmVideoPopups from '../components/map/MapAlarmVideoPopups.vue';
import SecurityTrackMapOverlay from '../components/map/SecurityTrackMapOverlay.vue';
import AlarmDetailPanel from '../components/common/AlarmDetailPanel.vue';
import EntryExitStatsPanel from '../components/panels/security/EntryExitStatsPanel.vue';
import SecurityStatusPanel from '../components/panels/security/SecurityStatusPanel.vue';
import PatrolLinkagePanel from '../components/panels/security/PatrolLinkagePanel.vue';
import AlarmTrendPanel from '../components/panels/security/AlarmTrendPanel.vue';
import PlantInspectionPanel from '../components/panels/tv/PlantInspectionPanel.vue';
import SecuritySearchPanel from '../components/panels/security/SecuritySearchPanel.vue';
import SecuritySearchDetailPanel from '../components/panels/security/SecuritySearchDetailPanel.vue';
import SecurityTrackScenePanel from '../components/panels/security/SecurityTrackScenePanel.vue';
import PatrolLinkageListPanel from '../components/panels/security/PatrolLinkageListPanel.vue';
import BlacklistDialog from '../components/panels/security/BlacklistDialog.vue';
import PatrolCameraListPanel from '../components/panels/security/PatrolCameraListPanel.vue';
import PatrolCameraVideoDialog from '../components/panels/security/PatrolCameraVideoDialog.vue';
import EntryCaptureListPanel from '../components/panels/security/EntryCaptureListPanel.vue';
import BollardListPanel from '../components/panels/security/BollardListPanel.vue';
import BollardDetailDialog from '../components/panels/security/BollardDetailDialog.vue';
import GateControlListPanel from '../components/panels/security/GateControlListPanel.vue';
import GateControlDetailDialog from '../components/panels/security/GateControlDetailDialog.vue';
import {
  securitySearchDrawerActive,
  securitySearchPanelMode,
} from '../lib/composables/useSecuritySearchPanel';
import { patrolLinkageOpen } from '../lib/composables/usePatrolLinkage';
import { blacklistDialogOpen, closeBlacklistDialog } from '../lib/composables/useBlacklistDialog';
import {
  securitySearchDetailOpen,
  selectedPersonSearchId,
  selectedVehicleSearchId,
} from '../lib/composables/useSecuritySearchDetail';
import {
  closeSecurityTrack,
  securityTrackActive,
  securityTrackEntityId,
  securityTrackMode,
  securityTrackPlayback,
  securityTrackPlaying,
  securityTrackProgress,
  securityTrackSpeed,
} from '../lib/composables/useSecurityTrackView';
import { patrolCameraDrawerActive } from '../lib/composables/usePatrolCameraListView';
import {
  closePatrolCameraVideo,
  patrolCameraVideoCamera,
  patrolCameraVideoOpen,
} from '../lib/composables/usePatrolCameraVideoDialog';
import { entryCaptureDrawerActive } from '../lib/composables/useEntryCaptureListView';
import { bollardDrawerActive } from '../lib/composables/useBollardListView';
import { gateControlDrawerActive } from '../lib/composables/useGateControlListView';
import { useAlarmDetailPanel } from '../lib/composables/useAlarmDetailPanel';
import {
  bollardDetailItem,
  bollardDetailOpen,
  closeBollardDetail,
} from '../lib/composables/useBollardDetailDialog';
import {
  closeGateControlDetail,
  gateControlDetailItem,
  gateControlDetailOpen,
} from '../lib/composables/useGateControlDetailDialog';

const drawerLayerMounted = ref(false);
const { alarmDetailOpen } = useAlarmDetailPanel();

const rightDrawerOpen = computed(
  () => securitySearchDetailOpen.value || entryCaptureDrawerActive.value,
);

const shellDrawerActive = computed(
  () =>
    (securitySearchDrawerActive.value ||
      patrolCameraDrawerActive.value ||
      bollardDrawerActive.value ||
      gateControlDrawerActive.value ||
      patrolLinkageOpen.value) &&
    !securityTrackActive.value,
);

watch(
  () =>
    securitySearchDrawerActive.value ||
    patrolCameraDrawerActive.value ||
    bollardDrawerActive.value ||
    gateControlDrawerActive.value ||
    entryCaptureDrawerActive.value ||
    securitySearchDetailOpen.value ||
    patrolLinkageOpen.value,
  (active) => {
    if (active) drawerLayerMounted.value = true;
  },
  { immediate: true },
);

function handleListDrawerAfterLeave() {
  if (
    !securitySearchDrawerActive.value &&
    !patrolCameraDrawerActive.value &&
    !bollardDrawerActive.value &&
    !gateControlDrawerActive.value &&
    !entryCaptureDrawerActive.value &&
    !securitySearchDetailOpen.value &&
    !patrolLinkageOpen.value
  ) {
    drawerLayerMounted.value = false;
  }
}

function setTrackPlaying(value: boolean) {
  securityTrackPlaying.value = value;
}

function setTrackSpeed(value: number) {
  securityTrackSpeed.value = value;
}
</script>

<template>
  <MapPageShell
    min-width="1920px"
    class="security-shell"
    :class="{
      'security-shell--drawer-active': shellDrawerActive,
      'security-shell--drawer-right-open': rightDrawerOpen && !securityTrackActive,
      'security-shell--track-active': securityTrackActive,
      'security-shell--entry-capture-open': entryCaptureDrawerActive,
      'security-shell--alarm-detail-open': alarmDetailOpen && !securityTrackActive,
    }"
  >
    <template #map>
      <SecurityMap v-if="!securityTrackActive" />
      <MapAlarmVideoPopups v-if="!securityTrackActive" />
      <AlarmDetailMapOverlay v-if="!securityTrackActive" />
      <SecurityTrackMapOverlay
        v-else-if="securityTrackEntityId != null"
        :key="`${securityTrackMode}-${securityTrackEntityId}`"
        :mode="securityTrackMode"
        :playback="securityTrackPlayback"
      />
    </template>

    <template #floating>
      <AlarmDetailPanel v-if="!securityTrackActive" />
      <div v-if="drawerLayerMounted && !securityTrackActive" class="security-drawer-layer">
        <Transition
          name="drawer-left"
          mode="out-in"
          appear
          @after-leave="handleListDrawerAfterLeave"
        >
          <aside
            v-if="securitySearchDrawerActive && securitySearchPanelMode"
            :key="`search-${securitySearchPanelMode}`"
            class="security-drawer security-drawer--left"
          >
            <SecuritySearchPanel :mode="securitySearchPanelMode" />
          </aside>
        </Transition>

        <Transition name="drawer-left" appear @after-leave="handleListDrawerAfterLeave">
          <aside
            v-if="patrolCameraDrawerActive"
            key="patrol-camera-list"
            class="security-drawer security-drawer--left"
          >
            <PatrolCameraListPanel />
          </aside>
        </Transition>

        <Transition name="drawer-left" appear @after-leave="handleListDrawerAfterLeave">
          <aside
            v-if="bollardDrawerActive"
            key="bollard-list"
            class="security-drawer security-drawer--left"
          >
            <BollardListPanel />
          </aside>
        </Transition>

        <Transition name="drawer-left" appear @after-leave="handleListDrawerAfterLeave">
          <aside
            v-if="gateControlDrawerActive"
            key="gate-control-list"
            class="security-drawer security-drawer--left"
          >
            <GateControlListPanel />
          </aside>
        </Transition>

        <Transition name="drawer-left" appear @after-leave="handleListDrawerAfterLeave">
          <aside
            v-if="patrolLinkageOpen"
            key="patrol-linkage-list"
            class="security-drawer security-drawer--left"
          >
            <PatrolLinkageListPanel />
          </aside>
        </Transition>

        <Transition name="drawer-right" appear @after-leave="handleListDrawerAfterLeave">
          <aside
            v-if="entryCaptureDrawerActive"
            key="entry-capture-list"
            class="security-drawer security-drawer--right"
          >
            <EntryCaptureListPanel />
          </aside>
        </Transition>

        <Transition name="drawer-right" appear>
          <aside
            v-if="securitySearchPanelMode === 'vehicle' && selectedVehicleSearchId"
            :key="`vehicle-${selectedVehicleSearchId}`"
            class="security-drawer security-drawer--right"
          >
            <SecuritySearchDetailPanel mode="vehicle" />
          </aside>
        </Transition>

        <Transition name="drawer-right" appear>
          <aside
            v-if="securitySearchPanelMode === 'person' && selectedPersonSearchId"
            :key="`person-${selectedPersonSearchId}`"
            class="security-drawer security-drawer--right"
          >
            <SecuritySearchDetailPanel mode="person" />
          </aside>
        </Transition>
      </div>

      <SecurityTrackScenePanel
        :open="securityTrackActive"
        :mode="securityTrackMode"
        :entity-id="securityTrackEntityId"
        :playing="securityTrackPlaying"
        :speed="securityTrackSpeed"
        :progress="securityTrackProgress"
        @close="closeSecurityTrack"
        @update:playing="setTrackPlaying"
        @update:speed="setTrackSpeed"
      />
    </template>

    <DashboardLayout
      module="security"
      active-nav="security"
      :hide-message-bar="securityTrackActive"
    >
      <template v-if="!securityTrackActive">
        <aside class="sidebar sidebar--left sidebar--primary-left">
          <SecurityStatusPanel />
          <AlarmTrendPanel />
          <EntryExitStatsPanel />
        </aside>

        <aside class="sidebar sidebar--right sidebar--primary-right">
          <PatrolLinkagePanel />
          <PlantInspectionPanel />
        </aside>
      </template>
    </DashboardLayout>
  </MapPageShell>

  <PatrolCameraVideoDialog
    :open="patrolCameraVideoOpen"
    :camera="patrolCameraVideoCamera"
    @close="closePatrolCameraVideo"
  />

  <BollardDetailDialog
    :open="bollardDetailOpen"
    :item="bollardDetailItem"
    @close="closeBollardDetail"
  />

  <GateControlDetailDialog
    :open="gateControlDetailOpen"
    :item="gateControlDetailItem"
    @close="closeGateControlDetail"
  />

  <BlacklistDialog :open="blacklistDialogOpen" @close="closeBlacklistDialog" />
</template>

<style scoped>
.sidebar {
  display: grid;
  height: 100%;
  min-height: 0;
  pointer-events: auto;
  flex-shrink: 0;
  transition:
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 280ms ease;
  will-change: transform;
}

.sidebar--left {
  width: 419px;
  grid-template-rows: 350px 210px minmax(0, 1fr);
  gap: 11px;
}

.sidebar--right {
  width: 419px;
  grid-template-rows: 230px minmax(0, 1fr);
  gap: 10px;
}

.sidebar > :deep(.panel-card) {
  height: 100%;
  min-height: 0;
}

.security-drawer :deep(.panel-card) {
  height: 100%;
  min-height: 0;
}

.security-drawer :deep(.panel-card__content) {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>

<style>
.security-shell--drawer-active .sidebar--primary-left {
  transform: translateX(-110%);
  opacity: 0;
  pointer-events: none;
}

.security-shell--drawer-active .sidebar--primary-right {
  transform: translateX(110%);
  opacity: 0;
  pointer-events: none;
}

.security-shell--entry-capture-open .sidebar--primary-right {
  transform: translateX(110%);
  opacity: 0;
  pointer-events: none;
}

.security-shell--alarm-detail-open .sidebar--primary-right {
  transform: translateX(110%);
  opacity: 0;
  pointer-events: none;
}

.security-shell--track-active .sidebar--primary-left,
.security-shell--track-active .sidebar--primary-right {
  transform: translateX(-110%);
  opacity: 0;
  pointer-events: none;
}

.security-shell--drawer-active:not(.security-shell--drawer-right-open),
.security-shell--track-active {
  --security-map-controls-right: 16px;
}

.security-shell--drawer-right-open {
  --security-map-controls-right: calc(420px + 19px + 16px);
}

.security-shell--alarm-detail-open {
  --security-map-controls-right: calc(470px + 19px + 16px);
}

.security-drawer-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: var(--z-base);
}

.security-drawer {
  position: absolute;
  top: calc(var(--header-height) + 8px);
  bottom: 54px;
  width: 420px;
  pointer-events: auto;
  will-change: transform, opacity;
}

.security-drawer--left {
  left: 19px;
}

.security-drawer--right {
  right: 19px;
}

.drawer-left-enter-active,
.drawer-left-leave-active,
.drawer-right-enter-active,
.drawer-right-leave-active {
  transition:
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 280ms ease;
}

.drawer-left-enter-from,
.drawer-left-leave-to {
  transform: translateX(calc(-100% - 24px));
  opacity: 0;
}

.drawer-left-enter-to,
.drawer-left-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.drawer-right-enter-from,
.drawer-right-leave-to {
  transform: translateX(calc(100% + 24px));
  opacity: 0;
}

.drawer-right-enter-to,
.drawer-right-leave-from {
  transform: translateX(0);
  opacity: 1;
}
</style>
