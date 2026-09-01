<script setup lang="ts">
import { computed } from 'vue';
import { getAssets, panelAssets, type AccidentRescuePanelVariant } from '@/utils/designAssets';

const props = withDefaults(
  defineProps<{
    title: string;
    variant: AccidentRescuePanelVariant;
    showMore?: boolean;
    titleLeft?: string;
    theme?: 'accident' | 'drill';
  }>(),
  {
    showMore: false,
    titleLeft: '37px',
    theme: 'accident',
  },
);

const panel = computed(() => panelAssets(props.variant, 'accidentRescue'));
const assets = computed(() => getAssets('accidentRescue'));

const contentClass = computed(() => `accident-rescue-panel__content--${props.variant}`);
const titleStyle = computed(() => ({ left: props.titleLeft }));
</script>

<template>
  <section
    class="accident-rescue-panel"
    :class="{ 'accident-rescue-panel--drill': theme === 'drill' }"
  >
    <img class="accident-rescue-panel__body-bg" :src="panel.body" alt="" />
    <img class="accident-rescue-panel__icon" :src="panel.icon" alt="" />
    <h3 class="accident-rescue-panel__title" :style="titleStyle">{{ title }}</h3>
    <a v-if="showMore" class="accident-rescue-panel__more" href="#">
      更多
      <img class="accident-rescue-panel__more-arrow" :src="assets.moreArrow" alt="" />
    </a>
    <div class="accident-rescue-panel__actions">
      <slot name="actions" />
    </div>
    <div class="accident-rescue-panel__content" :class="contentClass">
      <slot />
    </div>
    <img class="accident-rescue-panel__bottom" :src="panel.bottom" alt="" />
  </section>
</template>

<style scoped>
.accident-rescue-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.accident-rescue-panel__body-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.accident-rescue-panel__icon {
  position: absolute;
  left: 13px;
  top: 13px;
  width: 16px;
  height: 16px;
  z-index: 2;
}

.accident-rescue-panel__title {
  position: absolute;
  top: 7px;
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-strong);
  z-index: 2;
  line-height: 1.4;
}

.accident-rescue-panel__more {
  position: absolute;
  right: 14px;
  top: 10px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--color-text-muted);
  text-decoration: none;
}

.accident-rescue-panel--drill .accident-rescue-panel__more {
  color: var(--accent-gold);
}

.accident-rescue-panel__more-arrow {
  width: 12px;
  height: 10px;
}

.accident-rescue-panel__actions {
  position: absolute;
  right: 12px;
  top: 8px;
  z-index: 3;
  display: flex;
  align-items: center;
}

.accident-rescue-panel__content {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.accident-rescue-panel__content--incidentDetail {
  margin-top: 42px;
  padding: 0 13px 14px;
}

.accident-rescue-panel__content--facilityDetail {
  margin-top: 42px;
  padding: 0 13px 14px;
}

.accident-rescue-panel__content--guidance {
  margin-top: 40px;
  padding: 0 13px 12px 14px;
}

.accident-rescue-panel__content--duty {
  margin-top: 40px;
  padding: 0 11px 10px 14px;
}

.accident-rescue-panel__content--auxiliary {
  margin-top: 42px;
  padding: 0 8px 10px 13px;
}

.accident-rescue-panel__content--dynamics {
  margin-top: 42px;
  padding: 0 13px 12px;
}

.accident-rescue-panel__bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: auto;
  max-height: 19px;
  pointer-events: none;
  z-index: 2;
}
</style>
