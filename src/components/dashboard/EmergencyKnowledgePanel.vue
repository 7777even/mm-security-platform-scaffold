<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';
import { fetchEmergencyKnowledge } from '@/services/knowledge';
import type { KnowledgeItem } from '@/services/knowledge';

const items = ref<KnowledgeItem[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const list = await fetchEmergencyKnowledge();
    items.value = list?.items ?? [];
  } catch {
    items.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <PanelCard title="应急生产安全知识" icon="Reading">
    <ul
      v-if="!loading && items.length > 0"
      class="knowledge-grid"
      data-test="emergency-knowledge-grid"
    >
      <li v-for="k in items" :key="k.id" class="knowledge-cell">
        <span class="knowledge-cell__title">{{ k.title }}</span>
        <span class="knowledge-cell__meta">
          <span class="knowledge-cell__hint">岗位</span>
          <span class="knowledge-cell__stat font-number">未掌握 {{ k.notMastered }}</span>
        </span>
      </li>
    </ul>
    <p v-else-if="loading" class="knowledge-empty">知识库加载中…</p>
    <p v-else class="knowledge-empty">暂无知识条目</p>
  </PanelCard>
</template>

<style scoped>
.knowledge-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.knowledge-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 8px;
  background: var(--color-panel-2);
  border: 1px solid var(--color-border-soft);
  border-radius: 6px;
  transition:
    border-color 0.15s,
    background 0.15s;
}

.knowledge-cell:hover {
  border-color: var(--color-accent);
  background: rgb(0 216 255 / 8%);
}

.knowledge-cell__title {
  font-size: 12px;
  color: var(--color-text);
  font-weight: 600;
}

.knowledge-cell__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
}

.knowledge-cell__hint {
  color: var(--color-text-muted);
}

.knowledge-cell__stat {
  color: var(--color-warning, #ffb020);
}

.knowledge-empty {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 12px;
  padding: 16px 0;
}
</style>
