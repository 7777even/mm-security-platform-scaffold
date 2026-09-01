<!--
  ProductionAlarmListDialog — 生产区域安全告警列表（生产应急 prodAlarmList）
  列出 4 条告警，每条含状态徽标 + 三个操作（现场监控 / 一键广播 / 一键控制）。
  操作复用共享 VideoWallDialog / OneKeyDispatchDialog（经调度层切换）。
  图标：压缩包 fire-situation 图标（PkgIcon，helmet=人员，gas=气体）。
-->
<script setup lang="ts">
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import { useOpsMonitorInteraction } from '@/composables/useOpsMonitorInteraction';

interface Alarm {
  id: string;
  icon: string;
  title: string;
  unhandled: boolean;
  location: string;
  time: string;
  desc: string;
}

const alarms: Alarm[] = [
  {
    id: '1',
    icon: 'helmet',
    title: '人员跌倒',
    unhandled: true,
    location: '炼化厂区内院',
    time: '2026年3月17日 14:21:30',
    desc: 'A装置区域发现人员跌倒。',
  },
  {
    id: '2',
    icon: 'helmet',
    title: '人员违规进入',
    unhandled: true,
    location: '炼化厂区内院',
    time: '2026年3月17日 14:21:30',
    desc: 'A装置区域发现专注班人员，请核实。',
  },
  {
    id: '3',
    icon: 'helmet',
    title: '人员聚集',
    unhandled: true,
    location: '炼化厂区内院',
    time: '2026年3月17日 14:21:30',
    desc: 'A装置区域聚集30人，超过20人，超出50%。',
  },
  {
    id: '4',
    icon: 'gas',
    title: '有毒气体超标',
    unhandled: true,
    location: '炼化厂区内院',
    time: '2026年3月17日 14:21:30',
    desc: '炼化厂区内院。',
  },
];

const emit = defineEmits<{ close: [] }>();
const ia = useOpsMonitorInteraction();

function monitor(a: Alarm): void {
  ia.openVideo(`关联告警：${a.title} · ${a.location}`);
}
function broadcast(): void {
  ia.openBroadcast();
}
function control(): void {
  ia.openControl();
}
</script>

<template>
  <ScreenDialog :open="true" title="生产区域安全告警" icon="gas" @close="emit('close')">
    <ul class="list">
      <li v-for="a in alarms" :key="a.id" class="alarm">
        <div class="alarm__left">
          <PkgIcon :name="a.icon" size="26px" class="alarm__icon" />
          <div class="alarm__main">
            <div class="alarm__head">
              <span class="alarm__title">{{ a.title }}</span>
              <span v-if="a.unhandled" class="alarm__badge">未处置</span>
            </div>
            <div class="alarm__loc">{{ a.location }}</div>
            <div class="alarm__time">{{ a.time }}</div>
            <div class="alarm__desc">{{ a.desc }}</div>
          </div>
        </div>
        <div class="alarm__actions">
          <button type="button" class="alarm__action" @click="monitor(a)">
            现场监控<span class="alarm__arrow">›</span>
          </button>
          <button type="button" class="alarm__action" @click="broadcast()">
            一键广播<span class="alarm__arrow">›</span>
          </button>
          <button type="button" class="alarm__action" @click="control()">
            一键控制<span class="alarm__arrow">›</span>
          </button>
        </div>
      </li>
    </ul>
  </ScreenDialog>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.alarm {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-md);
  align-items: center;
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  background: var(--color-panel-soft);
  border: 1px solid var(--panel-border);
}

.alarm__left {
  display: flex;
  gap: var(--space-sm);
  align-items: flex-start;
  min-width: 0;
}

.alarm__icon {
  color: var(--color-accent);
  flex-shrink: 0;
}

.alarm__main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.alarm__head {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.alarm__title {
  font-size: var(--font-size-stat-label);
  font-weight: 600;
  color: var(--color-text-strong);
}

.alarm__badge {
  font-size: var(--font-size-date);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-pill);
  color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-danger) 45%, transparent);
  white-space: nowrap;
}

.alarm__loc {
  font-size: var(--font-size-helper);
  color: var(--color-text);
}

.alarm__time {
  font-family: var(--font-number);
  font-size: var(--font-size-date);
  color: var(--color-text-muted);
}

.alarm__desc {
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
  line-height: 1.5;
}

.alarm__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-xs);
  flex-shrink: 0;
}

.alarm__action {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-date);
  color: var(--color-accent);
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  white-space: nowrap;
}

.alarm__action:hover {
  text-decoration: underline;
}

.alarm__arrow {
  font-size: var(--font-size-helper);
  line-height: 1;
}
</style>
