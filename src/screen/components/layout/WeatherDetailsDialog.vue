<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  currentWeather,
  dailyWeather,
  hourlyWeather,
  type WeatherMetric,
} from '../../lib/data/weatherMock';

defineProps<{ open: boolean }>();
defineEmits<{ close: [] }>();

const metric = ref<WeatherMetric>('rain');
const metrics: Array<{ key: WeatherMetric; label: string; unit: string }> = [
  { key: 'rain', label: '降水量', unit: 'mm' },
  { key: 'wind', label: '风速', unit: 'm/s' },
  { key: 'temperature', label: '温度', unit: '℃' },
  { key: 'pressure', label: '气压', unit: 'hPa' },
  { key: 'humidity', label: '湿度', unit: '%' },
];

const activeMetric = computed(
  () => metrics.find((item) => item.key === metric.value) ?? metrics[0],
);
const values = computed(() => hourlyWeather.map((item) => item[metric.value]));
const chartPoints = computed(() => {
  const list = values.value;
  const min = Math.min(...list);
  const max = Math.max(...list);
  const span = max - min || 1;
  return list.map((value, index) => ({
    x: 42 + (index * 876) / (list.length - 1),
    y: 142 - ((value - min) / span) * 92,
    value,
  }));
});
const polyline = computed(() =>
  chartPoints.value.map((point) => `${point.x},${point.y}`).join(' '),
);
const weeklyHighPoints = computed(() =>
  dailyWeather.map((item, index) => `${71 + index * 142},${42 + (33 - item.high) * 9}`).join(' '),
);
const weeklyLowPoints = computed(() =>
  dailyWeather.map((item, index) => `${71 + index * 142},${104 + (26 - item.low) * 9}`).join(' '),
);
</script>

<template>
  <Teleport to="body">
    <Transition name="weather-dialog">
      <div
        v-if="open"
        class="weather-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="天气详情"
        @click.self="$emit('close')"
      >
        <section class="weather-dialog__panel">
          <header class="weather-dialog__header">
            <div>
              <h2>天气详情</h2>
              <p>茂名石化全厂区 · 数据更新于 {{ currentWeather.updatedAt }}</p>
            </div>
            <button
              type="button"
              class="weather-dialog__close"
              aria-label="关闭天气详情"
              @click="$emit('close')"
            >
              ×
            </button>
          </header>

          <div class="weather-current">
            <div class="weather-current__main">
              <span class="weather-current__icon">⛅</span>
              <strong>{{ currentWeather.temperature }}<small>℃</small></strong>
              <div>
                <b>{{ currentWeather.condition }}</b
                ><span>体感温度 31℃</span>
              </div>
            </div>
            <div class="air-quality">
              <strong>{{ currentWeather.airQuality }}</strong
              ><span>空气质量 {{ currentWeather.airQualityLevel }}</span>
            </div>
            <dl class="weather-current__metrics">
              <div>
                <dt>风向风速</dt>
                <dd>{{ currentWeather.windDirection }} {{ currentWeather.windSpeed }}</dd>
              </div>
              <div>
                <dt>相对湿度</dt>
                <dd>{{ currentWeather.humidity }}</dd>
              </div>
              <div>
                <dt>气压</dt>
                <dd>{{ currentWeather.pressure }}</dd>
              </div>
              <div>
                <dt>能见度</dt>
                <dd>{{ currentWeather.visibility }}</dd>
              </div>
              <div>
                <dt>当前降水</dt>
                <dd>{{ currentWeather.rainfall }}</dd>
              </div>
            </dl>
          </div>

          <section class="forecast-card hourly-card">
            <div class="forecast-card__title">
              <div>
                <h3>24小时预报</h3>
                <span>{{ activeMetric.label }}趋势 · 单位 {{ activeMetric.unit }}</span>
              </div>
              <div class="metric-tabs">
                <button
                  v-for="item in metrics"
                  :key="item.key"
                  type="button"
                  :class="{ active: metric === item.key }"
                  @click="metric = item.key"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>
            <div class="hourly-chart">
              <svg viewBox="0 0 960 180" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="weatherArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#14c8ff" stop-opacity=".32" />
                    <stop offset="1" stop-color="#14c8ff" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <g class="grid">
                  <line v-for="y in [50, 80, 110, 142]" :key="y" x1="42" :y1="y" x2="918" :y2="y" />
                </g>
                <polygon :points="`42,154 ${polyline} 918,154`" fill="url(#weatherArea)" />
                <polyline
                  :points="polyline"
                  fill="none"
                  stroke="#28cfff"
                  stroke-width="3"
                  vector-effect="non-scaling-stroke"
                />
                <g v-for="point in chartPoints" :key="point.x">
                  <circle :cx="point.x" :cy="point.y" r="4" />
                  <text :x="point.x" :y="point.y - 11">{{ point.value }}</text>
                </g>
              </svg>
              <div class="hourly-chart__labels">
                <span v-for="item in hourlyWeather" :key="item.time">{{ item.time }}</span>
              </div>
            </div>
          </section>

          <section class="forecast-card weekly-card">
            <div class="forecast-card__title">
              <div>
                <h3>7天预报</h3>
                <span>温度、降水概率与风况</span>
              </div>
              <span class="safety-tip">未来48小时有雷雨过程，请关注室外作业安全</span>
            </div>
            <div class="weekly-forecast">
              <div class="daily-list">
                <article
                  v-for="(item, index) in dailyWeather"
                  :key="item.date"
                  class="daily-item"
                  :class="{ 'daily-item--alert': index === 1 || index === 2 }"
                >
                  <span class="daily-item__day">{{ item.day }}</span
                  ><time>{{ item.date }}</time
                  ><b>{{ item.condition }}</b
                  ><span class="daily-item__icon">{{ item.icon }}</span>
                  <div class="daily-item__chart-space"></div>
                  <span class="daily-item__wind">{{ item.wind }}</span>
                  <span
                    >湿度 <strong class="humidity">{{ item.humidity }}</strong> %</span
                  >
                  <span
                    >降水量 <strong class="rain">{{ item.rain.toFixed(1) }}</strong> mm</span
                  >
                </article>
              </div>
              <svg
                class="weekly-temperature-chart"
                viewBox="0 0 994 150"
                preserveAspectRatio="none"
                aria-label="未来七天最高和最低温度趋势"
              >
                <polyline
                  :points="weeklyHighPoints"
                  fill="none"
                  stroke="#ffb21a"
                  stroke-width="3"
                  vector-effect="non-scaling-stroke"
                />
                <polyline
                  :points="weeklyLowPoints"
                  fill="none"
                  stroke="#159bff"
                  stroke-width="3"
                  vector-effect="non-scaling-stroke"
                />
                <g v-for="(item, index) in dailyWeather" :key="item.date">
                  <circle
                    :cx="71 + index * 142"
                    :cy="42 + (33 - item.high) * 9"
                    r="5"
                    class="high-dot"
                  />
                  <text :x="71 + index * 142" :y="30 + (33 - item.high) * 9" class="high-label">
                    {{ item.high }}℃
                  </text>
                  <circle
                    :cx="71 + index * 142"
                    :cy="104 + (26 - item.low) * 9"
                    r="5"
                    class="low-dot"
                  />
                  <text :x="71 + index * 142" :y="125 + (26 - item.low) * 9" class="low-label">
                    {{ item.low }}℃
                  </text>
                </g>
              </svg>
            </div>
          </section>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.weather-dialog {
  position: fixed;
  inset: 0;
  z-index: 10020;
  display: grid;
  place-items: center;
  background: rgb(0 8 20 / 76%);
  backdrop-filter: blur(6px);
  font-family: 'Microsoft YaHei', sans-serif;
  color: #dceeff;
}

.weather-dialog__panel {
  width: min(1320px, 92vw);
  height: min(850px, 88vh);
  box-sizing: border-box;
  padding: 0 24px 24px;
  border: 1px solid rgb(32 198 255 / 66%);
  background: linear-gradient(145deg, rgb(4 27 53 / 98%), rgb(1 15 34 / 99%));
  box-shadow: 0 0 36px rgb(0 157 255 / 30%);
  overflow: auto;
}

.weather-dialog__header {
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgb(54 169 225 / 28%);
}

h2,
h3,
p {
  margin: 0;
}

.weather-dialog__header h2 {
  font-size: 26px;
}

.weather-dialog__header p {
  margin-top: 5px;
  font-size: 13px;
  color: #7197b5;
}

.weather-dialog__close {
  width: 40px;
  height: 40px;
  border: 1px solid rgb(76 188 241 / 35%);
  background: var(--map-ctrl-bg);
  color: var(--map-accent-soft-text);
  font-size: 32px;
  line-height: 32px;
  cursor: pointer;
}

.weather-current {
  display: grid;
  grid-template-columns: 280px 120px 1fr;
  gap: 28px;
  align-items: center;
  min-height: 136px;
}

.weather-current__main {
  display: flex;
  align-items: center;
  gap: 15px;
}

.weather-current__icon {
  font-size: 52px;
  filter: drop-shadow(0 0 10px rgb(89 207 255 / 45%));
}

.weather-current__main strong {
  font-size: 54px;
  line-height: 1;
}

.weather-current__main small {
  font-size: 24px;
  font-weight: 400;
}

.weather-current__main div {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.weather-current__main b {
  font-size: 20px;
}

.weather-current__main span {
  font-size: 12px;
  color: #789bb7;
}

.air-quality {
  height: 62px;
  border-left: 3px solid #62dc87;
  background: rgb(65 183 99 / 10%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 16px;
}

.air-quality strong {
  font-size: 24px;
  color: #67e190;
}

.air-quality span {
  font-size: 12px;
  color: var(--map-air-green-text);
}

.weather-current__metrics {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin: 0;
}

.weather-current__metrics div {
  padding: 12px;
  border-left: 1px solid rgb(54 169 225 / 28%);
}

dt {
  font-size: 12px;
  color: #6f96b7;
}

dd {
  margin: 7px 0 0;
  font-size: 16px;
  color: var(--color-text-strong);
}

.forecast-card {
  border: 1px solid rgb(42 155 214 / 36%);
  background: rgb(4 25 49 / 72%);
  margin-bottom: 18px;
}

.forecast-card__title {
  height: 58px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgb(42 155 214 / 25%);
}

.forecast-card__title h3 {
  font-size: 20px;
}

.forecast-card__title span {
  font-size: 12px;
  color: #6f99b9;
}

.metric-tabs {
  display: flex;
}

.metric-tabs button {
  height: 32px;
  padding: 0 16px;
  border: 1px solid var(--map-ctrl-line);
  border-right: 0;
  background: #082442;
  color: #80bada;
  cursor: pointer;
}

.metric-tabs button:last-child {
  border-right: 1px solid var(--map-ctrl-line);
}

.metric-tabs button.active {
  background: linear-gradient(#087fd1, #0964aa);
  color: var(--color-text-strong);
}

.hourly-chart {
  height: 205px;
  padding: 8px 18px 0;
}

.hourly-chart svg {
  width: 100%;
  height: 166px;
}

.grid line {
  stroke: rgb(95 157 194 / 18%);
  stroke-width: 1;
}

.hourly-chart circle {
  fill: var(--map-chart-dot-bg);
  stroke: #49d5ff;
  stroke-width: 3;
}

.hourly-chart text {
  fill: #9fe8ff;
  font-size: 12px;
  text-anchor: middle;
}

.hourly-chart__labels {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  padding: 0 1.2%;
  color: #7097b5;
  font-size: 12px;
  text-align: center;
}

.safety-tip {
  color: #ffbd56 !important;
  padding: 7px 12px;
  border: 1px solid rgb(255 166 48 / 32%);
  background: rgb(255 143 21 / 8%);
}

.daily-list {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 12px;
}

.daily-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 6px;
  border-right: 1px solid rgb(45 143 196 / 18%);
  font-size: 12px;
  color: #89aac2;
}

.daily-item:last-child {
  border-right: 0;
}

.daily-item--alert {
  background: linear-gradient(rgb(255 151 40 / 10%), transparent);
}

.daily-item__day {
  font-size: 15px;
  color: var(--color-text-strong);
}

.daily-item time {
  color: #638ba9;
}

.daily-item__icon {
  font-size: 30px;
  margin: 2px 0;
}

.daily-item b {
  font-size: 14px;
  color: #ddecf6;
}

.temperature strong {
  font-size: 20px;
  color: #ffb24d;
}

.temperature span {
  color: #72d5ff;
}

.rain {
  color: #52c8f2;
}

.weather-dialog-enter-active,
.weather-dialog-leave-active {
  transition: opacity 0.2s;
}

.weather-dialog-enter-from,
.weather-dialog-leave-to {
  opacity: 0;
}

.weather-dialog__panel {
  height: auto;
  max-height: 88vh;
}

.weekly-forecast {
  position: relative;
  padding: 14px;
}

.weekly-forecast .daily-list {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  padding: 0;
}

.weekly-forecast .daily-item {
  min-height: 302px;
  box-sizing: border-box;
  gap: 4px;
  padding: 13px 8px 11px;
  border: 1px solid rgb(44 198 220 / 16%);
  border-radius: 4px;
  background: linear-gradient(180deg, rgb(16 113 127 / 38%), rgb(5 59 78 / 22%));
  color: #c0dce7;
}

.weekly-forecast .daily-item--alert {
  border-color: rgb(255 169 48 / 28%);
  background: linear-gradient(180deg, rgb(18 116 128 / 42%), rgb(98 68 22 / 18%));
}

.weekly-forecast .daily-item__day {
  font-size: 12px;
  color: #75a8bc;
}

.weekly-forecast .daily-item time {
  font-size: 16px;
  color: var(--color-text-strong);
}

.weekly-forecast .daily-item b {
  font-size: 16px;
  color: var(--map-week-teal);
}

.weekly-forecast .daily-item__icon {
  font-size: 34px;
  margin: 1px 0 0;
}

.daily-item__chart-space {
  height: 125px;
}

.daily-item__wind {
  font-size: 14px;
  color: var(--color-text-strong);
}

.humidity {
  font-size: 20px;
  font-weight: 500;
  color: #3fe6d0;
}

.weekly-forecast .rain {
  font-size: 17px;
  font-weight: 500;
  color: #45dec9;
}

.weekly-temperature-chart {
  position: absolute;
  z-index: 2;
  left: 14px;
  right: 14px;
  top: 105px;
  width: calc(100% - 28px);
  height: 150px;
  overflow: visible;
  pointer-events: none;
}

.weekly-temperature-chart text {
  font-size: 12px;
  text-anchor: middle;
  font-weight: 600;
}

.weekly-temperature-chart .high-label {
  fill: #ffd36d;
}

.weekly-temperature-chart .low-label {
  fill: #8ad7ff;
}

.weekly-temperature-chart .high-dot {
  fill: var(--color-text-strong);
  stroke: var(--map-chart-line-gold);
  stroke-width: 3;
}

.weekly-temperature-chart .low-dot {
  fill: var(--color-text-strong);
  stroke: var(--map-chart-line-blue);
  stroke-width: 3;
}

.weekly-forecast .daily-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
