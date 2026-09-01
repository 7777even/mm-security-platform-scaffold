<!--
  VideoOverviewPanel — §工业电视「视频监控概览」
  6 格统计卡（3列×2行）：重点数 / 生产设施 / 厂界 / 封闭入口 / 其他入口 / 其它。
  每格图标用压缩包 fire-situation 图标（PkgIcon，mask + currentColor），点击进入对应分类视频墙。
-->
<script setup lang="ts">
import PanelCard from '@/components/common/PanelCard.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import { useIndustrialVideoInteraction } from '@/composables/useIndustrialVideoInteraction';

interface StatItem {
  key: string;
  label: string;
  value: number;
  icon: string;
}

const ia = useIndustrialVideoInteraction();

const items: StatItem[] = [
  { key: 'key', label: '重点数', value: 665, icon: 'flame' },
  { key: 'prod', label: '生产设施', value: 56, icon: 'crane' },
  { key: 'perimeter', label: '厂界', value: 56, icon: 'confined-space' },
  { key: 'closed', label: '封闭入口', value: 55, icon: 'helmet' },
  { key: 'other-in', label: '其他入口', value: 66, icon: 'helmet' },
  { key: 'misc', label: '其它', value: 6, icon: 'ladder' },
];

function onItem(it: StatItem): void {
  ia.openVideoCategory({ label: it.label });
}
</script>

<template>
  <PanelCard title="视频监控概览" icon="crane">
    <div class="grid">
      <button v-for="it in items" :key="it.key" type="button" class="cell" @click="onItem(it)">
        <PkgIcon :name="it.icon" size="22px" class="cell__icon" />
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
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
}

.cell:hover {
  background: var(--color-accent-faint);
  border-color: color-mix(in srgb, var(--color-accent) 50%, transparent);
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
  font-size: var(--font-size-date);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.cell__value {
  font-family: var(--font-number);
  font-size: var(--font-size-time);
  font-weight: 700;
  color: var(--color-text-strong);
  line-height: 1.1;
}
</style>
