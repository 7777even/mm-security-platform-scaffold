<script setup lang="ts">
import { computed, ref } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import PanelCard from '../../common/PanelCard.vue';
import {
  entryBreakdown,
  entryLineHours,
  entryLineTrend,
  entrySummary,
  type EntryTab,
} from '../../../lib/data/securityMock';
import { openEntryCaptureList } from '../../../lib/composables/useEntryCaptureListView';
import { usePlantArea } from '../../../lib/composables/usePlantArea';

use([LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

const activeTab = ref<EntryTab>('person');
const { scaleAreaCount } = usePlantArea();

const summaryText = computed(() => {
  const s = entrySummary[activeTab.value];
  return `近24h 入厂：${scaleAreaCount(s.enter)}，出厂：${scaleAreaCount(s.exit)}`;
});

const breakdownItems = computed(() =>
  entryBreakdown[activeTab.value].map((item) => ({
    ...item,
    value: scaleAreaCount(item.value),
  })),
);

const breakdownTotal = computed(() =>
  breakdownItems.value.reduce((sum, item) => sum + item.value, 0),
);

const lineOption = computed(() => {
  const trend = entryLineTrend[activeTab.value];
  return {
    animation: false,
    grid: { left: 36, right: 12, top: 28, bottom: 24 },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#8fa8c4', fontSize: 11 },
      data: ['入厂', '出厂'],
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(8, 28, 58, 0.92)',
      borderColor: 'rgba(0, 148, 236, 0.35)',
      textStyle: { color: '#dbe7f8', fontSize: 12 },
    },
    xAxis: {
      type: 'category',
      data: [...entryLineHours],
      boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(83,103,132,0.5)' } },
      axisLabel: { color: '#8fa8c4', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitNumber: 4,
      splitLine: { lineStyle: { color: 'rgba(83,103,132,0.18)' } },
      axisLabel: { color: '#8fa8c4', fontSize: 11 },
    },
    series: [
      {
        name: '入厂',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        data: trend.enter.map(scaleAreaCount),
        lineStyle: { color: '#00b4ff', width: 2 },
        itemStyle: { color: '#00b4ff' },
      },
      {
        name: '出厂',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        data: trend.exit.map(scaleAreaCount),
        lineStyle: { color: '#37cfff', width: 2 },
        itemStyle: { color: '#37cfff' },
      },
    ],
  };
});

const pieOption = computed(() => ({
  animation: false,
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(8, 28, 58, 0.92)',
    borderColor: 'rgba(0, 148, 236, 0.35)',
    textStyle: { color: '#dbe7f8', fontSize: 12 },
  },
  series: [
    {
      type: 'pie',
      radius: ['52%', '72%'],
      center: ['38%', '50%'],
      label: { show: false },
      labelLine: { show: false },
      data: breakdownItems.value.map((item) => ({
        name: item.label,
        value: item.value,
        itemStyle: { color: item.color },
      })),
    },
  ],
}));
</script>

<template>
  <PanelCard title="出入统计" variant="entryStats" module="security" :show-more="false">
    <template #header-extra>
      <a class="entry-stats__detail" href="#" @click.prevent="openEntryCaptureList(activeTab)">
        出入明细
      </a>
    </template>

    <div class="entry-stats">
      <div class="entry-stats__tabs">
        <button
          type="button"
          class="entry-tab"
          :class="{ 'entry-tab--active': activeTab === 'person' }"
          @click="activeTab = 'person'"
        >
          人员
        </button>
        <button
          type="button"
          class="entry-tab"
          :class="{ 'entry-tab--active': activeTab === 'vehicle' }"
          @click="activeTab = 'vehicle'"
        >
          普通车辆
        </button>
        <button
          type="button"
          class="entry-tab"
          :class="{ 'entry-tab--active': activeTab === 'hazmat' }"
          @click="activeTab = 'hazmat'"
        >
          危化车
        </button>
      </div>

      <div class="entry-stats__summary">{{ summaryText }}</div>

      <div class="entry-stats__chart entry-stats__chart--line">
        <VChart class="entry-stats__line" :option="lineOption" autoresize />
      </div>

      <div class="entry-stats__pie-wrap">
        <VChart class="entry-stats__pie" :option="pieOption" autoresize />
        <div class="entry-stats__pie-center">
          <div class="entry-stats__pie-label">总数</div>
          <div class="entry-stats__pie-value">{{ breakdownTotal }}</div>
        </div>
        <ul class="entry-stats__legend">
          <li v-for="item in breakdownItems" :key="item.label">
            <span class="entry-stats__dot" :style="{ background: item.color }" />
            <span class="entry-stats__legend-label">{{ item.label }}</span>
            <span class="entry-stats__legend-value">{{ item.value }}</span>
          </li>
        </ul>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
:deep(.panel-card__content) {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 8px 12px 10px;
}

.entry-stats__detail {
  position: relative;
  z-index: var(--z-chrome);
  margin-left: auto;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-strong);
  text-decoration: none;
}

.entry-stats {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) minmax(0, 1fr);
  gap: 6px;
  height: 100%;
  min-height: 0;
}

.entry-stats__tabs {
  display: flex;
  gap: 36px;
  flex-shrink: 0;
  border-bottom: 1px solid rgb(0 100 180 / 20%);
  padding-bottom: 4px;
}

.entry-tab {
  border: none;
  background: transparent;
  font-size: 14px;
  color: #2fbaff;
  cursor: pointer;
  padding: 0 0 4px;
  position: relative;
}

.entry-tab--active {
  color: var(--color-warning);
}

.entry-tab--active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -5px;
  height: 3px;
  background: linear-gradient(90deg, #ff8c00, rgb(255 140 0 / 20%));
  border-radius: 2px;
}

.entry-stats__summary {
  font-size: 13px;
  color: #c8d8ec;
  flex-shrink: 0;
}

.entry-stats__chart--line {
  min-height: 0;
  height: 100%;
}

.entry-stats__pie-wrap {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  min-height: 0;
  height: 100%;
}

.entry-stats__line,
.entry-stats__pie {
  width: 100%;
  height: 100%;
  min-height: 96px;
}

.entry-stats__pie-center {
  position: absolute;
  left: 19%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.entry-stats__pie-label {
  font-size: 12px;
  color: #8fa8c4;
}

.entry-stats__pie-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-strong);
  line-height: 1.2;
}

.entry-stats__legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.entry-stats__legend li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.entry-stats__dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.entry-stats__legend-label {
  color: #a8b8cc;
  flex: 1;
}

.entry-stats__legend-value {
  color: var(--color-text-strong);
  font-weight: 500;
}
</style>
