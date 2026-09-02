<!--
  ProductionAreaInteractionLayer — 生产区域模块二级界面分发层
  悬挂于 src/views/production-area/index.vue。按 useProductionAreaInteraction 的 openKind 分发渲染对应二级界面，
  关闭即交还调度层（ia.close）卸载本层内容，不离开当前模块。
  自身不渲染任何 UI 框架，仅做分发。
-->
<script setup lang="ts">
import { computed } from 'vue';
import { useProductionAreaInteraction } from '@/composables/useProductionAreaInteraction';
import type { ProductionPersonnelPayload } from '@/composables/useProductionAreaInteraction';
import ProductionAreaFacilityDetailDialog from './ProductionAreaFacilityDetailDialog.vue';
import ProductionAreaPersonnelDialog from './ProductionAreaPersonnelDialog.vue';
import ProductionAreaAlarmListDialog from './ProductionAreaAlarmListDialog.vue';
import VideoWallDialog from '@/components/common/VideoWallDialog.vue';

const ia = useProductionAreaInteraction();
const payload = computed(() => ia.current.value?.payload);
// facility-id 通道值：以 computed 收窄类型（模板内 as 联合类型会误触 no-deprecated-filter）
const facilityPayloadId = computed(() => payload.value as number | string);
</script>

<template>
  <ProductionAreaFacilityDetailDialog
    v-if="ia.isOpen('facilityDetail')"
    :facility-id="facilityPayloadId"
    @close="ia.close()"
  />
  <ProductionAreaPersonnelDialog
    v-else-if="ia.isOpen('personnel')"
    :payload="payload as ProductionPersonnelPayload"
    @close="ia.close()"
  />
  <ProductionAreaAlarmListDialog
    v-else-if="ia.isOpen('alarmList')"
    :facility-id="facilityPayloadId"
    @close="ia.close()"
  />
  <VideoWallDialog
    v-else-if="ia.isOpen('video')"
    title="生产区域视频监控"
    icon="gas"
    hint="生产区域现场监控画面（前端占位，无真实码流）"
    @close="ia.close()"
  />
</template>
