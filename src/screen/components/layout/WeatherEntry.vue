<script setup lang="ts">
import { onMounted, ref } from 'vue';
import WeatherDetailsDialog from './WeatherDetailsDialog.vue';
import { fetchWeatherOverview, type CurrentWeather } from '@/services/weather';

const open = ref(false);
const currentWeather = ref<CurrentWeather | null>(null);

onMounted(() => {
  fetchWeatherOverview()
    .then((res) => {
      currentWeather.value = res.current;
    })
    .catch(() => {});
});
</script>

<template>
  <button
    v-if="currentWeather"
    type="button"
    class="weather-entry"
    title="查看天气详情"
    aria-label="查看天气详情"
    @click="open = true"
  >
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
      <path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 5.4 10.5 4 4 0 0 0 7 18Z" /></svg
    ><span>{{ currentWeather.temperature }}℃</span><small>{{ currentWeather.condition }}</small
    ><i>›</i>
  </button>
  <span v-else class="weather-entry weather-entry--loading" aria-hidden="true"><i>›</i></span>
  <WeatherDetailsDialog :open="open" @close="open = false" />
</template>

<style scoped>
.weather-entry {
  height: 38px;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0 9px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-strong);
  cursor: pointer;
  transition: 0.2s;
}

.weather-entry:hover {
  border-color: var(--color-accent-glow);
  background: var(--color-accent-soft);
  box-shadow: 0 0 12px var(--color-accent-faint);
}

.weather-entry__icon {
  width: var(--icon-md);
  height: var(--icon-md);
  color: var(--color-accent-2);
  filter: drop-shadow(0 0 4px var(--color-accent-glow));
  flex-shrink: 0;
}

.weather-entry span {
  font-size: var(--font-size-body);
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.weather-entry small {
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.weather-entry i {
  font-style: normal;
  font-size: var(--icon-md);
  color: var(--color-text-muted);
  transform: rotate(90deg);
}

.weather-entry--loading {
  width: 38px;
  border-color: transparent;
  background: transparent;
  box-shadow: none;
  cursor: default;
  animation: none;
}
</style>
