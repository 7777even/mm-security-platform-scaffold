<!--
  PatrolListDialog — 联动巡查清单（安全防恐 patrolList，联动巡查「更多」）
  列出全部联动巡查入口，点击单条进入详情。
  图标：压缩包 fire-situation 图标（PkgIcon，helmet=巡查/防暴）。
-->
<script setup lang="ts">
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import { useSecurityInteraction } from '@/composables/useSecurityInteraction';

interface GridItem {
  key: string;
  label: string;
}

const items: GridItem[] = [
  { key: 'center-monitor', label: '中心监控室' },
  { key: 'monitor-check', label: '监控勘验' },
  { key: 'perimeter', label: '周界防恐' },
  { key: 'anti-riot', label: '反恐防暴' },
  { key: 'drone-patrol', label: '无人机巡查' },
  { key: 'outer-defense', label: '外围防暴' },
];

const emit = defineEmits<{ close: [] }>();
const ia = useSecurityInteraction();

function open(item: GridItem): void {
  ia.openPatrolDetail({ key: item.key, label: item.label });
}
</script>

<template>
  <ScreenDialog :open="true" title="联动巡查" icon="helmet" @close="emit('close')">
    <ul class="list">
      <li v-for="g in items" :key="g.key" class="list__item" @click="open(g)">
        <PkgIcon name="helmet" size="18px" class="list__icon" />
        <span class="list__label">{{ g.label }}</span>
        <span class="list__arrow">›</span>
      </li>
    </ul>
  </ScreenDialog>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.list__item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
}

.list__item:hover {
  background: var(--color-accent-faint);
  border-color: var(--color-accent-glow);
}

.list__icon {
  color: var(--color-accent);
  flex-shrink: 0;
}

.list__label {
  flex: 1;
  font-size: var(--font-size-biz);
  color: var(--color-text-strong);
}

.list__arrow {
  color: var(--color-text-muted);
}
</style>
