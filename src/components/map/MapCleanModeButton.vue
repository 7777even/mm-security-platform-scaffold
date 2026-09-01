<script setup lang="ts">
import { useMapCleanMode } from '@/composables/useMapCleanMode';

const { cleanMode, toggleCleanMode } = useMapCleanMode();
</script>

<template>
  <button
    type="button"
    class="map-clean-mode-trigger"
    :title="cleanMode ? '切换至总览模式' : '切换至纯净模式'"
    @click="toggleCleanMode"
  >
    <span aria-hidden="true">{{ cleanMode ? '▣' : '▤' }}</span>
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
  min-height: 39px;
  margin-top: 1px;
  border: 1px solid var(--map-clean-btn-border);
  border-radius: 2px;
  background: var(--map-clean-btn-bg);
  box-shadow: 0 0 12px var(--map-clean-btn-glow);
  color: var(--map-clean-btn-fg);
  font-family: var(--font-body);
  font-size: 13px;
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

.map-clean-mode-trigger span {
  color: var(--map-clean-btn-icon);
  font-size: 15px;
  line-height: 1;
}
</style>
