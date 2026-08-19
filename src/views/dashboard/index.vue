<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart, type LineSeriesOption } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ComposeOption } from 'echarts/core';
import { MAP_TILE_URL } from '@/constants/map';
import { RealtimeClient, type RealtimeMessage } from '@/services/ws';
import { markOnce } from '@/utils/perf';
import { recordPerfAsync } from '@/utils/perf-budget';
import BaseMap from '@/components/cesium/BaseMap.vue';
import {
  fetchDashboardOverview,
  fetchAlarmTrend,
  fetchAlarmPage,
  type AlarmItem,
  type AlarmLevel,
  type AlarmType,
} from '@/services/alarm';
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

// 图表配置色值（ECharts 不消费 CSS 变量，此处集中定义避免魔法字符串）
const CHART_ACCENT = '#00d4ff';
const CHART_SUCCESS = '#52c41a';
const CHART_TEXT = '#7e9bb8';

const LEVEL_META: Record<AlarmLevel, { label: string; tone: string }> = {
  1: { label: '重大', tone: 'danger' },
  2: { label: '预警', tone: 'warning' },
  3: { label: '提示', tone: 'info' },
  4: { label: '提示', tone: 'info' },
};

const TYPE_LABEL: Record<AlarmType, string> = {
  FIRE: '火灾',
  GAS: '气体',
  TEMP: '温度',
  CCTV: '视频',
  SOS: '一键报警',
};

interface Stat {
  label: string;
  value: string;
  unit: string;
  icon: string;
  tone: string;
}

interface AlarmRow {
  id: string;
  level: string;
  tone: string;
  device: string;
  time: string;
}

const chartRef = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;
let wsClient: RealtimeClient | null = null;

// 静态兜底值：Mock 不可达时保留展示
const stats = ref<Stat[]>([
  { label: '在线点位', value: '—', unit: '个', icon: 'Monitor', tone: 'accent' },
  { label: '今日告警', value: '—', unit: '条', icon: 'Bell', tone: 'danger' },
  { label: '风险指数', value: '—', unit: '', icon: 'Odometer', tone: 'warning' },
  { label: '在线工作站', value: '—', unit: '台', icon: 'Monitor', tone: 'success' },
]);
const alarms = ref<AlarmRow[]>([]);
const loading = ref(true);
const mockReady = ref(false);
const mockError = ref('');
const mapNotice = ref('');

// 地图点位/区域数据（交由 Cesium BaseMap 渲染；二三维一体化单一 viewer）
const alarmPoints = ref<MapPoint[]>([]);
const devicePoints = ref<MapPoint[]>([]);
const riskZones = ref<RiskZone[]>([]);

// Cesium 二三维一体化：sceneMode 切换（详细设计 4.2.2.2）
const sceneMode = ref<'2d' | '3d'>('3d');

/** 与 main.ts 同策略：VITE_USE_DEV_MOCK=true 时前端自包含 mock，不连真实 ws */
function isDevMock(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_USE_DEV_MOCK === 'true';
}

function onMapError(): void {
  mapNotice.value = '地图初始化失败：当前环境不支持 WebGL，已降级';
  sceneMode.value = '2d';
}

const FALLBACK_TREND = [0, 1, 0, 2, 1, 3, 2, 1, 0, 2, 4, 3, 2, 1, 3, 5, 4, 6, 3, 2, 4, 3, 2, 1];
const trendData = ref<number[]>(FALLBACK_TREND);

function toAlarmRow(a: AlarmItem): AlarmRow {
  const meta = LEVEL_META[a.level];
  return {
    id: a.alarmId,
    level: meta.label,
    tone: meta.tone,
    device: a.location || `${TYPE_LABEL[a.type] ?? a.type} ${a.deviceCode.slice(-4)}`,
    time: formatTime(a.ts),
  };
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

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
  const option: ECOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 30, 54, 0.92)',
      borderColor: 'rgba(0, 212, 255, 0.4)',
      textStyle: { color: '#eaf2fb' },
    },
    legend: { data: ['告警', '处置'], textStyle: { color: CHART_TEXT } },
    grid: { left: 40, right: 16, top: 28, bottom: 24 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: hours(),
      axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
      axisLabel: { color: CHART_TEXT, fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.12)' } },
      axisLabel: { color: CHART_TEXT, fontSize: 10 },
    },
    series: [
      {
        name: '告警',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: trendData.value,
        lineStyle: {
          color: CHART_ACCENT,
          width: 2,
          shadowColor: 'rgba(0, 212, 255, 0.6)',
          shadowBlur: 10,
        },
        itemStyle: { color: CHART_ACCENT },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 212, 255, 0.28)' },
            { offset: 1, color: 'rgba(0, 212, 255, 0)' },
          ]),
        },
      },
      {
        name: '处置',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: trendData.value.map((c) => Math.ceil(c / 2)),
        lineStyle: { color: CHART_SUCCESS, width: 2 },
        itemStyle: { color: CHART_SUCCESS },
      },
    ],
  };
  chart.setOption(option);
  markOnce('dashboard:chart-ready');
}

function onResize(): void {
  chart?.resize();
}

function handleWsMessage(msg: RealtimeMessage): void {
  if (msg.topic !== 'rt/alarm/push') return;
  const p = msg.payload as Partial<AlarmItem> | null;
  if (!p || typeof p !== 'object' || !p.alarmId) return;
  const row = toAlarmRow({
    alarmId: p.alarmId,
    level: (p.level ?? 3) as AlarmLevel,
    type: (p.type ?? 'FIRE') as AlarmType,
    status: 'ACTIVE',
    deviceCode: p.deviceCode ?? '',
    location: p.location ?? '',
    ts: p.ts ?? new Date().toISOString(),
    description: p.description ?? '',
  });
  alarms.value = [row, ...alarms.value.filter((a) => a.id !== row.id)].slice(0, 10);
}

async function loadData(): Promise<void> {
  try {
    const [overview, trend, page, ap, dp, zones] = await Promise.all([
      fetchDashboardOverview(),
      fetchAlarmTrend(),
      recordPerfAsync('componentQueryMs', () => fetchAlarmPage(1, 5)), // P10 查询组件 ≤2s
      fetchAlarmPoints(),
      fetchDevicePoints(),
      fetchRiskZones(),
    ]);
    mockReady.value = true;
    stats.value = [
      {
        label: '在线点位',
        value: String(overview.deviceOnline),
        unit: '个',
        icon: 'Monitor',
        tone: 'accent',
      },
      {
        label: '今日告警',
        value: String(overview.activeAlarm),
        unit: '条',
        icon: 'Bell',
        tone: 'danger',
      },
      {
        label: '风险指数',
        value: overview.riskIndex.toFixed(1),
        unit: '',
        icon: 'Odometer',
        tone: 'warning',
      },
      {
        label: '在线工作站',
        value: String(overview.onlineWorkstation),
        unit: '台',
        icon: 'Monitor',
        tone: 'success',
      },
    ];
    trendData.value = Array.from({ length: 24 }, (_, i) => trend[i]?.count ?? 0);
    alarms.value = page.list.map(toAlarmRow);
    // 点位/区域数据交由 Cesium BaseMap 渲染（P9 地图加载打点在 BaseMap 内部 recordPerfAsync）
    alarmPoints.value = ap;
    devicePoints.value = dp;
    riskZones.value = zones;
    markOnce('dashboard:data-ready');
  } catch (err) {
    mockError.value = err instanceof Error ? err.message : 'Mock 数据源未连接';
    // 降级：静态兜底点位 + 兜底图表
    alarmPoints.value = FALLBACK_ALARM_POINTS;
    devicePoints.value = FALLBACK_DEVICE_POINTS;
    riskZones.value = FALLBACK_RISK_ZONES;
  } finally {
    loading.value = false;
    // 图表容器位于 v-if="!loading" 面板内，须待 DOM 更新后再初始化
    await nextTick();
    renderChart();
  }
}

onMounted(async () => {
  window.addEventListener('resize', onResize);
  await loadData();

  // 实时通道：仅在未启用 dev mock 时启动，避免 ws://localhost:8787/ws 失败刷屏。
  // mock 模式下右侧告警由 devMock.setInterval 推入 alarm store；真实模式下 dashboard 自己订阅 VITE_WS_BASE，
  // 与主入口 startRealtime()（订阅 alarm.push）并行存在，两路并存直到 B3 真实 ws 对接。
  if (isDevMock()) return;
  const wsUrl = import.meta.env.VITE_WS_BASE as string | undefined;
  if (!wsUrl) return;
  wsClient = new RealtimeClient({ url: wsUrl, onMessage: handleWsMessage });
  wsClient.connect();
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  wsClient?.close();
  wsClient = null;
  chart?.dispose();
  chart = null;
});
</script>

<template>
  <div class="dashboard dashboard-map">
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

    <!-- 顶部指标卡横条 + 2D/3D 切换 -->
    <div v-if="!loading" class="stat-bar glass-panel">
      <div v-for="s in stats" :key="s.label" class="stat-item">
        <span class="stat-value" :class="'tone-' + s.tone"
          >{{ s.value }}<i v-if="s.unit">{{ s.unit }}</i></span
        >
        <span class="stat-label">{{ s.label }}</span>
      </div>
      <div class="mode-switch">
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

    <!-- 右侧告警列表 -->
    <aside v-if="!loading" class="alarm-panel glass-panel">
      <div class="alarm-head">
        <h2 class="panel-title">实时告警</h2>
        <span v-if="mockReady" class="live-tag"><i class="live-dot" />LIVE</span>
      </div>
      <p v-if="mockError" class="mock-tip">{{ mockError }}</p>
      <ul v-else class="alarm-list">
        <li
          v-for="(a, index) in alarms"
          :key="a.id"
          class="alarm-row"
          :class="{ 'row-odd': index % 2 === 1 }"
        >
          <span class="alarm-dot" :class="'tone-' + a.tone" />
          <span class="alarm-level" :class="'tone-' + a.tone">{{ a.level }}</span>
          <span class="alarm-device">{{ a.device }}</span>
          <span class="alarm-time">{{ a.time }}</span>
        </li>
        <li v-if="alarms.length === 0" class="alarm-empty">暂无告警数据</li>
      </ul>
    </aside>

    <!-- 左下迷你趋势图 -->
    <div v-if="!loading" class="mini-trend glass-panel">
      <h2 class="panel-title">近 24h 告警/处置</h2>
      <div ref="chartRef" class="chart" />
    </div>

    <!-- 骨架屏（加载期覆盖，SLO §3 渲染层降级） -->
    <div v-if="loading" class="dashboard-skeleton" data-test="dashboard-skeleton">
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

/* 顶部指标卡横条 */
.stat-bar {
  position: absolute;
  top: var(--space-md);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  z-index: 5;
  border-radius: var(--radius-md);
}

/* 2D/3D 切换 */
.mode-switch {
  display: flex;
  gap: 2px;
  padding: 2px;
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

.stat-item {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
  white-space: nowrap;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
  text-shadow: 0 0 12px rgb(0 212 255 / 25%);
}

.stat-value i {
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  color: var(--color-text-muted);
}

.stat-label {
  color: var(--color-text-muted);
  font-size: 12px;
}

/* 右侧告警面板 */
.alarm-panel {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  bottom: var(--space-md);
  width: 300px;
  z-index: 5;
  padding: var(--space-lg);
  overflow: auto;
}

.alarm-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.live-tag {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 12px;
  color: var(--color-success);
  letter-spacing: 1px;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 6px var(--color-success);
  animation: live-blink 1.6s ease-in-out infinite;
}

@keyframes live-blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}

.mock-tip {
  margin-top: var(--space-md);
  color: var(--color-warning);
  font-size: 13px;
}

.alarm-list {
  list-style: none;
  margin: var(--space-md) 0 0;
  padding: 0;
}

.alarm-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 10px var(--space-sm);
  font-size: 13px;
  border-radius: var(--radius-sm);
}

.alarm-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.alarm-dot.tone-danger {
  background: var(--color-danger);
  box-shadow: 0 0 6px var(--color-danger);
}

.alarm-dot.tone-warning {
  background: var(--color-warning);
  box-shadow: 0 0 6px var(--color-warning);
}

.alarm-dot.tone-info {
  background: var(--color-text-muted);
}

.alarm-level {
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.alarm-device {
  color: var(--color-text);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alarm-time {
  color: var(--color-text-muted);
  font-family: Consolas, 'Courier New', monospace;
  flex-shrink: 0;
}

.alarm-empty {
  padding: var(--space-md) 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 13px;
}

/* 左下迷你趋势图 */
.mini-trend {
  position: absolute;
  left: var(--space-md);
  bottom: var(--space-md);
  width: 380px;
  height: 210px;
  z-index: 5;
  padding: var(--space-md);
}

.chart {
  height: 160px;
  width: 100%;
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
    rgb(120 160 210 / 8%),
    rgb(120 160 210 / 18%),
    rgb(120 160 210 / 8%)
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

/* 语义色 */
.tone-accent {
  color: var(--color-accent);
}

.tone-danger {
  color: var(--color-danger);
}

.tone-warning {
  color: var(--color-warning);
}

.tone-success {
  color: var(--color-success);
}

.tone-info {
  color: var(--color-text-muted);
}
</style>
