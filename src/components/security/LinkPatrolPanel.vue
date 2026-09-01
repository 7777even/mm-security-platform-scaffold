<!--
  LinkPatrolPanel — §安全防恐「联动巡查」
  6 格联动按钮 + 5G 联动展示 + 声光报警开关。
  点击联动按钮进入对应详情；「更多」打开联动巡查清单；声光报警为本地开关（保留真实交互）。
  图标：压缩包 fire-situation 图标（PkgIcon，helmet=人员/防暴，confined-space=周界，ladder=设备）。
-->
<script setup lang="ts">
import { ref } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import { useSecurityInteraction } from '@/composables/useSecurityInteraction';

interface GridItem {
  key: string;
  label: string;
  icon: string;
}

const ia = useSecurityInteraction();

const grid: GridItem[] = [
  { key: 'center-monitor', label: '中心监控室', icon: 'helmet' },
  { key: 'monitor-check', label: '监控勘验', icon: 'helmet' },
  { key: 'perimeter', label: '周界防恐', icon: 'confined-space' },
  { key: 'anti-riot', label: '反恐防暴', icon: 'helmet' },
  { key: 'drone-patrol', label: '无人机巡查', icon: 'ladder' },
  { key: 'outer-defense', label: '外围防暴', icon: 'confined-space' },
];

const soundLightOn = ref(true);

function onGridClick(g: GridItem): void {
  ia.openPatrolDetail({ key: g.key, label: g.label });
}

function toggleSoundLight(): void {
  soundLightOn.value = !soundLightOn.value;
}
</script>

<template>
  <PanelCard title="联动巡查" icon="helmet" more="更多" @more="ia.openPatrolList()">
    <div class="grid">
      <button
        v-for="g in grid"
        :key="g.key"
        type="button"
        class="grid__btn"
        @click="onGridClick(g)"
      >
        <PkgIcon :name="g.icon" size="22px" class="grid__icon" />
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
  color: var(--color-accent);
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
