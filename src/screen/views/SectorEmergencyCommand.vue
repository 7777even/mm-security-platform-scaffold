<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { setCesiumMapModeOverride } from '../lib/composables/sharedCesiumBridge';
import DashboardLayout from '../components/layout/DashboardLayout.vue';
import MapPageShell from '../components/map/MapPageShell.vue';
import FireEmergencyMap from '../components/map/FireEmergencyMap.vue';
import RescueDrawerMapOverlay from '../components/map/RescueDrawerMapOverlay.vue';
import EmergencyEventListPanel from '../components/panels/preliminary/EmergencyEventListPanel.vue';
import EmergencyClosedCasesPanel from '../components/panels/preliminary/EmergencyClosedCasesPanel.vue';
import DutyWatchPanel from '../components/panels/preliminary/DutyWatchPanel.vue';
import EmergencyRescuePanel from '../components/panels/preliminary/EmergencyRescuePanel.vue';
import SafetyKnowledgePanel from '../components/panels/preliminary/SafetyKnowledgePanel.vue';
import FireBrigadeListPanel from '../components/panels/FireBrigadeListPanel.vue';
import FireBrigadeDetailPanel from '../components/panels/FireBrigadeDetailPanel.vue';
import RescueEquipmentListPanel from '../components/panels/RescueEquipmentListPanel.vue';
import RescueEquipmentDetailPanel from '../components/panels/RescueEquipmentDetailPanel.vue';
import RescueVehicleListPanel from '../components/panels/RescueVehicleListPanel.vue';
import RescueVehicleDetailPanel from '../components/panels/RescueVehicleDetailPanel.vue';
import StrengthItemsListPanel from '../components/panels/StrengthItemsListPanel.vue';
import StrengthItemDetailPanel from '../components/panels/StrengthItemDetailPanel.vue';
import {
  fireBrigadeViewActive,
  selectedFireBrigadeId,
  openFireBrigadeView,
  closeFireBrigadeView,
} from '../lib/composables/useFireBrigadeView';
import {
  rescueEquipmentViewActive,
  selectedRescueEquipment,
  selectedRescueEquipmentId,
  openRescueEquipmentView,
  closeRescueEquipmentView,
} from '../lib/composables/useRescueEquipmentView';
import {
  rescueVehicleViewActive,
  selectedRescueVehicle,
  selectedRescueVehicleId,
  openRescueVehicleView,
  closeRescueVehicleView,
} from '../lib/composables/useRescueVehicleView';
import { rescueDrawerActive } from '../lib/composables/useRescueDrawerActive';
import {
  rescueStrengthViewActive,
  selectedRescueStrengthIndex,
  openRescueStrengthView,
  closeRescueStrengthView,
} from '../lib/composables/useRescueStrengthView';

onMounted(() => {
  setCesiumMapModeOverride('fire-emergency');
});

onUnmounted(() => {
  setCesiumMapModeOverride(null);
});

// —— 救援力量浮层（与消防报警模块一致）：点击应急指挥「应急救援力量」卡片打开救援资源浮层 ——
const RESCUE_FORCE_OVERLAY_MAP: Record<string, () => void> = {
  救援队伍: openFireBrigadeView,
  救援装备: openRescueEquipmentView,
  应急车辆: openRescueVehicleView,
};

function openRescueForceOverlay(payload: {
  label: string;
  items: import('@/services/emergency').StrengthItem[] | null;
}) {
  // 打开一个浮层前先关闭其余浮层（与消防报警 DutyInfoPanel 行为一致）
  closeFireBrigadeView();
  closeRescueEquipmentView();
  closeRescueVehicleView();
  closeRescueStrengthView();
  const opener = RESCUE_FORCE_OVERLAY_MAP[payload.label];
  if (opener) {
    opener();
    return;
  }
  // 其余 5 类（应急专家/应急物资/应急场所/医疗机构/消防设施）打开通用 strength 浮层
  openRescueStrengthView(payload.label, payload.items);
}

const listDrawerOpen = computed(
  () =>
    fireBrigadeViewActive.value ||
    rescueEquipmentViewActive.value ||
    rescueVehicleViewActive.value ||
    rescueStrengthViewActive.value,
);
// 抽屉层延迟卸载，保证离开动画能播完
const drawerLayerMounted = ref(false);
watch(rescueDrawerActive, (active) => {
  if (active) drawerLayerMounted.value = true;
});
function handleListAfterLeave() {
  if (!rescueDrawerActive.value) drawerLayerMounted.value = false;
}
</script>

<template>
  <MapPageShell
    min-width="1920px"
    :class="{ 'sector-emergency__layout--drawer-active': rescueDrawerActive }"
  >
    <template #map>
      <FireEmergencyMap />
      <RescueDrawerMapOverlay v-if="rescueDrawerActive" />
    </template>

    <DashboardLayout
      module="fireEmergency"
      active-nav="emergency"
      class="sector-emergency__layout sector-emergency__layout--emergency"
    >
      <div class="sector-emergency-body">
        <aside class="sidebar sidebar--left sidebar--left-emergency">
          <EmergencyEventListPanel module="fireEmergency" show-event-tabs />
          <EmergencyClosedCasesPanel />
        </aside>

        <aside class="sidebar sidebar--right sidebar--right-emergency">
          <DutyWatchPanel module="fireEmergency" />
          <EmergencyRescuePanel
            module="fireEmergency"
            @open-rescue-force="openRescueForceOverlay"
          />
          <SafetyKnowledgePanel module="fireEmergency" />
        </aside>
      </div>
    </DashboardLayout>

    <template #floating>
      <div v-if="drawerLayerMounted" class="rescue-drawer-layer">
        <Transition name="drawer-left" appear @after-leave="handleListAfterLeave">
          <aside v-if="listDrawerOpen" class="rescue-drawer rescue-drawer--left">
            <FireBrigadeListPanel v-if="fireBrigadeViewActive" />
            <RescueEquipmentListPanel v-else-if="rescueEquipmentViewActive" />
            <RescueVehicleListPanel v-else-if="rescueVehicleViewActive" />
            <StrengthItemsListPanel v-else-if="rescueStrengthViewActive" />
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
            v-if="rescueStrengthViewActive && selectedRescueStrengthIndex != null"
            :key="`strength-${selectedRescueStrengthIndex}`"
            class="rescue-drawer rescue-drawer--right"
          >
            <StrengthItemDetailPanel />
          </aside>
        </Transition>
      </div>
    </template>
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
  /* 与其余大屏页签侧栏同宽（原 414px 为历史遗留差异） */
  width: var(--sidebar-width);
  height: 897px;
  max-height: calc(100% - 5px);
  grid-template-rows: minmax(0, 1.7fr) minmax(0, 1fr);
  gap: 7px;
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

/* 浮层内面板撑满抽屉高度（与消防报警模块 .rescue-drawer :deep 规则一致） */
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

<!--
  救援资源浮层的「定位 / 收起侧栏 / 出入场过渡」必须是全局非 scoped 样式：
  /emergency 与 /fire 是彼此独立的懒加载路由，FireMonitoring.vue 里那份全局
  样式在本路由下不会被注入，缺了它浮层会退化成铺满全屏、且因继承父层
  pointer-events:none 而点不动的裸 div。此处与 FireMonitoring.vue /
  SecurityAntiTerror.vue 的同类全局块保持逐字一致。
-->
<style>
.sector-emergency__layout--drawer-active .sidebar--left-emergency {
  transform: translateX(-110%);
  opacity: 0;
  pointer-events: none;
}

.sector-emergency__layout--drawer-active .sidebar--right-emergency {
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
