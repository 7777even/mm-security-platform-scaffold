<script setup lang="ts">
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import { events } from '../data/mock';

/**
 * 应急事件列表（docs/UI规范-移动端.md §5）
 *
 * ui-redesign 迁移（2026-08，源 views/mobile/Events.vue）：
 * - 卡片流复用 `.mb-stack` + `.mb-card--link`，替换参考各页重复的内联 `.card` 白卡样式。
 * - 卡片间距由共享类的 gap 统一控制，删除各页散落的 `margin-bottom`。
 * - 等级标签只走 `.tag--*` 枚举（§6 状态映射），不自造色阶。
 */
interface EventItem {
  id: string;
  name: string;
  level: string;
  time: string;
  area: string;
  st: string;
  phase: string;
  tasks: number;
  done: number;
  plan: string;
  desc: string;
}

const list: EventItem[] = events;

const LEVEL_TAG: Record<string, string> = {
  一级: 'tag--danger',
  二级: 'tag--warning',
  三级: 'tag--info',
};
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="应急事件" back-to="/home" />

    <div class="mb-stack">
      <RouterLink
        v-for="e in list"
        :key="e.id"
        class="mb-card mb-card--link"
        :to="`/events/${e.id}`"
      >
        <div class="mb-card__title">
          <span>{{ e.name }}</span>
          <span class="tag" :class="LEVEL_TAG[e.level]">{{ e.level }}</span>
        </div>
        <p class="mb-card__desc">{{ e.id }} · {{ e.time }}</p>
        <p class="mb-card__desc">状态：{{ e.st }} · 已派指令 {{ e.tasks }} / 完成 {{ e.done }}</p>
      </RouterLink>
    </div>
  </div>
</template>
