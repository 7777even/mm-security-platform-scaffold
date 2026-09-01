<script setup lang="ts">
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import { tickets } from '../data/mock';

// 操作票（列表页模板，docs/UI规范-移动端.md §5 / §5.1）
// - 卡片流：票名 + 票级标签 + 有效时段与状态摘要
// - 票级只作标识（A/B 级），不参与等级色阶，故统一 .tag--info
// - 数据为演示数据（data/mock.ts）；接入后改由操作票列表接口驱动

interface TicketItem {
  name: string;
  range: string;
  grade: string;
  st: string;
}

const list: TicketItem[] = tickets;
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="操作票" back-to="/home" />

    <div class="mb-stack">
      <RouterLink v-for="t in list" :key="t.name" class="mb-card mb-card--link" to="/ticket-exec">
        <div class="mb-card__title">
          <span>{{ t.name }}</span>
          <span class="tag tag--info">{{ t.grade }}级</span>
        </div>
        <p class="mb-card__desc">{{ t.range }} · {{ t.st }}</p>
      </RouterLink>
    </div>
  </div>
</template>
