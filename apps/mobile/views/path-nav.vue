<script setup lang="ts">
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import MapPanel from '../components/MapPanel.vue';
import { MM_CENTER, demoRoute, routeMarkers } from '../data/geo';
import { tasks } from '../data/mock';

/**
 * 任务路径规划（docs/UI规范-移动端.md §5.1）
 *
 * ui-redesign 迁移（2026-08，源 views/mobile/PathNav.vue）：
 * - 图例上提为共享类 `.mb-legend*`（原为内联 `.legend .g/.o/.r` + hex）。
 * - 避让提示改用共享类 `.mb-banner .mb-banner--warning`；参考实现的 `.warn` 内联了
 *   `#ffe0b8` / `#b9770e` 两个硬编码色，违反 token 单一真源，改为语义色 token。
 * - 地图中心由字面量 `[21.668, 110.926]` 改为复用 `data/geo.ts` 的 `MM_CENTER`，
 *   与标注 / 轨迹数据同源，避免中心点随数据调整而失配。
 * - 任务信息改取 `data/mock.ts` 的 tasks[0]，替换参考的写死文案。
 */
const task = tasks[0];
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="任务路径规划" back-to="/tasks" />

    <div class="mb-stack">
      <div class="mb-card">
        <div class="mb-card__title">
          <span class="path-nav__name">
            <Icon name="task" size="var(--mb-ico-md)" />
            处置任务 · {{ task.name }}
          </span>
          <span class="tag tag--danger">{{ task.level }}</span>
        </div>
        <p class="mb-card__desc">
          {{ task.id }} · 目标：{{ task.area }} · 时限 {{ task.deadline }}
        </p>
      </div>

      <MapPanel
        height="var(--mb-map-h-md)"
        :center="MM_CENTER"
        :zoom="14"
        :markers="routeMarkers"
        :path="demoRoute"
        label="GIS 路网 · 推荐路径"
      />

      <div class="mb-legend">
        <span class="mb-legend__item">
          <i class="mb-legend__dot mb-legend__dot--success" />推荐路径
        </span>
        <span class="mb-legend__item">
          <i class="mb-legend__dot mb-legend__dot--warning" />断路/避让
        </span>
        <span class="mb-legend__item">
          <i class="mb-legend__dot mb-legend__dot--danger" />目标点
        </span>
      </div>

      <div class="mb-card">
        <h2 class="mb-card__title">路径信息</h2>
        <p class="mb-card__desc">
          里程：2.6 km · 预计 8 分钟<br />途经：电仪中心 → 装置区主干道 → 储运部北门 → T-301
        </p>
      </div>

      <div class="mb-banner mb-banner--warning">
        <span class="path-nav__warn">
          <Icon name="event" size="var(--mb-ico-sm)" />
          避让：聚丙烯装置区南侧道路施工封闭，已自动绕行
        </span>
      </div>

      <button type="button" class="mb-btn-primary mb-btn-block">开始导航</button>
      <button type="button" class="mb-btn-ghost mb-btn-block">缓存路径</button>
    </div>
  </div>
</template>

<style scoped>
.path-nav__name {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-width: 0;
}

.path-nav__warn {
  display: inline-flex;
  align-items: flex-start;
  gap: var(--space-xs);
}
</style>
