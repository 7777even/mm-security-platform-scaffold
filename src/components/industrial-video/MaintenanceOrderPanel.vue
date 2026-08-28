<!--
  MaintenanceOrderPanel — §工业电视「维修工单」
  三格横向统计：未派发 / 处理中 / 已超时（超时项红色高亮）。
-->
<script setup lang="ts">
import PanelCard from '@/components/common/PanelCard.vue';

interface Stat {
  key: string;
  label: string;
  count: number;
  highlight?: boolean;
}

const stats: Stat[] = [
  { key: 'unassigned', label: '未派发', count: 12 },
  { key: 'processing', label: '处理中', count: 25 },
  { key: 'overdue', label: '已超时', count: 8, highlight: true },
];
</script>

<template>
  <PanelCard title="维修工单" icon="Tools">
    <div class="row">
      <div v-for="s in stats" :key="s.key" :class="['cell', { 'cell--hot': s.highlight }]">
        <div class="cell__count">{{ s.count }}</div>
        <div class="cell__label">{{ s.label }}</div>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 4px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

.cell--hot {
  background: color-mix(in srgb, var(--color-alarm-1) 14%, transparent);
  border-color: color-mix(in srgb, var(--color-alarm-1) 55%, transparent);
}

.cell__count {
  font-family: var(--font-number);
  font-size: var(--font-size-h1);
  font-weight: 700;
  color: var(--color-text-strong);
  line-height: 1.1;
}

.cell--hot .cell__count {
  color: var(--color-alarm-1);
}

.cell__label {
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}
</style>
