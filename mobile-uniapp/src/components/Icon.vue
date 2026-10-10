<script setup lang="ts">
// PoC 占位图标组件：真实工程接入 iconset.ts（见 apps/mobile/styles/iconset.ts）。
// 此处用首字母缩写渲染，保证页面结构完整。
defineProps<{ name: string; size?: string }>();
</script>

<template>
  <span class="mb-icon" :style="size ? { fontSize: size } : undefined">{{
    name.slice(0, 1).toUpperCase()
  }}</span>
</template>

<style scoped>
.mb-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6em;
  height: 1.6em;
  border-radius: 8rpx;
  background: rgb(22 119 255 / 12%);
  color: var(--primary-mobile);
  font-weight: 700;
}
</style>
