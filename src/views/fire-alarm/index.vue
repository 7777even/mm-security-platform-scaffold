<!--
  views/fire-alarm/index.vue — 消防报警 Tab 业务视图（wujie 子应用挂载点）
  布局（对齐原型）：左 4 面板（数据力量/特殊作业/设施监测/值班信息）+ 中央地图 + 右 2 面板（消防设备/消防告警）
  底部：系统消息条（绝对定位，不影响面板滚动）。
-->
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { MAP_TILE_URL } from '@/constants/map';
import BaseMap from '@/components/cesium/BaseMap.vue';
import type { ClusterPoint } from '@/services/cesium-cluster';
import FireStrengthPanel from '@/components/fire/FireStrengthPanel.vue';
import SpecialWorkPanel from '@/components/fire/SpecialWorkPanel.vue';
import FireFacilityPanel from '@/components/fire/FireFacilityPanel.vue';
import FireDevicePanel from '@/components/fire/FireDevicePanel.vue';
import FireAlarmPanel from '@/components/fire/FireAlarmPanel.vue';
import FireDutyPanel from '@/components/fire/FireDutyPanel.vue';
import {
  fetchAlarmPoints,
  fetchDevicePoints,
  fetchRiskZones,
  FALLBACK_ALARM_POINTS,
  FALLBACK_DEVICE_POINTS,
  FALLBACK_RISK_ZONES,
  type MapPoint,
  type RiskZone,
} from '@/services/map';

const loading = ref(true);
const mapNotice = ref('');

const alarmPoints = ref<MapPoint[]>([]);
const devicePoints = ref<MapPoint[]>([]);
const riskZones = ref<RiskZone[]>([]);

// Cesium 二三维一体化：sceneMode 切换
const sceneMode = ref<'2d' | '3d'>('3d');

// 聚合打点数据：复用地图底座聚合图层
const clusterPoints = computed<ClusterPoint[]>(() => [
  ...alarmPoints.value.map((p) => ({
    id: `alarm:${p.id}`,
    name: p.name,
    lng: p.lng,
    lat: p.lat,
    type: 'alarm',
    raw: { ...p },
  })),
  ...devicePoints.value.map((p) => ({
    id: `device:${p.id}`,
    name: p.name,
    lng: p.lng,
    lat: p.lat,
    type: 'device',
    raw: { ...p },
  })),
]);

function onMapError(): void {
  mapNotice.value = '地图初始化失败：当前环境不支持 WebGL，已降级';
  sceneMode.value = '2d';
}

onMounted(async () => {
  try {
    const [ap, dp, zones] = await Promise.all([
      fetchAlarmPoints(),
      fetchDevicePoints(),
      fetchRiskZones(),
    ]);
    alarmPoints.value = ap;
    devicePoints.value = dp;
    riskZones.value = zones;
  } catch {
    alarmPoints.value = FALLBACK_ALARM_POINTS;
    devicePoints.value = FALLBACK_DEVICE_POINTS;
    riskZones.value = FALLBACK_RISK_ZONES;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="dashboard dashboard-map">
    <!-- Cesium 二三维一体化地图（中央主视觉） -->
    <BaseMap
      :tile-url="MAP_TILE_URL"
      :alarms="alarmPoints"
      :devices="devicePoints"
      :zones="riskZones"
      :cluster-points="clusterPoints"
      :scene-mode="sceneMode"
      @error="onMapError"
      @mode-change="(m) => (sceneMode = m)"
    />
    <!-- 地图降级提示 -->
    <p v-if="mapNotice" class="map-notice">{{ mapNotice }}</p>

    <!-- 左侧面板区：消防数据力量 + 特殊作业 + 消防设施运行监测 + 值班信息 -->
    <div v-if="!loading" class="dash-left">
      <FireStrengthPanel />
      <SpecialWorkPanel />
      <FireFacilityPanel />
      <FireDutyPanel />
    </div>

    <!-- 右侧面板区：消防设备 + 消防告警 -->
    <aside v-if="!loading" class="dash-right">
      <FireDevicePanel />
      <FireAlarmPanel />
    </aside>

    <!-- 底部：系统消息条（绝对定位，不影响面板滚动） -->
    <div class="foot-tools">
      <!-- <div class="foot-tools__msg">
        <SystemMessageBar />
      </div> -->
    </div>

    <!-- 加载骨架屏 -->
    <div v-if="loading" class="dashboard-skeleton" data-test="firealarm-skeleton">
      <span class="skeleton skeleton-line" style="width: 200px" />
      <span class="skeleton skeleton-line" style="width: 160px" />
      <span class="skeleton skeleton-line" style="width: 180px" />
    </div>
  </div>
</template>

<style scoped>
.dashboard-map {
  position: relative;
  height: 100%;
}

/* 地图降级提示 */
.map-notice {
  position: absolute;
  top: var(--space-md);
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  background: var(--notice-warning-bg);
  border: 1px solid var(--color-warning);
  color: var(--color-warning);
  font-size: 12px;
}

/* 左侧面板区：4 个面板自然撑开，超出可滚动但隐藏滚动条 */
.dash-left {
  position: absolute;
  top: var(--space-md);
  left: var(--space-md);
  bottom: var(--space-md);
  width: var(--layout-aside-w);
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* 右侧面板区：2 个面板自然撑开，超出可滚动但隐藏滚动条 */
.dash-right {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  bottom: var(--space-md);
  width: var(--layout-aside-w);
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.dash-left::-webkit-scrollbar,
.dash-right::-webkit-scrollbar {
  width: 0;
  height: 0;
  background: transparent;
}

/* 底部系统消息条 + 地图快捷工具定位层 */
.foot-tools {
  position: absolute;
  inset: auto 0 0;
  z-index: 15;
  pointer-events: none;
}

.foot-tools__msg {
  position: absolute;
  bottom: 64px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: auto;
}

/* 骨架屏 */
.dashboard-skeleton {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--color-bg);
}

.skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    var(--skeleton-base),
    var(--skeleton-hi),
    var(--skeleton-base)
  );
  background-size: 200% 100%;
  animation: skeleton-sweep 1.4s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

.skeleton-line {
  height: 16px;
}

@keyframes skeleton-sweep {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
