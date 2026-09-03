<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  open: boolean;
  vehiclePlate?: string;
  vehicleType?: string;
  timeRange?: string;
  playing: boolean;
  speed: number;
  /** 0~1，与地图轨迹进度同步 */
  progress: number;
}>();

const emit = defineEmits<{
  close: [];
  'update:playing': [value: boolean];
  'update:speed': [value: number];
}>();

const tabs = [
  { key: 'track', label: '轨迹监控' },
  { key: 'video', label: '实时视频点' },
  { key: 'info', label: '行车信息' },
] as const;

type TabKey = (typeof tabs)[number]['key'];
const activeTab = ref<TabKey>('track');

const plateText = computed(() => props.vehiclePlate || '粤PV1527');
const vehicleTypeText = computed(() => props.vehicleType || '救援车辆');
const rangeText = computed(() => props.timeRange || '2026-03-22 11:37:29 - 2026-03-22 14:08:14');

const progressPercent = computed(() => Math.max(0, Math.min(100, (props.progress ?? 0) * 100)));

const speedOptions = [
  { label: '1倍速', value: 1 },
  { label: '2倍速', value: 2 },
  { label: '5倍速', value: 5 },
  { label: '10倍速', value: 10 },
  { label: '15倍速', value: 15 },
  { label: '20倍速', value: 20 },
] as const;
</script>

<template>
  <Transition name="rr-scene">
    <div v-if="open" class="rr-scene" aria-label="救援路线场景" role="region">
      <section class="rr-scene__right">
        <header class="rr-card__head">
          <div class="rr-card__title">轨迹信息</div>
          <button type="button" class="rr-card__close" @click="emit('close')">×</button>
        </header>

        <div class="rr-tabs">
          <button
            v-for="t in tabs"
            :key="t.key"
            type="button"
            class="rr-tab"
            :class="{ 'rr-tab--active': activeTab === t.key }"
            @click="activeTab = t.key"
          >
            {{ t.label }}
          </button>
        </div>

        <div class="rr-body ar-scroll">
          <div v-if="activeTab === 'track'" class="rr-block">
            <div class="rr-block__title">车辆</div>
            <div class="rr-kv">
              <div class="rr-k">车牌号码</div>
              <div class="rr-v">{{ plateText }}</div>
            </div>
            <div class="rr-kv">
              <div class="rr-k">回放区间</div>
              <div class="rr-v">{{ rangeText }}</div>
            </div>
          </div>

          <div v-else-if="activeTab === 'video'" class="rr-block">
            <div class="rr-block__title">视频点位</div>
            <div class="rr-muted">此处接入视频点位列表/缩略图（待接真实数据）。</div>
          </div>

          <div v-else class="rr-block">
            <div class="rr-block__title">行车信息</div>
            <div class="rr-muted">此处展示速度、里程、停留等信息（待接真实数据）。</div>
          </div>
        </div>
      </section>

      <!-- 底部回放控件：绝对定位，不参与布局，不遮挡右侧面板 -->
      <div class="rr-bottom" aria-label="回放控件">
        <div class="rr-row rr-row--top">
          <div class="rr-top__left">
            <span class="rr-plate">{{ plateText }} · {{ vehicleTypeText }}</span>
            <span class="rr-range">{{ rangeText }}</span>
          </div>
          <div class="rr-top__right">
            <button type="button" class="rr-top-btn rr-top-btn--active">轨迹回放</button>
            <button type="button" class="rr-top-btn">实时监控</button>
          </div>
        </div>

        <div class="rr-row rr-row--bottom">
          <button
            type="button"
            class="rr-play-icon"
            :class="{ 'rr-play-icon--pause': props.playing }"
            :aria-label="props.playing ? '暂停回放' : '开始回放'"
            title="播放/暂停"
            @click="emit('update:playing', !props.playing)"
          />

          <span class="rr-bottom-range">{{ rangeText }}</span>

          <div
            class="rr-progress"
            role="progressbar"
            :aria-valuenow="progressPercent"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <span class="rr-progress__track" />
            <span class="rr-progress__bar" :style="{ width: `${progressPercent}%` }" />
            <span class="rr-progress__dot" :style="{ left: `calc(${progressPercent}% - 5px)` }" />
          </div>

          <div class="rr-speeds" role="group" aria-label="回放倍速">
            <button
              v-for="opt in speedOptions"
              :key="opt.value"
              type="button"
              class="rr-speed-btn"
              :class="{ 'rr-speed-btn--active': props.speed === opt.value }"
              @click="emit('update:speed', opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.rr-scene {
  position: absolute;
  inset: calc(var(--header-height, 105px) + 18px) 18px 18px;

  /* 场景层不拦截地图操作，仅右侧/底部控件可交互 */
  pointer-events: none;
}

.rr-bottom {
  position: absolute;
  left: 18px;

  /* 预留右侧面板宽度 + 间距，避免遮挡 */
  right: calc(18px + 420px + 14px);
  bottom: 18px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgb(0 150 236 / 22%);
  background: rgb(0 18 40 / 42%);
  backdrop-filter: blur(6px);
  pointer-events: auto;
  z-index: var(--z-overlay);
}

.rr-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.rr-row--top {
  padding-bottom: 10px;
}

.rr-row--bottom {
  border-top: 1px solid rgb(0 110 190 / 22%);
  padding-top: 10px;
  align-items: center;
  justify-content: flex-start;
}

.rr-top__left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.rr-top__right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rr-top-btn {
  height: 28px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgb(0 110 190 / 24%);
  background: rgb(0 22 48 / 62%);
  color: rgb(232 242 252 / 90%);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.rr-top-btn--active {
  border-color: rgb(0 150 236 / 55%);
  background: rgb(0 150 236 / 16%);
  color: rgb(255 255 255 / 95%);
}

.rr-plate {
  display: inline-flex;
  align-items: center;
  height: 24px;
  width: fit-content;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgb(0 150 236 / 26%);
  background: rgb(0 22 48 / 68%);
  color: rgb(255 255 255 / 95%);
  font-size: 12px;
}

.rr-range {
  color: rgb(232 242 252 / 88%);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rr-play-icon {
  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: 999px;
  border: 1px solid rgb(0 150 236 / 35%);
  background: rgb(0 22 48 / 72%);
  cursor: pointer;
  position: relative;
  flex: 0 0 auto;
}

.rr-play-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  margin: auto;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 10px solid rgb(255 255 255 / 92%);
  transform: translateX(1px);
}

.rr-play-icon--pause::before {
  border: none;
  width: 10px;
  height: 12px;
  background: linear-gradient(
    90deg,
    rgb(255 255 255 / 92%) 0%,
    rgb(255 255 255 / 92%) 40%,
    transparent 40%,
    transparent 60%,
    rgb(255 255 255 / 92%) 60%,
    rgb(255 255 255 / 92%) 100%
  );
  transform: none;
}

.rr-bottom-range {
  font-size: 12px;
  color: rgb(232 242 252 / 90%);
  white-space: nowrap;
  flex: 0 0 auto;
}

.rr-progress {
  position: relative;
  height: 10px;
  flex: 1;
  min-width: 260px;
  display: flex;
  align-items: center;
}

.rr-progress__track {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: rgb(0 150 236 / 18%);
}

.rr-progress__bar {
  position: absolute;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, rgb(0 150 236 / 95%), rgb(0 150 236 / 45%));
  transition: width 0.12s linear;
}

.rr-progress__dot {
  position: absolute;
  top: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgb(255 214 74 / 95%);
  box-shadow: 0 0 14px rgb(255 214 74 / 35%);
  transition: left 0.12s linear;
}

.rr-speeds {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-left: auto;
}

.rr-speed-btn {
  height: 26px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: rgb(232 242 252 / 90%);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.rr-speed-btn:hover {
  color: rgb(255 255 255 / 95%);
}

.rr-speed-btn--active {
  border-color: rgb(0 150 236 / 55%);
  background: rgb(0 150 236 / 12%);
  color: rgb(255 255 255 / 95%);
}

.rr-exit {
  height: 34px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgb(0 150 236 / 30%);
  background: rgb(0 0 0 / 12%);
  color: rgb(255 255 255 / 90%);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.rr-exit:hover {
  border-color: rgb(0 150 236 / 50%);
  background: rgb(0 150 236 / 8%);
}

.rr-scene__right {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 420px;
  height: 100%;
  border-radius: 10px;
  border: 1px solid rgb(0 150 236 / 32%);
  background: linear-gradient(180deg, rgb(10 28 58 / 92%), rgb(4 16 34 / 90%));
  box-shadow: 0 16px 40px rgb(0 0 0 / 42%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}

.rr-card__head {
  min-height: 42px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgb(0 110 190 / 22%);
  background: rgb(0 18 40 / 60%);
}

.rr-card__title {
  font-size: 14px;
  color: rgb(255 255 255 / 94%);
}

.rr-card__close {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid rgb(0 150 236 / 30%);
  background: rgb(0 0 0 / 12%);
  color: rgb(255 255 255 / 90%);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.rr-tabs {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  border-bottom: 1px solid rgb(0 110 190 / 18%);
}

.rr-tab {
  height: 34px;
  border: none;
  border-right: 1px solid rgb(0 110 190 / 16%);
  background: rgb(0 22 48 / 62%);
  color: rgb(168 184 204 / 96%);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.rr-tab:last-child {
  border-right: none;
}

.rr-tab--active {
  background: rgb(0 150 236 / 16%);
  color: rgb(255 255 255 / 95%);
}

.rr-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
}

.rr-block {
  border-radius: 10px;
  border: 1px solid rgb(0 110 190 / 18%);
  background: rgb(0 18 40 / 38%);
  padding: 10px 12px;
}

.rr-block__title {
  font-size: 12px;
  color: rgb(126 200 255 / 90%);
  margin-bottom: 10px;
}

.rr-kv {
  display: grid;
  grid-template-columns: 68px 1fr;
  gap: 10px;
  font-size: 12px;
  padding: 6px 0;
  border-bottom: 1px solid rgb(0 80 140 / 14%);
}

.rr-kv:last-child {
  border-bottom: none;
}

.rr-k {
  color: rgb(168 184 204 / 95%);
}

.rr-v {
  color: rgb(232 242 252 / 92%);
}

.rr-muted {
  font-size: 12px;
  color: rgb(168 184 204 / 92%);
  line-height: 1.45;
}

.rr-scene-enter-active,
.rr-scene-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.rr-scene-enter-from,
.rr-scene-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
