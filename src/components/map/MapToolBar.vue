<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  zoomInSharedMap,
  zoomOutSharedMap,
  restoreSharedMapModuleView,
  toggleSharedMapSceneMode,
  getSharedMapSceneMode,
} from '@/composables/sharedCesiumBridge';
import { toggleMapLayerPanel } from '@/composables/useMapLayerPanel';

/** 三维视角按钮激活态：本地维护，点击即翻转为 UI 意图；地图异步 morph 完成 */
const is3D = ref(true);

onMounted(() => {
  const mode = getSharedMapSceneMode();
  if (mode) is3D.value = mode !== '2D';
});

function onZoomIn() {
  zoomInSharedMap();
}

function onZoomOut() {
  zoomOutSharedMap();
}

function onResetView() {
  void restoreSharedMapModuleView();
}

function onDefaultView() {
  // 默认视角：当前复用底座复位（模块默认视角），后端区分后替换
  void restoreSharedMapModuleView();
}

function onLayers() {
  toggleMapLayerPanel();
}

function onToggleScene() {
  toggleSharedMapSceneMode();
  is3D.value = !is3D.value;
}

function onPlaceholder(name: string) {
  ElMessage.warning(`${name}敬请期待`);
}
</script>

<template>
  <div class="maptool" role="toolbar" aria-label="地图工具栏">
    <button type="button" class="maptool__btn" title="放大" aria-label="放大" @click="onZoomIn">
      <svg viewBox="0 0 24 24" class="maptool__icon" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
      <span class="maptool__label">放大</span>
    </button>

    <button type="button" class="maptool__btn" title="缩小" aria-label="缩小" @click="onZoomOut">
      <svg viewBox="0 0 24 24" class="maptool__icon" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
      <span class="maptool__label">缩小</span>
    </button>

    <button
      type="button"
      class="maptool__btn"
      title="视图复位"
      aria-label="视图复位"
      @click="onResetView"
    >
      <svg viewBox="0 0 24 24" class="maptool__icon" aria-hidden="true">
        <circle cx="12" cy="12" r="7" />
        <line x1="12" y1="1" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="1" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="23" y2="12" />
      </svg>
      <span class="maptool__label">视图复位</span>
    </button>

    <button
      type="button"
      class="maptool__btn is-placeholder"
      title="区域框选（敬请期待）"
      aria-label="区域框选"
      @click="onPlaceholder('区域框选')"
    >
      <svg viewBox="0 0 24 24" class="maptool__icon" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" stroke-dasharray="3 3" />
      </svg>
      <span class="maptool__label">区域框选</span>
    </button>

    <button
      type="button"
      class="maptool__btn is-placeholder"
      title="智能检索（敬请期待）"
      aria-label="智能检索"
      @click="onPlaceholder('智能检索')"
    >
      <svg viewBox="0 0 24 24" class="maptool__icon" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <line x1="16" y1="16" x2="21" y2="21" />
      </svg>
      <span class="maptool__label">智能检索</span>
    </button>

    <button
      type="button"
      class="maptool__btn"
      :class="{ 'is-active': !is3D }"
      :title="is3D ? '切换到二维' : '切换到三维'"
      :aria-label="is3D ? '切换到二维' : '切换到三维'"
      @click="onToggleScene"
    >
      <svg viewBox="0 0 24 24" class="maptool__icon" aria-hidden="true">
        <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" />
        <path d="M3 7l9 5 9-5" />
        <line x1="12" y1="12" x2="12" y2="22" />
      </svg>
      <span class="maptool__label">3D 视角</span>
    </button>

    <button
      type="button"
      class="maptool__btn is-placeholder"
      title="热力模式（敬请期待）"
      aria-label="热力模式"
      @click="onPlaceholder('热力模式')"
    >
      <svg viewBox="0 0 24 24" class="maptool__icon" aria-hidden="true">
        <rect x="4" y="4" width="7" height="7" />
        <rect x="13" y="4" width="7" height="7" />
        <rect x="4" y="13" width="7" height="7" />
        <rect x="13" y="13" width="7" height="7" />
      </svg>
      <span class="maptool__label">热力模式</span>
    </button>

    <button
      type="button"
      class="maptool__btn"
      title="默认视角"
      aria-label="默认视角"
      @click="onDefaultView"
    >
      <svg viewBox="0 0 24 24" class="maptool__icon" aria-hidden="true">
        <path d="M3 11 12 4 21 11" />
        <path d="M5 10v9h14v-9" />
      </svg>
      <span class="maptool__label">默认视角</span>
    </button>

    <button
      type="button"
      class="maptool__btn"
      title="图层切换"
      aria-label="图层切换"
      @click="onLayers"
    >
      <svg viewBox="0 0 24 24" class="maptool__icon" aria-hidden="true">
        <path d="M12 3 3 8l9 5 9-5-9-5Z" />
        <path d="M3 13l9 5 9-5" />
      </svg>
      <span class="maptool__label">图层切换</span>
    </button>
  </div>
</template>

<style scoped>
.maptool {
  position: absolute;

  /* 竖状贴右侧顶部，且避让 419px 右侧面板（right + gap），不与之重叠 */
  top: var(--space-lg);
  right: calc(var(--layout-aside-w) + var(--space-md) + var(--space-lg));
  z-index: var(--z-chrome);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--map-tool-gap);
  width: max-content;
  padding: var(--space-md) var(--space-sm);
  background: var(--map-tool-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  box-shadow: 0 0 16px var(--color-accent-glow);
  backdrop-filter: blur(6px);
}

.maptool__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: var(--map-tool-btn-size);
  height: var(--map-tool-btn-size);
  padding: 0;
  color: var(--color-accent-2);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.maptool__btn:hover {
  color: var(--color-accent-bright);
  border-color: var(--border-glow);
  box-shadow: 0 0 8px var(--color-accent-glow);
}

.maptool__btn.is-active {
  color: var(--color-accent-bright);
  border-color: var(--border-glow);
  background: var(--color-accent-soft);
}

.maptool__btn.is-placeholder {
  opacity: 0.5;
  cursor: not-allowed;
}

.maptool__btn.is-placeholder:hover {
  color: var(--color-accent-2);
  border-color: transparent;
  box-shadow: none;
}

.maptool__icon {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentcolor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.maptool__label {
  font-size: 11px;
  line-height: 1;
  white-space: nowrap;
}
</style>
