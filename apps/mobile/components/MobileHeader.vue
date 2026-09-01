<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'brand' | 'back';
    title: string;
    subtitle?: string;
    navTo?: string;
    backTo?: string;
  }>(),
  {
    variant: 'brand',
    subtitle: '',
    navTo: '/tasks',
    backTo: '/messages',
  },
);
</script>

<template>
  <header class="mb-header" :class="`mb-header--${variant}`">
    <template v-if="variant === 'back'">
      <RouterLink :to="backTo" class="mb-header__back" aria-label="返回">‹</RouterLink>
      <h1 class="mb-header__title mb-header__title--center">{{ title }}</h1>
    </template>

    <template v-else>
      <div class="mb-header__brand">
        <h1 class="mb-header__title">{{ title }}</h1>
        <p v-if="subtitle" class="mb-header__sub">{{ subtitle }}</p>
      </div>
      <RouterLink v-if="navTo" :to="navTo" class="mb-header__nav" aria-label="导航">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
        导航
      </RouterLink>
    </template>
  </header>
</template>

<style scoped>
.mb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  /* 头部高度统一：以品牌头两行（标题+副标题）为基准；
     单行标题（如「我的」）借 align-items:center 在头内垂直居中，各页头部高度一致 */
  line-height: 1.3;
  min-height: calc(var(--mb-fz-page) * 1.3 + var(--space-xs) + var(--mb-fz-help) * 1.3);
  margin: calc(-1 * (var(--mb-pad-x) + env(safe-area-inset-top))) calc(-1 * var(--mb-pad-x))
    var(--space-md);
  padding: calc(var(--space-sm) + env(safe-area-inset-top)) var(--mb-pad-x) var(--space-sm);
  background: var(--card-mobile);
  border-bottom: var(--mb-border-w) solid var(--mb-stroke);
}

.mb-header__brand {
  display: flex;
  flex-direction: column;
}

.mb-header__title {
  margin: 0;
  font-size: var(--mb-fz-page);
  font-weight: 700;
  color: var(--text-title-mobile);
}

.mb-header__title--center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-weight: 600;
}

.mb-header__sub {
  margin: var(--space-xs) 0 0;
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}

.mb-header__nav {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-height: var(--mb-row-h);
  font-size: var(--mb-fz-form-label);
  color: var(--primary-mobile);
  text-decoration: none;
}

.mb-header__nav svg {
  width: var(--mb-ico-md);
  height: var(--mb-ico-md);
}

.mb-header__back {
  position: absolute;
  left: var(--mb-pad-x);
  display: inline-flex;
  align-items: center;
  min-height: var(--mb-row-h);
  font-size: var(--mb-fz-hero);
  line-height: 1;
  color: var(--text-title-mobile);
  text-decoration: none;
}

.mb-header--back {
  position: relative;
  justify-content: flex-start;
}
</style>
