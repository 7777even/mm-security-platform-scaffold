<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import SpriteImage from '../common/SpriteImage.vue';
import MapLayerPanel from '../common/MapLayerPanel.vue';
import MapCleanModeButton from './MapCleanModeButton.vue';
import MapPointMarker, { type MapPointTone } from '@/components/map/MapPointMarker.vue';
import { productionSprites } from '@/utils/productionSpriteConfig';
import { productionMapControls } from '@/services/productionMapConfig';
import { fetchProductionPersonnel, type PersonnelMarker } from '@/services/production';
import { useMapControls } from '../../lib/composables/useMapControls';
import { useWorldMarkerScreenPositions } from '../../lib/composables/useCesiumScreenAnchor';
import { getSharedMap } from '../../lib/composables/sharedCesiumBridge';
import {
  productionDeviceCurrentPage,
  productionDeviceDrawerActive,
  productionDevicePagedItems,
} from '../../lib/composables/useProductionDeviceListView';
import {
  allDevices,
  communicationDrawerOpen,
  selectedDevice,
  selectedDeviceId,
} from '../../lib/composables/useCommunicationDevices';
import { usePlantArea } from '../../lib/composables/usePlantArea';
import {
  resolvePlantAreaWorldPosition,
  plantAreaBoundaryRings,
  resolvePlantAreaCode,
  type ConcretePlantAreaCode,
} from '../../lib/data/plantAreas';
import { fetchAlarmPoints, type MapPoint } from '@/services/map';

const { onMapControl } = useMapControls();
const { filterByPlantArea } = usePlantArea();

// 人员定位标记来自真实后端（/production/personnel）。统一复用公共点位组件 MapPointMarker，
// 与全站其他大屏页签的标注语言一致；不再自绘切图环 + 弹窗，避免风格脱节。
const personnelMarkers = ref<PersonnelMarker[]>([]);

onMounted(async () => {
  try {
    personnelMarkers.value = await fetchProductionPersonnel();
  } catch {
    personnelMarkers.value = [];
  }
});

const visiblePersonnelMarkers = computed<PersonnelMarker[]>(() =>
  filterByPlantArea(personnelMarkers.value),
);

/**
 * 坐标可渲染性校验：剔除 0,0 / 非有限 / 明显越出华南沿海合理范围的点，
 * 避免标点被 Cesium 投到地图可视范围之外（用户反馈「很多标点放到划定范围之外」）。
 */
function isRenderableCoord(lng: number, lat: number): boolean {
  return (
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    !(lng === 0 && lat === 0) &&
    lng > 108 &&
    lng < 117 &&
    lat > 17 &&
    lat < 26
  );
}

/** 射线法：点是否落在闭合环内 */
function pointInRing(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** 环质心（越界点回拉落点，保证落在划定范围内） */
function ringCentroid(ring: number[][]): { longitude: number; latitude: number } {
  let x = 0;
  let y = 0;
  for (const [lng, lat] of ring) {
    x += lng;
    y += lat;
  }
  return { longitude: x / ring.length, latitude: y / ring.length };
}

/**
 * 在 resolvePlantAreaWorldPosition 基础上做「越界回拉」：解析出的厂区世界坐标若落在
 * 该厂区的边界环之外，回拉到环质心；非法坐标直接返回 null（上层过滤不渲染）。
 */
function resolvePlantAreaWorldPositionClamped(
  item: { areaCode?: ConcretePlantAreaCode; id?: string | number } | undefined,
  index: number,
  longitude: number,
  latitude: number,
): { longitude: number; latitude: number } | null {
  const pos = resolvePlantAreaWorldPosition(item, index, longitude, latitude);
  if (!isRenderableCoord(pos.longitude, pos.latitude)) return null;
  const code = resolvePlantAreaCode(item, index);
  const rings = plantAreaBoundaryRings[code];
  if (rings.some((ring) => pointInRing(pos.longitude, pos.latitude, ring))) return pos;
  return ringCentroid(rings[0]);
}

const { styleFor: markerStyleFor } = useWorldMarkerScreenPositions(() => {
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72.05;
  return visiblePersonnelMarkers.value
    .map((marker, index) => ({
      key: String(marker.id),
      pos: resolvePlantAreaWorldPositionClamped(marker, index, marker.longitude, marker.latitude),
      height,
    }))
    .filter((m) => m.pos)
    .map((m) => ({
      key: m.key,
      longitude: m.pos!.longitude,
      latitude: m.pos!.latitude,
      height,
    }));
});

const deviceMarkerTargets = () => {
  if (!productionDeviceDrawerActive.value) return [];
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72.05;
  return productionDevicePagedItems.value
    .map((item, index) => ({
      key: `device-${item.id}`,
      pos: resolvePlantAreaWorldPositionClamped(item, index, item.longitude, item.latitude),
      height,
    }))
    .filter((m) => m.pos)
    .map((m) => ({
      key: m.key,
      longitude: m.pos!.longitude,
      latitude: m.pos!.latitude,
      height,
    }));
};

const { styleFor: deviceStyleFor } = useWorldMarkerScreenPositions(deviceMarkerTargets, {
  scaleWithZoom: false,
});

const commMarkerTargets = () => {
  if (!communicationDrawerOpen.value) return [];
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72.05;
  return allDevices.value
    .map((device, index) => ({
      key: `comm-${device.id}`,
      pos: resolvePlantAreaWorldPositionClamped(device, index, device.longitude, device.latitude),
      height,
    }))
    .filter((m) => m.pos)
    .map((m) => ({
      key: m.key,
      longitude: m.pos!.longitude,
      latitude: m.pos!.latitude,
      height,
    }));
};

const { styleFor: commStyleFor } = useWorldMarkerScreenPositions(commMarkerTargets, {
  scaleWithZoom: false,
});

/** 设备/通讯状态 → 公共点位色调（色调 token 收口在 MapPointMarker） */
function deviceTone(status: string): MapPointTone {
  if (status === '离线') return 'offline';
  if (status === '故障') return 'warning';
  return 'normal';
}

watch(
  () =>
    [
      productionDeviceDrawerActive.value,
      productionDeviceCurrentPage.value,
      productionDevicePagedItems.value,
    ] as const,
  ([active]) => {
    if (!active) return;
    const map = getSharedMap();
    const items = productionDevicePagedItems.value;
    if (!items.length) return;
    const height = map?.getBoundaryModelTopHeight?.() ?? 72.05;
    const positions = items.map((item, index) => ({
      ...resolvePlantAreaWorldPosition(item, index, item.longitude, item.latitude),
      height,
    }));
    void map?.flyToWorldPositions?.({
      positions,
      duration: 0.85,
      pitchDeg: -48,
      rangeMultiplier: 2.1,
      panOnly: true,
    });
  },
);

watch([communicationDrawerOpen, selectedDeviceId], ([open, id]) => {
  if (!open) return;
  const map = getSharedMap();
  const height = map?.getBoundaryModelTopHeight?.() ?? 72.05;
  const target = id ? allDevices.value.find((device) => device.id === id) : null;
  const positions = target
    ? [{ ...resolvePlantAreaWorldPosition(target, 0, target.longitude, target.latitude), height }]
    : allDevices.value.map((device, index) => ({
        ...resolvePlantAreaWorldPosition(device, index, device.longitude, device.latitude),
        height,
      }));
  if (!positions.length) return;
  void map?.flyToWorldPositions?.({
    positions,
    duration: 0.85,
    pitchDeg: -48,
    rangeMultiplier: target ? 1.6 : 2.1,
    panOnly: true,
  });
});

// —— 真实后端报警点位落图（/map/alarms，GeoJSON FeatureCollection）——
// 直连真后端 8787；service 内部对无后端/异常已回退静态兜底点，不白屏。
const alarmPoints = ref<MapPoint[]>([]);

onMounted(async () => {
  try {
    alarmPoints.value = await fetchAlarmPoints();
  } catch {
    alarmPoints.value = [];
  }
});

/** 报警分级 → 公共点位色调（与告警卡分级同源：一/二/三级 = 红/橙/黄） */
function alarmLevelTone(level?: number): MapPointTone {
  if (level === 1) return 'danger';
  if (level === 2) return 'alarm-2';
  if (level === 3) return 'alarm-3';
  return 'normal';
}

const alarmMarkerTargets = () => {
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72.05;
  return alarmPoints.value
    .filter((p) => isRenderableCoord(p.lng, p.lat))
    .map((p) => ({
      key: `real-alarm-${p.id}`,
      longitude: p.lng,
      latitude: p.lat,
      height,
    }));
};
const { styleFor: alarmStyleFor } = useWorldMarkerScreenPositions(alarmMarkerTargets, {
  scaleWithZoom: false,
});
</script>

<template>
  <div class="production-map">
    <div class="production-map__depth" />

    <MapPointMarker
      v-for="marker in visiblePersonnelMarkers"
      :key="marker.id"
      :style="markerStyleFor(String(marker.id))"
      icon="person"
      tone="normal"
      status="人员"
      :name="marker.location"
      :sub="`${marker.count}人`"
      :title="`${marker.location} · ${marker.count}人`"
      :aria-label="`${marker.location} 人员 ${marker.count}人`"
    />

    <MapPointMarker
      v-for="item in productionDeviceDrawerActive ? productionDevicePagedItems : []"
      :key="`device-${item.id}`"
      :style="deviceStyleFor(`device-${item.id}`)"
      icon="device"
      :tone="deviceTone(item.status)"
      :status="item.status"
      :name="item.name"
      :title="item.name"
    />

    <MapPointMarker
      v-for="item in communicationDrawerOpen ? allDevices : []"
      :key="`comm-${item.id}`"
      :style="commStyleFor(`comm-${item.id}`)"
      icon="device"
      :tone="deviceTone(item.status)"
      :status="item.status"
      :name="item.name"
      :title="item.name"
    />

    <div class="map-controls" :class="{ 'map-controls--drawer': selectedDevice }">
      <MapLayerPanel />
      <button
        v-for="(ctrl, index) in productionMapControls"
        :key="ctrl.key"
        type="button"
        class="map-control-btn"
        :title="ctrl.label"
        :aria-label="ctrl.label"
        @click="onMapControl(ctrl.key)"
      >
        <SpriteImage :sprite="productionSprites.mapControlButtons[index]" />
      </button>
      <MapCleanModeButton />
    </div>

    <!-- 真实后端报警点位落图（/map/alarms） -->
    <MapPointMarker
      v-for="p in alarmPoints"
      :key="`real-alarm-${p.id}`"
      :style="alarmStyleFor(`real-alarm-${p.id}`)"
      layout="pulse"
      icon="sensor-gas"
      :tone="alarmLevelTone(p.level)"
      :title="p.name"
      :aria-label="p.name"
    />
  </div>
</template>

<style scoped>
.production-map {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;

  /* 默认避让 /production 主页的右侧面板（宽 ~465px）；
     在 /production/communication 等无右侧面板的页面可通过内联样式覆盖为 18px。 */
  --map-controls-right: 465px;
}

.production-map__depth {
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

.zone-overlay {
  position: absolute;
  object-fit: fill;
  pointer-events: none;
  z-index: var(--z-chrome);
}

.map-controls {
  position: absolute;
  right: var(--map-controls-right);
  top: 123px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  z-index: var(--z-marker);
  pointer-events: auto;
  transition: right 0.26s ease;
}

/* 右侧抽屉打开时，把工具栏推到抽屉左侧之外，避免被 z-overlay 层盖住。
   右侧抽屉统一为 var(--sidebar-width) 宽、right:18px 定位；
   工具栏紧贴抽屉左边缘，留 12px 间隙。 */
.map-controls--drawer {
  right: calc(var(--sidebar-width) + 18px + 12px);
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
