<script setup lang="ts">
import { computed } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import PanelCard from '../../common/PanelCard.vue';
import { alarmTrendData } from '../../../lib/data/securityMock';
import { usePlantArea } from '../../../lib/composables/usePlantArea';

const { scaleAreaCount } = usePlantArea();

use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

const chartOption = computed(() => ({
  grid: { left: 36, right: 16, top: 18, bottom: 28 },
  xAxis: {
    type: 'category',
    data: ['4/6', '4/7', '4/8', '4/9', '4/10', '4/11', '4/12', '4/13', '4/14', '4/15'],
    axisLine: { lineStyle: { color: 'rgba(83,103,132,0.5)' } },
    axisLabel: { color: '#8fa8c4', fontSize: 11 },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: 'rgba(83,103,132,0.18)' } },
    axisLabel: { color: '#8fa8c4', fontSize: 11 },
  },
  series: [
    {
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: alarmTrendData.map(scaleAreaCount),
      lineStyle: { color: '#00b4ff', width: 2 },
      itemStyle: { color: '#00b4ff' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0,180,255,0.28)' },
            { offset: 1, color: 'rgba(0,180,255,0.02)' },
          ],
        },
      },
    },
  ],
}));
</script>

<template>
  <PanelCard title="告警趋势" variant="alarmTrend" module="security">
    <div class="alarm-trend">
      <div class="alarm-trend__filter">
        <label class="alarm-trend__filter-label">告警类型</label>
        <select class="alarm-trend__select">
          <option>全部</option>
          <option>人员异常</option>
          <option>车辆超速</option>
          <option>区域入侵</option>
        </select>
      </div>
      <VChart class="alarm-trend__chart" :option="chartOption" autoresize />
    </div>
  </PanelCard>
</template>

<style scoped>
:deep(.panel-card__content) {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 6px 10px 10px;
}

.alarm-trend {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 6px;
}

.alarm-trend__filter {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.alarm-trend__filter-label {
  font-size: 13px;
  color: #a8b8cc;
}

.alarm-trend__select {
  height: 28px;
  padding: 0 24px 0 10px;
  background: rgb(0 22 48 / 75%);
  border: 1px solid var(--map-facility-btn-border);
  border-radius: 2px;
  color: var(--color-text-strong);
  font-size: 13px;
  font-family: var(--font-body);
  outline: none;
  appearance: none;
}

.alarm-trend__chart {
  flex: 1;
  min-height: 0;
}
</style>
