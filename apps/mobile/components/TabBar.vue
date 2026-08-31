<script setup lang="ts">
import type { Component } from 'vue';
import { RouterLink } from 'vue-router';
import { HomeFilled, Bell, User } from '@element-plus/icons-vue';

type TabKey = 'home' | 'messages' | 'profile';
defineProps<{ active: TabKey }>();

const TABS: { key: TabKey; to: string; label: string; icon: Component }[] = [
  { key: 'home', to: '/home', label: '首页', icon: HomeFilled },
  { key: 'messages', to: '/messages', label: '消息', icon: Bell },
  { key: 'profile', to: '/profile', label: '我的', icon: User },
];
</script>

<template>
  <nav class="tab-bar">
    <RouterLink
      v-for="t in TABS"
      :key="t.key"
      :to="t.to"
      class="tab-bar__item"
      :class="{ 'is-active': active === t.key }"
    >
      <component :is="t.icon" class="tab-bar__icon" />
      <span class="tab-bar__label">{{ t.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.tab-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(var(--mb-bottom-bar-h) + var(--mb-bottom-safe));
  padding-bottom: var(--mb-bottom-safe);
  display: flex;
  background: var(--card-mobile);
  border-top: 1px solid var(--color-border);
  z-index: var(--z-chrome);
}

.tab-bar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--text-muted-mobile);
  text-decoration: none;
  font-size: var(--mb-fz-tip);
}

.tab-bar__item.is-active {
  color: var(--primary-mobile);
}

.tab-bar__icon {
  width: 24px;
  height: 24px;
}
</style>
