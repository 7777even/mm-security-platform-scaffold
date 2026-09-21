<script setup lang="ts">
import { useMapCleanMode } from '../../lib/composables/useMapCleanMode';

const { cleanMode, toggleCleanMode } = useMapCleanMode();
</script>

<template>
  <button
    type="button"
    class="map-clean-mode-trigger"
    :class="{ 'map-clean-mode-trigger--clean': cleanMode }"
    :title="cleanMode ? '切换至总览模式' : '切换至纯净模式'"
    :aria-pressed="cleanMode"
    @click="toggleCleanMode"
  >
    <!-- 版式图标：外框=地图，中列=地图本体，左右两列=两侧业务面板（纯净模式下隐去两侧，与其余工具栏按钮图标同风格） -->
    <svg class="map-clean-mode-trigger__icon" viewBox="0 0 16 16" aria-hidden="true">
      <rect
        x="1.5"
        y="2.5"
        width="13"
        height="11"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.2"
      />
      <rect x="6.7" y="4.4" width="2.6" height="7.2" rx="0.5" fill="currentColor" />
      <rect
        v-if="!cleanMode"
        x="3.2"
        y="4.4"
        width="2.4"
        height="7.2"
        rx="0.5"
        fill="currentColor"
      />
      <rect
        v-if="!cleanMode"
        x="10.4"
        y="4.4"
        width="2.4"
        height="7.2"
        rx="0.5"
        fill="currentColor"
      />
    </svg>
    {{ cleanMode ? '总览模式' : '纯净模式' }}
  </button>
</template>

<style scoped>
.map-clean-mode-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 104px;
  min-height: 36px;
  margin-top: 1px;
  border: 1px solid var(--map-clean-btn-border);
  border-radius: 3px;
  background: var(--map-clean-btn-bg);
  box-shadow: 0 0 10px var(--map-clean-btn-glow);
  color: var(--map-clean-btn-fg);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  transition:
    border-color 180ms ease,
    background 180ms ease,
    color 180ms ease;
}

.map-clean-mode-trigger:hover {
  border-color: var(--map-clean-btn-border-hover);
  background: var(--map-clean-btn-bg-hover);
  color: var(--color-text-strong);
}

.map-clean-mode-trigger__icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: var(--map-clean-btn-icon);
}
</style>
