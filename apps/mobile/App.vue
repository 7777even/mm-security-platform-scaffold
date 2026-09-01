<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import TabBar, { type TabKey } from './components/TabBar.vue';

/**
 * 移动端布局壳（docs/UI规范-移动端.md §3 + 2026-08 原型图）
 * - 页面灰底 + 单列卡片流主区；顶栏由各页面用 MobileHeader 自行声明（brand / back 两变体）
 * - 底部标签栏 3 入口（首页 / 消息 / 我的），**由本壳唯一持有**：此前 App.vue 与页面
 *   各自渲染一份底部栏，两个 fixed 栏叠加导致重复渲染，本次迁移收敛为单一真源。
 * - 仅 tab 页（路由 meta.tab）显示底栏；列表 / 详情 / 流程页不显示，避免与底部主操作条打架
 * - 安全区 var(--mb-bottom-safe)（刘海 / 手势条）由底栏自身预留
 */
const route = useRoute();

const TAB_KEYS: TabKey[] = ['home', 'messages', 'profile'];

const activeTab = computed<TabKey | null>(() => {
  const tab = route.meta.tab;
  return TAB_KEYS.includes(tab as TabKey) ? (tab as TabKey) : null;
});
</script>

<template>
  <div class="mb-layout">
    <main class="mb-main" :class="{ 'mb-main--tabbed': activeTab }">
      <RouterView />
    </main>

    <TabBar v-if="activeTab" :active="activeTab" />
  </div>
</template>

<style scoped>
.mb-layout {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

/* 主区：有底栏时预留底栏 + 安全区，避免内容被固定栏遮挡 */
.mb-main {
  flex: 1;
}

.mb-main--tabbed {
  padding-bottom: calc(var(--mb-bottom-bar-h) + var(--mb-bottom-safe));
}
</style>
