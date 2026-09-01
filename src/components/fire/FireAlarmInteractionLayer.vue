<!--
  FireAlarmInteractionLayer — 消防报警模块二级界面分发层
  悬挂于 src/views/fire-alarm/index.vue。按 useFireAlarmInteraction 的 openKind 分发渲染对应二级界面，
  关闭即交还调度层（ia.close）卸载本层内容，不离开当前模块。
  自身不渲染任何 UI 框架，仅做分发。
-->
<script setup lang="ts">
import { computed } from 'vue';
import { useFireAlarmInteraction } from '@/composables/useFireAlarmInteraction';
import type { FireAlarmListItem } from '@/services/map-data/fireAlarmListMock';
import FireAlarmDetailPanel from './FireAlarmDetailPanel.vue';
import FireAlarmListDialog from './FireAlarmListDialog.vue';
import FireFacilityMonitoringDialog from './FireFacilityMonitoringDialog.vue';
import FirePatrolDialog from './FirePatrolDialog.vue';
import FireVideoDialog from './FireVideoDialog.vue';
import FireStrengthDialog from './FireStrengthDialog.vue';
import SpecialWorkDialog from './SpecialWorkDialog.vue';
import OneKeyBroadcastDialog from './OneKeyBroadcastDialog.vue';

const ia = useFireAlarmInteraction();
const payload = computed(() => ia.current.value?.payload);
const contact = computed(() => payload.value as { name: string; phone: string } | undefined);
</script>

<template>
  <FireAlarmDetailPanel
    v-if="ia.isOpen('alarmDetail')"
    :item="payload as FireAlarmListItem"
    @close="ia.close()"
  />
  <FireAlarmListDialog v-else-if="ia.isOpen('alarmList')" @close="ia.close()" />
  <FireFacilityMonitoringDialog v-else-if="ia.isOpen('facility')" @close="ia.close()" />
  <FirePatrolDialog v-else-if="ia.isOpen('patrol')" @close="ia.close()" />
  <FireVideoDialog
    v-else-if="ia.isOpen('video')"
    :alarm="payload as FireAlarmListItem"
    @close="ia.close()"
  />
  <FireStrengthDialog v-else-if="ia.isOpen('strength')" @close="ia.close()" />
  <SpecialWorkDialog v-else-if="ia.isOpen('specialWork')" @close="ia.close()" />
  <OneKeyBroadcastDialog
    v-else-if="ia.isOpen('oneKeyBroadcast')"
    :contact="contact"
    @close="ia.close()"
  />
</template>
