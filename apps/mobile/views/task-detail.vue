<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import { fetchTaskDetail, type TaskItem } from '@/services/task';
import { isOfflineNoBackend, notifyBackendOffline } from '@/services/backendFallback';

/**
 * 任务详情（docs/UI规范-移动端.md §5）
 *
 * 数据源：后端 /api/v1/tasks/{id}（处置任务详情），经 fetchTaskDetail 拉取。
 * 取消原 data/mock.ts 静态数据；未连后端 / 未命中走空态 + 全局离线告警（不回灌假数据）。
 * - 只读字段用 .mb-detail 分组卡（标签左 / 值右，行高 48），与 alarm-detail / plan-detail 一致。
 * - 等级标签走 .tag--* 枚举。
 */
const route = useRoute();
const loading = ref(false);
const task = ref<TaskItem | null>(null);

const LEVEL_TAG: Record<string, string> = {
  紧急: 'tag--danger',
  重要: 'tag--warning',
  一般: 'tag--info',
};

async function load(): Promise<void> {
  loading.value = true;
  try {
    if (isOfflineNoBackend()) {
      notifyBackendOffline('tasks', '/tasks/{id}');
      task.value = null;
      return;
    }
    task.value = await fetchTaskDetail(String(route.params.id));
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
    <MobileHeader variant="back" title="任务详情" back-to="/tasks" />

    <p v-if="loading" class="mb-loading">加载中…</p>

    <div v-else-if="!task" class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">未找到该任务</p>
    </div>

    <div v-else class="mb-stack">
      <div class="mb-card">
        <div class="mb-card__title">
          <span>{{ task.title }}</span>
          <span class="tag" :class="LEVEL_TAG[task.level] ?? 'tag--info'">{{ task.level }}</span>
        </div>
        <p class="mb-card__desc">{{ task.taskCode }} · {{ task.status }}</p>
      </div>

      <div class="mb-detail">
        <div class="mb-detail__row">
          <span class="mb-detail__label">任务来源</span>
          <span class="mb-detail__value">{{ task.source || '—' }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">位置</span>
          <span class="mb-detail__value">
            {{ task.area || '—' }}
            <RouterLink class="task-detail__path" to="/path">路径规划 →</RouterLink>
          </span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">要求完成时间</span>
          <span class="mb-detail__value">{{ task.deadline || '—' }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">任务内容</span>
          <span class="mb-detail__value">{{ task.description || '—' }}</span>
        </div>
      </div>

      <button type="button" class="mb-btn-primary mb-btn-block">一键确认接收</button>
      <button type="button" class="mb-btn-ghost mb-btn-block">处置反馈</button>
    </div>
  </div>
</template>

<style scoped>
.task-detail__path {
  display: inline-block;
  margin-left: var(--space-sm);
  font-size: var(--mb-fz-help);
  color: var(--primary-mobile);
  text-decoration: none;
}

.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
