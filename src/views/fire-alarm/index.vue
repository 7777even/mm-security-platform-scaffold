<!--
  views/fire-alarm/index.vue — 消防报警 Tab 业务视图（wujie 子应用挂载点）
  布局（对齐原型）：左 4 面板（数据力量/特殊作业/设施监测/值班信息）+ 中央地图 + 右 2 面板（消防设备/消防告警）
  底部：系统消息条（绝对定位，不影响面板滚动）。
-->
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import SharedCesiumMap from '@/components/map/SharedCesiumMap.vue';
import AccidentRescueMarkersOverlay from '@/components/map/AccidentRescueMarkersOverlay.vue';
import FireStrengthPanel from '@/components/fire/FireStrengthPanel.vue';
import SpecialWorkPanel from '@/components/fire/SpecialWorkPanel.vue';
import FireFacilityPanel from '@/components/fire/FireFacilityPanel.vue';
import FireDevicePanel from '@/components/fire/FireDevicePanel.vue';
import FireAlarmPanel from '@/components/fire/FireAlarmPanel.vue';
import FireDutyPanel from '@/components/fire/FireDutyPanel.vue';
import FireAlarmInteractionLayer from '@/components/fire/FireAlarmInteractionLayer.vue';
import {
  fetchAlarmPoints,
  fetchDevicePoints,
  FALLBACK_ALARM_POINTS,
  FALLBACK_DEVICE_POINTS,
  type MapPoint,
} from '@/services/map';
import { toMonitoringPoints } from '@/services/map-adapter';

const loading = ref(true);

const alarmPoints = ref<MapPoint[]>([]);
const devicePoints = ref<MapPoint[]>([]);

// 覆盖层监测点：报警/设备点位经适配层映射为源项目 HTML 覆盖层输入
const monitoringPoints = computed(() => [
  ...toMonitoringPoints(alarmPoints.value, 'alarm'),
  ...toMonitoringPoints(devicePoints.value, 'device'),
]);

onMounted(async () => {
  try {
    const [ap, dp] = await Promise.all([fetchAlarmPoints(), fetchDevicePoints()]);
    alarmPoints.value = ap;
    devicePoints.value = dp;
  } catch {
    alarmPoints.value = FALLBACK_ALARM_POINTS;
    devicePoints.value = FALLBACK_DEVICE_POINTS;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="dashboard dashboard-map">
    <!-- 源项目地图底座：Esri 影像 + 世界地形 + 茂名石化装置区立体渲染 -->
    <SharedCesiumMap />
    <!-- 报警/设备点位覆盖层（HTML 锚定，worldToScreen 跟随相机） -->
    <AccidentRescueMarkersOverlay :monitoring-points="monitoringPoints" class="dash-map-overlay" />

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

    <!-- 消防报警模块二级界面分发层（点击 → 二级界面，不离开模块） -->
    <FireAlarmInteractionLayer />

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
  z-index: var(--z-overlay);
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  background: var(--notice-warning-bg);
  border: 1px solid var(--color-warning);
  color: var(--color-warning);
  font-size: var(--font-size-helper);
}

/* 左侧面板区：4 个面板自然撑开，超出可滚动但隐藏滚动条 */
.dash-left {
  position: absolute;
  top: var(--space-md);
  left: var(--space-md);
  bottom: var(--space-md);
  width: var(--layout-aside-w);
  z-index: var(--z-chrome);
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
  z-index: var(--z-chrome);
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
  z-index: var(--z-chrome);
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
  z-index: var(--z-chrome);
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
