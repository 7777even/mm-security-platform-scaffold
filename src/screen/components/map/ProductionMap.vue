<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import SpriteImage from '../common/SpriteImage.vue';
import MapLayerPanel from '../common/MapLayerPanel.vue';
import MapCleanModeButton from './MapCleanModeButton.vue';
import MapMarkerIcon from './MapMarkerIcon.vue';
import { productionSprites } from '../../utils/productionSpriteConfig';
import { productionMapControls } from '@/services/productionMapConfig';
import { designImg } from '../../utils/designAssets';
import { fetchProductionPersonnel, statusTone, type PersonnelMarker } from '@/services/production';
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
  selectedDeviceId,
} from '../../lib/composables/useCommunicationDevices';
import { usePlantArea } from '../../lib/composables/usePlantArea';
import { resolvePlantAreaWorldPosition } from '../../lib/data/plantAreas';
import { fetchAlarmPoints, type MapPoint } from '@/services/map';

const { onMapControl } = useMapControls();
const { filterByPlantArea } = usePlantArea();

// 人员定位标记来自真实后端（/production/personnel）；markerOuter/markerInner 为前端装饰环，
// 后端契约 PersonnelMarker 不承载，故在此用 designImg 补回，保证视觉与历史一致。
// 后端契约 PersonnelMarker 的图片字段为 string | null；模板 :src 要求 string，
// 故在此统一兜底为空串（null → 不渲染图片，属可接受的暴露式降级）。
type DecoratedPersonnelMarker = Omit<
  PersonnelMarker,
  'markerIcon' | 'popupBg' | 'markerDot' | 'markerLine'
> & {
  markerIcon: string;
  popupBg: string;
  markerDot: string;
  markerLine: string;
  markerOuter: string;
  markerInner: string;
};
const personnelMarkers = ref<PersonnelMarker[]>([]);

onMounted(async () => {
  try {
    personnelMarkers.value = await fetchProductionPersonnel();
  } catch {
    personnelMarkers.value = [];
  }
});

const visiblePersonnelMarkers = computed<DecoratedPersonnelMarker[]>(() =>
  filterByPlantArea(personnelMarkers.value).map((marker) => ({
    ...marker,
    markerIcon: marker.markerIcon ?? '',
    popupBg: marker.popupBg ?? '',
    markerDot: marker.markerDot ?? '',
    markerLine: marker.markerLine ?? '',
    markerOuter: designImg('圆形_41.png', 'production') ?? '',
    markerInner: designImg('圆形_42.png', 'production') ?? '',
  })),
);

const { styleFor: markerStyleFor } = useWorldMarkerScreenPositions(() => {
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72.05;
  return visiblePersonnelMarkers.value.map((marker, index) => ({
    key: String(marker.id),
    ...resolvePlantAreaWorldPosition(marker, index, marker.longitude, marker.latitude),
    height,
  }));
});

const deviceMarkerTargets = () => {
  if (!productionDeviceDrawerActive.value) return [];
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72.05;
  return productionDevicePagedItems.value.map((item, index) => ({
    key: `device-${item.id}`,
    ...resolvePlantAreaWorldPosition(item, index, item.longitude, item.latitude),
    height,
  }));
};

const { styleFor: deviceStyleFor } = useWorldMarkerScreenPositions(deviceMarkerTargets, {
  scaleWithZoom: false,
});

const commMarkerTargets = () => {
  if (!communicationDrawerOpen.value) return [];
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72.05;
  return allDevices.value.map((device, index) => ({
    key: `comm-${device.id}`,
    ...resolvePlantAreaWorldPosition(device, index, device.longitude, device.latitude),
    height,
  }));
};

const { styleFor: commStyleFor } = useWorldMarkerScreenPositions(commMarkerTargets, {
  scaleWithZoom: false,
});

function commTone(status: string) {
  if (status === '离线') return 'offline';
  if (status === '故障') return 'fault';
  return 'ok';
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

function alarmLevelClass(level?: number): string {
  if (level === 1) return 'realtime-marker--lv1';
  if (level === 2) return 'realtime-marker--lv2';
  if (level === 3) return 'realtime-marker--lv3';
  return 'realtime-marker--lv0';
}

const alarmMarkerTargets = () => {
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72.05;
  return alarmPoints.value.map((p) => ({
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

    <div
      v-for="marker in visiblePersonnelMarkers"
      :key="marker.id"
      class="personnel-marker"
      :style="markerStyleFor(String(marker.id))"
      :class="{ 'personnel-marker--dim': productionDeviceDrawerActive }"
    >
      <div class="personnel-marker__body">
        <img class="personnel-marker__outer" :src="marker.markerOuter" alt="" />
        <img class="personnel-marker__inner" :src="marker.markerInner" alt="" />
        <img class="personnel-marker__icon" :src="marker.markerIcon" alt="" />
        <div class="personnel-marker__line-wrap">
          <img class="personnel-marker__line" :src="marker.markerLine" alt="" />
          <img class="personnel-marker__dot" :src="marker.markerDot" alt="" />
        </div>
      </div>
      <div class="personnel-marker__popup">
        <img class="personnel-marker__popup-bg" :src="marker.popupBg" alt="" />
        <div class="personnel-marker__popup-text">
          <div>位置：{{ marker.location }}</div>
          <div class="personnel-marker__count">
            <span>人员：</span>
            <span class="personnel-marker__count-value">{{ marker.count }}人</span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-for="item in productionDeviceDrawerActive ? productionDevicePagedItems : []"
      :key="`device-${item.id}`"
      class="device-marker"
      :class="`device-marker--${statusTone(item.status)}`"
      :style="deviceStyleFor(`device-${item.id}`)"
      :title="item.name"
    >
      <span class="device-marker__label">
        <span class="device-marker__status">{{ item.status }}</span>
        <span class="device-marker__name">{{ item.name }}</span>
      </span>
      <span class="device-marker__pin" aria-hidden="true">
        <MapMarkerIcon name="device" />
      </span>
      <span class="device-marker__stem" aria-hidden="true" />
      <span class="device-marker__breath" aria-hidden="true" />
    </div>

    <div
      v-for="item in communicationDrawerOpen ? allDevices : []"
      :key="`comm-${item.id}`"
      class="device-marker"
      :class="`device-marker--${commTone(item.status)}`"
      :style="commStyleFor(`comm-${item.id}`)"
      :title="item.name"
    >
      <span class="device-marker__label">
        <span class="device-marker__status">{{ item.status }}</span>
        <span class="device-marker__name">{{ item.name }}</span>
      </span>
      <span class="device-marker__pin" aria-hidden="true">
        <MapMarkerIcon name="device" />
      </span>
      <span class="device-marker__stem" aria-hidden="true" />
      <span class="device-marker__breath" aria-hidden="true" />
    </div>

    <div
      class="map-controls"
      :class="{ 'map-controls--drawer': productionDeviceDrawerActive || communicationDrawerOpen }"
    >
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
    <button
      v-for="p in alarmPoints"
      :key="`real-alarm-${p.id}`"
      type="button"
      class="realtime-marker"
      :class="alarmLevelClass(p.level)"
      :style="alarmStyleFor(`real-alarm-${p.id}`)"
      :title="p.name"
    >
      <span class="realtime-marker__pin"><MapMarkerIcon name="sensor-gas" /></span>
      <span class="realtime-marker__breath" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.production-map {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
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

.personnel-marker {
  position: absolute;
  z-index: var(--z-marker);
  transform: translate(-50%, -50%);
}

.personnel-marker--dim {
  opacity: 0.25;
}

.personnel-marker__body {
  position: relative;
  width: 44px;
  height: 85px;
}

.personnel-marker__outer,
.personnel-marker__inner,
.personnel-marker__icon {
  position: absolute;
  object-fit: contain;
}

.personnel-marker__outer {
  left: 0;
  top: 0;
  width: 44px;
}

.personnel-marker__inner {
  left: 3.5px;
  top: 3.5px;
  width: 37px;
}

.personnel-marker__icon {
  left: 14px;
  top: 13px;
  width: 18px;
}

.personnel-marker__line-wrap {
  position: absolute;
  left: 21px;
  top: 63px;
  width: 3px;
  height: 22px;
}

.personnel-marker__line {
  width: 1px;
  height: 20px;
  margin-left: 1px;
}

.personnel-marker__dot {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 3px;
}

.personnel-marker__popup {
  position: absolute;
  left: 55px;
  top: -8px;
  width: 138px;
  height: 67px;
}

.personnel-marker__popup-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.personnel-marker__popup-text {
  position: relative;
  padding: 11px;
  font-size: 12px;
  color: var(--map-popup-text-blue);
  line-height: 1.4;
}

.personnel-marker__count {
  margin-top: 8px;
  display: flex;
  gap: 4px;
}

.personnel-marker__count-value {
  color: var(--map-personnel-count);
}

.device-marker {
  position: absolute;
  z-index: var(--z-marker);
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -100%);
  pointer-events: none;
}

.device-marker__label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
  max-width: 140px;
  padding: 2px 6px;
  border-radius: 2px;
  background: var(--map-device-label-bg);
  border: 1px solid rgb(0 140 220 / 28%);
  color: var(--color-text-muted);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-marker__status {
  flex-shrink: 0;
  padding: 0 4px;
  border-radius: 2px;
  font-size: 10px;
  line-height: 15px;
  font-weight: 700;
  color: var(--map-marker-ink);
  background: var(--map-marker-cyan);
}

.device-marker__name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-marker__pin {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid rgb(255 255 255 / 90%);
  background: var(--map-marker-cyan);
  box-shadow: 0 0 10px rgb(55 207 255 / 45%);
}

.device-marker__pin :deep(.map-marker-icon) {
  width: 15px;
  height: 15px;
  color: var(--map-marker-ink);
}

.device-marker__stem {
  width: 2px;
  height: 18px;
  margin-top: -1px;
  background: linear-gradient(
    180deg,
    rgb(55 207 255 / 85%),
    rgb(55 207 255 / 22%),
    rgb(55 207 255 / 0%)
  );
}

.device-marker__breath {
  width: 8px;
  height: 8px;
  margin-top: -2px;
  border-radius: 50%;
  background: rgb(55 207 255 / 95%);
  box-shadow: 0 0 10px rgb(55 207 255 / 45%);
  animation: device-breath 1.9s ease-in-out infinite;
}

.device-marker--offline .device-marker__pin,
.device-marker--offline .device-marker__breath {
  background: var(--map-device-offline);
  box-shadow: none;
  filter: grayscale(0.4);
}

.device-marker--offline .device-marker__status {
  background: var(--map-device-offline);
}

.device-marker--offline .device-marker__stem {
  background: linear-gradient(180deg, rgb(138 164 196 / 70%), rgb(138 164 196 / 0%));
}

.device-marker--fault .device-marker__pin,
.device-marker--fault .device-marker__breath {
  background: var(--color-warning);
  box-shadow: 0 0 10px rgb(240 180 41 / 40%);
}

.device-marker--fault .device-marker__status {
  background: var(--color-warning);
}

.device-marker--fault .device-marker__stem {
  background: linear-gradient(180deg, rgb(240 180 41 / 90%), rgb(240 180 41 / 0%));
}

@keyframes device-breath {
  0%,
  100% {
    transform: scale(0.9);
    opacity: 0.75;
  }

  50% {
    transform: scale(1.15);
    opacity: 1;
  }
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
  transition: right 0.26s ease;
}

.map-controls--drawer {
  right: 16px;
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

.realtime-marker {
  position: absolute;
  z-index: var(--z-marker);
  width: 26px;
  height: 26px;
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
  transform: translate(-50%, -50%);
}

.realtime-marker__pin {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid rgb(255 255 255 / 90%);
  color: rgb(255 255 255 / 96%);
  background: var(--map-marker-cyan);
  box-shadow: 0 0 10px rgb(55 207 255 / 45%);
}

.realtime-marker__pin :deep(.map-marker-icon) {
  width: 15px;
  height: 15px;
}

.realtime-marker__breath {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 8px;
  height: 8px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: rgb(55 207 255 / 95%);
  box-shadow: 0 0 10px rgb(55 207 255 / 45%);
  animation: realtime-breath 1.9s ease-in-out infinite;
  pointer-events: none;
}

.realtime-marker--lv1 .realtime-marker__pin,
.realtime-marker--lv1 .realtime-marker__breath {
  background: var(--color-danger);
  box-shadow: 0 0 10px rgb(255 90 90 / 45%);
}

.realtime-marker--lv2 .realtime-marker__pin,
.realtime-marker--lv2 .realtime-marker__breath {
  background: var(--color-alarm-2, #ff9f43);
  box-shadow: 0 0 10px rgb(255 159 67 / 45%);
}

.realtime-marker--lv3 .realtime-marker__pin,
.realtime-marker--lv3 .realtime-marker__breath {
  background: #ffd93b;
  box-shadow: 0 0 10px rgb(255 217 59 / 45%);
}

@keyframes realtime-breath {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(0.9);
    opacity: 0.75;
  }

  50% {
    transform: translate(-50%, -50%) scale(1.25);
    opacity: 1;
  }
}
</style>
