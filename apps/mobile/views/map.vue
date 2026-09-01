<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import MapPanel, { type MapMarker } from '../components/MapPanel.vue';
import { MM_CENTER, alarmMarkers } from '../data/geo';

/**
 * 报警态势地图（docs/UI规范-移动端.md §5.1「地图视图（轻量化，无大屏地图壳层）」）
 *
 * ui-redesign 迁移（2026-08，源 views/mobile/MapView.vue）：
 * - 筛选 chip 复用 `.mb-chips` / `.mb-chip`：参考实现热区仅 30px，按 §1.4 提升到 48。
 * - 图例上提为共享类 `.mb-legend*`，圆点色走语义 token（原为内联 `.r/.o/.g` + hex）。
 * - 选中态：参考用主色实底 + 白字，此处沿用 `.mb-chip--on`。
 * - 过滤口径修正：参考按 `title.includes(分类)` 模糊匹配（GDS 等分类在演示数据里
 *   命中为空、表现为"点了没反应"）。改为匹配 `data/geo.ts` 新增的 `kind` 字段，精确筛选。
 * - 统计口径修正：参考把「未处置 2 / 处理中 1 / 已处理 3」写死，与过滤结果脱节；
 *   改为按当前过滤结果的标注语义色实时统计。
 */
const CHIPS = ['全部', '消防', 'GDS', 'DCS', '周界', '视频AI'] as const;
type Chip = (typeof CHIPS)[number];

const active = ref<Chip>('全部');

const filteredMarkers = computed<MapMarker[]>(() =>
  active.value === '全部' ? alarmMarkers : alarmMarkers.filter((m) => m.kind === active.value),
);

const DANGER = 'var(--danger-mobile)';
const WARNING = 'var(--warning-mobile)';

/** 按标注语义色统计：红=未处置，橙=处理中，绿=已处理 */
const stats = computed(() => {
  const pending = filteredMarkers.value.filter((m) => m.color === DANGER).length;
  const handling = filteredMarkers.value.filter((m) => m.color === WARNING).length;
  const done = filteredMarkers.value.length - pending - handling;
  return { total: filteredMarkers.value.length, pending, handling, done };
});
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
      label="GIS 底图 · 茂名石化厂区"
    />

    <div class="mb-legend">
      <span class="mb-legend__item"> <i class="mb-legend__dot mb-legend__dot--danger" />一级 </span>
      <span class="mb-legend__item">
        <i class="mb-legend__dot mb-legend__dot--warning" />二级
      </span>
      <span class="mb-legend__item">
        <i class="mb-legend__dot mb-legend__dot--success" />已处置
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
