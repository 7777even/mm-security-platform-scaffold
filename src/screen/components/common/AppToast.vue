<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { toastMessage, showToast } from '../../lib/composables/useToast';
import { subscribeGlobalToast } from '@/services/globalToast';

// 全局错误兜底展示：http 拦截器推送的全局 toast（globalToast）经此转发到
// 大屏既有 toast 渲染通道；组件卸载时退订，防止监听器泄漏。
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  unsubscribe = subscribeGlobalToast((toast) => {
    showToast(toast.message);
  });
});

onUnmounted(() => {
  unsubscribe?.();
  unsubscribe = null;
});
</script>

<template>
  <Teleport to="body">
    <Transition name="app-toast">
      <div v-if="toastMessage" class="app-toast" role="status">
        {{ toastMessage }}
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.app-toast {
  position: fixed;
  left: 50%;
  bottom: 96px;
  z-index: var(--z-toast);
  transform: translateX(-50%);
  max-width: 560px;
  padding: 12px 22px;
  border: 1px solid rgb(0 180 255 / 50%);
  border-radius: 4px;
  background: rgb(0 22 48 / 94%);
  color: #e8f4ff;
  font-size: 14px;
  font-family: var(--font-body);
  box-shadow: 0 8px 24px rgb(0 0 0 / 35%);
  text-align: center;
  pointer-events: none;
  white-space: nowrap;
}

.app-toast-enter-active,
.app-toast-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.app-toast-enter-from,
.app-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
