<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import { tasks } from '../data/mock';

/**
 * 任务详情（docs/UI规范-移动端.md §5）
 *
 * ui-redesign 迁移（2026-08，源 views/mobile/TaskDetail.vue）：
 * - 只读字段由参考的「一字段一白卡」改为共享类 `.mb-detail` 分组卡（标签左 / 值右，
 *   行高 48），与 alarm-detail / plan-detail 的详情页模板保持一致。
 * - 「路径规划 →」入口保留在「位置」行内，热区由 `.mb-detail__row` 承担（≥48）。
 * - 等级标签走 `.tag--*` 枚举；主操作「一键确认接收」唯一，次操作用白底描边。
 */
const route = useRoute();
const task = computed(() => tasks.find((x) => x.id === route.params.id) ?? tasks[0]);

const LEVEL_TAG: Record<string, string> = {
  紧急: 'tag--danger',
  重要: 'tag--warning',
  一般: 'tag--info',
};
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="任务详情" back-to="/tasks" />

    <div class="mb-stack">
      <div class="mb-card">
        <div class="mb-card__title">
          <span>{{ task.name }}</span>
          <span class="tag" :class="LEVEL_TAG[task.level]">{{ task.level }}</span>
        </div>
        <p class="mb-card__desc">{{ task.id }}</p>
      </div>

      <div class="mb-detail">
        <div class="mb-detail__row">
          <span class="mb-detail__label">任务来源</span>
          <span class="mb-detail__value">{{ task.src }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">位置</span>
          <span class="mb-detail__value">
            {{ task.area }}
            <RouterLink class="task-detail__path" to="/path">路径规划 →</RouterLink>
          </span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">要求完成时间</span>
          <span class="mb-detail__value">{{ task.deadline }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">任务内容</span>
          <span class="mb-detail__value">{{ task.desc }}</span>
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
</style>
