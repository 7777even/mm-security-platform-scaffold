<!--
  ProductionAreaAlarmListDialog — 生产区域安全告警列表（二级界面 alarmList）
  使用通用 AlarmCard 逐条渲染（level 由告警 titleColor 映射至 AlarmLevel 1..4）。
  每条告警附「现场监控 ›」操作，触发 video 二级界面（复用 VideoWallDialog）。
  数据消费 resolveProductionAreaDetail(...).alarms。
-->
<script setup lang="ts">
import { computed } from 'vue';
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import AlarmCard from '@/components/common/AlarmCard.vue';
import { useProductionAreaInteraction } from '@/composables/useProductionAreaInteraction';
import { resolveProductionAreaDetail } from '@/services/map-data/productionAreaMock';
import type { ProductionAlarmItem } from '@/services/map-data/productionMock';
import type { AlarmLevel } from '@/services/alarm';

const props = defineProps<{ facilityId?: number | string }>();
const emit = defineEmits<{ close: [] }>();

const ia = useProductionAreaInteraction();
const alarms = computed<ProductionAlarmItem[]>(
  () => resolveProductionAreaDetail(props.facilityId).alarms,
);

// 告警配色（titleColor）→ AlarmLevel（与 ProductionAlarmCard 一致：danger=1 orange=2 warning=3 purple=4）
const levelMap: Record<ProductionAlarmItem['titleColor'], AlarmLevel> = {
  danger: 1,
  orange: 2,
  warning: 3,
  purple: 4,
};

function descOf(a: ProductionAlarmItem): string {
  return `${a.location} · ${a.description}`;
}

function openMonitor(a: ProductionAlarmItem): void {
  ia.openVideo(`生产区域 · ${a.title}`);
}
</script>

<template>
  <ScreenDialog :open="true" title="生产区域安全告警" icon="gas" @close="emit('close')">
    <div class="alarm-list">
      <div v-for="a in alarms" :key="a.id" class="alarm-row">
        <AlarmCard
          :level="levelMap[a.titleColor]"
          :title="a.title"
          :time="a.time"
          :desc="descOf(a)"
        />
        <button type="button" class="alarm-row__action" @click.stop="openMonitor(a)">
          现场监控 ›
        </button>
      </div>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.alarm-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  overflow: auto;
}

.alarm-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 4px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

.alarm-row__action {
  align-self: center;
  padding: 0 14px;
  border: none;
  background: transparent;
  color: var(--color-accent);
  font-size: var(--font-size-helper);
  font-family: var(--font-body);
  white-space: nowrap;
  cursor: pointer;
}

.alarm-row__action:hover {
  text-decoration: underline;
}
</style>
