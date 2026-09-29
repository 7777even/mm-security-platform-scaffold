<script setup lang="ts">
import { computed } from 'vue';
import { useWorldMarkerScreenPositions } from '../../lib/composables/useCesiumScreenAnchor';
import { getSharedMap } from '../../lib/composables/sharedCesiumBridge';
import { coordsForPagedSpread } from '../../lib/data/rescueMapCoords';
import {
  auxiliaryKnowledgeScatterActive,
  auxiliaryKnowledgeCategory,
  auxiliaryKnowledgeCount,
  closeAuxiliaryKnowledgeScatter,
} from '../../lib/composables/useAuxiliaryKnowledgeMapView';

// theme 不赋值给 const（避免 vue-tsc TS6133）；模板直接引用。
withDefaults(defineProps<{ theme?: 'accident' | 'drill' }>(), { theme: 'accident' });

interface AuxKnowledgeMarker {
  mapKey: string;
  label: string;
  longitude: number;
  latitude: number;
}

// 知识项无真实坐标 → 在厂区边界内确定性散布（位置示意，非真实点位）。
const markers = computed<AuxKnowledgeMarker[]>(() => {
  if (!auxiliaryKnowledgeScatterActive.value) return [];
  const n = auxiliaryKnowledgeCount.value;
  const cat = auxiliaryKnowledgeCategory.value;
  return Array.from({ length: n }, (_, index) => {
    const { longitude, latitude } = coordsForPagedSpread(index, n, 1, index);
    return { mapKey: `aux-knowledge-${index}`, label: cat, longitude, latitude };
  });
});

const { styleFor: markerStyleFor } = useWorldMarkerScreenPositions(() => {
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72.05;
  return markers.value.map((m) => ({
    key: m.mapKey,
    longitude: m.longitude,
    latitude: m.latitude,
    height,
  }));
});
</script>

<template>
  <div class="aux-knowledge-map-root">
    <div v-if="auxiliaryKnowledgeScatterActive" class="aux-knowledge-map-layer" aria-hidden="true">
      <div
        v-for="marker in markers"
        :key="marker.mapKey"
        class="aux-knowledge-marker"
        :class="`aux-knowledge-marker--${theme}`"
        :style="markerStyleFor(marker.mapKey)"
      >
        <div class="aux-knowledge-marker__box">
          <div class="aux-knowledge-marker__title">{{ marker.label }}</div>
        </div>
        <div class="aux-knowledge-marker__stem" />
        <div class="aux-knowledge-marker__dot" />
      </div>
    </div>
    <button
      v-if="auxiliaryKnowledgeScatterActive"
      class="aux-knowledge-map-layer__close"
      type="button"
      aria-label="收起应急辅助信息落图"
      @click="closeAuxiliaryKnowledgeScatter()"
    >
      收起落图
    </button>
  </div>
</template>

<style scoped>
.aux-knowledge-map-root {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: var(--z-base);
}

.aux-knowledge-map-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
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

.aux-knowledge-marker--drill .aux-knowledge-marker__box {
  background: rgb(48 32 10 / 88%);
  border-color: rgb(200 140 50 / 35%);
}

.aux-knowledge-marker__title {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-strong);
  line-height: 1.35;
  word-break: break-word;
}

.aux-knowledge-marker__stem {
  width: 1px;
  height: 10px;
  margin: 0 auto;
  background: rgb(0 180 255 / 55%);
}

.aux-knowledge-marker--drill .aux-knowledge-marker__stem {
  background: rgb(240 168 60 / 55%);
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

.aux-knowledge-marker--drill .aux-knowledge-marker__dot {
  background: #f0a83c;
  box-shadow: 0 0 8px rgb(240 168 60 / 55%);
}

.aux-knowledge-map-layer__close {
  position: absolute;
  top: 12px;
  right: 12px;
  height: 26px;
  padding: 0 10px;
  border: 1px solid rgb(31 157 224 / 46%);
  border-radius: 2px;
  background: rgb(0 47 82 / 82%);
  color: #8fcff2;
  font: 11px var(--font-body);
  cursor: pointer;
  pointer-events: auto;
}

.aux-knowledge-map-layer__close:hover {
  border-color: rgb(31 157 224 / 70%);
  color: #cdeaff;
}
</style>
