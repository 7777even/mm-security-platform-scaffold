<template>
  <PanelCard title="应急生产安全知识" icon="Notebook">
    <div class="knowledge" data-test="emergency-knowledge-grid">
      <div v-for="k in items" :key="k.id" class="knowledge__card">
        <span class="knowledge__icon">
          <el-icon :size="18" color="#7ad7ff">
            <component :is="ICON_MAP[k.icon]" />
          </el-icon>
        </span>
        <div class="knowledge__title">{{ k.title }}</div>
        <div class="knowledge__count">{{ k.count }}</div>
      </div>
    </div>
  </PanelCard>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';
import {
  fetchEmergencyKnowledge,
  type KnowledgeItem,
  type KnowledgeList,
} from '@/services/knowledge';
import { Document, WarningFilled, Guide } from '@element-plus/icons-vue';

const ICON_MAP: Record<string, unknown> = {
  Document,
  WarningFilled,
  Guide,
};

const items = ref<KnowledgeItem[]>([]);

onMounted(async () => {
  try {
    const data: KnowledgeList = await fetchEmergencyKnowledge();
    items.value = data.items;
  } catch {
    items.value = [];
  }
});
</script>

<style scoped>
.knowledge {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.knowledge__card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 8px;
  background: rgb(255 255 255 / 6%);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  min-height: 104px;
}

.knowledge__icon {
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgb(122 215 255 / 14%);
  border: 1px solid rgb(122 215 255 / 35%);
}

.knowledge__title {
  flex: 1;
  font-size: 12px;
  color: var(--color-text);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.knowledge__count {
  font-size: 14px;
  font-weight: 700;
  color: #7ad7ff;
  font-family: 'DIN Alternate', 'Microsoft YaHei', monospace;
}
</style>
