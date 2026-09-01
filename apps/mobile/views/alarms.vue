<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import { alarms } from '../data/mock';

// 告警明细（列表页模板，docs/UI规范-移动端.md §5 / §5.1）
// - 筛选 chip 热区 48（参考项目原为 30px，未达 §1.4 要求，迁移时按 token 提升）
// - 等级 / 状态着色只用规范 §8 枚举映射（--color-alarm-1..4 + .tag--*），禁止自造色阶
// - 数据为演示数据（data/mock.ts）；接入后改由告警列表接口驱动

const CHIPS = ['全部', '消防报警', 'DCS 报警', 'GDS 气体', '周界入侵', '视频AI'] as const;
const filter = ref<string>('全部');

const list = computed(() =>
  filter.value === '全部' ? alarms : alarms.filter((a) => a.type === filter.value),
);

/** 报警等级 → 标签类（一级红 / 二三级橙 / 四级主蓝） */
const LEVEL_TAG: Record<string, string> = {
  一级: 'tag--danger',
  二级: 'tag--warning',
  三级: 'tag--warning',
  四级: 'tag--info',
};

/** 处置状态 → 标签类 */
const STATUS_TAG: Record<string, string> = {
  未确认: 'tag--danger',
  处理中: 'tag--warning',
  已确认: 'tag--warning',
  已处理: 'tag--success',
};
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="告警明细" back-to="/home" />

    <div class="mb-chips" role="tablist" aria-label="告警类型筛选">
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
        v-for="a in list"
        :key="a.id"
        class="mb-card mb-card--link"
        :to="`/alarms/${a.id}`"
      >
        <div class="mb-card__title">
          <span>{{ a.name }}</span>
          <span class="tag" :class="LEVEL_TAG[a.level]">{{ a.level }}</span>
        </div>
        <p class="mb-card__desc">{{ a.id }} · {{ a.time }} · {{ a.area }}</p>
        <p class="mb-card__desc">
          状态：<span class="tag" :class="STATUS_TAG[a.st]">{{ a.st }}</span>
        </p>
      </RouterLink>
    </div>

    <div v-else class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">当前筛选下暂无告警</p>
    </div>
  </div>
</template>
