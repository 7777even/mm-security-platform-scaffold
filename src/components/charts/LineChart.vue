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

const DEFAULT_COLORS = ['#00e1ff', '#2ee6a8', '#ffc24b', '#ff6b6b', '#a78bfa'];

function buildOption(): EChartsCoreOption {
  const series = props.series.map((s, i) => {
    const color = s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
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
      backgroundColor: 'rgba(10, 25, 47, 0.92)',
      borderColor: 'rgba(0, 225, 255, 0.3)',
      textStyle: { color: '#eaf4ff', fontSize: 12 },
    },
    legend: props.showLegend
      ? {
          show: true,
          top: 0,
          right: 4,
          icon: 'roundRect',
          itemWidth: 10,
          itemHeight: 6,
          textStyle: { color: '#9fb3c8', fontSize: 11 },
        }
      : { show: false },
    xAxis: {
      type: 'category',
      data: props.categories,
      boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
      axisLabel: { color: '#9fb3c8', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      min: props.yMin,
      axisLine: { show: false },
      axisLabel: { color: '#9fb3c8', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
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
