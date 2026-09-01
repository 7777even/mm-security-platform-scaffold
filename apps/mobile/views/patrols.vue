<script setup lang="ts">
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { patrols } from '../data/mock';

// 日常防火巡查（列表页模板，docs/UI规范-移动端.md §5 / §5.1）
// - 卡片流 + 共享进度条 .mb-progress（宽度为数据，允许百分比字面量）
// - 状态标签只用 .tag--* 枚举；异常项数为 0 时不渲染该段文案（同参考）
// - 数据为演示数据（data/mock.ts）；接入后改由巡查计划接口驱动

interface PatrolItem {
  name: string;
  range: string;
  st: string;
  progress: number;
  total: number;
  abn: number;
}

const list: PatrolItem[] = patrols;

const STATUS_TAG: Record<string, string> = {
  执行中: 'tag--info',
  待执行: 'tag--warning',
  已提交: 'tag--success',
};

function percent(p: PatrolItem): string {
  return `${Math.round((p.progress / p.total) * 100)}%`;
}

function abnText(p: PatrolItem): string {
  return p.abn > 0 ? ` · 异常 ${p.abn} 项` : '';
}
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="日常防火巡查" back-to="/home" />

    <h2 class="mb-section__title patrol-sec">
      <Icon name="patrol" />
      日常防火巡查
    </h2>

    <div class="mb-stack">
      <RouterLink v-for="p in list" :key="p.name" class="mb-card mb-card--link" to="/patrol-exec">
        <div class="mb-card__title">
          <span class="patrol-card__name">
            <Icon name="pin" size="var(--mb-ico-sm)" color="var(--primary-mobile)" />
            {{ p.name }}
          </span>
          <span class="tag" :class="STATUS_TAG[p.st]">{{ p.st }}</span>
        </div>
        <p class="mb-card__desc">
          {{ p.range }} · 进度 {{ p.progress }}/{{ p.total }}{{ abnText(p) }}
        </p>
        <div class="mb-progress patrol-card__bar">
          <i class="mb-progress__bar" :style="{ width: percent(p) }" />
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.patrol-sec {
  margin: 0 0 var(--mb-card-gap);
}

.patrol-card__name {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-width: 0;
}

.patrol-card__bar {
  margin-top: var(--space-sm);
}
</style>
