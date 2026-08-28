<!--
  EquipmentOverviewPanel — §生产应急「设备总览」
  4×2 网格：气口液面 / 监测员 / 温度设备 / 消防泵 / 缆线设备 / 广播 / 电话 / 排风设备
-->
<script setup lang="ts">
import type { Component } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';
import {
  Monitor,
  User,
  WarningFilled,
  Connection,
  Lock,
  BellFilled,
  Menu,
  Camera,
} from '@element-plus/icons-vue';

interface StatItem {
  key: string;
  label: string;
  value: number;
  icon: Component;
}

const items: StatItem[] = [
  { key: 'valve', label: '气口液面', value: 596, icon: Monitor },
  { key: 'monitor', label: '监测员', value: 596, icon: User },
  { key: 'temp', label: '温度设备', value: 596, icon: WarningFilled },
  { key: 'pump', label: '消防泵', value: 596, icon: Connection },
  { key: 'cable', label: '缆线设备', value: 596, icon: Lock },
  { key: 'broadcast', label: '广播', value: 596, icon: BellFilled },
  { key: 'phone', label: '电话', value: 596, icon: Menu },
  { key: 'vent', label: '排风设备', value: 596, icon: Camera },
];
</script>

<template>
  <PanelCard title="设备总览" icon="Tools">
    <div class="grid">
      <div v-for="it in items" :key="it.key" class="cell">
        <component :is="it.icon" class="cell__icon" />
        <div class="cell__meta">
          <div class="cell__label">{{ it.label }}</div>
          <div class="cell__value">{{ it.value }}</div>
        </div>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
}

.cell {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

.cell__icon {
  width: var(--icon-md);
  height: var(--icon-md);
  color: var(--color-accent);
  flex-shrink: 0;
}

.cell__meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cell__label {
  font-size: var(--font-size-date);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.cell__value {
  font-family: var(--font-number);
  font-size: var(--font-size-h2);
  font-weight: 700;
  color: var(--color-text-strong);
  line-height: 1.1;
}
</style>
