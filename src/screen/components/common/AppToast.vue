<script setup lang="ts">
import { toastMessage } from '../../lib/composables/useToast';
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
  z-index: 3000;
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
