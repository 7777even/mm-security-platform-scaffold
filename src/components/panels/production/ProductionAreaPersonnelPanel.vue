<script setup lang="ts">
import { computed } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import PanelCard from '../../common/PanelCard.vue';
import type { ProductionAreaPersonnelSlice } from '@/services/map-data/productionAreaMock';

use([PieChart, TooltipComponent, CanvasRenderer]);

const props = defineProps<{
  total: number;
  slices: ProductionAreaPersonnelSlice[];
}>();

const pieOption = computed(() => ({
  animation: false,
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(8, 28, 58, 0.92)',
    borderColor: 'rgba(0, 148, 236, 0.35)',
    textStyle: { color: '#dbe7f8', fontSize: 12 },
    formatter: '{b}: {c}人 ({d}%)',
  },
  series: [
    {
      type: 'pie',
      radius: ['58%', '78%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      label: { show: false },
      labelLine: { show: false },
      data: props.slices.map((s) => ({
        name: s.name,
        value: s.value,
        itemStyle: { color: s.color },
      })),
    },
  ],
}));
</script>

<template>
  <PanelCard title="区域人员统计" variant="facilities" module="production" :show-more="true">
    <div class="personnel">
      <div class="personnel__chart-wrap">
        <VChart class="personnel__chart" :option="pieOption" autoresize />
        <div class="personnel__center">
          <div class="personnel__center-value">{{ total }}人</div>
          <div class="personnel__center-label">在岗</div>
        </div>
      </div>

      <ul class="personnel__legend">
        <li v-for="slice in slices" :key="slice.name" class="personnel__legend-item">
          <span class="personnel__dot" :style="{ background: slice.color }" />
          <span class="personnel__name">{{ slice.name }}</span>
          <span class="personnel__value">{{ slice.value }}</span>
        </li>
      </ul>
    </div>
  </PanelCard>
</template>

<style scoped>
:deep(.panel-card__content) {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 8px 12px 12px;
}

.personnel {
  display: grid;
  grid-template-columns: 1fr 120px;
  gap: 8px;
  height: 100%;
  min-height: 0;
  align-items: center;
}

.personnel__chart-wrap {
  position: relative;
  width: 100%;
  height: 180px;
}

.personnel__chart {
  width: 100%;
  height: 100%;
}

.personnel__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.personnel__center-value {
  font-size: 22px;
  font-weight: 700;
  color: #e8f4ff;
  line-height: 1.1;
}

.personnel__center-label {
  margin-top: 4px;
  font-size: 12px;
  color: #8aa4c4;
}

.personnel__legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.personnel__legend-item {
  display: grid;
  grid-template-columns: 8px 1fr auto;
  gap: 6px;
  align-items: center;
  font-size: 12px;
  color: #c8d8ec;
}

.personnel__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.personnel__name {
  color: #8aa4c4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.personnel__value {
  font-variant-numeric: tabular-nums;
  color: #e8f4ff;
}
</style>
