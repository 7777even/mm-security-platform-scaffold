<!--
  VideoWallInteractionLayer — 视频监控墙模块二级界面分发层
  悬挂于 src/views/video-wall/index.vue。按 useVideoWallInteraction 的 openKind 分发渲染对应二级界面，
  关闭即交还调度层（ia.close）卸载本层内容，不离开当前模块。
  自身不渲染任何 UI 框架，仅做分发。
    - cameraDetail    → VideoWallCameraDetailDialog（可再转交 linkageConfig）
    - eventVideoWall  → 复用 @/components/common/VideoWallDialog.vue，hint 取当前事件视频归集上下文
    - linkageConfig   → 既有 VideoLinkageConfigDialog（组件保留，显隐改由本层驱动）
-->
<script setup lang="ts">
import { computed } from 'vue';
import VideoWallDialog from '@/components/common/VideoWallDialog.vue';
import {
  useVideoWallInteraction,
  type VideoWallCameraTarget,
  type VideoWallEventTarget,
} from '@/composables/useVideoWallInteraction';
import { activeEventVideoContext } from './videoWallStore';
import VideoWallCameraDetailDialog from './VideoWallCameraDetailDialog.vue';
import VideoLinkageConfigDialog from './VideoLinkageConfigDialog.vue';

const ia = useVideoWallInteraction();
const payload = computed(() => ia.current.value?.payload);

const camera = computed(() => payload.value as VideoWallCameraTarget | undefined);

// 事件视频墙提示语：调用方未显式传 hint 时，按当前事件归集上下文推导。
const eventHint = computed(() => {
  const explicit = (payload.value as VideoWallEventTarget | undefined)?.hint;
  if (explicit) return explicit;
  const context = activeEventVideoContext.value;
  if (!context) return '未关联事件，当前展示全厂视频通道';
  const cameraCount = context.groups.reduce((total, group) => total + group.cameras.length, 0);
  const kindLabel = context.kind === 'weather' ? '极端天气' : '应急事件';
  return `${kindLabel}：${context.eventTitle} · ${context.groups.length} 个分组 · ${cameraCount} 路视频`;
});
</script>

<template>
  <VideoWallCameraDetailDialog
    v-if="ia.isOpen('cameraDetail')"
    :camera="camera"
    @close="ia.close()"
    @linkage="ia.openLinkageConfig()"
  />
  <VideoWallDialog
    v-else-if="ia.isOpen('eventVideoWall')"
    title="事件视频墙"
    :hint="eventHint"
    icon="flame"
    @close="ia.close()"
  />
  <VideoLinkageConfigDialog v-else-if="ia.isOpen('linkageConfig')" @close="ia.close()" />
</template>
