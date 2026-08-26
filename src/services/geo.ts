// C1 地图几何工具：WKT 解析 + GeoJSON 渲染。
// 复用 one-brain-web 的 `wktUtils` 与 `renderGeoJson*` 能力，适配为 TS / Cesium 1.119：
// - 移除 turf 依赖（质心用坐标均值，与 scaffold cesium.ts 现有区域逻辑一致）；
// - 移除图片资源依赖（流光材质用运行时 canvas 纹理，零外部资源）；
// - 纯函数化，便于 TDD。

import * as Cesium from 'cesium';
import { readCssVar } from '@/utils/theme';

const CLAMP = Cesium.HeightReference.CLAMP_TO_GROUND;

/** token 名 / hex → Cesium.Color（与 cesium.ts 同策略：运行时解析设计 token，失败回退）。 */
function toColor(tokenOrHex: string | undefined, fallback: string): Cesium.Color {
  if (!tokenOrHex) return Cesium.Color.fromCssColorString(fallback);
  try {
    return Cesium.Color.fromCssColorString(readCssVar(tokenOrHex, fallback));
  } catch {
    return Cesium.Color.fromCssColorString(fallback);
  }
}

export type WktType =
  'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon';

export type WktGeometry =
  | { type: 'Point'; coordinates: [number, number] }
  | { type: 'LineString'; coordinates: [number, number][] }
  | { type: 'MultiPoint'; coordinates: [number, number][] }
  | { type: 'Polygon'; coordinates: [number, number][] }
  | { type: 'MultiLineString'; coordinates: [number, number][][] }
  | { type: 'MultiPolygon'; coordinates: [number, number][][] };

/** 抓取 WKT 内每一对圆括号内的坐标串（支持 POLYGON/MULTI* 的嵌套括号）。 */
function splitRings(body: string): string[] {
  const segs: string[] = [];
  const re = /\(([^()]*)\)/g;
  let mm: RegExpExecArray | null;
  while ((mm = re.exec(body)) !== null) segs.push(mm[1]);
  return segs;
}

const toPair = (s: string): [number, number] => {
  const parts = s.trim().split(/\s+/);
  return [parseFloat(parts[0]), parseFloat(parts[1])];
};

const toPairs = (s: string): [number, number][] =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .map(toPair);

const TYPE_MAP: Record<string, WktType> = {
  POINT: 'Point',
  LINESTRING: 'LineString',
  POLYGON: 'Polygon',
  MULTIPOINT: 'MultiPoint',
  MULTILINESTRING: 'MultiLineString',
  MULTIPOLYGON: 'MultiPolygon',
};

/**
 * 解析 WKT 字符串为结构化几何（WGS84 经纬度，单位度）。
 * 支持 Point / LineString / Polygon / MultiPoint / MultiLineString / MultiPolygon。
 * Polygon 取外环（带洞多边形忽略内环，本场景渲染单面足够）。
 */
export function parseWkt(wkt: string): WktGeometry {
  const s = (wkt || '').trim().replace(/\s+/g, ' ');
  const m = s.match(/^(\w+)\s*\((.+)\)$/s);
  if (!m) throw new Error(`Invalid WKT: ${wkt}`);
  const rawType = m[1].toUpperCase();
  const type = TYPE_MAP[rawType];
  if (!type) throw new Error(`Unsupported WKT type: ${rawType}`);
  const body = m[2];
  switch (type) {
    case 'Point':
      return { type, coordinates: toPair(body) };
    case 'LineString':
    case 'MultiPoint':
      return { type, coordinates: toPairs(body) };
    case 'Polygon': {
      const ringList = splitRings(body).map(toPairs);
      return { type, coordinates: ringList[0] ?? [] };
    }
    case 'MultiLineString':
    case 'MultiPolygon': {
      const ringList = splitRings(body).map(toPairs);
      return { type, coordinates: ringList };
    }
  }
}

/** WKT → Cartesian3 数组（高程默认 0，贴地）。 */
export function wktToCartesians(wkt: string, height = 0): Cesium.Cartesian3[] {
  const g = parseWkt(wkt);
  let pairs: [number, number][];
  if (g.type === 'Point') {
    pairs = [g.coordinates];
  } else if (g.type === 'MultiLineString' || g.type === 'MultiPolygon') {
    pairs = (g.coordinates as [number, number][][]).flat(1);
  } else {
    // LineString / MultiPoint / Polygon 均为 [number, number][]
    pairs = g.coordinates as [number, number][];
  }
  return pairs.map(([lng, lat]) => Cesium.Cartesian3.fromDegrees(lng, lat, height));
}

/** WKT 几何中心（Polygon/Multi* 取所有坐标均值；与 scaffold 区域质心逻辑一致）。 */
export function wktCenter(wkt: string, height = 0): [number, number, number] {
  const g = parseWkt(wkt);
  let pts: [number, number][];
  if (g.type === 'Point') {
    pts = [g.coordinates];
  } else if (g.type === 'MultiLineString' || g.type === 'MultiPolygon') {
    pts = (g.coordinates as [number, number][][]).flat(1);
  } else {
    pts = g.coordinates as [number, number][];
  }
  if (pts.length === 0) return [0, 0, height];
  const [sx, sy] = pts.reduce((a, c) => [a[0] + c[0], a[1] + c[1]], [0, 0]);
  return [sx / pts.length, sy / pts.length, height];
}

// ----------------------------------------------------------------------------
// GeoJSON 渲染（复用 one-brain-web 的 renderGeoJsonPrimitive / renderGeoJsonFeature）
// ----------------------------------------------------------------------------

export interface GeoJsonFeature {
  type: 'Feature';
  properties?: Record<string, unknown>;
  geometry:
    | { type: 'Point'; coordinates: [number, number] }
    | { type: 'LineString'; coordinates: [number, number][] }
    | { type: 'Polygon'; coordinates: [number, number][][] }
    | { type: 'MultiLineString'; coordinates: [number, number][][] }
    | { type: 'MultiPolygon'; coordinates: [number, number][][][] };
}

export interface RenderGeoJsonOptions {
  color?: string;
  fillOpacity?: number;
  strokeWidth?: number;
  height?: number;
  /** 流光效果（仅浏览器；node 测试自动回退为普通折线）。 */
  animated?: boolean;
}

export interface RenderGeoJsonResult {
  entities: Cesium.Entity[];
  primitives: Cesium.Primitive[];
  remove: () => void;
}

/** 仅渲染所需最小 viewer 接口，便于测试注入替身。 */
export interface CesiumViewerLike {
  entities: {
    add: (e: Cesium.Entity.ConstructorOptions | Cesium.Entity) => Cesium.Entity;
    remove: (e: Cesium.Entity) => boolean;
  };
  scene: {
    primitives: {
      add: (p: Cesium.Primitive) => Cesium.Primitive;
      remove: (p: Cesium.Primitive) => boolean;
    };
  };
}

let flowTexture: HTMLCanvasElement | null = null;
function getFlowTexture(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  if (flowTexture) return flowTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 4;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const grad = ctx.createLinearGradient(0, 0, 64, 0);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(0.5, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 4);
  flowTexture = canvas;
  return canvas;
}

/** 用图元 + 自定义 Material 实现流光折线（czm_frameNumber 驱动）。失败回退 null（由调用方降级为实体折线）。 */
function createFlowLinePrimitive(
  positions: Cesium.Cartesian3[],
  color: string,
): Cesium.Primitive | null {
  try {
    const tex = getFlowTexture();
    if (!tex) return null;
    const geometry = new Cesium.PolylineGeometry({
      positions,
      width: 6,
      vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT,
    });
    const instance = new Cesium.GeometryInstance({ geometry });
    const material = new Cesium.Material({
      fabric: {
        uniforms: {
          image: tex,
          color: toColor(color, '#2e7cf6'),
          speed: 12,
        },
        source: `
          czm_material czm_getMaterial(czm_materialInput materialInput) {
            czm_material material = czm_getDefaultMaterial(materialInput);
            vec2 st = materialInput.st;
            vec4 colorImage = texture(image, vec2(fract(st.s - speed * czm_frameNumber * 0.001), st.t));
            material.alpha = colorImage.a * color.a;
            material.diffuse = color.rgb;
            return material;
          }`,
      },
      translucent: () => true,
    });
    const appearance = new Cesium.PolylineMaterialAppearance();
    appearance.material = material;
    return new Cesium.Primitive({ geometryInstances: instance, appearance, asynchronous: false });
  } catch {
    return null;
  }
}

/**
 * 将 GeoJSON Feature 列表渲染到 Cesium viewer。
 * 支持 Point/LineString/Polygon/MultiLineString/MultiPolygon；LineString 可选流光材质。
 * 返回 remove() 统一销毁所有创建的实体与图元。
 */
export function renderGeoJson(
  viewer: CesiumViewerLike,
  features: GeoJsonFeature[],
  options: RenderGeoJsonOptions = {},
): RenderGeoJsonResult {
  const color = options.color ?? '--color-accent-2';
  const fillOpacity = options.fillOpacity ?? 0.18;
  const strokeWidth = options.strokeWidth ?? 2;
  const height = options.height ?? 0;
  const entities: Cesium.Entity[] = [];
  const primitives: Cesium.Primitive[] = [];

  const c = toColor(color, '#2e7cf6');
  const addEntity = (cfg: Cesium.Entity.ConstructorOptions): Cesium.Entity => {
    const e = viewer.entities.add(new Cesium.Entity(cfg));
    entities.push(e);
    return e;
  };

  for (const f of features) {
    const props = f.properties ?? {};
    const label = String(props.name ?? props.title ?? '');
    const geom = f.geometry;

    if (geom.type === 'Point') {
      const [lng, lat] = geom.coordinates;
      addEntity({
        position: Cesium.Cartesian3.fromDegrees(lng, lat, height),
        point: {
          pixelSize: 10,
          color: c,
          outlineColor: toColor('--color-text-strong', '#ffffff'),
          outlineWidth: 2,
          heightReference: CLAMP,
        },
        label: label
          ? {
              text: label,
              font: '12px sans-serif',
              fillColor: toColor('--color-text-strong', '#ffffff'),
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString(
                readCssVar('--color-panel', '#13233c'),
              ).withAlpha(0.7),
              backgroundPadding: new Cesium.Cartesian2(6, 4),
              pixelOffset: new Cesium.Cartesian2(0, -16),
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              heightReference: CLAMP,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            }
          : undefined,
      });
    } else if (geom.type === 'LineString') {
      const positions = geom.coordinates.map(([x, y]) =>
        Cesium.Cartesian3.fromDegrees(x, y, height),
      );
      if (options.animated && typeof document !== 'undefined') {
        const prim = createFlowLinePrimitive(positions, color);
        if (prim) {
          viewer.scene.primitives.add(prim);
          primitives.push(prim);
          continue;
        }
      }
      addEntity({
        polyline: {
          positions,
          width: strokeWidth,
          material: c.clone(),
          clampToGround: height === 0,
        },
      });
    } else if (geom.type === 'Polygon') {
      const ring = geom.coordinates[0];
      if (!ring || ring.length < 3) continue;
      const hierarchy = new Cesium.PolygonHierarchy(
        ring.map(([x, y]) => Cesium.Cartesian3.fromDegrees(x, y, height)),
      );
      addEntity({
        polygon: {
          hierarchy,
          material: c.withAlpha(fillOpacity),
          // 地面贴地下多边形不支持 outline（Cesium 会告警并自动禁用），且需显式 height 抑制另一告警；
          // 描边改由下方独立的「贴地线」实体绘制（见后）。
          heightReference: CLAMP,
          height: 0,
        },
      });
      // 贴地多边形边框：用独立 ground-clamped polyline 表达，避免 terrain 下 outline 不受支持告警。
      addEntity({
        polyline: {
          positions: ring.map(([x, y]) => Cesium.Cartesian3.fromDegrees(x, y, height)),
          width: strokeWidth,
          material: c.clone(),
          clampToGround: height === 0,
        },
      });
    } else if (geom.type === 'MultiLineString') {
      for (const line of geom.coordinates) {
        const positions = line.map(([x, y]) => Cesium.Cartesian3.fromDegrees(x, y, height));
        if (options.animated && typeof document !== 'undefined') {
          const prim = createFlowLinePrimitive(positions, color);
          if (prim) {
            viewer.scene.primitives.add(prim);
            primitives.push(prim);
            continue;
          }
        }
        addEntity({
          polyline: {
            positions,
            width: strokeWidth,
            material: c.clone(),
            clampToGround: height === 0,
          },
        });
      }
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.coordinates) {
        const ring = poly[0];
        if (!ring || ring.length < 3) continue;
        const hierarchy = new Cesium.PolygonHierarchy(
          ring.map(([x, y]) => Cesium.Cartesian3.fromDegrees(x, y, height)),
        );
        addEntity({
          polygon: {
            hierarchy,
            material: c.withAlpha(fillOpacity),
            // 同 Polygon 分支：贴地下不支持 outline，补 height 抑制告警
            heightReference: CLAMP,
            height: 0,
          },
        });
        addEntity({
          polyline: {
            positions: ring.map(([x, y]) => Cesium.Cartesian3.fromDegrees(x, y, height)),
            width: strokeWidth,
            material: c.clone(),
            clampToGround: height === 0,
          },
        });
      }
    }
  }

  return {
    entities,
    primitives,
    remove: () => {
      for (const e of entities) {
        try {
          viewer.entities.remove(e);
        } catch {
          /* noop */
        }
      }
      for (const p of primitives) {
        try {
          viewer.scene.primitives.remove(p);
        } catch {
          /* noop */
        }
      }
    },
  };
}
