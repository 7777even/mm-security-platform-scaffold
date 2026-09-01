<!--
  PkgIcon — 渲染压缩包（fire-monitoring）里的 fire-situation SVG 图标。
  源文件位于 public/icons/fire-situation/{name}.svg（与压缩包逐字节一致，已核验）。
  采用 mask + currentColor 方案：既"用压缩包里的图标"，又能继承父级 color 在深蓝底上规范着色
  （直接 <img> 引入会因为 SVG 的 stroke=currentColor 渲染成黑色、深蓝底上看不见）。
  零硬编码色：颜色由父级 color（token）决定。
  可用 name：flame / bell-ringing / gas / helmet / ladder / crane / confined-space
-->
<script setup lang="ts">
import { computed, CSSProperties } from 'vue';

const props = withDefaults(
  defineProps<{
    name: string;
    size?: string;
  }>(),
  { size: '20px' },
);

const style = computed<CSSProperties>(() => ({
  width: props.size,
  height: props.size,
  maskImage: `url(/icons/fire-situation/${props.name}.svg)`,
  WebkitMaskImage: `url(/icons/fire-situation/${props.name}.svg)`,
}));
</script>

<template>
  <i class="pkg-icon" :style="style" aria-hidden="true" />
</template>

<style scoped>
.pkg-icon {
  display: inline-block;
  flex: none;
  background-color: currentcolor;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
}
</style>
