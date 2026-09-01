<script setup lang="ts">
// UserMenuDropdown — 顶部用户下拉面板（个人中心 / 退出登录）
// 脚手架阶段为占位交互：仅展示菜单并在点击后收起，不触发真实登出流程。
// 关闭判定由父级 document click 统一处理（配合 defineExpose 的 panelEl）。
import { ref } from 'vue';

defineProps<{
  open: boolean;
  anchorEl: HTMLElement | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const panelEl = ref<HTMLElement | null>(null);

defineExpose({ panelEl });

const menuItems = [
  { key: 'profile', label: '个人中心' },
  { key: 'logout', label: '退出登录' },
];

function handleItemClick() {
  emit('close');
}
</script>

<template>
  <Transition name="user-menu">
    <div v-if="open" ref="panelEl" class="user-menu" role="menu">
      <button
        v-for="item in menuItems"
        :key="item.key"
        type="button"
        class="user-menu__item"
        role="menuitem"
        @click="handleItemClick"
      >
        {{ item.label }}
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.user-menu {
  position: absolute;
  top: calc(100% + var(--space-sm));
  right: 0;
  z-index: var(--z-overlay);
  min-width: 120px;
  padding: var(--space-xs) 0;
  background: var(--color-panel);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  box-shadow: 0 8px 24px rgb(0 0 0 / 45%);
}

.user-menu__item {
  display: block;
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: var(--font-size-body);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
}

.user-menu__item:hover {
  background: var(--color-accent-soft);
  color: var(--color-text-strong);
}

.user-menu-enter-active,
.user-menu-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.user-menu-enter-from,
.user-menu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
