<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, type LineSeriesOption } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ComposeOption } from 'echarts/core'

// 按需注册 ECharts 模块，控制产物体积
echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

type ECOption = ComposeOption<LineSeriesOption>

// 图表配置色值（ECharts 不消费 CSS 变量，此处集中定义避免魔法字符串）
const CHART_ACCENT = '#00d4ff'
const CHART_SUCCESS = '#52c41a'
const CHART_TEXT = '#7e9bb8'

const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

const stats = [
  { label: '安全运行天数', value: '128', unit: '天', icon: 'Odometer', tone: 'accent' },
  { label: '在线点位', value: '864', unit: '个', icon: 'Monitor', tone: 'accent' },
  { label: '今日告警', value: '12', unit: '条', icon: 'Bell', tone: 'danger' },
  { label: '设备完好率', value: '98.6%', unit: '', icon: 'CircleCheck', tone: 'success' },
]

const alarms = [
  { id: 1, level: '重大', tone: 'danger', device: '一号储罐区 · 液位超高', time: '14:32:05' },
  { id: 2, level: '预警', tone: 'warning', device: '反应釜 B 区 · 压力波动', time: '14:28:41' },
  { id: 3, level: '提示', tone: 'info', device: '工业视频 · 摄像头离线', time: '14:15:09' },
  { id: 4, level: '提示', tone: 'info', device: '环境监测 · 雨水排口 COD 偏高', time: '13:52:20' },
  { id: 5, level: '重大', tone: 'danger', device: '甲醇仓库 · 温度超限', time: '13:31:44' },
]

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
        data: [0, 1, 0, 2, 1, 3, 2, 1, 0, 2, 4, 3, 2, 1, 3, 5, 4, 6, 3, 2, 4, 3, 2, 1],
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
        data: [0, 0, 1, 1, 0, 2, 2, 1, 0, 1, 3, 2, 2, 1, 2, 4, 3, 5, 3, 2, 3, 3, 1, 1],
        lineStyle: { color: CHART_SUCCESS, width: 2 },
        itemStyle: { color: CHART_SUCCESS },
      },
    ],
  }
  chart.setOption(option)
}

function onResize(): void {
  chart?.resize()
}

onMounted(() => {
  renderChart()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div class="dashboard">
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
        <h2 class="panel-title">实时告警</h2>
        <ul class="alarm-list">
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
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  height: 100%;
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
</style>
