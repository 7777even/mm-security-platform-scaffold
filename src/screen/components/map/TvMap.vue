<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import SpriteImage from '../common/SpriteImage.vue';
import MapLayerPanel from '../common/MapLayerPanel.vue';
import MapCleanModeButton from './MapCleanModeButton.vue';
import { tvAssets } from '../../utils/designAssets';
import { tvSprites } from '../../utils/tvSpriteConfig';
import { tvAlarmMarker, tvMapControls, tvVideoMapPoints } from '../../lib/data/tvMock';
import { useMapControls } from '../../lib/composables/useMapControls';
import {
  useCesiumScreenAnchor,
  useWorldMarkerScreenPositions,
} from '../../lib/composables/useCesiumScreenAnchor';
import { openTvVideoDetail } from '../../lib/composables/useTvVideoDetail';
import { getSharedMap } from '../../lib/composables/sharedCesiumBridge';

const { onMapControl } = useMapControls();
const router = useRouter();

function openVideoWall() {
  void router.push({ name: 'tvVideoWall', query: { from: 'tv' } });
}

type VideoPointGroup = 'all' | 'high-ar' | 'focus' | 'hazard' | 'boundary';
const selectedVideoPointGroup = ref<VideoPointGroup>('all');
const videoPointGroupOptions: Array<{ value: VideoPointGroup; label: string }> = [
  { value: 'all', label: '全部视频' },
  { value: 'high-ar', label: '高空AR' },
  { value: 'focus', label: '重点关注区域' },
  { value: 'hazard', label: '重大危险源' },
  { value: 'boundary', label: '厂界及出入口' },
];
const visibleVideoMapPoints = computed(() =>
  selectedVideoPointGroup.value === 'all'
    ? tvVideoMapPoints
    : tvVideoMapPoints.filter((point) => point.group === selectedVideoPointGroup.value),
);
const { styleFor: videoPointStyleFor } = useWorldMarkerScreenPositions(
  () =>
    visibleVideoMapPoints.value.map((point) => ({
      key: point.id,
      longitude: point.longitude,
      latitude: point.latitude,
      height: point.height,
    })),
  { scaleWithZoom: false },
);

function onVideoLabelClick(payload: { id: string; label: string }) {
  openTvVideoDetail(payload);
}

const { anchorStyle: alarmAnchorStyle } = useCesiumScreenAnchor(() => {
  const map = getSharedMap();
  const height = map?.getBoundaryModelTopHeight?.() ?? 66.25;
  return {
    longitude: tvAlarmMarker.longitude,
    latitude: tvAlarmMarker.latitude,
    height,
  };
});
</script>

<template>
  <div class="tv-map">
    <div class="tv-map__depth" />

    <button
      v-for="point in visibleVideoMapPoints"
      :key="point.id"
      type="button"
      class="video-map-point"
      :class="{ 'video-map-point--offline': !point.online }"
      :style="videoPointStyleFor(point.id)"
      :aria-label="`${point.label}${point.online ? '在线' : '离线'}`"
      @click.stop="onVideoLabelClick({ id: point.id, label: point.label })"
    >
      <span class="video-map-point__label">{{ point.label }}</span>
      <span class="video-map-point__marker"><i /></span>
      <span class="video-map-point__stem" />
    </button>

    <div class="alarm-marker" :style="alarmAnchorStyle">
      <div class="alarm-marker__body">
        <img class="alarm-marker__shadow2" :src="tvAssets.alarmMarker.shadow2" alt="" />
        <img class="alarm-marker__shadow1" :src="tvAssets.alarmMarker.shadow1" alt="" />
        <img class="alarm-marker__base" :src="tvAssets.alarmMarker.base" alt="" />
        <img class="alarm-marker__outer" :src="tvAssets.alarmMarker.outer" alt="" />
        <img class="alarm-marker__inner" :src="tvAssets.alarmMarker.inner" alt="" />
        <img class="alarm-marker__icon" :src="tvAssets.alarmMarker.icon" alt="" />
        <div class="alarm-marker__line-wrap">
          <img class="alarm-marker__line" :src="tvAssets.alarmMarker.line" alt="" />
          <img class="alarm-marker__dot" :src="tvAssets.alarmMarker.dot" alt="" />
        </div>
      </div>
      <div class="alarm-marker__popup">
        <img class="alarm-marker__popup-bg" :src="tvAssets.alarmPopupBg" alt="" />
        <div class="alarm-marker__popup-text">
          <div>位置：{{ tvAlarmMarker.location }}</div>
          <div class="alarm-marker__status">
            <span>状态：</span>
            <img :src="tvAssets.alarmStatusDot" alt="" />
            <span class="alarm-marker__status-text">{{ tvAlarmMarker.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="map-controls">
      <MapLayerPanel />
      <button
        v-for="(ctrl, index) in tvMapControls"
        :key="ctrl.key"
        type="button"
        class="map-control-btn"
        :title="ctrl.label"
        :aria-label="ctrl.label"
        @click="onMapControl(ctrl.key)"
      >
        <SpriteImage :sprite="tvSprites.mapControlButtons[index]" />
      </button>
      <MapCleanModeButton />
      <button
        type="button"
        class="video-wall-trigger"
        title="进入视频墙"
        aria-label="视频墙"
        @click="openVideoWall"
      >
        <span aria-hidden="true">▦</span>
        视频墙
      </button>
    </div>

    <label class="video-point-selector" title="按视频分组控制地图点位显示">
      <span class="video-point-selector__icon" aria-hidden="true">◉</span>
      <span class="video-point-selector__label">视频撒点</span>
      <select v-model="selectedVideoPointGroup" aria-label="选择地图视频撒点分组">
        <option v-for="option in videoPointGroupOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <span class="video-point-selector__count">{{ visibleVideoMapPoints.length }}</span>
    </label>
  </div>
</template>

<style scoped>
.tv-map {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.tv-map__depth {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(
      ellipse 90% 80% at 50% 42%,
      transparent 0%,
      rgb(0 18 40 / 20%) 50%,
      rgb(0 12 28 / 65%) 100%
    ),
    linear-gradient(
      180deg,
      rgb(0 22 48 / 90%) 0%,
      transparent 14%,
      transparent 78%,
      rgb(0 18 40 / 92%) 100%
    ),
    linear-gradient(
      90deg,
      rgb(0 22 48 / 92%) 0%,
      transparent 22%,
      transparent 78%,
      rgb(0 22 48 / 92%) 100%
    );
}

.map-pin {
  position: absolute;
  z-index: 4;
  transform: translate(-50%, -100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.map-pin--clickable {
  pointer-events: auto;
  cursor: pointer;
}

.map-pin--scan-result {
  z-index: 7;
}

.map-pin__label {
  position: relative;
  width: 95px;
  height: 24px;
  margin-bottom: 4px;
  flex-shrink: 0;
}

.map-pin__label-bg-wrap {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 105px;
  height: 24px;
  transform: translate(-50%, -50%) scaleX(0.9048);
  transform-origin: center center;
  pointer-events: none;
}

.map-pin__label-text {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 1px;
  font-size: 11px;
  line-height: 16px;
  color: #fff;
  white-space: nowrap;
  pointer-events: none;
}

.map-pin__marker {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.map-pin__circle {
  position: relative;
  width: 33px;
  height: 33px;
  flex-shrink: 0;
}

.map-pin__circle-bg {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.map-pin__icon {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 20px;
  height: 18px;
  transform: translate(-50%, -50%);
  display: block;
  object-fit: contain;
}

.map-pin__line-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 3px;
  margin-top: 1px;
}

.map-pin__line {
  width: 1px;
  height: 9px;
  display: block;
}

.map-pin__dot {
  width: 3px;
  height: 3px;
  display: block;
  object-fit: contain;
}

.alarm-marker {
  position: absolute;
  z-index: 5;
  transform: translate(-50%, -100%);
  pointer-events: none;
}

.alarm-marker__body {
  position: relative;
  width: 50px;
  height: 97px;
  margin: 0 auto;
}

.alarm-marker__shadow2,
.alarm-marker__shadow1,
.alarm-marker__base,
.alarm-marker__outer,
.alarm-marker__inner,
.alarm-marker__icon {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.alarm-marker__shadow2 {
  bottom: 0;
  width: 99px;
  height: 40px;
  opacity: 0.6;
}

.alarm-marker__shadow1 {
  bottom: 3px;
  width: 64px;
  height: 26px;
  opacity: 0.6;
}

.alarm-marker__base {
  bottom: 6px;
  width: 38px;
  height: 15px;
}

.alarm-marker__outer {
  top: 0;
  width: 50px;
  height: 65px;
}

.alarm-marker__inner {
  top: 4px;
  width: 42px;
  height: 42px;
}

.alarm-marker__icon {
  top: 11px;
  width: 21px;
  height: 23px;
}

.alarm-marker__line-wrap {
  position: absolute;
  left: 50%;
  bottom: -25px;
  transform: translateX(-50%);
  width: 3px;
  height: 25px;
}

.alarm-marker__line {
  width: 1px;
  height: 23px;
  margin: 0 auto;
  display: block;
}

.alarm-marker__dot {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 3px;
  height: 3px;
  transform: translateX(-50%);
}

.alarm-marker__popup {
  position: absolute;
  left: 81px;
  top: 0;
  width: 138px;
  height: 67px;
}

.alarm-marker__popup-bg {
  width: 100%;
  height: 100%;
}

.alarm-marker__popup-text {
  position: absolute;
  inset: 0;
  padding: 11px;
  font-size: 12px;
  color: #ffc4c4;
  line-height: 1.4;
}

.alarm-marker__status {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}

.alarm-marker__status img {
  width: 5px;
  height: 5px;
}

.alarm-marker__status-text {
  color: #d33232;
}

.map-controls {
  position: absolute;
  right: 465px;
  top: 123px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  z-index: 6;
  pointer-events: auto;
}

.map-control-btn {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  line-height: 0;
  opacity: 0.95;
  transition:
    opacity 0.2s,
    filter 0.2s;
}

.map-control-btn:hover {
  opacity: 1;
  filter: brightness(1.12);
}

.video-wall-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 104px;
  min-height: 39px;
  margin-top: 1px;
  border: 1px solid rgb(44 163 255 / 58%);
  border-radius: 2px;
  background: linear-gradient(180deg, rgb(8 52 99 / 92%), rgb(4 28 61 / 94%));
  box-shadow: 0 0 12px rgb(0 144 255 / 16%);
  color: #ccecff;
  font-family: var(--font-body);
  font-size: 13px;
  cursor: pointer;
  transition:
    border-color 180ms ease,
    background 180ms ease,
    color 180ms ease;
}

.video-wall-trigger:hover,
.video-wall-trigger:focus-visible {
  border-color: #55c9ff;
  outline: none;
  background: linear-gradient(180deg, rgb(12 91 160 / 95%), rgb(5 53 112 / 96%));
  color: #fff;
}

.video-wall-trigger span {
  color: #63d8ff;
  font-size: 16px;
  line-height: 1;
}

.video-map-point {
  position: absolute;
  z-index: 7;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  transform: translate(-50%, -100%);
  pointer-events: auto;
  cursor: pointer;
  color: #3ed5ff;
  filter: drop-shadow(0 2px 4px rgb(0 8 20 / 90%));
}

.video-map-point__label {
  max-width: 126px;
  height: 24px;
  padding: 0 9px;
  border: 1px solid rgb(35 190 255 / 70%);
  border-radius: 2px;
  background: linear-gradient(180deg, rgb(3 51 91 / 96%), rgb(1 24 49 / 96%));
  color: #eefaff;
  font-size: 11px;
  line-height: 22px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-map-point__marker {
  position: relative;
  width: 31px;
  height: 31px;
  margin-top: 3px;
  border: 2px solid currentcolor;
  border-radius: 50%;
  background: rgb(0 68 117 / 92%);
  box-shadow:
    0 0 0 4px rgb(0 176 242 / 18%),
    0 0 12px rgb(0 190 255 / 55%);
}

.video-map-point__marker::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 8px;
  width: 12px;
  height: 8px;
  border: 2px solid #fff;
  border-radius: 2px;
}

.video-map-point__marker::after {
  content: '';
  position: absolute;
  right: 4px;
  top: 10px;
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 5px solid #fff;
}

.video-map-point__marker i {
  position: absolute;
  right: 1px;
  top: 1px;
  width: 6px;
  height: 6px;
  border: 1px solid #00223e;
  border-radius: 50%;
  background: #35e394;
}

.video-map-point__stem {
  width: 1px;
  height: 14px;
  background: linear-gradient(currentcolor, transparent);
}

.video-map-point--offline {
  color: #8295aa;
}

.video-map-point--offline .video-map-point__marker i {
  background: #8295aa;
}

.video-map-point:hover {
  z-index: 10;
  color: #fff36a;
}

.video-point-selector {
  position: absolute;
  top: calc(var(--header-height) + 66px);
  left: calc(var(--sidebar-width) + 208px);
  z-index: 9;
  pointer-events: auto;
  display: flex;
  align-items: center;
  width: 200px;
  height: 34px;
  padding: 0 8px;
  box-sizing: border-box;
  border: 1px solid rgb(0 155 235 / 72%);
  border-radius: 2px;
  background: linear-gradient(180deg, rgb(4 48 83 / 95%), rgb(2 28 55 / 96%));
  box-shadow:
    inset 0 0 13px rgb(0 132 220 / 18%),
    0 0 10px rgb(0 70 130 / 28%);
  color: #d7efff;
}

.video-point-selector__icon {
  margin-right: 5px;
  color: #37c7ff;
  font-size: 13px;
}

.video-point-selector__label {
  flex-shrink: 0;
  font-size: 12px;
  color: #9fc9e8;
}

.video-point-selector select {
  min-width: 0;
  flex: 1;
  height: 28px;
  margin-left: 5px;
  padding: 0 20px 0 5px;
  border: 0;
  outline: 0;
  background: rgb(0 31 62 / 72%);
  color: #fff;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.video-point-selector__count {
  min-width: 20px;
  margin-left: 4px;
  border-radius: 8px;
  background: rgb(0 174 238 / 20%);
  color: #65d8ff;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
}

.video-point-selector select option {
  background: #062846;
  color: #fff;
}

:global(.map-page-shell--clean) .video-point-selector {
  left: 204px;
}
</style>
