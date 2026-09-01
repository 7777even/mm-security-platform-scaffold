<!--
  SecurityInteractionLayer — 安全防恐模块二级界面分发层
  挂载于 src/views/security-anti-terror/index.vue，按 useSecurityInteraction 的 openKind 分发渲染，
  关闭即交还调度层（ia.close）卸载本层内容，不离开当前模块。
-->
<script setup lang="ts">
import { computed } from 'vue';
import { useSecurityInteraction } from '@/composables/useSecurityInteraction';
import type { PatrolItemPayload } from '@/composables/useSecurityInteraction';
import HazardSourceDialog from './HazardSourceDialog.vue';
import PatrolDetailDialog from './PatrolDetailDialog.vue';
import PatrolListDialog from './PatrolListDialog.vue';

const ia = useSecurityInteraction();
const payload = computed(() => ia.current.value?.payload);
</script>

<template>
  <HazardSourceDialog v-if="ia.isOpen('hazardSource')" @close="ia.close()" />
  <PatrolDetailDialog
    v-else-if="ia.isOpen('patrolDetail')"
    :payload="payload as PatrolItemPayload | undefined"
    @close="ia.close()"
  />
  <PatrolListDialog v-else-if="ia.isOpen('patrolList')" @close="ia.close()" />
</template>
