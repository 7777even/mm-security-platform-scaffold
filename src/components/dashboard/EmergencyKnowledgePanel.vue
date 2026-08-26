<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchEmergencyKnowledge, type KnowledgeItem } from '@/services/knowledge';

const items = ref<KnowledgeItem[]>([]);

const CATEGORY_COLOR: Record<KnowledgeItem['category'], string> = {
  装置应急: 'var(--color-accent-fire)',
  罐区应急: 'var(--color-accent-gas)',
  装卸应急: 'var(--color-accent-temp)',
  公用应急: 'var(--color-info)',
};

onMounted(async () => {
  items.value = (await fetchEmergencyKnowledge()).items;
});
</script>

<template>
  <div class="knowledge-strip" data-test="emergency-knowledge-grid">
    <div v-for="k in items" :key="k.id" class="knowledge-card">
      <div class="k-head">
        <span class="k-dot" :style="{ background: CATEGORY_COLOR[k.category] }" />
        <span class="k-category">{{ k.category }}</span>
      </div>
      <div class="k-title">{{ k.title }}</div>
      <div class="k-foot">
        <span class="k-mastered">已掌握 {{ k.mastered }}</span>
        <span class="k-gap">未掌握 {{ k.notMastered }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.knowledge-strip {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.knowledge-strip::-webkit-scrollbar {
  height: 6px;
}

.knowledge-strip::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.knowledge-card {
  flex: 0 0 132px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-panel-soft);
  transition:
    border-color var(--transition-fast),
    transform var(--transition-fast);
}

.knowledge-card:hover {
  border-color: var(--color-accent);
  transform: translateY(-2px);
}

.k-head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.k-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: 0 0 auto;
}

.k-category {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.k-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.k-foot {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.k-mastered {
  color: var(--color-success);
}

.k-gap {
  color: var(--color-warning);
}
</style>
