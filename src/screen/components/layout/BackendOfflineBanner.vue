<script setup lang="ts">
import { computed } from 'vue';
import { backendStatus } from '@/services/backendFallback';

/**
 * 全局后端未连接 / 服务异常横幅。
 *
 * 语义（见 services/backendFallback.ts）：
 * - 未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK → 未连后端，显式报错（横幅）；
 * - 已连后端但请求失败/不符契约 → 部分数据降级为空态，同样横幅提示；
 * - 离线演示（VITE_USE_DEV_MOCK=true）→ 不提示（调用方明确知道没有后端）。
 */
const mode = computed<'offline' | 'degraded' | 'none'>(() => {
  if (!backendStatus.connected && !backendStatus.demo) return 'offline';
  if (backendStatus.unavailable) return 'degraded';
  return 'none';
});

const show = computed(() => mode.value !== 'none');
</script>

<template>
  <div v-if="show" class="backend-banner" :class="`backend-banner--${mode}`" role="alert">
    <span class="backend-banner__icon" aria-hidden="true">!</span>
    <span class="backend-banner__text">
      <template v-if="mode === 'offline'">
        后端未连接：大屏数据不可用。请启动后端并配置 VITE_API_BASE，或设 VITE_USE_DEV_MOCK=true
        进行离线演示。
      </template>
      <template v-else>
        后端服务异常：部分数据加载失败，已降级为空态（待后端恢复后自动刷新）。
      </template>
    </span>
  </div>
</template>

<style scoped>
.backend-banner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-toast, 9999);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 16px;
  font-size: 14px;
  font-family: 'Microsoft YaHei', var(--font-body, sans-serif);
  color: #fff;
  pointer-events: none;
}

.backend-banner--offline {
  background: linear-gradient(90deg, rgb(180 30 30 / 92%), rgb(210 60 40 / 92%));
}

.backend-banner--degraded {
  background: linear-gradient(90deg, rgb(170 110 20 / 92%), rgb(200 150 30 / 92%));
}

.backend-banner__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgb(255 255 255 / 28%);
  font-weight: 700;
  line-height: 1;
}

.backend-banner__text {
  white-space: nowrap;
}
</style>
