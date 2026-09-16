<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import MapPanel, { type MapMarker } from '../components/MapPanel.vue';
import { MM_CENTER } from '../data/geo';
import { fetchAlarmPoints, type MapPoint } from '@/services/map';
import { alarmLevelTier, mapPointsToMarkers } from '../lib/mapAlarm';

/**
 * 报警态势地图（docs/UI规范-移动端.md §5.1「地图视图（轻量化，无大屏地图壳层）」）
 *
 * 2026-09-16 重构：报警撒点由本地 data/geo.ts 硬编码改为真实后端 GET /map/alarms
 * （与大屏地图撒点同源 fac_alarm，经 device_code 关联 fac_device 坐标）。
 * - 筛选维度由演示的 kind（消防/GDS/DCS/周界/视频AI）改为「报警等级」：
 *   后端撒点无 kind 字段，且 kind 是「来源系统」维度、与移动端要展示的「报警等级」语义不符。
 * - 等级分档：一级(level=1,红) / 二级(level=2,橙) / 三级(level≥3,绿)；色档与图例一致。
 * - 取数三态：失败 / 离线显式告警 + 空态（不回灌本地假数据）。
 */
const CHIPS = ['全部', '一级', '二级', '三级'] as const;
type Chip = (typeof CHIPS)[number];

const active = ref<Chip>('全部');
const points = ref<MapPoint[]>([]);
const loading = ref(false);

const filteredPoints = computed<MapPoint[]>(() =>
  active.value === '全部'
    ? points.value
    : points.value.filter((p) => alarmLevelTier(p.level) === active.value),
);

const filteredMarkers = computed<MapMarker[]>(() => mapPointsToMarkers(filteredPoints.value));

/** 按等级色档统计：红=一级，橙=二级，绿=三级及以上 */
const stats = computed(() => {
  const list = filteredPoints.value;
  const pending = list.filter((p) => p.level === 1).length;
  const handling = list.filter((p) => p.level === 2).length;
  const done = list.filter((p) => (p.level ?? 0) >= 3).length;
  return { total: list.length, pending, handling, done };
});

async function loadPoints(): Promise<void> {
  loading.value = true;
  try {
    points.value = await fetchAlarmPoints();
  } finally {
    loading.value = false;
  }
}

onMounted(loadPoints);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="报警态势地图" back-to="/home" />

    <div class="mb-chips">
      <button
        v-for="c in CHIPS"
        :key="c"
        type="button"
        class="mb-chip"
        :class="{ 'mb-chip--on': active === c }"
        @click="active = c"
      >
        {{ c }}
      </button>
    </div>

    <MapPanel
      height="var(--mb-map-h)"
      :center="MM_CENTER"
      :zoom="13"
      :markers="filteredMarkers"
      :label="`报警态势 · ${stats.total} 起`"
    />

    <div v-if="loading" class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">加载中…</p>
    </div>
    <div v-else-if="!filteredMarkers.length" class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">暂无报警点位</p>
    </div>

    <div class="mb-legend">
      <span class="mb-legend__item"> <i class="mb-legend__dot mb-legend__dot--danger" />一级 </span>
      <span class="mb-legend__item">
        <i class="mb-legend__dot mb-legend__dot--warning" />二级
      </span>
      <span class="mb-legend__item">
        <i class="mb-legend__dot mb-legend__dot--success" />三级
      </span>
    </div>

    <div class="mb-stack">
      <div class="mb-card">
        <h2 class="mb-card__title">统计</h2>
        <p class="mb-card__desc">
          今日报警 {{ stats.total }} 起 · 未处置 {{ stats.pending }} · 处理中 {{ stats.handling }} ·
          已处理 {{ stats.done }}
        </p>
      </div>

      <RouterLink class="mb-btn-ghost mb-btn-block" to="/alarms">查看全部告警明细</RouterLink>
    </div>
  </div>
</template>
