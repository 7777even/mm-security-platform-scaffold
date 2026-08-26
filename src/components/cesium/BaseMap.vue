<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import * as Cesium from 'cesium';
import { detectWebGL } from '@/utils/webgl';
import {
  createCesiumViewer,
  loadBaseMap,
  loadAlarmMarkers,
  loadDeviceMarkers,
  loadRiskZones,
  resetView,
  setSceneMode2D,
  setSceneMode3D,
  setLayerVisible,
  enablePick,
  setBaseMapMode,
  type BaseMapMode,
  type LayerKind,
  type PickResult,
} from '@/services/cesium';
import type { MapPoint, RiskZone } from '@/services/map';
import { recordPerfAsync } from '@/utils/perf-budget';
import {
  ClusterBillboardLayer,
  type ClusterPoint,
  type ClusterPickInfo,
} from '@/services/cesium-cluster';
import MapClusterPopup from '@/components/cesium/MapClusterPopup.vue';

/**
 * Cesium 二三维一体化地图容器（详细设计 4.2.2.2「地图集成服务 map」前端消费侧）。
 *
 * - 懒加载引擎：默认动态 `import('cesium')`，viewerFactory 可注入测试替身。
 * - 单一 viewer 承载 2D/3D 一体化；点位为「图形 + 文字」复合标注（service 层 point+label）。
 * - 完整地图工具栏：2D/3D、放大、缩小、复位、底图/点位/区域/标注显隐。
 * - 点击拾取：点击报警/设备点位浮窗展示属性，点击空白关闭浮窗。
 * - 降级：WebGL 不可用 / 引擎加载失败 → emit('error')，由父级回退提示，不白屏。
 */

const emit = defineEmits<{
  error: [];
  ready: [];
  'mode-change': [mode: '2d' | '3d'];
  pick: [result: PickResult | null];
}>();

const props = withDefaults(
  defineProps<{
    tileUrl: string;
    alarms: MapPoint[];
    devices: MapPoint[];
    zones: RiskZone[];
    sceneMode?: '2d' | '3d';
    viewerFactory?: (container: HTMLElement) => Promise<Cesium.Viewer>;
    /** 聚合打点图层数据（复用 one-brain-web 聚合打点能力）；为空则不挂载该图层。 */
    clusterPoints?: ClusterPoint[];
  }>(),
  { sceneMode: '3d', viewerFactory: undefined, clusterPoints: undefined },
);

const containerRef = ref<HTMLDivElement | null>(null);
const mode = ref<'2d' | '3d'>(props.sceneMode);
const picked = ref<PickResult | null>(null);
const layers = reactive({ base: true, markers: true, zones: true, labels: true });
const baseMapMode = ref<BaseMapMode>('night');

function toggleBaseMapMode(): void {
  if (!viewer) return;
  baseMapMode.value = baseMapMode.value === 'night' ? 'satellite' : 'night';
  setBaseMapMode(viewer, baseMapMode.value);
}
let viewer: Cesium.Viewer | null = null;
let cancelPick: (() => void) | null = null;
// 卸载时需要清理的异步句柄（setTimeout / ResizeObserver），避免在已销毁 viewer 上回调
const resizeTimers: ReturnType<typeof setTimeout>[] = [];
let resizeObserver: ResizeObserver | null = null;

async function waitForContainer(timeoutMs = 3000): Promise<HTMLElement | null> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (containerRef.value) return containerRef.value;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return containerRef.value;
}

/** 安全 resize：viewer 已销毁或处于销毁中时静默返回，避免 DeveloperError。 */
function safeResize(v: Cesium.Viewer | null): void {
  if (!v) return;
  const maybeDestroyed = v as unknown as { isDestroyed?: () => boolean };
  if (maybeDestroyed.isDestroyed?.()) return;
  try {
    v.resize();
  } catch (err) {
    console.warn('[BaseMap] resize suppressed', err);
  }
}

async function createViewer(): Promise<Cesium.Viewer> {
  const container = await waitForContainer();
  if (!container) throw new Error('container unavailable');
  if (props.viewerFactory) {
    // 测试/外部注入：跳过引擎动态加载，直接用替身
    return props.viewerFactory(container);
  }
  // 阻断全部异步资源路径（Ion），避免 401 触发 NaN 渲染错误
  // Cesium 1.122+ 已移除 BingMaps namespace，Bing 资源随 Ion 一起被 createCesiumViewer 阻断
  if (Cesium.Ion) Cesium.Ion.defaultAccessToken = '';
  const v = createCesiumViewer(container);
  // 同步容器尺寸，避免 canvas 默认 300x150 导致画面拉伸/瓦片加载失真
  safeResize(v);
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => safeResize(v));
    resizeObserver.observe(container);
  }
  resizeTimers.push(setTimeout(() => safeResize(v), 200));
  resizeTimers.push(setTimeout(() => safeResize(v), 500));
  return v;
}

async function renderAll(): Promise<void> {
  if (!viewer) return;
  await loadBaseMap(viewer);
  await loadRiskZones(viewer);
  // 点位统一由聚合打点图层渲染（已接入 clusterPoints 时）；否则回退经典复合标注
  if (!props.clusterPoints || props.clusterPoints.length === 0) {
    await loadAlarmMarkers(viewer);
    await loadDeviceMarkers(viewer);
  }
}

async function init(): Promise<void> {
  if (!detectWebGL()) {
    emit('error');
    return;
  }
  try {
    viewer = await createViewer();
    // 测试替身不具备完整 Cesium API，跳过数据加载与拾取注册
    const isFake = !!props.viewerFactory;
    if (!isFake) {
      await recordPerfAsync('baseMapMs', () => renderAll());
      resetView(viewer);
      applySceneMode(mode.value);
      cancelPick = enablePick(viewer, (result) => {
        picked.value = result;
        emit('pick', result);
      });
      // 首屏渲染显式 requestRender，确保 useDefaultRenderLoop=false 或 destroy竞态下仍出图
      try {
        viewer?.scene.requestRender();
      } catch {
        /* viewer destroyed during init, ignore */
      }
      // 挂载聚合打点图层（若有数据）
      setupClusterLayer();
    }
    emit('ready');
  } catch (err) {
    console.error('[cesium] 地图初始化失败，降级', err);
    emit('error');
  }
}

function applySceneMode(target: '2d' | '3d'): void {
  if (!viewer) return;
  try {
    if ((viewer as unknown as { isDestroyed?: () => boolean }).isDestroyed?.()) return;
    if (target === '2d') setSceneMode2D(viewer);
    else setSceneMode3D(viewer);
  } catch (err) {
    console.warn('[BaseMap] applySceneMode suppressed', err);
  }
}

function toggleMode(): void {
  mode.value = mode.value === '2d' ? '3d' : '2d';
  applySceneMode(mode.value);
  emit('mode-change', mode.value);
}

function zoomIn(): void {
  if (!viewer) return;
  try {
    viewer.camera.zoomIn(2000);
  } catch (err) {
    console.warn('[BaseMap] zoomIn suppressed', err);
  }
}

function zoomOut(): void {
  if (!viewer) return;
  try {
    viewer.camera.zoomOut(2000);
  } catch (err) {
    console.warn('[BaseMap] zoomOut suppressed', err);
  }
}

function onReset(): void {
  if (!viewer) return;
  try {
    resetView(viewer);
  } catch (err) {
    console.warn('[BaseMap] reset suppressed', err);
  }
}

function toggleLayer(kind: LayerKind): void {
  if (!viewer) return;
  layers[kind] = !layers[kind];
  setLayerVisible(viewer, kind, layers[kind]);
}

function levelText(p: PickResult | null): string {
  if (!p) return '';
  if (p.kind === 'alarm') return p.level !== undefined ? `等级 ${p.level}` : '报警';
  return p.status ? `状态 ${p.status}` : '设备';
}

// ---- 聚合打点图层（复用 one-brain-web MapClusterBillboard 能力） ----
const clusterLayer = ref<ClusterBillboardLayer | null>(null);
const clusterPicked = ref<ClusterPickInfo | null>(null);
const clusterVisible = ref(true);
const clusterPopupPos = reactive({ left: 0, top: 0 });
let clusterPostRender: (() => void) | null = null;

function setupClusterLayer(): void {
  if (!viewer || !props.clusterPoints || props.clusterPoints.length === 0) return;
  if (clusterLayer.value) return;
  clusterLayer.value = new ClusterBillboardLayer(viewer, {
    typeName: 'mapCluster',
    onPick: (info) => {
      clusterPicked.value = info.kind === 'none' ? null : info;
    },
  });
  clusterLayer.value.setData(props.clusterPoints);
  clusterLayer.value.setVisible(clusterVisible.value);
  clusterPostRender = () => updateClusterPopupPos();
  viewer.scene.postRender.addEventListener(clusterPostRender);
}

function updateClusterPopupPos(): void {
  if (!viewer || !clusterPicked.value || !clusterPicked.value.position) return;
  const wp = new Cesium.Cartesian2();
  Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, clusterPicked.value.position, wp);
  const canvasH = viewer.scene.canvas.clientHeight || viewer.scene.canvas.height;
  clusterPopupPos.left = wp.x;
  clusterPopupPos.top = canvasH - wp.y;
}

function clearCluster(): void {
  clusterPicked.value = null;
  clusterLayer.value?.clearSelection();
}

const popupStyle = computed(() => ({
  left: `${clusterPopupPos.left}px`,
  top: `${clusterPopupPos.top}px`,
}));

watch(
  () => props.sceneMode,
  (m) => {
    mode.value = m;
    // 测试替身（viewerFactory 注入）不具备真实 Cesium API，跳过 applySceneMode 避免抛错
    if (!props.viewerFactory) applySceneMode(m);
    emit('mode-change', m);
  },
);

// 聚合打点数据变化：首次挂载或增量刷新
watch(
  () => props.clusterPoints,
  (pts) => {
    if (!clusterLayer.value) {
      setupClusterLayer();
      return;
    }
    if (pts) clusterLayer.value.setData(pts);
  },
);

watch(clusterVisible, (v) => clusterLayer.value?.setVisible(v));

onMounted(init);

onUnmounted(() => {
  // 1) 清掉 resize 异步句柄（setTimeout / ResizeObserver），避免在销毁中回调
  for (const t of resizeTimers) clearTimeout(t);
  resizeTimers.length = 0;
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  // 2) 取消拾取 handler
  if (cancelPick) {
    cancelPick();
    cancelPick = null;
  }
  // 3) dev 模式下挂的全局 viewer 句柄需解除，否则 Cesium 内部 RAF tick 仍会访问
  if (typeof window !== 'undefined') {
    const w = window as unknown as { __cesiumViewer?: { isDestroyed?: () => boolean } | null };
    if (w.__cesiumViewer === viewer) w.__cesiumViewer = null;
  }
  // 4) 销毁 viewer
  // 先销毁聚合打点图层（移除其事件监听与数据源），避免 viewer 销毁后再访问
  if (clusterLayer.value) {
    clusterLayer.value.destroy();
    clusterLayer.value = null;
  }
  if (clusterPostRender && viewer) {
    try {
      viewer.scene.postRender.removeEventListener(clusterPostRender);
    } catch {
      /* noop */
    }
    clusterPostRender = null;
  }
  if (viewer) {
    try {
      if (!(viewer as unknown as { isDestroyed?: () => boolean }).isDestroyed?.()) {
        viewer.destroy();
      }
    } catch (err) {
      console.warn('[BaseMap] viewer.destroy suppressed', err);
    }
  }
  viewer = null;
});
</script>

<template>
  <div class="base-map" data-test="base-map">
    <div ref="containerRef" class="base-map__canvas" />

    <!-- 完整地图工具栏（右侧竖排，对齐右侧值班值守面板 419px 宽） -->
    <div class="map-toolbar" data-test="map-toolbar">
      <button
        class="map-toolbar__btn"
        :title="mode === '2d' ? '切换到 3D' : '切换到 2D'"
        @click="toggleMode"
      >
        {{ mode === '2d' ? '2D' : '3D' }}
      </button>
      <button class="map-toolbar__btn" title="放大" @click="zoomIn">+</button>
      <button class="map-toolbar__btn" title="缩小" @click="zoomOut">−</button>
      <button class="map-toolbar__btn" title="复位视角" @click="onReset">⟳</button>
      <button
        class="map-toolbar__btn"
        :title="baseMapMode === 'night' ? '切换到影像底图' : '切换到夜景底图'"
        @click="toggleBaseMapMode"
      >
        {{ baseMapMode === 'night' ? '夜景' : '影像' }}
      </button>
      <span class="map-toolbar__sep" />
      <label class="map-toolbar__toggle" title="底图显隐">
        <input type="checkbox" :checked="layers.base" @change="toggleLayer('base')" />
        <span>底图</span>
      </label>
      <label class="map-toolbar__toggle" title="点位显隐">
        <input type="checkbox" :checked="layers.markers" @change="toggleLayer('markers')" />
        <span>点位</span>
      </label>
      <label class="map-toolbar__toggle" title="区域显隐">
        <input type="checkbox" :checked="layers.zones" @change="toggleLayer('zones')" />
        <span>区域</span>
      </label>
      <label class="map-toolbar__toggle" title="标注显隐">
        <input type="checkbox" :checked="layers.labels" @change="toggleLayer('labels')" />
        <span>标注</span>
      </label>
      <label
        v-if="props.clusterPoints && props.clusterPoints.length"
        class="map-toolbar__toggle"
        title="聚合打点显隐"
      >
        <input
          type="checkbox"
          :checked="clusterVisible"
          @change="clusterVisible = !clusterVisible"
        />
        <span>聚合</span>
      </label>
    </div>

    <!-- 点击拾取浮窗 -->
    <div v-if="picked" class="map-popup" data-test="map-popup">
      <button class="map-popup__close" title="关闭" @click="picked = null">×</button>
      <div class="map-popup__title">{{ picked.name }}</div>
      <div class="map-popup__row">类型：{{ picked.kind === 'alarm' ? '报警点' : '设备点' }}</div>
      <div class="map-popup__row">{{ levelText(picked) }}</div>
      <div class="map-popup__row">ID：{{ picked.id }}</div>
    </div>

    <!-- 聚合打点拾取浮窗（随相机实时跟随） -->
    <MapClusterPopup
      v-if="clusterPicked"
      :info="clusterPicked"
      :style="popupStyle"
      @close="clearCluster"
    />
  </div>
</template>

<style scoped>
.base-map {
  position: absolute;
  inset: 0;
  background: var(--color-bg);
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.base-map__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.base-map :deep(.cesium-viewer),
.base-map :deep(.cesium-viewer-cesiumWidgetContainer),
.base-map :deep(.cesium-widget) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

.base-map :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
  display: block;
  background: var(--color-bg) !important;
  background-color: var(--color-bg) !important;
}

.base-map :deep(.cesium-viewer-bottom) {
  display: none;
}

.map-toolbar {
  position: absolute;
  top: 12px;

  /* 与 dashboard 右侧面板对齐：面板宽 = 布局令牌 + 两侧 space-md 间距 */
  right: calc(var(--layout-aside-w) + var(--space-md, 12px) * 2);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  padding: 8px 6px;
  background: color-mix(in srgb, var(--color-panel) 82%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-text-muted) 25%, transparent);
  border-radius: 8px;
  backdrop-filter: blur(4px);
  font-size: 12px;
  color: var(--color-text);
  min-width: 60px;
}

.map-toolbar__btn {
  min-width: 44px;
  height: 32px;
  padding: 0;
  border: 1px solid color-mix(in srgb, var(--color-text-muted) 30%, transparent);
  border-radius: 6px;
  background: color-mix(in srgb, var(--color-panel-soft) 90%, transparent);
  color: var(--color-text);
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
}

.map-toolbar__btn:hover {
  background: color-mix(in srgb, var(--color-panel-soft) 95%, transparent);
  border-color: color-mix(in srgb, var(--color-text-muted) 60%, transparent);
}

.map-toolbar__sep {
  height: 1px;
  background: color-mix(in srgb, var(--color-text-muted) 30%, transparent);
  margin: 2px 4px;
}

.map-toolbar__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 0 4px;
  cursor: pointer;
  user-select: none;
  height: 26px;
}

.map-toolbar__toggle input {
  cursor: pointer;
  margin: 0;
}

.map-popup {
  position: absolute;
  top: 56px;
  left: 12px;
  z-index: 11;
  min-width: 180px;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--color-panel) 92%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 55%, transparent);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 40%);
}

.map-popup__close {
  position: absolute;
  top: 4px;
  right: 6px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}

.map-popup__title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  padding-right: 14px;
  color: var(--color-text-strong);
}

.map-popup__row {
  line-height: 1.7;
  color: var(--color-text-muted);
}
</style>
