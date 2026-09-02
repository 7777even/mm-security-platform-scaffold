<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AlarmVideoDialog from '../common/AlarmVideoDialog.vue';
import { getSharedMap } from '../../lib/composables/sharedCesiumBridge';
import { useCesiumScreenAnchor } from '../../lib/composables/useCesiumScreenAnchor';
import { fireAlarmMarker } from '../../lib/data/mock';
import {
  alarmVideoPopupAlarm,
  alarmVideoPopupCameras,
  alarmVideoPopupsOpen,
  closeAlarmVideoPopup,
  closeAllAlarmVideoPopups,
} from '../../lib/composables/useAlarmVideoPopups';
import fireScene from '../../assets/semantic-scenes/fire-alarm-pipe-rack.png';
import gasScene from '../../assets/semantic-scenes/production-gas-leak.png';
import perimeterScene from '../../assets/semantic-scenes/security-perimeter-intrusion.png';

const router = useRouter();
const detailOpen = ref(false);
const detailCameraIndex = ref(0);
const mutedCameraIds = ref<string[]>([]);

const alarmWorldPosition = computed(() => {
  const alarm = alarmVideoPopupAlarm.value;
  return {
    longitude: alarm?.longitude ?? fireAlarmMarker.longitude,
    latitude: alarm?.latitude ?? fireAlarmMarker.latitude,
  };
});

const { anchorStyle } = useCesiumScreenAnchor(() =>
  alarmVideoPopupsOpen.value ? alarmWorldPosition.value : null,
);

const sceneImage = computed(() => {
  const type = alarmVideoPopupAlarm.value?.alarmType ?? '';
  if (/GDS|气体|浓度/i.test(type)) return gasScene;
  if (/视频|AI/i.test(type)) return perimeterScene;
  return fireScene;
});

function cameraPosition(index: number) {
  return index === 0 ? '0% 0%' : '50% 0%';
}

function toggleMuted(cameraId: string) {
  mutedCameraIds.value = mutedCameraIds.value.includes(cameraId)
    ? mutedCameraIds.value.filter((id) => id !== cameraId)
    : [...mutedCameraIds.value, cameraId];
}

function enlarge(index: number) {
  detailCameraIndex.value = index;
  detailOpen.value = true;
}

function openVideoWall(index: number) {
  const camera = alarmVideoPopupCameras.value[index];
  if (!camera) return;
  closeAllAlarmVideoPopups();
  void router.push({
    name: 'tv',
    query: { monitor: camera.id, monitorLabel: camera.name, source: 'fire-alarm' },
  });
}

watch(alarmVideoPopupsOpen, (open) => {
  if (!open) return;
  detailOpen.value = false;
  mutedCameraIds.value = [];
  const position = alarmWorldPosition.value;
  getSharedMap()?.flyToWorldPositions?.({
    positions: [position],
    duration: 1,
    pitchDeg: -48,
    rangeMultiplier: 1.65,
  });
});
</script>

<template>
  <Transition name="map-video-layer">
    <div v-if="alarmVideoPopupsOpen && alarmVideoPopupAlarm" class="map-alarm-videos">
      <svg
        class="map-alarm-videos__links"
        viewBox="0 0 1000 620"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path v-if="alarmVideoPopupCameras.length >= 1" d="M 355 300 L 500 390" />
        <path v-if="alarmVideoPopupCameras.length >= 2" d="M 645 300 L 500 390" />
      </svg>

      <div class="map-alarm-videos__anchor" :style="anchorStyle">
        <span class="map-alarm-videos__anchor-pulse" />
        <i>!</i><b>告警点</b>
      </div>

      <div class="map-alarm-videos__cluster">
        <article
          v-for="(camera, index) in alarmVideoPopupCameras"
          :key="camera.id"
          class="map-video-card"
        >
          <header>
            <div>
              <i /> <strong>{{ camera.name }}</strong
              ><span>{{ camera.role }}</span>
            </div>
            <button type="button" aria-label="关闭视频" @click="closeAlarmVideoPopup(camera.id)">
              ×
            </button>
          </header>

          <div class="map-video-card__viewport">
            <div
              class="map-video-card__scene"
              :style="{
                backgroundImage: `url(${sceneImage})`,
                backgroundPosition: cameraPosition(index),
              }"
            />
            <div class="map-video-card__scan" />
            <span class="map-video-card__live"><i /> LIVE</span>
            <time>2026-08-27&nbsp; 16:31:24</time>
            <div v-if="index === 0" class="map-video-card__target"><span>告警区域</span></div>
          </div>

          <footer>
            <span>{{ camera.id }} · 1080P</span>
            <button type="button" @click="toggleMuted(camera.id)">
              {{ mutedCameraIds.includes(camera.id) ? '🔇' : '🔊' }}
            </button>
            <button type="button" @click="enlarge(index)">⛶ 放大查看</button>
            <button type="button" class="video-wall-btn" @click="openVideoWall(index)">
              视频墙 ›
            </button>
          </footer>
        </article>
      </div>

      <div class="map-alarm-videos__summary">
        <div><i />{{ alarmVideoPopupAlarm.title }}</div>
        <span>已联动 {{ alarmVideoPopupCameras.length }} 路现场视频</span>
        <button type="button" @click="closeAllAlarmVideoPopups">收起全部</button>
      </div>

      <AlarmVideoDialog
        :open="detailOpen"
        :alarm="alarmVideoPopupAlarm"
        :initial-camera="detailCameraIndex"
        @close="detailOpen = false"
      />
    </div>
  </Transition>
</template>

<style scoped>
.map-alarm-videos {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  font-family: var(--font-body);
}

.map-alarm-videos__cluster {
  position: absolute;
  left: 50%;
  top: calc(var(--header-height) + 104px);
  display: flex;
  gap: 12px;
  transform: translateX(-50%);
  pointer-events: auto;
}

.map-video-card {
  width: 282px;
  overflow: hidden;
  border: 1px solid rgb(28 189 255 / 72%);
  border-radius: 5px;
  background: rgb(1 20 40 / 94%);
  color: #eaf7ff;
  box-shadow:
    0 12px 30px rgb(0 0 0 / 58%),
    0 0 18px rgb(0 159 226 / 13%);
  animation: video-card-in 0.26s cubic-bezier(0.2, 0.85, 0.32, 1.18);
}

.map-video-card header {
  height: 34px;
  padding: 0 7px 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgb(0 145 215 / 28%);
  background: linear-gradient(90deg, rgb(0 116 180 / 30%), rgb(0 36 67 / 20%));
}

.map-video-card header > div {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.map-video-card header i {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #31ed9b;
  box-shadow: 0 0 7px #31ed9b;
}

.map-video-card header strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
}

.map-video-card header span {
  flex-shrink: 0;
  padding: 2px 4px;
  border-radius: 2px;
  background: rgb(0 164 224 / 16%);
  color: #60ceef;
  font-size: 9px;
}

.map-video-card header button {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: #91abc0;
  font-size: 18px;
  cursor: pointer;
}

.map-video-card header button:hover {
  color: #ff7a80;
}

.map-video-card__viewport {
  position: relative;
  height: 142px;
  overflow: hidden;
  background: #020a12;
}

.map-video-card__scene {
  position: absolute;
  inset: 0;
  background-size: 300% 200%;
  background-repeat: no-repeat;
  filter: contrast(1.06) saturate(0.86);
}

.map-video-card__scan {
  position: absolute;
  inset: 0;
  opacity: 0.22;
  background: repeating-linear-gradient(transparent 0 3px, rgb(0 0 0 / 28%) 4px);
}

.map-video-card__live,
.map-video-card time {
  position: absolute;
  top: 7px;
  color: var(--color-text-strong);
  font: 9px monospace;
  text-shadow: 0 1px 3px #000;
}

.map-video-card__live {
  left: 8px;
  padding: 2px 4px;
  background: rgb(0 0 0 / 48%);
}

.map-video-card__live i {
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-right: 3px;
  border-radius: 50%;
  background: #ff4e57;
  box-shadow: 0 0 5px #ff4e57;
  animation: live-pulse 1.3s infinite;
}

.map-video-card time {
  right: 8px;
}

.map-video-card__target {
  position: absolute;
  left: 52%;
  top: 38%;
  width: 25%;
  height: 32%;
  border: 1px solid #ff555d;
  box-shadow: 0 0 7px rgb(255 68 77 / 22%);
}

.map-video-card__target span {
  position: absolute;
  left: -1px;
  top: -15px;
  padding: 1px 4px;
  background: #e64149;
  color: var(--color-text-strong);
  font-size: 8px;
}

.map-video-card footer {
  height: 34px;
  padding: 0 7px;
  display: flex;
  align-items: center;
  gap: 5px;
  border-top: 1px solid rgb(0 126 193 / 22%);
}

.map-video-card footer > span {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  color: #67879d;
  font: 8px monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-video-card footer button {
  height: 23px;
  padding: 0 6px;
  border: 1px solid rgb(28 156 218 / 38%);
  border-radius: 2px;
  background: rgb(0 69 108 / 26%);
  color: #cbeeff;
  font: 9px var(--font-body);
  cursor: pointer;
}

.map-video-card footer .video-wall-btn {
  border-color: rgb(33 190 255 / 62%);
  color: #4dd5ff;
}

.map-alarm-videos__links {
  position: absolute;
  left: 50%;
  top: calc(var(--header-height) + 68px);
  width: 620px;
  height: 390px;
  transform: translateX(-50%);
  overflow: visible;
}

.map-alarm-videos__links path {
  fill: none;
  stroke: rgb(45 201 255 / 62%);
  stroke-width: 1.3;
  stroke-dasharray: 5 4;
  filter: drop-shadow(0 0 3px rgb(25 180 255 / 55%));
}

.map-alarm-videos__anchor {
  position: absolute;
  width: 66px;
  height: 34px;
  display: flex;
  align-items: center;
  gap: 5px;
  transform: translate(-50%, -50%);
  color: #ff9297;
  font-size: 10px;
}

.map-alarm-videos__anchor > i {
  width: 25px;
  height: 25px;
  display: grid;
  place-items: center;
  z-index: 2;
  border: 1px solid #ff5d64;
  border-radius: 50%;
  background: rgb(157 25 35 / 82%);
  color: var(--color-text-strong);
  font-style: normal;
  font-weight: 700;
  box-shadow: 0 0 12px rgb(255 61 70 / 55%);
}

.map-alarm-videos__anchor-pulse {
  position: absolute;
  left: -6px;
  width: 36px;
  height: 36px;
  border: 1px solid rgb(255 69 78 / 62%);
  border-radius: 50%;
  animation: anchor-pulse 1.8s infinite;
}

.map-alarm-videos__summary {
  position: absolute;
  left: 50%;
  top: calc(var(--header-height) + 425px);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 9px;
  transform: translateX(-50%);
  border: 1px solid rgb(255 80 87 / 36%);
  border-radius: 3px;
  background: rgb(8 22 38 / 86%);
  color: #d9eaf3;
  pointer-events: auto;
  box-shadow: 0 5px 16px rgb(0 0 0 / 35%);
}

.map-alarm-videos__summary > div {
  color: #ff8187;
  font-size: 11px;
}

.map-alarm-videos__summary > div i {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 5px;
  border-radius: 50%;
  background: #ff525a;
  box-shadow: 0 0 6px #ff525a;
}

.map-alarm-videos__summary > span {
  color: #7798ae;
  font-size: 10px;
}

.map-alarm-videos__summary button {
  height: 22px;
  border: 1px solid rgb(45 151 201 / 40%);
  border-radius: 2px;
  background: rgb(0 62 96 / 34%);
  color: #8fdcff;
  font: 9px var(--font-body);
  cursor: pointer;
}

.map-video-layer-enter-active,
.map-video-layer-leave-active {
  transition: opacity 0.2s ease;
}

.map-video-layer-enter-from,
.map-video-layer-leave-to {
  opacity: 0;
}

@keyframes video-card-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
}

@keyframes live-pulse {
  50% {
    opacity: 0.35;
  }
}

@keyframes anchor-pulse {
  from {
    opacity: 0.9;
    transform: scale(0.72);
  }

  to {
    opacity: 0;
    transform: scale(1.35);
  }
}

@media (width <= 1500px) {
  .map-video-card {
    width: 242px;
  }

  .map-video-card__viewport {
    height: 124px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .map-video-card,
  .map-video-card__live i,
  .map-alarm-videos__anchor-pulse {
    animation: none;
  }
}
</style>
