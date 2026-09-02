<script setup lang="ts">
import { computed } from 'vue';
import {
  panelAssets,
  type DesignModule,
  type PreliminaryPanelVariant,
} from '../../utils/designAssets';

const props = withDefaults(
  defineProps<{
    title: string;
    variant: PreliminaryPanelVariant;
    module?: Extract<DesignModule, 'preliminary' | 'fireEmergency'>;
  }>(),
  { module: 'preliminary' },
);

const panel = computed(() => panelAssets(props.variant, props.module));

/** 设计稿内容区偏移：duty +14/+40，rescue +13/+42，knowledge +13/+44 */
const contentClass = computed(() => `preliminary-panel__content--${props.variant}`);
</script>

<template>
  <section class="preliminary-panel">
    <img class="preliminary-panel__body-bg" :src="panel.body" alt="" />
    <img class="preliminary-panel__icon" :src="panel.icon" alt="" />
    <h3 class="preliminary-panel__title">{{ title }}</h3>
    <div class="preliminary-panel__content" :class="contentClass">
      <slot />
    </div>
    <img class="preliminary-panel__bottom" :src="panel.bottom" alt="" />
  </section>
</template>

<style scoped>
.preliminary-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.preliminary-panel__body-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.preliminary-panel__icon {
  position: absolute;
  left: 13px;
  top: 13px;
  width: 16px;
  height: 16px;
  z-index: 2;
}

.preliminary-panel__title {
  position: absolute;
  left: 37px;
  top: 7px;
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-strong);
  z-index: 2;
  line-height: 1.4;
}

.preliminary-panel__content {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.preliminary-panel__content--duty {
  margin-top: 40px;
  padding: 0 11px 10px 14px;
}

.preliminary-panel__content--rescue {
  margin-top: 42px;
  padding: 0 8px 10px 13px;
}

.preliminary-panel__content--knowledge {
  margin-top: 44px;
  padding: 0 13px 10px;
}

.preliminary-panel__bottom {
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
