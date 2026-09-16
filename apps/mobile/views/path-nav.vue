<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import MapPanel from '../components/MapPanel.vue';
import { MM_CENTER, demoRoute, routeMarkers } from '../data/geo';
import { fetchTasks, type TaskItem } from '@/services/task';
import { isOfflineNoBackend, notifyBackendOffline } from '@/services/backendFallback';

/**
 * 任务路径规划（docs/UI规范-移动端.md §5.1）
 *
 * 任务信息取自后端 /api/v1/tasks（首条），取代原 data/mock.ts 的 tasks[0]。
 * 地图中心 / 标注 / 轨迹仍复用 data/geo.ts（几何与 UI 结构，by-design 非后端缺口）。
 * - 图例 / 避让提示走共享类；地图中心复用 MM_CENTER 与标注同源。
 */
const loading = ref(false);
const task = ref<TaskItem | null>(null);

async function load(): Promise<void> {
  loading.value = true;
  try {
    if (isOfflineNoBackend()) {
      notifyBackendOffline('tasks', '/tasks');
      task.value = null;
      return;
    }
    const res = await fetchTasks();
    task.value = res.items?.[0] ?? null;
  } catch {
    task.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="任务路径规划" back-to="/tasks" />

    <div class="mb-stack">
      <div v-if="task" class="mb-card">
        <div class="mb-card__title">
          <span class="path-nav__name">
            <Icon name="task" size="var(--mb-ico-md)" />
            处置任务 · {{ task.title }}
          </span>
          <span class="tag tag--danger">{{ task.level }}</span>
        </div>
        <p class="mb-card__desc">
          {{ task.taskCode }} · 目标：{{ task.area }} · 时限 {{ task.deadline }}
        </p>
      </div>

      <div v-else-if="!loading" class="mb-empty">
        <div class="mb-empty__art" />
        <p class="mb-empty__text">暂无关联处置任务</p>
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
