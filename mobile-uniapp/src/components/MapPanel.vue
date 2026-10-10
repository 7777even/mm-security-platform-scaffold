<script setup lang="ts">
import { computed } from 'vue';
import type { MapMarker } from '@/lib/mapAlarm';

// 真实地图组件（替代 PoC 占位）：uni <map> 原生组件，App/小程序走系统地图，H5 走 web 地图。
// MapMarker 用 {lng,lat}，uni <map> 的 markers 用 {latitude,longitude,id}，此处做转换。
const props = defineProps<{
  height?: string;
  center?: { lng: number; lat: number };
  zoom?: number;
  markers?: MapMarker[];
  label?: string;
  interactive?: boolean;
  /** 轨迹线（如导航路径），经纬度点序列。 */
  polyline?: { lng: number; lat: number }[];
  /** 是否显示设备实时定位蓝点（uni <map> show-location）。 */
  showMyLocation?: boolean;
}>();

const emit = defineEmits<{ (e: 'tap', markerId: string): void }>();

const center = computed(() => {
  if (props.center) return { latitude: props.center.lat, longitude: props.center.lng };
  const first = (props.markers ?? [])[0];
  if (first) return { latitude: first.lat, longitude: first.lng };
  const firstPoly = (props.polyline ?? [])[0];
  if (firstPoly) return { latitude: firstPoly.lat, longitude: firstPoly.lng };
  return { latitude: 31.2304, longitude: 121.4737 }; // 上海默认中心（无标记时兜底）
});

const scale = computed(() => props.zoom ?? 14);

const mapMarkers = computed(() =>
  (props.markers ?? []).map((m, i) => ({
    id: i + 1,
    latitude: m.lat,
    longitude: m.lng,
    title: m.label ?? '',
    width: 24,
    height: 24,
  })),
);

const mapPolyline = computed(() => {
  const pts = props.polyline ?? [];
  if (!pts.length) return [];
  return [
    {
      points: pts.map((p) => ({ latitude: p.lat, longitude: p.lng })),
      color: '#1677ff',
      width: 6,
      dottedLine: false,
      arrowLine: true,
      borderWidth: 1,
      borderColor: '#0b4fb5',
    },
  ];
});

const hasContent = computed(() => (props.markers ?? []).length > 0 || mapPolyline.value.length > 0);

function onMarkerTap(e: { detail?: { markerId?: number } }): void {
  const idx = (e.detail?.markerId ?? 1) - 1;
  const m = (props.markers ?? [])[idx];
  if (m) emit('tap', m.id);
}
</script>

<template>
  <view class="map-panel" :style="height ? { height } : undefined">
    <map
      v-if="hasContent"
      class="map-panel__map"
      :latitude="center.latitude"
      :longitude="center.longitude"
      :scale="scale"
      :markers="mapMarkers"
      :polyline="mapPolyline"
      :show-location="showMyLocation"
      @markertap="onMarkerTap"
    />
    <view v-else class="map-panel__placeholder">
      <text class="map-panel__label">{{ label ?? '态势地图' }}</text>
      <text class="map-panel__count">暂无标记点</text>
    </view>
  </view>
</template>

<style scoped>
.map-panel {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dfeaff, #c7d8ff);
  border-radius: var(--mb-radius-card);
  overflow: hidden;
}

.map-panel__map {
  width: 100%;
  height: 100%;
}

.map-panel__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  color: #2b4a7a;
}

.map-panel__label {
  font-size: var(--mb-fz-form-label);
  font-weight: 600;
}

.map-panel__count {
  font-size: var(--mb-fz-tip);
  opacity: 0.8;
}
</style>
