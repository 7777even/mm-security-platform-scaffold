<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import {
  exitSimPreview,
  hideToolbarSignal,
  isNativeViewport,
  simulatedViewport,
  sizePanelOpen,
  toggleSizePanel,
} from '../../utils/viewportSimulator';

const TOOLBAR_HEIGHT = 32;
const TOOLBAR_TRIGGER_HEIGHT = 8;

const hostRef = ref<HTMLElement | null>(null);
const sizeInfoRef = ref<HTMLElement | null>(null);
const scale = ref(1);
const toolbarVisible = ref(true);

const toolbarZoneHeight = computed(() =>
  toolbarVisible.value ? TOOLBAR_HEIGHT : TOOLBAR_TRIGGER_HEIGHT,
);

const designWidth = computed(() => simulatedViewport.value.width ?? 0);
const designHeight = computed(() => simulatedViewport.value.height ?? 0);

const scaledWidth = computed(() => designWidth.value * scale.value);
const scaledHeight = computed(() => designHeight.value * scale.value);

const scaleLabel = computed(() => `${Math.round(scale.value * 100)}%`);

function updateLayout() {
  if (!hostRef.value || isNativeViewport.value) {
    scale.value = 1;
    return;
  }

  const width = designWidth.value;
  const height = designHeight.value;
  if (!width || !height) return;

  const padding = 24;
  const availableWidth = Math.max(hostRef.value.clientWidth - padding * 2, 1);
  const availableHeight = Math.max(hostRef.value.clientHeight - padding * 2, 1);

  scale.value = Math.min(availableWidth / width, availableHeight / height);
}

function syncBodyClass() {
  document.body.classList.toggle('viewport-sim-active', !isNativeViewport.value);
}

function handleSizeInfoClick() {
  toggleSizePanel(sizeInfoRef.value);
}

function handleExitPreview() {
  exitSimPreview();
}

function showToolbar() {
  toolbarVisible.value = true;
}

function hideToolbar(force = false) {
  if (!force && sizePanelOpen.value) return;
  toolbarVisible.value = false;
}

function handleToolbarEnter() {
  showToolbar();
}

function handleToolbarLeave() {
  hideToolbar();
}

let resizeObserver: ResizeObserver | undefined;

function bindObserver() {
  resizeObserver?.disconnect();
  if (!hostRef.value) return;
  resizeObserver = new ResizeObserver(() => updateLayout());
  resizeObserver.observe(hostRef.value);
  updateLayout();
}

onMounted(() => {
  syncBodyClass();
  window.addEventListener('resize', updateLayout);
  nextTick(() => bindObserver());
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  window.removeEventListener('resize', updateLayout);
  document.body.classList.remove('viewport-sim-active');
});

watch(isNativeViewport, (native) => {
  syncBodyClass();
  if (!native) showToolbar();
  nextTick(() => bindObserver());
});

watch(sizePanelOpen, (open) => {
  if (open) showToolbar();
});

watch(hideToolbarSignal, () => {
  hideToolbar(true);
});

watch(simulatedViewport, () => {
  nextTick(() => updateLayout());
});
</script>

<template>
  <div v-if="isNativeViewport" class="viewport-simulator viewport-simulator--native">
    <slot />
  </div>

  <div v-else ref="hostRef" class="viewport-simulator viewport-simulator--sim">
    <div
      class="viewport-simulator__toolbar-zone"
      :style="{ height: `${toolbarZoneHeight}px` }"
      @mouseenter="handleToolbarEnter"
      @mouseleave="handleToolbarLeave"
    >
      <div
        class="viewport-simulator__toolbar"
        :class="{ 'viewport-simulator__toolbar--hidden': !toolbarVisible }"
      >
        <div class="viewport-simulator__toolbar-left">
          <span class="viewport-simulator__tag">尺寸模拟</span>
        </div>

        <button
          ref="sizeInfoRef"
          type="button"
          class="viewport-simulator__size-btn"
          @click.stop="handleSizeInfoClick"
        >
          <span class="viewport-simulator__size">{{ simulatedViewport.label }}</span>
          <span class="viewport-simulator__scale">缩放 {{ scaleLabel }}</span>
        </button>

        <div class="viewport-simulator__toolbar-right">
          <button type="button" class="viewport-simulator__exit" @click="handleExitPreview">
            退出模拟预览
          </button>
        </div>
      </div>
    </div>

    <div class="viewport-simulator__stage">
      <div
        class="viewport-simulator__scaler"
        :style="{ width: `${scaledWidth}px`, height: `${scaledHeight}px` }"
      >
        <div
          class="viewport-simulator__canvas"
          :style="{
            width: `${designWidth}px`,
            height: `${designHeight}px`,
            transform: `scale(${scale})`,
          }"
        >
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.viewport-simulator--native {
  width: 100%;
  height: 100%;
  min-height: 100vh;
}

.viewport-simulator--sim {
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #000a18;
  overflow: hidden;
}

.viewport-simulator__toolbar-zone {
  position: relative;
  flex-shrink: 0;
  z-index: 10;
  transition: height 0.25s ease;
}

.viewport-simulator__toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 32px;
  padding: 0 16px;
  background: rgb(0 35 75 / 95%);
  border-bottom: 1px solid rgb(0 140 220 / 35%);
  font-size: 12px;
  color: #8795b0;
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.viewport-simulator__toolbar--hidden {
  opacity: 0;
  transform: translateY(-100%);
  pointer-events: none;
}

.viewport-simulator__toolbar-left {
  justify-self: start;
}

.viewport-simulator__toolbar-right {
  justify-self: end;
}

.viewport-simulator__tag {
  padding: 2px 8px;
  border-radius: 2px;
  background: rgb(0 180 255 / 15%);
  color: #00b4ff;
}

.viewport-simulator__size-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 2px 10px;
  border: 1px solid transparent;
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
  justify-self: center;
}

.viewport-simulator__size-btn:hover {
  border-color: rgb(0 180 255 / 35%);
  background: rgb(0 70 120 / 35%);
}

.viewport-simulator__size {
  color: #fff;
  font-size: 12px;
}

.viewport-simulator__scale {
  color: #8795b0;
  font-size: 12px;
}

.viewport-simulator__exit {
  padding: 3px 10px;
  border: 1px solid rgb(0 180 255 / 45%);
  border-radius: 3px;
  background: rgb(0 90 150 / 35%);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.viewport-simulator__exit:hover {
  background: rgb(0 120 200 / 50%);
}

.viewport-simulator__stage {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.viewport-simulator__scaler {
  position: relative;
  flex-shrink: 0;
}

.viewport-simulator__canvas {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
  overflow: hidden;
  background: #001630;
  box-shadow:
    0 0 0 1px rgb(0 140 220 / 25%),
    0 12px 40px rgb(0 0 0 / 45%);
}

.viewport-simulator__canvas :deep(> *) {
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
}
</style>
