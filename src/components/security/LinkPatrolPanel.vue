<!--
  LinkPatrolPanel — §安全防范「联动巡查」
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
  gap: 8px;
}

.grid__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 4px;
  font-size: 12px;
  color: var(--color-text);
  background: rgb(255 255 255 / 3%);
  border: 1px solid var(--panel-border, rgb(0 216 255 / 18%));
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.grid__btn:hover {
  background: rgb(0 225 255 / 8%);
  border-color: rgb(0 225 255 / 50%);
  color: var(--color-accent);
}

.grid__icon {
  width: 22px;
  height: 22px;
}

.section-title {
  margin: 12px 0 6px;
  font-size: 12px;
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
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: rgb(255 255 255 / 3%);
  border: 1px solid var(--panel-border, rgb(0 216 255 / 18%));
}

.bottom-row__label {
  font-size: 13px;
  color: var(--color-text);
}

.bottom-row__toggle {
  font-size: 12px;
  padding: 3px 12px;
  border-radius: 999px;
  background: rgb(255 107 107 / 12%);
  color: #ff6b6b;
  border: 1px solid rgb(255 107 107 / 40%);
  cursor: pointer;
}

.bottom-row__toggle.is-on {
  background: rgb(46 230 168 / 12%);
  color: #2ee6a8;
  border-color: rgb(46 230 168 / 40%);
}
</style>
