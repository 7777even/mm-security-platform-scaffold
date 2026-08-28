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
        :series="[{ name: '告警数量', data, color: 'var(--color-accent)' }]"
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
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.filter__divider {
  color: var(--color-text-muted);
  opacity: 0.5;
}

.filter__btn {
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-pill);
  background: var(--color-accent-faint);
  color: var(--color-accent);
  border: 1px solid var(--color-accent-glow);
  font-size: var(--font-size-helper);
  cursor: pointer;
}

.chart {
  height: 160px;
}
</style>
