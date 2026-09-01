<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { getSharedMap } from '@/composables/sharedCesiumBridge';
import { useCesiumScreenAnchor } from '@/composables/useCesiumScreenAnchor';
import { useAlarmDetailPanel } from '@/composables/useAlarmDetailPanel';

const { alarmMapTarget } = useAlarmDetailPanel();

const { anchorStyle } = useCesiumScreenAnchor(() => {
  const target = alarmMapTarget.value;
  if (!target) return null;
  return {
    longitude: target.longitude,
    latitude: target.latitude,
  };
});

function flyToTarget() {
  const target = alarmMapTarget.value;
  if (!target) return;
  getSharedMap()?.flyToWorldPositions?.({
    positions: [{ longitude: target.longitude, latitude: target.latitude }],
    duration: 1.2,
    pitchDeg: -48,
    rangeMultiplier: 1.8,
  });
}

watch(
  alarmMapTarget,
  (target, previous) => {
    if (!target) return;
    if (!previous || previous.id !== target.id) {
      flyToTarget();
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (alarmMapTarget.value) flyToTarget();
});
</script>

<template>
  <div v-if="alarmMapTarget" class="alarm-detail-map-marker" :style="anchorStyle">
    <div class="alarm-detail-map-marker__pulse" />
    <div class="alarm-detail-map-marker__ring" />
    <div class="alarm-detail-map-marker__icon">!</div>
    <div class="alarm-detail-map-marker__popup">
      <span class="alarm-detail-map-marker__popup-title">{{ alarmMapTarget.title }}</span>
      <span class="alarm-detail-map-marker__popup-location">{{ alarmMapTarget.location }}</span>
    </div>
  </div>
</template>

<style scoped>
.alarm-detail-map-marker {
  position: absolute;
  z-index: 6;
  width: 22px;
  height: 22px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.alarm-detail-map-marker__icon {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 20px;
  height: 20px;
  transform: translate(-50%, -50%);
  border: 2px solid color-mix(in srgb, var(--color-text-strong) 90%, transparent);
  border-radius: 50%;
  background: var(--map-alarm-dot-bg);
  color: var(--color-text-strong);
  font-size: 13px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  box-shadow: 0 0 14px color-mix(in srgb, var(--color-alarm-1) 80%, transparent);
  animation: alarm-detail-blink 1s ease-in-out infinite;
}

.alarm-detail-map-marker__pulse {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 20px;
  height: 20px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-alarm-1) 50%, transparent);
  animation: alarm-detail-pulse 1.4s ease-out infinite;
}

.alarm-detail-map-marker__ring {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 34px;
  height: 34px;
  transform: translate(-50%, -50%);
  border: 2px solid color-mix(in srgb, var(--color-danger) 70%, transparent);
  border-radius: 50%;
  animation: alarm-detail-ring 1.4s ease-out infinite;
}

.alarm-detail-map-marker__popup {
  position: absolute;
  left: 30px;
  top: -8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 150px;
  max-width: 240px;
  padding: 6px 10px;
  border: 1px solid color-mix(in srgb, var(--color-danger) 55%, transparent);
  border-radius: 4px;
  background: color-mix(in srgb, var(--color-bg) 92%, transparent);
  box-shadow: 0 4px 14px rgb(0 0 0 / 35%);
}

.alarm-detail-map-marker__popup-title {
  color: color-mix(in srgb, var(--color-danger) 55%, white);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alarm-detail-map-marker__popup-location {
  color: var(--color-text-muted);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes alarm-detail-blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.55;
  }
}

@keyframes alarm-detail-pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.6);
    opacity: 0.9;
  }

  100% {
    transform: translate(-50%, -50%) scale(3.2);
    opacity: 0;
  }
}

@keyframes alarm-detail-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0.9;
  }

  100% {
    transform: translate(-50%, -50%) scale(1.8);
    opacity: 0;
  }
}
</style>
