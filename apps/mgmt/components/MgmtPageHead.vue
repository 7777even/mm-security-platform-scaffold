<script setup lang="ts">
import type { Component } from 'vue';
import MgmtIconTile from './MgmtIconTile.vue';
import type { IconTileTone } from './MgmtIconTile.vue';

// 后台管理端通用页头：IconTile + 标题/面包屑 + 右侧操作插槽（主操作实色按钮）。
// 与 MgmtTablePage 页头同视觉；供服务驱动页面复用。
withDefaults(
  defineProps<{
    title: string;
    crumb?: string;
    icon: Component;
    iconTone?: IconTileTone;
  }>(),
  { crumb: '', iconTone: 'blue' },
);
</script>

<template>
  <div class="mgmt-ph">
    <div class="mgmt-ph__left">
      <MgmtIconTile :icon="icon" :tone="iconTone" size="md" variant="soft" shape="rounded" />
      <div class="mgmt-ph__text">
        <div class="mgmt-ph__title">{{ title }}</div>
        <div v-if="crumb" class="mgmt-ph__crumb">{{ crumb }}</div>
      </div>
    </div>
    <div class="mgmt-ph__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.mgmt-ph {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  gap: var(--space-md);
}

.mgmt-ph__left {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.mgmt-ph__title {
  font-size: var(--mgmt-fz-header);
  font-weight: 700;
  color: var(--text-title-mgmt);
  letter-spacing: 0.2px;
}

.mgmt-ph__crumb {
  margin-top: var(--space-xs);
  font-size: var(--mgmt-fz-caption);
  color: var(--text-muted-mgmt);
}

.mgmt-ph__actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
</style>
