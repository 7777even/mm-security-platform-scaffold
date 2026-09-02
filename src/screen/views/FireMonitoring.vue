<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '../components/layout/DashboardLayout.vue';
import MapPageShell from '../components/map/MapPageShell.vue';
import CenterMap from '../components/map/CenterMap.vue';
import AlarmDetailMapOverlay from '../components/map/AlarmDetailMapOverlay.vue';
import RescueDrawerMapOverlay from '../components/map/RescueDrawerMapOverlay.vue';
import MapAlarmVideoPopups from '../components/map/MapAlarmVideoPopups.vue';
import AlarmDetailPanel from '../components/common/AlarmDetailPanel.vue';
import SoundLightAlarmDialog from '../components/common/SoundLightAlarmDialog.vue';
import SpecialOperationsPanel from '../components/panels/SpecialOperationsPanel.vue';
import EquipmentMonitoring from '../components/panels/EquipmentMonitoring.vue';
import DutyInfoPanel from '../components/panels/DutyInfoPanel.vue';
import SafetyAlarmPanel from '../components/panels/SafetyAlarmPanel.vue';
import FireBrigadeListPanel from '../components/panels/FireBrigadeListPanel.vue';
import FireBrigadeDetailPanel from '../components/panels/FireBrigadeDetailPanel.vue';
import RescueEquipmentListPanel from '../components/panels/RescueEquipmentListPanel.vue';
import RescueEquipmentDetailPanel from '../components/panels/RescueEquipmentDetailPanel.vue';
import RescuePersonnelListPanel from '../components/panels/RescuePersonnelListPanel.vue';
import RescueVehicleListPanel from '../components/panels/RescueVehicleListPanel.vue';
import RescueVehicleDetailPanel from '../components/panels/RescueVehicleDetailPanel.vue';
import SpecialOperationListPanel from '../components/panels/SpecialOperationListPanel.vue';
import SpecialOperationDetailPanel from '../components/panels/SpecialOperationDetailPanel.vue';
import {
  fireBrigadeViewActive,
  selectedFireBrigadeId,
} from '../lib/composables/useFireBrigadeView';
import {
  rescueEquipmentViewActive,
  selectedRescueEquipment,
  selectedRescueEquipmentId,
} from '../lib/composables/useRescueEquipmentView';
import { rescuePersonnelViewActive } from '../lib/composables/useRescuePersonnelView';
import {
  rescueVehicleViewActive,
  selectedRescueVehicle,
  selectedRescueVehicleId,
} from '../lib/composables/useRescueVehicleView';
import {
  specialOperationViewActive,
  selectedSpecialOperation,
  selectedSpecialOperationId,
} from '../lib/composables/useSpecialOperationView';
import { rescueDrawerActive } from '../lib/composables/useRescueDrawerActive';
import { useAlarmDetailPanel } from '../lib/composables/useAlarmDetailPanel';
import { alarms } from '../lib/data/mock';
import { fireAlarmToDetail } from '../lib/data/alarmDetailMock';
import fireAlarmSnapshot from '../assets/semantic-scenes/fire-alarm-pipe-rack.png';

const { alarmDetailOpen, openAlarmDetail } = useAlarmDetailPanel();
const router = useRouter();
const soundLightAlarmOpen = ref(false);
const demoSoundLightAlarm = alarms[0]!;

function openSoundLightAlarm() {
  soundLightAlarmOpen.value = true;
}

function closeSoundLightAlarm() {
  soundLightAlarmOpen.value = false;
}

function openSoundLightAlarmDetail() {
  closeSoundLightAlarm();
  openAlarmDetail(fireAlarmToDetail(demoSoundLightAlarm));
}

function startSoundLightAlarmEmergency() {
  closeSoundLightAlarm();
  void router.push({ path: '/emergency', query: { create: 'event' } });
}

const rightDrawerOpen = computed(
  () =>
    (fireBrigadeViewActive.value && selectedFireBrigadeId.value != null) ||
    (rescueEquipmentViewActive.value && selectedRescueEquipmentId.value != null) ||
    (rescueVehicleViewActive.value && selectedRescueVehicleId.value != null) ||
    (specialOperationViewActive.value && selectedSpecialOperationId.value != null),
);

const listDrawerOpen = computed(
  () =>
    fireBrigadeViewActive.value ||
    rescueEquipmentViewActive.value ||
    rescuePersonnelViewActive.value ||
    rescueVehicleViewActive.value ||
    specialOperationViewActive.value,
);

/** 抽屉层延迟卸载，保证离开动画能播完 */
const drawerLayerMounted = ref(false);

watch(rescueDrawerActive, (active) => {
  if (active) drawerLayerMounted.value = true;
});

function handleListAfterLeave() {
  if (!rescueDrawerActive.value) {
    drawerLayerMounted.value = false;
  }
}
</script>

<template>
  <MapPageShell
    min-width="1366px"
    class="fire-monitoring-shell"
    :class="{
      'fire-monitoring-shell--drawer-active': rescueDrawerActive,
      'fire-monitoring-shell--drawer-right-open': rightDrawerOpen,
      'fire-monitoring-shell--alarm-detail-open': alarmDetailOpen,
    }"
  >
    <template #map>
      <CenterMap @trigger-sound-light-alarm="openSoundLightAlarm" />
      <MapAlarmVideoPopups />
      <AlarmDetailMapOverlay />
      <RescueDrawerMapOverlay v-if="rescueDrawerActive" />
    </template>

    <DashboardLayout module="fire" active-nav="fire" class="fire-monitoring__layout">
      <aside class="sidebar sidebar--left sidebar--primary-left">
        <div class="panel-slot panel-slot--alarm"><SafetyAlarmPanel /></div>
      </aside>

      <aside class="sidebar sidebar--right sidebar--primary-right">
        <div class="panel-slot panel-slot--duty"><DutyInfoPanel /></div>
        <div class="panel-slot panel-slot--special"><SpecialOperationsPanel /></div>
        <div class="panel-slot panel-slot--equipment"><EquipmentMonitoring /></div>
      </aside>
    </DashboardLayout>

    <template #floating>
      <AlarmDetailPanel />
      <SoundLightAlarmDialog
        :open="soundLightAlarmOpen"
        :alarm="demoSoundLightAlarm"
        :image-url="fireAlarmSnapshot"
        @close="closeSoundLightAlarm"
        @detail="openSoundLightAlarmDetail"
        @emergency="startSoundLightAlarmEmergency"
      />
      <div v-if="drawerLayerMounted" class="rescue-drawer-layer">
        <Transition name="drawer-left" appear @after-leave="handleListAfterLeave">
          <aside v-if="listDrawerOpen" class="rescue-drawer rescue-drawer--left">
            <FireBrigadeListPanel v-if="fireBrigadeViewActive" />
            <RescueEquipmentListPanel v-else-if="rescueEquipmentViewActive" />
            <RescuePersonnelListPanel v-else-if="rescuePersonnelViewActive" />
            <RescueVehicleListPanel v-else-if="rescueVehicleViewActive" />
            <SpecialOperationListPanel v-else-if="specialOperationViewActive" />
          </aside>
        </Transition>

        <Transition name="drawer-right" appear>
          <aside
            v-if="fireBrigadeViewActive && selectedFireBrigadeId"
            :key="`brigade-${selectedFireBrigadeId}`"
            class="rescue-drawer rescue-drawer--right"
          >
            <FireBrigadeDetailPanel />
          </aside>
        </Transition>

        <Transition name="drawer-right" appear>
          <aside
            v-if="rescueEquipmentViewActive && selectedRescueEquipmentId"
            :key="`equip-${selectedRescueEquipmentId}`"
            class="rescue-drawer rescue-drawer--right"
          >
            <RescueEquipmentDetailPanel
              v-if="selectedRescueEquipment"
              :key="selectedRescueEquipment.id"
              :item="selectedRescueEquipment"
            />
          </aside>
        </Transition>

        <Transition name="drawer-right" appear>
          <aside
            v-if="rescueVehicleViewActive && selectedRescueVehicleId"
            :key="`vehicle-${selectedRescueVehicleId}`"
            class="rescue-drawer rescue-drawer--right"
          >
            <RescueVehicleDetailPanel
              v-if="selectedRescueVehicle"
              :key="selectedRescueVehicle.id"
              :item="selectedRescueVehicle"
            />
          </aside>
        </Transition>

        <Transition name="drawer-right" appear>
          <aside
            v-if="specialOperationViewActive && selectedSpecialOperationId"
            :key="`specop-${selectedSpecialOperationId}`"
            class="rescue-drawer rescue-drawer--right"
          >
            <SpecialOperationDetailPanel
              v-if="selectedSpecialOperation"
              :key="selectedSpecialOperation.id"
              :item="selectedSpecialOperation"
            />
          </aside>
        </Transition>
      </div>
    </template>
  </MapPageShell>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  display: grid;
  min-height: 0;
  pointer-events: auto;
  transition:
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 280ms ease;
  will-change: transform;
}

.sidebar--left {
  grid-template-rows: minmax(0, 1fr);
  align-content: start;
}

.sidebar--right {
  grid-template-rows: minmax(0, 34fr) minmax(0, 25fr) minmax(0, 41fr);
  align-content: start;
  gap: 10px;
}

.panel-slot {
  min-height: 0;
  overflow: hidden;
}

.panel-slot :deep(.panel-card),
.rescue-drawer :deep(.panel-card) {
  height: 100%;
  min-height: 0;
}

.rescue-drawer :deep(.panel-card__content) {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>

<style>
.fire-monitoring-shell--drawer-active .sidebar--primary-left {
  transform: translateX(-110%);
  opacity: 0;
  pointer-events: none;
}

.fire-monitoring-shell--drawer-active .sidebar--primary-right {
  transform: translateX(110%);
  opacity: 0;
  pointer-events: none;
}

.rescue-drawer-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: var(--z-base);
}

.rescue-drawer {
  position: absolute;
  top: calc(var(--header-height) + 8px);
  bottom: 54px;
  width: 420px;
  pointer-events: auto;
  will-change: transform, opacity;
}

.rescue-drawer--left {
  left: 19px;
}

.rescue-drawer--right {
  right: 19px;
}

.fire-monitoring-shell--drawer-active:not(.fire-monitoring-shell--drawer-right-open) {
  --map-controls-right: 16px;
}

.fire-monitoring-shell--drawer-right-open {
  --map-controls-right: calc(420px + 19px + 16px);
}

.fire-monitoring-shell--alarm-detail-open .sidebar--primary-right {
  transform: translateX(110%);
  opacity: 0;
  pointer-events: none;
}

.fire-monitoring-shell--alarm-detail-open {
  --map-controls-right: calc(470px + 19px + 16px);
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
