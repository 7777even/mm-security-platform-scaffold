<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    imageUrl: string;
    sceneIndex?: number;
    sceneMode?: 'grid' | 'single';
    imagePosition?: string;
    online?: boolean;
  }>(),
  {
    sceneIndex: 0,
    sceneMode: 'grid',
    imagePosition: 'center',
    online: true,
  },
);

const emit = defineEmits<{ close: [] }>();
const playing = ref(true);
const muted = ref(true);
const fullscreen = ref(false);
const zoom = ref(1);
const panX = ref(0);
const panY = ref(0);
const focus = ref(50);
const snapshotTip = ref(false);

const scenePosition = computed(() =>
  props.sceneMode === 'single'
    ? props.imagePosition
    : `${(props.sceneIndex % 3) * 50}% ${Math.floor(props.sceneIndex / 3) * 100}%`,
);

const sceneSize = computed(() => (props.sceneMode === 'single' ? 'cover' : '300% 200%'));

const cameraTransform = computed(
  () => `translate(${panX.value}px, ${panY.value}px) scale(${zoom.value})`,
);

function ptz(dx: number, dy: number) {
  if (!props.online) return;
  panX.value = Math.max(-40, Math.min(40, panX.value + dx));
  panY.value = Math.max(-28, Math.min(28, panY.value + dy));
}

function changeZoom(delta: number) {
  if (!props.online) return;
  zoom.value = Math.max(1, Math.min(1.8, Number((zoom.value + delta).toFixed(1))));
}

function resetPtz() {
  panX.value = 0;
  panY.value = 0;
  zoom.value = 1;
  focus.value = 50;
}

function takeSnapshot() {
  if (!props.online) return;
  snapshotTip.value = true;
  window.setTimeout(() => {
    snapshotTip.value = false;
  }, 1500);
}

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    playing.value = true;
    resetPtz();
  },
);
</script>

<template>
  <Teleport to="body">
    <Transition name="surveillance-dialog">
      <div
        v-if="open"
        class="surveillance-dialog"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <button
          class="surveillance-dialog__mask"
          type="button"
          aria-label="关闭视频"
          @click="emit('close')"
        />
        <section
          class="surveillance-dialog__panel"
          :class="{ 'surveillance-dialog__panel--fullscreen': fullscreen }"
        >
          <header class="surveillance-dialog__header">
            <div>
              <strong>{{ title }}</strong>
              <span :class="{ 'is-offline': !online }"
                ><i /> {{ online ? '在线 · 实时监控' : '离线 · 无法连接' }}</span
              >
            </div>
            <button type="button" aria-label="关闭" @click="emit('close')">×</button>
          </header>

          <div class="surveillance-dialog__content">
            <div class="surveillance-dialog__main">
              <div
                class="surveillance-dialog__viewport"
                :class="{ 'is-paused': !playing, 'is-offline': !online }"
              >
                <div
                  class="surveillance-dialog__scene"
                  :style="{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundPosition: scenePosition,
                    backgroundSize: sceneSize,
                    transform: cameraTransform,
                    filter: `contrast(1.04) saturate(0.9) blur(${Math.abs(focus - 50) / 80}px)`,
                  }"
                />
                <div class="surveillance-dialog__hud">
                  <span>● LIVE</span>
                  <time>2026-08-24&nbsp; 16:08:32</time>
                </div>
                <div v-if="!playing" class="surveillance-dialog__paused">Ⅱ 已暂停</div>
                <div v-if="!online" class="surveillance-dialog__offline">
                  摄像机离线，暂无法播放
                </div>
                <div v-if="snapshotTip" class="surveillance-dialog__toast">✓ 抓拍成功</div>
              </div>

              <div class="surveillance-dialog__timeline">
                <span>16:06:00</span>
                <div><i /></div>
                <span>16:08:32</span>
              </div>
              <div class="surveillance-dialog__controls">
                <button type="button" :disabled="!online" @click="playing = !playing">
                  {{ playing ? 'Ⅱ 暂停' : '▶ 播放' }}
                </button>
                <button type="button" :disabled="!online" @click="muted = !muted">
                  {{ muted ? '🔇 静音' : '🔊 声音' }}
                </button>
                <button type="button" :disabled="!online" @click="takeSnapshot">▣ 抓拍</button>
                <button type="button" :disabled="!online">● 录像</button>
                <button type="button" @click="fullscreen = !fullscreen">
                  {{ fullscreen ? '退出全屏' : '⛶ 全屏' }}
                </button>
              </div>
            </div>

            <aside class="surveillance-dialog__side">
              <h4>PTZ 云台控制</h4>
              <div class="surveillance-dialog__ptz">
                <button
                  type="button"
                  :disabled="!online"
                  aria-label="云台左上"
                  @click="ptz(-8, -6)"
                >
                  ↖
                </button>
                <button type="button" :disabled="!online" aria-label="云台向上" @click="ptz(0, -6)">
                  ↑
                </button>
                <button type="button" :disabled="!online" aria-label="云台右上" @click="ptz(8, -6)">
                  ↗
                </button>
                <button type="button" :disabled="!online" aria-label="云台向左" @click="ptz(-8, 0)">
                  ←
                </button>
                <button type="button" :disabled="!online" aria-label="云台复位" @click="resetPtz">
                  ●
                </button>
                <button type="button" :disabled="!online" aria-label="云台向右" @click="ptz(8, 0)">
                  →
                </button>
                <button type="button" :disabled="!online" aria-label="云台左下" @click="ptz(-8, 6)">
                  ↙
                </button>
                <button type="button" :disabled="!online" aria-label="云台向下" @click="ptz(0, 6)">
                  ↓
                </button>
                <button type="button" :disabled="!online" aria-label="云台右下" @click="ptz(8, 6)">
                  ↘
                </button>
              </div>

              <div class="surveillance-dialog__adjust">
                <label
                  ><span>变倍</span><button @click="changeZoom(-0.1)">−</button
                  ><b>{{ zoom.toFixed(1) }}×</b><button @click="changeZoom(0.1)">＋</button></label
                >
                <label
                  ><span>聚焦</span><input v-model.number="focus" type="range" min="0" max="100"
                /></label>
                <label><span>光圈</span><button>−</button><b>自动</b><button>＋</button></label>
              </div>

              <h4>预置位</h4>
              <div class="surveillance-dialog__presets">
                <button type="button" @click="resetPtz">1&nbsp; 全景</button>
                <button
                  type="button"
                  @click="
                    panX = -24;
                    zoom = 1.3;
                  "
                >
                  2&nbsp; 排水口
                </button>
                <button
                  type="button"
                  @click="
                    panX = 24;
                    zoom = 1.4;
                  "
                >
                  3&nbsp; 泵组
                </button>
              </div>
              <div class="surveillance-dialog__info">
                <span>码流：主码流</span><span>分辨率：1920×1080</span><span>协议：GB/T 28181</span>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.surveillance-dialog {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  font-family: var(--font-body, sans-serif);
}

.surveillance-dialog__mask {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgb(0 7 18 / 78%);
  backdrop-filter: blur(5px);
}

.surveillance-dialog__panel {
  position: relative;
  width: min(1180px, calc(100vw - 80px));
  height: min(720px, calc(100vh - 70px));
  overflow: hidden;
  border: 1px solid rgb(26 177 255 / 72%);
  border-radius: 6px;
  background: linear-gradient(145deg, rgb(3 30 56 / 98%), rgb(1 14 32 / 99%));
  box-shadow:
    0 0 0 1px rgb(0 93 165 / 35%),
    0 24px 80px rgb(0 0 0 / 72%),
    inset 0 0 40px rgb(0 111 190 / 8%);
  color: #eaf7ff;
}

.surveillance-dialog__panel--fullscreen {
  width: calc(100vw - 20px);
  height: calc(100vh - 20px);
}

.surveillance-dialog__header {
  height: 58px;
  padding: 0 18px 0 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgb(0 142 221 / 38%);
  background: linear-gradient(90deg, rgb(0 108 178 / 22%), transparent);
}

.surveillance-dialog__header strong {
  display: block;
  font-size: 18px;
  letter-spacing: 1px;
}

.surveillance-dialog__header span {
  display: block;
  margin-top: 4px;
  color: #83aeca;
  font-size: 11px;
}

.surveillance-dialog__header i {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 5px;
  border-radius: 50%;
  background: #27df8c;
  box-shadow: 0 0 8px #27df8c;
}

.surveillance-dialog__header span.is-offline {
  color: #ff8f8f;
}

.surveillance-dialog__header span.is-offline i {
  background: #ff5c5c;
  box-shadow: 0 0 8px #ff5c5c;
}

.surveillance-dialog__header > button {
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: #dceeff;
  font-size: 28px;
  cursor: pointer;
}

.surveillance-dialog__content {
  height: calc(100% - 58px);
  padding: 16px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 270px;
  gap: 16px;
  box-sizing: border-box;
}

.surveillance-dialog__main {
  min-width: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) 24px 44px;
}

.surveillance-dialog__viewport {
  position: relative;
  overflow: hidden;
  border: 1px solid rgb(0 129 207 / 45%);
  background: #020b14;
}

.surveillance-dialog__scene {
  position: absolute;
  inset: -8%;
  background-repeat: no-repeat;
  background-size: 300% 200%;
  transform-origin: center;
  transition:
    transform 0.25s ease,
    filter 0.2s ease;
}

.surveillance-dialog__viewport.is-paused .surveillance-dialog__scene {
  filter: grayscale(0.2) brightness(0.7) !important;
}

.surveillance-dialog__viewport.is-offline .surveillance-dialog__scene {
  filter: grayscale(1) brightness(0.34) !important;
}

.surveillance-dialog__hud {
  position: absolute;
  inset: 12px 14px auto;
  display: flex;
  justify-content: space-between;
  color: var(--color-text-strong);
  font-size: 11px;
  text-shadow: 0 1px 4px #000;
}

.surveillance-dialog__hud span {
  color: #ff5b5b;
}

.surveillance-dialog__paused,
.surveillance-dialog__toast {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 10px 18px;
  border-radius: 4px;
  background: rgb(0 12 28 / 82%);
  border: 1px solid rgb(79 195 255 / 45%);
}

.surveillance-dialog__offline {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 20px;
  border: 1px solid rgb(255 92 92 / 50%);
  background: rgb(40 8 12 / 88%);
  color: #ffb1b1;
}

.surveillance-dialog__toast {
  top: 18%;
  color: #63ffba;
}

.surveillance-dialog__timeline {
  display: grid;
  grid-template-columns: 56px 1fr 56px;
  gap: 8px;
  align-items: center;
  color: #7697ad;
  font-size: 10px;
}

.surveillance-dialog__timeline div {
  height: 3px;
  border-radius: 3px;
  background: rgb(120 160 186 / 28%);
}

.surveillance-dialog__timeline i {
  display: block;
  width: 76%;
  height: 100%;
  border-radius: inherit;
  background: #22b8ff;
  box-shadow: 0 0 8px rgb(34 184 255 / 55%);
}

.surveillance-dialog__controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.surveillance-dialog__controls button,
.surveillance-dialog__presets button {
  height: 30px;
  padding: 0 13px;
  border: 1px solid rgb(26 152 221 / 42%);
  border-radius: 3px;
  background: rgb(0 75 124 / 24%);
  color: #d9f3ff;
  cursor: pointer;
}

.surveillance-dialog button:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.surveillance-dialog__controls button:last-child {
  margin-left: auto;
}

.surveillance-dialog__side {
  padding: 14px;
  overflow: auto;
  border: 1px solid rgb(0 129 207 / 30%);
  background: rgb(0 20 42 / 68%);
}

.surveillance-dialog__side h4 {
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgb(0 135 208 / 25%);
  color: #8bd9ff;
  font-size: 13px;
}

.surveillance-dialog__ptz {
  width: 162px;
  margin: 0 auto 18px;
  display: grid;
  grid-template-columns: repeat(3, 48px);
  gap: 7px;
}

.surveillance-dialog__ptz button {
  height: 43px;
  border: 1px solid rgb(36 170 236 / 42%);
  border-radius: 50%;
  background: radial-gradient(circle, rgb(13 100 155 / 50%), rgb(0 27 55 / 85%));
  color: #aee7ff;
  font-size: 18px;
  cursor: pointer;
}

.surveillance-dialog__adjust {
  display: grid;
  gap: 9px;
  margin-bottom: 20px;
}

.surveillance-dialog__adjust label {
  display: grid;
  grid-template-columns: 44px 30px 1fr 30px;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #9dbad0;
}

.surveillance-dialog__adjust label:nth-child(2) {
  grid-template-columns: 44px 1fr;
}

.surveillance-dialog__adjust button {
  height: 27px;
  border: 1px solid rgb(27 143 207 / 36%);
  background: rgb(1 54 88 / 55%);
  color: #dff6ff;
  cursor: pointer;
}

.surveillance-dialog__adjust b {
  text-align: center;
  color: var(--color-text-strong);
  font-size: 11px;
}

.surveillance-dialog__adjust input {
  accent-color: #25bfff;
}

.surveillance-dialog__presets {
  display: grid;
  gap: 7px;
}

.surveillance-dialog__info {
  margin-top: 18px;
  padding-top: 12px;
  display: grid;
  gap: 6px;
  border-top: 1px dashed rgb(0 129 207 / 25%);
  color: #6f95ad;
  font-size: 10px;
}

.surveillance-dialog-enter-active,
.surveillance-dialog-leave-active {
  transition: opacity 0.2s ease;
}

.surveillance-dialog-enter-from,
.surveillance-dialog-leave-to {
  opacity: 0;
}

@media (width <= 980px) {
  .surveillance-dialog__content {
    grid-template-columns: 1fr;
  }

  .surveillance-dialog__side {
    display: none;
  }
}
</style>
