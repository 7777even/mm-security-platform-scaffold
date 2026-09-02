<script setup lang="ts">
import SpriteImage from '../common/SpriteImage.vue';
import MapLayerPanel from '../common/MapLayerPanel.vue';
import MapCleanModeButton from './MapCleanModeButton.vue';
import { fireEmergencySprites } from '../../utils/fireEmergencySpriteConfig';
import { fireEmergencyMapControls } from '../../lib/data/fireEmergencyMock';
import type { EmergencyEventItem } from '../../lib/data/fireEmergencyMock';
import { useMapControls } from '../../lib/composables/useMapControls';
import { useWorldMarkerScreenPositions } from '../../lib/composables/useCesiumScreenAnchor';
import { getSharedMap } from '../../lib/composables/sharedCesiumBridge';
import {
  selectedFireEmergencyEventId,
  selectFireEmergencyEvent,
} from '../../lib/composables/useFireEmergencyEventSelection';
import { fireEmergencyPagedEvents } from '../../lib/composables/useFireEmergencyEventList';
import { forwardWheelToCesiumMap } from '../../lib/composables/useMapOverlayWheelPassthrough';
import { useAccidentRescueNavigation } from '../../lib/composables/useAccidentRescueNavigation';

const FIRE_EMERGENCY_EVENT_MARKER = '/images/事件.png';
const FIRE_EMERGENCY_DRILL_MARKER = '/images/演练.png';

function markerIconFor(event: EmergencyEventItem) {
  return event.kind === 'drill' ? FIRE_EMERGENCY_DRILL_MARKER : FIRE_EMERGENCY_EVENT_MARKER;
}

const { onMapControl } = useMapControls();
const { goToEventDispose } = useAccidentRescueNavigation();

const { styleFor: markerStyleFor } = useWorldMarkerScreenPositions(
  () => {
    const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72.05;
    return fireEmergencyPagedEvents.value.map((event) => ({
      key: String(event.id),
      longitude: event.longitude,
      latitude: event.latitude,
      height,
    }));
  },
  { scaleWithZoom: false },
);

function isSelected(eventId: number) {
  return selectedFireEmergencyEventId.value === eventId;
}

function handleDispose(event: EmergencyEventItem, e: MouseEvent) {
  e.stopPropagation();
  goToEventDispose(event);
}
</script>

<template>
  <div class="fire-emergency-map">
    <div class="fire-emergency-map__depth" />

    <div
      v-for="event in fireEmergencyPagedEvents"
      :key="event.id"
      class="alarm-marker"
      :class="{ 'alarm-marker--active': isSelected(event.id) }"
      :style="markerStyleFor(String(event.id))"
    >
      <div class="alarm-marker__anchor">
        <div
          class="alarm-marker__body"
          @click.stop="selectFireEmergencyEvent(event.id)"
          @wheel="forwardWheelToCesiumMap"
        >
          <img class="alarm-marker__pin" :src="markerIconFor(event)" alt="" />
        </div>

        <div
          v-show="isSelected(event.id)"
          class="alarm-marker__popup"
          :class="{
            'alarm-marker__popup--pending':
              event.status === 'pending' ||
              event.status === 'processing' ||
              event.status === 'done',
            'alarm-marker__popup--drill': event.kind === 'drill',
          }"
          @click.stop
          @wheel="forwardWheelToCesiumMap"
        >
          <div class="alarm-marker__popup-title" :title="event.title">{{ event.title }}</div>

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

          <button
            v-else-if="event.status === 'processing' || event.status === 'done'"
            type="button"
            class="alarm-marker__view-btn"
            @click="handleDispose(event, $event)"
          >
            查看
          </button>
        </div>
      </div>
    </div>

    <div class="map-controls">
      <MapLayerPanel />
      <button
        v-for="(ctrl, index) in fireEmergencyMapControls"
        :key="ctrl.key"
        type="button"
        class="map-control-btn"
        :title="ctrl.label"
        :aria-label="ctrl.label"
        @click="onMapControl(ctrl.key)"
      >
        <SpriteImage :sprite="fireEmergencySprites.mapControlButtons[index]" />
      </button>
      <MapCleanModeButton />
    </div>
  </div>
</template>

<style scoped>
.fire-emergency-map {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.fire-emergency-map__depth {
  position: absolute;
  inset: 0;
  z-index: var(--z-base);
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
  z-index: var(--z-marker);
  pointer-events: none;
  transition: filter 0.2s ease;
}

.alarm-marker--active {
  z-index: var(--z-marker);
  filter: brightness(1.15);
}

.alarm-marker__anchor {
  position: relative;
  width: 66px;
  transform: translate(-50%, -100%);
  transform-origin: center bottom;
}

.alarm-marker__body {
  position: relative;
  width: 66px;
  height: 93px;
  pointer-events: auto;
  cursor: pointer;
}

.alarm-marker__pin {
  display: block;
  width: 66px;
  height: 93px;
  object-fit: contain;
}

.alarm-marker__popup {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 6px);
  top: auto;
  transform: translateX(-50%);
  width: 210px;
  min-height: 82px;
  box-sizing: border-box;
  padding: 5px 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: linear-gradient(155deg, rgb(72 18 18 / 94%) 0%, rgb(32 8 12 / 92%) 100%);
  border: 1px solid rgb(200 70 70 / 42%);
  border-radius: 6px;
  box-shadow: inset 0 0 10px var(--map-popup-red-glow);
  pointer-events: auto;
  overflow: hidden;
}

.alarm-marker__popup--pending {
  min-height: 90px;
  padding-bottom: 9px;
}

.alarm-marker__popup--drill {
  background: linear-gradient(155deg, rgb(72 48 18 / 94%) 0%, rgb(32 24 8 / 92%) 100%);
  border-color: rgb(236 166 65 / 42%);
  border-radius: 6px;
  box-shadow: inset 0 0 10px rgb(236 166 65 / 8%);
}

.alarm-marker__popup--drill .alarm-marker__field,
.alarm-marker__popup--drill .alarm-marker__label {
  color: var(--map-route-orange-text-soft);
}

.alarm-marker__popup--drill .alarm-marker__dispose-btn {
  border-color: rgb(236 166 65 / 55%);
  background: linear-gradient(180deg, rgb(210 145 45 / 92%), rgb(160 105 25 / 92%));
}

.alarm-marker__popup-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-strong);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.alarm-marker__field {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  column-gap: 2px;
  align-items: start;
  font-size: 12px;
  line-height: 1.25;
  color: var(--map-popup-red-text);
}

.alarm-marker__field--status {
  align-items: center;
}

.alarm-marker__label {
  flex-shrink: 0;
  color: var(--map-popup-red-text);
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
  color: var(--map-danger-deep);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.alarm-marker__status-text--warning {
  color: var(--accent-gold);
}

.alarm-marker__status-text--done {
  color: var(--color-success);
}

.alarm-marker__dispose-btn {
  align-self: flex-start;
  margin-left: 42px;
  padding: 2px 10px;
  border: 1px solid rgb(0 160 240 / 55%);
  border-radius: 2px;
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
  font-size: 11px;
  color: var(--color-text-strong);
  line-height: 1.25;
  cursor: pointer;
  white-space: nowrap;
}

.alarm-marker__dispose-btn:hover {
  filter: brightness(1.08);
}

.alarm-marker__view-btn {
  align-self: flex-start;
  margin-left: 42px;
  padding: 2px 10px;
  border: 1px solid rgb(0 140 220 / 45%);
  border-radius: 2px;
  background: rgb(0 22 48 / 78%);
  font-size: 11px;
  color: #7cdbff;
  line-height: 1.25;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.alarm-marker__view-btn:hover {
  background: rgb(0 40 80 / 82%);
  border-color: rgb(0 160 240 / 55%);
}

.alarm-marker__popup--drill .alarm-marker__view-btn {
  border-color: rgb(236 166 65 / 42%);
  background: rgb(52 36 10 / 78%);
  color: var(--accent-gold);
}

.alarm-marker__popup--drill .alarm-marker__view-btn:hover {
  background: rgb(72 48 14 / 85%);
  border-color: rgb(236 166 65 / 55%);
}

.map-controls {
  position: absolute;
  right: 465px;
  top: 123px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  z-index: var(--z-marker);
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
