<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import MobileHeader from '../components/MobileHeader.vue';
import IconTile from '../components/IconTile.vue';
import { fetchEmergencyKnowledge, type KnowledgeItem } from '@/services/knowledge';

// 辅助资料库（列表页模板，docs/UI规范-移动端.md §5）
// 数据源：后端 /api/v1/emergency/knowledge（应急生产安全知识分类），经 fetchEmergencyKnowledge
// 拉取。取消原 data/mock.ts 静态数据；未连后端由 service 内部走空态 + 全局离线告警。
// - 后端为「知识分类 + 条目数」形态（岗位应急处置卡 / 危化品知识库 / 疏散路线等），
//   列表按分类标题 + 条目数展示，搜索按标题过滤。
// - 列表行沿用 .mb-row（行高 48）；分类标签只用 .tag--* 枚举着色。

interface LibraryItem {
  id: string;
  title: string;
  count: number;
}

const loading = ref(false);
const keyword = ref('');
const list = ref<LibraryItem[]>([]);

function toRow(k: KnowledgeItem): LibraryItem {
  return { id: k.id, title: k.title, count: k.count };
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchEmergencyKnowledge();
    list.value = (res.items ?? []).map(toRow);
  } catch {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

const filtered = computed(() => {
  const kw = keyword.value.trim();
  if (!kw) return list.value;
  return list.value.filter((l) => l.title.includes(kw));
});

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="辅助资料库" back-to="/profile" />

    <input
      v-model="keyword"
      class="mb-input library-search"
      placeholder="搜索：岗位处置卡 / 危化品知识 / 疏散路线"
    />

    <p v-if="loading" class="mb-loading">加载中…</p>

    <div v-else-if="filtered.length > 0" class="mb-stack">
      <div v-for="l in filtered" :key="l.id" class="mb-row">
        <IconTile name="book" tone="navy" size="sm" />
        <div class="mb-row__main">
          <div class="mb-row__title">{{ l.title }}</div>
        </div>
        <span class="mb-row__desc library-meta">{{ l.count }} 条</span>
        <span class="tag tag--info">知识库</span>
      </div>
    </div>

    <div v-else class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">未找到匹配的资料</p>
    </div>

    <button type="button" class="mb-btn-primary mb-btn-block library-cache">缓存常用资料</button>
  </div>
</template>

<style scoped>
.library-search {
  margin-bottom: var(--mb-card-gap);
}

/* 行尾元信息（条目数）：不换行、右对齐，避免挤压标题 */
.library-meta {
  flex-shrink: 0;
  margin-top: 0;
  text-align: right;
  white-space: nowrap;
}

.library-cache {
  margin-top: var(--mb-card-gap);
}

.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
