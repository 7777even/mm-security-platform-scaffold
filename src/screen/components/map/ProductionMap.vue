<script setup lang="ts">
import { watch } from 'vue';
import SpriteImage from '../common/SpriteImage.vue';
import MapLayerPanel from '../common/MapLayerPanel.vue';
import MapCleanModeButton from './MapCleanModeButton.vue';
import MapMarkerIcon from './MapMarkerIcon.vue';
import { productionSprites } from '../../utils/productionSpriteConfig';
import { personnelMarkers, productionMapControls } from '../../lib/data/productionMock';
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
import { statusTone } from '../../lib/data/productionDeviceMock';
import { usePlantArea } from '../../lib/composables/usePlantArea';
import { resolvePlantAreaWorldPosition } from '../../lib/data/plantAreas';

const { onMapControl } = useMapControls();
const { areaScopedItems } = usePlantArea();
const visiblePersonnelMarkers = areaScopedItems(personnelMarkers);

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
</style>
