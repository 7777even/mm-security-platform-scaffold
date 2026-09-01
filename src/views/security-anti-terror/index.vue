<!--
  治安防恐（六大模块之四）
  对齐原型图 §安全防恐：
    左：出入统计（Tab+折线+环形）/ 联动巡查（6格+5G+声光报警）
    中：Cesium 地图（打点+右侧悬浮工具栏+底部一排快捷控制）
    右：告警趋势（折线）/ 告警列表（状态徽标）
  使用统一骨架 ModuleLayout（中央地图+左/右 419px 数据列+底部插槽）。
-->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ModuleLayout from '@/components/layout/ModuleLayout.vue';
import AccessStatsPanel from '@/components/security/AccessStatsPanel.vue';
import LinkPatrolPanel from '@/components/security/LinkPatrolPanel.vue';
import AlarmTrendPanel from '@/components/security/AlarmTrendPanel.vue';
import AlarmListPanel from '@/components/security/AlarmListPanel.vue';
import SecurityInteractionLayer from '@/components/security/SecurityInteractionLayer.vue';
import type { MapPoint } from '@/services/map';
import {
  fetchAlarmPoints,
  fetchDevicePoints,
  FALLBACK_ALARM_POINTS,
  FALLBACK_DEVICE_POINTS,
} from '@/services/map';

// 中央地图打点数据（与消防/应急指挥同源 mock）
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
    <!-- 左侧：出入统计 + 联动巡查 -->
    <template #left>
      <AccessStatsPanel />
      <LinkPatrolPanel />
    </template>

    <!-- 右侧：告警趋势 + 告警列表 -->
    <template #right>
      <AlarmTrendPanel />
      <AlarmListPanel />
    </template>
  </ModuleLayout>

  <!-- 二级界面分发层（点击 → 弹窗/抽屉，不离开模块） -->
  <SecurityInteractionLayer />
</template>
