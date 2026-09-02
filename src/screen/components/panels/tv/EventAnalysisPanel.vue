<script setup lang="ts">
import { computed, ref } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import PanelCard from '../../common/PanelCard.vue';
import FireAlarmListDialog from '../../common/FireAlarmListDialog.vue';
import { eventBreakdown } from '../../../lib/data/tvMock';
import { usePlantArea } from '../../../lib/composables/usePlantArea';

const { scaleAreaCount } = usePlantArea();
const visibleBreakdown = computed(() =>
  eventBreakdown.map((item) => ({
    ...item,
    value: scaleAreaCount(item.value),
  })),
);
const visibleEventTotal = computed(() =>
  visibleBreakdown.value.reduce((total, item) => total + item.value, 0),
);

use([PieChart, CanvasRenderer]);
const alarmListOpen = ref(false);

const pieOption = computed(() => ({
  series: [
    {
      type: 'pie',
      radius: ['54%', '76%'],
      center: ['50%', '50%'],
      label: { show: false },
      data: visibleBreakdown.value.map((item) => ({
        name: item.label,
        value: item.value,
        itemStyle: { color: item.color },
      })),
    },
  ],
}));
</script>

<template>
  <PanelCard title="" variant="eventAnalysis" module="tv">
    <template #title>
      <button
        type="button"
        class="event-analysis__title-btn"
        title="查看视频分析告警列表"
        @click="alarmListOpen = true"
      >
        视频分析报警
        <span aria-hidden="true">›</span>
      </button>
    </template>
    <template #header-extra>
      <select class="event-analysis__range">
        <option>7天</option>
        <option>30天</option>
        <option>90天</option>
      </select>
    </template>

    <div class="event-analysis">
      <div class="event-analysis__chart">
        <VChart class="event-analysis__pie" :option="pieOption" autoresize />
        <div class="event-analysis__center">
          <div class="event-analysis__center-label">报警总数</div>
          <div class="event-analysis__center-value">{{ visibleEventTotal }}</div>
        </div>
      </div>
      <ul class="event-analysis__legend">
        <li v-for="item in visibleBreakdown" :key="item.label">
          <span class="event-analysis__icon" :style="{ background: item.color }" />
          <span class="event-analysis__legend-label">{{ item.label }}</span>
          <span class="event-analysis__legend-value">{{ item.value }}</span>
        </li>
      </ul>
    </div>
    <FireAlarmListDialog
      :open="alarmListOpen"
      initial-source="视频识别"
      @close="alarmListOpen = false"
    />
  </PanelCard>
</template>

<style scoped>
:deep(.panel-card__header) {
  gap: 8px;
}

.event-analysis__title-btn {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0;
  border: 0;
  background: transparent;
  font-size: 14px;
  font-family: var(--font-body);
  font-weight: 500;
  color: #7cdbff;
  cursor: pointer;
}

.event-analysis__title-btn span {
  font-size: 18px;
  transition: transform 0.2s ease;
}

.event-analysis__title-btn:hover {
  color: #fff;
}

.event-analysis__title-btn:hover span {
  transform: translateX(2px);
}

.event-analysis__range {
  position: relative;
  z-index: 1;
  height: 26px;
  padding: 0 24px 0 10px;
  border: 1px solid rgb(0 140 220 / 35%);
  border-radius: 2px;
  background: rgb(0 30 60 / 60%);
  color: #c4dcff;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  appearance: none;
  outline: none;
}

:deep(.panel-card__content) {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 8px 12px 14px;
  overflow: hidden;
}

.event-analysis {
  display: grid;
  grid-template-columns: 168px minmax(0, 1fr);
  gap: 10px;
  height: 100%;
  align-items: center;
  overflow: hidden;
}

.event-analysis__chart {
  position: relative;
  height: 100%;
  min-height: 0;
  width: 168px;
}

.event-analysis__pie {
  height: 100%;
}

.event-analysis__center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.event-analysis__center-label {
  font-size: 11px;
  color: #8fa8c4;
}

.event-analysis__center-value {
  margin-top: 3px;
  font-size: 23px;
  font-weight: 700;
  color: #fff;
}

.event-analysis__legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 7px;
  min-width: 0;
}

.event-analysis__legend li {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 18px;
  font-size: 12px;
  min-width: 0;
}

.event-analysis__icon {
  width: 14px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.event-analysis__legend-label {
  flex: 1;
  min-width: 0;
  color: #c4dcff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-analysis__legend-value {
  color: #fff;
  font-weight: 500;
}
</style>
