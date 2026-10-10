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
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-height: 88rpx;
  padding: var(--space-md) var(--mb-pad-x);
  background: var(--mb-hero-bg);
  color: var(--mb-hero-fg);
}

.mb-header__back {
  width: 56rpx;
  height: 56rpx;
  font-size: 48rpx;
  line-height: 1;
  color: #fff;
  background: transparent;
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
</style>
