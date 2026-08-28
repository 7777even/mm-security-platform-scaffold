<!--
  LineChart — 通用 ECharts 折线图（安全防恐「出入统计」「告警趋势」复用）
  支持多 series、平滑曲线、面积渐变、图例开关、类目 X 轴。
-->
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsCoreOption } from 'echarts/core';
import { readCssVar } from '@/utils/theme';

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

export interface LineSeries {
  name: string;
  data: number[];
  color?: string;
}

const props = withDefaults(
  defineProps<{
    categories: string[];
    series: LineSeries[];
    smooth?: boolean;
    showLegend?: boolean;
    yMin?: number | 'dataMin';
    area?: boolean;
  }>(),
  { smooth: true, showLegend: false, area: false },
);

const el = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

const SERIES_TOKENS = [
  '--chart-accent',
  '--chart-success',
  '--chart-warning',
  '--color-alarm-2',
  '--chart-purple',
];

/**
 * 解析序列颜色：支持直接 hex / 或 `var(--token)` 形式。
 * canvas 无法消费 `var()`，需经 readCssVar 解析为具体色值（与 dashboard 图表策略一致）。
 */
function resolveColor(c?: string, idx = 0): string {
  if (c) {
    const trimmed = c.trim();
    if (trimmed.startsWith('var(')) {
      const name = trimmed.slice(4, -1).trim();
      return readCssVar(name, '#00e1ff');
    }
    return trimmed;
  }
  return readCssVar(SERIES_TOKENS[idx % SERIES_TOKENS.length], '#00e1ff');
}

function buildOption(): EChartsCoreOption {
  const axisText = readCssVar('--chart-text', '#9fb3c8');
  const fontSize = Number(readCssVar('--font-size-helper', '12')) || 12;
  const series = props.series.map((s, i) => {
    const color = resolveColor(s.color, i);
    const base: Record<string, unknown> = {
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: props.smooth,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color, width: 2 },
      itemStyle: { color },
    };
    if (props.area) {
      base.areaStyle = {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: `${color}66` },
            { offset: 1, color: `${color}00` },
          ],
        },
      };
    }
    return base;
  });

  return {
    grid: { left: 30, right: 12, top: props.showLegend ? 30 : 14, bottom: 18 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: readCssVar('--chart-panel-bg', 'rgba(19, 35, 60, 0.92)'),
      borderColor: readCssVar('--chart-panel-border', 'rgba(0, 216, 255, 0.4)'),
      textStyle: { color: readCssVar('--chart-text-strong', '#eaf4ff'), fontSize },
    },
    legend: props.showLegend
      ? {
          show: true,
          top: 0,
          right: 4,
          icon: 'roundRect',
          itemWidth: 10,
          itemHeight: 6,
          textStyle: { color: axisText, fontSize: fontSize - 1 },
        }
      : { show: false },
    xAxis: {
      type: 'category',
      data: props.categories,
      boundaryGap: false,
      axisLine: { lineStyle: { color: readCssVar('--chart-axis-line', 'rgba(0, 216, 255, 0.3)') } },
      axisLabel: { color: axisText, fontSize: fontSize - 1 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      min: props.yMin,
      axisLine: { show: false },
      axisLabel: { color: axisText, fontSize: fontSize - 1 },
      splitLine: {
        lineStyle: { color: readCssVar('--chart-grid-line', 'rgba(0, 216, 255, 0.12)') },
      },
    },
    series,
  };
}

function render(): void {
  if (!el.value) return;
  if (!chart) chart = echarts.init(el.value);
  chart.setOption(buildOption());
}

function onResize(): void {
  chart?.resize();
}

onMounted(() => {
  render();
  window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  chart?.dispose();
  chart = null;
});

watch(() => [props.categories, props.series, props.smooth, props.showLegend, props.area], render, {
  deep: true,
});
</script>

<template>
  <div ref="el" class="line-chart" />
</template>

<style scoped>
.line-chart {
  width: 100%;
  height: 100%;
  min-height: 110px;
}
</style>
