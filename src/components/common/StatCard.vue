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
import PkgIcon from './PkgIcon.vue';

const props = withDefaults(
  defineProps<{
    title: string;
    value: string | number;
    icon?: string;
  }>(),
  { icon: '' },
);

// 压缩包（fire-monitoring）图标名集合；命中时改走 PkgIcon（mask + currentColor），
// 否则回退到 Element Plus 图标库（保持其他模块既有行为不变），再否则按纯文本/emoji 渲染。
const PKG_ICON_NAMES = [
  'flame',
  'bell-ringing',
  'gas',
  'helmet',
  'ladder',
  'crane',
  'confined-space',
];
const pkgIconName = computed(() => (PKG_ICON_NAMES.includes(props.icon) ? props.icon : ''));
const iconComp = computed(() => {
  if (!props.icon || pkgIconName.value) return null;
  return (ElementPlusIcons as Record<string, unknown>)[props.icon] ?? null;
});
const isPlainText = computed(() => !!props.icon && !pkgIconName.value && !iconComp.value);
</script>

<template>
  <article class="stat-card">
    <span v-if="pkgIconName" class="stat-card__icon">
      <PkgIcon :name="pkgIconName" size="22px" />
    </span>
    <span v-else-if="iconComp" class="stat-card__icon">
      <component :is="iconComp" />
    </span>
    <span v-else-if="isPlainText" class="stat-card__icon stat-card__icon--text">{{ icon }}</span>
    <div class="stat-card__body">
      <span class="stat-card__title">{{ title }}</span>
      <span class="stat-card__value">{{ value }}</span>
    </div>
  </article>
</template>

<style scoped>
.stat-card__icon--text {
  font-size: 20px;
  line-height: 1;
}
</style>
