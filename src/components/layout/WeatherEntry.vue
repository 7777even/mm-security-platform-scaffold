<script setup lang="ts">
// WeatherEntry — 顶部天气入口（图标 + 温度）
// 图标与主界面 AppLayout 的天气占位同款（accent-2 + 辉光）；数据为占位，待接入气象服务后热替换。
const temp = 14;
const desc = '多云';
</script>

<template>
  <div class="weather-entry" :title="desc" aria-label="天气">
    <svg
      class="weather-entry__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 5.4 10.5 4 4 0 0 0 7 18Z" />
    </svg>
    <span class="weather-entry__temp">
      <span class="weather-entry__num">{{ temp }}</span
      ><span class="weather-entry__deg">°C</span>
    </span>
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
  width: var(--icon-md);
  height: var(--icon-md);
  color: var(--color-accent-2);
  filter: drop-shadow(0 0 4px var(--color-accent-glow));
  flex-shrink: 0;
}

.weather-entry__temp {
  display: inline-flex;
  align-items: baseline;
  font-family: var(--font-family-num);
  font-size: var(--font-size-body);
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.weather-entry__deg {
  font-family: var(--font-family-base);
  font-weight: 400;
  margin-left: 1px;
  color: var(--color-text-muted);
}
</style>
