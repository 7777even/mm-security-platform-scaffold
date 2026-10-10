<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MobileHeader from '@/components/MobileHeader.vue';
import { fetchTasks, type TaskItem } from '@/platform/api';
import { go } from '@/platform/nav';

// 任务列表：数据源 后端 /api/v1/tasks（处置任务）。未连后端走空态。
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
    const res = await fetchTasks();
    tasks.value = (res.items ?? []).map((t: TaskItem) => ({
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

function onTap(id: number): void {
  go(`/pages/task-detail/task-detail?id=${id}`);
}
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="任务中心" />
    <text v-if="loading" class="mb-loading">加载中…</text>

    <view v-else-if="tasks.length" class="mb-stack">
      <view
        v-for="task in tasks"
        :key="task.id"
        class="mb-card mb-card--link task-card"
        @click="onTap(task.id)"
      >
        <view class="task-card__row">
          <text class="task-card__title">{{ task.title }}</text>
          <text class="tag" :class="TASK_STATUS_TAG[task.status] ?? 'tag--info'">{{
            task.status
          }}</text>
        </view>
        <text class="task-card__meta">{{ task.code }} · {{ task.meta }}</text>
      </view>
    </view>

    <view v-else class="mb-empty">
      <text class="mb-empty__text">暂无处置任务</text>
    </view>
  </view>
</template>

<style scoped>
.mb-loading {
  text-align: center;
  color: var(--text-muted-mobile);
  padding: var(--space-lg) 0;
}

.mb-empty {
  padding: var(--mb-empty-pad) var(--mb-pad-x);
  text-align: center;
}

.mb-empty__text {
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}

.mb-stack {
  display: flex;
  flex-direction: column;
  gap: var(--mb-card-gap);
  padding: var(--mb-card-gap) var(--mb-pad-x);
}

.mb-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-md);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
}

.mb-card--link:active {
  opacity: 0.85;
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
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}

.tag {
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  font-size: var(--mb-fz-help);
  background: #eef1f6;
  color: var(--text-muted-mobile);
}
.tag--danger {
  background: rgb(245 34 45 / 12%);
  color: var(--danger-mobile);
}
.tag--warning {
  background: rgb(250 140 22 / 12%);
  color: var(--warning-mobile);
}
.tag--info {
  background: rgb(22 119 255 / 12%);
  color: var(--primary-mobile);
}
.tag--success {
  background: rgb(82 196 26 / 12%);
  color: var(--success-mobile);
}
</style>
