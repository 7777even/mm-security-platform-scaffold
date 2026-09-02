<script setup lang="ts">
import SpriteImage from './SpriteImage.vue';
import { rescueIconSprites, type RescueIconKey } from '../../utils/spriteConfig';

defineProps<{
  value: number | string;
  label: string;
  unit?: string;
  iconType: RescueIconKey;
  clickable?: boolean;
}>();

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <div
    class="stat-card"
    :class="{ 'stat-card--clickable': clickable }"
    @click="clickable ? emit('click') : undefined"
  >
    <div class="stat-card__icon-wrap" aria-hidden="true">
      <SpriteImage class="stat-card__icon" :sprite="rescueIconSprites[iconType]" />
    </div>
    <div class="stat-card__content">
      <div class="stat-card__metric">
        <span class="stat-card__value">{{ value }}</span>
        <span v-if="unit" class="stat-card__unit">{{ unit }}</span>
      </div>
      <div class="stat-card__label" :title="label">{{ label }}</div>
    </div>
  </div>
</template>

<style scoped>
.stat-card--clickable {
  cursor: pointer;
}

.stat-card--clickable:hover {
  border-color: rgb(0 180 255 / 45%);
  box-shadow:
    inset 0 0 10px rgb(0 170 255 / 8%),
    0 0 10px rgb(0 150 255 / 12%);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: linear-gradient(180deg, rgb(0 34 66 / 55%), rgb(0 20 42 / 42%));
  border: 1px solid rgb(0 150 240 / 22%);
  border-radius: 2px;
  height: 100%;
  min-height: 0;
  box-shadow: inset 0 0 10px rgb(0 170 255 / 8%);
  box-sizing: border-box;
  overflow: hidden;
}

.stat-card__icon-wrap {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  background: rgb(0 22 48 / 55%);
  border: 1px solid rgb(0 150 240 / 22%);
  overflow: visible; /* 避免图标被裁切 */
}

.stat-card :deep(.stat-card__icon) {
  /* sprite 本身会 overflow:hidden，这里缩放以避免被自身裁切 */
  transform: scale(0.92);
  transform-origin: center;
}

.stat-card__content {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.stat-card__metric {
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-width: 0;
  line-height: 1.1;
}

.stat-card__value {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-card__unit {
  font-size: 13px;
  font-weight: 500;
  color: #c8d4e8;
  white-space: nowrap;
  flex-shrink: 0;
}

.stat-card__label {
  font-size: 13px;
  color: #c8d8ec;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}
</style>
