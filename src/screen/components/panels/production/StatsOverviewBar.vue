<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import ProductionStatCard from '../../common/ProductionStatCard.vue';
import { fetchDashboardOverview } from '@/services/alarm';
import { statOverview } from '../../../lib/data/productionMock';
import type { StatOverviewItem } from '../../../lib/data/productionMock';

const overview = ref<{
  activeAlarm: number;
  deviceOnline: number;
  deviceTotal: number;
  riskIndex: number;
  onlineWorkstation: number;
} | null>(null);

function realStats(): StatOverviewItem[] {
  if (!overview.value) return statOverview;
  const o = overview.value;
  return [
    {
      id: 1,
      label: '活跃告警',
      value: String(o.activeAlarm),
      trend: 0,
      trendUp: false,
      iconIndex: 0,
    },
    {
      id: 2,
      label: '在线设备',
      value: String(o.deviceOnline),
      trend: 0,
      trendUp: false,
      iconIndex: 1,
    },
    {
      id: 3,
      label: '设备总数',
      value: String(o.deviceTotal),
      trend: 0,
      trendUp: false,
      iconIndex: 2,
    },
    {
      id: 4,
      label: '风险指数',
      value: String(o.riskIndex),
      trend: 0,
      trendUp: false,
      iconIndex: 3,
    },
    {
      id: 5,
      label: '在线工位',
      value: String(o.onlineWorkstation),
      trend: 0,
      trendUp: false,
      iconIndex: 4,
    },
  ];
}

const visibleStats = computed(() => realStats());

onMounted(async () => {
  try {
    overview.value = await fetchDashboardOverview();
  } catch {
    // 直连真后端失败时回落内置 mock，保证 UI 可见
  }
});
</script>

<template>
  <section class="stats-bar">
    <div class="stats-bar__items">
      <ProductionStatCard v-for="item in visibleStats" :key="item.id" :stat="item" />
    </div>
  </section>
</template>

<style scoped>
.stats-bar {
  height: 117px;
  pointer-events: auto;
  background: rgb(0 16 36 / 88%);
  border: 1px solid rgb(0 150 230 / 35%);
  border-radius: 2px;
  box-shadow:
    inset 0 1px 0 rgb(0 200 255 / 12%),
    inset 0 -1px 0 rgb(0 80 160 / 20%);
}

.stats-bar__items {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  height: 100%;
  padding: 12px 8px 10px;
}

.stats-bar__items > :deep(*:not(:last-child)) {
  border-right: 1px solid rgb(0 140 220 / 18%);
}
</style>
