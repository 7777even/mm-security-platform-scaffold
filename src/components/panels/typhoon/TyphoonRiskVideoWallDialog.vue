<script setup lang="ts">
import SurveillanceVideoDialog from '../../common/SurveillanceVideoDialog.vue';
import floodCctvGridUrl from '@/assets/map/semantic-scenes/typhoon-flood-cctv-grid.png';
import type {
  TyphoonLiveVideo,
  TyphoonMapRiskPoint,
} from '@/services/map-data/typhoonEmergencyMock';
import { ref, watch } from 'vue';

const props = defineProps<{
  open: boolean;
  point: TyphoonMapRiskPoint | null;
  videos: TyphoonLiveVideo[];
}>();

const emit = defineEmits<{ close: [] }>();
const selectedVideo = ref<TyphoonLiveVideo | null>(null);

watch(
  () => props.open,
  (open) => {
    if (!open) selectedVideo.value = null;
  },
);
</script>

<template>
  <Teleport to="body">
    <Transition name="risk-video-wall-fade">
      <div
        v-if="open && point"
        class="risk-video-wall"
        role="dialog"
        aria-modal="true"
        :aria-label="`${point.name}关联视频`"
      >
        <button
          class="risk-video-wall__mask"
          type="button"
          aria-label="关闭视频墙"
          @click="emit('close')"
        />
        <section class="risk-video-wall__panel">
          <header class="risk-video-wall__header">
            <div>
              <strong>{{ point.name }} · 关联视频</strong>
              <span>共 {{ videos.length }} 路监控 · 点击在线画面查看详情及PTZ控制</span>
            </div>
            <button type="button" aria-label="关闭" @click="emit('close')">×</button>
          </header>

          <div
            v-if="videos.length"
            class="risk-video-wall__grid"
            :class="`risk-video-wall__grid--${Math.min(videos.length, 4)}`"
          >
            <button
              v-for="video in videos"
              :key="video.id"
              type="button"
              class="risk-video-wall__card"
              :class="{ 'is-offline': video.status === 'offline' }"
              :disabled="video.status === 'offline'"
              :aria-label="
                video.status === 'online' ? `放大查看${video.label}` : `${video.label}离线`
              "
              @click="selectedVideo = video"
            >
              <div
                class="risk-video-wall__thumb"
                :style="{
                  backgroundImage: `linear-gradient(180deg, transparent, rgba(0, 8, 20, .82)), url(${floodCctvGridUrl})`,
                  backgroundPosition: `${(video.sceneIndex % 3) * 50}% ${Math.floor(video.sceneIndex / 3) * 100}%`,
                }"
              />
              <span class="risk-video-wall__status"
                >● {{ video.status === 'online' ? 'LIVE' : '离线' }}</span
              >
              <div class="risk-video-wall__meta">
                <strong>{{ video.label }}</strong>
                <span>{{ video.angle }} · {{ video.deviceCode }}</span>
              </div>
              <span v-if="video.status === 'offline'" class="risk-video-wall__offline"
                >设备离线</span
              >
            </button>
          </div>
          <div v-else class="risk-video-wall__empty">该易涝点暂未关联视频监控</div>
        </section>
      </div>
    </Transition>
  </Teleport>

  <SurveillanceVideoDialog
    :open="Boolean(selectedVideo)"
    :title="selectedVideo?.label ?? ''"
    :image-url="floodCctvGridUrl"
    :scene-index="selectedVideo?.sceneIndex ?? 0"
    :online="selectedVideo?.status !== 'offline'"
    @close="selectedVideo = null"
  />
</template>

<style scoped>
.risk-video-wall {
  position: fixed;
  inset: 0;
  z-index: 1900;
  display: grid;
  place-items: center;
  font-family: var(--font-body, sans-serif);
}

.risk-video-wall__mask {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgb(0 7 18 / 76%);
  backdrop-filter: blur(5px);
}

.risk-video-wall__panel {
  position: relative;
  width: min(1120px, calc(100vw - 100px));
  min-height: 520px;
  max-height: calc(100vh - 90px);
  overflow: hidden;
  border: 1px solid rgb(26 177 255 / 72%);
  border-radius: 8px;
  background: linear-gradient(145deg, rgb(3 30 56 / 98%), rgb(1 14 32 / 99%));
  box-shadow: 0 24px 80px rgb(0 0 0 / 70%);
  color: #eaf7ff;
}

.risk-video-wall__header {
  height: 64px;
  padding: 0 18px 0 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgb(0 142 221 / 38%);
  background: linear-gradient(90deg, rgb(0 108 178 / 24%), transparent);
}

.risk-video-wall__header strong {
  display: block;
  font-size: 18px;
}

.risk-video-wall__header span {
  display: block;
  margin-top: 5px;
  color: #83aeca;
  font-size: 11px;
}

.risk-video-wall__header button {
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: #dceeff;
  font-size: 28px;
  cursor: pointer;
}

.risk-video-wall__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  padding: 18px;
  height: 480px;
  box-sizing: border-box;
}

.risk-video-wall__grid--1 {
  grid-template-columns: 1fr;
}

.risk-video-wall__grid--3 .risk-video-wall__card:first-child {
  grid-row: span 2;
}

.risk-video-wall__card {
  position: relative;
  min-height: 0;
  overflow: hidden;
  padding: 0;
  border: 1px solid rgb(0 138 220 / 40%);
  border-radius: 5px;
  background: #020b14;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.risk-video-wall__card:not(:disabled):hover {
  border-color: #31c6ff;
  box-shadow: 0 0 20px rgb(0 158 232 / 25%);
}

.risk-video-wall__card.is-offline {
  cursor: not-allowed;
}

.risk-video-wall__thumb {
  position: absolute;
  inset: 0;
  background-repeat: no-repeat;
  background-size: 300% 200%;
  transition: transform 0.25s ease;
}

.risk-video-wall__card:not(:disabled):hover .risk-video-wall__thumb {
  transform: scale(1.035);
}

.risk-video-wall__card.is-offline .risk-video-wall__thumb {
  filter: grayscale(1) brightness(0.48);
}

.risk-video-wall__status {
  position: absolute;
  top: 10px;
  right: 12px;
  color: #ff6464;
  font-size: 11px;
  text-shadow: 0 1px 4px #000;
}

.risk-video-wall__card.is-offline .risk-video-wall__status {
  color: #a7b4c2;
}

.risk-video-wall__meta {
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 12px;
}

.risk-video-wall__meta strong {
  display: block;
  font-size: 14px;
}

.risk-video-wall__meta span {
  display: block;
  margin-top: 5px;
  color: #9fb8cc;
  font-size: 11px;
}

.risk-video-wall__offline {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 7px 12px;
  border: 1px solid rgb(255 110 110 / 45%);
  background: rgb(38 8 12 / 80%);
  color: #ffb0b0;
  font-size: 12px;
}

.risk-video-wall__empty {
  min-height: 400px;
  display: grid;
  place-items: center;
  color: #88a4b9;
}

.risk-video-wall-fade-enter-active,
.risk-video-wall-fade-leave-active {
  transition: opacity 0.2s ease;
}

.risk-video-wall-fade-enter-from,
.risk-video-wall-fade-leave-to {
  opacity: 0;
}
</style>
