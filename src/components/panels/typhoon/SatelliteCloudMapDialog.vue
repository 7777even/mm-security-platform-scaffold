<script setup lang="ts">
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import {
  useSatelliteCloudMap,
  type SatelliteCloudMapMode,
} from '@/composables/useSatelliteCloudMap';
import { formatTyphoonPopupHtml, useTyphoonTrackMap } from '@/composables/useTyphoonTrackMap';
import { satelliteCloudReflectivityLegend } from '@/services/weather/weatherLegend';
import { plantAreaBoundaryRings, plantAreaDefinitions } from '@/services/map-data/plantAreas';
import { createTyphoonEyeMarker } from '@/utils/typhoonEyeMarker';
import {
  FY4B_BOUNDS,
  fy4bImageUrlByBackstep,
  FY4B_MAX_BACKOFF,
} from '@/services/weather/fengyunApi';
import { buildRainViewerTileUrl, RAINVIEWER_TILE_SIZE } from '@/services/weather/rainViewerApi';
import { resolveTileSource, type WeatherTileSourceId } from '@/services/weather/weatherTileSources';
import {
  CHINA_RADAR_BOUNDS,
  chinaRadarImageUrlByBackstep,
  CHINA_RADAR_MAX_BACKOFF,
} from '@/services/weather/chinaRadarApi';
import TyphoonHistoryPanel from './TyphoonHistoryPanel.vue';
import '@/styles/accidentRescueScroll.css';

/**
 * 气象图层最大可下钻层级：风云真彩为整图叠加（860×540），放大过深会明显发虚。
 */
const SATELLITE_MAX_ZOOM = 6;
const WEATHER_MAX_ZOOM = 10;
const WEATHER_FRAME_INTERVAL = 1500;
const WEATHER_LAYER_LOAD_TIMEOUT = 6000;

const props = defineProps<{
  open: boolean;
  typhoonCode?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const mapMode = ref<SatelliteCloudMapMode>('satellite');
const mapContainerRef = ref<HTMLElement | null>(null);

const {
  loading,
  error,
  rainViewerHost,
  radarSource,
  rainViewerKey,
  timelineTicks,
  timelineLabelTicks,
  currentTick,
  radarCoverageHint,
  progress,
  sourceLabel,
  sourceDate,
  currentTimeLabel,
  timeRange,
  frameIndex,
  mapCenter,
  mapZoom,
  loadWeatherData,
  setTimeRange,
  setRadarSource,
  setProgress,
  stepFrame,
  resetPlayback,
  startAutoRefresh,
  stopAutoRefresh,
} = useSatelliteCloudMap();

const {
  loading: typhoonLoading,
  listLoading: typhoonListLoading,
  error: typhoonError,
  track: typhoonTrack,
  historyList: typhoonHistoryList,
  selectedCode: selectedTyphoonCode,
  hasActiveTyphoon,
  title: typhoonTitle,
  subtitle: typhoonSubtitle,
  selectTyphoon,
  initializeTyphoonData,
  resetTyphoonState,
} = useTyphoonTrackMap();

let map: L.Map | null = null;
let baseLayer: L.TileLayer | null = null;
let typhoonLayerGroup: L.FeatureGroup | null = null;
let plantLayerGroup: L.LayerGroup | null = null;
let playTimer: ReturnType<typeof setTimeout> | null = null;
let weatherSwapVersion = 0;
let weatherSyncVersion = 0;
let currentSatelliteSourceId: WeatherTileSourceId | null = null;

/**
 * 气象图层双缓冲：front 为当前显示，back 为空闲实例。
 * 切帧时先把新帧装进 back（opacity 0，不打断画面），加载完成后再交换并让旧帧退居 back。
 * 这样既避免 setUrl 直接清屏造成的空窗闪烁，也避免每帧重建 DOM 容器。
 */
interface WeatherBuffer {
  front: L.TileLayer | null;
  back: L.TileLayer | null;
}
const satelliteBuffer: WeatherBuffer = { front: null, back: null };
const radarBuffer: WeatherBuffer = { front: null, back: null };
let chinaRadarOverlay: L.ImageOverlay | null = null;
const chinaRadarBackstep = ref(0);
const lastChinaTickTime = ref(0);
let satelliteOverlay: L.ImageOverlay | null = null;
const satelliteBackstep = ref(0);
const lastSatTickTime = ref(0);

const playing = ref(false);
const weatherFrameLoading = ref(false);
const weatherOpacity = ref(0.72);
const viewScope = ref<'plant' | 'track'>('plant');
const resolutionCapped = ref(false);

const progressPercent = computed(() => `${Math.max(0, Math.min(1, progress.value)) * 100}%`);
const typhoonPathVisible = computed(() => mapMode.value === 'typhoonPath');
const isSatelliteMode = computed(() => mapMode.value === 'satellite');
const isVectorMode = computed(() => mapMode.value === 'vector');
const radarOpacity = computed(() => {
  if (mapMode.value === 'satellite') return Math.max(0.38, weatherOpacity.value - 0.08);
  if (mapMode.value === 'vector') return weatherOpacity.value;
  return 0.38;
});

const modeSourceLabel = computed(() => {
  if (mapMode.value === 'satellite') return sourceLabel.value;
  if (mapMode.value === 'vector') {
    return radarSource.value === 'china'
      ? '降雨雷达（中央气象台）· 矢量底图'
      : '降雨雷达（RainViewer）· 矢量底图';
  }
  if (typhoonTrack.value) return `台风数据服务 · ${typhoonTrack.value.name}`;
  return '台风路径数据';
});

const modeDescription = computed(() => {
  if (mapMode.value === 'satellite') return '风云四号B 真彩云图｜用于识别大范围云系覆盖';
  if (mapMode.value === 'vector') return '浅色地图 + 降雨雷达｜用于判断降雨位置与强度';
  return '实景影像 + 台风实况及多机构预报路径';
});

const AGENCY_ORDER = ['中国', '日本', '美国', '韩国', '欧洲', '中国香港', '中国台湾'];

const typhoonAgencyLegend = computed(() => {
  const track = typhoonTrack.value;
  if (!track) return [];

  const sortedLines = [...track.forecastLines].sort((a, b) => {
    const aIndex = AGENCY_ORDER.indexOf(a.agency);
    const bIndex = AGENCY_ORDER.indexOf(b.agency);
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });

  return [
    { label: '实况路径', color: '#ffffff', dashed: false },
    ...sortedLines.map((line) => ({
      label: line.agency,
      color: line.color,
      dashed: true,
    })),
  ];
});

function createVectorBaseLayer() {
  // CARTO 已对无 key 请求返回"API key required"报错瓦片、Esri 浅灰画布缺少参照特征；
  // 换高德中文矢量底图：免 key、国内 CDN、路网/城市/中文标注齐全。
  // 注意高德为 GCJ-02 坐标，与 WGS-84 叠加层存在约 500m 系统偏移，全国/城市级视图下可忽略。
  return L.tileLayer(
    'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    {
      attribution: '<a href="https://www.amap.com/" target="_blank" rel="noopener">高德地图</a>',
      subdomains: '1234',
      maxZoom: 18,
    },
  );
}

function createImageryBaseLayer() {
  return L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: '卫星影像底图',
      maxZoom: 19,
    },
  );
}

function syncBaseLayer() {
  if (!map) return;
  baseLayer?.remove();
  baseLayer = isVectorMode.value ? createVectorBaseLayer() : createImageryBaseLayer();
  baseLayer.addTo(map);
  baseLayer.bringToBack();
}

const allPlantLatLngs = Object.values(plantAreaBoundaryRings)
  .flat(2)
  .map(([lng, lat]) => L.latLng(lat!, lng!));

function focusPlantOverview() {
  if (!map || !allPlantLatLngs.length) return;
  viewScope.value = 'plant';
  map.fitBounds(L.latLngBounds(allPlantLatLngs).pad(0.22), { animate: true });
}

function focusTyphoonTrack() {
  if (!map || !typhoonLayerGroup) return;
  const bounds = typhoonLayerGroup.getBounds();
  if (!bounds.isValid()) return;
  viewScope.value = 'track';
  map.fitBounds(bounds.pad(0.12), { animate: true });
}

function drawPlantOverview() {
  plantLayerGroup?.remove();
  if (!map) return;
  plantLayerGroup = L.layerGroup().addTo(map);
  const styles = {
    refinery: { color: '#00eaff', label: '炼油区' },
    chemical: { color: '#ffb547', label: '化工区' },
    port: { color: '#62d58f', label: '港区' },
  } as const;
  for (const [code, rings] of Object.entries(plantAreaBoundaryRings)) {
    const style = styles[code as keyof typeof styles];
    for (const ring of rings) {
      L.polygon(
        ring.map(([lng, lat]) => [lat!, lng!] as L.LatLngTuple),
        {
          color: style.color,
          weight: 2,
          opacity: 0.95,
          fillColor: style.color,
          fillOpacity: 0.08,
          dashArray: '7 5',
          interactive: false,
        },
      ).addTo(plantLayerGroup);
    }
  }
  for (const area of plantAreaDefinitions.filter((item) => item.code !== 'all')) {
    for (const center of area.centers) {
      L.marker([center.latitude, center.longitude], {
        interactive: false,
        icon: L.divIcon({
          className: 'scm-plant-label-wrap',
          html: `<span class="scm-plant-label">${area.label}</span>`,
          iconSize: [72, 26],
          iconAnchor: [36, 13],
        }),
      }).addTo(plantLayerGroup);
    }
  }
}

function buildRadarUrl(path: string): string {
  return buildRainViewerTileUrl(
    rainViewerHost.value,
    path,
    0,
    0,
    0,
    RAINVIEWER_TILE_SIZE,
    rainViewerKey.value || undefined,
  ).replace('/0/0/0/', '/{z}/{x}/{y}/');
}

function currentZoom(): number {
  return map ? map.getZoom() : mapZoom;
}

function refreshZoomDerivedState() {
  const resolved = resolveTileSource(currentZoom());
  resolutionCapped.value = resolved.capped;
  return resolved;
}

function createWeatherTileLayer(
  url: string,
  options: { maxNativeZoom: number; className?: string; attribution: string },
): L.TileLayer {
  return L.tileLayer(url, {
    opacity: 0,
    className: options.className,
    maxNativeZoom: options.maxNativeZoom,
    maxZoom: WEATHER_MAX_ZOOM,
    // 关闭淡入：瓦片从 opacity 0 淡入会在切帧瞬间露出底图，是「一闪一闪」的直接来源
    fadeAnimation: false,
    keepBuffer: 4,
    attribution: options.attribution,
    // fadeAnimation / keepBuffer 属 GridLayerOptions，leaflet 类型未透传到 TileLayerOptions，此处断言
  } as L.TileLayerOptions);
}

function waitForTileLayer(layer: L.TileLayer): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (loaded: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      layer.off('load', handleLoad);
      resolve(loaded);
    };
    const handleLoad = () => finish(true);
    const timeout = setTimeout(() => finish(false), WEATHER_LAYER_LOAD_TIMEOUT);
    layer.once('load', handleLoad);
  });
}

/** 国内雷达为 imageOverlay，加载完成/失败均结算（失败交由 recoverChinaRadar 回退） */
function waitForImageOverlay(layer: L.ImageOverlay): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (loaded: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      layer.off('load', onLoad);
      layer.off('error', onError);
      resolve(loaded);
    };
    const onLoad = () => finish(true);
    const onError = () => finish(false);
    const timeout = setTimeout(() => finish(false), WEATHER_LAYER_LOAD_TIMEOUT);
    layer.once('load', onLoad);
    layer.once('error', onError);
  });
}

/** 国内雷达瓦片缺失时回退到更早时次（最多 CHINA_RADAR_MAX_BACKOFF 次） */
function recoverChinaRadar() {
  if (chinaRadarBackstep.value < CHINA_RADAR_MAX_BACKOFF) {
    chinaRadarBackstep.value += 1;
    void syncWeatherLayers();
  }
}

function removeChinaRadarOverlay() {
  if (chinaRadarOverlay) {
    chinaRadarOverlay.off('error', recoverChinaRadar);
    chinaRadarOverlay.remove();
    chinaRadarOverlay = null;
  }
}

/** 把国内雷达拼图（imageOverlay）同步到当前时次，加载成功后淡入 */
function syncChinaRadarOverlay(baseUnixMs: number): Promise<boolean> {
  if (!map) return Promise.resolve(false);
  const url = chinaRadarImageUrlByBackstep(baseUnixMs, chinaRadarBackstep.value);
  const previous = chinaRadarOverlay;
  const next = L.imageOverlay(url, CHINA_RADAR_BOUNDS, {
    opacity: 0,
    interactive: false,
    attribution:
      '<a href="https://www.nmc.cn/publish/radar/china-colorful.html" target="_blank" rel="noopener">中央气象台雷达</a>',
  });
  next.on('error', recoverChinaRadar);
  next.addTo(map);
  chinaRadarOverlay = next;
  const promise = waitForImageOverlay(next);
  void promise.then((loaded) => {
    if (loaded && chinaRadarOverlay === next) {
      next.setOpacity(radarOpacity.value);
    }
    if (chinaRadarOverlay === next && previous && previous !== next) {
      previous.remove();
    }
  });
  return promise;
}

/** 风云云图帧缺失（夜间无新帧等）时回退到更早时次（最多 FY4B_MAX_BACKOFF 次） */
function recoverSatellite() {
  if (satelliteBackstep.value < FY4B_MAX_BACKOFF) {
    satelliteBackstep.value += 1;
    void syncWeatherLayers();
  }
}

function removeFengyunOverlay() {
  if (satelliteOverlay) {
    satelliteOverlay.off('error', recoverSatellite);
    satelliteOverlay.remove();
    satelliteOverlay = null;
  }
}

/** 把风云真彩云图（imageOverlay）同步到当前时次，加载成功后淡入 */
function syncFengyunOverlay(baseUnixMs: number): Promise<boolean> {
  if (!map) return Promise.resolve(false);
  const url = fy4bImageUrlByBackstep(baseUnixMs, satelliteBackstep.value);
  const previous = satelliteOverlay;
  const next = L.imageOverlay(url, FY4B_BOUNDS, {
    opacity: 0,
    interactive: false,
    attribution:
      '<a href="https://www.nmc.cn/publish/satellite/fy4b-visible.htm" target="_blank" rel="noopener">风云四号B · 中央气象台</a>',
  });
  next.on('error', recoverSatellite);
  next.addTo(map);
  satelliteOverlay = next;
  const promise = waitForImageOverlay(next);
  void promise.then((loaded) => {
    if (loaded && satelliteOverlay === next) {
      next.setOpacity(weatherOpacity.value);
    }
    if (satelliteOverlay === next && previous && previous !== next) {
      previous.remove();
    }
  });
  return promise;
}

/**
 * 把 url 装进 buffer.back 并等待其加载完成，完成后与 front 交换显隐。
 * 返回 false 表示本次交换已被更新的切换取代（调用方不应改动状态）。
 */
async function swapWeatherLayer(
  buffer: WeatherBuffer,
  url: string,
  options: { maxNativeZoom: number; className?: string; attribution: string; opacity: number },
): Promise<boolean> {
  const activeMap = map;
  if (!activeMap) return false;

  const version = ++weatherSwapVersion;
  let next = buffer.back;

  if (next) {
    // noRedraw=true：先只换 URL，避免立刻清屏造成空窗
    next.setUrl(url, true);
    (next.options as L.TileLayerOptions).maxNativeZoom = options.maxNativeZoom;
  } else {
    next = createWeatherTileLayer(url, options);
  }

  next.setOpacity(0);
  next.addTo(activeMap);
  next.redraw();

  const loaded = await waitForTileLayer(next);

  if (version !== weatherSwapVersion || map !== activeMap) {
    next.remove();
    buffer.back = next;
    return false;
  }

  // 超时也照常提交：宁可看到渐进加载的新帧，也不要画面长期停在旧帧（既有的「没有变化」问题）
  const previous = buffer.front;
  // 旧 front 退居 back：压到 0 透明度常驻，下次切帧直接复用，避免整层重建造成的空窗
  previous?.setOpacity(0);
  next.setOpacity(options.opacity);
  buffer.front = next;
  buffer.back = previous;

  return loaded;
}

function retireWeatherBuffer(buffer: WeatherBuffer) {
  buffer.front?.remove();
  buffer.back?.remove();
  buffer.front = null;
  buffer.back = null;
}

async function syncWeatherLayers() {
  if (!map) return;
  const syncVersion = ++weatherSyncVersion;
  const finishLoading = () => {
    // 只有仍是最新一次切换时才复位加载态，避免被并发切换覆盖成永久 true
    if (syncVersion === weatherSyncVersion) weatherFrameLoading.value = false;
  };

  const resolved = refreshZoomDerivedState();

  if (typhoonPathVisible.value) {
    retireWeatherBuffer(satelliteBuffer);
    retireWeatherBuffer(radarBuffer);
    removeChinaRadarOverlay();
    removeFengyunOverlay();
    currentSatelliteSourceId = null;
    updateTyphoonOverlay();
    finishLoading();
    return;
  }

  const tick = currentTick.value;
  if (!tick) {
    retireWeatherBuffer(satelliteBuffer);
    retireWeatherBuffer(radarBuffer);
    removeChinaRadarOverlay();
    removeFengyunOverlay();
    finishLoading();
    return;
  }

  if (tick.time !== lastChinaTickTime.value) {
    chinaRadarBackstep.value = 0;
    lastChinaTickTime.value = tick.time;
  }
  if (tick.time !== lastSatTickTime.value) {
    satelliteBackstep.value = 0;
    lastSatTickTime.value = tick.time;
  }

  currentSatelliteSourceId = resolved.id;

  const jobs: Array<Promise<boolean>> = [];

  if (isSatelliteMode.value) {
    // 风云四号B 真彩云图（中央气象台，国内可达）。夜间无新帧时回退更早白天帧。
    jobs.push(syncFengyunOverlay(tick.time * 1000));
  } else {
    retireWeatherBuffer(satelliteBuffer);
  }

  if (radarSource.value === 'china') {
    retireWeatherBuffer(radarBuffer);
    jobs.push(syncChinaRadarOverlay(tick.time * 1000));
  } else {
    removeChinaRadarOverlay();
    if (tick.rainViewerPath) {
      jobs.push(
        swapWeatherLayer(radarBuffer, buildRadarUrl(tick.rainViewerPath), {
          maxNativeZoom: 7,
          attribution:
            '<a href="https://www.rainviewer.com/" target="_blank" rel="noopener">降雨雷达数据</a>',
          opacity: radarOpacity.value,
        }),
      );
    } else {
      retireWeatherBuffer(radarBuffer);
    }
  }

  if (!jobs.length) {
    finishLoading();
    clearTyphoonLayers();
    return;
  }

  weatherFrameLoading.value = true;
  await Promise.all(jobs);
  finishLoading();

  clearTyphoonLayers();

  void preloadNextFrame();
}

/** 把下一帧预先装进 back 缓冲（常驻、opacity 0），使播放推进时无需等待网络（双缓冲预取） */
async function preloadNextFrame() {
  if (!map || !playing.value) return;
  const ticks = timelineTicks.value;
  const nextIndex = frameIndex.value + 1;
  if (nextIndex >= ticks.length) return;
  const nextTick = ticks[nextIndex]!;

  if (isSatelliteMode.value) {
    // 国内整图源无瓦片缓冲，用 Image 预热浏览器缓存实现等效预取
    const img = new Image();
    img.src = fy4bImageUrlByBackstep(nextTick.time * 1000, satelliteBackstep.value);
  }
  if (radarSource.value === 'china') {
    const img = new Image();
    img.src = chinaRadarImageUrlByBackstep(nextTick.time * 1000, chinaRadarBackstep.value);
  } else if (radarSource.value === 'rainviewer' && nextTick.rainViewerPath && radarBuffer.back) {
    radarBuffer.back.setOpacity(0);
    radarBuffer.back.setUrl(buildRadarUrl(nextTick.rainViewerPath), true);
    radarBuffer.back.redraw();
    void waitForTileLayer(radarBuffer.back);
  }
}

function applyMapZoomLimit() {
  if (!map) return;
  const maxZoom = isSatelliteMode.value ? SATELLITE_MAX_ZOOM : WEATHER_MAX_ZOOM;
  map.setMaxZoom(maxZoom);
  if (map.getZoom() > maxZoom) map.setZoom(maxZoom, { animate: true });
  refreshZoomDerivedState();
}

function handleZoomEnd() {
  const resolved = refreshZoomDerivedState();
  // 与官方一致：拼图在 z≥9 已无意义（约 2km/px），隐藏避免糊块误导
  const radarEl = chinaRadarOverlay?.getElement();
  if (radarEl) radarEl.style.opacity = map && map.getZoom() >= 9 ? '0' : '';
  if (!typhoonPathVisible.value && resolved.id !== currentSatelliteSourceId) {
    void syncWeatherLayers();
  }
}

function destroyMap() {
  weatherSwapVersion += 1;
  weatherFrameLoading.value = false;
  if (map) {
    map.off('zoomend', handleZoomEnd);
    map.remove();
    map = null;
  }
  retireWeatherBuffer(satelliteBuffer);
  retireWeatherBuffer(radarBuffer);
  removeChinaRadarOverlay();
  removeFengyunOverlay();
  baseLayer = null;
  currentSatelliteSourceId = null;
  clearTyphoonLayers();
  plantLayerGroup = null;
}

function clearTyphoonLayers() {
  if (typhoonLayerGroup) {
    typhoonLayerGroup.remove();
    typhoonLayerGroup = null;
  }
}

function bindTyphoonMarker(
  point: Parameters<typeof formatTyphoonPopupHtml>[0],
  options: {
    radius: number;
    color: string;
    fillColor: string;
    weight: number;
    fillOpacity?: number;
    hitRadius?: number;
  },
) {
  if (!typhoonLayerGroup) return;

  const popupHtml = formatTyphoonPopupHtml(point);
  const hitRadius = options.hitRadius ?? Math.max(options.radius + 6, 12);

  const hitMarker = L.circleMarker([point.lat, point.lng], {
    radius: hitRadius,
    stroke: false,
    fillColor: '#000000',
    fillOpacity: 0.001,
    interactive: true,
    bubblingMouseEvents: false,
  });
  hitMarker.bindPopup(popupHtml, {
    className: 'scm-typhoon-popup-wrap',
    maxWidth: 260,
  });
  hitMarker.on('click', () => {
    hitMarker.openPopup();
  });
  hitMarker.addTo(typhoonLayerGroup);

  const marker = L.circleMarker([point.lat, point.lng], {
    radius: options.radius,
    color: options.color,
    fillColor: options.fillColor,
    fillOpacity: options.fillOpacity ?? 0.92,
    weight: options.weight,
    interactive: false,
    bubblingMouseEvents: false,
  });
  marker.addTo(typhoonLayerGroup);
}

function updateTyphoonOverlay() {
  clearTyphoonLayers();
  if (!map || !typhoonPathVisible.value || !typhoonTrack.value) return;

  const track = typhoonTrack.value;
  typhoonLayerGroup = L.featureGroup().addTo(map);

  if (track.observedCoords.length > 1) {
    L.polyline(track.observedCoords, {
      color: '#ffffff',
      weight: 3,
      opacity: 0.96,
      interactive: false,
    }).addTo(typhoonLayerGroup);
  }

  for (const line of track.forecastLines) {
    if (line.coords.length < 2) continue;
    L.polyline(line.coords, {
      color: line.color,
      weight: 2,
      opacity: 0.92,
      dashArray: '8 6',
      interactive: false,
    }).addTo(typhoonLayerGroup);

    for (const point of line.points) {
      bindTyphoonMarker(point, {
        radius: 4,
        color: line.color,
        fillColor: line.color,
        weight: 2,
        fillOpacity: 0.85,
      });
    }
  }

  track.observedPoints.forEach((point, index) => {
    const isLatest = index === track.observedPoints.length - 1;
    if (isLatest) return;
    bindTyphoonMarker(point, {
      radius: 5,
      color: '#ffffff',
      fillColor: '#0a1e36',
      weight: 2,
      fillOpacity: 0.9,
    });
  });

  const latestPoint = track.observedPoints[track.observedPoints.length - 1];
  if (latestPoint) {
    bindTyphoonMarker(latestPoint, {
      radius: 0,
      color: 'transparent',
      fillColor: 'transparent',
      weight: 0,
      fillOpacity: 0,
      hitRadius: 20,
    });
    const eyeMarker = createTyphoonEyeMarker(latestPoint, formatTyphoonPopupHtml(latestPoint));
    eyeMarker.setZIndexOffset(1300);
    eyeMarker.addTo(typhoonLayerGroup);
  }

  if (viewScope.value === 'track') focusTyphoonTrack();
}

async function initMap() {
  if (!mapContainerRef.value || map) return;

  map = L.map(mapContainerRef.value, {
    center: mapCenter,
    zoom: mapZoom,
    maxZoom: isSatelliteMode.value ? SATELLITE_MAX_ZOOM : WEATHER_MAX_ZOOM,
    zoomControl: false,
    attributionControl: true,
  });
  map.attributionControl.setPrefix(false);
  map.on('zoomend', handleZoomEnd);

  syncBaseLayer();
  drawPlantOverview();

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  refreshZoomDerivedState();
  void syncWeatherLayers();
  requestAnimationFrame(() => {
    map?.invalidateSize();
    focusPlantOverview();
  });
}

watch(
  () => props.open,
  async (visible) => {
    if (visible) {
      await Promise.all([loadWeatherData(), initializeTyphoonData()]);
      await nextTick();
      await initMap();
      startAutoRefresh();
      return;
    }

    stopAutoRefresh();
    stopPlayback();
    destroyMap();
    resetPlayback();
    resetTyphoonState();
    mapMode.value = 'satellite';
    viewScope.value = 'plant';
  },
);

watch(typhoonPathVisible, async (visible) => {
  if (!props.open || !map) return;
  await nextTick();
  requestAnimationFrame(() => map?.invalidateSize());
  if (visible && !typhoonHistoryList.value.length) {
    await initializeTyphoonData();
  }
});

watch(typhoonTrack, () => {
  if (props.open && map && typhoonPathVisible.value) {
    updateTyphoonOverlay();
  }
});

watch([currentTick, rainViewerHost], () => {
  if (props.open && map && currentTick.value) {
    void syncWeatherLayers();
  }
});

watch(radarSource, () => {
  if (props.open && map && currentTick.value) {
    void syncWeatherLayers();
  }
});

// 仅底图类型真的变化时才重建底图；透明度变化不再触发整层重建（消除拖滑块的整屏闪烁）
watch(mapMode, () => {
  if (!props.open || !map) return;
  syncBaseLayer();
  applyMapZoomLimit();
  if (typhoonPathVisible.value) {
    void syncWeatherLayers();
    return;
  }
  if (currentTick.value) {
    void syncWeatherLayers();
  } else {
    clearTyphoonLayers();
  }
});

watch(radarOpacity, () => {
  if (!props.open || !map) return;
  radarBuffer.front?.setOpacity(radarOpacity.value);
});

onUnmounted(() => {
  stopAutoRefresh();
  stopPlayback();
  destroyMap();
});

function closeDialog() {
  emit('close');
}

function stopPlayback() {
  playing.value = false;
  if (playTimer) {
    clearTimeout(playTimer);
    playTimer = null;
  }
}

function scheduleNextFrame() {
  if (!playing.value) return;
  playTimer = setTimeout(() => {
    if (!playing.value) return;
    if (weatherFrameLoading.value) {
      scheduleNextFrame();
      return;
    }
    // 到达末帧即停止，不再回绕到 24 小时前
    if (frameIndex.value >= timelineTicks.value.length - 1) {
      stopPlayback();
      return;
    }
    stepFrame(1);
    scheduleNextFrame();
  }, WEATHER_FRAME_INTERVAL);
}

function togglePlayback() {
  if (playing.value) {
    stopPlayback();
    return;
  }

  if (timelineTicks.value.length < 2) return;

  // 已停在末帧时先回到起点，否则一按播放就立刻结束
  if (frameIndex.value >= timelineTicks.value.length - 1) {
    setProgress(0);
  }

  playing.value = true;
  scheduleNextFrame();
}

function seekTick(position: number) {
  setProgress(position);
}

function onMapModeChange(mode: SatelliteCloudMapMode) {
  mapMode.value = mode;
  applyMapZoomLimit();
  if (mode === 'typhoonPath') {
    viewScope.value = 'track';
    void initializeTyphoonData();
    requestAnimationFrame(focusTyphoonTrack);
    return;
  }
  viewScope.value = 'plant';
  requestAnimationFrame(focusPlantOverview);
}

function onOpacityChange(event: Event) {
  const value = Number((event.target as HTMLInputElement).value);
  weatherOpacity.value = value;
  satelliteBuffer.front?.setOpacity(value);
  satelliteOverlay?.setOpacity(value);
  radarBuffer.front?.setOpacity(radarOpacity.value);
}

function onTimeRangeChange(range: '24h' | '6h' | 'current') {
  setTimeRange(range);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="scm-fade">
      <div v-if="open" class="scm-overlay" @click.self="closeDialog">
        <section
          class="scm-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="卫星云图"
          @click.stop
        >
          <header class="scm-header">
            <h3 class="scm-header__title">卫星云图</h3>
            <button type="button" class="scm-header__close" @click="closeDialog">×</button>
          </header>

          <div class="scm-body" :class="{ 'scm-body--typhoon-path': typhoonPathVisible }">
            <TyphoonHistoryPanel
              v-if="typhoonPathVisible"
              class="scm-typhoon-history"
              :loading="typhoonListLoading"
              :items="typhoonHistoryList"
              :selected-code="selectedTyphoonCode"
              :has-active-typhoon="hasActiveTyphoon"
              @select="selectTyphoon"
            />

            <div ref="mapContainerRef" class="scm-map" />

            <div v-if="loading" class="scm-status scm-status--loading">正在加载气象数据…</div>
            <div v-else-if="error" class="scm-status scm-status--error">{{ error }}</div>
            <div
              v-else-if="typhoonPathVisible && typhoonLoading"
              class="scm-status scm-status--loading"
            >
              正在加载台风路径…
            </div>
            <div
              v-else-if="typhoonPathVisible && typhoonError"
              class="scm-status scm-status--error"
            >
              {{ typhoonError }}
            </div>

            <div v-if="typhoonPathVisible && typhoonTrack" class="scm-typhoon-meta">
              <div class="scm-typhoon-meta__title">{{ typhoonTitle }}</div>
              <div class="scm-typhoon-meta__sub">{{ typhoonSubtitle }}</div>
            </div>

            <button type="button" class="scm-plant-return" @click="focusPlantOverview">
              回到全厂区视角
            </button>

            <div class="scm-float scm-float--mode">
              <button
                type="button"
                class="scm-seg"
                :class="{ 'scm-seg--active': mapMode === 'satellite' }"
                @click.stop.prevent="onMapModeChange('satellite')"
              >
                卫星云图
              </button>
              <button
                type="button"
                class="scm-seg"
                :class="{ 'scm-seg--active': mapMode === 'vector' }"
                @click.stop.prevent="onMapModeChange('vector')"
              >
                降雨雷达
              </button>
              <button
                type="button"
                class="scm-seg"
                :class="{ 'scm-seg--active': mapMode === 'typhoonPath' }"
                @click.stop.prevent="onMapModeChange('typhoonPath')"
              >
                台风路径
              </button>
            </div>

            <div class="scm-mode-explain">
              <span>{{
                mapMode === 'satellite'
                  ? '卫星观云'
                  : mapMode === 'vector'
                    ? '雷达看雨'
                    : '台风研判'
              }}</span>
              {{ modeDescription }}
            </div>

            <div v-if="resolutionCapped && !typhoonPathVisible" class="scm-status scm-capped-hint">
              已达 10 分钟级卫星源最高分辨率（≈2 km/px）
            </div>

            <div v-if="!typhoonPathVisible" class="scm-float scm-float--range">
              <button
                v-for="opt in ['24h', '6h', 'current'] as const"
                :key="opt"
                type="button"
                class="scm-seg scm-seg--compact"
                :class="{ 'scm-seg--active': timeRange === opt }"
                @click="onTimeRangeChange(opt)"
              >
                {{ opt === 'current' ? '当前' : opt === '24h' ? '24小时' : '6小时' }}
              </button>
            </div>

            <div v-if="!typhoonPathVisible" class="scm-float scm-float--radarsrc">
              <button
                type="button"
                class="scm-seg scm-seg--compact"
                :class="{ 'scm-seg--active': radarSource === 'china' }"
                @click="setRadarSource('china')"
              >
                国内雷达
              </button>
              <button
                type="button"
                class="scm-seg scm-seg--compact"
                :class="{ 'scm-seg--active': radarSource === 'rainviewer' }"
                :disabled="!rainViewerKey"
                :title="!rainViewerKey ? '全球雷达需配置 VITE_RAINVIEWER_KEY' : ''"
                @click="setRadarSource('rainviewer')"
              >
                全球雷达
              </button>
            </div>

            <div v-if="!typhoonPathVisible" class="scm-float scm-float--clarity">
              <span>云图透明度</span>
              <input
                type="range"
                min="0.38"
                max="0.82"
                step="0.02"
                :value="weatherOpacity"
                aria-label="云图透明度"
                @input="onOpacityChange"
              />
              <strong>{{ Math.round(weatherOpacity * 100) }}%</strong>
            </div>

            <div v-if="typhoonPathVisible" class="scm-float scm-float--scope">
              <button
                type="button"
                class="scm-seg scm-seg--compact"
                :class="{ 'scm-seg--active': viewScope === 'plant' }"
                @click="focusPlantOverview"
              >
                全厂区
              </button>
              <button
                type="button"
                class="scm-seg scm-seg--compact"
                :class="{ 'scm-seg--active': viewScope === 'track' }"
                @click="focusTyphoonTrack"
              >
                路径全貌
              </button>
            </div>

            <aside
              v-if="typhoonPathVisible && typhoonAgencyLegend.length"
              class="scm-typhoon-legend"
              aria-label="台风路径图例"
            >
              <div class="scm-typhoon-legend__title">路径图例</div>
              <div
                v-for="item in typhoonAgencyLegend"
                :key="item.label"
                class="scm-typhoon-legend__item"
              >
                <span
                  class="scm-typhoon-legend__line"
                  :class="{ 'scm-typhoon-legend__line--dashed': item.dashed }"
                  :style="{
                    background: item.dashed ? 'transparent' : item.color,
                    borderColor: item.color,
                  }"
                />
                <span>{{ item.label }}</span>
              </div>
            </aside>

            <aside v-else class="scm-legend" aria-label="反射率图例">
              <div class="scm-legend__title">基本反射率 dBZ</div>
              <div class="scm-legend__bar">
                <span
                  v-for="item in satelliteCloudReflectivityLegend"
                  :key="item.dbz"
                  class="scm-legend__step"
                  :style="{ background: item.color }"
                  :title="`${item.dbz} dBZ`"
                />
              </div>
              <div class="scm-legend__labels">
                <span>10</span>
                <span>35</span>
                <span>70</span>
              </div>
            </aside>

            <footer class="scm-timeline">
              <div class="scm-timeline__meta">
                <div class="scm-timeline__source">
                  {{ modeSourceLabel }}<span v-if="weatherFrameLoading"> · 正在预载下一帧</span>
                  <span v-if="radarCoverageHint" class="scm-timeline__hint">
                    · {{ radarCoverageHint }}</span
                  >
                </div>
                <div class="scm-timeline__date">{{ sourceDate }}</div>
              </div>

              <button
                type="button"
                class="scm-timeline__play"
                :class="{ 'scm-timeline__play--pause': playing }"
                :disabled="timelineTicks.length < 2 || loading"
                :aria-label="playing ? '暂停' : '播放'"
                @click="togglePlayback"
              />

              <div class="scm-timeline__track-wrap">
                <div class="scm-timeline__track">
                  <span class="scm-timeline__progress" :style="{ width: progressPercent }" />
                  <button
                    v-for="tick in timelineLabelTicks"
                    :key="tick.id"
                    type="button"
                    class="scm-timeline__tick"
                    :class="{ 'scm-timeline__tick--now': tick.isNow }"
                    :style="{ left: `${tick.position * 100}%` }"
                    @click="seekTick(tick.position)"
                  >
                    {{ tick.label }}
                  </button>
                  <span class="scm-timeline__cursor" :style="{ left: progressPercent }">
                    {{ currentTimeLabel }}
                  </span>
                </div>
              </div>
            </footer>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.scm-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  display: flex;
  align-items: stretch;
  justify-content: center;
  background: rgb(0 8 20 / 72%);
  backdrop-filter: blur(4px);
}

.scm-dialog {
  width: min(1680px, calc(100vw - 48px));
  height: min(920px, calc(100vh - 48px));
  margin: auto;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  border: 1px solid rgb(0 150 236 / 35%);
  background: #061428;
  box-shadow: 0 24px 64px rgb(0 0 0 / 48%);
  overflow: hidden;
}

.scm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 46px;
  padding: 0 16px;
  border-bottom: 1px solid rgb(0 110 190 / 28%);
  background: rgb(0 18 40 / 92%);
}

.scm-header__title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: rgb(255 255 255 / 95%);
}

.scm-header__close {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid rgb(0 150 236 / 32%);
  background: rgb(0 0 0 / 12%);
  color: rgb(255 255 255 / 90%);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.scm-body {
  position: relative;
  flex: 1;
  min-height: 0;
}

:deep(.scm-typhoon-history) {
  position: absolute;
  left: 14px;
  top: 58px;
  height: 82%;
  max-height: calc(100% - 58px - 112px);
  width: 320px;
  z-index: var(--z-local-1200);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgb(0 150 236 / 28%);
  background: rgb(0 18 40 / 88%);
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 28px rgb(0 0 0 / 32%);
  pointer-events: auto;
}

.scm-map {
  position: absolute;
  inset: 0;
  z-index: var(--z-base);
  background: #dce8ef;
  pointer-events: auto;
}

.scm-map :deep(.leaflet-container) {
  width: 100%;
  height: 100%;
  background: #dce8ef;
  font-family: var(--font-body);
}

.scm-map :deep(.leaflet-control-attribution) {
  background: rgb(0 18 40 / 72%);
  color: rgb(168 184 204 / 88%);
  font-size: 10px;
}

.scm-map :deep(.leaflet-control-attribution a) {
  color: rgb(126 200 255 / 95%);
}

.scm-map :deep(.leaflet-control-zoom) {
  border: 1px solid rgb(0 150 236 / 28%);
  border-radius: 6px;
  overflow: hidden;
}

.scm-map :deep(.leaflet-control-zoom a) {
  background: rgb(0 18 40 / 88%);
  color: rgb(255 255 255 / 90%);
  border-bottom-color: rgb(0 110 190 / 22%);
}

.scm-map :deep(.scm-satellite-tiles) {
  filter: contrast(1.28) brightness(1.14);
}

:global(.scm-plant-label-wrap) {
  background: transparent;
  border: 0;
}

:global(.scm-plant-label) {
  display: grid;
  place-items: center;
  width: 72px;
  height: 26px;
  border: 1px solid rgb(0 234 255 / 68%);
  border-radius: 13px;
  background: rgb(0 18 40 / 90%);
  box-shadow: 0 4px 14px rgb(0 0 0 / 38%);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

:global(.scm-typhoon-popup-wrap .leaflet-popup-content-wrapper) {
  border-radius: 8px;
  background: rgb(0 18 40 / 94%);
  border: 1px solid rgb(0 150 236 / 32%);
  color: #eaf2ff;
  box-shadow: 0 10px 28px rgb(0 0 0 / 35%);
}

:global(.scm-typhoon-popup-wrap .leaflet-popup-tip) {
  background: rgb(0 18 40 / 94%);
  border: 1px solid rgb(0 150 236 / 22%);
}

.scm-typhoon-meta {
  position: absolute;
  left: 14px;
  top: 58px;
  z-index: var(--z-local-1210);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgb(0 150 236 / 28%);
  background: rgb(0 18 40 / 82%);
  backdrop-filter: blur(6px);
  pointer-events: none;
}

.scm-body--typhoon-path .scm-typhoon-meta {
  left: 346px;
}

.scm-typhoon-meta__title {
  font-size: 13px;
  font-weight: 500;
  color: rgb(255 255 255 / 95%);
}

.scm-typhoon-meta__sub {
  margin-top: 2px;
  font-size: 11px;
  color: rgb(168 184 204 / 90%);
}

.scm-typhoon-legend {
  position: absolute;
  right: 14px;
  bottom: 88px;
  min-width: 108px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgb(0 150 236 / 28%);
  background: rgb(0 18 40 / 82%);
  backdrop-filter: blur(6px);
  z-index: var(--z-local-2);
  pointer-events: none;
}

.scm-typhoon-legend__title {
  font-size: 10px;
  color: rgb(200 212 232 / 90%);
  margin-bottom: 6px;
}

.scm-typhoon-legend__item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: rgb(200 212 232 / 92%);
  line-height: 1.8;
}

.scm-typhoon-legend__line {
  width: 22px;
  height: 0;
  border-top: 2px solid transparent;
}

.scm-typhoon-legend__line--dashed {
  border-top-style: dashed;
}

:global(.scm-typhoon-eye-marker) {
  background: transparent;
  border: none;
  pointer-events: auto;
  cursor: pointer;
}

:global(.scm-typhoon-eye__img) {
  display: block;
  width: 44px;
  height: 44px;
  object-fit: contain;
  filter: drop-shadow(0 0 8px rgb(255 92 92 / 55%));
  animation: scm-typhoon-spin 3.2s linear infinite;
  pointer-events: none;
  user-select: none;
}

@keyframes scm-typhoon-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.scm-status {
  position: absolute;
  top: 56px;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-local-3);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  border: 1px solid rgb(0 150 236 / 28%);
  background: rgb(0 18 40 / 88%);
}

.scm-status--loading {
  color: rgb(200 212 232 / 95%);
}

.scm-status--error {
  color: #ff8f8f;
  border-color: rgb(255 92 92 / 35%);
}

.scm-capped-hint {
  color: rgb(200 212 232 / 95%);
}

.scm-plant-return {
  position: absolute;
  left: 18px;
  bottom: 98px;
  height: 34px;
  padding: 0 16px;
  border-radius: 6px;
  background: rgb(0 93 151 / 92%);
  border: 1px solid rgb(0 174 239 / 72%);
  color: #fff;
  font-size: 12px;
  font-family: var(--font-body);
  z-index: var(--z-local-2);
  box-shadow: 0 8px 24px rgb(0 0 0 / 28%);
  cursor: pointer;
}

.scm-plant-return:hover {
  background: rgb(0 130 196 / 96%);
}

.scm-float {
  position: absolute;
  top: 14px;
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 8px;
  border: 1px solid rgb(0 150 236 / 28%);
  background: rgb(0 18 40 / 82%);
  backdrop-filter: blur(6px);
  z-index: var(--z-local-1300);
  pointer-events: auto;
}

.scm-float--mode {
  left: 14px;
}

.scm-mode-explain {
  position: absolute;
  top: 17px;
  left: 338px;
  z-index: var(--z-local-1290);
  min-height: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid rgb(0 103 158 / 42%);
  border-radius: 6px;
  background: rgb(255 255 255 / 90%);
  box-shadow: 0 4px 14px rgb(0 29 54 / 16%);
  color: #35546b;
  font-size: 11px;
  pointer-events: none;
}

.scm-mode-explain span {
  padding-right: 8px;
  border-right: 1px solid rgb(0 103 158 / 25%);
  color: #0077ae;
  font-weight: 700;
}

.scm-float--range {
  right: 14px;
  z-index: var(--z-local-6);
}

.scm-float--radarsrc {
  top: 104px;
  right: 14px;
  z-index: var(--z-local-6);
}

.scm-float--clarity {
  top: 60px;
  right: 14px;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  color: rgb(220 235 250 / 90%);
  font-size: 11px;
}

.scm-float--clarity input {
  width: 100px;
  accent-color: #00a6f4;
}

.scm-float--clarity strong {
  width: 30px;
  color: #65d9ff;
  font-size: 11px;
}

.scm-float--scope {
  top: 60px;
  left: 346px;
}

.scm-seg {
  height: 30px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: rgb(200 212 232 / 92%);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.scm-seg--compact {
  min-width: 48px;
  padding: 0 10px;
}

.scm-seg--active {
  border-color: rgb(0 166 244 / 50%);
  background: rgb(0 150 236 / 28%);
  color: #fff;
  box-shadow:
    inset 0 0 0 1px rgb(0 166 244 / 22%),
    0 6px 16px rgb(0 0 0 / 18%);
}

.scm-legend {
  position: absolute;
  right: 14px;
  bottom: 88px;
  width: 42px;
  padding: 8px 6px;
  border-radius: 8px;
  border: 1px solid rgb(0 150 236 / 28%);
  background: rgb(0 18 40 / 82%);
  backdrop-filter: blur(6px);
  z-index: var(--z-local-2);
  pointer-events: none;
}

.scm-legend__title {
  font-size: 10px;
  color: rgb(200 212 232 / 90%);
  text-align: center;
  line-height: 1.3;
  margin-bottom: 6px;
}

.scm-legend__bar {
  display: flex;
  flex-direction: column;
  gap: 1px;
  height: 180px;
}

.scm-legend__step {
  flex: 1;
  border-radius: 1px;
}

.scm-legend__labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 9px;
  color: rgb(168 184 204 / 88%);
}

.scm-timeline {
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 14px;
  z-index: var(--z-local-1250);
  display: grid;
  grid-template-columns: 180px 40px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgb(0 150 236 / 28%);
  background: rgb(0 18 40 / 88%);
  backdrop-filter: blur(6px);
  pointer-events: auto;
}

.scm-timeline__meta {
  min-width: 0;
}

.scm-timeline__source {
  font-size: 12px;
  color: rgb(255 255 255 / 92%);
}

.scm-timeline__hint {
  color: rgb(200 212 232 / 95%);
}

.scm-timeline__date {
  margin-top: 2px;
  font-size: 11px;
  color: rgb(168 184 204 / 90%);
}

.scm-timeline__play {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgb(0 150 236 / 45%);
  background: rgb(0 150 236 / 20%);
  cursor: pointer;
  position: relative;
}

.scm-timeline__play:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.scm-timeline__play::before {
  content: '';
  position: absolute;
  inset: 0;
  margin: auto;
  width: 0;
  height: 0;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-left: 11px solid rgb(255 255 255 / 92%);
  transform: translateX(2px);
}

.scm-timeline__play--pause::before {
  width: 10px;
  height: 12px;
  border: none;
  background: linear-gradient(
    90deg,
    rgb(255 255 255 / 92%) 0%,
    rgb(255 255 255 / 92%) 38%,
    transparent 38%,
    transparent 62%,
    rgb(255 255 255 / 92%) 62%,
    rgb(255 255 255 / 92%) 100%
  );
  transform: none;
}

.scm-timeline__track-wrap {
  min-width: 0;
}

.scm-timeline__track {
  position: relative;
  height: 36px;
  border-radius: 6px;
  background: rgb(0 28 58 / 72%);
  border: 1px solid rgb(0 110 190 / 22%);
}

.scm-timeline__progress {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgb(0 150 236 / 35%), rgb(0 150 236 / 12%));
  border-radius: 6px 0 0 6px;
  pointer-events: none;
}

.scm-timeline__tick {
  position: absolute;
  top: 100%;
  transform: translateX(-50%);
  margin-top: 4px;
  padding: 0;
  border: none;
  background: none;
  color: rgb(168 184 204 / 90%);
  font-size: 10px;
  white-space: nowrap;
  cursor: pointer;
}

.scm-timeline__tick--now {
  color: rgb(126 200 255 / 95%);
  font-weight: 500;
}

.scm-timeline__cursor {
  position: absolute;
  top: 4px;
  transform: translateX(-50%);
  padding: 2px 8px;
  border-radius: 999px;
  background: rgb(0 150 236 / 92%);
  color: #fff;
  font-size: 10px;
  white-space: nowrap;
  pointer-events: none;
}

.scm-timeline__cursor::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -5px;
  transform: translateX(-50%);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid rgb(0 150 236 / 92%);
}

.scm-fade-enter-active,
.scm-fade-leave-active {
  transition: opacity 0.22s ease;
}

.scm-fade-enter-active .scm-dialog,
.scm-fade-leave-active .scm-dialog {
  transition:
    transform 0.22s ease,
    opacity 0.22s ease;
}

.scm-fade-enter-from,
.scm-fade-leave-to {
  opacity: 0;
}

.scm-fade-enter-from .scm-dialog,
.scm-fade-leave-to .scm-dialog {
  transform: scale(0.98);
  opacity: 0;
}
</style>
