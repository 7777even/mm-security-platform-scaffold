<!--
  生产应急（六大模块之五）
  对齐原型图 §生产应急：
    左：生产设施总览（6格 2×3）/ 设备总览（8格 4×2）
    中：Cesium 地图（中央底图）
    右：生产区域安全告警（4条）/ 重大风险管控（3 色预警 + 二维码健康证）
    底：告警统计条（全宽 5 项横排；:deep 覆盖 ModuleLayout 默认居中为全宽贴底）
  使用统一骨架 ModuleLayout。
-->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ModuleLayout from '@/components/layout/ModuleLayout.vue';
import ProductionFacilityOverviewPanel from '@/components/ops-monitor/ProductionFacilityOverviewPanel.vue';
import EquipmentOverviewPanel from '@/components/ops-monitor/EquipmentOverviewPanel.vue';
import ProductionAlarmPanel from '@/components/ops-monitor/ProductionAlarmPanel.vue';
import MajorRiskPanel from '@/components/ops-monitor/MajorRiskPanel.vue';
import AlarmStatsBar from '@/components/ops-monitor/AlarmStatsBar.vue';
import type { MapPoint, RiskZone } from '@/services/map';
import {
  fetchAlarmPoints,
  fetchDevicePoints,
  fetchRiskZones,
  FALLBACK_ALARM_POINTS,
  FALLBACK_DEVICE_POINTS,
  FALLBACK_RISK_ZONES,
} from '@/services/map';

const loading = ref(true);
const alarmPoints = ref<MapPoint[]>([]);
const devicePoints = ref<MapPoint[]>([]);
const riskZones = ref<RiskZone[]>([]);

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
  <ModuleLayout :alarms="alarmPoints" :devices="devicePoints" :zones="riskZones" :loading="loading">
    <!-- 左列：2 块数据面板 -->
    <template #left>
      <ProductionFacilityOverviewPanel />
      <EquipmentOverviewPanel />
    </template>

    <!-- 右列：告警列表 + 重大风险 -->
    <template #right>
      <ProductionAlarmPanel />
      <MajorRiskPanel />
    </template>

    <!-- 底部全宽告警统计条 -->
    <template #bottom>
      <AlarmStatsBar />
    </template>
  </ModuleLayout>
</template>

<style scoped>
/* 生产应急专属：把 ModuleLayout #bottom 默认的居中胶囊改为左侧贴边、右侧给右列数据列让位的部分宽度条 */
:deep(.module-map__bottom) {
  left: var(--space-md);
  right: calc(var(--layout-aside-w) + var(--space-md) * 2);
  bottom: var(--space-md);
  transform: none;
}
</style>
