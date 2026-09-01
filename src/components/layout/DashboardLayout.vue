<script setup lang="ts">
import SystemMessageBar from './SystemMessageBar.vue';
import type { DesignModule } from '@/utils/designAssets';

/** 全局开关：底部消息条暂定隐藏，后续按需求恢复 */
const MESSAGE_BAR_ENABLED = false;

defineProps<{
  module: DesignModule;
  activeNav: string;
  headerTitle?: string;
  hideMessageBar?: boolean;
}>();
</script>

<template>
  <div class="dashboard-layout__ui">
    <!-- 源项目 AppHeader 顶导航已剥离：本组件作为主壳 AppLayout 的二级页内容层，
         顶部导航由脚手架壳层提供，避免双头部；页面级标题/返回导航由各页面自带 -->

    <main class="dashboard-layout__main">
      <slot />
    </main>

    <slot name="bottom" />

    <SystemMessageBar v-if="MESSAGE_BAR_ENABLED && !hideMessageBar" :module="module" />
  </div>
</template>

<style scoped>
.dashboard-layout__ui {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
  pointer-events: none;
}

.dashboard-layout__ui > * {
  pointer-events: auto;
}

.dashboard-layout__main {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  padding: 8px 19px 6px;
  min-height: 0;
  height: 0;
  pointer-events: none;
}
</style>
