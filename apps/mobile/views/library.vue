<script setup lang="ts">
import { computed, ref } from 'vue';
import MobileHeader from '../components/MobileHeader.vue';
import IconTile from '../components/IconTile.vue';
import { library } from '../data/mock';

// 辅助资料库（列表页模板，docs/UI规范-移动端.md §5）
// - 列表行沿用 .mb-row（行高 48），行尾以 .mb-row__desc 承载版本 / 大小 / 离线缓存标记
// - 资料类型只用 .tag--* 枚举着色，禁止自造色阶
// - 数据为演示数据（data/mock.ts）；接入后改由资料库列表接口 + 离线缓存桥接驱动

interface LibraryItem {
  n: string;
  t: string;
  v: string;
  s: string;
}

/** 资料类型 → 标签类（PDF 主蓝 / 图片成功绿） */
const TYPE_TAG: Record<string, string> = {
  PDF: 'tag--info',
  图片: 'tag--success',
};

const keyword = ref('');

const list = computed<LibraryItem[]>(() => {
  const kw = keyword.value.trim();
  if (!kw) return library;
  return library.filter((l) => l.n.includes(kw) || l.t.includes(kw));
});
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="辅助资料库" back-to="/profile" />

    <input
      v-model="keyword"
      class="mb-input library-search"
      placeholder="全文搜索：平面图 / 预案 / MSDS / 通讯录"
    />

    <div v-if="list.length > 0" class="mb-stack">
      <div v-for="l in list" :key="l.n" class="mb-row">
        <IconTile name="book" tone="navy" size="sm" />
        <div class="mb-row__main">
          <div class="mb-row__title">{{ l.n }}</div>
        </div>
        <span class="mb-row__desc library-meta">{{ l.v }} · {{ l.s }} · 已缓存</span>
        <span class="tag" :class="TYPE_TAG[l.t]">{{ l.t }}</span>
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

/* 行尾元信息（版本 · 大小 · 缓存标记）：不换行、右对齐，避免挤压标题 */
.library-meta {
  flex-shrink: 0;
  margin-top: 0;
  text-align: right;
  white-space: nowrap;
}

.library-cache {
  margin-top: var(--mb-card-gap);
}
</style>
