<!--
  SpecialWorkPanel — §消防救援「特殊作业」
  动火/高处/受限空间/临时用电/吊装 作业一览（数量 + 状态）。
-->
<script setup lang="ts">
import PanelCard from '@/components/common/PanelCard.vue';

interface SpecialWork {
  type: string;
  count: number;
  status: '进行中' | '待审批' | '已完成';
  level: 'danger' | 'warn' | 'normal';
}

const works: SpecialWork[] = [
  { type: '动火作业', count: 12, status: '进行中', level: 'danger' },
  { type: '高处作业', count: 8, status: '进行中', level: 'warn' },
  { type: '受限空间', count: 5, status: '进行中', level: 'warn' },
  { type: '临时用电', count: 6, status: '待审批', level: 'normal' },
  { type: '吊装作业', count: 3, status: '已完成', level: 'normal' },
];
</script>

<template>
  <PanelCard title="特殊作业" icon="Warning">
    <ul class="work-list">
      <li v-for="w in works" :key="w.type" class="work-item">
        <span class="work-item__type">{{ w.type }}</span>
        <span class="work-item__count">{{ w.count }} 处</span>
        <span :class="['work-item__status', `work-item__status--${w.level}`]">{{ w.status }}</span>
      </li>
    </ul>
  </PanelCard>
</template>

<style scoped>
.work-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.work-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: rgb(255 255 255 / 3%);
  border: 1px solid var(--panel-border, rgb(0 216 255 / 12%));
}

.work-item__type {
  flex: 1;
  font-size: 13px;
  color: var(--color-text);
}

.work-item__count {
  font-family: var(--font-number);
  font-size: 13px;
  color: var(--color-text-muted);
}

.work-item__status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.work-item__status--danger {
  color: #ff6b6b;
  background: rgb(255 107 107 / 12%);
}

.work-item__status--warn {
  color: #ffc24b;
  background: rgb(255 194 75 / 12%);
}

.work-item__status--normal {
  color: #2ee6a8;
  background: rgb(46 230 168 / 12%);
}
</style>
