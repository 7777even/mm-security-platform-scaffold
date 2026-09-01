<script setup lang="ts">
// WeatherEntry — 顶部天气入口（图标 + 温度）
// 数据为占位：与壳层 AppLayout 的天气占位一致，待接入气象服务后热替换。
defineProps<{
  icon: string;
}>();

const temp = 14;
const desc = '多云';
</script>

<template>
  <div class="weather-entry" :title="desc" aria-label="天气">
    <img class="weather-entry__icon" :src="icon" alt="" />
    <span class="weather-entry__temp">{{ temp }}°C</span>
  </div>
</template>

<style scoped>
.weather-entry {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.weather-entry__icon {
  width: var(--icon-lg);
  height: var(--icon-md);
  object-fit: contain;
  flex-shrink: 0;
}

.weather-entry__temp {
  font-size: var(--font-size-body);
  color: var(--color-text-strong);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
</style>
