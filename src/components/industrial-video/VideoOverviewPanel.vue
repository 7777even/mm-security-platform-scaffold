<!--
  VideoOverviewPanel — §工业电视「视频监控概览」
  6 格统计卡（3列×2行）：重点数 / 生产设施 / 厂界 / 封闭入口 / 其他入口 / 其它
  每格图标 + 标签 + 大数字。
-->
<script setup lang="ts">
import PanelCard from '@/components/common/PanelCard.vue';
import type { Component } from 'vue';
import { Monitor, Camera, Connection, Lock, Unlock, Menu } from '@element-plus/icons-vue';

interface StatItem {
  key: string;
  label: string;
  value: number;
  icon: Component;
}

const items: StatItem[] = [
  { key: 'key', label: '重点数', value: 665, icon: Monitor },
  { key: 'prod', label: '生产设施', value: 56, icon: Camera },
  { key: 'perimeter', label: '厂界', value: 56, icon: Connection },
  { key: 'closed', label: '封闭入口', value: 55, icon: Lock },
  { key: 'other-in', label: '其他入口', value: 66, icon: Unlock },
  { key: 'misc', label: '其它', value: 6, icon: Menu },
];

function onItem(key: string): void {
  // 跳转监控子分类（占位）
  console.warn('[video-overview]', key);
}
</script>

<template>
  <PanelCard title="视频监控概览" icon="Monitor">
    <div class="grid">
      <button v-for="it in items" :key="it.key" type="button" class="cell" @click="onItem(it.key)">
        <component :is="it.icon" class="cell__icon" />
        <div class="cell__meta">
          <div class="cell__label">{{ it.label }}</div>
          <div class="cell__value">{{ it.value }}</div>
        </div>
      </button>
    </div>
  </PanelCard>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.cell {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-radius: var(--radius-sm);
  background: rgb(255 255 255 / 3%);
  border: 1px solid var(--panel-border, rgb(0 216 255 / 15%));
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
}

.cell:hover {
  background: rgb(0 225 255 / 8%);
  border-color: rgb(0 225 255 / 50%);
}

.cell__icon {
  width: 22px;
  height: 22px;
  color: var(--color-accent);
  flex-shrink: 0;
}

.cell__meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cell__label {
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.cell__value {
  font-family: var(--font-number);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-strong);
  line-height: 1.1;
}
</style>
