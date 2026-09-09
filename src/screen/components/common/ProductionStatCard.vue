<script setup lang="ts">
import type { StatOverviewItem } from '@/services/production';

defineProps<{
  stat: StatOverviewItem;
}>();
</script>

<template>
  <div class="stat-card">
    <div class="stat-card__icon" :class="`stat-card__icon--${stat.iconIndex}`" />
    <div class="stat-card__body">
      <div class="stat-card__label">{{ stat.label }}</div>
      <div class="stat-card__value-row">
        <span class="stat-card__value">{{ stat.value }}</span>
        <span v-if="stat.unit" class="stat-card__suffix">{{ stat.unit }}</span>
        <span v-else class="stat-card__arrow">↑</span>
      </div>
      <div class="stat-card__trend">
        <span class="stat-card__trend-label">今日同比</span>
        <span
          class="stat-card__trend-value"
          :class="stat.trendUp ? 'stat-card__trend-value--up' : 'stat-card__trend-value--down'"
        >
          {{ stat.trendUp ? '↑' : '↓' }}{{ stat.trend }}%
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
  padding: 0 14px;
  box-sizing: border-box;
}

.stat-card__icon {
  flex-shrink: 0;
  background-repeat: no-repeat;
}

/* 报警总数 — 调 width/height、background-size、background-position */
.stat-card__icon--0 {
  width: 76px;
  height: 76px;
  background-image: url('/design/%E7%94%9F%E4%BA%A7%E5%BA%94%E6%80%A5%E7%9B%91%E6%B5%8B_image_0017.png');
  background-size: 1438px 117px;
  background-position: -27px -18px;
}

/* 未处置告警 */
.stat-card__icon--1 {
  width: 76px;
  height: 76px;
  background-image: url('/design/%E7%94%9F%E4%BA%A7%E5%BA%94%E6%80%A5%E7%9B%91%E6%B5%8B_image_0017.png');
  background-size: 1438px 117px;
  background-position: -287px -18px;
  border-radius: 100%;
}

/* 已处置告警 */
.stat-card__icon--2 {
  width: 76px;
  height: 76px;
  background-image: url('/design/%E7%94%9F%E4%BA%A7%E5%BA%94%E6%80%A5%E7%9B%91%E6%B5%8B_image_0017.png');
  background-size: 1438px 117px;
  background-position: -567px -18px;
  border-radius: 100%;
}

/* 处置中告警 */
.stat-card__icon--3 {
  width: 76px;
  height: 76px;
  background-image: url('/design/%E7%94%9F%E4%BA%A7%E5%BA%94%E6%80%A5%E7%9B%91%E6%B5%8B_image_0017.png');
  background-size: 1438px 117px;
  background-position: -841px -18px;
  border-radius: 100%;
}

/* 平均处置时长 */
.stat-card__icon--4 {
  width: 76px;
  height: 76px;
  background-image: url('/design/%E7%94%9F%E4%BA%A7%E5%BA%94%E6%80%A5%E7%9B%91%E6%B5%8B_image_0017.png');
  background-size: 1438px 117px;
  background-position: -1110px -18px;
  border-radius: 100%;
}

.stat-card__body {
  min-width: 0;
  flex: 1;
}

.stat-card__label {
  font-size: 13px;
  color: var(--color-text);
  line-height: 1.2;
}

.stat-card__value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 2px;
}

.stat-card__value {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-accent-bright);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.stat-card__suffix {
  font-size: 16px;
  color: var(--color-accent-bright);
  font-weight: 700;
  white-space: nowrap;
}

.stat-card__arrow {
  font-size: 12px;
  color: rgb(255 255 255 / 55%);
}

.stat-card__trend {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 12px;
}

.stat-card__trend-label {
  color: var(--color-text-muted);
}

.stat-card__trend-value--up {
  color: var(--color-danger);
}

.stat-card__trend-value--down {
  color: var(--color-success);
}
</style>
