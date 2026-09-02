<script setup lang="ts">
import { computed } from 'vue';
import { panelAssets, type DesignModule, type PanelVariant } from '../../utils/designAssets';

const props = withDefaults(
  defineProps<{
    title: string;
    variant: PanelVariant;
    module?: DesignModule;
    showMore?: boolean;
    hideIcon?: boolean;
  }>(),
  { module: 'fire', hideIcon: false },
);

const panel = computed(() => panelAssets(props.variant, props.module));

const emit = defineEmits<{
  more: [];
}>();
</script>

<template>
  <section class="panel-card">
    <header class="panel-card__header">
      <img class="panel-card__header-bg" :src="panel.header" alt="" />
      <img v-if="!hideIcon" class="panel-card__icon" :src="panel.icon" alt="" />
      <div class="panel-card__title-area">
        <slot name="title">
          <h3 v-if="title" class="panel-card__title">{{ title }}</h3>
        </slot>
      </div>
      <div v-if="$slots['header-extra']" class="panel-card__header-extra">
        <slot name="header-extra" />
      </div>
      <a v-if="showMore !== false" class="panel-card__more" href="#" @click.prevent="emit('more')">
        更多
        <img class="panel-card__more-arrow" :src="panel.more" alt="" />
      </a>
    </header>
    <div class="panel-card__body">
      <img class="panel-card__body-bg" :src="panel.body" alt="" />
      <div class="panel-card__content">
        <slot />
      </div>
      <img class="panel-card__bottom" :src="panel.bottom" alt="" />
    </div>
  </section>
</template>

<style scoped>
.panel-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.panel-card__header {
  position: relative;
  height: 42.5px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 13px;
}

.panel-card__header-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.panel-card__icon {
  position: relative;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  flex-shrink: 0;
}

.panel-card__title-area {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.panel-card__title {
  position: relative;
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
}

.panel-card__header-extra {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
}

.panel-card__header :slotted(a),
.panel-card__header :slotted(button) {
  position: relative;
  z-index: 1;
}

.panel-card__more {
  position: relative;
  z-index: 1;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  text-decoration: none;
}

.panel-card__more-arrow {
  width: 12px;
  height: 10px;
}

.panel-card__body {
  position: relative;
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
}

.panel-card__body-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.panel-card__content {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  padding: 8px 14px 16px;
  overflow: auto;
}

.panel-card__content::-webkit-scrollbar {
  width: 4px;
}

.panel-card__content::-webkit-scrollbar-thumb {
  background: rgb(0 140 220 / 30%);
  border-radius: 2px;
}

.panel-card__bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: auto;
  max-height: 16px;
  pointer-events: none;
  z-index: 2;
}
</style>
