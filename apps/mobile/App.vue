<script setup lang="ts">
import { useRoute } from 'vue-router';

// MobileLayout：移动端布局壳（docs/UI规范-移动端.md §3 + 2026-08 原型图）
// 页面灰底 + 单列卡片流主区 + 底部标签栏 3 入口 56px（首页/消息/我的，图标+文字）
// 底部主操作条预留 var(--mb-bottom-safe) 安全区（刘海/手势条）
// 任务列表不在标签栏（原型定稿 3 入口），经首页「待办任务 / 全部」进入 /tasks
const route = useRoute();

interface TabItem {
  key: string;
  path: string;
  label: string;
}

// 底部标签栏 3 入口；触控热区随标签栏高度（56px ≥ 48 热区下限）
const tabs: TabItem[] = [
  { key: 'home', path: '/home', label: '首页' },
  { key: 'messages', path: '/messages', label: '消息' },
  { key: 'profile', path: '/profile', label: '我的' },
];
</script>

<template>
  <div class="mb-layout">
    <main class="mb-main">
      <RouterView />
    </main>

    <nav class="mb-tabbar" aria-label="主导航">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.key"
        :to="tab.path"
        class="mb-tabbar__item"
        :class="{ 'mb-tabbar__item--active': route.meta.tab === tab.key }"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <template v-if="tab.key === 'home'">
            <path d="M4 11l8-7 8 7v8a2 2 0 0 1-2 2h-4v-6h-4v6H6a2 2 0 0 1-2-2v-8z" />
          </template>
          <template v-else-if="tab.key === 'messages'">
            <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z" />
          </template>
          <template v-else>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
          </template>
        </svg>
        {{ tab.label }}
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.mb-layout {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

/* 主区：底部标签栏 + 安全区预留，避免内容被固定栏遮挡 */
.mb-main {
  flex: 1;
  padding-bottom: calc(var(--mb-bottom-bar-h) + var(--mb-bottom-safe));
}

/* 底部标签栏：白底、顶边分割线、固定底部、预留安全区 */
.mb-tabbar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  height: calc(var(--mb-bottom-bar-h) + var(--mb-bottom-safe));
  padding-bottom: var(--mb-bottom-safe);
  background: var(--card-mobile);
  border-top: var(--mb-border-w, 1px) solid var(--color-border);
}

/* 标签项：图标上、文字下，全高触控热区（≥48px），选中仅改主色 */
.mb-tabbar__item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
  text-decoration: none;
}

.mb-tabbar__item svg {
  width: 20px;
  height: 20px;
}

.mb-tabbar__item--active {
  color: var(--primary-mobile);
  font-weight: 600;
}
</style>
