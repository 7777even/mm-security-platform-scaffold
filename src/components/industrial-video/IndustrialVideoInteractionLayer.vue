<!--
  IndustrialVideoInteractionLayer — 工业电视模块二级界面分发层
  挂载于 src/views/industrial-video/index.vue，按 useIndustrialVideoInteraction 的 openKind 分发渲染，
  关闭即交还调度层（ia.close）卸载本层内容，不离开当前模块。
-->
<script setup lang="ts">
import { computed } from 'vue';
import { useIndustrialVideoInteraction } from '@/composables/useIndustrialVideoInteraction';
import type {
  VideoCategoryPayload,
  VideoMonitorPayload,
} from '@/composables/useIndustrialVideoInteraction';
import VideoWallDialog from '@/components/common/VideoWallDialog.vue';
import VideoMonitorDetailDialog from './VideoMonitorDetailDialog.vue';
import VideoLibraryDialog from './VideoLibraryDialog.vue';
import NoticeListDialog from './NoticeListDialog.vue';

const ia = useIndustrialVideoInteraction();
const payload = computed(() => ia.current.value?.payload);
</script>

<template>
  <VideoWallDialog
    v-if="ia.isOpen('videoCategory')"
    :title="`视频监控 · ${(payload as VideoCategoryPayload | undefined)?.label ?? ''}`"
    :hint="`当前分类：${(payload as VideoCategoryPayload | undefined)?.label ?? ''}`"
    @close="ia.close()"
  />
  <VideoMonitorDetailDialog
    v-else-if="ia.isOpen('videoMonitor')"
    :payload="payload as VideoMonitorPayload"
    @close="ia.close()"
  />
  <VideoLibraryDialog v-else-if="ia.isOpen('videoLibrary')" @close="ia.close()" />
  <NoticeListDialog v-else-if="ia.isOpen('noticeList')" @close="ia.close()" />
</template>
