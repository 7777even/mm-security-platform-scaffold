<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { msds } from '../data/mock';

// 危化品 MSDS 检索（列表页模板，docs/UI规范-移动端.md §5 / §5.1）
// - 搜索框沿用 .mb-input（热区 48，参考项目原为 40px 未达 §1.4，迁移时按 token 提升）
// - 列表卡沿用 .mb-card / .mb-card--link，危化品分类只用 .tag--warning，禁止自造色阶
// - 数据为演示数据（data/mock.ts）；接入后改由 MSDS 检索接口驱动

const keyword = ref('');

/** 按名称 / CAS 号模糊检索（空关键字返回全量） */
const list = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return msds;
  return msds.filter((m) => m.name.toLowerCase().includes(kw) || m.cas.includes(kw));
});
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="化学品知识 MSDS" back-to="/profile" />

    <input v-model="keyword" class="mb-input msds-search" placeholder="搜索名称 / CAS 号" />

    <div v-if="list.length > 0" class="mb-stack">
      <RouterLink
        v-for="m in list"
        :key="m.cas"
        class="mb-card mb-card--link"
        :to="`/msds/${m.cas}`"
      >
        <div class="mb-card__title">
          <span class="msds-name">
            <Icon name="flask" size="var(--mb-ico-sm)" mono />
            {{ m.name }}
          </span>
          <span class="tag tag--warning">{{ m.cls.split('/')[0] }}</span>
        </div>
        <p class="mb-card__desc">CAS：{{ m.cas }}</p>
      </RouterLink>
    </div>

    <div v-else class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">未找到匹配的化学品</p>
    </div>
  </div>
</template>

<style scoped>
.msds-search {
  margin-bottom: var(--mb-card-gap);
}

/* 标题左侧「图标 + 名称」：图标随正文色，间距由 token 控制 */
.msds-name {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-width: 0;
}
</style>
