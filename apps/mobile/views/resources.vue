<script setup lang="ts">
import MobileHeader from '../components/MobileHeader.vue';
import IconTile from '../components/IconTile.vue';
import Icon from '../components/Icon.vue';
import { resources } from '../data/mock';

// 应急资源（列表页模板，docs/UI规范-移动端.md §5）
// - 概览用 .mb-stat-grid 3 列宫格（与首页告警概览同构），图标统一 IconTile 承载
// - 分区列表沿用 .mb-row（行高 48），行尾箭头仅作可点示意，热区由整行承担
// - 数据为演示数据（data/mock.ts）；接入后改由应急资源台账接口驱动
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="应急资源" back-to="/profile" />

    <div class="mb-stat-grid">
      <div v-for="c in resources.cards" :key="c.k" class="mb-stat">
        <IconTile :name="c.icon" tone="blue" size="md" />
        <span class="mb-stat__num">{{ c.n }}</span>
        <span class="mb-stat__label">{{ c.k }}</span>
      </div>
    </div>

    <section class="mb-section resources-areas">
      <div class="mb-section__head">
        <span class="mb-section__title">
          <Icon name="pin" size="var(--mb-ico-sm)" mono />
          按区域查看
        </span>
      </div>
      <div class="mb-stack">
        <div v-for="a in resources.areas" :key="a.a" class="mb-row">
          <div class="mb-row__main">
            <div class="mb-row__title">{{ a.a }}</div>
            <p class="mb-row__desc">{{ a.v }}</p>
          </div>
          <Icon name="chevron" size="var(--mb-ico-sm)" mono />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 宫格与分区列表之间留一个区块间距（token 真源，无字面量） */
.resources-areas {
  margin-top: var(--space-md);
}
</style>
