<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { fetchTasks } from '@/services/task';
import { isOfflineNoBackend, notifyBackendOffline } from '@/services/backendFallback';

// 任务列表：单列卡片流参考实现（docs/UI规范-移动端.md §5 模板）
// 数据源：后端 /api/v1/tasks（处置任务），经 fetchTasks 拉取，取代原内联演示数组。
// - 状态/等级映射只用规范枚举（.tag--success/-warning/-danger/-info），禁止自造色阶
// - 未连后端走空态 + 全局离线告警（不回灌假数据）

interface TaskRow {
  id: number;
  code: string;
  title: string;
  meta: string;
  status: string;
}

const TASK_STATUS_TAG: Record<string, string> = {
  待接收: 'tag--warning',
  待执行: 'tag--info',
  执行中: 'tag--warning',
  已签收: 'tag--info',
  已完成: 'tag--success',
  已逾期: 'tag--danger',
};

const loading = ref(false);
const tasks = ref<TaskRow[]>([]);

async function load(): Promise<void> {
  loading.value = true;
  try {
    if (isOfflineNoBackend()) {
      notifyBackendOffline('tasks', '/tasks');
      tasks.value = [];
      return;
    }
    const res = await fetchTasks();
    tasks.value = (res.items ?? []).map((t) => ({
      id: t.id,
      code: t.taskCode,
      title: t.title,
      meta: [t.area, t.deadline].filter(Boolean).join(' · '),
      status: t.status,
    }));
  } catch {
    tasks.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <p v-if="loading" class="mb-loading">加载中…</p>

    <div v-else-if="tasks.length" class="mb-stack">
      <RouterLink
        v-for="task in tasks"
        :key="task.id"
        class="mb-card mb-card--link task-card"
        :to="`/tasks/${task.id}`"
      >
        <div class="task-card__row">
          <span class="task-card__title">{{ task.title }}</span>
          <span class="tag" :class="TASK_STATUS_TAG[task.status] ?? 'tag--info'">{{
            task.status
          }}</span>
        </div>
        <p class="task-card__meta">{{ task.code }} · {{ task.meta }}</p>
      </RouterLink>
    </div>

    <div v-else class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">暂无处置任务</p>
    </div>
  </div>
</template>

<style scoped>
.task-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.task-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.task-card__title {
  font-size: var(--mb-fz-section);
  font-weight: 600;
  color: var(--text-title-mobile);
}

.task-card__meta {
  margin: 0;
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}

.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
