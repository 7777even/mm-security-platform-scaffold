<script setup lang="ts">
import { computed, onMounted, watch, nextTick, ref, unref, type Ref } from 'vue';
import SpriteImage from '../common/SpriteImage.vue';
import MapLayerPanel from '../common/MapLayerPanel.vue';
import MapCleanModeButton from './MapCleanModeButton.vue';
import { accidentRescueAssets, fireEmergencyAssets } from '@/utils/designAssets';
import { accidentRescueSprites } from '@/utils/accidentRescueSpriteConfig';
import {
  accidentRescueMapControls,
  accidentRescueMapMarkers,
} from '@/services/map-data/accidentRescueMock';
import { useMapControls } from '@/composables/useMapControls';
import { useWorldMarkerScreenPositions } from '@/composables/useCesiumScreenAnchor';
import { useAccidentRescueRoute } from '@/composables/useAccidentRescueRoute';
import { accidentRescueRouteWaypoints } from '@/services/map-data/accidentRescueMock';
import { flyToSharedAccidentRescueIncident, getSharedMap } from '@/composables/sharedCesiumBridge';
import { forwardWheelToCesiumMap } from '@/composables/useMapOverlayWheelPassthrough';
import { formatHazardSourceLevelLabel, hazardLevelToneClass } from '@/utils/hazardSourceLevel';
import { toggleFacilityDetail } from '@/composables/useFacilityDetail';

const props = withDefaults(
  defineProps<{
    fireStatus: string;
    fireLocation: string;
    incidentTitle?: string;
    hazardSourceLevel?: string;
    /** 与应急指挥列表事件坐标一致 */
    incidentLongitude?: number;
    incidentLatitude?: number;
    markerKind?: 'event' | 'drill';
    incidentStatus?: 'processing' | 'pending' | 'done';
    /** 救援路线回放控制：播放/倍速 */
    routePlayback?: {
      playing: boolean | Ref<boolean>;
      speed: number | Ref<number>;
      progress?: Ref<number>;
    };
    /** 是否隐藏左侧地图工具栏（救援路线场景） */
    hideControls?: boolean;
    /** 仅透传地图交互（禁用所有覆盖层点击/滚轮） */
    passThrough?: boolean;
  }>(),
  { markerKind: 'event', incidentStatus: 'processing', hideControls: false, passThrough: false },
);

const isEventCommand = computed(() => props.markerKind === 'event');

const routeEndCoords = accidentRescueMapMarkers.fire;

const fireMarkerCoords = computed(() => {
  // 救援路线回放：终点固定为路线终点（应急装备）
  if (props.markerKind === 'drill') {
    return routeEndCoords;
  }
  if (props.incidentLongitude != null && props.incidentLatitude != null) {
    return { longitude: props.incidentLongitude, latitude: props.incidentLatitude };
  }
  return routeEndCoords;
});

const EVENT_PIN_ICON = '/images/事件.png';
const DRILL_PIN_ICON = '/images/演练.png';

const incidentPinIcon = computed(() =>
  props.markerKind === 'drill' ? DRILL_PIN_ICON : EVENT_PIN_ICON,
);

const emit = defineEmits<{
  'route-complete': [];
}>();

const { onMapControl } = useMapControls();
const showVehiclePopup = ref(true);
const routeGradientId = 'accident-rescue-route-gradient';

function overlayHeight() {
  const map = getSharedMap();
  return map?.getAccidentRescueOverlayHeight?.() ?? map?.getBoundaryModelTopHeight?.() ?? 72.05;
}

const {
  routeProgress,
  routeBasePathD,
  routeRemainingPathD,
  routeTraveledPathD,
  routeGradient,
  vehicleMarkerStyle,
  vehicleTimeText,
} = useAccidentRescueRoute(overlayHeight, {
  enabled: !isEventCommand.value,
  playback: props.routePlayback
    ? {
        playing: computed(() => unref(props.routePlayback!.playing) ?? true),
        speed: computed(() => unref(props.routePlayback!.speed) ?? 1),
        progress: props.routePlayback.progress,
      }
    : undefined,
  onComplete: () => {
    void getSharedMap()?.flyToAccidentRescueIncident?.(
      fireMarkerCoords.value.longitude,
      fireMarkerCoords.value.latitude,
    );
    emit('route-complete');
  },
});

watch(
  routeProgress,
  (value) => {
    const external = props.routePlayback?.progress;
    if (!external) return;
    const { initialProgress, endProgress } = accidentRescueRouteWaypoints;
    const span = endProgress - initialProgress;
    external.value = span > 0 ? Math.max(0, Math.min(1, (value - initialProgress) / span)) : 0;
  },
  { immediate: true },
);

function handleFacilityDetailClick(e: MouseEvent) {
  e.stopPropagation();
  toggleFacilityDetail();
}

async function handleMapControl(key: string) {
  if (key === 'toggle') {
    await getSharedMap()?.toggleAccidentRescueDisplayMode?.();
    return;
  }
  await onMapControl(key);
}

const markerTargets = () => {
  const height = overlayHeight();
  return [
    {
      key: 'fire',
      longitude: fireMarkerCoords.value.longitude,
      latitude: fireMarkerCoords.value.latitude,
      height,
    },
    {
      key: 'gate',
      longitude: accidentRescueMapMarkers.gate.longitude,
      latitude: accidentRescueMapMarkers.gate.latitude,
      height,
    },
  ];
};

const { styleFor: markerStyleFor } = useWorldMarkerScreenPositions(markerTargets, {
  scaleWithZoom: false,
});

function scheduleIncidentFly() {
  if (!isEventCommand.value) return;
  const { longitude, latitude } = fireMarkerCoords.value;
  void nextTick(() => {
    requestAnimationFrame(() => {
      void flyToSharedAccidentRescueIncident(longitude, latitude);
    });
  });
}

onMounted(scheduleIncidentFly);

watch(() => [props.incidentLongitude, props.incidentLatitude] as const, scheduleIncidentFly);
</script>

<template>
  <div
    class="accident-rescue-map"
    :class="{ 'accident-rescue-map--pass-through': props.passThrough }"
  >
    <div class="accident-rescue-map__depth" aria-hidden="true" />

    <svg v-if="!isEventCommand" class="accident-rescue-map__route" aria-hidden="true">
      <defs>
        <linearGradient
          v-if="routeGradient"
          :id="routeGradientId"
          gradientUnits="userSpaceOnUse"
          :x1="routeGradient.x1"
          :y1="routeGradient.y1"
          :x2="routeGradient.x2"
          :y2="routeGradient.y2"
        >
          <stop offset="0%" style="stop-color: var(--map-route-orange-pale)" />
          <stop offset="55%" style="stop-color: var(--color-alarm-2)" />
          <stop offset="100%" style="stop-color: var(--map-route-orange-deep)" />
        </linearGradient>
      </defs>
      <path
        v-if="routeBasePathD"
        class="accident-rescue-map__route-line accident-rescue-map__route-line--base"
        :d="routeBasePathD"
      />
      <path
        v-if="routeRemainingPathD"
        class="accident-rescue-map__route-line accident-rescue-map__route-line--remaining"
        :d="routeRemainingPathD"
      />
      <path
        v-if="routeTraveledPathD"
        class="accident-rescue-map__route-line accident-rescue-map__route-line--traveled"
        :d="routeTraveledPathD"
        :stroke="`url(#${routeGradientId})`"
      />
    </svg>

    <!-- 起点 -->
    <div
      v-if="!isEventCommand"
      class="accident-rescue-map__gate gate-marker"
      :style="markerStyleFor('gate')"
    >
      <div class="gate-marker__card">
        <img class="gate-marker__card-bg" :src="accidentRescueAssets.gateLabelBg" alt="" />
        <div class="gate-marker__name">{{ accidentRescueMapMarkers.gate.label }}</div>
        <div class="gate-marker__start">
          <span class="gate-marker__flow-icon" aria-hidden="true" />
          <span class="gate-marker__start-label">{{ accidentRescueMapMarkers.gate.subLabel }}</span>
        </div>
      </div>
      <div class="gate-marker__pin" aria-hidden="true">
        <span class="gate-marker__pin-outer" />
        <span class="gate-marker__pin-inner" />
      </div>
    </div>

    <!-- 终点：事件标记 -->
    <div class="emergency-pin-marker" :style="markerStyleFor('fire')">
      <div class="emergency-pin-marker__anchor">
        <div
          v-if="isEventCommand"
          class="emergency-pin-marker__command-label"
          @wheel="forwardWheelToCesiumMap"
        >
          <div class="emergency-pin-marker__label-head">
            <span
              v-if="hazardSourceLevel"
              class="emergency-pin-marker__hazard-level"
              :class="hazardLevelToneClass(hazardSourceLevel)"
            >
              {{ formatHazardSourceLevelLabel(hazardSourceLevel) }}
            </span>
            <button
              type="button"
              class="emergency-pin-marker__facility-btn"
              @click="handleFacilityDetailClick"
            >
              设施详情
            </button>
          </div>
          <div class="emergency-pin-marker__label-title">{{ incidentTitle }}</div>
        </div>

        <div class="emergency-pin-marker__body" @wheel="forwardWheelToCesiumMap">
          <img class="emergency-pin-marker__pin" :src="incidentPinIcon" alt="" />
        </div>

        <div
          v-if="!isEventCommand"
          class="emergency-pin-marker__popup"
          :class="{ 'emergency-pin-marker__popup--drill': markerKind === 'drill' }"
          @wheel="forwardWheelToCesiumMap"
        >
          <div class="emergency-pin-marker__popup-title">
            {{ incidentTitle || (markerKind === 'drill' ? '应急演练' : '应急事件') }}
          </div>

          <div class="emergency-pin-marker__field emergency-pin-marker__field--location">
            <span class="emergency-pin-marker__label">位置：</span>
            <span class="emergency-pin-marker__value">{{ fireLocation }}</span>
          </div>

          <div class="emergency-pin-marker__field emergency-pin-marker__field--status">
            <span class="emergency-pin-marker__label">状态：</span>
            <span class="emergency-pin-marker__status-value">
              <img :src="fireEmergencyAssets.alarmStatusDot" alt="" />
              <span class="emergency-pin-marker__status-text">{{ fireStatus }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 行进车辆 -->
    <div v-if="!isEventCommand" class="vehicle-marker" :style="vehicleMarkerStyle()">
      <button
        type="button"
        class="vehicle-marker__pin"
        @click="showVehiclePopup = !showVehiclePopup"
        @wheel="forwardWheelToCesiumMap"
      >
        <img class="vehicle-marker__car" :src="accidentRescueAssets.vehicleMarkerCar" alt="" />
      </button>

      <div v-show="showVehiclePopup" class="vehicle-marker__label" @wheel="forwardWheelToCesiumMap">
        <div class="vehicle-marker__popup map-info-panel map-info-panel--vehicle">
          <div class="vehicle-marker__title">{{ accidentRescueMapMarkers.vehicle.title }}</div>
          <div class="vehicle-marker__row">
            位置：{{ accidentRescueMapMarkers.vehicle.location }}
          </div>
          <div class="vehicle-marker__row">{{ vehicleTimeText }}</div>
        </div>
      </div>
    </div>

    <div v-if="!isEventCommand && !props.hideControls" class="accident-rescue-map__controls-column">
      <div class="map-controls">
        <MapLayerPanel />
        <button
          v-for="(ctrl, index) in accidentRescueMapControls"
          :key="ctrl.key"
          type="button"
          class="map-control-btn"
          :title="ctrl.label"
          :aria-label="ctrl.label"
          @click="handleMapControl(ctrl.key)"
        >
          <SpriteImage :sprite="accidentRescueSprites.mapControlButtons[index]" />
        </button>
        <MapCleanModeButton />
      </div>
    </div>
  </div>
</template>

<style scoped>
.accident-rescue-map {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.accident-rescue-map--pass-through,
.accident-rescue-map--pass-through * {
  pointer-events: none !important;
}

.accident-rescue-map__depth {
  position: absolute;
  inset: 0;
  z-index: var(--z-local-1);
  pointer-events: none;
  background: var(--map-vignette-rescue-bg);
}

.accident-rescue-map__route {
  position: absolute;
  inset: 0;
  z-index: var(--z-local-2);
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}

.accident-rescue-map__route-line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.accident-rescue-map__route-line--base,
.accident-rescue-map__route-line--remaining {
  stroke: var(--map-route-orange-mid);
  stroke-width: 7;
  stroke-dasharray: 16 12;
}

.accident-rescue-map__route-line--base {
  opacity: 0.22;
}

.accident-rescue-map__route-line--remaining {
  opacity: 0.42;
}

.accident-rescue-map__route-line--traveled {
  stroke-width: 7;
  opacity: 1;
  filter: drop-shadow(0 0 5px color-mix(in srgb, var(--map-route-orange-glow) 55%, transparent));
}

.gate-marker {
  --gate-pin-size: 20px;

  position: absolute;
  z-index: var(--z-local-4);
  width: 121px;
  height: 96px;
  pointer-events: none;
  transform: translate(-94px, -86px);
}

.gate-marker__card {
  position: relative;
  width: 121px;
  height: 75.5px;
}

.gate-marker__card-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.gate-marker__name {
  position: relative;
  padding: 5px 10px 0 26px;
  font-size: 12px;
  color: var(--color-text-strong);
  white-space: nowrap;
}

.gate-marker__start {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 17px;
  padding: 8px 10px 0 6px;
  font-size: 12px;
  white-space: nowrap;
}

.gate-marker__flow-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 35%,
    var(--map-route-orange-pale) 0%,
    var(--color-alarm-2) 55%,
    var(--map-route-orange-deep) 100%
  );
  box-shadow: 0 0 6px color-mix(in srgb, var(--map-route-orange-glow) 55%, transparent);
}

.gate-marker__start-label {
  margin-left: 6px;
  color: var(--map-route-orange-text);
}

.gate-marker__pin {
  position: absolute;
  left: 84px;
  top: 76px;
  width: var(--gate-pin-size);
  height: var(--gate-pin-size);
}

.gate-marker__pin-outer {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid var(--map-route-orange-mid);
  background: color-mix(in srgb, var(--map-route-orange-mid) 18%, transparent);
  box-shadow: 0 0 8px color-mix(in srgb, var(--map-route-orange-glow) 50%, transparent);
}

.gate-marker__pin-inner {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 10px;
  height: 10px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: linear-gradient(
    145deg,
    var(--map-route-orange-pale) 0%,
    var(--color-alarm-2) 55%,
    var(--map-route-orange-deep) 100%
  );
}

.emergency-pin-marker {
  position: absolute;
  z-index: var(--z-marker);
  pointer-events: none;
}

.emergency-pin-marker__anchor {
  position: relative;
  width: 66px;
  transform: translate(-50%, -100%);
  transform-origin: center bottom;
}

.emergency-pin-marker__command-label {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 220px;
  padding: 6px 8px;
  box-sizing: border-box;
  background: var(--map-event-label-bg);
  border: 1px solid color-mix(in srgb, var(--map-border) 42%, transparent);
  border-radius: 6px;
  pointer-events: auto;
}

.emergency-pin-marker__label-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
}

.emergency-pin-marker__label-head:not(:has(.emergency-pin-marker__hazard-level)) {
  justify-content: flex-end;
}

.emergency-pin-marker__label-title {
  font-size: 13px;
  line-height: 1.35;
  color: var(--color-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.emergency-pin-marker__hazard-level {
  flex-shrink: 0;
  padding: 1px 8px;
  font-size: 11px;
  line-height: 1.35;
  color: var(--color-text-strong);
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
}

.emergency-pin-marker__hazard-level.is-level-one {
  background: var(--map-hazardb-l1);
}

.emergency-pin-marker__hazard-level.is-level-two {
  background: var(--map-hazardb-l2);
}

.emergency-pin-marker__hazard-level.is-level-three {
  background: var(--map-hazardb-l3);
  color: var(--map-hazardb-l3-fg);
}

.emergency-pin-marker__hazard-level.is-level-four {
  background: var(--map-hazardb-l4);
}

.emergency-pin-marker__facility-btn {
  flex-shrink: 0;
  height: 22px;
  padding: 0 8px;
  border: 1px solid var(--map-facility-btn-border);
  border-radius: 2px;
  background: var(--map-facility-btn-bg);
  color: var(--map-facility-btn-fg);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.emergency-pin-marker__body {
  position: relative;
  width: 66px;
  height: 93px;
  pointer-events: auto;
}

.emergency-pin-marker__pin {
  display: block;
  width: 66px;
  height: 93px;
  object-fit: contain;
}

.emergency-pin-marker__popup {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 6px);
  top: auto;
  transform: translateX(-50%);
  width: 138px;
  min-height: 91px;
  box-sizing: border-box;
  padding: 6px 11px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--map-popup-red-bg);
  border: 1px solid color-mix(in srgb, var(--map-popup-red-border) 42%, transparent);
  border-radius: 6px;
  box-shadow: inset 0 0 10px var(--map-popup-red-glow);
  pointer-events: auto;
  overflow: hidden;
}

.emergency-pin-marker__popup--drill {
  background: var(--map-popup-drill-bg);
  border-color: color-mix(in srgb, var(--map-popup-drill-border) 42%, transparent);
  box-shadow: inset 0 0 10px color-mix(in srgb, var(--map-popup-drill-border) 8%, transparent);
}

.emergency-pin-marker__popup-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-strong);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.emergency-pin-marker__field {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  column-gap: 2px;
  align-items: start;
  font-size: 12px;
  line-height: 1.45;
  color: var(--map-popup-red-text);
}

.emergency-pin-marker__popup--drill .emergency-pin-marker__field,
.emergency-pin-marker__popup--drill .emergency-pin-marker__label {
  color: var(--map-route-orange-text-soft);
}

.emergency-pin-marker__field--status {
  align-items: center;
}

.emergency-pin-marker__label {
  flex-shrink: 0;
  white-space: nowrap;
}

.emergency-pin-marker__value {
  min-width: 0;
  word-break: break-all;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.emergency-pin-marker__status-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
}

.emergency-pin-marker__status-value img {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
}

.emergency-pin-marker__status-text {
  color: var(--map-danger-deep);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.emergency-pin-marker__popup--drill .emergency-pin-marker__status-text {
  color: var(--accent-gold);
}

.map-info-panel {
  box-sizing: border-box;
  background: var(--map-info-panel-bg);
  border: 1px solid color-mix(in srgb, var(--map-border) 55%, transparent);
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  box-shadow: inset 0 0 12px var(--map-info-panel-glow);
}

.map-info-panel--alarm {
  background: var(--map-info-panel-alarm-bg);
  border-color: color-mix(in srgb, var(--map-popup-red-border) 50%, transparent);
  box-shadow: inset 0 0 10px var(--map-info-panel-alarm-glow);
}

.map-info-panel--vehicle {
  background: var(--map-info-panel-vehicle-bg);
}

.map-info-panel__row {
  font-size: 12px;
  line-height: 1.45;
  color: var(--map-popup-red-text);
  word-break: break-all;
}

.map-info-panel__row + .map-info-panel__row {
  margin-top: 8px;
}

.map-info-panel__row--status {
  display: flex;
  align-items: center;
  gap: 0;
}

.map-info-panel__label {
  flex-shrink: 0;
}

.map-info-panel__value {
  min-width: 0;
}

.map-info-panel__status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.map-info-panel__status img {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
}

.map-info-panel__status-text {
  color: var(--map-danger-deep);
  white-space: nowrap;
}

.vehicle-marker {
  position: absolute;
  z-index: var(--z-local-6);
  width: 0;
  height: 0;
  pointer-events: none;
}

.vehicle-marker__pin {
  position: absolute;
  left: 0;
  top: 0;
  width: 37px;
  height: 37px;
  padding: 0;
  border: none;
  background: transparent;
  transform: translate(-50%, -50%) rotate(var(--vehicle-heading, 0deg));
  transform-origin: 50% 50%;
  pointer-events: auto;
  cursor: pointer;
}

.vehicle-marker__car {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.vehicle-marker__label {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
}

/* 标签在标点右侧，左侧尖角指向圆心 */
.vehicle-marker__popup {
  position: absolute;
  left: 22px;
  top: -45px;
  width: max-content;
  min-width: 138px;
  max-width: 180px;
  padding: 7px 14px 10px 11px;
  pointer-events: auto;
}

.vehicle-marker__popup::before {
  content: '';
  position: absolute;
  left: -7px;
  top: 50%;
  transform: translateY(-50%);
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-right: 7px solid var(--map-vehicle-veil);
  filter: drop-shadow(-1px 0 0 color-mix(in srgb, var(--map-border) 45%, transparent));
}

.vehicle-marker__title {
  font-size: 15px;
  color: var(--color-text-strong);
  line-height: 22px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vehicle-marker__row {
  font-size: 12px;
  color: var(--map-popup-text-blue);
  line-height: 17px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vehicle-marker__row + .vehicle-marker__row {
  margin-top: 6px;
}

.accident-rescue-map__controls-column {
  position: absolute;
  right: 465px;
  top: 123px;
  bottom: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  z-index: var(--z-local-6);
  pointer-events: auto;
}

.map-controls {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
  pointer-events: auto;
}

.map-control-btn {
  display: flex;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  line-height: 0;
}
</style>
