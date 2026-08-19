<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { MAP_TILE_URL } from '@/constants/map';
import BaseMap from '@/components/cesium/BaseMap.vue';
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

// Cesium 二三维一体化：sceneMode 切换（详细设计 4.2.2.2）
const sceneMode = ref<'2d' | '3d'>('3d');
const mapNotice = ref('');
const mapReady = ref(false);

// 地图点位/区域数据（交由 Cesium BaseMap 渲染；二三维一体化单一 viewer）
const alarmPoints = ref<MapPoint[]>([]);
const devicePoints = ref<MapPoint[]>([]);
const riskZones = ref<RiskZone[]>([]);

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
    // Mock 数据源未连接时降级到静态兜底点位
    alarmPoints.value = FALLBACK_ALARM_POINTS;
    devicePoints.value = FALLBACK_DEVICE_POINTS;
    riskZones.value = FALLBACK_RISK_ZONES;
  } finally {
    mapReady.value = true;
  }
});
</script>

<template>
  <div class="dashboard-map">
    <!-- Cesium 二三维一体化地图（详细设计 4.2.2.2；引擎懒加载，失败自动降级） -->
    <BaseMap
      :tile-url="MAP_TILE_URL"
      :alarms="alarmPoints"
      :devices="devicePoints"
      :zones="riskZones"
      :scene-mode="sceneMode"
      @error="onMapError"
      @mode-change="(m) => (sceneMode = m)"
    />

    <!-- 地图降级提示 -->
    <p v-if="mapNotice" class="map-notice">{{ mapNotice }}</p>

    <!-- 2D/3D 切换 -->
    <div v-if="mapReady" class="mode-switch glass-panel">
      <button
        type="button"
        class="mode-btn"
        :class="{ active: sceneMode === '2d' }"
        @click="sceneMode = '2d'"
      >
        2D
      </button>
      <button
        type="button"
        class="mode-btn"
        :class="{ active: sceneMode === '3d' }"
        @click="sceneMode = '3d'"
      >
        3D
      </button>
    </div>
  </div>
</template>

<style scoped>
.dashboard-map {
  position: relative;
  height: 100%;
  overflow: hidden;
}

/* Cesium 容器内嵌于 dashboard-map，控件样式弱化在 BaseMap 内部处理 */

/* 地图降级提示 */
.map-notice {
  position: absolute;
  top: var(--space-md);
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  background: rgb(250 173 20 / 15%);
  border: 1px solid var(--color-warning);
  color: var(--color-warning);
  font-size: 12px;
}

/* 2D/3D 切换 */
.mode-switch {
  position: absolute;
  top: var(--space-md);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2px;
  padding: 2px;
  z-index: 5;
  border-radius: var(--radius-sm);
  background: rgb(0 212 255 / 10%);
}

.mode-btn {
  padding: 4px 14px;
  font-size: 12px;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.mode-btn.active {
  color: var(--color-accent);
  background: rgb(0 212 255 / 18%);
}
</style>
