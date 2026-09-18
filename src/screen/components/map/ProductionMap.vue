<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import SpriteImage from '../common/SpriteImage.vue';
import MapLayerPanel from '../common/MapLayerPanel.vue';
import MapCleanModeButton from './MapCleanModeButton.vue';
import MapMarkerIcon from '@/components/map/MapMarkerIcon.vue';
import MapPointMarker, { type MapPointTone } from '@/components/map/MapPointMarker.vue';
import { productionSprites } from '@/utils/productionSpriteConfig';
import { productionMapControls } from '@/services/productionMapConfig';
import { designImg } from '@/utils/designAssets';
import { addressableImageSrc, cssColorOr } from '@/utils/imageUrl';
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
  selectedDeviceId,
} from '../../lib/composables/useCommunicationDevices';
import { usePlantArea } from '../../lib/composables/usePlantArea';
import { resolvePlantAreaWorldPosition } from '../../lib/data/plantAreas';
import { fetchAlarmPoints, type MapPoint } from '@/services/map';

const { onMapControl } = useMapControls();
const { filterByPlantArea } = usePlantArea();

// 人员定位标记来自真实后端（/production/personnel）；markerOuter/markerInner 为前端装饰环，
// 后端契约 PersonnelMarker 不承载，故在此用 designImg 补回，保证视觉与历史一致。
// 契约字段形态（见 V13 迁移注释 + openapi example）：
//   popupBg / markerDot / markerLine = 颜色串（如 #0b2a4a / #3ec6ff）→ 按 CSS 着色，不作 <img src>；
//   markerIcon = 裸文件名（person_cluster.png，前端不可寻址）→ 地址化判定失败时回退内置 SVG 人形图标。
// 直接把颜色串/裸文件名绑到 :src 会请求站根 404，页面呈现裂图 + 弹窗无背景（历史 bug）。
type DecoratedPersonnelMarker = Omit<
  PersonnelMarker,
  'markerIcon' | 'popupBg' | 'markerDot' | 'markerLine'
> & {
  /** 可寻址图片 URL；空串 = 使用内置 SVG 人形图标 */
  markerIcon: string;
  /** 可寻址弹窗背景图 URL；空串 = 使用 popupBgColor 纯色面板 */
  popupBgUrl: string;
  /** 契约颜色串弹窗背景（popupBg 非法/缺失时回退默认深蓝） */
  popupBgColor: string;
  markerDotColor: string;
  markerLineColor: string;
  markerOuter: string;
  markerInner: string;
};
const personnelMarkers = ref<PersonnelMarker[]>([]);

/** 契约颜色串缺省值（与后端种子一致） */
const PERSONNEL_POPUP_BG_FALLBACK = '#0b2a4a';
const PERSONNEL_DOT_FALLBACK = '#3ec6ff';

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
    markerIcon: addressableImageSrc(marker.markerIcon),
    popupBgUrl: addressableImageSrc(marker.popupBg),
    popupBgColor: cssColorOr(marker.popupBg, PERSONNEL_POPUP_BG_FALLBACK),
    markerDotColor: cssColorOr(marker.markerDot, PERSONNEL_DOT_FALLBACK),
    markerLineColor: cssColorOr(marker.markerLine, PERSONNEL_DOT_FALLBACK),
    markerOuter: designImg('圆形_41.webp', 'production') ?? '',
    markerInner: designImg('圆形_42.webp', 'production') ?? '',
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
        <!-- markerIcon 契约为裸文件名（前端不可寻址）：URL 化失败时回退内置 SVG 人形图标 -->
        <img
          v-if="marker.markerIcon"
          class="personnel-marker__icon"
          :src="marker.markerIcon"
          alt=""
        />
        <MapMarkerIcon v-else name="person" class="personnel-marker__icon-svg" />
        <div class="personnel-marker__line-wrap">
          <!-- 契约：markerLine/markerDot 为颜色串 → CSS 着色 -->
          <span class="personnel-marker__line" :style="{ background: marker.markerLineColor }" />
          <span class="personnel-marker__dot" :style="{ background: marker.markerDotColor }" />
        </div>
      </div>
      <div class="personnel-marker__popup">
        <img
          v-if="marker.popupBgUrl"
          class="personnel-marker__popup-bg"
          :src="marker.popupBgUrl"
          alt=""
        />
        <!-- 契约：popupBg 为颜色串 → 纯色面板 + 描边（统一弹窗样式，替代历史破图） -->
        <div
          v-else
          class="personnel-marker__popup-panel"
          :style="{ background: marker.popupBgColor }"
        />
        <div class="personnel-marker__popup-text">
          <div class="personnel-marker__location">位置：{{ marker.location }}</div>
          <div class="personnel-marker__count">
            <span>人员：</span>
            <span class="personnel-marker__count-value">{{ marker.count }}人</span>
          </div>
        </div>
      </div>
    </div>

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

/* markerIcon 无可寻址 URL 时的兜底：内置 SVG 人形图标（与公共点位组件 MapPointMarker 针内图标同语言） */
.personnel-marker__icon-svg {
  position: absolute;
  left: 14px;
  top: 13px;
  width: 16px;
  height: 16px;
  color: rgb(255 255 255 / 92%);
}

.personnel-marker__line-wrap {
  position: absolute;
  left: 21px;
  top: 63px;
  width: 3px;
  height: 22px;
}

/* 契约颜色串着色：引线/端点由 span + inline background 承担 */
.personnel-marker__line {
  display: block;
  width: 1px;
  height: 20px;
  margin-left: 1px;
}

.personnel-marker__dot {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 3px;
  height: 3px;
  border-radius: 50%;
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

/* popupBg 为颜色串（契约默认）时的统一弹窗面板：深蓝底 + 青色描边，与设计稿弹窗观感一致 */
.personnel-marker__popup-panel {
  position: absolute;
  inset: 0;
  border: 1px solid rgb(62 198 255 / 45%);
  border-radius: 2px;
  box-shadow: 0 2px 10px rgb(0 10 25 / 45%);
}

.personnel-marker__popup-text {
  position: relative;
  padding: 11px;
  font-size: 12px;
  color: var(--map-popup-text-blue);
  line-height: 1.4;
}

/* 长地点名截断，防溢出压线（弹窗高度 67px 固定） */
.personnel-marker__location {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.personnel-marker__count {
  margin-top: 8px;
  display: flex;
  gap: 4px;
}

.personnel-marker__count-value {
  color: var(--map-personnel-count);
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
