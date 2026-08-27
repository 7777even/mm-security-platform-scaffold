<!--
  AlarmStatsBar — §生产应急「告警统计条」全宽底部横条
  5 项指标横向：报警总数 / 未处置 / 已处置 / 处置中 / 平均处置时长
  每项：图标 + 标签 + 大数字 + 今日对比（%）。
  配合 ModuleLayout 的 #bottom 插槽使用；:deep 覆盖居中为全宽贴底。
-->
<script setup lang="ts">
import type { Component } from 'vue';
import { BellFilled, WarningFilled, Connection, Menu } from '@element-plus/icons-vue';

interface Stat {
  key: string;
  label: string;
  value: string;
  delta: string;
  deltaTone: 'up' | 'down';
  icon: Component;
}

const stats: Stat[] = [
  {
    key: 'total',
    label: '报警总数',
    value: '36',
    delta: '今日新增 3.3%',
    deltaTone: 'up',
    icon: BellFilled,
  },
  {
    key: 'unhandled',
    label: '未处置告警',
    value: '12',
    delta: '今日 7.4%',
    deltaTone: 'up',
    icon: WarningFilled,
  },
  {
    key: 'handled',
    label: '已处置告警',
    value: '24',
    delta: '今日 5.5%',
    deltaTone: 'down',
    icon: Connection,
  },
  {
    key: 'processing',
    label: '处置中告警',
    value: '6',
    delta: '今日 7.3%',
    deltaTone: 'up',
    icon: WarningFilled,
  },
  {
    key: 'avg-time',
    label: '平均处置时长',
    value: '18分32秒',
    delta: '今日 2.28%',
    deltaTone: 'down',
    icon: Menu,
  },
];
</script>

<template>
  <div class="bar">
    <div v-for="s in stats" :key="s.key" class="stat">
      <component :is="s.icon" class="stat__icon" />
      <div class="stat__main">
        <span class="stat__label">{{ s.label }}</span>
        <div class="stat__value">{{ s.value }}</div>
        <span class="stat__delta" :class="`stat__delta--${s.deltaTone}`">{{ s.delta }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bar {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  padding: 12px 18px;
  border-radius: 12px;
  background: rgb(10 25 47 / 78%);
  border: 1px solid rgb(0 225 255 / 22%);
  backdrop-filter: blur(8px);
  box-shadow: 0 6px 22px rgb(0 0 0 / 35%);
}

.stat {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat__icon {
  width: 22px;
  height: 22px;
  color: var(--color-accent);
  flex-shrink: 0;
}

.stat__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.stat__label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.stat__delta {
  font-family: var(--font-number);
  font-size: 11px;
}

.stat__delta--up {
  color: #ff6b6b;
}

.stat__delta--down {
  color: #2ee6a8;
}

.stat__value {
  font-family: var(--font-number);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-strong);
  line-height: 1.1;
}
</style>
