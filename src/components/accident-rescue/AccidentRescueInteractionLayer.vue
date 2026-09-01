<!--
  AccidentRescueInteractionLayer — 事故应急救援模块二级界面分发层
  悬挂于 src/views/accident-rescue/index.vue。按 useAccidentRescueInteraction 的 openKind 分发渲染对应二级界面，
  关闭即交还调度层（ia.close）卸载本层内容，不离开当前模块。
  自身不渲染任何 UI 框架，仅做分发。
-->
<script setup lang="ts">
import { useAccidentRescueInteraction } from '@/composables/useAccidentRescueInteraction';
import EmergencyAddressBookDialog from './EmergencyAddressBookDialog.vue';

const ia = useAccidentRescueInteraction();
</script>

<template>
  <EmergencyAddressBookDialog v-if="ia.isOpen('addressBook')" :open="true" @close="ia.close()" />
</template>
