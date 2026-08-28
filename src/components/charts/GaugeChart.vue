<!--
  GaugeChart — 通用 ECharts 仪表盘（消防设施运行监测双仪表盘复用）
  仅展示数值 + 进度弧，隐藏刻度/指针，符合大屏极简科技风。
-->
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import * as echarts from 'echarts/core';
import { GaugeChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsCoreOption } from 'echarts/core';
import { readCssVar } from '@/utils/theme';

echarts.use([GaugeChart, CanvasRenderer]);

const props = withDefaults(
  defineProps<{
    value: number;
    label?: string;
    color?: string;
    min?: number;
    max?: number;
  }>(),
  { label: '%', color: 'var(--color-accent)', min: 0, max: 100 },
);

const el = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

function resolveColor(c?: string): string {
  if (c && c.trim().startsWith('var(')) {
    return readCssVar(c.trim().slice(4, -1).trim(), '#00e1ff');
  }
  return c ?? '#00e1ff';
}

function buildOption(): EChartsCoreOption {
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        min: props.min,
        max: props.max,
        radius: '94%',
        center: ['50%', '62%'],
        progress: { show: true, width: 7, itemStyle: { color: resolveColor(props.color) } },
        axisLine: { lineStyle: { width: 7, color: [[1, 'rgba(255,255,255,0.10)']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        anchor: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          formatter: (v: number) => `${v}${props.label}`,
          color: readCssVar('--chart-text-strong', '#eaf4ff'),
          fontSize: 20,
          fontWeight: 700,
          offsetCenter: [0, '20%'],
        },
        data: [{ value: props.value }],
      },
    ],
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

watch(() => [props.value, props.color, props.label, props.min, props.max], render);
</script>

<template>
  <div ref="el" class="gauge" />
</template>

<style scoped>
.gauge {
  width: 100%;
  height: 100%;
  min-height: 92px;
}
</style>
