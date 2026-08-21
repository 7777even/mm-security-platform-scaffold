// C1 地图引擎：Cesium.js 二三维一体化底座。
// 提供 viewer 初始化、瓦片底图、点位（复合标注）、风险区域、点击拾取、图层显隐控制。
// 数据来源沿用 services/map.ts（fetchAlarmPoints / fetchDevicePoints / fetchRiskZones）。

import * as Cesium from 'cesium';
import type { MapPoint, RiskZone } from '@/services/map';
import { fetchAlarmPoints, fetchDevicePoints, fetchRiskZones } from '@/services/map';
import { MAP_TILE_URL } from '@/constants/map';
import { recordPerfAsync } from '@/utils/perf-budget';

// 厂区初始中心（湛江中科炼化坐标附近）+ 初始相机高度
export const FACTORY_CENTER: [number, number] = [110.95, 21.6];
export const FACTORY_HEIGHT = 12000;

// 报警等级配色（规范 §13.1：1 级最高危=红，4 级最低=蓝）
const LEVEL_COLORS: Record<number, string> = {
  1: '#f46767', // alarm-1 一级 最高危 红
  2: '#f6882e', // alarm-2 二级 橙
  3: '#f6ba2e', // alarm-3 三级 黄
  4: '#2e7cf6', // alarm-4 四级 最低 蓝
};
// 设备状态 → 颜色（mock 返回 online/offline/normal/active 等；规范 §13.3）
const STATUS_COLORS: Record<string, string> = {
  online: '#2ee6a8', // success 在线
  normal: '#2ee6a8', // success 正常
  active: '#ff5a5a', // danger 当前告警中
  offline: '#8fa6c8', // text-muted 离线静默
  fault: '#ff5a5a', // danger 故障
};

const DEFAULT_MARKER_COLOR = Cesium.Color.fromCssColorString('#8fa6c8'); // text-muted
const DEFAULT_ZONE_COLOR = Cesium.Color.fromCssColorString('#2e7cf6'); // accent-2

export interface PickResult {
  id: string;
  name: string;
  kind: 'alarm' | 'device';
  level?: number;
  status?: string;
  raw: Record<string, unknown>;
}

function cssColor(hex: string | undefined, fallback: Cesium.Color): Cesium.Color {
  if (!hex) return fallback;
  try {
    return Cesium.Color.fromCssColorString(hex);
  } catch {
    return fallback;
  }
}

function levelColor(level?: number): Cesium.Color {
  if (level === undefined) return DEFAULT_MARKER_COLOR;
  return cssColor(
    LEVEL_COLORS[level] ?? LEVEL_COLORS[Math.min(4, Math.max(1, level))],
    DEFAULT_MARKER_COLOR,
  );
}

function statusColor(status?: string): Cesium.Color {
  return cssColor(status ? STATUS_COLORS[status.toLowerCase()] : undefined, DEFAULT_MARKER_COLOR);
}

/** 区域填充色（含透明度），按评分分级（规范 §13.4）：≥4 红、≥3 橙黄、≥2 蓝、其余静默灰。纯函数，便于 TDD。 */
export function zoneFillColor(score: number): Cesium.Color {
  const hex = score >= 4 ? '#ff5a5a' : score >= 3 ? '#ffb020' : score >= 2 ? '#2e7cf6' : '#8fa6c8';
  const alpha = score >= 4 ? 0.22 : score >= 3 ? 0.2 : score >= 2 ? 0.18 : 0.14;
  return cssColor(hex, DEFAULT_ZONE_COLOR).withAlpha(alpha);
}

/** 点位着色纯函数：报警按 level、设备按 status。便于 TDD 验证等级/状态色映射。 */
export function markerColor(kind: 'alarm' | 'device', p: MapPoint): Cesium.Color {
  return kind === 'alarm' ? levelColor(p.level) : statusColor(p.status);
}

const DARK_BG = '#0b1526'; // 规范 --color-bg

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
    // canvas 不透明 + 保留 framebuffer，杜绝白屏假象与截图丢帧
    contextOptions: { webgl: { alpha: false, preserveDrawingBuffer: true } },
    requestRenderMode: true,
  });

  // 深色底座：background + globe.baseColor 与 dashboard 同色，globe 失败也看不出白屏
  const bg = Cesium.Color.fromCssColorString(DARK_BG);
  viewer.scene.backgroundColor = bg;
  if (viewer.scene.globe) {
    viewer.scene.globe.baseColor = bg;
    viewer.scene.globe.showGroundAtmosphere = false;
    if ('atmosphereLightIntensity' in viewer.scene.globe) {
      (
        viewer.scene.globe as unknown as { atmosphereLightIntensity: number }
      ).atmosphereLightIntensity = 0;
    }
    if (viewer.scene.globe.translucency) viewer.scene.globe.translucency.enabled = false;
  }
  // 关闭远景白色雾化与天体光晕
  if (viewer.scene.fog) viewer.scene.fog.enabled = false;
  if (viewer.scene.sun) viewer.scene.sun.show = false;
  if (viewer.scene.moon) viewer.scene.moon.show = false;

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
    orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 },
  });
  return viewer;
}

/** 加载瓦片底图（可配置 URL，生产同源离线 / 开发公网预览）。 */
export async function loadBaseMap(viewer: Cesium.Viewer): Promise<void> {
  await recordPerfAsync('baseMapMs', async () => {
    // 当前 Cesium 构建未导出 UrlTemplateImageryProvider.fromUrl 静态方法，
    // 必须使用构造器；构造器接受 options 对象（同 fromUrl 的第二个参数）。
    const provider = new Cesium.UrlTemplateImageryProvider({
      url: MAP_TILE_URL,
      urlSchemeZeroPadding: true,
      maximumLevel: 18,
    });
    viewer.imageryLayers.addImageryProvider(provider);
    // requestRenderMode 下需要手动触发重绘，否则瓦片加载完成也不绘制
    viewer.scene.requestRender();
  });
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
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
    label: {
      text: p.name,
      font: '12px sans-serif',
      fillColor: Cesium.Color.WHITE,
      showBackground: true,
      backgroundColor: Cesium.Color.fromCssColorString('#13233c').withAlpha(0.7),
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
    if (!z.polygon || z.polygon.length < 3) continue;
    const hierarchy = new Cesium.PolygonHierarchy(
      z.polygon.map(([lng, lat]) => Cesium.Cartesian3.fromDegrees(lng, lat)),
    );
    const fill = cssColor(
      z.score >= 4 ? '#ff5a5a' : z.score >= 3 ? '#ffb020' : z.score >= 2 ? '#2e7cf6' : '#8fa6c8',
      DEFAULT_ZONE_COLOR,
    ).withAlpha(0.25);

    viewer.entities.add({
      id: `zone:${z.name}`,
      polygon: {
        hierarchy,
        material: fill,
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString('#f8fafc'),
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });

    // 独立 label 实体置于质心，避免与 polygon 同实体导致的渲染异常（白块）
    const center = z.polygon.reduce(
      (acc, c) => [acc[0] + c[0] / z.polygon.length, acc[1] + c[1] / z.polygon.length],
      [0, 0],
    ) as [number, number];
    viewer.entities.add({
      id: `zone-label:${z.name}`,
      position: Cesium.Cartesian3.fromDegrees(center[0], center[1]),
      label: {
        text: `${z.name} 风险 ${z.score.toFixed(1)}`,
        font: '13px sans-serif',
        fillColor: Cesium.Color.WHITE,
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#13233c').withAlpha(0.75),
        backgroundPadding: new Cesium.Cartesian2(6, 4),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scaleByDistance: new Cesium.NearFarScalar(1.0e3, 1.2, 5.0e5, 0.7),
      },
    });
  }
}

/** 复位相机到厂区初始视角。 */
export function resetView(viewer: Cesium.Viewer): void {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      FACTORY_CENTER[0],
      FACTORY_CENTER[1],
      FACTORY_HEIGHT,
    ),
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
          cb({
            id: String(raw.id ?? ''),
            name: String(raw.name ?? ''),
            kind,
            level: raw.level as number | undefined,
            status: raw.status as string | undefined,
            raw,
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
