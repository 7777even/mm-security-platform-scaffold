<!--
  ProductionAlarmPanel — §生产应急「生产区域安全告警」
  4 条告警卡：左侧图标 + 标题 + 时间 + 区域 + 右侧告警级别 + 处理链接。
-->
<script setup lang="ts">
import type { Component } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';
import { User, WarningFilled } from '@element-plus/icons-vue';

type Level = '一般' | '严重' | '重要';
type Tone = 'person' | 'warning';

interface Alarm {
  id: string;
  icon: Component;
  tone: Tone;
  title: string;
  unhandled: boolean;
  time: string;
  location: string;
  level: Level;
}

const alarms: Alarm[] = [
  {
    id: '1',
    icon: User,
    tone: 'person',
    title: '人员跌落',
    unhandled: true,
    time: '2026-03-17 14:21:30',
    location: 'A 楼厂区',
    level: '严重',
  },
  {
    id: '2',
    icon: User,
    tone: 'person',
    title: '人员区域闯入',
    unhandled: false,
    time: '2026-03-17 14:21:30',
    location: 'A 楼厂区',
    level: '一般',
  },
  {
    id: '3',
    icon: User,
    tone: 'person',
    title: '人员聚集',
    unhandled: true,
    time: '2026-03-17 14:21:30',
    location: 'A 楼厂区',
    level: '一般',
  },
  {
    id: '4',
    icon: WarningFilled,
    tone: 'warning',
    title: '有毒气体超标',
    unhandled: false,
    time: '2026-03-17 14:21:30',
    location: 'A 楼厂区',
    level: '重要',
  },
];

const LEVEL_TONE: Record<Level, string> = {
  一般: 'level--mid',
  严重: 'level--high',
  重要: 'level--crit',
};

function onItem(a: Alarm): void {
  console.warn('[prod-alarm]', a.id);
}

function onHandle(a: Alarm, e: Event): void {
  e.stopPropagation();
  console.warn('[prod-alarm] handle', a.id);
}
</script>

<template>
  <PanelCard title="生产区域安全告警" icon="Warning" more="查看全部">
    <ul class="list">
      <li v-for="a in alarms" :key="a.id" class="alarm" @click="onItem(a)">
        <div :class="['alarm__icon', `alarm__icon--${a.tone}`]">
          <component :is="a.icon" />
        </div>
        <div class="alarm__main">
          <div class="alarm__head">
            <span class="alarm__title">{{ a.title }}</span>
            <span v-if="a.unhandled" class="alarm__badge">未处置</span>
          </div>
          <div class="alarm__time">{{ a.time }}</div>
          <div class="alarm__loc">{{ a.location }}区域异常入员。</div>
        </div>
        <div class="alarm__side">
          <span :class="['alarm__level', LEVEL_TONE[a.level]]">{{ a.level }}</span>
          <button type="button" class="alarm__handle" @click="onHandle(a, $event)">一般划付</button>
        </div>
      </li>
    </ul>
  </PanelCard>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alarm {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: var(--radius-sm);
  background: rgb(255 255 255 / 3%);
  border: 1px solid var(--panel-border, rgb(0 216 255 / 15%));
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
}

.alarm:hover {
  background: rgb(0 225 255 / 6%);
  border-color: rgb(0 225 255 / 40%);
}

.alarm__icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.alarm__icon :deep(svg) {
  width: 22px;
  height: 22px;
}

.alarm__icon--person {
  background: rgb(255 193 7 / 18%);
  color: #ffc107;
  border: 1px solid rgb(255 193 7 / 45%);
}

.alarm__icon--warning {
  background: rgb(255 107 107 / 18%);
  color: #ff6b6b;
  border: 1px solid rgb(255 107 107 / 45%);
}

.alarm__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.alarm__head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.alarm__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-strong);
}

.alarm__badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 8px;
  color: #ff6b6b;
  background: rgb(255 107 107 / 18%);
  border: 1px solid rgb(255 107 107 / 45%);
}

.alarm__time {
  font-family: var(--font-number);
  font-size: 11px;
  color: var(--color-text-muted);
}

.alarm__loc {
  font-size: 11px;
  color: var(--color-text-muted);
}

.alarm__side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.alarm__level {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 8px;
}

.level--mid {
  color: #ffc107;
  background: rgb(255 193 7 / 16%);
  border: 1px solid rgb(255 193 7 / 45%);
}

.level--high {
  color: #ff8a4c;
  background: rgb(255 138 76 / 16%);
  border: 1px solid rgb(255 138 76 / 45%);
}

.level--crit {
  color: #ff6b6b;
  background: rgb(255 107 107 / 16%);
  border: 1px solid rgb(255 107 107 / 45%);
}

.alarm__handle {
  font-size: 11px;
  background: transparent;
  border: none;
  color: var(--color-accent);
  cursor: pointer;
  padding: 0;
}

.alarm__handle:hover {
  text-decoration: underline;
}
</style>
