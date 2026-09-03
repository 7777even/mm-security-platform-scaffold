<script setup lang="ts">
import { useMapCleanMode } from '@/composables/useMapCleanMode';
import PlantAreaSelector from './PlantAreaSelector.vue';

withDefaults(
  defineProps<{
    minWidth?: string;
  }>(),
  {
    minWidth: '1366px',
  },
);

/** 纯净模式仅收起页面两侧业务面板，地图与地图工具栏始终保留。 */
const { cleanMode } = useMapCleanMode();
</script>

<template>
  <div class="map-page-shell" :class="{ 'map-page-shell--clean': cleanMode }" :style="{ minWidth }">
    <div class="map-page-shell__overlays">
      <slot name="map" />
    </div>

    <div v-if="$slots.floating" class="map-page-shell__floating">
      <slot name="floating" />
    </div>
    <PlantAreaSelector />
    <div class="map-page-shell__ui">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.map-page-shell {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
  pointer-events: none;
  font-family: var(--font-body);
}

.map-page-shell__overlays {
  position: absolute;
  inset: 0;
  z-index: var(--z-base);
  pointer-events: none;
}

.map-page-shell__floating {
  position: absolute;
  inset: 0;
  z-index: var(--z-local-6);
  pointer-events: none;
}

.map-page-shell__ui {
  position: relative;
  z-index: var(--z-local-2);
  height: 100%;
  pointer-events: none;
}

/* 所有地图页面共用：纯净模式收起业务侧栏，地图图层与工具栏不受影响。 */
.map-page-shell--clean .map-page-shell__ui :deep(aside) {
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  transform: translateY(-14px) scale(0.98) !important;
  transition:
    opacity 220ms ease,
    transform 220ms ease,
    visibility 0s linear 220ms !important;
}

.map-page-shell__ui :deep(aside) {
  transition:
    opacity 220ms ease,
    transform 220ms ease,
    visibility 0s linear !important;
}
</style>
