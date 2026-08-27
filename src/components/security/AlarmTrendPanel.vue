<!--
  AlarmTrendPanel — §安全防恐「告警趋势」
  顶部筛选（告警类型/全部）+ 日期折线趋势（单 series 面积图）。
-->
<script setup lang="ts">
import PanelCard from '@/components/common/PanelCard.vue';
import LineChart from '@/components/charts/LineChart.vue';

const categories = ['4/6', '4/7', '4/8', '4/9', '4/10', '4/12', '4/14', '4/15'];
const data = [25, 30, 22, 40, 35, 50, 42, 38];
</script>

<template>
  <PanelCard title="告警趋势" icon="TrendCharts" more="告警类型">
    <div class="filter">
      <span class="filter__label">告警类型</span>
      <span class="filter__divider">|</span>
      <button type="button" class="filter__btn filter__btn--active">全部</button>
    </div>
    <div class="chart">
      <LineChart
        :categories="categories"
        :series="[{ name: '告警数量', data, color: '#00e1ff' }]"
        :area="true"
        :y-min="0"
      />
    </div>
  </PanelCard>
</template>

<style scoped>
.filter {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.filter__divider {
  color: var(--color-text-muted);
  opacity: 0.5;
}

.filter__btn {
  padding: 2px 10px;
  border-radius: 999px;
  background: rgb(0 225 255 / 10%);
  color: var(--color-accent);
  border: 1px solid rgb(0 225 255 / 40%);
  font-size: 12px;
  cursor: pointer;
}

.chart {
  height: 160px;
}
</style>
