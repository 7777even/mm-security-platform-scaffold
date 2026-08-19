<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, defineAsyncComponent } from 'vue';
import { detectWebGL } from '@/utils/webgl';

// 3D 厂区场景（协议「二三维 GIS」三维增强层）：懒加载，仅点 3D 时才加载 three
const FactoryScene = defineAsyncComponent(() => import('@/components/three/FactoryScene.vue'));
import * as echarts from 'echarts/core';
import { LineChart, type LineSeriesOption } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ComposeOption } from 'echarts/core';
import Map from 'ol/Map';
import View from 'ol/View';
import Overlay from 'ol/Overlay';
import TileLayer from 'ol/layer/Tile';
import { MAP_TILE_URL } from '@/constants/map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { XYZ } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import type { Coordinate } from 'ol/coordinate';
import { RealtimeClient, type RealtimeMessage } from '@/services/ws';
import { markOnce } from '@/utils/perf';
import { recordPerfAsync } from '@/utils/perf-budget';
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

// 地图点位样式色（OpenLayers 不消费 CSS 变量，集中定义避免魔法字符串）
const LEVEL_COLORS: Record<number, string> = {
  1: '#ff4d4f',
  2: '#faad14',
  3: '#40a9ff',
  4: '#8c9cb0',
};
const STATUS_COLORS: Record<string, string> = {
  ONLINE: '#52c41a',
  OFFLINE: '#8c9cb0',
  FAULT: '#ff4d4f',
};
const MAP_CENTER: Coordinate = fromLonLat([110.952, 21.672]);

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
const mapRef = ref<HTMLDivElement | null>(null);
const overlayRef = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;
let map: Map | null = null;
let overlay: Overlay | null = null;
let alarmSource: VectorSource | null = null;
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

// 2D/3D 视图切换（3D 为 Three.js 厂区场景，协议「二三维 GIS」三维增强层）
const viewMode = ref<'2d' | '3d'>('2d');
const threeNotice = ref('');

function switchMode(mode: '2d' | '3d'): void {
  if (mode === '3d' && !detectWebGL()) {
    threeNotice.value = '三维视图不可用：当前环境不支持 WebGL，已保持二维视图';
    viewMode.value = '2d';
    return;
  }
  viewMode.value = mode;
}

function onThreeError(): void {
  threeNotice.value = '三维视图初始化失败，已切换二维视图';
  viewMode.value = '2d';
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

function zoneColor(score: number): string {
  if (score >= 4) return 'rgba(255,77,79,0.22)';
  if (score >= 3) return 'rgba(250,173,20,0.2)';
  if (score >= 2) return 'rgba(64,169,255,0.18)';
  return 'rgba(140,156,176,0.14)';
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
  map?.updateSize();
}

/**
 * 初始化地图：Carto 暗色瓦片底图（国内可达公网瓦片，开发占位；生产替换天地图 WMTS + 离线化，S3 定案）
 * 天地图替换：url 改 `https://t{0-7}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=<key>`（XYZ 源）
 */
function initMap(): void {
  if (!mapRef.value) return;
  map = new Map({
    target: mapRef.value,
    layers: [
      new TileLayer({
        source: new XYZ({ url: MAP_TILE_URL }),
      }),
    ],
    view: new View({ center: MAP_CENTER, zoom: 14 }),
  });
  if (overlayRef.value) {
    overlay = new Overlay({
      element: overlayRef.value,
      positioning: 'bottom-center',
      offset: [0, -10],
    });
    map.addOverlay(overlay);
  }
}

/** 厂区区域轮廓（risk-heatmap 评分 → 半透明色面 + 名称标注） */
function renderZones(zones: RiskZone[]): void {
  if (!map) return;
  const features = zones.map((z) => {
    const coords = z.polygon.map(([lng, lat]) => fromLonLat([lng, lat]));
    const feature = new Feature({ geometry: new Polygon([coords]) });
    feature.setStyle(
      new Style({
        fill: new Fill({ color: zoneColor(z.score) }),
        stroke: new Stroke({ color: 'rgba(0,212,255,0.5)', width: 1 }),
        text: new Text({
          text: `${z.name}  ${z.score.toFixed(1)}`,
          fill: new Fill({ color: '#b8d4f0' }),
          font: '12px "Microsoft YaHei"',
        }),
      }),
    );
    return feature;
  });
  map.addLayer(new VectorLayer({ source: new VectorSource({ features }) }));
}

/** 设备点位（状态色小圆点） */
function renderDevices(points: MapPoint[]): void {
  if (!map) return;
  const features = points.map((p) => {
    const feature = new Feature({ geometry: new Point(fromLonLat([p.lng, p.lat])) });
    const color = STATUS_COLORS[p.status ?? 'OFFLINE'] ?? '#8c9cb0';
    feature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 4,
          fill: new Fill({ color }),
          stroke: new Stroke({ color: 'rgba(0,0,0,0.3)', width: 1 }),
        }),
      }),
    );
    return feature;
  });
  map.addLayer(new VectorLayer({ source: new VectorSource({ features }) }));
}

/** 报警点位（等级色圆点 + 数字标记 + 点击浮窗） */
function renderAlarms(points: MapPoint[]): void {
  if (!map) return;
  alarmSource = new VectorSource();
  map.addLayer(
    new VectorLayer({
      source: alarmSource,
      style: (feature) => {
        const level = (feature.get('level') as number) ?? 3;
        return new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: LEVEL_COLORS[level] ?? '#40a9ff' }),
            stroke: new Stroke({ color: '#fff', width: 1.5 }),
          }),
          text: new Text({
            text: String(level),
            fill: new Fill({ color: '#fff' }),
            font: '10px sans-serif',
          }),
        });
      },
    }),
  );
  alarmSource.addFeatures(
    points.map((p) => {
      const feature = new Feature({ geometry: new Point(fromLonLat([p.lng, p.lat])) });
      feature.set('kind', 'alarm');
      feature.set('id', p.id);
      feature.set('level', p.level);
      feature.set('name', p.name);
      return feature;
    }),
  );

  // 点击报警点 → 浮窗显示详情
  // 仅响应 kind='alarm' 的点位：设备点/区域面未设置 id/name，误触发会显示 undefined
  map.on('singleclick', (evt) => {
    if (!alarmSource || !overlay || !overlayRef.value) return;
    const hit = map?.forEachFeatureAtPixel(evt.pixel, (f) =>
      f.get('kind') === 'alarm' ? (f as Feature) : undefined,
    );
    if (hit) {
      overlay.setPosition(evt.coordinate);
      const el = overlayRef.value;
      el.querySelector('.map-pop-title')!.textContent = `报警 ${String(hit.get('id'))}`;
      el.querySelector('.map-pop-desc')!.textContent =
        `${hit.get('name')} ｜ 等级 ${String(hit.get('level'))}`;
      el.style.display = 'block';
    } else {
      overlayRef.value.style.display = 'none';
    }
  });
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
    const [overview, trend, page, alarmPoints, devicePoints, zones] = await Promise.all([
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
    // P9 地图加载 ≤2s：区域/设备/报警点位渲染计时
    await recordPerfAsync('baseMapMs', async () => {
      renderZones(zones);
      renderDevices(devicePoints);
      renderAlarms(alarmPoints);
    });
    markOnce('dashboard:data-ready');
    markOnce('map:ready');
  } catch (err) {
    mockError.value = err instanceof Error ? err.message : 'Mock 数据源未连接';
    // 降级：静态兜底点位 + 兜底图表
    renderZones(FALLBACK_RISK_ZONES);
    renderDevices(FALLBACK_DEVICE_POINTS);
    renderAlarms(FALLBACK_ALARM_POINTS);
  } finally {
    loading.value = false;
    // 图表容器位于 v-if="!loading" 面板内，须待 DOM 更新后再初始化
    await nextTick();
    renderChart();
  }
}

onMounted(async () => {
  initMap();
  window.addEventListener('resize', onResize);
  await loadData();

  // 实时通道：订阅 rt/alarm/push（仅配置了 WS 地址时启用）
  const wsUrl = import.meta.env.VITE_WS_BASE as string | undefined;
  if (wsUrl) {
    wsClient = new RealtimeClient({ url: wsUrl, onMessage: handleWsMessage });
    wsClient.connect();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  wsClient?.close();
  wsClient = null;
  chart?.dispose();
  chart = null;
  map?.setTarget(undefined);
  map = null;
});
</script>

<template>
  <div class="dashboard dashboard-map">
    <!-- 2D 地图容器（常驻 v-show，避免 OL 重挂载） -->
    <div v-show="viewMode === '2d'" ref="mapRef" class="map-canvas" data-test="map-canvas" />

    <!-- 3D 厂区场景（懒加载，仅点 3D 时实例化；初始化失败自动回退 2D） -->
    <FactoryScene v-if="viewMode === '3d'" class="factory" @error="onThreeError" />

    <!-- 报警点浮窗（2D 地图专用） -->
    <div v-show="viewMode === '2d'" ref="overlayRef" class="map-pop">
      <p class="map-pop-title" />
      <p class="map-pop-desc" />
    </div>

    <!-- 三维不可用提示 -->
    <p v-if="threeNotice" class="three-notice">{{ threeNotice }}</p>

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
          :class="{ active: viewMode === '2d' }"
          @click="switchMode('2d')"
        >
          2D
        </button>
        <button
          type="button"
          class="mode-btn"
          :class="{ active: viewMode === '3d' }"
          @click="switchMode('3d')"
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

.map-canvas {
  position: absolute;
  inset: 0;
}

/* 底图容器：暗色瓦片（Carto dark_all）天然深色，无需滤镜；天地图替换后如为亮色可在此加暗化 */

.map-canvas :deep(.ol-control button) {
  background: rgb(0 0 0 / 55%);
  color: #00d4ff;
}

/* 报警点浮窗 */
.map-pop {
  display: none;
  position: absolute;
  min-width: 180px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: rgb(15 30 54 / 92%);
  border: 1px solid rgb(0 212 255 / 40%);
  box-shadow: 0 0 16px rgb(0 212 255 / 20%);
  pointer-events: none;
}

.map-pop-title {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 600;
  color: #00d4ff;
}

.map-pop-desc {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-muted);
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

/* 3D 场景容器 */
.factory {
  position: absolute;
  inset: 0;
}

/* 三维不可用提示 */
.three-notice {
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
