<!--
  MajorHazardInteractionLayer — 重大危险源模块二级界面分发层
  悬挂于 src/views/major-hazard/list.vue 与 detail.vue。按 useMajorHazardInteraction 的 openKind 分发渲染对应二级界面，
  关闭即交还调度层（ia.close）卸载本层内容，不离开当前模块。自身不渲染任何 UI 框架，仅做分发。
  视频复用通用 VideoWallDialog；其余基于 ScreenDialog。
-->
<script setup lang="ts">
import { computed } from 'vue';
import { useMajorHazardInteraction } from '@/composables/useMajorHazardInteraction';
import type { MajorHazardItem } from '@/services/map-data/majorHazardMock';
import MajorHazardDetailDialog from './MajorHazardDetailDialog.vue';
import MajorHazardSectionDialog from './MajorHazardSectionDialog.vue';
import VideoWallDialog from '@/components/common/VideoWallDialog.vue';

const ia = useMajorHazardInteraction();
const payload = computed(() => ia.current.value?.payload as MajorHazardItem | undefined);
</script>

<template>
  <MajorHazardDetailDialog
    v-if="ia.isOpen('hazardDetail')"
    :item="payload as MajorHazardItem"
    @close="ia.close()"
  />
  <MajorHazardSectionDialog
    v-else-if="ia.isOpen('monitoring')"
    kind="monitoring"
    :item="payload"
    @close="ia.close()"
  />
  <VideoWallDialog
    v-else-if="ia.isOpen('video')"
    title="视频监控"
    icon="flame"
    :hint="payload ? `${payload.name} · 视频监控` : ''"
    @close="ia.close()"
  />
  <MajorHazardSectionDialog
    v-else-if="ia.isOpen('chemicals')"
    kind="chemicals"
    :item="payload"
    @close="ia.close()"
  />
  <MajorHazardSectionDialog
    v-else-if="ia.isOpen('evacuation')"
    kind="evacuation"
    :item="payload"
    @close="ia.close()"
  />
  <MajorHazardSectionDialog
    v-else-if="ia.isOpen('emergencyOp')"
    kind="emergencyOp"
    :item="payload"
    @close="ia.close()"
  />
</template>
