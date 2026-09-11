<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PreliminarySidePanel from '../../common/PreliminarySidePanel.vue';
import { Document, WarningFilled, Guide } from '@element-plus/icons-vue';
import { fetchEmergencyKnowledge } from '@/services/knowledge';
import type { DesignModule } from '../../../utils/designAssets';

interface KnowledgePanelItem {
  iconIndex: number;
  line1: string;
  line2: string;
  count: number;
  countTone: string;
}

// module 仅用于面板配色/切图变体（PreliminarySidePanel），数据不再按模块分流
withDefaults(
  defineProps<{
    module?: Extract<DesignModule, 'preliminary' | 'fireEmergency'>;
  }>(),
  { module: 'preliminary' },
);

// 单一数据源：无论 preliminary / fireEmergency 模块，统一走 /emergency/knowledge
// （services/knowledge.ts 内置无后端时的演示 fixture 与非法响应空态，见 backendFallback.ts）
const items = ref<KnowledgePanelItem[]>([]);

onMounted(async () => {
  try {
    const knowledge = await fetchEmergencyKnowledge();
    items.value = knowledge.items.map((it, i) => ({
      iconIndex: i,
      line1: it.title,
      line2: '知识条目',
      count: it.count,
      countTone: i % 2 === 0 ? 'lime' : 'cyan',
    }));
  } catch {
    // 保留空，模板回退无卡片
  }
});

/**
 * 设计稿：3 行 × 3 列，每行 393×65，行间距 11px（最多 9 张卡）。
 * 按「每行 3 条」对 items 分块，**不可**把全部 items 铺进每一行——
 * 条目数 > 3 时（后端 V8 3 条 + V35 加厚 6 条 = 9 条）会把 9 张卡挤进 393px，
 * 每张仅 ~43px，文字溢出互相重叠。
 */
const PER_ROW = 3;
const MAX_ROWS = 3;
const knowledgeRows = computed(() => {
  const rows: Array<Array<KnowledgePanelItem & { key: string }>> = [];
  for (let i = 0; i < items.value.length && rows.length < MAX_ROWS; i += PER_ROW) {
    rows.push(
      items.value
        .slice(i, i + PER_ROW)
        .map((item, col) => ({ ...item, key: `${rows.length}-${col}` })),
    );
  }
  return rows;
});

/* 与 iconIndex 一一对应：处置卡 / 危险化学品 / 疏散路线图 */
const KNOWLEDGE_ICONS = [Document, WarningFilled, Guide];
</script>

<template>
  <PreliminarySidePanel title="应急生产安全知识" variant="knowledge" :module="module">
    <div class="knowledge-grid">
      <div v-for="(row, rowIndex) in knowledgeRows" :key="rowIndex" class="knowledge-row">
        <div v-for="item in row" :key="item.key" class="knowledge-card">
          <span class="knowledge-card__icon" aria-hidden="true">
            <component :is="KNOWLEDGE_ICONS[item.iconIndex % KNOWLEDGE_ICONS.length]" />
          </span>
          <div class="knowledge-card__text">
            <div class="knowledge-card__line1">{{ item.line1 }}</div>
            <div class="knowledge-card__line2">
              <span class="knowledge-card__label">{{ item.line2 }}</span>
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
/* 设计稿：每行 65px、行间距 11px（满 3 行 = 217px）；行高固定，不随条目数拉伸 */
.knowledge-grid {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.knowledge-row {
  display: flex;
  align-items: stretch;
  height: 65px;
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
  font-size: 12px;
  color: #a8b4c4;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal;
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
  overflow: hidden;
}

/* 标签可截断，数值始终完整显示（防止文字溢出到相邻卡片造成重叠） */
.knowledge-card__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.knowledge-card__count {
  flex-shrink: 0;
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
