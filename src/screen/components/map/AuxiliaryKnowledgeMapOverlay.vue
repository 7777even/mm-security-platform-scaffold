<script setup lang="ts">
import { computed } from 'vue';
import { useWorldMarkerScreenPositions } from '../../lib/composables/useCesiumScreenAnchor';
import { getSharedMap } from '../../lib/composables/sharedCesiumBridge';
import { coordsForPagedSpread } from '../../lib/data/rescueMapCoords';
import {
  auxiliaryKnowledgeScatterActive,
  auxiliaryKnowledgeCategory,
  auxiliaryKnowledgeCount,
  AUXILIARY_KNOWLEDGE_SCATTER_CAP,
} from '../../lib/composables/useAuxiliaryKnowledgeMapView';

withDefaults(
  defineProps<{
    /** accident：蓝(应急事件)；drill：橙(演练) */
    theme?: 'accident' | 'drill';
  }>(),
  { theme: 'accident' },
);

interface KnowledgeMapMarker {
  mapKey: string;
  label: string;
  meta?: string;
  longitude: number;
  latitude: number;
}

// 知识项无真实坐标，按统计数量在厂区边界内确定性散布；大数封顶避免海量 DOM 标点
const scatterCount = computed(() =>
  Math.max(0, Math.min(auxiliaryKnowledgeCount.value, AUXILIARY_KNOWLEDGE_SCATTER_CAP)),
);

const markers = computed<KnowledgeMapMarker[]>(() => {
  if (!auxiliaryKnowledgeScatterActive.value) return [];
  const category = auxiliaryKnowledgeCategory.value;
  const n = scatterCount.value;
  return Array.from({ length: n }, (_, index) => {
    const { longitude, latitude } = coordsForPagedSpread(index, n, 1, index + 1);
    return {
      mapKey: `aux-knowledge-${category}-${index}`,
      label: category,
      meta: n > 1 ? `第 ${index + 1} 项` : undefined,
      longitude,
      latitude,
    };
  });
});

const { styleFor: markerStyleFor } = useWorldMarkerScreenPositions(() => {
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72.05;
  return markers.value.map((marker) => ({
    key: marker.mapKey,
    longitude: marker.longitude,
    latitude: marker.latitude,
    height,
  }));
});
</script>

<template>
  <div
    class="aux-knowledge-map-layer"
    :class="`aux-knowledge-map-layer--${theme}`"
    aria-hidden="true"
  >
    <div
      v-for="marker in markers"
      :key="marker.mapKey"
      class="aux-knowledge-marker"
      :style="markerStyleFor(marker.mapKey)"
    >
      <div class="aux-knowledge-marker__box">
        <div class="aux-knowledge-marker__title">{{ marker.label }}</div>
        <div v-if="marker.meta" class="aux-knowledge-marker__meta">{{ marker.meta }}</div>
      </div>
      <div class="aux-knowledge-marker__stem" />
      <div class="aux-knowledge-marker__dot" />
    </div>
  </div>
</template>

<style scoped>
.aux-knowledge-map-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: var(--z-base);
}

.aux-knowledge-marker {
  position: absolute;
  transform: translate(-50%, -100%);
  pointer-events: none;
}

.aux-knowledge-marker__box {
  max-width: 148px;
  padding: 4px 8px;
  border-radius: 2px;
  background: rgb(0 18 40 / 88%);
  border: 1px solid rgb(0 140 220 / 35%);
  text-align: center;
}

.aux-knowledge-map-layer--drill .aux-knowledge-marker__box {
  border-color: rgb(236 166 65 / 38%);
  background: rgb(48 32 10 / 80%);
}

.aux-knowledge-marker__title {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-strong);
  line-height: 1.35;
  word-break: break-word;
}

.aux-knowledge-marker__meta {
  margin-top: 2px;
  font-size: 10px;
  color: var(--map-device-offline);
  line-height: 1.35;
}

.aux-knowledge-marker__stem {
  width: 1px;
  height: 10px;
  margin: 0 auto;
  background: rgb(0 180 255 / 55%);
}

.aux-knowledge-map-layer--drill .aux-knowledge-marker__stem {
  background: rgb(236 166 65 / 55%);
}

.aux-knowledge-marker__dot {
  width: 8px;
  height: 8px;
  margin: 0 auto;
  border-radius: 50%;
  background: #00c8ff;
  border: 2px solid rgb(255 255 255 / 85%);
  box-shadow: 0 0 8px rgb(0 200 255 / 55%);
}

.aux-knowledge-map-layer--drill .aux-knowledge-marker__dot {
  background: #f0a83c;
  box-shadow: 0 0 8px rgb(236 166 65 / 55%);
}
</style>
