<script setup lang="ts">
import { getSharedMap } from '@/composables/sharedCesiumBridge';
import { useWorldMarkerScreenPositions } from '@/composables/useCesiumScreenAnchor';
import type { TyphoonMapRiskPoint } from '@/services/map-data/typhoonEmergencyMock';

const props = defineProps<{
  points: TyphoonMapRiskPoint[];
}>();

const emit = defineEmits<{
  'open-video': [point: TyphoonMapRiskPoint];
}>();

const { styleFor: markerStyleFor } = useWorldMarkerScreenPositions(
  () => {
    const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72.05;
    return props.points.map((point) => ({
      key: point.id,
      longitude: point.longitude,
      latitude: point.latitude,
      height,
    }));
  },
  { scaleWithZoom: false },
);
</script>

<template>
  <div class="tw-risk-map">
    <div
      v-for="point in points"
      :key="point.id"
      class="tw-risk-marker"
      :class="`tw-risk-marker--${point.status}`"
      :style="markerStyleFor(point.id)"
    >
      <div class="tw-risk-marker__anchor">
        <div
          class="tw-risk-marker__card"
          :style="{
            transform: `translate(${point.labelOffsetX ?? 0}px, ${point.labelOffsetY ?? 0}px)`,
          }"
          :title="`${point.name}\n责任单位：${point.responsibleUnit}\n预布置：${point.predeployed ? '是' : '否'}\n布置情况：${point.deployment}`"
        >
          <div class="tw-risk-marker__name">
            {{ point.name }}
          </div>
          <div class="tw-risk-marker__status">{{ point.statusText }}</div>
          <div v-if="point.kind === 'resource'" class="tw-risk-marker__resource-meta">
            <span>{{ point.responsibleUnit }}</span
            ><span>{{ point.deployment }}</span>
          </div>
          <button
            v-else-if="point.videoIds?.length"
            type="button"
            class="tw-risk-marker__btn"
            @click="emit('open-video', point)"
          >
            视频监控 {{ point.videoIds.length }}路
          </button>
          <span v-else class="tw-risk-marker__empty">暂无关联视频</span>
        </div>

        <div class="tw-risk-marker__pin-wrap">
          <span class="tw-risk-marker__ripple" />
          <span class="tw-risk-marker__ripple tw-risk-marker__ripple--2" />
          <span v-if="point.clusterCount" class="tw-risk-marker__cluster">{{
            point.clusterCount
          }}</span>
          <div class="tw-risk-marker__pin" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tw-risk-map {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.tw-risk-marker {
  position: absolute;
  z-index: var(--z-local-4);
  pointer-events: none;
}

.tw-risk-marker__anchor {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -100%);
  transform-origin: center bottom;
}

.tw-risk-marker__card {
  margin-bottom: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--map-border) 35%, transparent);
  background: color-mix(in srgb, var(--color-bg) 88%, transparent);
  backdrop-filter: blur(4px);
  white-space: nowrap;
  box-shadow: 0 6px 18px rgb(0 0 0 / 28%);
  pointer-events: auto;
}

.tw-risk-marker__name {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: color-mix(in srgb, var(--color-text-strong) 92%, transparent);
  margin-bottom: 4px;
}

.tw-risk-marker__status {
  margin: 0 0 4px;
  color: var(--risk-color);
  font-size: 10px;
}

.tw-risk-marker__resource-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 180px;
  color: var(--color-text-muted);
  font-size: 9px;
  white-space: normal;
  line-height: 1.3;
}

.tw-risk-marker__resource-meta span:first-child {
  color: color-mix(in srgb, var(--map-marker-cyan) 65%, white);
}

.tw-risk-marker__btn {
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  border: 1px solid color-mix(in srgb, var(--map-border) 40%, transparent);
  background: color-mix(in srgb, var(--map-border) 14%, transparent);
  color: color-mix(in srgb, var(--color-text-strong) 90%, transparent);
  font-size: 10px;
  cursor: pointer;
  pointer-events: auto;
}

.tw-risk-marker__pin-wrap {
  position: relative;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.tw-risk-marker__pin {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 14px;
  height: 14px;
  margin-left: -7px;
  margin-top: -7px;
  border-radius: 50%;
  background: var(--risk-color);
  border: 2px solid color-mix(in srgb, var(--color-text-strong) 90%, transparent);
  box-shadow: 0 0 12px var(--risk-glow);
  animation: tw-risk-pin-breathe 2.4s ease-in-out infinite;
}

.tw-risk-marker__ripple {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 14px;
  height: 14px;
  margin-left: -7px;
  margin-top: -7px;
  border-radius: 50%;
  border: 1px solid var(--risk-color);
  pointer-events: none;
  animation: tw-risk-pin-ripple 2.4s ease-out infinite;
}

.tw-risk-marker__empty {
  display: block;
  color: color-mix(in srgb, var(--color-text-muted) 78%, transparent);
  font-size: 9px;
}

.tw-risk-marker--critical {
  --risk-color: var(--color-alarm-1);
  --risk-glow: color-mix(in srgb, var(--color-alarm-1) 65%, transparent);
}

.tw-risk-marker--warning {
  --risk-color: var(--color-alarm-2);
  --risk-glow: color-mix(in srgb, var(--color-alarm-2) 62%, transparent);
}

.tw-risk-marker--normal {
  --risk-color: var(--color-success);
  --risk-glow: color-mix(in srgb, var(--color-success) 58%, transparent);
}

.tw-risk-marker__ripple--2 {
  animation-delay: 1.2s;
}

.tw-risk-marker__cluster {
  position: absolute;
  top: -6px;
  right: -10px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-warning) 95%, transparent);
  color: var(--color-bg);
  font-size: 11px;
  line-height: 18px;
  text-align: center;
  z-index: var(--z-local-2);
}

@keyframes tw-risk-pin-breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.88;
  }

  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

@keyframes tw-risk-pin-ripple {
  0% {
    transform: scale(1);
    opacity: 0.65;
  }

  100% {
    transform: scale(2.8);
    opacity: 0;
  }
}
</style>
