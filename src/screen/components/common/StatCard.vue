<script setup lang="ts">
import { computed } from 'vue';
import { UserFilled, Box, Avatar, Van } from '@element-plus/icons-vue';

export type RescueIconKey = 'squad' | 'person' | 'vehicle' | 'equipment';

const RESCUE_ICONS: Record<RescueIconKey, typeof UserFilled> = {
  squad: Avatar,
  person: UserFilled,
  vehicle: Van,
  equipment: Box,
};

const props = defineProps<{
  value: number | string;
  label: string;
  unit?: string;
  iconType: RescueIconKey;
  clickable?: boolean;
}>();

const IconComp = computed(() => RESCUE_ICONS[props.iconType]);

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
      <span class="stat-card__icon">
        <component :is="IconComp" />
      </span>
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
  border-color: var(--border-glow);
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
  border: 1px solid var(--stat-card-border);
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
  background: var(--stat-card-icon-bg);
  border: 1px solid var(--stat-card-border);
  overflow: visible;
}

.stat-card__icon {
  display: inline-flex;
  width: 24px;
  height: 24px;
  color: var(--color-accent);
}

.stat-card__icon :deep(svg) {
  width: 100%;
  height: 100%;
  fill: currentcolor;
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
  color: var(--color-text-strong);
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
