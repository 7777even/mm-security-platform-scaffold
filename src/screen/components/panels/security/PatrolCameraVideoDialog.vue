<script setup lang="ts">
import { computed } from 'vue';
import type { MapVideoSource } from '../../../lib/composables/usePatrolCameraVideoDialog';

const props = defineProps<{
  open: boolean;
  camera: MapVideoSource | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const title = computed(() => props.camera?.name ?? '视频播放');
const canPlay = computed(() => props.camera?.status === '正常');

const previewImage = new URL(
  '../../../assets/mock-cameras/outdoor_storage_tanks_1782731405157.png',
  import.meta.url,
).href;

function closeDialog() {
  emit('close');
}
</script>

<template>
  <Teleport to="body">
    <Transition name="camera-video-fade">
      <div v-if="open" class="camera-video" @click.self="closeDialog">
        <section
          class="camera-video__dialog"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          @click.stop
        >
          <header class="camera-video__header">
            <div class="camera-video__title-wrap">
              <h3 class="camera-video__title">{{ title }}</h3>
              <span v-if="camera" class="camera-video__meta">
                {{ camera.zone }} · {{ camera.status }}
              </span>
            </div>
            <button type="button" class="camera-video__close" @click="closeDialog">×</button>
          </header>

          <div class="camera-video__body">
            <div
              class="camera-video__player"
              :class="{ 'camera-video__player--disabled': !canPlay }"
            >
              <img class="camera-video__preview" :src="previewImage" alt="监控画面" />
              <div class="camera-video__player-inner">
                <span v-if="canPlay" class="camera-video__live">实时预览（仿真）</span>
                <div v-else class="camera-video__hint">当前摄像头不可播放</div>
              </div>
            </div>

            <div v-if="camera" class="camera-video__info">
              <div class="camera-video__row"><span>摄像头</span>{{ camera.name }}</div>
              <div class="camera-video__row"><span>区域</span>{{ camera.zone }}</div>
              <div class="camera-video__row">
                <span>坐标</span>{{ camera.longitude }}, {{ camera.latitude }}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.camera-video {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(0 10 24 / 72%);
}

.camera-video__dialog {
  display: flex;
  flex-direction: column;
  width: min(820px, 100%);
  height: min(560px, calc(100vh - 40px));
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 4px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%), rgb(5 20 40 / 98%));
  box-shadow: 0 14px 36px rgb(0 0 0 / 42%);
  overflow: hidden;
}

.camera-video__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  padding: 12px 16px;
  border-bottom: 1px solid var(--panel-head-line);
  background: rgb(0 18 40 / 60%);
}

.camera-video__title-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.camera-video__title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.camera-video__meta {
  font-size: 12px;
  color: var(--map-device-offline);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.camera-video__close {
  width: 28px;
  height: 28px;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  background: rgb(0 28 58 / 65%);
  color: #c8d8ec;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}

.camera-video__body {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 12px;
  padding: 12px 16px 14px;
  flex: 1;
  min-height: 0;
}

.camera-video__player {
  position: relative;
  border: 1px solid rgb(0 130 210 / 22%);
  border-radius: 2px;
  background: rgb(0 14 28 / 70%);
  overflow: hidden;
  min-height: 0;
}

.camera-video__preview {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-video__player-inner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 10px;
  pointer-events: none;
}

.camera-video__player--disabled .camera-video__preview {
  filter: grayscale(0.45);
  opacity: 0.55;
}

.camera-video__player--disabled .camera-video__player-inner {
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.camera-video__live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border: 1px solid rgb(61 214 140 / 45%);
  border-radius: 2px;
  background: rgb(0 10 24 / 55%);
  color: var(--color-success);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.camera-video__live::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 8px rgb(61 214 140 / 80%);
  animation: camera-video-blink 1.2s ease-in-out infinite;
}

@keyframes camera-video-blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}

.camera-video__hint {
  max-width: 80%;
  text-align: center;
  font-size: 13px;
  color: #c8d8ec;
  padding: 10px 12px;
  border: 1px dashed rgb(0 148 236 / 35%);
  border-radius: 2px;
  background: var(--stat-card-icon-bg);
}

.camera-video__info {
  border: 1px solid rgb(0 130 210 / 18%);
  border-radius: 2px;
  background: rgb(0 24 50 / 40%);
  padding: 10px 12px;
  min-height: 0;
  overflow: auto;
}

.camera-video__row {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 8px;
  font-size: 12px;
  color: #e8f2fc;
  padding: 6px 0;
  border-bottom: 1px solid rgb(0 80 140 / 14%);
}

.camera-video__row:last-child {
  border-bottom: none;
}

.camera-video__row span {
  color: var(--map-device-offline);
}

.camera-video-fade-enter-active,
.camera-video-fade-leave-active {
  transition: opacity 0.22s ease;
}

.camera-video-fade-enter-from,
.camera-video-fade-leave-to {
  opacity: 0;
}
</style>
