<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import SpriteImage from '../common/SpriteImage.vue';
import MapLayerPanel from '../common/MapLayerPanel.vue';
import MapCleanModeButton from './MapCleanModeButton.vue';
import MapMarkerIcon from './MapMarkerIcon.vue';
import SecurityToolbarIcon from './SecurityToolbarIcon.vue';
import { securityAssets, tvAssets } from '../../utils/designAssets';
import { securitySprites } from '../../utils/securitySpriteConfig';
import {
  securityBoundaryEdgeFallback,
  securityGates,
  securityMapControls,
  securityMapToolbarItems,
} from '@/services/security';
import { fetchAlarmPoints, fetchDevicePoints, type MapPoint } from '@/services/map';
import { useMapControls } from '../../lib/composables/useMapControls';
import { useBoundaryGateScreenPositions } from '../../lib/composables/useCesiumScreenAnchor';
import {
  onToolbarAction,
  securitySearchPanelMode,
} from '../../lib/composables/useSecuritySearchPanel';
import {
  patrolLinkageOpen,
  patrolLinkagePoints,
  selectPatrolPoint,
} from '../../lib/composables/usePatrolLinkage';
import { useWorldMarkerScreenPositions } from '../../lib/composables/useCesiumScreenAnchor';
import { getSharedMap } from '../../lib/composables/sharedCesiumBridge';
import {
  patrolCameraPagedItems,
  patrolCameraDrawerActive,
  patrolCameraCurrentPage,
} from '../../lib/composables/usePatrolCameraListView';
import { openPatrolCameraVideo } from '../../lib/composables/usePatrolCameraVideoDialog';
import {
  bollardCurrentPage,
  bollardDrawerActive,
  bollardPagedItems,
} from '../../lib/composables/useBollardListView';
import { openBollardDetail } from '../../lib/composables/useBollardDetailDialog';
import {
  gateControlCurrentPage,
  gateControlDrawerActive,
  gateControlPagedItems,
} from '../../lib/composables/useGateControlListView';
import { openGateControlDetail } from '../../lib/composables/useGateControlDetailDialog';

const { onMapControl } = useMapControls();
const { styleFor } = useBoundaryGateScreenPositions(securityGates, securityBoundaryEdgeFallback);

const patrolMarkerTargets = () => {
  if (!patrolLinkageOpen.value) return [];
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72;
  return patrolLinkagePoints.value.map((point) => ({
    key: `patrol-${point.id}`,
    longitude: point.camera.longitude,
    latitude: point.camera.latitude,
    height,
  }));
};

const { styleFor: patrolStyleFor } = useWorldMarkerScreenPositions(patrolMarkerTargets, {
  scaleWithZoom: false,
});

const cameraMarkerTargets = () => {
  if (!patrolCameraDrawerActive.value) return [];
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72;
  return patrolCameraPagedItems.value.map((cam) => ({
    key: String(cam.id),
    longitude: cam.longitude,
    latitude: cam.latitude,
    height,
  }));
};

const { styleFor: cameraStyleFor } = useWorldMarkerScreenPositions(cameraMarkerTargets, {
  scaleWithZoom: false,
});

watch(
  () => [patrolCameraDrawerActive.value, patrolCameraCurrentPage.value] as const,
  ([active]) => {
    if (!active) return;
    const map = getSharedMap();
    const height = map?.getBoundaryModelTopHeight?.() ?? 72;
    const positions = patrolCameraPagedItems.value.map((cam) => ({
      longitude: cam.longitude,
      latitude: cam.latitude,
      height,
    }));
    if (!positions.length) return;
    void map?.flyToWorldPositions?.({
      positions,
      duration: 0.85,
      pitchDeg: -48,
      rangeMultiplier: 2.1,
      panOnly: true,
    });
  },
);

function handleCameraMarkerClick(id: number) {
  const cam = patrolCameraPagedItems.value.find((c) => c.id === id);
  if (!cam) return;
  openPatrolCameraVideo(cam);
}

const bollardMarkerTargets = () => {
  if (!bollardDrawerActive.value) return [];
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72;
  return bollardPagedItems.value.map((item) => ({
    key: String(item.id),
    longitude: item.longitude,
    latitude: item.latitude,
    height,
  }));
};

const { styleFor: bollardStyleFor } = useWorldMarkerScreenPositions(bollardMarkerTargets, {
  scaleWithZoom: false,
});

watch(
  () => [bollardDrawerActive.value, bollardCurrentPage.value] as const,
  ([active]) => {
    if (!active) return;
    const map = getSharedMap();
    const height = map?.getBoundaryModelTopHeight?.() ?? 72;
    const positions = bollardPagedItems.value.map((item) => ({
      longitude: item.longitude,
      latitude: item.latitude,
      height,
    }));
    if (!positions.length) return;
    void map?.flyToWorldPositions?.({
      positions,
      duration: 0.85,
      pitchDeg: -48,
      rangeMultiplier: 2.1,
      panOnly: true,
    });
  },
);

function handleBollardMarkerClick(id: number) {
  const item = bollardPagedItems.value.find((b) => b.id === id);
  if (!item) return;
  openBollardDetail(item.id);
}

const gateControlMarkerTargets = () => {
  if (!gateControlDrawerActive.value) return [];
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72;
  return gateControlPagedItems.value.map((item) => ({
    key: String(item.id),
    longitude: item.longitude,
    latitude: item.latitude,
    height,
  }));
};

const { styleFor: gateControlStyleFor } = useWorldMarkerScreenPositions(gateControlMarkerTargets, {
  scaleWithZoom: false,
});

watch(
  () => [gateControlDrawerActive.value, gateControlCurrentPage.value] as const,
  ([active]) => {
    if (!active) return;
    const map = getSharedMap();
    const height = map?.getBoundaryModelTopHeight?.() ?? 72;
    const positions = gateControlPagedItems.value.map((item) => ({
      longitude: item.longitude,
      latitude: item.latitude,
      height,
    }));
    if (!positions.length) return;
    void map?.flyToWorldPositions?.({
      positions,
      duration: 0.85,
      pitchDeg: -48,
      rangeMultiplier: 2.1,
      panOnly: true,
    });
  },
);

function handleGateControlMarkerClick(id: number) {
  openGateControlDetail(id);
}

// —— 真实后端点位落图（/map/alarms、/map/devices，GeoJSON FeatureCollection）——
// 直连真后端 8787；service 内部对无后端/异常已回退静态兜底点，不白屏。
const alarmPoints = ref<MapPoint[]>([]);
const devicePoints = ref<MapPoint[]>([]);

onMounted(async () => {
  try {
    const [al, dv] = await Promise.all([fetchAlarmPoints(), fetchDevicePoints()]);
    alarmPoints.value = al;
    devicePoints.value = dv;
  } catch {
    alarmPoints.value = [];
    devicePoints.value = [];
  }
});

function alarmLevelClass(level?: number): string {
  if (level === 1) return 'realtime-marker--lv1';
  if (level === 2) return 'realtime-marker--lv2';
  if (level === 3) return 'realtime-marker--lv3';
  return 'realtime-marker--lv0';
}

function deviceStatusClass(status?: string): string {
  if (status === 'FAULT') return 'realtime-marker--fault';
  if (status === 'OFFLINE') return 'realtime-marker--offline';
  return 'realtime-marker--ok';
}

const alarmMarkerTargets = () => {
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72;
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

const deviceMarkerTargets = () => {
  const height = getSharedMap()?.getBoundaryModelTopHeight?.() ?? 72;
  return devicePoints.value.map((p) => ({
    key: `real-device-${p.id}`,
    longitude: p.lng,
    latitude: p.lat,
    height,
  }));
};
const { styleFor: deviceStyleFor } = useWorldMarkerScreenPositions(deviceMarkerTargets, {
  scaleWithZoom: false,
});
</script>

<template>
  <div class="security-map">
    <div class="security-map__depth" />

    <div
      v-for="gate in securityGates"
      :key="gate.name"
      class="gate-marker"
      :style="styleFor(gate.name)"
    >
      <div class="gate-marker__card">
        <img class="gate-marker__card-bg" :src="securityAssets.gateLabelBg" alt="" />
        <div class="gate-marker__name">{{ gate.name }}</div>
        <div class="gate-marker__flow">
          <img class="gate-marker__flow-icon" :src="securityAssets.gateFlowIcon" alt="" />
          <span class="gate-marker__flow-label">出入流量</span>
          <span class="gate-marker__flow-value">{{ gate.flow }}</span>
        </div>
      </div>
      <div class="gate-marker__pin">
        <span class="gate-marker__ripple gate-marker__ripple--1" aria-hidden="true" />
        <span class="gate-marker__ripple gate-marker__ripple--2" aria-hidden="true" />
        <img class="gate-marker__pin-outer" :src="securityAssets.gateMarkerOuter" alt="" />
        <img class="gate-marker__pin-inner" :src="securityAssets.gateMarkerInner" alt="" />
      </div>
    </div>

    <button
      v-for="point in patrolLinkageOpen ? patrolLinkagePoints : []"
      :key="`patrol-${point.id}`"
      type="button"
      class="patrol-marker"
      :class="`patrol-marker--${point.status}`"
      :style="patrolStyleFor(`patrol-${point.id}`)"
      :title="point.name"
      @click="selectPatrolPoint(point)"
    >
      <span class="patrol-marker__label">
        <span class="patrol-marker__status">{{ point.status }}</span>
        <span class="patrol-marker__name">{{ point.name }}</span>
      </span>
      <span class="patrol-marker__pin" aria-hidden="true">
        <MapMarkerIcon name="patrol" />
      </span>
      <span class="patrol-marker__stem" aria-hidden="true" />
      <span class="patrol-marker__breath" aria-hidden="true" />
    </button>

    <div class="map-controls">
      <MapLayerPanel />
      <button
        v-for="(ctrl, index) in securityMapControls"
        :key="ctrl.key"
        type="button"
        class="map-control-btn"
        :title="ctrl.label"
        :aria-label="ctrl.label"
        @click="onMapControl(ctrl.key)"
      >
        <SpriteImage :sprite="securitySprites.mapControlButtons[index]" />
      </button>
      <MapCleanModeButton />
    </div>

    <nav class="security-map__toolbar" aria-label="安全防控快捷操作">
      <button
        v-for="item in securityMapToolbarItems"
        :key="item.key"
        type="button"
        class="toolbar-btn"
        :class="{
          'toolbar-btn--active':
            item.key === 'vehicleSearch'
              ? securitySearchPanelMode === 'vehicle'
              : item.key === 'personSearch'
                ? securitySearchPanelMode === 'person'
                : false,
        }"
        :title="item.label"
        :aria-label="item.label"
        @click="onToolbarAction(item.key)"
      >
        <span class="toolbar-btn__icon-wrap">
          <SecurityToolbarIcon :name="item.key" />
        </span>
        <span class="toolbar-btn__label">{{ item.label }}</span>
      </button>
    </nav>

    <button
      v-for="cam in patrolCameraDrawerActive ? patrolCameraPagedItems : []"
      :key="`cam-${cam.id}`"
      type="button"
      class="camera-marker"
      :class="{
        'camera-marker--offline': cam.status === '离线',
        'camera-marker--fault': cam.status === '故障',
      }"
      :style="cameraStyleFor(String(cam.id))"
      :title="cam.name"
      :aria-label="`${cam.name} ${cam.status}`"
      @click="handleCameraMarkerClick(cam.id)"
    >
      <img class="camera-marker__outer" :src="tvAssets.cameraMarkers[0].outer" alt="" />
      <img class="camera-marker__icon" :src="tvAssets.cameraMarkers[0].icon" alt="" />
      <span class="camera-marker__stem" aria-hidden="true" />
      <span class="camera-marker__breath" aria-hidden="true" />
    </button>

    <button
      v-for="item in bollardDrawerActive ? bollardPagedItems : []"
      :key="`bollard-${item.id}`"
      type="button"
      class="camera-marker camera-marker--bollard"
      :class="{
        'camera-marker--offline': item.status === '离线',
        'camera-marker--fault': item.status === '故障',
      }"
      :style="bollardStyleFor(String(item.id))"
      :title="item.name"
      :aria-label="`${item.name} ${item.status}`"
      @click="handleBollardMarkerClick(item.id)"
    >
      <img class="camera-marker__outer" :src="tvAssets.cameraMarkers[0].outer" alt="" />
      <span class="camera-marker__svg" aria-hidden="true">
        <SecurityToolbarIcon name="bollard" />
      </span>
      <span class="camera-marker__stem" aria-hidden="true" />
      <span class="camera-marker__breath" aria-hidden="true" />
    </button>

    <button
      v-for="item in gateControlDrawerActive ? gateControlPagedItems : []"
      :key="`gate-${item.id}`"
      type="button"
      class="camera-marker camera-marker--gate"
      :class="{
        'camera-marker--offline': item.status === '离线',
        'camera-marker--fault': item.status === '故障',
      }"
      :style="gateControlStyleFor(String(item.id))"
      :title="item.name"
      :aria-label="`${item.name} ${item.status}`"
      @click="handleGateControlMarkerClick(item.id)"
    >
      <img class="camera-marker__outer" :src="tvAssets.cameraMarkers[0].outer" alt="" />
      <span class="camera-marker__svg" aria-hidden="true">
        <SecurityToolbarIcon name="gate" />
      </span>
      <span class="camera-marker__stem" aria-hidden="true" />
      <span class="camera-marker__breath" aria-hidden="true" />
    </button>

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

    <!-- 真实后端设备点位落图（/map/devices） -->
    <button
      v-for="p in devicePoints"
      :key="`real-device-${p.id}`"
      type="button"
      class="realtime-marker realtime-marker--device"
      :class="deviceStatusClass(p.status)"
      :style="deviceStyleFor(`real-device-${p.id}`)"
      :title="p.name"
    >
      <span class="realtime-marker__pin"><MapMarkerIcon name="device" /></span>
      <span class="realtime-marker__breath" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.security-map {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.security-map__depth {
  position: absolute;
  inset: 0;
  z-index: var(--z-base);
  pointer-events: none;
  background:
    radial-gradient(
      ellipse 90% 80% at 50% 42%,
      transparent 0%,
      rgb(0 18 40 / 15%) 50%,
      rgb(0 12 28 / 50%) 100%
    ),
    linear-gradient(
      180deg,
      rgb(0 22 48 / 75%) 0%,
      transparent 14%,
      transparent 78%,
      rgb(0 18 40 / 80%) 100%
    ),
    linear-gradient(
      90deg,
      rgb(0 22 48 / 80%) 0%,
      transparent 22%,
      transparent 78%,
      rgb(0 22 48 / 80%) 100%
    );
}

.gate-marker {
  --gate-pin-size: 20px;

  position: absolute;
  z-index: var(--z-marker);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  transform: translate(-50%, calc(-100% + var(--gate-pin-size) / 2));
}

.gate-marker__card {
  position: relative;
  width: 121px;
  min-width: max-content;
  height: 76px;
  flex-shrink: 0;
  margin-bottom: -2px;
  transform: translateX(-30px);
}

.gate-marker__card-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.gate-marker__name {
  position: relative;
  padding: 5px 12px 0 35px;
  font-size: 12px;
  color: var(--color-text-strong);
  white-space: nowrap;
}

.gate-marker__flow {
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 4px;
  padding: 8px 10px 0 26px;
  font-size: 12px;
  color: var(--accent-cyan);
  white-space: nowrap;
}

.gate-marker__flow-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.gate-marker__flow-label {
  flex-shrink: 0;
}

.gate-marker__flow-value {
  flex-shrink: 0;
  padding-right: 4px;
}

.gate-marker__pin {
  position: relative;
  width: var(--gate-pin-size);
  height: var(--gate-pin-size);
  flex-shrink: 0;
}

.gate-marker__ripple {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--gate-pin-size);
  height: var(--gate-pin-size);
  margin-left: calc(var(--gate-pin-size) / -2);
  margin-top: calc(var(--gate-pin-size) / -2);
  border: 1px solid rgb(106 202 178 / 55%);
  border-radius: 50%;
  pointer-events: none;
  animation: gate-pin-ripple 2.4s ease-out infinite;
}

.gate-marker__ripple--2 {
  animation-delay: 1.2s;
}

.gate-marker__pin-outer,
.gate-marker__pin-inner {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.gate-marker__pin-outer {
  animation: gate-pin-breathe 2.4s ease-in-out infinite;
}

@keyframes gate-pin-breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.88;
  }

  50% {
    transform: scale(1.18);
    opacity: 1;
  }
}

@keyframes gate-pin-ripple {
  0% {
    transform: scale(1);
    opacity: 0.65;
  }

  100% {
    transform: scale(2.6);
    opacity: 0;
  }
}

.map-controls {
  position: absolute;
  right: var(--security-map-controls-right, 465px);
  top: 123px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  z-index: var(--z-marker);
  pointer-events: auto;
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

.security-map__toolbar {
  position: absolute;
  left: 50%;
  bottom: calc(var(--footer-height) + 18px);
  transform: translateX(-50%);
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 14px;
  z-index: var(--z-marker);
  pointer-events: auto;
  padding: 8px 18px;
  max-width: calc(100% - 640px);
  background: linear-gradient(180deg, rgb(8 28 58 / 94%), rgb(5 20 40 / 90%));
  border: 1px solid rgb(0 148 236 / 38%);
  border-radius: 4px;
  box-shadow: 0 6px 20px rgb(0 0 0 / 28%);
}

.toolbar-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 0 0 auto;
  min-width: 76px;
  padding: 6px 10px;
  border: 1px solid rgb(0 110 190 / 25%);
  border-radius: 3px;
  background: rgb(0 32 64 / 50%);
  cursor: pointer;
  font-family: var(--font-body);
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.toolbar-btn:hover {
  border-color: rgb(0 180 255 / 50%);
  background: rgb(0 55 100 / 55%);
  box-shadow: inset 0 0 12px rgb(0 170 255 / 8%);
}

.toolbar-btn:active {
  background: rgb(0 70 120 / 60%);
}

.toolbar-btn--active {
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 70 130 / 58%);
  box-shadow: inset 0 0 12px rgb(0 170 255 / 12%);
}

.toolbar-btn--active .toolbar-btn__label {
  color: var(--color-text-strong);
}

.toolbar-btn--active .toolbar-btn__icon-wrap {
  background: rgb(0 110 180 / 40%);
}

.toolbar-btn__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgb(0 80 140 / 25%);
}

.toolbar-btn:hover .toolbar-btn__icon-wrap {
  background: rgb(0 100 170 / 35%);
}

.toolbar-btn:hover :deep(.security-toolbar-icon) {
  color: #6df;
}

.toolbar-btn__label {
  font-size: 11px;
  line-height: 1.25;
  color: #c8d8ec;
  text-align: center;
  white-space: nowrap;
}

.toolbar-btn:hover .toolbar-btn__label {
  color: var(--color-text-strong);
}

.camera-marker {
  position: absolute;
  z-index: var(--z-marker);
  width: 28px;
  height: 28px;
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
  transform: translate(-50%, -50%);
}

.camera-marker__outer,
.camera-marker__icon {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.camera-marker__outer {
  opacity: 0.95;
  filter: drop-shadow(0 0 10px rgb(55 207 255 / 25%));
}

.camera-marker__icon {
  inset: 6px;
  width: calc(100% - 12px);
  height: calc(100% - 12px);
  opacity: 0.98;
  filter: brightness(1.05);
  object-fit: contain;
}

.camera-marker__svg {
  position: absolute;
  inset: 6px;
  width: calc(100% - 12px);
  height: calc(100% - 12px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(255 255 255 / 96%);
  filter: drop-shadow(0 0 6px rgb(55 207 255 / 18%));
  pointer-events: none;
}

.camera-marker__svg :deep(.security-toolbar-icon) {
  width: 100%;
  height: 100%;
}

.camera-marker__stem {
  position: absolute;
  left: 50%;
  top: 100%;
  width: 2px;
  height: 22px;
  transform: translateX(-50%);
  background: linear-gradient(
    180deg,
    rgb(55 207 255 / 85%),
    rgb(55 207 255 / 22%),
    rgb(55 207 255 / 0%)
  );
  pointer-events: none;
}

.camera-marker__breath {
  position: absolute;
  left: 50%;
  top: calc(100% + 18px);
  width: 8px;
  height: 8px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: rgb(55 207 255 / 95%);
  box-shadow: 0 0 10px rgb(55 207 255 / 45%);
  animation: cam-breath 1.9s ease-in-out infinite;
  pointer-events: none;
}

.camera-marker:hover .camera-marker__outer {
  opacity: 1;
  filter: drop-shadow(0 0 12px rgb(55 207 255 / 35%));
}

.camera-marker--offline .camera-marker__outer,
.camera-marker--offline .camera-marker__icon {
  filter: grayscale(1);
  opacity: 0.7;
}

.camera-marker--offline .camera-marker__stem,
.camera-marker--offline .camera-marker__breath {
  filter: grayscale(1);
  opacity: 0.55;
}

.camera-marker--fault .camera-marker__outer,
.camera-marker--fault .camera-marker__icon {
  filter: hue-rotate(-30deg) saturate(1.2);
}

.camera-marker--fault .camera-marker__stem {
  background: linear-gradient(
    180deg,
    rgb(240 180 41 / 90%),
    rgb(240 180 41 / 25%),
    rgb(240 180 41 / 0%)
  );
}

.camera-marker--fault .camera-marker__breath {
  background: rgb(240 180 41 / 95%);
  box-shadow: 0 0 10px rgb(240 180 41 / 38%);
}

@keyframes cam-breath {
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

.patrol-marker {
  position: absolute;
  z-index: var(--z-marker);
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -100%);
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  pointer-events: auto;
}

.patrol-marker__label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
  padding: 2px 6px;
  border-radius: 2px;
  background: var(--map-device-label-bg);
  border: 1px solid rgb(0 140 220 / 28%);
  color: var(--color-text-muted);
  font-size: 11px;
  white-space: nowrap;
  font-family: var(--font-body);
}

.patrol-marker__status {
  flex-shrink: 0;
  padding: 0 4px;
  border-radius: 2px;
  font-size: 10px;
  line-height: 15px;
  font-weight: 700;
  color: var(--map-marker-ink);
  background: var(--map-marker-cyan);
}

.patrol-marker__name {
  white-space: nowrap;
}

.patrol-marker__pin {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid rgb(255 255 255 / 90%);
  background: var(--map-marker-cyan);
  box-shadow: 0 0 10px rgb(55 207 255 / 45%);
}

.patrol-marker__pin :deep(.map-marker-icon) {
  width: 14px;
  height: 14px;
  color: var(--map-marker-ink);
}

.patrol-marker__stem {
  width: 2px;
  height: 14px;
  margin-top: -1px;
  background: linear-gradient(180deg, rgb(55 207 255 / 85%), rgb(55 207 255 / 0%));
}

.patrol-marker__breath {
  width: 7px;
  height: 7px;
  margin-top: -2px;
  border-radius: 50%;
  background: rgb(55 207 255 / 95%);
  animation: patrol-breath 1.9s ease-in-out infinite;
}

.patrol-marker--离线 .patrol-marker__pin,
.patrol-marker--离线 .patrol-marker__breath {
  background: var(--map-device-offline);
  box-shadow: none;
}

.patrol-marker--离线 .patrol-marker__status {
  background: var(--map-device-offline);
}

.patrol-marker--故障 .patrol-marker__pin,
.patrol-marker--故障 .patrol-marker__breath {
  background: var(--color-warning);
  box-shadow: 0 0 10px rgb(240 180 41 / 40%);
}

.patrol-marker--故障 .patrol-marker__status {
  background: var(--color-warning);
}

@keyframes patrol-breath {
  0%,
  100% {
    transform: scale(0.9);
    opacity: 0.75;
  }

  50% {
    transform: scale(1.2);
    opacity: 1;
  }
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

.realtime-marker--device.realtime-marker--ok .realtime-marker__pin,
.realtime-marker--device.realtime-marker--ok .realtime-marker__breath {
  background: var(--map-marker-cyan);
  box-shadow: 0 0 10px rgb(55 207 255 / 45%);
}

.realtime-marker--fault .realtime-marker__pin,
.realtime-marker--fault .realtime-marker__breath {
  background: var(--color-warning);
  box-shadow: 0 0 10px rgb(240 180 41 / 40%);
}

.realtime-marker--offline .realtime-marker__pin,
.realtime-marker--offline .realtime-marker__breath {
  background: var(--map-device-offline, #8aa4c4);
  box-shadow: none;
  filter: grayscale(0.4);
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
