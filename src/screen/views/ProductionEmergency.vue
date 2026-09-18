<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import DashboardLayout from '../components/layout/DashboardLayout.vue';
import MapPageShell from '../components/map/MapPageShell.vue';
import ProductionMap from '../components/map/ProductionMap.vue';
import AlarmDetailMapOverlay from '../components/map/AlarmDetailMapOverlay.vue';
import AlarmDetailPanel from '../components/common/AlarmDetailPanel.vue';
import FacilitiesOverview from '../components/panels/production/FacilitiesOverview.vue';
import DeviceOverview from '../components/panels/production/DeviceOverview.vue';
import ProductionAlarmPanel from '../components/panels/production/ProductionAlarmPanel.vue';
import RiskControlPanel from '../components/panels/production/RiskControlPanel.vue';
import StatsOverviewBar from '../components/panels/production/StatsOverviewBar.vue';
import ProductionDeviceListPanel from '../components/panels/production/ProductionDeviceListPanel.vue';
import ProductionDeviceLedgerPanel from '../components/panels/production/ProductionDeviceLedgerPanel.vue';
import ProductionWorkstationPanel from '../components/panels/production/ProductionWorkstationPanel.vue';
import { productionDeviceDrawerActive } from '../lib/composables/useProductionDeviceListView';
import { useAlarmDetailPanel } from '../lib/composables/useAlarmDetailPanel';

const { alarmDetailOpen } = useAlarmDetailPanel();

const drawerLayerMounted = ref(false);

watch(
  productionDeviceDrawerActive,
  (active) => {
    if (active) drawerLayerMounted.value = true;
  },
  { immediate: true },
);

function handleDeviceDrawerAfterLeave() {
  if (!productionDeviceDrawerActive.value) {
    drawerLayerMounted.value = false;
  }
}

const shellDrawerActive = computed(() => productionDeviceDrawerActive.value);
</script>

<template>
  <MapPageShell
    min-width="1920px"
    class="production-shell"
    :class="{
      'production-shell--drawer-active': shellDrawerActive,
      'production-shell--alarm-detail-open': alarmDetailOpen,
    }"
  >
    <template #map>
      <ProductionMap />
      <AlarmDetailMapOverlay />
    </template>

    <template #floating>
      <AlarmDetailPanel />
      <div v-if="drawerLayerMounted" class="production-drawer-layer">
        <Transition name="drawer-right" appear @after-leave="handleDeviceDrawerAfterLeave">
          <aside
            v-if="productionDeviceDrawerActive"
            key="production-device-list"
            class="production-drawer production-drawer--right"
          >
            <ProductionDeviceListPanel />
          </aside>
        </Transition>
      </div>
    </template>

    <DashboardLayout
      module="production"
      active-nav="production"
      class="production-emergency__layout"
    >
      <div class="production-body">
        <aside class="sidebar sidebar--left sidebar--primary-left">
          <FacilitiesOverview />
          <DeviceOverview />
          <ProductionDeviceLedgerPanel />
          <ProductionWorkstationPanel />
        </aside>

        <aside class="sidebar sidebar--right sidebar--primary-right">
          <ProductionAlarmPanel />
          <RiskControlPanel />
        </aside>

        <StatsOverviewBar class="production-body__stats" />
      </div>
    </DashboardLayout>
  </MapPageShell>
</template>

<style scoped>
.production-drawer-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: var(--z-overlay);
}

.production-drawer {
  position: absolute;
  top: 112px;
  width: 520px;
  height: calc(100% - 112px - 154px);
  pointer-events: auto;
}

.production-drawer--right {
  right: 18px;
}

.drawer-right-enter-active,
.drawer-right-leave-active {
  transition:
    transform 0.26s ease,
    opacity 0.26s ease;
}

.drawer-right-enter-from,
.drawer-right-leave-to {
  transform: translateX(24px);
  opacity: 0;
}

.production-shell--drawer-active .sidebar--primary-left {
  transform: translateX(-110%);
  opacity: 0;
  pointer-events: none;
}

.production-shell--drawer-active .sidebar--primary-right {
  transform: translateX(110%);
  opacity: 0;
  pointer-events: none;
}

.production-shell--drawer-active .production-body__stats {
  opacity: 0;
  pointer-events: none;
}

.sidebar--primary-left,
.sidebar--primary-right,
.production-body__stats {
  transition:
    transform 0.26s ease,
    opacity 0.26s ease;
}

.production-emergency__layout :deep(.dashboard-layout__main) {
  padding: 0;
  min-height: 0;
}

.production-body {
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
  padding: 14px 18px 130px;
}

.sidebar {
  display: grid;
  min-height: 0;
  pointer-events: auto;
  flex-shrink: 0;
}

/*
 * 左栏四段比例：设备台账需 ≥1.5 段才能露出数据行（表头 30px + 行高 38px），
 * 原来「1fr」仅余 34px 可视区 → 一行数据都看不见（表格像空的）；值守工位在
 * 0.9 段时其内容刚好完整容纳（实测 clientHeight === scrollHeight），故让出高度。
 */
.sidebar--left {
  /* 与其余大屏页签同宽（消防/治安/电视/应急指挥侧栏均 414–419px）：
     原写死 338px（--layout-aside-w-narrow）是全大屏唯一一例，视觉上左右不对称、面板比别页窄一圈。 */
  width: var(--sidebar-width);
  grid-template-rows:
    minmax(0, 1.15fr)
    minmax(0, 1.25fr)
    minmax(0, 1.6fr)
    minmax(0, 0.9fr);
  align-content: start;
  gap: 11px;
}

/*
 * 右栏原为固定 592px/295px，按设计稿比例算下来比左栏总高少 39px
 * → 右栏底部留空、与左栏不齐。改用设计稿原始比例（582+43 / 285+43）作 fr 权重填满整列。
 */
.sidebar--right {
  width: var(--sidebar-width);
  grid-template-rows: minmax(0, 592fr) minmax(0, 295fr);
  gap: 10px;
}

.sidebar > :deep(.panel-card) {
  height: 100%;
  min-height: 0;
}

.production-body__stats {
  position: absolute;
  left: 17px;
  right: 465px;
  bottom: 8px;
  z-index: var(--z-chrome);
  pointer-events: auto;
}

.production-shell--alarm-detail-open .sidebar--primary-right {
  transform: translateX(110%);
  opacity: 0;
  pointer-events: none;
}
</style>
