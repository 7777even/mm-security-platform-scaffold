<script setup lang="ts">
import { back } from '@/platform/nav';

defineProps<{
  variant?: 'brand' | 'back';
  title: string;
  subtitle?: string;
}>();

function onBack(): void {
  back();
}
</script>

<template>
  <header class="mb-header" :class="variant === 'back' ? 'mb-header--back' : 'mb-header--brand'">
    <button
      v-if="variant === 'back'"
      type="button"
      class="mb-header__back"
      aria-label="返回"
      @click="onBack"
    >
      ‹
    </button>
    <div class="mb-header__titles">
      <p class="mb-header__title">{{ title }}</p>
      <p v-if="subtitle" class="mb-header__subtitle">{{ subtitle }}</p>
    </div>
  </header>
</template>

<style scoped>
.mb-header {
  position: relative;
  display: flex;
  align-items: center;

  /* 与迁移前一致：顶部预留安全区，避开系统状态栏（时钟/电池），回退按钮不再压在状态栏上 */
  min-height: calc(var(--mb-row-h) + env(safe-area-inset-top));
  padding: calc(var(--space-md) + env(safe-area-inset-top)) var(--mb-pad-x) var(--space-md);
  background: var(--mb-hero-bg);
  color: var(--mb-hero-fg);
}

.mb-header__back {
  position: absolute;
  left: var(--mb-pad-x);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--mb-row-h);
  padding: 0;
  margin: 0;
  font-size: 48rpx;
  line-height: 1;
  color: #fff;
  background: transparent;
  border: none;
  border-radius: 0;
}

/* uni-button 组件的默认描边由 ::after 绘制，须显式清除（与迁移前的 RouterLink 无框一致） */
.mb-header__back::after {
  border: none;
}

.mb-header__titles {
  display: flex;
  flex-direction: column;
}

.mb-header__title {
  margin: 0;
  font-size: var(--mb-fz-section);
  font-weight: 700;
}

.mb-header__subtitle {
  margin: 0;
  font-size: var(--mb-fz-tip);
  opacity: 0.9;
}

/* 返回页：标题绝对居中（与迁移前一致），回退按钮独立于左；副标题居中置于标题下 */
.mb-header--back .mb-header__titles {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: var(--mb-row-h);
}

/* 品牌页（无回退按钮）：标题左对齐占满剩余宽度 */
.mb-header--brand .mb-header__titles {
  flex: 1;
}
</style>
