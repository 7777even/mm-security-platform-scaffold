<script setup lang="ts">
import { getSharedMap } from '../../lib/composables/sharedCesiumBridge';
import { useWorldMarkerScreenPositions } from '../../lib/composables/useCesiumScreenAnchor';
import type { TyphoonMapRiskPoint } from '../../lib/data/typhoonEmergencyMock';

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
  z-index: 4;
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
  border: 1px solid rgb(0 150 236 / 35%);
  background: rgb(0 18 40 / 88%);
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
  color: rgb(255 255 255 / 92%);
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
  color: #9fc1dc;
  font-size: 9px;
  white-space: normal;
  line-height: 1.3;
}

.tw-risk-marker__resource-meta span:first-child {
  color: #71d6ff;
}

.tw-risk-marker__btn {
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  border: 1px solid rgb(0 150 236 / 40%);
  background: rgb(0 150 236 / 14%);
  color: rgb(255 255 255 / 90%);
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
  border: 2px solid rgb(255 255 255 / 90%);
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
  color: rgb(156 180 202 / 78%);
  font-size: 9px;
}

.tw-risk-marker--critical {
  --risk-color: #ff3b3b;
  --risk-glow: rgb(255 59 59 / 65%);
}

.tw-risk-marker--warning {
  --risk-color: #ff9f2f;
  --risk-glow: rgb(255 159 47 / 62%);
}

.tw-risk-marker--normal {
  --risk-color: #29d383;
  --risk-glow: rgb(41 211 131 / 58%);
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
  background: rgb(255 196 64 / 95%);
  color: #1a1200;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
  z-index: 2;
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
