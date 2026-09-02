<script setup lang="ts">
import { useMapCleanMode } from '../../lib/composables/useMapCleanMode';

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
  border: 1px solid rgb(44 163 255 / 58%);
  border-radius: 2px;
  background: linear-gradient(180deg, rgb(8 52 99 / 92%), rgb(4 28 61 / 94%));
  box-shadow: 0 0 12px rgb(0 144 255 / 16%);
  color: #ccecff;
  font-family: var(--font-body);
  font-size: 13px;
  cursor: pointer;
  transition:
    border-color 180ms ease,
    background 180ms ease,
    color 180ms ease;
}

.map-clean-mode-trigger:hover {
  border-color: #55c9ff;
  background: linear-gradient(180deg, rgb(12 91 160 / 95%), rgb(5 53 112 / 96%));
  color: #fff;
}

.map-clean-mode-trigger span {
  color: #63d8ff;
  font-size: 15px;
  line-height: 1;
}
</style>
