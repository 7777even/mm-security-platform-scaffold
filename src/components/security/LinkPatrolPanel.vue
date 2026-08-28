<!--
  LinkPatrolPanel — §安全防恐「联动巡查」
  6 格联动按钮 + 5G 联动展示 + 声光报警开关（仿原型）。
-->
<script setup lang="ts">
import { ref } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';
import type { Component } from 'vue';
import { Monitor, Camera, Warning, Lock, Promotion, Position } from '@element-plus/icons-vue';

interface GridItem {
  key: string;
  label: string;
  icon: Component;
}

const grid: GridItem[] = [
  { key: 'center-monitor', label: '中心监控室', icon: Monitor },
  { key: 'monitor-check', label: '监控勘验', icon: Camera },
  { key: 'perimeter', label: '周界防恐', icon: Warning },
  { key: 'anti-riot', label: '反恐防暴', icon: Lock },
  { key: 'drone-patrol', label: '无人机巡查', icon: Promotion },
  { key: 'outer-defense', label: '外围防暴', icon: Position },
];

const soundLightOn = ref(true);

function onGridClick(key: string): void {
  // 锁定巡查子模块入口（占位）
  console.warn('[patrol]', key);
}

function toggleSoundLight(): void {
  soundLightOn.value = !soundLightOn.value;
}
</script>

<template>
  <PanelCard title="联动巡查" icon="Aim" more="更多">
    <div class="grid">
      <button
        v-for="g in grid"
        :key="g.key"
        type="button"
        class="grid__btn"
        @click="onGridClick(g.key)"
      >
        <component :is="g.icon" class="grid__icon" />
        <span class="grid__label">{{ g.label }}</span>
      </button>
    </div>

    <div class="section-title">5G 联动展示</div>

    <div class="bottom-row">
      <div class="bottom-row__item">
        <span class="bottom-row__label">声光报警</span>
        <button
          type="button"
          :class="['bottom-row__toggle', { 'is-on': soundLightOn }]"
          @click="toggleSoundLight"
        >
          {{ soundLightOn ? '已启' : '已停' }}
        </button>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

.grid__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-xs);
  font-size: var(--font-size-helper);
  color: var(--color-text);
  background: var(--color-panel-soft);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.grid__btn:hover {
  background: var(--color-accent-faint);
  border-color: var(--color-accent-glow);
  color: var(--color-accent);
}

.grid__icon {
  width: var(--icon-lg);
  height: var(--icon-lg);
}

.section-title {
  margin: var(--space-md) 0 var(--space-sm);
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
  letter-spacing: 1px;
}

.bottom-row {
  display: flex;
  gap: var(--space-sm);
}

.bottom-row__item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  background: var(--color-panel-soft);
  border: 1px solid var(--panel-border);
}

.bottom-row__label {
  font-size: var(--font-size-stat-label);
  color: var(--color-text);
}

.bottom-row__toggle {
  font-size: var(--font-size-helper);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-danger) 12%, transparent);
  color: var(--color-danger);
  border: 1px solid color-mix(in srgb, var(--color-danger) 40%, transparent);
  cursor: pointer;
}

.bottom-row__toggle.is-on {
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  color: var(--color-success);
  border-color: color-mix(in srgb, var(--color-success) 40%, transparent);
}
</style>
