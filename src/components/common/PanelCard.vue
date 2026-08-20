<script setup lang="ts">
import { computed } from 'vue';
import * as ElementPlusIcons from '@element-plus/icons-vue';

const props = withDefaults(
  defineProps<{
    title?: string;
    icon?: string;
    more?: string;
  }>(),
  { title: '', icon: '', more: '' },
);

const emit = defineEmits<{ (e: 'more'): void }>();

const iconComp = computed(() => {
  if (!props.icon) return null;
  return (ElementPlusIcons as Record<string, unknown>)[props.icon] ?? null;
});
</script>

<template>
  <section class="panel-card glass-panel">
    <header v-if="title" class="panel-card__head">
      <component :is="iconComp" v-if="iconComp" class="panel-card__icon" />
      <h2 class="panel-title panel-card__title">{{ title }}</h2>
      <button v-if="more" type="button" class="panel-more" @click="emit('more')">
        {{ more }}
        <span class="panel-more__arrow">›</span>
      </button>
    </header>
    <div class="panel-card__body">
      <slot />
    </div>
    <span class="panel-card__glow" aria-hidden="true" />
  </section>
</template>

<style scoped>
.panel-card {
  display: flex;
  flex-direction: column;
  position: relative;
}

.panel-card__head {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg) 0;
}

.panel-card__icon {
  color: var(--color-accent);
  font-size: 18px;
}

.panel-card__title {
  flex: 1;
}

.panel-more {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  font-size: 12px;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
}

.panel-more:hover {
  color: var(--color-accent);
}

.panel-more__arrow {
  font-size: 14px;
  line-height: 1;
}

.panel-card__body {
  flex: 1;
  min-height: 0;
  padding: var(--space-md) var(--space-lg) var(--space-lg);
}

/* 底部青色光带（设计稿面板容器底部光带） */
.panel-card__glow {
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
  opacity: 0.55;
  pointer-events: none;
}
</style>
