<script setup lang="ts">
import { computed } from 'vue';
import PreliminarySidePanel from '../../common/PreliminarySidePanel.vue';
import { safetyKnowledgeItems } from '../../../lib/data/preliminaryMock';
import { fireSafetyKnowledgeItems } from '../../../lib/data/fireEmergencyMock';
import { Document, WarningFilled, Guide } from '@element-plus/icons-vue';
import type { DesignModule } from '../../../utils/designAssets';

const props = withDefaults(
  defineProps<{
    module?: Extract<DesignModule, 'preliminary' | 'fireEmergency'>;
  }>(),
  { module: 'preliminary' },
);

const items = computed(() =>
  props.module === 'fireEmergency' ? fireSafetyKnowledgeItems : safetyKnowledgeItems,
);

/** 设计稿：三行相同内容，每行 393×65，行间距 11px */
const knowledgeRows = computed(() =>
  Array.from({ length: 3 }, (_, row) =>
    items.value.map((item, col) => ({
      ...item,
      key: `${row}-${col}`,
    })),
  ),
);

/* 与 iconIndex 一一对应：处置卡 / 危险化学品 / 疏散路线图 */
const KNOWLEDGE_ICONS = [Document, WarningFilled, Guide];
</script>

<template>
  <PreliminarySidePanel title="应急生产安全知识" variant="knowledge" :module="module">
    <div class="knowledge-grid">
      <div v-for="(row, rowIndex) in knowledgeRows" :key="rowIndex" class="knowledge-row">
        <div v-for="item in row" :key="item.key" class="knowledge-card">
          <span class="knowledge-card__icon" aria-hidden="true">
            <component :is="KNOWLEDGE_ICONS[item.iconIndex]" />
          </span>
          <div class="knowledge-card__text">
            <div class="knowledge-card__line1">{{ item.line1 }}</div>
            <div class="knowledge-card__line2">
              <span>{{ item.line2 }}</span>
              <span
                class="knowledge-card__count"
                :class="`knowledge-card__count--${item.countTone}`"
              >
                {{ item.count }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PreliminarySidePanel>
</template>

<style scoped>
/* 设计稿：3 行 × 3 列，65px + 11px × 2 = 217px */
.knowledge-grid {
  display: flex;
  flex-direction: column;
  gap: 11px;
  height: 217px;
}

.knowledge-row {
  display: flex;
  align-items: stretch;
  flex: 1;
  min-height: 65px;
  border: 1px solid rgb(0 100 180 / 32%);
  border-radius: 2px;
  overflow: hidden;
  background: rgb(0 14 32 / 55%);
}

.knowledge-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 0 6px;
  box-sizing: border-box;
}

.knowledge-card + .knowledge-card {
  border-left: 1px solid rgb(0 100 180 / 28%);
}

.knowledge-card__icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: var(--color-accent);
}

.knowledge-card__icon svg {
  width: 100%;
  height: 100%;
  fill: currentcolor;
}

.knowledge-card__text {
  flex: 1;
  min-width: 0;
}

.knowledge-card__line1 {
  font-size: 13px;
  color: #a8b4c4;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.knowledge-card__line2 {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 3px;
  font-size: 12px;
  color: #a8b4c4;
  line-height: 1.25;
  white-space: nowrap;
}

.knowledge-card__count {
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.knowledge-card__count--lime {
  color: #c6bc4e;
}

.knowledge-card__count--cyan {
  color: #3cb0d6;
}
</style>
