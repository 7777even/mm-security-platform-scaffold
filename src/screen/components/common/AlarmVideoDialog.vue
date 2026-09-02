<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { AlarmItem } from '../../lib/data/mock';
import fireScene from '../../assets/semantic-scenes/fire-alarm-pipe-rack.png';
import gasScene from '../../assets/semantic-scenes/production-gas-leak.png';
import perimeterScene from '../../assets/semantic-scenes/security-perimeter-intrusion.png';

const props = withDefaults(
  defineProps<{ open: boolean; alarm: AlarmItem; initialCamera?: number }>(),
  {
    initialCamera: 0,
  },
);
const emit = defineEmits<{ close: [] }>();

type VideoMode = 'playback' | 'live';

const mode = ref<VideoMode>('playback');
const playing = ref(true);
const muted = ref(true);
const fullscreen = ref(false);
const progress = ref(50);
const speed = ref(1);
const activeCamera = ref(0);
const snapshotTip = ref(false);
let timer: number | undefined;

const sceneByAlarm = computed(() => {
  if (/GDS|气体|浓度/i.test(props.alarm.alarmType)) return gasScene;
  if (/视频|AI/i.test(props.alarm.alarmType)) return perimeterScene;
  return fireScene;
});

const cameras = computed(() => [
  {
    id: props.alarm.onsiteMonitorId,
    name: props.alarm.onsiteMonitorLabel,
    image: sceneByAlarm.value,
    position: '0% 0%',
  },
  {
    id: props.alarm.monitorId,
    name: props.alarm.monitorLabel,
    image: sceneByAlarm.value,
    position: '50% 0%',
  },
  {
    id: `${props.alarm.monitorId}-overview`,
    name: `${props.alarm.location}全景`,
    image: sceneByAlarm.value,
    position: '100% 100%',
  },
]);

const eventTime = computed(() => {
  const parsed = new Date(props.alarm.time.replace(/\//g, '-'));
  return Number.isNaN(parsed.getTime()) ? new Date('2026-03-17T14:21:30') : parsed;
});

const startTime = computed(() => new Date(eventTime.value.getTime() - 5 * 60 * 1000));
const endTime = computed(() => new Date(eventTime.value.getTime() + 5 * 60 * 1000));
const currentTime = computed(() => {
  if (mode.value === 'live') return new Date('2026-08-27T16:31:24');
  return new Date(startTime.value.getTime() + (progress.value / 100) * 10 * 60 * 1000);
});

function formatClock(date: Date) {
  return date.toLocaleTimeString('zh-CN', { hour12: false });
}

function formatDateTime(date: Date) {
  const datePart = date.toLocaleDateString('zh-CN').replace(/\//g, '-');
  return `${datePart} ${formatClock(date)}`;
}

function changeMode(next: VideoMode) {
  mode.value = next;
  playing.value = true;
  if (next === 'playback') progress.value = 50;
}

function takeSnapshot() {
  snapshotTip.value = true;
  window.setTimeout(() => {
    snapshotTip.value = false;
  }, 1400);
}

function cycleSpeed() {
  speed.value = speed.value === 1 ? 2 : speed.value === 2 ? 0.5 : 1;
}

function startTimer() {
  window.clearInterval(timer);
  timer = window.setInterval(() => {
    if (!props.open || !playing.value || mode.value !== 'playback') return;
    progress.value = Math.min(100, progress.value + speed.value / 6);
    if (progress.value >= 100) playing.value = false;
  }, 1000);
}

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    mode.value = 'playback';
    playing.value = true;
    fullscreen.value = false;
    progress.value = 50;
    speed.value = 1;
    activeCamera.value = Math.max(0, Math.min(cameras.value.length - 1, props.initialCamera));
    startTimer();
  },
);

onBeforeUnmount(() => window.clearInterval(timer));
</script>

<template>
  <Teleport to="body">
    <Transition name="alarm-video-dialog">
      <div
        v-if="open"
        class="alarm-video"
        role="dialog"
        aria-modal="true"
        aria-label="告警关联视频"
      >
        <button
          type="button"
          class="alarm-video__mask"
          aria-label="关闭告警视频"
          @click="emit('close')"
        />
        <section class="alarm-video__panel" :class="{ 'is-fullscreen': fullscreen }">
          <header class="alarm-video__header">
            <div class="alarm-video__title">
              <span class="alarm-video__title-icon">▶</span>
              <div>
                <strong>告警关联视频</strong><small>{{ alarm.title }} · {{ alarm.location }}</small>
              </div>
            </div>
            <div class="alarm-video__mode">
              <button :class="{ active: mode === 'playback' }" @click="changeMode('playback')">
                告警回放
              </button>
              <button :class="{ active: mode === 'live' }" @click="changeMode('live')">
                实时画面
              </button>
            </div>
            <button
              type="button"
              class="alarm-video__close"
              aria-label="关闭"
              @click="emit('close')"
            >
              ×
            </button>
          </header>

          <div class="alarm-video__body">
            <main class="alarm-video__main">
              <div class="alarm-video__viewport" :class="{ paused: !playing }">
                <div
                  class="alarm-video__scene"
                  :style="{
                    backgroundImage: `url(${cameras[activeCamera].image})`,
                    backgroundPosition: cameras[activeCamera].position,
                  }"
                />
                <div class="alarm-video__scan" />
                <div class="alarm-video__osd alarm-video__osd--left">
                  <b>{{ cameras[activeCamera].name }}</b
                  ><span>{{ cameras[activeCamera].id }}</span>
                </div>
                <div class="alarm-video__osd alarm-video__osd--right">
                  <time>{{ formatDateTime(currentTime) }}</time>
                  <span :class="mode"><i />{{ mode === 'playback' ? 'PLAYBACK' : 'LIVE' }}</span>
                </div>
                <div v-if="mode === 'playback'" class="alarm-video__target">
                  <span>告警目标</span>
                </div>
                <div v-if="!playing" class="alarm-video__paused">Ⅱ 已暂停</div>
                <div v-if="snapshotTip" class="alarm-video__toast">✓ 告警画面已抓拍存档</div>
              </div>

              <div v-if="mode === 'playback'" class="alarm-video__timeline">
                <div class="alarm-video__timeline-head">
                  <span>{{ formatClock(startTime) }}</span
                  ><b>告警前后各 5 分钟</b><span>{{ formatClock(endTime) }}</span>
                </div>
                <div class="alarm-video__range">
                  <input
                    v-model.number="progress"
                    type="range"
                    min="0"
                    max="100"
                    step=".1"
                    aria-label="告警视频时间轴"
                  />
                  <span class="alarm-video__event"><i />告警发生 {{ formatClock(eventTime) }}</span>
                </div>
              </div>
              <div v-else class="alarm-video__live-tip"><i /> 正在查看告警点位实时画面</div>

              <div class="alarm-video__controls">
                <button @click="playing = !playing">{{ playing ? 'Ⅱ 暂停' : '▶ 播放' }}</button>
                <button @click="muted = !muted">{{ muted ? '🔇 静音' : '🔊 声音' }}</button>
                <button @click="takeSnapshot">▣ 抓拍</button>
                <button v-if="mode === 'playback'" @click="cycleSpeed">{{ speed }}× 倍速</button>
                <button @click="fullscreen = !fullscreen">
                  {{ fullscreen ? '退出全屏' : '⛶ 全屏' }}
                </button>
              </div>
            </main>

            <aside class="alarm-video__side">
              <section class="alarm-video__alarm-info">
                <div class="side-title">
                  <strong>告警信息</strong><span>{{ alarm.status }}</span>
                </div>
                <dl>
                  <div>
                    <dt>告警类型</dt>
                    <dd>{{ alarm.alarmType }}</dd>
                  </div>
                  <div>
                    <dt>发生位置</dt>
                    <dd>{{ alarm.location }}</dd>
                  </div>
                  <div>
                    <dt>发生时间</dt>
                    <dd>{{ alarm.time }}</dd>
                  </div>
                  <div>
                    <dt>告警来源</dt>
                    <dd>{{ alarm.source }}</dd>
                  </div>
                </dl>
                <p>{{ alarm.description }}</p>
              </section>

              <section class="alarm-video__cameras">
                <div class="side-title">
                  <strong>关联摄像头</strong><span>{{ cameras.length }} 路在线</span>
                </div>
                <button
                  v-for="(camera, index) in cameras"
                  :key="camera.id"
                  :class="{ active: activeCamera === index }"
                  @click="activeCamera = index"
                >
                  <span
                    class="camera-thumb"
                    :style="{
                      backgroundImage: `url(${camera.image})`,
                      backgroundPosition: camera.position,
                    }"
                    ><i>●</i></span
                  >
                  <span
                    ><b>{{ camera.name }}</b
                    ><small>{{ camera.id }}</small></span
                  >
                  <em>›</em>
                </button>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.alarm-video {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: grid;
  place-items: center;
  font-family: var(--font-body, sans-serif);
  color: #eaf7ff;
}

.alarm-video__mask {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgb(0 6 16 / 82%);
  backdrop-filter: blur(6px);
}

.alarm-video__panel {
  position: relative;
  width: min(1220px, calc(100vw - 72px));
  height: min(740px, calc(100vh - 60px));
  overflow: hidden;
  border: 1px solid rgb(30 181 255 / 72%);
  border-radius: 6px;
  background: linear-gradient(145deg, rgb(3 29 53 / 99%), rgb(1 12 28 / 99%));
  box-shadow:
    0 24px 90px rgb(0 0 0 / 76%),
    0 0 30px rgb(0 143 220 / 18%),
    inset 0 0 42px rgb(0 102 174 / 7%);
}

.alarm-video__panel.is-fullscreen {
  width: calc(100vw - 18px);
  height: calc(100vh - 18px);
}

.alarm-video__header {
  height: 62px;
  display: grid;
  grid-template-columns: 1fr auto 44px;
  align-items: center;
  gap: 18px;
  padding: 0 15px 0 20px;
  border-bottom: 1px solid rgb(0 141 218 / 36%);
  background: linear-gradient(90deg, rgb(0 100 168 / 24%), transparent 65%);
}

.alarm-video__title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alarm-video__title-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid rgb(255 92 92 / 58%);
  border-radius: 50%;
  background: rgb(177 35 45 / 28%);
  color: var(--color-danger);
  font-size: 13px;
  box-shadow: 0 0 12px rgb(255 67 76 / 20%);
}

.alarm-video__title strong,
.alarm-video__title small {
  display: block;
}

.alarm-video__title strong {
  font-size: 17px;
  letter-spacing: 1px;
}

.alarm-video__title small {
  margin-top: 3px;
  color: #87a9c1;
  font-size: 11px;
}

.alarm-video__mode {
  display: flex;
  padding: 3px;
  border: 1px solid rgb(0 133 207 / 32%);
  border-radius: 4px;
  background: rgb(0 25 49 / 65%);
}

.alarm-video__mode button {
  height: 27px;
  padding: 0 14px;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: #799bb2;
  font: 11px var(--font-body);
  cursor: pointer;
}

.alarm-video__mode button.active {
  background: rgb(0 143 210 / 36%);
  color: #64d9ff;
  box-shadow: inset 0 0 8px var(--color-accent-soft);
}

.alarm-video__close {
  width: 38px;
  height: 38px;
  border: 0;
  background: transparent;
  color: #d6e9f5;
  font-size: 28px;
  cursor: pointer;
}

.alarm-video__body {
  height: calc(100% - 62px);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 15px;
  padding: 15px;
  box-sizing: border-box;
}

.alarm-video__main {
  min-width: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) 62px 42px;
}

.alarm-video__viewport {
  position: relative;
  overflow: hidden;
  border: 1px solid rgb(0 133 207 / 46%);
  background: #020b14;
}

.alarm-video__scene {
  position: absolute;
  inset: 0;
  background-size: 300% 200%;
  background-repeat: no-repeat;
  filter: contrast(1.06) saturate(0.9);
  transition:
    background-position 0.25s ease,
    filter 0.2s ease;
}

.alarm-video__viewport.paused .alarm-video__scene {
  filter: contrast(1.03) saturate(0.72) brightness(0.62);
}

.alarm-video__scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.24;
  background: repeating-linear-gradient(transparent 0 3px, rgb(0 0 0 / 24%) 4px);
}

.alarm-video__osd {
  position: absolute;
  top: 12px;
  z-index: var(--z-chrome);
  color: var(--color-text-strong);
  text-shadow: 0 1px 4px #000;
}

.alarm-video__osd--left {
  left: 14px;
}

.alarm-video__osd--left b,
.alarm-video__osd--left span {
  display: block;
}

.alarm-video__osd--left b {
  font-size: 13px;
}

.alarm-video__osd--left span {
  margin-top: 3px;
  color: #b2c6d2;
  font: 10px monospace;
}

.alarm-video__osd--right {
  right: 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  font: 11px monospace;
}

.alarm-video__osd--right span {
  padding: 2px 5px;
  border-radius: 2px;
  background: rgb(0 0 0 / 52%);
}

.alarm-video__osd--right span i {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 5px;
  border-radius: 50%;
  background: var(--color-warning);
  box-shadow: 0 0 6px var(--color-warning);
}

.alarm-video__osd--right span.live i {
  background: var(--color-danger);
  box-shadow: 0 0 6px var(--color-danger);
  animation: live-blink 1.4s infinite;
}

.alarm-video__target {
  position: absolute;
  left: 51%;
  top: 38%;
  width: 25%;
  height: 29%;
  border: 1px solid var(--color-danger);
  box-shadow:
    0 0 10px rgb(255 55 65 / 28%),
    inset 0 0 10px rgb(255 55 65 / 10%);
}

.alarm-video__target span {
  position: absolute;
  top: -20px;
  left: -1px;
  padding: 2px 6px;
  background: var(--color-danger);
  color: var(--color-text-strong);
  font-size: 10px;
}

.alarm-video__paused,
.alarm-video__toast {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: var(--z-chrome);
  transform: translate(-50%, -50%);
  padding: 10px 17px;
  border: 1px solid rgb(74 194 255 / 42%);
  border-radius: 3px;
  background: rgb(0 14 31 / 84%);
}

.alarm-video__toast {
  top: 18%;
  border-color: rgb(63 235 168 / 48%);
  color: var(--color-success);
}

.alarm-video__timeline {
  padding: 7px 3px 0;
}

.alarm-video__timeline-head {
  display: flex;
  justify-content: space-between;
  color: #718fa4;
  font-size: 10px;
}

.alarm-video__timeline-head b {
  color: #86aabd;
  font-weight: 400;
}

.alarm-video__range {
  position: relative;
  height: 30px;
  margin-top: 5px;
}

.alarm-video__range input {
  position: absolute;
  inset: 0;
  width: 100%;
  margin: 0;
  accent-color: #25bdff;
  cursor: pointer;
}

.alarm-video__event {
  position: absolute;
  left: 50%;
  top: 16px;
  transform: translateX(-50%);
  color: var(--color-danger);
  font-size: 9px;
  pointer-events: none;
  white-space: nowrap;
}

.alarm-video__event i {
  position: absolute;
  left: 50%;
  bottom: 13px;
  width: 2px;
  height: 17px;
  background: var(--color-danger);
  box-shadow: 0 0 7px rgb(255 70 80 / 70%);
}

.alarm-video__live-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-success);
  font-size: 11px;
}

.alarm-video__live-tip i {
  width: 7px;
  height: 7px;
  margin-right: 6px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 8px var(--color-success);
}

.alarm-video__controls {
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid rgb(0 125 194 / 18%);
}

.alarm-video__controls button {
  height: 29px;
  padding: 0 12px;
  border: 1px solid rgb(25 149 217 / 40%);
  border-radius: 3px;
  background: rgb(0 67 111 / 26%);
  color: #d9f2ff;
  font: 11px var(--font-body);
  cursor: pointer;
}

.alarm-video__controls button:last-child {
  margin-left: auto;
}

.alarm-video__side {
  min-height: 0;
  overflow-y: auto;
  padding: 13px;
  border: 1px solid rgb(0 128 202 / 30%);
  background: rgb(0 19 40 / 72%);
}

.alarm-video__side section + section {
  margin-top: 18px;
}

.side-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 9px;
  border-bottom: 1px solid rgb(0 129 202 / 24%);
}

.side-title strong {
  color: #8bd9ff;
  font-size: 13px;
}

.side-title span {
  color: var(--color-danger);
  font-size: 10px;
}

.alarm-video__cameras .side-title span {
  color: var(--color-success);
}

.alarm-video__alarm-info dl {
  margin: 10px 0;
  display: grid;
  gap: 7px;
}

.alarm-video__alarm-info dl div {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 8px;
  font-size: 11px;
}

.alarm-video__alarm-info dt {
  color: #718fa6;
}

.alarm-video__alarm-info dd {
  margin: 0;
  color: #dcebf5;
}

.alarm-video__alarm-info p {
  margin: 9px 0 0;
  padding: 9px;
  border-left: 2px solid var(--color-danger);
  background: rgb(119 27 35 / 18%);
  color: #bfced8;
  font-size: 11px;
  line-height: 1.55;
}

.alarm-video__cameras {
  display: grid;
  gap: 8px;
}

.alarm-video__cameras button {
  display: grid;
  grid-template-columns: 68px 1fr 10px;
  align-items: center;
  gap: 9px;
  padding: 7px;
  border: 1px solid rgb(0 112 180 / 22%);
  border-radius: 3px;
  background: rgb(0 36 68 / 38%);
  color: #dcebf4;
  text-align: left;
  cursor: pointer;
}

.alarm-video__cameras button.active {
  border-color: rgb(37 190 255 / 72%);
  background: rgb(0 88 133 / 34%);
  box-shadow: inset 0 0 10px rgb(0 151 220 / 10%);
}

.camera-thumb {
  position: relative;
  width: 68px;
  height: 42px;
  background-size: 300% 200%;
}

.camera-thumb i {
  position: absolute;
  right: 4px;
  top: 3px;
  color: var(--color-success);
  font-size: 8px;
  text-shadow: 0 0 6px var(--color-success);
}

.alarm-video__cameras button > span:nth-child(2) {
  min-width: 0;
}

.alarm-video__cameras b,
.alarm-video__cameras small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alarm-video__cameras b {
  font-size: 11px;
}

.alarm-video__cameras small {
  margin-top: 5px;
  color: #66879d;
  font: 9px monospace;
}

.alarm-video__cameras em {
  color: #55cfff;
  font-size: 18px;
  font-style: normal;
}

.alarm-video-dialog-enter-active,
.alarm-video-dialog-leave-active {
  transition: opacity 0.2s ease;
}

.alarm-video-dialog-enter-from,
.alarm-video-dialog-leave-to {
  opacity: 0;
}

@keyframes live-blink {
  50% {
    opacity: 0.35;
  }
}

@media (width <= 980px) {
  .alarm-video__body {
    grid-template-columns: 1fr;
  }

  .alarm-video__side {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .alarm-video__osd--right span.live i {
    animation: none;
  }
}
</style>
