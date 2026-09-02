<script setup lang="ts">
import AppHeader from './AppHeader.vue';
import SystemMessageBar from './SystemMessageBar.vue';
import type { DesignModule } from '../../utils/designAssets';

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
    <AppHeader :module="module" :active-nav="activeNav" :title="headerTitle" />

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
  z-index: var(--z-chrome);
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
