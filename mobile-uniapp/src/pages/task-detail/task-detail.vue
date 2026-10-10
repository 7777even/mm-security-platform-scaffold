<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import MobileHeader from '@/components/MobileHeader.vue';
import { fetchTaskDetail, type TaskItem } from '@/platform/api';
import { go } from '@/platform/nav';

// 任务详情（docs/UI规范-移动端.md §5）。数据源：后端 /api/v1/tasks/{id}。未命中走空态。
const task = ref<TaskItem | null>(null);
const loading = ref(false);

const LEVEL_TAG: Record<string, string> = {
  紧急: 'tag--danger',
  重要: 'tag--warning',
  一般: 'tag--info',
};

async function load(id: string): Promise<void> {
  loading.value = true;
  try {
    task.value = await fetchTaskDetail(id);
  } catch {
    task.value = null;
  } finally {
    loading.value = false;
  }
}

onLoad((query?: { id?: string }) => {
  if (query?.id) void load(query.id);
});

function onConfirm(): void {
  uni.showToast({ title: '确认接收待后端接口支持', icon: 'none' });
}
function onFeedback(): void {
  uni.showToast({ title: '处置反馈待后端接口支持', icon: 'none' });
}
function onPath(): void {
  go('/pages/path-nav/path-nav');
}
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="任务详情" />

    <text v-if="loading" class="mb-loading">加载中…</text>

    <view v-else-if="!task" class="mb-empty">
      <text class="mb-empty__text">未找到该任务</text>
    </view>

    <view v-else class="mb-stack">
      <view class="mb-card">
        <view class="mb-card__title">
          <text>{{ task.title }}</text>
          <text class="tag" :class="LEVEL_TAG[task.level ?? ''] ?? 'tag--info'">{{
            task.level
          }}</text>
        </view>
        <text class="mb-card__desc">{{ task.taskCode }} · {{ task.status }}</text>
      </view>

      <view class="mb-detail">
        <view class="mb-detail__row">
          <text class="mb-detail__label">任务来源</text>
          <text class="mb-detail__value">{{ task.source || '—' }}</text>
        </view>
        <view class="mb-detail__row">
          <text class="mb-detail__label">位置</text>
          <text class="mb-detail__value"
            >{{ task.area || '—' }}
            <text class="task-detail__path" @click="onPath">路径规划 →</text></text
          >
        </view>
        <view class="mb-detail__row">
          <text class="mb-detail__label">要求完成时间</text>
          <text class="mb-detail__value">{{ task.deadline || '—' }}</text>
        </view>
        <view class="mb-detail__row">
          <text class="mb-detail__label">任务内容</text>
          <text class="mb-detail__value">{{ task.description || '—' }}</text>
        </view>
      </view>

      <button type="button" class="mb-btn-primary mb-btn-block" @click="onConfirm">
        一键确认接收
      </button>
      <button type="button" class="mb-btn-ghost mb-btn-block" @click="onFeedback">处置反馈</button>
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
  padding: var(--space-md) var(--mb-pad-x);
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

.mb-card__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  font-size: var(--mb-fz-form-label);
  font-weight: 600;
  color: var(--text-title-mobile);
}

.mb-card__desc {
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
}

.mb-detail {
  padding: var(--space-md);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
}

.mb-detail__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 88rpx;
  border-bottom: var(--mb-border-w) solid var(--mb-stroke);
}

.mb-detail__row:last-child {
  border-bottom: none;
}

.mb-detail__label {
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
}

.mb-detail__value {
  font-size: var(--mb-fz-form-label);
  color: var(--text-title-mobile);
}

.task-detail__path {
  display: inline-block;
  margin-left: var(--space-sm);
  font-size: var(--mb-fz-help);
  color: var(--primary-mobile);
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

.mb-btn-primary {
  background: var(--primary-mobile);
  color: #fff;
  border: none;
  border-radius: var(--mb-radius-ctrl);
  min-height: 88rpx;
  font-size: var(--mb-fz-form-label);
}

.mb-btn-ghost {
  background: #fff;
  color: var(--primary-mobile);
  border: 1rpx solid var(--primary-mobile);
  border-radius: var(--mb-radius-ctrl);
  min-height: 88rpx;
  font-size: var(--mb-fz-form-label);
}

.mb-btn-block {
  width: 100%;
}
</style>
