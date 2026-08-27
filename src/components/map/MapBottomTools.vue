<!--
  MapBottomTools — 地图底部一排快捷控制按钮（原型「安全防范」中央底部 8 个图标）
  单向控制 / 无人机控制 / 车辆控制 / 人员控制 / 设备巡检 / 防火警示 / 消防报警 / 5G联动
  通过 ModuleLayout 的 #bottom 插槽渲染（绝对定位底部居中）。
-->
<script setup lang="ts">
import type { Component } from 'vue';
import {
  Switch,
  Promotion,
  Van,
  User,
  Search,
  WarningFilled,
  BellFilled,
  Connection,
} from '@element-plus/icons-vue';

const tools = [
  { key: 'one-way', label: '单向控制', icon: 'Switch' },
  { key: 'drone', label: '无人机控制', icon: 'Promotion' },
  { key: 'vehicle', label: '车辆控制', icon: 'Van' },
  { key: 'person', label: '人员控制', icon: 'User' },
  { key: 'patrol', label: '设备巡检', icon: 'Search' },
  { key: 'fire-warn', label: '防火警示', icon: 'WarningFilled' },
  { key: 'fire-alarm', label: '消防报警', icon: 'BellFilled' },
  { key: '5g', label: '5G联动', icon: 'Connection' },
] as const;

const iconMap: Record<string, Component> = {
  Switch,
  Promotion,
  Van,
  User,
  Search,
  WarningFilled,
  BellFilled,
  Connection,
};

function onClick(key: string): void {
  // 占位：后续接入各控制子系统
  console.warn('[map-bottom-tool]', key);
}
</script>

<template>
  <div class="map-bottom-tools">
    <button
      v-for="t in tools"
      :key="t.key"
      class="map-bottom-tools__btn"
      type="button"
      @click="onClick(t.key)"
    >
      <component :is="iconMap[t.icon]" class="map-bottom-tools__icon" />
      <span class="map-bottom-tools__label">{{ t.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.map-bottom-tools {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgb(10 25 47 / 78%);
  border: 1px solid rgb(0 225 255 / 22%);
  border-radius: 999px;
  backdrop-filter: blur(8px);
  box-shadow: 0 6px 22px rgb(0 0 0 / 35%);
}

.map-bottom-tools__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  font-size: 12px;
  color: var(--color-text);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.map-bottom-tools__btn:hover {
  background: rgb(0 225 255 / 8%);
  border-color: rgb(0 225 255 / 40%);
  color: var(--color-accent);
}

.map-bottom-tools__icon {
  width: 18px;
  height: 18px;
}

.map-bottom-tools__label {
  white-space: nowrap;
  letter-spacing: 1px;
}
</style>
