<script setup lang="ts">
import { computed, watch } from 'vue';
import { useAccidentRescueRoute } from '@/composables/useAccidentRescueRoute';
import { useWorldMarkerScreenPositions } from '@/composables/useCesiumScreenAnchor';
import { getSharedMap } from '@/composables/sharedCesiumBridge';
import { forwardWheelToCesiumMap } from '@/composables/useMapOverlayWheelPassthrough';
import {
  resolveSecurityTrackWaypoints,
  type SecurityTrackMode,
} from '@/services/map-data/securityTrackMock';

const props = defineProps<{
  mode: SecurityTrackMode;
  playback: {
    playing: boolean | { value: boolean };
    speed: number | { value: number };
    progress?: { value: number };
  };
}>();

const routeGradientId = 'security-track-route-gradient';
const waypoints = resolveSecurityTrackWaypoints(props.mode);

function readBoolean(value: boolean | { value: boolean }) {
  return typeof value === 'object' && value != null ? value.value : value;
}

function readNumber(value: number | { value: number }) {
  return typeof value === 'object' && value != null ? value.value : value;
}

function overlayHeight() {
  return getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72;
}

const {
  routeProgress,
  routeBasePathD,
  routeRemainingPathD,
  routeTraveledPathD,
  routeGradient,
  vehicleMarkerStyle,
} = useAccidentRescueRoute(overlayHeight, {
  enabled: true,
  waypoints,
  playback: {
    playing: computed(() => readBoolean(props.playback.playing) ?? true),
    speed: computed(() => readNumber(props.playback.speed) ?? 1),
    progress: props.playback.progress,
  },
});

watch(
  routeProgress,
  (value) => {
    const external = props.playback.progress;
    if (!external) return;
    const { initialProgress, endProgress } = waypoints;
    const span = endProgress - initialProgress;
    external.value = span > 0 ? Math.max(0, Math.min(1, (value - initialProgress) / span)) : 0;
  },
  { immediate: true },
);

const markerTargets = () => {
  const height = overlayHeight();
  const start = waypoints.points[0];
  const end = waypoints.points[waypoints.points.length - 1];
  if (!start || !end) return [];
  return [
    { key: 'start', longitude: start.longitude, latitude: start.latitude, height },
    { key: 'end', longitude: end.longitude, latitude: end.latitude, height },
  ];
};

const { styleFor: markerStyleFor } = useWorldMarkerScreenPositions(markerTargets, {
  scaleWithZoom: false,
});

const isVehicle = computed(() => props.mode === 'vehicle');
</script>

<template>
  <div class="security-track-map">
    <div class="security-track-map__depth" aria-hidden="true" />

    <svg class="security-track-map__route" aria-hidden="true">
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
          <stop offset="0%" style="stop-color: var(--accent-cyan)" />
          <stop offset="55%" style="stop-color: var(--map-marker-cyan)" />
          <stop offset="100%" style="stop-color: var(--map-track-blue)" />
        </linearGradient>
      </defs>
      <path
        v-if="routeBasePathD"
        class="security-track-map__route-line security-track-map__route-line--base"
        :d="routeBasePathD"
      />
      <path
        v-if="routeRemainingPathD"
        class="security-track-map__route-line security-track-map__route-line--remaining"
        :d="routeRemainingPathD"
      />
      <path
        v-if="routeTraveledPathD"
        class="security-track-map__route-line security-track-map__route-line--traveled"
        :d="routeTraveledPathD"
        :stroke="`url(#${routeGradientId})`"
      />
    </svg>

    <div class="track-end-marker track-end-marker--start" :style="markerStyleFor('start')">
      <span class="track-end-marker__badge track-end-marker__badge--start">始</span>
    </div>

    <div class="track-end-marker track-end-marker--end" :style="markerStyleFor('end')">
      <span class="track-end-marker__badge track-end-marker__badge--end">终</span>
    </div>

    <div
      class="track-entity-marker"
      :class="isVehicle ? 'track-entity-marker--vehicle' : 'track-entity-marker--person'"
      :style="vehicleMarkerStyle()"
      @wheel="forwardWheelToCesiumMap"
    >
      <span v-if="isVehicle" class="track-entity-marker__vehicle-icon" aria-hidden="true" />
      <span v-else class="track-entity-marker__person-icon" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
.security-track-map {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.security-track-map__depth {
  position: absolute;
  inset: 0;
  z-index: var(--z-local-1);
  pointer-events: none;
  background:
    radial-gradient(
      ellipse 90% 80% at 50% 42%,
      transparent 0%,
      color-mix(in srgb, var(--color-bg) 12%, transparent) 50%,
      color-mix(in srgb, var(--color-bg) 45%, transparent) 100%
    ),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--color-bg) 55%, transparent) 0%,
      transparent 14%,
      transparent 78%,
      color-mix(in srgb, var(--color-bg) 65%, transparent) 100%
    ),
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--color-bg) 60%, transparent) 0%,
      transparent 22%,
      transparent 78%,
      color-mix(in srgb, var(--color-bg) 60%, transparent) 100%
    );
}

.security-track-map__route {
  position: absolute;
  inset: 0;
  z-index: var(--z-local-3);
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.security-track-map__route-line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.security-track-map__route-line--base,
.security-track-map__route-line--remaining {
  stroke: color-mix(in srgb, var(--map-border) 22%, transparent);
  stroke-width: 3;
  stroke-dasharray: 6 8;
}

.security-track-map__route-line--traveled {
  stroke-width: 4;
  filter: drop-shadow(0 0 6px color-mix(in srgb, var(--map-marker-cyan) 35%, transparent));
}

.track-end-marker {
  position: absolute;
  z-index: var(--z-local-4);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.track-end-marker__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-strong);
  box-shadow: 0 2px 8px rgb(0 0 0 / 35%);
}

.track-end-marker__badge--start {
  background: var(--map-track-start-badge-bg);
  border: 1px solid color-mix(in srgb, var(--color-success) 60%, transparent);
}

.track-end-marker__badge--end {
  background: var(--map-track-end-badge-bg);
  border: 1px solid color-mix(in srgb, var(--color-danger) 55%, transparent);
}

.track-entity-marker {
  position: absolute;
  z-index: var(--z-marker);
  transform: translate(-50%, -50%);
  pointer-events: auto;
}

.track-entity-marker--vehicle .track-entity-marker__vehicle-icon {
  display: block;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--map-vehicle-dot-bg);
  border: 2px solid color-mix(in srgb, var(--color-text-strong) 85%, transparent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--color-warning) 45%, transparent);
  transform: rotate(var(--vehicle-heading, 0deg));
}

.track-entity-marker--person .track-entity-marker__person-icon {
  display: block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--map-person-dot-bg);
  border: 2px solid color-mix(in srgb, var(--color-text-strong) 85%, transparent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--map-border) 45%, transparent);
}
</style>
