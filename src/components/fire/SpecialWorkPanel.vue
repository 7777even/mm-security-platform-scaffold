<!--
  SpecialWorkPanel — §消防报警「特殊作业」
  两排各 4 个圆形指标（类型 + 数量）。
-->
<script setup lang="ts">
import PanelCard from '@/components/common/PanelCard.vue';

interface WorkItem {
  type: string;
  count: number;
}

const top: WorkItem[] = [
  { type: '动火作业', count: 48 },
  { type: '受限空间', count: 3 },
  { type: '高处作业', count: 2 },
  { type: '临时作业', count: 0 },
];
const bottom: WorkItem[] = [
  { type: '安装空间', count: 9 },
  { type: '地面作业', count: 35 },
  { type: '临时用电', count: 25 },
  { type: '救援作业', count: 1 },
];
</script>

<template>
  <PanelCard title="特殊作业" icon="Warning">
    <div class="cells">
      <div v-for="c in top" :key="c.type" class="cell">
        <div class="circle">{{ c.count }}</div>
        <div class="cell__type">{{ c.type }}</div>
      </div>
    </div>
    <div class="cells">
      <div v-for="c in bottom" :key="c.type" class="cell">
        <div class="circle">{{ c.count }}</div>
        <div class="cell__type">{{ c.type }}</div>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.cells {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  justify-items: center;
}

.cells + .cells {
  margin-top: 10px;
}

.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
  background: var(--color-accent-faint);
  font-family: var(--font-number);
  font-size: var(--font-size-time);
  font-weight: 700;
  color: var(--color-text-strong);
}

.cell__type {
  font-size: var(--font-size-date);
  color: var(--color-text-muted);
  text-align: center;
  white-space: nowrap;
}
</style>
