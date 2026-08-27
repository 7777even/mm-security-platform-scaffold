<!--
  ProductionFacilityOverviewPanel — §生产应急「生产设施总览」
  2×3 网格：厂区 / 生产仓库 / 仓库 / 聚卡位防爆 / 储罐 / 装卸区
  每格图标 + 标签 + 大数字。
-->
<script setup lang="ts">
import type { Component } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';
import { Monitor, Camera, Connection, WarningFilled, Lock, Menu } from '@element-plus/icons-vue';

interface StatItem {
  key: string;
  label: string;
  value: number;
  icon: Component;
}

const items: StatItem[] = [
  { key: 'plant', label: '厂区', value: 596, icon: Monitor },
  { key: 'prod-wh', label: '生产仓库', value: 596, icon: Camera },
  { key: 'wh', label: '仓库', value: 596, icon: Connection },
  { key: 'anti-blast', label: '聚卡位防爆', value: 596, icon: WarningFilled },
  { key: 'tank', label: '储罐', value: 596, icon: Lock },
  { key: 'loading', label: '装卸区', value: 596, icon: Menu },
];
</script>

<template>
  <PanelCard title="生产设施总览" icon="OfficeBuilding">
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
