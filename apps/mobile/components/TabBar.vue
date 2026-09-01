<script setup lang="ts">
import { RouterLink } from 'vue-router';
import Icon from './Icon.vue';

/**
 * 底部标签栏：3 入口（首页 / 消息 / 我的），单手可达。
 *
 * ui-redesign 迁移（2026-08）：图标由 Element Plus 图标换成与参考项目同源的
 * 双色图标集（Icon.vue），保证三端导航图标视觉重量一致；选中态仅改主色。
 * 底栏由布局壳 App.vue 唯一持有，页面内不得再单独渲染一份。
 */
export type TabKey = 'home' | 'messages' | 'profile';

defineProps<{ active: TabKey }>();

const TABS: { key: TabKey; to: string; label: string; icon: string }[] = [
  { key: 'home', to: '/home', label: '首页', icon: 'home' },
  { key: 'messages', to: '/messages', label: '消息', icon: 'message' },
  { key: 'profile', to: '/profile', label: '我的', icon: 'user' },
];
</script>

<template>
  <nav class="tab-bar" aria-label="主导航">
    <RouterLink
      v-for="t in TABS"
      :key="t.key"
      :to="t.to"
      class="tab-bar__item"
      :class="{ 'is-active': active === t.key }"
    >
      <Icon :name="t.icon" size="var(--mb-ico-xl)" mono />
      <span class="tab-bar__label">{{ t.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.tab-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: var(--z-chrome);
  display: flex;
  height: calc(var(--mb-bottom-bar-h) + var(--mb-bottom-safe));
  padding-bottom: var(--mb-bottom-safe);
  background: var(--card-mobile);
  border-top: var(--mb-border-w) solid var(--mb-stroke);
}

/* 标签项：图标上、文字下，全高触控热区（56px ≥ 48 下限） */
.tab-bar__item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  font-size: var(--mb-fz-tip);
  color: var(--mb-muted);
  text-decoration: none;
}

.tab-bar__item.is-active {
  font-weight: 700;
  color: var(--primary-mobile);
}
</style>
