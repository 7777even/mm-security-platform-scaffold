<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { drills } from '../data/mock';

// 演练信息（列表页模板，docs/UI规范-移动端.md §5 / §5.1）
// - 筛选 chip 热区 48（参考项目原为 30px，未达 §1.4 要求，迁移时按 token 提升）
// - 演练状态只用 .tag--danger / --info / --success 三档，禁止自造色阶
// - 数据为演示数据（data/mock.ts）；接入后由演练计划列表接口驱动

const CHIPS = ['全部', '计划中', '进行中'] as const;
const filter = ref<string>('全部');

const list = computed(() =>
  filter.value === '全部' ? drills : drills.filter((d) => d.st === filter.value),
);

/** 演练状态 → 标签类 */
const STATUS_TAG: Record<string, string> = {
  进行中: 'tag--danger',
  计划中: 'tag--info',
  已结束: 'tag--success',
};
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="演练信息" back-to="/home" />

    <div class="mb-chips" role="tablist" aria-label="演练状态筛选">
      <button
        v-for="c in CHIPS"
        :key="c"
        type="button"
        class="mb-chip"
        :class="{ 'mb-chip--on': filter === c }"
        role="tab"
        :aria-selected="String(filter === c)"
        @click="filter = c"
      >
        {{ c }}
      </button>
    </div>

    <div v-if="list.length > 0" class="mb-stack">
      <RouterLink
        v-for="d in list"
        :key="d.id"
        class="mb-card mb-card--link"
        :to="`/drills/${d.id}`"
      >
        <div class="mb-card__title">
          <span class="drill__name">
            <Icon name="drill" size="var(--mb-ico-sm)" />
            {{ d.name }}
          </span>
          <span class="tag" :class="STATUS_TAG[d.st]">{{ d.st }}</span>
        </div>
        <p class="mb-card__desc">{{ d.id }} · {{ d.time }}</p>
        <p class="mb-card__desc">{{ d.place }} · 我的任务：{{ d.tasks.length }} 项</p>
      </RouterLink>
    </div>

    <div v-else class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">当前筛选下暂无演练</p>
    </div>
  </div>
</template>

<style scoped>
.drill__name {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}
</style>
