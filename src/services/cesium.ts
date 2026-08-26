// C1 地图引擎：Cesium.js 二三维一体化底座。
// 提供 viewer 初始化、瓦片底图、点位（复合标注）、风险区域、点击拾取、图层显隐控制。
// 数据来源沿用 services/map.ts（fetchAlarmPoints / fetchDevicePoints / fetchRiskZones）。

import * as Cesium from 'cesium';
import type { MapPoint, RiskZone } from '@/services/map';
import { fetchAlarmPoints, fetchDevicePoints, fetchRiskZones } from '@/services/map';
import { wktToCartesians, wktCenter } from '@/services/geo';
import {
  TIANDITU,
  NIGHT_GRADING,
  TERRAIN_HILLSHADE,
  TERRAIN_URL,
  TERRAIN_TIMEOUT_MS,
  BUILDING_TILESET_URL,
  BUILDING_TILESET_TIMEOUT_MS,
} from '@/constants/map';
import { recordPerfAsync } from '@/utils/perf-budget';
import { logger } from '@/utils/logger';
import { readCssVar } from '@/utils/theme';

// 厂区初始中心（茂名市中心坐标）+ 初始相机高度
export const FACTORY_CENTER: [number, number] = [110.925, 21.663];
export const FACTORY_HEIGHT = 8000;

// 报警等级配色：语义色 token（规范 §13.1：1 级最高危=红，4 级最低=蓝）
const LEVEL_TOKEN: Record<number, string> = {
  1: '--color-alarm-1', // alarm-1 一级 最高危 红
  2: '--color-alarm-2', // alarm-2 二级 橙
  3: '--color-alarm-3', // alarm-3 三级 黄
  4: '--color-alarm-4', // alarm-4 四级 最低 蓝
};
// 设备状态 → 颜色 token（mock 返回 online/offline/normal/active 等；规范 §13.3）
const STATUS_TOKEN: Record<string, string> = {
  online: '--color-success', // 在线
  normal: '--color-success', // 正常
  active: '--color-danger', // 当前告警中
  offline: '--color-text-muted', // 离线静默
  fault: '--color-danger', // 故障
};
// 报警等级 / 设备状态 fallback：原语义色，保证无 CSS 环境下与浏览器 token 取值一致
const LEVEL_FALLBACK: Record<number, string> = {
  1: '#f46767',
  2: '#f6882e',
  3: '#f6ba2e',
  4: '#2e7cf6',
};
const STATUS_FALLBACK: Record<string, string> = {
  online: '#2ee6a8',
  normal: '#2ee6a8',
  active: '#ff5a5a',
  offline: '#8fa6c8',
  fault: '#ff5a5a',
};

// 默认色：解析自设计 token，回退值与原语义色一致（保证 SSR/测试环境色值稳定）
const DEFAULT_MARKER_COLOR = Cesium.Color.fromCssColorString(
  readCssVar('--color-text-muted', '#8fa6c8'),
);

export interface PickResult {
  id: string;
  name: string;
  kind: 'alarm' | 'device';
  level?: number;
  status?: string;
  raw: Record<string, unknown>;
  /** 拾取实体的世界坐标（用于详情弹窗锚定在屏幕点位上方并随相机跟随）。 */
  position?: Cesium.Cartesian3;
}

/** 风险分区拾取结果（点击围栏面触发）。 */
export interface ZonePick {
  name: string;
  center: [number, number];
  score: number;
  raw: Record<string, unknown>;
  /** 分区中心世界坐标（用于详情弹窗锚定在屏幕点位上方并随相机跟随）。 */
  position?: Cesium.Cartesian3;
}

/** 解析 zone 实体 id（'zone:名称'），非 zone 返回 null。纯函数，便于单测守卫。 */
export function parseZoneId(id: unknown): string | null {
  if (typeof id !== 'string' || !id.startsWith('zone:')) return null;
  return id.slice('zone:'.length);
}

/**
 * token 名 / hex → Cesium.Color。token 经 readCssVar 运行时解析（跟随主题切换），
 * 传入 hex 或解析失败时回落 fallback，保证不抛错、色值稳定。
 */
function toColor(tokenOrHex: string | undefined, fallback: string): Cesium.Color {
  if (!tokenOrHex) return Cesium.Color.fromCssColorString(fallback);
  try {
    return Cesium.Color.fromCssColorString(readCssVar(tokenOrHex, fallback));
  } catch {
    return Cesium.Color.fromCssColorString(fallback);
  }
}

function levelColor(level?: number): Cesium.Color {
  if (level === undefined) return DEFAULT_MARKER_COLOR;
  const idx = Math.min(4, Math.max(1, level));
  // fallback 为原语义色，保证 SSR/测试环境（无 CSS）色值稳定、与浏览器 token 取值一致
  const fallback = LEVEL_FALLBACK[idx];
  const token = LEVEL_TOKEN[idx];
  return toColor(token, fallback);
}

function statusColor(status?: string): Cesium.Color {
  if (!status) return DEFAULT_MARKER_COLOR;
  const key = status.toLowerCase();
  // fallback 为原语义色，理由同上
  const fallback = STATUS_FALLBACK[key] ?? '#8fa6c8';
  const token = STATUS_TOKEN[key];
  return toColor(token, fallback);
}

/** 区域填充色（含透明度），按评分分级（规范 §13.4）：≥4 红、≥3 橙黄、≥2 蓝、其余静默灰。纯函数，便于 TDD。 */
export function zoneFillColor(score: number): Cesium.Color {
  const token =
    score >= 4
      ? '--color-danger'
      : score >= 3
        ? '--color-warning'
        : score >= 2
          ? '--color-accent-2'
          : '--color-text-muted';
  const alpha = score >= 4 ? 0.22 : score >= 3 ? 0.2 : score >= 2 ? 0.18 : 0.14;
  // fallback 为原语义色（红/橙黄/蓝/灰），理由同上
  const fallback =
    score >= 4 ? '#ff5a5a' : score >= 3 ? '#ffb020' : score >= 2 ? '#2e7cf6' : '#8fa6c8';
  return toColor(token, fallback).withAlpha(alpha);
}

/** 点位着色纯函数：报警按 level、设备按 status。便于 TDD 验证等级/状态色映射。 */
export function markerColor(kind: 'alarm' | 'device', p: MapPoint): Cesium.Color {
  return kind === 'alarm' ? levelColor(p.level) : statusColor(p.status);
}

// 离线/无瓦片时的地图底色：取系统面板基色（深蓝），使地图基色与两侧面板同色系，消除「地图突兀」感。
// 导出为纯函数便于单测（守卫 DARK_BG/BASE_FILL 重命名回归）。
export function getBaseFillColor(): Cesium.Color {
  return Cesium.Color.fromCssColorString(readCssVar('--color-panel', '#13233c'));
}

/**
 * 创建单一 Cesium viewer，移除默认干扰 UI，仅保留画布。
 * 同时阻断全部异步资源路径（Ion / Bing / World Terrain / Sky），统一深色底座，杜绝白屏/白雾。
 */
export function createCesiumViewer(container: HTMLElement): Cesium.Viewer {
  const viewer = new Cesium.Viewer(container, {
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    selectionIndicator: false,
    infoBox: false,
    shouldAnimate: false,
    // 显式置空底图，避免 Cesium 默认去公网拉取 ion 底图（零下行红线）
    baseLayer: false as unknown as Cesium.ImageryLayer,
    // 显式 EllipsoidTerrainProvider，阻止默认 Ion World Terrain 异步请求
    terrainProvider: new Cesium.EllipsoidTerrainProvider(),
    // 关闭会拉 Ion 异步资源的天空盒/大气
    skyBox: false as unknown as Cesium.SkyBox,
    skyAtmosphere: false,
    // 关闭内建 HTML 错误面板，避免遮挡
    showRenderLoopErrors: false,
    // canvas 不透明；不保留 framebuffer（preserveDrawingBuffer 会显著拖慢弱 GPU 帧率，
    // 此处仅用于离线纯色底图，无需保留缓冲；白屏由 requestRenderMode 下的显式 requestRender 兜底）
    contextOptions: { webgl: { alpha: false } },
    requestRenderMode: true,
  });

  // 深色底座：background + globe.baseColor 取系统面板基色（深蓝），与两侧面板同色系，消除突兀感
  const bg = getBaseFillColor();
  viewer.scene.backgroundColor = bg;
  // 渲染分辨率缩放：弱 GPU（石化窗/海光 C86）下将内部帧缓冲降采样到 0.7，
  // 像素量下降 ~51%，直接削减每帧片元着色开销，平移更顺滑；可按硬件能力经
  // VITE_CESIUM_RESOLUTION_SCALE 调整（1.0 为原生分辨率；仍偏卡可降到 0.6）。
  viewer.resolutionScale = Number(import.meta.env.VITE_CESIUM_RESOLUTION_SCALE) || 0.6;
  // 关闭多重采样抗锯齿（默认 msaaSamples=4 在 WebGL2 下每帧多 4 倍片元着色），弱 GPU 下是平移卡顿主因之一；
  // 配合下方关闭 FXAA，整体不叠加抗锯齿开销，换取每帧绘制成本大幅下降。
  viewer.scene.msaaSamples = 0;
  if (viewer.scene.globe) {
    viewer.scene.globe.baseColor = bg;
    // 降低影像/地形细节层级（默认 2 → 8），减少平移时的瓦片请求、解码与绘制开销，提升弱 GPU 流畅度
    // （代价是地形/影像更粗糙，对监控指挥大屏可接受）
    viewer.scene.globe.maximumScreenSpaceError = 8;
    // 关闭瓦片预加载，减少平移时无关祖先/兄弟瓦片的请求与解码，降低主线程与 GPU 抖动
    viewer.scene.globe.preloadAncestors = false;
    viewer.scene.globe.preloadSiblings = false;
    // 关闭地面大气辉光：该效果为全屏片元计算，弱 GPU 下是平移卡顿主因之一；
    // 3D 纵深观感改由光照 + 地形浮雕提供，深蓝底图视觉不受损。
    viewer.scene.globe.showGroundAtmosphere = false;
    if ('atmosphereLightIntensity' in viewer.scene.globe) {
      (
        viewer.scene.globe as unknown as { atmosphereLightIntensity: number }
      ).atmosphereLightIntensity = 8;
    }
    if (viewer.scene.globe.translucency) viewer.scene.globe.translucency.enabled = false;
  }
  // 远景雾化保持关闭，避免白雾/白屏
  if (viewer.scene.fog) viewer.scene.fog.enabled = false;
  // 关闭天空大气辉光：该效果是全屏逐片元大气散射，弱 GPU（石化窗/海光 C86）下每帧都多一次全屏绘制，
  // 是平移/缩放卡顿的显著来源；立体感改由地形浮雕 + 深蓝底图提供，视觉损失极小。
  if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = false;
  // 关闭太阳光照逐片元计算（同属全屏开销），进一步释放弱 GPU 每帧预算
  if (viewer.scene.sun) viewer.scene.sun.show = false;
  if (viewer.scene.moon) viewer.scene.moon.show = false;
  // 关闭 FXAA 全屏后处理抗锯齿（与关闭 msaaSamples 配合，整体不叠加抗锯齿开销），再降每帧片元压力
  if (viewer.scene.postProcessStages && viewer.scene.postProcessStages.fxaa) {
    viewer.scene.postProcessStages.fxaa.enabled = false;
  }

  viewer.scene.renderError.addEventListener((_scene: unknown, error: unknown) => {
    const err = error as { message?: string; stack?: string };
    console.error('[cesium render error]', err?.message, err?.stack);
  });

  // 初始相机（避免默认 home view 归一化除零产生 NaN）
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(
      FACTORY_CENTER[0],
      FACTORY_CENTER[1],
      FACTORY_HEIGHT,
    ),
    orientation: { heading: 0, pitch: Cesium.Math.toRadians(-30), roll: 0 },
  });
  return viewer;
}

/** 生成纯色底图的 data URL（离线模式用，避免依赖外部瓦片文件/网络）。 */
function solidImageryDataUrl(color: Cesium.Color): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = color.toCssColorString();
    ctx.fillRect(0, 0, 1, 1);
  }
  return canvas.toDataURL('image/png');
}

/** 探测天地图瓦片是否可达（取低层级样例瓦片做 GET；Cesium 会替换 {z}/{x}/{y}/{s}）。 */
async function isTiandituReachable(template: string): Promise<boolean> {
  const sample = template
    .replace('{s}', '0')
    .replace('{z}', '4')
    .replace('{x}', '12')
    .replace('{y}', '7');
  try {
    const res = await fetch(sample, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

/** 构造天地图瓦片 Provider（t{s} 子域负载均衡，与 one-brain MapPlot 一致）。 */
function makeTiandituProvider(url: string): Cesium.UrlTemplateImageryProvider {
  return new Cesium.UrlTemplateImageryProvider({
    url,
    subdomains: '01234567',
    maximumLevel: 18,
    credit: new Cesium.Credit('© 天地图 GS(2023)323号'),
  });
}

const TD_LAYER_NAME = 'tianditu';

/** 移除已添加的天地图图层（用于底图模式切换）。 */
function clearTianditu(viewer: Cesium.Viewer): void {
  const layers = viewer.imageryLayers;
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers.get(i) as Cesium.ImageryLayer & { name?: string };
    if (layer.name === TD_LAYER_NAME) layers.remove(layer);
  }
}

/**
 * 底图调色决策：影像/夜景两种模式统一共用深蓝科技调色（NIGHT_GRADING），
 * 使真实世界底图融入系统深蓝基色。导出为纯函数便于单测守卫「两种模式同调色」。
 */
export function gradingForMode(_mode: BaseMapMode): typeof NIGHT_GRADING {
  return NIGHT_GRADING;
}

/** 添加天地图底图（矢量+注记 或 影像+注记），统一叠加深蓝科技色调色，使地图基色与系统面板同色系。 */
function addTianditu(viewer: Cesium.Viewer, mode: 'night' | 'satellite'): void {
  clearTianditu(viewer);
  const baseUrl = mode === 'satellite' ? TIANDITU.image : TIANDITU.vector;
  const labelUrl = mode === 'satellite' ? TIANDITU.imageLabel : TIANDITU.vectorLabel;
  const baseLayer = viewer.imageryLayers.addImageryProvider(makeTiandituProvider(baseUrl));
  (baseLayer as Cesium.ImageryLayer & { name?: string }).name = TD_LAYER_NAME;
  const labelLayer = viewer.imageryLayers.addImageryProvider(makeTiandituProvider(labelUrl));
  (labelLayer as Cesium.ImageryLayer & { name?: string }).name = TD_LAYER_NAME;
  // 两种模式统一深蓝科技调色：压亮、提蓝向色相、增强对比，使真实世界底图融入深蓝系统基色
  const g = gradingForMode(mode);
  baseLayer.brightness = g.brightness;
  baseLayer.saturation = g.saturation;
  baseLayer.contrast = g.contrast;
  baseLayer.hue = NIGHT_GRADING.hue;
}

export type BaseMapMode = 'night' | 'satellite';

/**
 * 加载底图：复用 one-brain 同款天地图在线瓦片（默认夜景暗色风格）。
 * 策略：先铺离线底座（纯色 + 网格骨架，保证地球必可见、不白屏），再探测天地图可达性，
 * 可达则叠加天地图矢量/影像底图 + 注记；不可达保留离线骨架。
 */
export async function loadBaseMap(
  viewer: Cesium.Viewer,
  mode: BaseMapMode = 'satellite',
): Promise<void> {
  await recordPerfAsync('baseMapMs', async () => {
    // 离线底座：纯色（系统面板深蓝）+ 透明网格，地球表面一定渲染且可见，且与两侧面板同色系
    const offlineBase = new Cesium.SingleTileImageryProvider({
      url: solidImageryDataUrl(getBaseFillColor()),
      tileWidth: 1,
      tileHeight: 1,
      rectangle: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90),
    });
    viewer.imageryLayers.addImageryProvider(offlineBase);
    viewer.imageryLayers.addImageryProvider(
      new Cesium.GridImageryProvider({
        color: Cesium.Color.fromCssColorString(readCssVar('--color-accent-2', '#2e7cf6')),
        glowColor: Cesium.Color.TRANSPARENT,
        backgroundColor: Cesium.Color.TRANSPARENT,
        cells: 8,
      }),
    );

    // 在线天地图（复用 one-brain tk）：探测可达性后叠加真实底图
    const reachable = await isTiandituReachable(TIANDITU.vector);
    if (reachable) {
      addTianditu(viewer, mode);
    } else {
      logger.warn('[cesium] 天地图不可达，已回退离线网格底图');
    }
    // requestRenderMode 下需要手动触发重绘，否则瓦片加载完成也不绘制
    viewer.scene.requestRender();
  });
}

/** 切换底图模式（夜景 / 影像），对应 one-brain 的 pagechangeImageFunctionByName。 */
export function setBaseMapMode(viewer: Cesium.Viewer, mode: BaseMapMode): void {
  if (!viewer || viewer.isDestroyed?.()) return;
  addTianditu(viewer, mode);
  viewer.scene.requestRender();
}

// ---- 地形浮雕增强（受控联网 / 离线安全） ----

const TERRAIN_HILLSHADE_NAME = 'tianditu-terrain';

/** 移除已添加的天地图地形晕渲层。 */
function clearTerrainHillshade(viewer: Cesium.Viewer): void {
  const layers = viewer.imageryLayers;
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers.get(i) as Cesium.ImageryLayer & { name?: string };
    if (layer.name === TERRAIN_HILLSHADE_NAME) layers.remove(layer);
  }
}

/** 天地图地形晕渲叠加（视觉浮雕，非真实高程）。半透明叠加在底图上，给出山体明暗起伏观感。 */
function addTerrainHillshade(viewer: Cesium.Viewer): void {
  clearTerrainHillshade(viewer);
  const layer = viewer.imageryLayers.addImageryProvider(makeTiandituProvider(TERRAIN_HILLSHADE));
  (layer as Cesium.ImageryLayer & { name?: string }).name = TERRAIN_HILLSHADE_NAME;
  layer.alpha = 0.28;
  layer.contrast = 1.1;
}

/** 切换天地图地形晕渲层显隐（真实高程地形不可由此关闭，仅控制视觉浮雕）。 */
export function setTerrainHillshadeVisible(viewer: Cesium.Viewer, visible: boolean): void {
  const layers = viewer.imageryLayers;
  for (let i = 0; i < layers.length; i++) {
    const layer = layers.get(i) as Cesium.ImageryLayer & { name?: string };
    if (layer.name === TERRAIN_HILLSHADE_NAME) layer.show = visible;
  }
  viewer.scene.requestRender();
}

/** 带超时的「真实高程地形」尝试（Cesium quantized-mesh）。不可达/超时则回落 false。导出便于单测守卫提前返回。 */
export async function tryRealTerrain(viewer: Cesium.Viewer): Promise<boolean> {
  if (!TERRAIN_URL) return false;
  try {
    // Cesium 1.119 经 fromUrl 异步构造（同步构造器已不再接受 url 选项）
    const provider = await Promise.race([
      Cesium.CesiumTerrainProvider.fromUrl(TERRAIN_URL, { requestVertexNormals: true }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('terrain timeout')), TERRAIN_TIMEOUT_MS),
      ),
    ]);
    viewer.terrainProvider = provider;
    return true;
  } catch {
    return false;
  }
}

/**
 * 地形浮雕增强：
 * 1) 若配置了真实高程服务(VITE_TERRAIN_URL) 且可达 → 加载 quantized-mesh 地形（真实几何起伏）。
 * 2) 否则叠加天地图地形晕渲影像（视觉浮雕，不提供几何但观感接近起伏）。
 * 全程受控联网、离线安全：任何失败静默回落到平滑椭球（无白屏）。
 */
export async function loadTerrainRelief(viewer: Cesium.Viewer): Promise<void> {
  await recordPerfAsync('terrainMs', async () => {
    const real = await tryRealTerrain(viewer);
    if (!real) {
      // 受控联网：天地图晕渲影像，给出地形起伏观感
      const reachable = await isTiandituReachable(TERRAIN_HILLSHADE);
      if (reachable) addTerrainHillshade(viewer);
      else logger.warn('[cesium] 天地图晕渲不可达，已跳过地形浮雕');
    }
    viewer.scene.requestRender();
  });
}

// ---- 厂区 3D 建筑模型（3D Tiles，受控联网） ----

let buildingTileset: Cesium.Cesium3DTileset | undefined;

/** 加载厂区 3D Tiles 建筑模型。失败或超时时静默回落（不影响底图）。 */
export async function loadBuildingModel(viewer: Cesium.Viewer): Promise<void> {
  if (!BUILDING_TILESET_URL) return;
  try {
    const tileset = await Promise.race([
      Cesium.Cesium3DTileset.fromUrl(BUILDING_TILESET_URL, {
        // 关闭阴影以省去每帧 shadow map 渲染，降低弱 GPU 下 3D 建筑平移开销
        shadows: Cesium.ShadowMode.DISABLED,
        maximumScreenSpaceError: 64,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('building tileset timeout')),
          BUILDING_TILESET_TIMEOUT_MS,
        ),
      ),
    ]);
    viewer.scene.primitives.add(tileset);
    buildingTileset = tileset;
  } catch {
    logger.warn('[cesium] 3D 建筑模型加载失败或超时，已跳过');
  }
}

/** 显隐控制厂区 3D 建筑模型。 */
export function setBuildingModelVisible(visible: boolean): void {
  if (buildingTileset && !buildingTileset.isDestroyed()) {
    buildingTileset.show = visible;
  }
}

/** 将点位渲染为「图形 + 文字」复合标注（point 圆点 + label 名称）。 */
function addCompositeMarker(
  viewer: Cesium.Viewer,
  p: MapPoint,
  kind: 'alarm' | 'device',
  color: Cesium.Color,
): void {
  viewer.entities.add({
    id: `${kind}:${p.id}`,
    position: Cesium.Cartesian3.fromDegrees(p.lng, p.lat),
    point: {
      pixelSize: 12,
      color,
      // 描边环：项目强调色（--color-accent，规范统一蓝青）
      outlineColor: Cesium.Color.fromCssColorString(readCssVar('--color-accent', '#00d8ff')),
      outlineWidth: 2,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
    label: {
      text: p.name,
      font: '12px sans-serif',
      fillColor: toColor('--color-text-strong', '#ffffff'),
      showBackground: true,
      // 标签底：项目面板色（--color-panel）
      backgroundColor: Cesium.Color.fromCssColorString(
        readCssVar('--color-panel', '#13233c'),
      ).withAlpha(0.83),
      backgroundPadding: new Cesium.Cartesian2(6, 4),
      pixelOffset: new Cesium.Cartesian2(0, -18),
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    properties: {
      kind,
      raw: p,
    },
  });
}

/** 加载报警点位（按 level 着色 + 复合标注）。 */
export async function loadAlarmMarkers(viewer: Cesium.Viewer): Promise<void> {
  const points = await fetchAlarmPoints();
  for (const p of points) {
    addCompositeMarker(viewer, p, 'alarm', levelColor(p.level));
  }
}

/** 加载设备点位（按 status 着色 + 复合标注）。 */
export async function loadDeviceMarkers(viewer: Cesium.Viewer): Promise<void> {
  const points = await fetchDevicePoints();
  for (const p of points) {
    addCompositeMarker(viewer, p, 'device', statusColor(p.status));
  }
}

/** 加载风险区域：半透明多边形面 + 描边（label 独立实体，避免撑白块）。 */
export async function loadRiskZones(viewer: Cesium.Viewer): Promise<void> {
  const zones: RiskZone[] = await fetchRiskZones();
  for (const z of zones) {
    // 围栏来源：优先 WKT，回退坐标数组
    const ring: Cesium.Cartesian3[] = z.wkt
      ? wktToCartesians(z.wkt)
      : (z.polygon ?? []).map(([lng, lat]) => Cesium.Cartesian3.fromDegrees(lng, lat));
    if (ring.length < 3) continue;
    const hierarchy = new Cesium.PolygonHierarchy(ring);
    const fill = zoneFillColor(z.score).withAlpha(0.25);

    viewer.entities.add({
      id: `zone:${z.name}`,
      properties: {
        kind: 'zone',
        score: z.score,
      },
      polygon: {
        hierarchy,
        material: fill,
        // 地面贴地下多边形不支持 outline（Cesium 会告警并自动禁用），且需显式 height 抑制另一告警；
        // 描边改由下方独立的「贴地线」实体 zone-outline:<name> 绘制。
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        height: 0,
      },
    });

    // 风险区边框：用独立 ground-clamped polyline 表达，避免 terrain 下 polygon outline 不受支持告警。
    viewer.entities.add({
      id: `zone-outline:${z.name}`,
      polyline: {
        positions: ring,
        width: 2,
        // 描边：项目强调色（--color-accent，规范统一蓝青）
        material: Cesium.Color.fromCssColorString(readCssVar('--color-accent', '#00d8ff')),
        clampToGround: true,
      },
    });

    // 独立 label 实体置于质心，避免与 polygon 同实体导致的渲染异常（白块）
    // 质心优先取 WKT（支持无 polygon 的围栏），否则取坐标数组均值
    const center: [number, number] = z.wkt
      ? (wktCenter(z.wkt).slice(0, 2) as [number, number])
      : ((z.polygon ?? []).reduce(
          (acc, c) => [
            acc[0] + c[0] / (z.polygon?.length || 1),
            acc[1] + c[1] / (z.polygon?.length || 1),
          ],
          [0, 0],
        ) as [number, number]);
    viewer.entities.add({
      id: `zone-label:${z.name}`,
      position: Cesium.Cartesian3.fromDegrees(center[0], center[1]),
      label: {
        text: `${z.name} 风险 ${z.score.toFixed(1)}`,
        font: '13px sans-serif',
        fillColor: toColor('--color-text-strong', '#ffffff'),
        showBackground: true,
        // 标签底：项目面板色（--color-panel）
        backgroundColor: Cesium.Color.fromCssColorString(
          readCssVar('--color-panel', '#13233c'),
        ).withAlpha(0.83),
        backgroundPadding: new Cesium.Cartesian2(6, 4),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scaleByDistance: new Cesium.NearFarScalar(1.0e3, 1.2, 5.0e5, 0.7),
      },
    });
  }
}

/** 复位相机到厂区初始视角（带 3D 俯角，避免俯视变成「平面地图」观感）。 */
export function resetView(viewer: Cesium.Viewer): void {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      FACTORY_CENTER[0],
      FACTORY_CENTER[1],
      FACTORY_HEIGHT,
    ),
    orientation: {
      heading: 0,
      pitch: Cesium.Math.toRadians(-30),
      roll: 0,
    },
    duration: 1.2,
  });
}

/** 切换到 2D 投影。 */
export function setSceneMode2D(viewer: Cesium.Viewer): void {
  if (viewer.scene.mode !== Cesium.SceneMode.SCENE2D) {
    viewer.scene.morphTo2D(1.0);
  }
}

/** 切换到 3D 场景。 */
export function setSceneMode3D(viewer: Cesium.Viewer): void {
  if (viewer.scene.mode !== Cesium.SceneMode.SCENE3D) {
    viewer.scene.morphTo3D(1.0);
  }
}

export type LayerKind = 'base' | 'markers' | 'zones' | 'labels';

/**
 * 图层显隐控制。
 * - base: imageryLayers[0]
 * - markers / zones / labels: 按实体 id 前缀切换 show
 *
 * 防御性：viewer / entity 在 setLayerVisible 调用瞬间可能正处于销毁中（HMR / 路由切换 / props 重渲染），
 * 直接访问已销毁对象会抛 DeveloperError。任何抛错一律吞掉，避免污染控制台与 UI。
 */
export function setLayerVisible(viewer: Cesium.Viewer, kind: LayerKind, visible: boolean): void {
  try {
    if ((viewer as unknown as { isDestroyed?: () => boolean }).isDestroyed?.()) return;
    if (kind === 'base') {
      const layer = viewer.imageryLayers.get(0);
      if (layer) layer.show = visible;
      viewer.scene.requestRender();
      return;
    }
    const values = viewer.entities.values as Iterable<Cesium.Entity>;
    for (const e of values) {
      const id = e.id as string;
      if (kind === 'markers' && (id.startsWith('alarm:') || id.startsWith('device:'))) {
        e.show = visible;
      } else if (kind === 'zones' && (id.startsWith('zone:') || id.startsWith('zone-label:'))) {
        e.show = visible;
      } else if (kind === 'labels' && (id.startsWith('alarm:') || id.startsWith('device:'))) {
        // 直接赋 boolean，Cesium 内部会自动包装为 ConstantProperty；
        // 避免显式 new ConstantProperty() 在 destroyed entity 上构造时抛错
        if (e.label) (e.label as unknown as { show: boolean }).show = visible;
      }
    }
    // requestRenderMode 下，entity show 变更不会自动触发重绘，必须显式 requestRender
    viewer.scene.requestRender();
  } catch (err) {
    // viewer/entity 已销毁，忽略本次显隐请求
    if (!(err instanceof Cesium.DeveloperError)) {
      console.warn('[cesium] setLayerVisible suppressed error', err);
    }
  }
}

/**
 * 注册点击拾取：命中报警/设备点位时回调 PickResult，命中空白回调 null。
 * 返回取消注册函数。
 *
 * 防御性：handler 内部对已销毁 viewer 的访问（如组件被卸载但用户后续在 canvas 残影上点击）
 * 会抛 DeveloperError，全部吞掉；这是 HMR / props 重渲染过程中的可预期竞态。
 */
export function enablePick(
  viewer: Cesium.Viewer,
  cb: (result: PickResult | null) => void,
): () => void {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  let disposed = false;
  handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    if (disposed) return;
    try {
      const v = viewer as unknown as { isDestroyed?: () => boolean };
      if (v.isDestroyed?.()) return;
      const picked = viewer.scene.pick(movement.position);
      if (picked && picked.id && picked.id.properties) {
        const kind = picked.id.properties.kind?.getValue(viewer.clock.currentTime);
        const raw = (picked.id.properties.raw?.getValue(viewer.clock.currentTime) ?? {}) as Record<
          string,
          unknown
        >;
        if (kind === 'alarm' || kind === 'device') {
          const position = picked.id.position?.getValue?.(viewer.clock.currentTime) as
            Cesium.Cartesian3 | undefined;
          cb({
            id: String(raw.id ?? ''),
            name: String(raw.name ?? ''),
            kind,
            level: raw.level as number | undefined,
            status: raw.status as string | undefined,
            raw,
            position,
          });
          return;
        }
      }
      cb(null);
    } catch (err) {
      if (!(err instanceof Cesium.DeveloperError)) {
        console.warn('[cesium] pick suppressed error', err);
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  return () => {
    disposed = true;
    handler.destroy();
  };
}

// ---- 风险分区点击飞入（联动） ----

/** 由围栏点位近似质心（经纬度均值）。纯计算，便于单测。 */
export function zoneCenterFromPositions(positions: Cesium.Cartesian3[]): [number, number] {
  if (!positions.length) return FACTORY_CENTER;
  let lng = 0;
  let lat = 0;
  for (const p of positions) {
    const c = Cesium.Cartographic.fromCartesian(p);
    lng += Cesium.Math.toDegrees(c.longitude);
    lat += Cesium.Math.toDegrees(c.latitude);
  }
  const n = positions.length;
  return [lng / n, lat / n];
}

/** 飞入指定风险分区（按 'zone:名称' 实体查围栏 bbox 计算视角）。失败静默。 */
export function flyToZone(viewer: Cesium.Viewer, name: string): void {
  try {
    if ((viewer as unknown as { isDestroyed?: () => boolean }).isDestroyed?.()) return;
    const entity = viewer.entities.getById(`zone:${name}`);
    const poly = entity?.polygon;
    if (!poly) return;
    const hierarchy = poly?.hierarchy?.getValue(viewer.clock.currentTime) as
      Cesium.PolygonHierarchy | undefined;
    const positions = hierarchy?.positions ?? [];
    if (!positions.length) return;
    const sphere = Cesium.BoundingSphere.fromPoints(positions);
    const center = Cesium.Cartographic.fromCartesian(sphere.center);
    const height = Math.max(3000, sphere.radius * 2.2);
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        Cesium.Math.toDegrees(center.longitude),
        Cesium.Math.toDegrees(center.latitude),
        height,
      ),
      orientation: { heading: 0, pitch: Cesium.Math.toRadians(-35), roll: 0 },
      duration: 1.0,
    });
  } catch (err) {
    if (!(err instanceof Cesium.DeveloperError)) {
      console.warn('[cesium] flyToZone suppressed error', err);
    }
  }
}

/**
 * 注册风险分区点击拾取：命中围栏面（'zone:名称' 实体）回调 ZonePick 并触发飞入，
 * 命中空白回调 null。返回取消注册函数。
 */
export function enableZonePick(
  viewer: Cesium.Viewer,
  cb: (z: ZonePick | null) => void,
): () => void {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  let disposed = false;
  handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    if (disposed) return;
    try {
      const v = viewer as unknown as { isDestroyed?: () => boolean };
      if (v.isDestroyed?.()) return;
      const picked = viewer.scene.pick(movement.position);
      const name = parseZoneId(picked?.id);
      if (name) {
        const entity = viewer.entities.getById(`zone:${name}`);
        const poly = entity?.polygon;
        const hierarchy = poly?.hierarchy?.getValue(viewer.clock.currentTime) as
          Cesium.PolygonHierarchy | undefined;
        const positions = hierarchy?.positions ?? [];
        const center = zoneCenterFromPositions(positions);
        const score = Number(entity?.properties?.score?.getValue?.(viewer.clock.currentTime) ?? 0);
        const position = Cesium.Cartesian3.fromDegrees(center[0], center[1], 0);
        cb({ name, center, score, raw: { score }, position });
        return;
      }
      cb(null);
    } catch (err) {
      if (!(err instanceof Cesium.DeveloperError)) {
        console.warn('[cesium] zone pick suppressed error', err);
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  return () => {
    disposed = true;
    handler.destroy();
  };
}
