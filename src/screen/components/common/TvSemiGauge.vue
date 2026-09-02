<script setup lang="ts">
import { computed } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { GaugeChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

use([GaugeChart, CanvasRenderer]);

const props = withDefaults(
  defineProps<{
    value: number;
    label: string;
    color?: string;
  }>(),
  { color: '#00b4ff' },
);

const option = computed(() => ({
  series: [
    {
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      radius: '100%',
      center: ['50%', '72%'],
      pointer: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      axisLine: {
        roundCap: true,
        lineStyle: {
          width: 7,
          color: [
            [props.value / 100, props.color],
            [1, 'rgba(0, 70, 120, 0.35)'],
          ],
        },
      },
      detail: {
        valueAnimation: false,
        formatter: '{value}%',
        fontSize: 16,
        fontWeight: 700,
        color: '#ffffff',
        offsetCenter: [0, '-8%'],
      },
      title: {
        show: true,
        offsetCenter: [0, '28%'],
        fontSize: 12,
        color: '#8fa8c4',
      },
      data: [{ value: props.value, name: props.label }],
    },
  ],
}));
</script>

<template>
  <VChart class="tv-semi-gauge" :option="option" autoresize />
</template>

<style scoped>
.tv-semi-gauge {
  width: 82px;
  height: 72px;
  flex-shrink: 0;
}
</style>
