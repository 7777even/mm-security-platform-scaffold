<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, type LineSeriesOption } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ComposeOption } from 'echarts/core'
import { RealtimeClient, type RealtimeMessage } from '@/services/ws'
import { markOnce } from '@/utils/perf'
import {
  fetchDashboardOverview,
  fetchAlarmTrend,
  fetchAlarmPage,
  type AlarmItem,
  type AlarmLevel,
  type AlarmType,
} from '@/services/alarm'

// 按需注册 ECharts 模块，控制产物体积
echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

type ECOption = ComposeOption<LineSeriesOption>

// 图表配置色值（ECharts 不消费 CSS 变量，此处集中定义避免魔法字符串）
const CHART_ACCENT = '#00d4ff'
const CHART_SUCCESS = '#52c41a'
const CHART_TEXT = '#7e9bb8'

const LEVEL_META: Record<AlarmLevel, { label: string; tone: string }> = {
  1: { label: '重大', tone: 'danger' },
  2: { label: '预警', tone: 'warning' },
  3: { label: '提示', tone: 'info' },
  4: { label: '提示', tone: 'info' },
}

const TYPE_LABEL: Record<AlarmType, string> = {
  FIRE: '火灾',
  GAS: '气体',
  TEMP: '温度',
  CCTV: '视频',
  SOS: '一键报警',
}

interface Stat {
  label: string
  value: string
  unit: string
  icon: string
  tone: string
}

interface AlarmRow {
  id: string
  level: string
  tone: string
  device: string
  time: string
}

const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
let wsClient: RealtimeClient | null = null

// 静态兜底值：Mock 不可达时保留展示
const stats = ref<Stat[]>([
  { label: '在线点位', value: '—', unit: '个', icon: 'Monitor', tone: 'accent' },
  { label: '今日告警', value: '—', unit: '条', icon: 'Bell', tone: 'danger' },
  { label: '风险指数', value: '—', unit: '', icon: 'Odometer', tone: 'warning' },
  { label: '在线工作站', value: '—', unit: '台', icon: 'Monitor', tone: 'success' },
])
const alarms = ref<AlarmRow[]>([])
const loading = ref(true)
const mockReady = ref(false)
const mockError = ref('')

const FALLBACK_TREND = [0, 1, 0, 2, 1, 3, 2, 1, 0, 2, 4, 3, 2, 1, 3, 5, 4, 6, 3, 2, 4, 3, 2, 1]
const trendData = ref<number[]>(FALLBACK_TREND)

function toAlarmRow(a: AlarmItem): AlarmRow {
  const meta = LEVEL_META[a.level]
  return {
    id: a.alarmId,
    level: meta.label,
    tone: meta.tone,
    device: a.location || `${TYPE_LABEL[a.type] ?? a.type} ${a.deviceCode.slice(-4)}`,
    time: formatTime(a.ts),
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function hours(): string[] {
  const list: string[] = []
  const nowTime = new Date()
  for (let i = 23; i >= 0; i--) {
    const d = new Date(nowTime.getTime() - i * 3600 * 1000)
    list.push(`${String(d.getHours()).padStart(2, '0')}:00`)
  }
  return list
}

function renderChart(): void {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  const option: ECOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 30, 54, 0.92)',
      borderColor: 'rgba(0, 212, 255, 0.4)',
      textStyle: { color: '#eaf2fb' },
    },
    legend: { data: ['告警', '处置'], textStyle: { color: CHART_TEXT } },
    grid: { left: 48, right: 24, top: 40, bottom: 32 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: hours(),
      axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
      axisLabel: { color: CHART_TEXT },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.12)' } },
      axisLabel: { color: CHART_TEXT },
    },
    series: [
      {
        name: '告警',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: trendData.value,
        lineStyle: { color: CHART_ACCENT, width: 2, shadowColor: 'rgba(0, 212, 255, 0.6)', shadowBlur: 10 },
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
  }
  chart.setOption(option)
  // 渲染层：图表首次渲染完成（真机复测 dashboard 场景）
  markOnce('dashboard:chart-ready')
}

function onResize(): void {
  chart?.resize()
}

function handleWsMessage(msg: RealtimeMessage): void {
  if (msg.topic !== 'rt/alarm/push') return
  const p = msg.payload as Partial<AlarmItem> | null
  if (!p || typeof p !== 'object' || !p.alarmId) return
  const row = toAlarmRow({
    alarmId: p.alarmId,
    level: (p.level ?? 3) as AlarmLevel,
    type: (p.type ?? 'FIRE') as AlarmType,
    status: 'ACTIVE',
    deviceCode: p.deviceCode ?? '',
    location: p.location ?? '',
    ts: p.ts ?? new Date().toISOString(),
    description: p.description ?? '',
  })
  alarms.value = [row, ...alarms.value.filter((a) => a.id !== row.id)].slice(0, 10)
}

async function loadData(): Promise<void> {
  try {
    const [overview, trend, page] = await Promise.all([
      fetchDashboardOverview(),
      fetchAlarmTrend(),
      fetchAlarmPage(1, 5),
    ])
    mockReady.value = true
    stats.value = [
      { label: '在线点位', value: String(overview.deviceOnline), unit: '个', icon: 'Monitor', tone: 'accent' },
      { label: '今日告警', value: String(overview.activeAlarm), unit: '条', icon: 'Bell', tone: 'danger' },
      { label: '风险指数', value: overview.riskIndex.toFixed(1), unit: '', icon: 'Odometer', tone: 'warning' },
      { label: '在线工作站', value: String(overview.onlineWorkstation), unit: '台', icon: 'Monitor', tone: 'success' },
    ]
    trendData.value = Array.from({ length: 24 }, (_, i) => trend[i]?.count ?? 0)
    alarms.value = page.list.map(toAlarmRow)
    renderChart()
    markOnce('dashboard:data-ready')
  } catch (err) {
    mockError.value = err instanceof Error ? err.message : 'Mock 数据源未连接'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  renderChart()
  window.addEventListener('resize', onResize)
  await loadData()

  // 实时通道：订阅 rt/alarm/push（仅配置了 WS 地址时启用）
  const wsUrl = import.meta.env.VITE_WS_BASE as string | undefined
  if (wsUrl) {
    wsClient = new RealtimeClient({ url: wsUrl, onMessage: handleWsMessage })
    wsClient.connect()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  wsClient?.close()
  wsClient = null
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div class="dashboard">
    <!-- 骨架屏（SLO §3 渲染层降级：数据加载期占位，避免白屏跳变） -->
    <div v-if="loading" class="dashboard" data-test="dashboard-skeleton">
      <div class="stat-grid">
        <div v-for="i in 4" :key="i" class="glass-panel stat-card">
          <span class="skeleton skeleton-icon" />
          <span class="skeleton skeleton-line" style="width: 120px" />
        </div>
      </div>
      <div class="middle-grid">
        <div class="glass-panel chart-panel">
          <span class="skeleton skeleton-line" style="width: 180px" />
          <span class="skeleton skeleton-chart" />
        </div>
        <div class="glass-panel alarm-panel">
          <span class="skeleton skeleton-line" style="width: 120px" />
          <span v-for="i in 5" :key="i" class="skeleton skeleton-list-item" />
        </div>
      </div>
    </div>

    <template v-else>
    <div class="stat-grid">
      <div v-for="s in stats" :key="s.label" class="glass-panel stat-card">
        <el-icon class="stat-icon" :class="'tone-' + s.tone" :size="22">
          <component :is="s.icon" />
        </el-icon>
        <div class="stat-meta">
          <span class="stat-label">{{ s.label }}</span>
          <span class="stat-value" :class="'tone-' + s.tone">
            {{ s.value }}<i v-if="s.unit">{{ s.unit }}</i>
          </span>
        </div>
      </div>
    </div>

    <div class="middle-grid">
      <div class="glass-panel chart-panel">
        <h2 class="panel-title">近 24 小时告警 / 处置趋势</h2>
        <div ref="chartRef" class="chart" />
      </div>

      <div class="glass-panel alarm-panel">
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
      </div>
    </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  height: 100%;
}

/* 骨架屏（SLO §3 渲染层降级占位） */
.skeleton {
  display: block;
  background: linear-gradient(90deg, rgb(120 160 210 / 8%), rgb(120 160 210 / 18%), rgb(120 160 210 / 8%));
  background-size: 200% 100%;
  animation: skeleton-sweep 1.4s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

.skeleton-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.skeleton-line {
  height: 14px;
}

.skeleton-chart {
  height: 280px;
  margin-top: var(--space-sm);
}

.skeleton-list-item {
  height: 32px;
  margin-top: var(--space-sm);
}

@keyframes skeleton-sweep {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
}

.stat-icon {
  color: var(--color-accent);
}

.stat-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.stat-label {
  color: var(--color-text-muted);
  font-size: 13px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
  text-shadow: 0 0 12px rgb(0 212 255 / 25%);
}

.stat-value i {
  margin-left: var(--space-xs);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  color: var(--color-text-muted);
}

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

.middle-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: var(--space-md);
  flex: 1;
  min-height: 360px;
}

.chart-panel {
  padding: var(--space-lg);
}

.chart {
  height: 320px;
  width: 100%;
  margin-top: var(--space-sm);
}

.alarm-panel {
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
</style>
