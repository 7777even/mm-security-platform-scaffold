<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';
import { fetchClosedCases } from '@/services/closedCases';
import type { ClosedCase } from '@/services/closedCases';

const cases = ref<ClosedCase[]>([]);
const loading = ref(true);

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

onMounted(async () => {
  try {
    const list = await fetchClosedCases();
    cases.value = list?.cases ?? [];
  } catch {
    cases.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <PanelCard title="结案滚动列表" icon="Finished">
    <ul v-if="!loading && cases.length > 0" class="case-list" data-test="closed-case-list">
      <li v-for="c in cases" :key="c.caseId" class="case-row">
        <span class="case-row__id font-number">{{ c.caseId }}</span>
        <span class="case-row__title">{{ c.title }}</span>
        <span class="case-row__time font-number">{{ formatTime(c.closedAt) }}</span>
        <span class="case-row__handler">处置人：{{ c.handler }}</span>
      </li>
    </ul>
    <p v-else-if="loading" class="case-empty">结案列表加载中…</p>
    <p v-else class="case-empty">暂无结案记录</p>
  </PanelCard>
</template>

<style scoped>
.case-list {
  list-style: none;
  margin: 0;
  padding: 0;

  /* 自然撑开，无内部滚动条 */
  overflow: hidden;
}

.case-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto auto;
  gap: 2px 8px;
  padding: 8px 4px;
  border-bottom: 1px dashed var(--color-border);
  font-size: var(--font-size-helper);
}

.case-row__id {
  grid-column: 1;
  grid-row: 1 / 3;
  align-self: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-date);
}

.case-row__title {
  grid-column: 2;
  grid-row: 1;
  color: var(--color-text-primary);
}

.case-row__time {
  grid-column: 3;
  grid-row: 1;
  color: var(--color-text-muted);
  font-size: var(--font-size-date);
}

.case-row__handler {
  grid-column: 2 / 4;
  grid-row: 2;
  color: var(--color-text-secondary);
  font-size: var(--font-size-date);
}

.case-empty {
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-helper);
  padding: 16px 0;
}
</style>
