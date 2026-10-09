<script setup lang="ts">
import { ref } from 'vue';
import { useMapCleanMode } from '../../lib/composables/useMapCleanMode';
import { plantAreaSelectorVisible } from '../../lib/composables/useMapControls';
import { showToast } from '../../lib/composables/useToast';
import PlantAreaSelector from './PlantAreaSelector.vue';
import MapSearchPanel from './MapSearchPanel.vue';

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

const rootRef = ref<HTMLElement | null>(null);

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function timestamp(): string {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(
    d.getMinutes(),
  )}${pad(d.getSeconds())}`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** 大屏截图导出：捕获 Cesium 主画布（preserveDrawingBuffer 已开）为 PNG 下载。 */
function exportScreenShot(): void {
  const root = rootRef.value;
  if (!root) return;
  const canvas =
    (root.querySelector('.cesium-widget canvas') as HTMLCanvasElement | null) ??
    (root.querySelector('canvas') as HTMLCanvasElement | null);
  if (!canvas) {
    showToast('当前视图无可截图的地图画布');
    return;
  }
  canvas.toBlob((blob) => {
    if (!blob) {
      showToast('截图生成失败，请重试');
      return;
    }
    downloadBlob(blob, `大屏截图_${timestamp()}.png`);
    showToast('大屏截图已导出');
  }, 'image/png');
}
</script>

<template>
  <div
    ref="rootRef"
    class="map-page-shell"
    :class="{ 'map-page-shell--clean': cleanMode }"
    :style="{ minWidth }"
  >
    <div class="map-page-shell__overlays">
      <slot name="map" />
    </div>

    <div v-if="$slots.floating" class="map-page-shell__floating">
      <slot name="floating" />
    </div>
    <PlantAreaSelector v-if="plantAreaSelectorVisible" />
    <MapSearchPanel />
    <div class="map-page-shell__ui">
      <slot />
    </div>
    <button
      type="button"
      class="map-page-shell__shot"
      title="导出当前大屏地图截图为 PNG"
      @click="exportScreenShot"
    >
      导出大屏截图
    </button>
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
  z-index: var(--z-chrome);
  pointer-events: none;
}

.map-page-shell__ui {
  position: relative;
  z-index: var(--z-chrome);
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

/* 大屏截图导出按钮：独立于业务侧栏，纯净模式不受影响。 */
.map-page-shell__shot {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: var(--z-chrome);
  pointer-events: auto;
  padding: 8px 14px;
  border: 1px solid var(--border-glow, #2aa9ff);
  border-radius: 4px;
  background: rgb(0 90 150 / 40%);
  color: #eaf6ff;
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
  transition: background 160ms ease;
}

.map-page-shell__shot:hover {
  background: rgb(0 120 200 / 60%);
}
</style>
