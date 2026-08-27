<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart, type LineSeriesOption } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ComposeOption } from 'echarts/core';
import { MAP_TILE_URL } from '@/constants/map';
import { markOnce } from '@/utils/perf';
import { readCssVar } from '@/utils/theme';
import BaseMap from '@/components/cesium/BaseMap.vue';
import type { ClusterPoint } from '@/services/cesium-cluster';
import PanelCard from '@/components/common/PanelCard.vue';
import AppButton from '@/components/common/AppButton.vue';
import DutyPanel from '@/components/dashboard/DutyPanel.vue';
import EmergencyStrengthPanel from '@/components/dashboard/EmergencyStrengthPanel.vue';
import EmergencyKnowledgePanel from '@/components/dashboard/EmergencyKnowledgePanel.vue';
import ClosedCasePanel from '@/components/dashboard/ClosedCasePanel.vue';
import EmergencyEventCrudPanel from '@/components/dashboard/EmergencyEventCrudPanel.vue';
import PlansView from './plans.vue';
import SecondaryPageOverlay from '@/components/common/SecondaryPageOverlay.vue';
import { fetchAlarmTrend } from '@/services/alarm';
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

// 按需注册 ECharts 模块，控制产物体积
echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

type ECOption = ComposeOption<LineSeriesOption>;

// 图表配色（ECharts canvas 需显式色值，统一从设计 token 解析，保证主题切换一致）
function chartTheme() {
  return {
    accent: readCssVar('--chart-accent', '#00d8ff'),
    success: readCssVar('--chart-success', '#2ee6a8'),
    text: readCssVar('--chart-text', '#8fa6c8'),
    textStrong: readCssVar('--chart-text-strong', '#eaf4ff'),
    panelBg: readCssVar('--chart-panel-bg', 'rgba(19, 35, 60, 0.92)'),
    panelBorder: readCssVar('--chart-panel-border', 'rgba(0, 216, 255, 0.4)'),
    axisLine: readCssVar('--chart-axis-line', 'rgba(0, 216, 255, 0.3)'),
    gridLine: readCssVar('--chart-grid-line', 'rgba(0, 216, 255, 0.12)'),
    lineGlow: readCssVar('--chart-line-glow', 'rgba(0, 216, 255, 0.6)'),
    areaTop: readCssVar('--chart-area-top', 'rgba(0, 216, 255, 0.28)'),
  };
}

const chartRef = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

const loading = ref(true);
const mapNotice = ref('');

// 地图点位/区域数据
const alarmPoints = ref<MapPoint[]>([]);
const devicePoints = ref<MapPoint[]>([]);
const riskZones = ref<RiskZone[]>([]);

// 聚合打点数据：复用地图底座聚合图层，将报警/设备点位统一接入（遵循项目 UI 规范着色）
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

// Cesium 二三维一体化：sceneMode 切换
const sceneMode = ref<'2d' | '3d'>('3d');

function onMapError(): void {
  mapNotice.value = '地图初始化失败：当前环境不支持 WebGL，已降级';
  sceneMode.value = '2d';
}

// 预案库在 dashboard 主壳内联预览，而非跳转到独立页面
const plansOpen = ref(false);
function openPlans(): void {
  plansOpen.value = true;
}
function closePlans(): void {
  plansOpen.value = false;
}

const FALLBACK_TREND = [0, 1, 0, 2, 1, 3, 2, 1, 0, 2, 4, 3, 2, 1, 3, 5, 4, 6, 3, 2, 4, 3, 2, 1];
const trendData = ref<number[]>(FALLBACK_TREND);

function hours(): string[] {
  const list: string[] = [];
  const nowTime = new Date();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(nowTime.getTime() - i * 3600 * 1000);
    list.push(`${String(d.getHours()).padStart(2, '0')}:00`);
  }
  return list;
}

function renderChart(): void {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value);
  const c = chartTheme();
  const fontSize = Number(readCssVar('--font-size-helper', '12')) || 12;
  const option: ECOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: c.panelBg,
      borderColor: c.panelBorder,
      textStyle: { color: c.textStrong },
    },
    legend: { data: ['应急事件', '处置完成'], textStyle: { color: c.text } },
    grid: { left: 40, right: 16, top: 28, bottom: 24 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: hours(),
      axisLine: { lineStyle: { color: c.axisLine } },
      axisLabel: { color: c.text, fontSize },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: c.gridLine } },
      axisLabel: { color: c.text, fontSize },
    },
    series: [
      {
        name: '应急事件',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: trendData.value,
        lineStyle: {
          color: c.accent,
          width: 2,
          shadowColor: c.lineGlow,
          shadowBlur: 10,
        },
        itemStyle: { color: c.accent },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: c.areaTop },
            { offset: 1, color: 'transparent' },
          ]),
        },
      },
      {
        name: '处置完成',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: trendData.value.map((v) => Math.ceil(v / 2)),
        lineStyle: { color: c.success, width: 2 },
        itemStyle: { color: c.success },
      },
    ],
  };
  chart.setOption(option);
  markOnce('dashboard:chart-ready');
}

function onResize(): void {
  chart?.resize();
}

async function loadData(): Promise<void> {
  try {
    const [trend, ap, dp, zones] = await Promise.all([
      fetchAlarmTrend(),
      fetchAlarmPoints(),
      fetchDevicePoints(),
      fetchRiskZones(),
    ]);
    trendData.value = Array.from({ length: 24 }, (_, i) => trend[i]?.count ?? 0);
    alarmPoints.value = ap;
    devicePoints.value = dp;
    riskZones.value = zones;
    markOnce('dashboard:data-ready');
  } catch {
    alarmPoints.value = FALLBACK_ALARM_POINTS;
    devicePoints.value = FALLBACK_DEVICE_POINTS;
    riskZones.value = FALLBACK_RISK_ZONES;
  } finally {
    loading.value = false;
    await nextTick();
    renderChart();
  }
}

onMounted(async () => {
  window.addEventListener('resize', onResize);
  await loadData();
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  chart?.dispose();
  chart = null;
});
</script>

<template>
  <div class="dashboard dashboard-map">
    <!-- Cesium 二三维一体化地图（中央主视觉，底图经统一深蓝科技色调色与系统基色融合） -->
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

    <!-- 左侧面板区（419px）：应急预案入口 + 应急事件 CRUD + 趋势图 + 结案滚动 -->
    <div v-if="!loading" class="dash-left">
      <PanelCard title="应急预案库" icon="Document">
        <p class="plan-entry">应急预案、现场处置卡集中管理，支撑应急指挥调度。</p>
        <div class="plan-entry__actions">
          <AppButton variant="primary" size="sm" @click="openPlans">进入预案库</AppButton>
        </div>
      </PanelCard>

      <EmergencyEventCrudPanel />

      <PanelCard title="近 24h 应急事件 / 处置率" icon="TrendCharts">
        <div ref="chartRef" class="chart" />
      </PanelCard>

      <ClosedCasePanel />
    </div>

    <!-- 右侧面板区（419px）：值班值守 + 应急力量数据 + 应急生产安全知识 -->
    <aside v-if="!loading" class="dash-right">
      <DutyPanel />
      <EmergencyStrengthPanel />
      <EmergencyKnowledgePanel />
    </aside>

    <!-- 加载骨架屏 -->
    <div v-if="loading" class="dashboard-skeleton" data-test="dashboard-skeleton">
      <span class="skeleton skeleton-line" style="width: 200px" />
      <span class="skeleton skeleton-line" style="width: 160px" />
      <span class="skeleton skeleton-line" style="width: 180px" />
    </div>

    <!-- 预案库主壳内联预览（覆盖层），不跳转独立页面 -->
    <SecondaryPageOverlay v-model:open="plansOpen">
      <PlansView :embedded="true" @close="closePlans" />
    </SecondaryPageOverlay>
  </div>
</template>

<style scoped>
.dashboard-map {
  position: relative;
  height: 100%;

  /* 不裁切子元素的溢出滚动：dash-left / dash-right 内部 overflow-y:auto 仍可滚 */
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

/* 左侧面板区：3 个面板自然撑开，超出可滚动但隐藏滚动条 */
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

  /* 保留滚动能力 + 隐藏滚动条（鼠标滚轮 / 触控板仍可上下滚） */
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge legacy */
}

/* 右侧面板区：3 个面板自然撑开，超出可滚动但隐藏滚动条 */
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

/* Chromium / Safari：::-webkit-scrollbar 设宽 0 隐藏条形 */
.dash-left::-webkit-scrollbar,
.dash-right::-webkit-scrollbar {
  width: 0;
  height: 0;
  background: transparent;
}

/* 趋势图高度自适应面板 */
.chart {
  height: 180px;
  width: 100%;
}

.plan-entry {
  margin: 0 0 var(--space-md);
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.6;
}

/* 顶部核心指标条已移除（按计划：主界面级态势概览不在此展示） */

.plan-entry__actions {
  display: flex;
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
