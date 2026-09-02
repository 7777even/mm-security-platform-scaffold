<script setup lang="ts">
import { ref } from 'vue';
import WeatherDetailsDialog from './WeatherDetailsDialog.vue';
import { currentWeather } from '../../lib/data/weatherMock';

defineProps<{ icon: string }>();
const open = ref(false);
</script>

<template>
  <button
    type="button"
    class="weather-entry"
    title="查看天气详情"
    aria-label="查看天气详情"
    @click="open = true"
  >
    <img :src="icon" alt="" /><span>{{ currentWeather.temperature }}℃</span
    ><small>{{ currentWeather.condition }}</small
    ><i>›</i>
  </button>
  <WeatherDetailsDialog :open="open" @close="open = false" />
</template>

<style scoped>
.weather-entry {
  height: 38px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 9px;
  border: 1px solid transparent;
  border-radius: 3px;
  background: transparent;
  color: #fff;
  cursor: pointer;
  transition: 0.2s;
}

.weather-entry:hover {
  border-color: rgb(55 190 255 / 35%);
  background: rgb(12 92 145 / 20%);
  box-shadow: 0 0 12px rgb(0 155 255 / 12%);
}

.weather-entry img {
  width: 23px;
  height: 16px;
}

.weather-entry span {
  font-size: 17px;
  white-space: nowrap;
}

.weather-entry small {
  font-size: 12px;
  color: #8db2ca;
  white-space: nowrap;
}

.weather-entry i {
  font-style: normal;
  font-size: 18px;
  color: #5d91b5;
  transform: rotate(90deg);
}
</style>
