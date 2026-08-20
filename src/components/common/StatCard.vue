<!--
  StatCard — §9.1 统计卡片（设计稿图 5-7 左上 / 图 5-2 物资类）
  指标名称（大字号）+ 大数字（Poppins Bold accent）+ 资源图标
  props:
    - title: 指标名称
    - value: 数值（string | number，内部 font-number 渲染）
    - icon:  ElementPlus 图标组件或字符串名
-->
<script setup lang="ts">
import { computed } from 'vue';
import * as ElementPlusIcons from '@element-plus/icons-vue';

const props = withDefaults(
  defineProps<{
    title: string;
    value: string | number;
    icon?: string;
  }>(),
  { icon: '' },
);

const iconComp = computed(() => {
  if (!props.icon) return null;
  return (ElementPlusIcons as Record<string, unknown>)[props.icon] ?? null;
});
</script>

<template>
  <article class="stat-card">
    <span v-if="iconComp" class="stat-card__icon">
      <component :is="iconComp" />
    </span>
    <div class="stat-card__body">
      <span class="stat-card__title">{{ title }}</span>
      <span class="stat-card__value">{{ value }}</span>
    </div>
  </article>
</template>
