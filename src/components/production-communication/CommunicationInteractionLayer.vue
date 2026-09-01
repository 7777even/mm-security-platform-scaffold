<!--
  CommunicationInteractionLayer — 生产通信模块二级界面分发层
  悬挂于 src/views/production-communication/index.vue。按 useCommunicationInteraction 的 openKind 分发渲染对应二级界面，
  关闭即交还调度层（ia.close）卸载本层内容，不离开当前模块。
  自身不渲染任何 UI 框架，仅做分发（对齐 FireAlarmInteractionLayer 模式）。
-->
<script setup lang="ts">
import { computed } from 'vue';
import { useCommunicationInteraction } from '@/composables/useCommunicationInteraction';
import type { CommunicationDevice } from '@/services/map-data/communicationDeviceMock';
import OneKeyBroadcastDialog from './OneKeyBroadcastDialog.vue';
import SinglePointBroadcastDialog from './SinglePointBroadcastDialog.vue';
import DeviceDetailDialog from './DeviceDetailDialog.vue';

const ia = useCommunicationInteraction();
const payload = computed(() => ia.current.value?.payload as CommunicationDevice | undefined);
</script>

<template>
  <OneKeyBroadcastDialog v-if="ia.isOpen('oneKeyBroadcast')" @close="ia.close()" />
  <SinglePointBroadcastDialog
    v-else-if="ia.isOpen('singleBroadcast')"
    :device="payload"
    @close="ia.close()"
  />
  <DeviceDetailDialog v-else-if="ia.isOpen('deviceDetail')" :device="payload" @close="ia.close()" />
</template>
