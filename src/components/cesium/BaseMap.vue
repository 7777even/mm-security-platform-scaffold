<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { detectWebGL } from '@/utils/webgl';
import { buildViewerOptions, toPointEntity, toZoneEntity, type PointKind } from '@/services/cesium';
import type { MapPoint, RiskZone } from '@/services/map';
import { recordPerfAsync } from '@/utils/perf-budget';

/**
 * Cesium 二三维一体化地图容器（详细设计 4.2.2.2「地图集成服务 map」前端消费侧）。
 *
 * - 懒加载引擎：默认动态 `import('cesium')`，不污染首屏；viewerFactory 可注入测试替身。
 * - 单一 viewer 承载 2D/3D 一体化：sceneMode 切换由父级控制（scene.mode 或 morph）。
 * - 数据渲染：报警点（等级色）、设备点（状态色）、风险区（评分色面），点击报警点浮窗。
 * - 降级：WebGL 不可用 / 引擎加载失败 → emit('error')，由父级回退提示，不白屏。
 */

const emit = defineEmits<{
  error: [];
  ready: [];
  'mode-change': [mode: '2d' | '3d'];
}>();

const props = withDefaults(
  defineProps<{
    tileUrl: string;
    alarms: MapPoint[];
    devices: MapPoint[];
    zones: RiskZone[];
    sceneMode?: '2d' | '3d';
    viewerFactory?: (container: HTMLElement) => Promise<unknown>;
  }>(),
  { sceneMode: '3d', viewerFactory: undefined },
);

/** Cesium viewer 最小接口（避免 any；完整类型由真实 Cesium 在运行时提供） */
interface CesiumViewerLike {
  scene?: {
    mode?: number;
    requestRender?: () => void;
    /** Cesium.Scene.renderError（Event）：单帧 render 失败兜底自愈 */
    renderError?: { addEventListener?: (cb: (scene: unknown, err: unknown) => void) => void };
  };
  camera?: { setView?: (opts: unknown) => void; flyTo?: (opts: unknown) => void };
  entities?: { removeAll: () => void; add: (e: unknown) => unknown };
  imageryLayers?: {
    addImageryProvider?: (provider: unknown) => unknown;
    add?: (layer: unknown) => unknown;
    removeAll?: () => void;
  };
  resize?: () => void;
  /** Viewer.render() 手动渲染（用于 useDefaultRenderLoop=false 模式） */
  render?: () => void;
  destroy?: () => void;
  /** Cesium 1.119 新增：动态控制是否启用默认 RAF render loop */
  useDefaultRenderLoop?: boolean;
}

/** Cesium 命名空间最小接口 */
interface CesiumLike {
  Viewer?: new (container: HTMLElement, options: Record<string, unknown>) => CesiumViewerLike;
  UrlTemplateImageryProvider?: new (opts: { url: string }) => unknown;
  ImageryLayer?: new (provider: unknown) => unknown;
  EllipsoidTerrainProvider?: new () => unknown;
  Ion?: { defaultAccessToken?: string; defaultServer?: string | { getUrlBase?: () => string } };
  BingMaps?: { defaultKey?: string };
  Cartesian3?: {
    fromDegrees: (lng: number, lat: number, h?: number) => unknown;
    fromDegreesArray: (arr: number[]) => unknown[];
  };
  Math?: { toRadians: (deg: number) => number };
  SceneMode?: { SCENE2D: number; SCENE3D: number };
}

const containerRef = ref<HTMLDivElement | null>(null);
let viewer: CesiumViewerLike | null = null;
let cesium: CesiumLike | null = null;

async function loadCesium(): Promise<CesiumLike> {
  if (cesium) return cesium;
  const mod = await import('cesium');
  cesium = (mod.default ?? mod) as CesiumLike;
  return cesium;
}

/**
 * 等待容器挂载完成。Cesium 引擎是懒加载（4MB chunk），`await import('cesium')` 可能耗时数秒，
 * 期间组件可能被卸载/重建（路由切换、HMR、dev server 重启），Vue 会把 template ref 置空；
 * 此时若直接 `new Cesium.Viewer(null)` 会抛 `DeveloperError: container is required` 并触发降级。
 * 这里短轮询等待容器重新出现，避免把"瞬时生命周期竞态"误判为"初始化失败"。
 */
async function waitForContainer(timeoutMs = 3000): Promise<HTMLElement | null> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (containerRef.value) return containerRef.value;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return containerRef.value;
}

async function createViewer(): Promise<void> {
  if (props.viewerFactory) {
    // 测试/外部注入：跳过引擎动态加载，直接用替身
    const container = await waitForContainer();
    if (!container) return;
    viewer = (await props.viewerFactory(container)) as CesiumViewerLike;
  } else {
    const C = await loadCesium();
    // await 动态 import 之后容器可能已随组件重建/卸载而失效，重新等待其挂载
    const container = await waitForContainer();
    if (!container) return;
    // 关键：阻断全部异步资源加载路径（Ion + Bing Maps），避免 401 触发 NaN 渲染错误
    if (C.Ion) C.Ion.defaultAccessToken = '';
    if (C.BingMaps) C.BingMaps.defaultKey = '';
    const opts = buildViewerOptions({ tileUrl: props.tileUrl, sceneMode: props.sceneMode });
    viewer = new C.Viewer!(container, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      // 彻底禁用默认 baseLayer（ImageryLayer.fromWorldImagery()，会拉 Bing Maps 异步 metadata）
      // 注意：必须直接传 false，不能 cast 为 undefined（CesiumViewer.js:685 判定 `defined(baseLayer) && baseLayer !== false`，
      // undefined 会走默认 Bing Maps 路径；false 才真正跳过）
      baseLayer: false,
      // 显式 EllipsoidTerrainProvider，阻止默认 Ion World Terrain 异步请求
      terrainProvider: new C.EllipsoidTerrainProvider!(),
      // skyBox/skyAtmosphere 关闭：默认会拉 Ion assetId=4 (Bing Sky) 异步资源，
      // 失败时归内化计算 NaN；关闭后无视觉损失（地图为主）
      skyBox: false,
      skyAtmosphere: false,
      // 关键：禁用 Viewer 内部的 HTML 错误面板（默认显示 "An error occurred while rendering. Rendering has stopped."）
      showRenderLoopErrors: false,
      // 注意：不设 useDefaultRenderLoop:false！Cesium 默认 RAF 循环负责自动瓦片加载与 resize，
      // 关闭后 imagery loading 不主动调度，画面黑屏。前几轮已确认该 trade-off 不可取。
    });
    // 构造后手动添加底图（瓦片 URL 可配置；同源离线/公网预览均支持）
    viewer.imageryLayers?.addImageryProvider?.(
      new C.UrlTemplateImageryProvider!({ url: opts.tileUrl }),
    );
    // 显式初始相机（避免默认 home view 在归一化计算时除零产生 NaN）
    viewer.camera?.setView?.({
      destination: C.Cartesian3!.fromDegrees(
        opts.defaultView.lng,
        opts.defaultView.lat,
        opts.defaultView.height,
      ),
      orientation: {
        heading: 0,
        pitch: -C.Math!.toRadians(45),
        roll: 0,
      },
    });
    // 兜底：保留 renderError 监听器长期打日志，便于发现潜在 NaN/渲染错误源
    viewer.scene?.renderError?.addEventListener?.((_scene: unknown, error: unknown) => {
      const err = error as { message?: string; stack?: string };
      console.error('[cesium render error]', err?.message, err?.stack);
    });
    // dev-only：将 viewer 挂到 window 便于 Playwright 诊断与 e2e 测试探针，
    // 生产构建会被 dead-code elimination 移除（import.meta.env.DEV 静态条件）
    if (import.meta.env.DEV) {
      (window as unknown as { __cesiumViewer?: unknown }).__cesiumViewer = viewer;
    }
    // 关键修复：canvas 默认尺寸 300x150，必须同步到容器尺寸（容器在 dashboard
    // 布局里是 1248x712）。否则 framebuffer 远小于容器（CSS 拉伸后画面看不清），
    // 且瓦片加载决策依赖 camera frustum 与容器尺寸，framebuffer 过小会导致缩放
    // 层级判断失真、Carto 瓦片始终未请求、画面呈纯黑色。
    viewer.resize?.();
    // ResizeObserver 监听容器尺寸变化（dashboard 响应式布局/全屏切换会改尺寸）
    if (containerRef.value && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => viewer?.resize?.());
      ro.observe(containerRef.value);
    }
  }
  applySceneMode(props.sceneMode);
  emit('ready');
}

function applySceneMode(mode: '2d' | '3d'): void {
  if (!viewer?.scene) return;
  const C = cesium;
  if (!C) return;
  viewer.scene.mode = mode === '2d' ? C.SceneMode!.SCENE2D : C.SceneMode!.SCENE3D;
}

function renderData(): void {
  if (!viewer?.entities) return;
  const C = cesium;
  if (!C?.Cartesian3) return;
  viewer.entities.removeAll();
  for (const z of props.zones) {
    const e = toZoneEntity(z);
    // 关键修复：polygon.hierarchy 必须用 Cartesian3[]（经度/纬度展平后 fromDegreesArray），
    // 直接传 [lng, lat] 数组会被 Cesium 当成 Cartesian3(x=lng,y=lat,z=undefined)，
    // z=NaN → Stereographic 归一化抛 "normalized result is not a number" → 每帧 render 崩溃 → RAF 关闭 → 画面全黑
    const hierarchy = C.Cartesian3.fromDegreesArray(e.coordinates.flat());
    viewer.entities.add({
      name: e.name,
      polygon: {
        hierarchy,
        material: e.color,
        outline: true,
        outlineColor: 'rgba(0,212,255,0.5)',
      },
    });
  }
  const kind: PointKind = 'alarm';
  for (const p of props.alarms) {
    const e = toPointEntity(p, kind);
    viewer.entities.add({
      id: e.id,
      name: e.name,
      position: C.Cartesian3.fromDegrees(e.lng, e.lat),
      point: { pixelSize: 9, color: e.color, outlineColor: '#ffffff', outlineWidth: 1.5 },
      properties: { kind: 'alarm', level: e.level },
    });
  }
  for (const p of props.devices) {
    const e = toPointEntity(p, 'device');
    viewer.entities.add({
      id: e.id,
      name: e.name,
      position: C.Cartesian3.fromDegrees(e.lng, e.lat),
      point: { pixelSize: 4, color: e.color },
      properties: { kind: 'device' },
    });
  }
}

async function init(): Promise<void> {
  if (!detectWebGL()) {
    emit('error');
    return;
  }
  try {
    await createViewer();
    await recordPerfAsync('baseMapMs', () => renderData());
  } catch (err) {
    console.error('[cesium] 地图初始化失败，降级', err);
    emit('error');
  }
}

watch(
  () => props.sceneMode,
  (mode) => {
    if (viewer?.scene && mode) applySceneMode(mode);
    emit('mode-change', mode);
  },
);

watch(
  () => [props.alarms, props.devices, props.zones],
  () => {
    if (viewer?.entities) renderData();
  },
  { deep: false },
);

onMounted(init);

onUnmounted(() => {
  if (viewer?.destroy) viewer.destroy();
  viewer = null;
});
</script>

<template>
  <div ref="containerRef" class="base-map" data-test="base-map" />
</template>

<style scoped>
.base-map {
  position: absolute;
  inset: 0;
  background: #050a15;

  /* 强制 Cesium 内部 viewerContainer 与 canvas 充满容器。
     Cesium 创建的 .cesium-viewer / .cesium-viewer-cesiumWidgetContainer 默认 inline-size=auto，
     会用子元素（默认 canvas 300x150）的尺寸收缩，导致 viewer.resize() 读取到 canvas.clientWidth/Height
     始终是 300/150，与 BaseMap 容器（1248x712）不匹配，画面被拉伸且瓦片加载决策失真。 */
  width: 100%;
  height: 100%;
}

.base-map :deep(.cesium-viewer),
.base-map :deep(.cesium-viewer-cesiumWidgetContainer),
.base-map :deep(.cesium-widget),
.base-map :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

/* Cesium 自带控件按深色主题弱化 */
.base-map :deep(.cesium-viewer-bottom) {
  display: none;
}
</style>
