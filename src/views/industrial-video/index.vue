<!--
  工业电视（六大模块之四）
  对齐原型图 §工业电视：
    左：视频监控概览 / 视频运行分析（双环形）/ 维修工单 / 事件分析（大环形）
    中：Cesium 地图（中央底图）
    右：重要视频巡查（缩略图网格）/ 厂区巡检（列表）
    底：系统消息横条（占满底部，:deep 覆盖 ModuleLayout 默认居中定位）
  使用统一骨架 ModuleLayout（中央地图+左/右 419px 数据列+底部插槽）。
-->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ModuleLayout from '@/components/layout/ModuleLayout.vue';
import VideoOverviewPanel from '@/components/industrial-video/VideoOverviewPanel.vue';
import VideoAnalysisPanel from '@/components/industrial-video/VideoAnalysisPanel.vue';
import MaintenanceOrderPanel from '@/components/industrial-video/MaintenanceOrderPanel.vue';
import EventAnalysisPanel from '@/components/industrial-video/EventAnalysisPanel.vue';
import VideoPatrolPanel from '@/components/industrial-video/VideoPatrolPanel.vue';
import FactoryInspectionPanel from '@/components/industrial-video/FactoryInspectionPanel.vue';
import SystemNoticeBar from '@/components/industrial-video/SystemNoticeBar.vue';
import IndustrialVideoInteractionLayer from '@/components/industrial-video/IndustrialVideoInteractionLayer.vue';
import type { MapPoint } from '@/services/map';
import {
  fetchAlarmPoints,
  fetchDevicePoints,
  FALLBACK_ALARM_POINTS,
  FALLBACK_DEVICE_POINTS,
} from '@/services/map';

const loading = ref(true);
const alarmPoints = ref<MapPoint[]>([]);
const devicePoints = ref<MapPoint[]>([]);

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
  <ModuleLayout :alarms="alarmPoints" :devices="devicePoints" :loading="loading">
    <!-- 左列：4 块数据面板 -->
    <template #left>
      <VideoOverviewPanel />
      <VideoAnalysisPanel />
      <MaintenanceOrderPanel />
      <EventAnalysisPanel />
    </template>

    <!-- 右列：视频巡查 + 厂区巡检 -->
    <template #right>
      <VideoPatrolPanel />
      <FactoryInspectionPanel />
    </template>

    <!-- 底部全宽系统消息横条 -->
    <template #bottom>
      <SystemNoticeBar />
    </template>
  </ModuleLayout>

  <!-- 二级界面分发层（点击 → 弹窗/抽屉，不离开模块） -->
  <IndustrialVideoInteractionLayer />
</template>

<style scoped>
/* 工业电视专属：把 ModuleLayout #bottom 默认的居中胶囊改为全宽贴底横条 */
:deep(.module-map__bottom) {
  left: var(--space-md);
  right: var(--space-md);
  bottom: var(--space-md);
  transform: none;
}
</style>
