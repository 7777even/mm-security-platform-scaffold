<!--
  VideoControlInteractionLayer — 视频控制平台模块二级界面分发层
  悬挂于 src/views/video-control/index.vue。按 useVideoControlInteraction 的 openKind 分发渲染对应二级界面，
  关闭即交还调度层（ia.close）卸载本层内容，不离开当前模块。
  自身不渲染任何 UI 框架，仅做分发。
-->
<script setup lang="ts">
import { computed } from 'vue';
import { useVideoControlInteraction } from '@/composables/useVideoControlInteraction';
import type { VideoControlCell } from '@/services/map-data/videoControlMock';
import CameraDetailDialog from './CameraDetailDialog.vue';
import ControlPageDialog from './ControlPageDialog.vue';
import DeviceListDialog from './DeviceListDialog.vue';

const ia = useVideoControlInteraction();
const cell = computed(() => ia.current.value?.payload as VideoControlCell | undefined);
</script>

<template>
  <CameraDetailDialog v-if="ia.isOpen('cameraDetail') && cell" :cell="cell" @close="ia.close()" />
  <ControlPageDialog v-else-if="ia.isOpen('controlPage')" @close="ia.close()" />
  <DeviceListDialog v-else-if="ia.isOpen('deviceList')" @close="ia.close()" />
</template>
