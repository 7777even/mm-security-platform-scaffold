<!--
  SecondaryPageOverlay — 模块「二级页」主壳内联预览覆盖层
  替代原先 router.push 跳转到主壳独立页面（替换整块模块）的体验：
  在所属模块的 wujie 主壳内以覆盖层呈现二级页内容，关闭即回到模块，
  不离开当前业务模块。
  通过 v-model:open 控制显隐；点击遮罩或内部组件 emit('close') 关闭。
-->
<script setup lang="ts">
defineProps<{ open: boolean }>();
const emit = defineEmits<{ 'update:open': [boolean] }>();

function close(): void {
  emit('update:open', false);
}
</script>

<template>
  <transition name="secondary-fade">
    <div v-if="open" class="secondary-overlay" data-test="secondary-overlay">
      <div class="secondary-overlay__backdrop" @click="close" />
      <div class="secondary-overlay__panel">
        <slot />
      </div>
    </div>
  </transition>
</template>

<style scoped>
.secondary-overlay {
  position: absolute;
  inset: 0;
  z-index: var(--z-overlay);
  display: flex;
}

.secondary-overlay__backdrop {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--color-bg) 72%, transparent);
  backdrop-filter: blur(2px);
}

.secondary-overlay__panel {
  position: relative;
  z-index: var(--z-base);
  flex: 1;
  margin: var(--space-md);
  display: flex;
}

.secondary-overlay__panel > * {
  flex: 1;
  min-height: 0;
}

.secondary-fade-enter-active,
.secondary-fade-leave-active {
  transition: opacity 0.2s ease;
}

.secondary-fade-enter-from,
.secondary-fade-leave-to {
  opacity: 0;
}
</style>
