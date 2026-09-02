<script setup lang="ts">
import { computed } from 'vue';
import SpriteImage from '../common/SpriteImage.vue';
import MapLayerPanel from '../common/MapLayerPanel.vue';
import MapCleanModeButton from './MapCleanModeButton.vue';
import { preliminaryAssets } from '../../utils/designAssets';
import { preliminarySprites } from '../../utils/preliminarySpriteConfig';
import { preliminaryMapControls } from '../../lib/data/preliminaryMock';
import type { EmergencyEventItem } from '../../lib/data/preliminaryMock';
import { useMapControls } from '../../lib/composables/useMapControls';
import { useWorldMarkerScreenPositions } from '../../lib/composables/useCesiumScreenAnchor';
import { getSharedMap } from '../../lib/composables/sharedCesiumBridge';
import {
  selectedPreliminaryEventId,
  selectPreliminaryEvent,
} from '../../lib/composables/usePreliminaryEventSelection';
import { preliminaryPagedEvents } from '../../lib/composables/usePreliminaryEventList';
import { forwardWheelToCesiumMap } from '../../lib/composables/useMapOverlayWheelPassthrough';

const { onMapControl } = useMapControls();

const { styleFor: markerStyleFor } = useWorldMarkerScreenPositions(() => {
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72.05;
  return preliminaryPagedEvents.value.map((event) => ({
    key: String(event.id),
    longitude: event.longitude,
    latitude: event.latitude,
    height,
  }));
});

const statusToneClass = computed(() => ({
  processing: 'alarm-marker__status-text--danger',
  pending: 'alarm-marker__status-text--warning',
  done: 'alarm-marker__status-text--done',
}));

function isSelected(eventId: number) {
  return selectedPreliminaryEventId.value === eventId;
}

function handleDispose(event: EmergencyEventItem, e: MouseEvent) {
  e.stopPropagation();
  selectPreliminaryEvent(event.id);
}
</script>

<template>
  <div class="preliminary-map">
    <div class="preliminary-map__depth" />

    <div
      v-for="event in preliminaryPagedEvents"
      :key="event.id"
      class="alarm-marker"
      :class="{ 'alarm-marker--active': isSelected(event.id) }"
      :style="markerStyleFor(String(event.id))"
    >
      <div class="alarm-marker__anchor">
        <div
          class="alarm-marker__body"
          @click.stop="selectPreliminaryEvent(event.id)"
          @wheel="forwardWheelToCesiumMap"
        >
          <img class="alarm-marker__shadow2" :src="preliminaryAssets.fireMarkerShadow2" alt="" />
          <img class="alarm-marker__shadow1" :src="preliminaryAssets.fireMarkerShadow1" alt="" />
          <img class="alarm-marker__base" :src="preliminaryAssets.fireMarkerBase" alt="" />
          <img class="alarm-marker__outer" :src="preliminaryAssets.fireMarkerOuter" alt="" />
          <img class="alarm-marker__inner" :src="preliminaryAssets.fireMarkerInner" alt="" />
          <img class="alarm-marker__icon" :src="preliminaryAssets.fireMarkerIcon" alt="" />
          <div class="alarm-marker__line-wrap">
            <img class="alarm-marker__line" :src="preliminaryAssets.fireMarkerLine" alt="" />
            <img class="alarm-marker__dot" :src="preliminaryAssets.fireMarkerDot" alt="" />
          </div>
        </div>

        <div
          v-show="isSelected(event.id)"
          class="alarm-marker__popup"
          :class="{ 'alarm-marker__popup--pending': event.status === 'pending' }"
          @click.stop
          @wheel="forwardWheelToCesiumMap"
        >
          <div class="alarm-marker__field alarm-marker__field--location">
            <span class="alarm-marker__label">位置：</span>
            <span class="alarm-marker__value">{{ event.location }}</span>
          </div>

          <button
            v-if="event.status === 'pending'"
            type="button"
            class="alarm-marker__dispose-btn"
            @click="handleDispose(event, $event)"
          >
            去处置
          </button>

          <div v-else class="alarm-marker__field alarm-marker__field--status">
            <span class="alarm-marker__label">状态：</span>
            <span class="alarm-marker__status-value">
              <img :src="preliminaryAssets.alarmStatusDot" alt="" />
              <span class="alarm-marker__status-text" :class="statusToneClass[event.status]">
                {{ event.statusLabel }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="map-controls">
      <MapLayerPanel />
      <button
        v-for="(ctrl, index) in preliminaryMapControls"
        :key="ctrl.key"
        type="button"
        class="map-control-btn"
        :title="ctrl.label"
        :aria-label="ctrl.label"
        @click="onMapControl(ctrl.key)"
      >
        <SpriteImage :sprite="preliminarySprites.mapControlButtons[index]" />
      </button>
      <MapCleanModeButton />
    </div>
  </div>
</template>

<style scoped>
.preliminary-map {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.preliminary-map__depth {
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

.alarm-marker {
  position: absolute;
  z-index: 4;
  pointer-events: none;
  transition: filter 0.2s ease;
}

.alarm-marker--active {
  z-index: 6;
  filter: brightness(1.15);
}

/* 锚点落在图钉底部，贴合 3D 模型表面 */
.alarm-marker__anchor {
  position: relative;
  width: 105px;
  transform: translate(-50%, -100%);
}

.alarm-marker__body {
  position: relative;
  width: 105px;
  height: 132px;
  pointer-events: auto;
  cursor: pointer;
}

.alarm-marker__shadow2,
.alarm-marker__shadow1,
.alarm-marker__base,
.alarm-marker__outer,
.alarm-marker__inner,
.alarm-marker__icon {
  position: absolute;
  object-fit: contain;
}

.alarm-marker__shadow2 {
  left: 0;
  top: 76px;
  width: 104px;
}

.alarm-marker__shadow1 {
  left: 18px;
  top: 79px;
  width: 68px;
}

.alarm-marker__base {
  left: 33px;
  top: 83px;
  width: 40px;
}

.alarm-marker__outer {
  left: 25px;
  top: 0;
  width: 53px;
}

.alarm-marker__inner {
  left: 29px;
  top: 4px;
  width: 44px;
}

.alarm-marker__icon {
  left: 41px;
  top: 12px;
  width: 22px;
}

.alarm-marker__line-wrap {
  position: absolute;
  left: 50px;
  top: 76px;
  width: 3px;
  height: 26px;
}

.alarm-marker__line {
  width: 1px;
  height: 24px;
  margin-left: 1px;
}

.alarm-marker__dot {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 3px;
}

.alarm-marker__popup {
  position: absolute;
  left: 80px;
  top: 0;
  width: 146px;
  min-height: 71px;
  box-sizing: border-box;
  padding: 11px 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: linear-gradient(155deg, rgb(72 18 18 / 94%) 0%, rgb(32 8 12 / 92%) 100%);
  border: 1px solid rgb(200 70 70 / 42%);
  box-shadow: inset 0 0 10px rgb(255 110 110 / 6%);
  pointer-events: auto;
  overflow: hidden;
}

.alarm-marker__popup--pending {
  min-height: 82px;
  padding-bottom: 11px;
}

.alarm-marker__field {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  column-gap: 2px;
  align-items: start;
  font-size: 12px;
  line-height: 1.45;
  color: #ffc4c4;
}

.alarm-marker__field--status {
  align-items: center;
}

.alarm-marker__label {
  flex-shrink: 0;
  color: #ffc4c4;
  white-space: nowrap;
}

.alarm-marker__value {
  min-width: 0;
  word-break: break-all;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.alarm-marker__status-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
}

.alarm-marker__status-value img {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
}

.alarm-marker__status-text {
  color: #d33232;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.alarm-marker__status-text--warning {
  color: #eca641;
}

.alarm-marker__status-text--done {
  color: #3dd68c;
}

.alarm-marker__dispose-btn {
  align-self: flex-start;
  margin-left: 42px;
  padding: 2px 10px;
  border: 1px solid rgb(0 160 240 / 55%);
  border-radius: 2px;
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
  font-size: 11px;
  color: #fff;
  line-height: 1.4;
  cursor: pointer;
  white-space: nowrap;
}

.alarm-marker__dispose-btn:hover {
  filter: brightness(1.08);
}

.map-controls {
  position: absolute;
  right: 465px;
  top: 123px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  z-index: 5;
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
</style>
