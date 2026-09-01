<!--
  OpsMonitorInteractionLayer — 生产应急模块二级界面分发层
  挂载于 src/views/ops-monitor/index.vue，按 useOpsMonitorInteraction 的 openKind 分发渲染，
  关闭即交还调度层（ia.close）卸载本层内容，不离开当前模块。
-->
<script setup lang="ts">
import { computed } from 'vue';
import { useOpsMonitorInteraction } from '@/composables/useOpsMonitorInteraction';
import type { OpsMonitorContact } from '@/composables/useOpsMonitorInteraction';
import MajorRiskDetailDialog from './MajorRiskDetailDialog.vue';
import ProductionAlarmListDialog from './ProductionAlarmListDialog.vue';
import VideoWallDialog from '@/components/common/VideoWallDialog.vue';
import OneKeyDispatchDialog from '@/components/common/OneKeyDispatchDialog.vue';
import type { DispatchTarget } from '@/components/common/dispatchTypes';
import { fireBrigadeTeams } from '@/services/map-data/fireBrigadeMock';

const ia = useOpsMonitorInteraction();
const payload = computed(() => ia.current.value?.payload);
const videoHint = computed(() => {
  const p = payload.value as { hint?: string } | undefined;
  return p?.hint ?? '';
});

const dispatchTargets: DispatchTarget[] = fireBrigadeTeams.map((t) => ({
  id: t.id,
  name: t.name,
  meta: `${t.area} · ${t.leaderName}`,
}));
</script>

<template>
  <MajorRiskDetailDialog v-if="ia.isOpen('majorRisk')" @close="ia.close()" />
  <ProductionAlarmListDialog v-else-if="ia.isOpen('prodAlarmList')" @close="ia.close()" />
  <VideoWallDialog
    v-else-if="ia.isOpen('video')"
    title="现场监控"
    :hint="videoHint"
    @close="ia.close()"
  />
  <OneKeyDispatchDialog
    v-else-if="ia.isOpen('broadcast')"
    kind="broadcast"
    title="一键应急广播"
    :targets="dispatchTargets"
    :contact="payload as OpsMonitorContact"
    @close="ia.close()"
  />
  <OneKeyDispatchDialog
    v-else-if="ia.isOpen('control')"
    kind="control"
    title="一键控制"
    :targets="dispatchTargets"
    :contact="payload as OpsMonitorContact"
    @close="ia.close()"
  />
</template>
