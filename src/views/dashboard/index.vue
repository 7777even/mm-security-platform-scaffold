<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart, type LineSeriesOption } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ComposeOption } from 'echarts/core';
import { markOnce } from '@/utils/perf';
import { readCssVar } from '@/utils/theme';
import SharedCesiumMap from '@/components/map/SharedCesiumMap.vue';
import AccidentRescueMarkersOverlay from '@/components/map/AccidentRescueMarkersOverlay.vue';
import {
  fetchAlarmPoints,
  fetchDevicePoints,
  FALLBACK_ALARM_POINTS,
  FALLBACK_DEVICE_POINTS,
  type MapPoint,
} from '@/services/map';
import { toMonitoringPoints } from '@/services/map-adapter';
import DutyPanel from '@/components/dashboard/DutyPanel.vue';
import EmergencyStrengthPanel from '@/components/dashboard/EmergencyStrengthPanel.vue';
import EmergencyKnowledgePanel from '@/components/dashboard/EmergencyKnowledgePanel.vue';
import EmergencyEventCrudPanel from '@/components/dashboard/EmergencyEventCrudPanel.vue';
import { fetchAlarmTrend } from '@/services/alarm';

// 按需注册 ECharts 模块，控制产物体积
echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

type ECOption = ComposeOption<LineSeriesOption>;

// 图表配色（ECharts canvas 需显式色值，统一从设计 token 解析，保证主题切换一致）
function chartTheme() {
  return {
    accent: readCssVar('--chart-accent', 'var(--color-accent)'),
    success: readCssVar('--chart-success', 'var(--color-success)'),
    text: readCssVar('--chart-text', 'var(--color-text-muted)'),
    textStrong: readCssVar('--chart-text-strong', 'var(--color-text)'),
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

// 地图点位数据（报警/设备）
const alarmPoints = ref<MapPoint[]>([]);
const devicePoints = ref<MapPoint[]>([]);

// 覆盖层监测点：报警/设备点位经适配层映射为源项目 HTML 覆盖层输入
const monitoringPoints = computed(() => [
  ...toMonitoringPoints(alarmPoints.value, 'alarm'),
  ...toMonitoringPoints(devicePoints.value, 'device'),
]);

// 预案库改由 /dashboard/plans 路由直接访问，dashboard 主壳不再内联覆盖层
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
    const [trend, ap, dp] = await Promise.all([
      fetchAlarmTrend(),
      fetchAlarmPoints(),
      fetchDevicePoints(),
    ]);
    trendData.value = Array.from({ length: 24 }, (_, i) => trend[i]?.count ?? 0);
    alarmPoints.value = ap;
    devicePoints.value = dp;
    markOnce('dashboard:data-ready');
  } catch {
    alarmPoints.value = FALLBACK_ALARM_POINTS;
    devicePoints.value = FALLBACK_DEVICE_POINTS;
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
    <!-- 源项目地图底座：Esri 影像 + 世界地形 + 茂名石化装置区立体渲染 -->
    <SharedCesiumMap />
    <!-- 报警/设备点位覆盖层（HTML 锚定，worldToScreen 跟随相机） -->
    <AccidentRescueMarkersOverlay :monitoring-points="monitoringPoints" class="dash-map-overlay" />

    <!-- 左侧面板区：应急事件 CRUD（按图示单一全高面板） -->
    <div v-if="!loading" class="dash-left">
      <EmergencyEventCrudPanel />
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

    <!-- 预案库由 /dashboard/plans 路由访问，此处不再内联覆盖层 -->
  </div>
</template>

<style scoped>
.dashboard-map {
  position: relative;
  height: 100%;

  /* 不裁切子元素的溢出滚动：dash-left / dash-right 内部 overflow-y:auto 仍可滚 */
}

/* 地图覆盖层铺满容器（与底座同层，世界坐标锚定由 overlay 内部处理） */
.dash-map-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* 左侧面板区：3 个面板自然撑开，超出可滚动但隐藏滚动条 */
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
  z-index: var(--z-chrome);
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
  font-size: var(--font-size-stat-label);
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
