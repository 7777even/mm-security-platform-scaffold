<!--
  FireAlarmPanel — §消防救援「消防告警」
  复用 AlarmListItem（3px 等级色边 + 类型图标 + 快捷操作），消防主题 mock 数据。
-->
<script setup lang="ts">
import { ref } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';
import AlarmListItem from '@/components/common/AlarmListItem.vue';
import type { AlarmItem } from '@/services/alarm';
import { makeAlarm } from '@/mocks/fixtures';

const alarms = ref<AlarmItem[]>(
  Array.from({ length: 8 }, (_, i) => {
    const a = makeAlarm(i + 20);
    return {
      ...a,
      type: i % 3 === 0 ? 'FIRE' : a.type,
      description: '消防报警：烟感/温感越限触发',
    };
  }),
);

function onView(a: AlarmItem): void {
  console.warn('[fire-alarm] view', a.alarmId);
}
function onCall(a: AlarmItem): void {
  console.warn('[fire-alarm] call', a.alarmId);
}
function onDispatch(a: AlarmItem): void {
  console.warn('[fire-alarm] dispatch', a.alarmId);
}
function onOpen(a: AlarmItem): void {
  console.warn('[fire-alarm] open', a.alarmId);
}
</script>

<template>
  <PanelCard title="消防告警" icon="Bell" more="全部">
    <div class="alarm-list">
      <AlarmListItem
        v-for="a in alarms"
        :key="a.alarmId"
        :alarm="a"
        @view="onView"
        @call="onCall"
        @dispatch="onDispatch"
        @open="onOpen"
      />
    </div>
  </PanelCard>
</template>

<style scoped>
.alarm-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
</style>
