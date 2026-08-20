<!--
  MapPin — §10.3 地图复合标注的发光图钉（设计稿图 5-8 顶部）
  props:
    - level: 1..4 控制颜色与发光强度
    - icon:  ElementPlus 图标组件名（可选，默认显示感叹号）
-->
<script setup lang="ts">
import { computed } from 'vue';
import * as ElementPlusIcons from '@element-plus/icons-vue';
import type { AlarmLevel } from '@/services/alarm';

const props = withDefaults(
  defineProps<{
    level: AlarmLevel;
    icon?: string;
  }>(),
  { icon: '' },
);

const pinClass = computed(() => `map-pin map-pin--l${props.level}`);
const iconComp = computed(() => {
  if (!props.icon) return null;
  return (ElementPlusIcons as Record<string, unknown>)[props.icon] ?? null;
});
</script>

<template>
  <span :class="pinClass" role="img" aria-label="地图标注">
    <component :is="iconComp" v-if="iconComp" class="icon-sm" />
    <span v-else class="icon-sm" aria-hidden="true">!</span>
  </span>
</template>
