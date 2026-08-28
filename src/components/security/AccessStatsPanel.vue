<!--
  AccessStatsPanel — §安全防恐「出入统计」
  顶部 Tab 切换（人数/警车车辆/危化车）+ 进出数字 + 小时折线趋势 + 车辆环形+图例。
-->
<script setup lang="ts">
import { ref, computed } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';
import LineChart from '@/components/charts/LineChart.vue';

const tabs = ['人数', '警车车辆', '危化车'] as const;
type TabKey = (typeof tabs)[number];
const activeTab = ref<TabKey>('人数');

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface TabData {
  in: number;
  out: number;
  total: number;
  categories: string[];
  inSeries: number[];
  outSeries: number[];
  donut: DonutSlice[];
}

const dataMap: Record<TabKey, TabData> = {
  人数: {
    in: 4980,
    out: 4560,
    total: 261,
    categories: ['7:00', '9:00', '11:00', '13:00', '15:00', '17:00'],
    inSeries: [120, 230, 380, 520, 650, 800],
    outSeries: [80, 200, 360, 480, 600, 780],
    donut: [
      { label: '在岗人员', value: 100, color: 'var(--color-accent)' },
      { label: '厂家门工', value: 100, color: 'var(--color-success)' },
      { label: '其它', value: 3, color: 'var(--color-warning)' },
    ],
  },
  警车车辆: {
    in: 86,
    out: 78,
    total: 32,
    categories: ['7:00', '9:00', '11:00', '13:00', '15:00', '17:00'],
    inSeries: [10, 20, 35, 50, 70, 86],
    outSeries: [8, 18, 30, 45, 60, 78],
    donut: [
      { label: '在岗警车', value: 24, color: 'var(--color-accent)' },
      { label: '厂家警车', value: 6, color: 'var(--color-success)' },
      { label: '其它', value: 2, color: 'var(--color-warning)' },
    ],
  },
  危化车: {
    in: 24,
    out: 18,
    total: 12,
    categories: ['7:00', '9:00', '11:00', '13:00', '15:00', '17:00'],
    inSeries: [2, 5, 9, 14, 20, 24],
    outSeries: [1, 3, 7, 11, 15, 18],
    donut: [
      { label: '在岗危化车', value: 8, color: 'var(--color-accent)' },
      { label: '厂家危化车', value: 3, color: 'var(--color-success)' },
      { label: '其它', value: 1, color: 'var(--color-warning)' },
    ],
  },
};

const current = computed(() => dataMap[activeTab.value]);

const donutGradient = computed(() => {
  const d = current.value.donut;
  const total = d.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0;
  const stops = d.map((x) => {
    const start = (acc / total) * 100;
    acc += x.value;
    const end = (acc / total) * 100;
    return `${x.color} ${start}% ${end}%`;
  });
  return `conic-gradient(${stops.join(', ')})`;
});
</script>

<template>
  <PanelCard title="出入统计" icon="DataAnalysis">
    <div class="tabs">
      <button
        v-for="t in tabs"
        :key="t"
        type="button"
        :class="['tabs__btn', { 'tabs__btn--active': activeTab === t }]"
        @click="activeTab = t"
      >
        {{ t }}
      </button>
    </div>

    <div class="nums">
      <div class="nums__item">
        <span class="nums__label">进厂人入厂</span>
        <span class="nums__value nums__value--cyan">{{ current.in }}</span>
      </div>
      <div class="nums__item">
        <span class="nums__label">厂出</span>
        <span class="nums__value nums__value--green">{{ current.out }}</span>
      </div>
    </div>

    <div class="chart">
      <LineChart
        :categories="current.categories"
        :series="[
          { name: '进厂', data: current.inSeries, color: 'var(--color-accent)' },
          { name: '出厂', data: current.outSeries, color: 'var(--color-success)' },
        ]"
        :area="true"
      />
    </div>

    <div class="donut-row">
      <div class="donut" :style="{ background: donutGradient }">
        <div class="donut__center">
          <div class="donut__total">{{ current.total }}</div>
          <div class="donut__total-label">总车</div>
        </div>
      </div>
      <ul class="legend">
        <li v-for="x in current.donut" :key="x.label">
          <span class="legend__dot" :style="{ background: x.color }" />
          <span class="legend__label">{{ x.label }}</span>
          <span class="legend__val">{{ x.value }}</span>
        </li>
      </ul>
    </div>
  </PanelCard>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
}

.tabs__btn {
  padding: var(--space-xs) var(--space-md);
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
  background: var(--color-panel-soft);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    color var(--transition-fast),
    border-color var(--transition-fast);
}

.tabs__btn--active {
  color: var(--color-accent);
  background: var(--color-accent-faint);
  border-color: var(--color-accent-glow);
}

.nums {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.nums__item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  background: var(--color-panel-soft);
  border: 1px solid var(--panel-border);
}

.nums__label {
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.nums__value {
  font-family: var(--font-number);
  font-size: var(--font-size-time);
  font-weight: 700;
}

.nums__value--cyan {
  color: var(--color-accent);
}

.nums__value--green {
  color: var(--color-success);
}

.chart {
  height: 110px;
  margin: var(--space-sm) 0;
}

.donut-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--panel-border);
}

.donut {
  position: relative;
  flex-shrink: 0;
  width: 92px;
  height: 92px;
  border-radius: 50%;

  /* 用 mask 掏空中心，做成环形 */
  mask: radial-gradient(circle, transparent 52%, black 53%);
}

.donut__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  /* 反向 mask，让中心数字盖在环形之上 */
  pointer-events: none;
}

.donut__total {
  font-family: var(--font-number);
  font-size: var(--font-size-metric);
  font-weight: 700;
  color: var(--color-text-strong);
  line-height: 1.1;
}

.donut__total-label {
  font-size: var(--font-size-date);
  color: var(--color-text-muted);
  letter-spacing: 1px;
  margin-top: var(--space-xs);
}

.legend {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.legend li {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-helper);
}

.legend__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend__label {
  flex: 1;
  color: var(--color-text);
}

.legend__val {
  font-family: var(--font-number);
  color: var(--color-text-strong);
  font-weight: 600;
}
</style>
