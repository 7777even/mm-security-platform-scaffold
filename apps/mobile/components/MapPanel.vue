<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * 移动端轻量地图面板（Leaflet）。
 *
 * 为何用 Leaflet 而非脚手架的 Cesium：Cesium 是三维 GIS 底座（大屏一张图），
 * 包体与首屏开销不适合移动端内嵌；移动端 §5.1 只要求「地图视图（轻量化，无大屏地图壳层）」，
 * 故选 Leaflet 承载二维点位/轨迹。
 *
 * 迁移与合规改动（2026-08，源 ui-redesign MapPanel.vue）：
 * - 标注 / 折线颜色由 hex 改为 token 变量（--danger-mobile / --primary-mobile），
 *   outdoor 皮肤下自动跟随；
 * - 尺寸、圆角、描边、标签样式全部引用 token，组件内零硬编码；
 * - 瓦片源：高德矢量路网（国内可达，浅色路网适合移动端演示，原型无需业务 Key）。
 *   **商业上线须改用正式高德 / 天地图 Key 与合规授权**，并复核 CSP connect-src。
 */
export type MapMarker = {
  lat: number;
  lng: number;
  /** 标注色（token 变量串）；省略取 --danger-mobile */
  color?: string;
  title?: string;
  /**
   * 业务分类（消防 / GDS / DCS / 周界 / 视频AI），供态势地图按来源筛选。
   * 仅作数据标记，MapPanel 不参与渲染；缺省即"不参与分类筛选"。
   */
  kind?: string;
};

const props = withDefaults(
  defineProps<{
    height?: string;
    /** [lat, lng] 厂区默认中心 */
    center?: [number, number];
    zoom?: number;
    markers?: MapMarker[];
    /** 路径折线 [lat, lng][] */
    path?: [number, number][];
    label?: string;
    /** 关闭交互用于首页缩略图（避免整页滚动被地图吞掉） */
    interactive?: boolean;
  }>(),
  {
    height: 'var(--mb-map-h-md)',
    center: () => [21.6685, 110.9258],
    zoom: 13,
    markers: () => [],
    path: () => [],
    label: '',
    interactive: true,
  },
);

const el = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let layerGroup: L.LayerGroup | null = null;

function markerIcon(color: string) {
  return L.divIcon({
    className: 'mb-pin',
    html: `<span class="mb-pin__dot" style="background:${color}"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function renderOverlays() {
  if (!map || !layerGroup) return;
  layerGroup.clearLayers();
  props.markers.forEach((m) => {
    const marker = L.marker([m.lat, m.lng], {
      icon: markerIcon(m.color ?? 'var(--danger-mobile)'),
      keyboard: false,
    });
    if (m.title) marker.bindPopup(m.title);
    layerGroup?.addLayer(marker);
  });
  if (props.path.length >= 2) {
    layerGroup.addLayer(
      L.polyline(props.path, {
        color: 'var(--primary-mobile)',
        weight: 4,
        opacity: 0.85,
        lineJoin: 'round',
      }),
    );
  }
}

function init() {
  if (!el.value || map) return;
  map = L.map(el.value, {
    center: props.center,
    zoom: props.zoom,
    zoomControl: props.interactive,
    dragging: props.interactive,
    scrollWheelZoom: props.interactive,
    doubleClickZoom: props.interactive,
    boxZoom: props.interactive,
    keyboard: props.interactive,
    attributionControl: true,
  });
  L.tileLayer(
    'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    {
      attribution: '高德地图',
      subdomains: '1234',
      maxZoom: 18,
    },
  ).addTo(map);
  layerGroup = L.layerGroup().addTo(map);
  renderOverlays();
  // 修复容器初始尺寸为 0 时的灰块
  requestAnimationFrame(() => map?.invalidateSize());
  setTimeout(() => map?.invalidateSize(), 120);
}

onMounted(() => init());
onBeforeUnmount(() => {
  map?.remove();
  map = null;
  layerGroup = null;
});

watch(
  () => [props.markers, props.path, props.center, props.zoom] as const,
  () => {
    if (!map) return;
    map.setView(props.center, props.zoom);
    renderOverlays();
  },
  { deep: true },
);
</script>

<template>
  <div class="mb-map" :style="{ height }">
    <div ref="el" class="mb-map__host" />
    <div v-if="label" class="mb-map__label">{{ label }}</div>
  </div>
</template>

<style scoped>
.mb-map {
  position: relative;
  overflow: hidden;
  background: var(--mb-progress-bg);
  border: var(--mb-border-w, 1px) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
}

.mb-map__host {
  z-index: var(--z-base);
  width: 100%;
  height: 100%;
}

.mb-map__label {
  position: absolute;
  top: var(--space-sm);
  left: var(--space-sm);
  z-index: var(--z-marker);
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--mb-fz-tip);
  color: var(--text-title-mobile);
  background: var(--card-mobile);
  border-radius: var(--mb-radius-btn);
  pointer-events: none;
}
</style>

<style>
/* Leaflet 默认图标路径在 Vite 下易失效，统一用 divIcon；此处隐藏缺图占位 */
.mb-pin {
  background: transparent !important;
  border: none !important;
}

.mb-pin__dot {
  display: block;
  width: var(--mb-ico-xs);
  height: var(--mb-ico-xs);
  border: var(--mb-border-w) solid var(--card-mobile);
  border-radius: 50%;
}
</style>
