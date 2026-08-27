<!--
  ProductionAlarmPanel — §生产应急「生产区域安全告警」
  4 条告警事件卡：三列布局 = [左侧彩色类型图标+主信息] | [告警图片] | [三个操作链接]
-->
<script setup lang="ts">
import type { Component } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';
import { User, WarningFilled } from '@element-plus/icons-vue';

interface Alarm {
  id: string;
  icon: Component;
  toneColor: string;
  title: string;
  unhandled: boolean;
  location: string;
  time: string;
  desc: string;
}

const alarms: Alarm[] = [
  {
    id: '1',
    icon: User,
    toneColor: '#ffc24b',
    title: '人员跌倒',
    unhandled: true,
    location: '炼化厂区内院',
    time: '2026年3月17日 14:21:30',
    desc: 'A装置区域发现人员跌倒。',
  },
  {
    id: '2',
    icon: User,
    toneColor: '#ffc24b',
    title: '人员违规进入',
    unhandled: true,
    location: '炼化厂区内院',
    time: '2026年3月17日 14:21:30',
    desc: 'A装置区域发现专注班人员，请核实。',
  },
  {
    id: '3',
    icon: User,
    toneColor: '#ff8a4c',
    title: '人员聚集',
    unhandled: true,
    location: '炼化厂区内院',
    time: '2026年3月17日 14:21:30',
    desc: 'A装置区域聚集30人，超过20人，超出50%。',
  },
  {
    id: '4',
    icon: WarningFilled,
    toneColor: '#a78bfa',
    title: '有毒气体超标',
    unhandled: true,
    location: '炼化厂区内院',
    time: '2026年3月17日 14:21:30',
    desc: '炼化厂区内院。',
  },
];

function onAction(a: Alarm, action: string): void {
  console.warn('[prod-alarm]', a.id, action);
}
</script>

<template>
  <PanelCard title="生产区域安全告警" icon="Warning" more="查看全部">
    <ul class="list">
      <li v-for="a in alarms" :key="a.id" class="alarm">
        <div class="alarm__left">
          <div
            class="alarm__icon"
            :style="{
              background: a.toneColor + '22',
              color: a.toneColor,
              borderColor: a.toneColor + '70',
            }"
          >
            <component :is="a.icon" />
          </div>
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
        <div class="alarm__img">
          <span>告警图片</span>
        </div>
        <div class="alarm__actions">
          <button type="button" class="alarm__action" @click="onAction(a, 'monitor')">
            现场监控<span class="alarm__arrow">›</span>
          </button>
          <button type="button" class="alarm__action" @click="onAction(a, 'broadcast')">
            一键广播<span class="alarm__arrow">›</span>
          </button>
          <button type="button" class="alarm__action" @click="onAction(a, 'control')">
            一键控制<span class="alarm__arrow">›</span>
          </button>
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
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding: 10px;
  border-radius: var(--radius-sm);
  background: rgb(255 255 255 / 3%);
  border: 1px solid var(--panel-border, rgb(0 216 255 / 15%));
}

.alarm__left {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  min-width: 0;
}

.alarm__icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid;
  flex-shrink: 0;
}

.alarm__icon :deep(svg) {
  width: 24px;
  height: 24px;
}

.alarm__main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
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
  white-space: nowrap;
}

.alarm__loc {
  font-size: 12px;
  color: var(--color-text);
}

.alarm__time {
  font-family: var(--font-number);
  font-size: 11px;
  color: var(--color-text-muted);
}

.alarm__desc {
  font-size: 11px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.alarm__img {
  width: 80px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgb(0 216 255 / 35%);
  border-radius: 4px;
  background: rgb(0 0 0 / 25%);
  color: var(--color-text-muted);
  font-size: 11px;
  flex-shrink: 0;
}

.alarm__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  flex-shrink: 0;
}

.alarm__action {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
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
  font-size: 12px;
  line-height: 1;
}
</style>
