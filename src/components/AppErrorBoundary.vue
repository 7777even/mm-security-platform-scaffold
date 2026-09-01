<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
import { logger } from '@/utils/logger';

// 视图级错误边界（S1 §5.3）：捕获后代组件渲染/生命周期异常，降级显示而非整页白屏。
// 返回 false 阻止错误继续向父链/全局冒泡（避免未捕获异常），由本边界统一记录并呈现。
const hasError = ref(false);

onErrorCaptured((err) => {
  hasError.value = true;
  logger.error('[error-boundary] 视图渲染异常已降级', err instanceof Error ? err.message : err);
  return false;
});

function reload(): void {
  window.location.reload();
}
</script>

<template>
  <div v-if="hasError" data-test="error-fallback" class="error-fallback">
    <div class="error-fallback__box">
      <p class="error-fallback__title">页面渲染异常</p>
      <p class="error-fallback__desc">当前模块发生未预期错误，请刷新重试；若持续出现请反馈运维。</p>
      <button type="button" class="error-fallback__btn" @click="reload">刷新页面</button>
    </div>
  </div>
  <slot v-else />
</template>

<style scoped>
.error-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--space-lg);
}

.error-fallback__box {
  text-align: center;
  color: var(--color-text);
}

.error-fallback__title {
  font-size: var(--font-title);
  color: var(--color-danger);
  margin: 0 0 var(--space-sm);
}

.error-fallback__desc {
  font-size: var(--font-body);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-lg);
}

.error-fallback__btn {
  padding: 8px 24px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
  background: transparent;
  cursor: pointer;
}
</style>
