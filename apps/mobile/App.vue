<script setup lang="ts">
import { useRoute } from 'vue-router';

// MobileLayout：移动端布局壳（docs/UI规范-移动端.md §3）
// 页面灰底 + 内页白底标准顶栏 48px + 单列卡片流主区 + 底部标签栏 4 入口 56px
// 底部主操作条预留 var(--mb-bottom-safe) 安全区（刘海/手势条）
const route = useRoute();

interface TabItem {
  key: string;
  path: string;
  label: string;
}

// 底部标签栏 4 入口；触控热区随标签栏高度（56px ≥ 48 热区下限）
const tabs: TabItem[] = [
  { key: 'home', path: '/home', label: '首页' },
  { key: 'tasks', path: '/tasks', label: '任务' },
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
  border-top: 1px solid var(--color-border);
}

/* 标签项：全高触控热区（≥48px），选中仅改主色 */
.mb-tabbar__item {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  font-size: var(--mb-fz-form-label);
  color: var(--text-muted-mobile);
  text-decoration: none;
}

.mb-tabbar__item--active {
  color: var(--primary-mobile);
  font-weight: 600;
}
</style>
