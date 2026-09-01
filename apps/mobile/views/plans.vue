<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { plans } from '../data/mock';

// 应急预案（列表页模板，docs/UI规范-移动端.md §5）
// - 搜索框沿用 .mb-input（热区 48，参考项目原为 40px，按 token 提升）
// - 编号标签用 .tag--info，状态/等级着色不在此页出现，禁止自造色阶
// - 数据为演示数据（data/mock.ts）；接入后由预案列表接口驱动

const keyword = ref('');

const list = computed(() => {
  const kw = keyword.value.trim();
  if (!kw) return plans;
  return plans.filter((p) => p.name.includes(kw) || p.id.includes(kw));
});
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="应急预案" back-to="/home" />

    <input v-model="keyword" class="mb-input plan__search" placeholder="搜索预案名称 / 编号" />

    <div v-if="list.length > 0" class="mb-stack">
      <RouterLink
        v-for="p in list"
        :key="p.id"
        class="mb-card mb-card--link"
        :to="`/plans/${p.id}`"
      >
        <div class="mb-card__title">
          <span class="plan__name">
            <Icon name="plan" size="var(--mb-ico-sm)" />
            {{ p.name }}
          </span>
          <span class="tag tag--info">{{ p.id }}</span>
        </div>
        <p class="mb-card__desc">适用：{{ p.scope }} · 级别：{{ p.level }} · {{ p.ver }}</p>
      </RouterLink>
    </div>

    <div v-else class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">未匹配到相关预案</p>
    </div>
  </div>
</template>

<style scoped>
.plan__search {
  margin-bottom: var(--mb-card-gap);
}

.plan__name {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}
</style>
