<script setup lang="ts">
import { computed } from 'vue';
import { getAssets, type DesignModule } from '../../utils/designAssets';

export type MapMode = 'monitor' | 'preliminary';

const props = withDefaults(
  defineProps<{
    mode: MapMode;
    module?: DesignModule;
    primaryLabel?: string;
    secondaryLabel?: string;
  }>(),
  {
    module: 'production',
    primaryLabel: '安全生产监测',
    secondaryLabel: '前序应急',
  },
);

const emit = defineEmits<{
  'update:mode': [value: MapMode];
}>();

const assets = computed(() => getAssets(props.module));
</script>

<template>
  <div class="map-mode-toggle">
    <button
      type="button"
      class="map-mode-toggle__btn"
      :class="{ 'map-mode-toggle__btn--active': mode === 'monitor' }"
      @click="emit('update:mode', 'monitor')"
    >
      <img
        class="map-mode-toggle__bg"
        :src="mode === 'monitor' ? assets.mapToggleActive : assets.mapToggleInactive"
        alt=""
      />
      <span>{{ primaryLabel }}</span>
    </button>
    <button
      type="button"
      class="map-mode-toggle__btn"
      :class="{ 'map-mode-toggle__btn--active': mode === 'preliminary' }"
      @click="emit('update:mode', 'preliminary')"
    >
      <img
        class="map-mode-toggle__bg"
        :src="mode === 'preliminary' ? assets.mapToggleActive : assets.mapToggleInactive"
        alt=""
      />
      <span>{{ secondaryLabel }}</span>
    </button>
  </div>
</template>

<style scoped>
.map-mode-toggle {
  position: absolute;
  left: 50%;
  top: 109px;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 6;
  pointer-events: auto;
}

.map-mode-toggle__btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 108px;
  height: 38px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.map-mode-toggle__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.map-mode-toggle__btn span {
  position: relative;
  font-size: 14px;
  font-weight: 500;
  color: #4f8dd3;
  white-space: nowrap;
}

.map-mode-toggle__btn--active span {
  color: #fff;
}
</style>
