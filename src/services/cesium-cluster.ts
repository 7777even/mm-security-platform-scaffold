// C1 聚合打点图层：海量点位聚类 + 点击弹窗（复用 one-brain-web 的 MapClusterBillboard 能力）。
//
// 适配要点（相对 one-brain-web）：
// - 去除 window.$viewer 全局，改为构造注入 Cesium.Viewer；
// - 去除 Vue2 `Vue.extend` / `$bus` / `store` 耦合，改用 onPick 回调上报拾取结果；
// - 去除二进制 PNG 资源依赖，聚合/单点图标改用 canvas 实时绘制；
// - 基于 Cesium 原生 EntityCluster（CustomDataSource.clustering）实现，行为与原合成类一致：
//   聚合时按数量档位切换图标尺寸/颜色；点击聚合→返回聚合内全部点位，点击单点→返回单点并切换选中态。

import * as Cesium from 'cesium';
import { wktToCartesians } from '@/services/geo';
import { readCssVar } from '@/utils/theme';

const CLAMP = Cesium.HeightReference.CLAMP_TO_GROUND;

export interface ClusterPoint {
  id: string;
  name: string;
  lng: number;
  lat: number;
  /** 图标分类键（用于后续分组/着色扩展）。 */
  type?: string;
  /** 可选：用 WKT 定位（优先级高于 lng/lat）。 */
  wkt?: string;
  /** 透传给弹窗的原始数据。 */
  raw?: Record<string, unknown>;
}

export interface ClusterPickInfo {
  kind: 'cluster' | 'single' | 'none';
  items: ClusterPoint[];
  position: Cesium.Cartesian3 | null;
}

export interface ClusterLayerConfig {
  typeName?: string;
  /** 是否启用聚合（默认 true）。 */
  enableClustering?: boolean;
  pixelRange?: number;
  minimumClusterSize?: number;
  /** 升序数量阈值，例 [0, 10, 50, 100] 表示 0-9/10-49/50-99/100+ 四档。 */
  clusterRanges?: number[];
  clusterColors?: string[];
  clusterSizes?: [number, number][];
  /** 单点图标主色。 */
  pointColor?: string;
  /** 选中单点时是否锁定缩放（默认 false）。 */
  enableZoomLock?: boolean;
  /** 测试注入：事件处理器工厂（默认 new Cesium.ScreenSpaceEventHandler）。 */
  createEventHandler?: (
    canvas: HTMLCanvasElement,
    type: 'LEFT_CLICK' | 'MOUSE_MOVE',
  ) => {
    setInputAction: (cb: (m: unknown) => void, t: unknown) => void;
    removeInputAction: (t: unknown) => void;
  };
  onPick?: (info: ClusterPickInfo) => void;
}

// 聚合档位配色：复用当前项目《UI 规范》语义色阶（低→高密度 = 蓝→青→警示→危险），
// 以 token 名声明，运行时经 readCssVar 解析，遵循「禁止硬编码颜色」规范。
const DEFAULT_RANGES = [0, 10, 50, 100];
const DEFAULT_COLORS = ['--color-accent-2', '--color-accent', '--color-warning', '--color-danger'];
const DEFAULT_POINT_COLOR = '--color-accent-2';
const DEFAULT_SELECTED_COLOR = '--color-danger';
const DEFAULT_SIZES: [number, number][] = [
  [36, 36],
  [48, 48],
  [64, 64],
  [80, 80],
];

/** 按聚合数量选择档位索引。 */
export function clusterRangeIndex(count: number, ranges: number[]): number {
  let idx = 0;
  for (let i = 0; i < ranges.length; i++) {
    if (count >= ranges[i]) idx = i;
  }
  return idx;
}

/**
 * 拾取结果分类（纯函数，便于 TDD）。
 * Cesium 聚合：scene.pick 返回的 picked.id 为被聚合实体数组；
 * 单点：picked.id 为实体，携带 itemInfoValue 自定义字段。
 */
export function classifyPick(
  picked: { id?: unknown } | null,
  typeName: string,
): { kind: 'cluster' | 'single' | 'none'; items: ClusterPoint[] } {
  if (!picked || !picked.id) return { kind: 'none', items: [] };
  const id = picked.id as unknown;
  if (Array.isArray(id)) {
    if (id.length > 0 && (id[0] as { name?: string }).name === typeName) {
      const items = (id as Array<{ itemInfoValue?: { item: ClusterPoint } }>)
        .map((e) => e.itemInfoValue?.item)
        .filter(Boolean) as ClusterPoint[];
      return { kind: 'cluster', items };
    }
    return { kind: 'none', items: [] };
  }
  const single = id as { name?: string; itemInfoValue?: { item: ClusterPoint } };
  if (single.name === typeName && single.itemInfoValue) {
    return { kind: 'single', items: [single.itemInfoValue.item] };
  }
  return { kind: 'none', items: [] };
}

// ---------------------------------------------------------------------------
// canvas 图标绘制（无外部图片资源；测试可注入 createCanvas 替身）
// ---------------------------------------------------------------------------

export interface IconFactory {
  createCanvas: (w: number, h: number) => HTMLCanvasElement;
}

function getDoc(factory?: IconFactory): IconFactory | null {
  if (factory) return factory;
  if (typeof document !== 'undefined') {
    return {
      createCanvas: (w, h) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        return c;
      },
    };
  }
  return null;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * 将设计 token 名解析为实际色值，供 canvas 绘制消费（canvas 无法直接读 var()）。
 * 支持 `--token` 或 `var(--token)` 写法；传入 hex/rgb 原样返回；
 * 解析失败或未定义时回退 fallback，保证不抛错、不出错色。
 */
function resolveColor(input: string | undefined, fallback: string): string {
  if (!input) return fallback;
  const name = input.startsWith('var(') ? input.slice(4, -1).trim() : input;
  if (name.startsWith('--')) {
    return readCssVar(name, fallback) || fallback;
  }
  return input;
}

/** 聚合图标：圆形底 + 居中数量。 */
export function drawClusterIcon(
  count: number,
  opts?: { size?: [number, number]; color?: string; doc?: IconFactory },
): HTMLCanvasElement | null {
  const doc = getDoc(opts?.doc);
  if (!doc) return null;
  const [w, h] = opts?.size ?? [48, 48];
  const canvas = doc.createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const color = resolveColor(opts?.color ?? DEFAULT_POINT_COLOR, '#2e7cf6');
  ctx.clearRect(0, 0, w, h);
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, Math.min(w, h) / 2 - 2, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = resolveColor('--color-text-strong', '#ffffff');
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = resolveColor('--color-text-strong', '#ffffff');
  ctx.font = `bold ${Math.round(Math.min(w, h) / 3)}px Microsoft YaHei, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(count), w / 2, h / 2);
  return canvas;
}

/** 单点图标：顶部圆点 + 底部文字标签（复用 one-brain-web 的 createCanvasIcon 版式）。 */
export function drawPointIcon(
  text: string,
  opts?: { color?: string; doc?: IconFactory },
): HTMLCanvasElement | null {
  const doc = getDoc(opts?.doc);
  if (!doc) return null;
  const label = text || '';
  const w = Math.max(72, Math.min(240, label.length * 14 + 28));
  const h = 44;
  const canvas = doc.createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const color = resolveColor(opts?.color ?? DEFAULT_POINT_COLOR, '#2e7cf6');
  const panel = resolveColor('--color-panel', '#13233c');
  const textColor = resolveColor('--color-text-strong', '#ffffff');
  // 顶部圆点
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(w / 2, 16, 11, 0, Math.PI * 2);
  ctx.fill();
  // 标签底框（半透深蓝：token 解析 + 固定透明度，与当前项目标签底观感一致）
  const padX = 8;
  const labelY = 30;
  const labelH = 18;
  ctx.save();
  ctx.globalAlpha = 0.88;
  ctx.fillStyle = panel;
  roundRect(ctx, padX, labelY, w - padX * 2, labelH, 4);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  roundRect(ctx, padX, labelY, w - padX * 2, labelH, 4);
  ctx.stroke();
  ctx.fillStyle = textColor;
  ctx.font = '12px Microsoft YaHei, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, w / 2, labelY + labelH / 2);
  return canvas;
}

// ---------------------------------------------------------------------------
// 聚合打点图层
// ---------------------------------------------------------------------------

type HandlerLike = {
  setInputAction: (cb: (m: unknown) => void, t: unknown) => void;
  removeInputAction: (t: unknown) => void;
};

export class ClusterBillboardLayer {
  private viewer: Cesium.Viewer;
  private config: ClusterLayerConfig;
  private typeName: string;
  private enableClustering: boolean;
  private pointColor: string;
  private enableZoomLock: boolean;
  private onPick?: (info: ClusterPickInfo) => void;

  private source: Cesium.CustomDataSource;
  private handlerClick: HandlerLike | null = null;
  private handlerMove: HandlerLike | null = null;
  private clusterListener: (() => void) | null = null;
  private pickedEntity: Cesium.Entity | null = null;
  private pickBillboard: Cesium.BillboardGraphics | null = null;
  private points: ClusterPoint[] = [];
  private moveRaf = 0;
  private lastMoveXY: { x: number; y: number } | null = null;

  constructor(viewer: Cesium.Viewer, config: ClusterLayerConfig = {}) {
    this.viewer = viewer;
    this.config = config;
    this.typeName = config.typeName ?? 'clusterLayer';
    this.enableClustering = config.enableClustering ?? true;
    this.pointColor = config.pointColor ?? DEFAULT_POINT_COLOR;
    this.enableZoomLock = config.enableZoomLock ?? false;
    this.onPick = config.onPick;
    this.source = new Cesium.CustomDataSource(this.typeName);
    viewer.dataSources.add(this.source);
  }

  /** 注入点位数据并刷新图层。 */
  setData(points: ClusterPoint[]): void {
    this.clearEntities();
    this.points = points;
    for (const p of points) {
      const pos = this.resolvePosition(p);
      if (!pos) continue;
      const icon = drawPointIcon(p.name, { color: this.pointColor });
      const billboard: Cesium.BillboardGraphics.ConstructorOptions = icon
        ? {
            image: icon,
            scale: 1,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            heightReference: CLAMP,
          }
        : { scale: 1, pixelOffset: new Cesium.Cartesian2(0, -10), heightReference: CLAMP };
      const entity = new Cesium.Entity({ name: this.typeName, position: pos, billboard });
      // 自定义字段：透传原始点位（不作为 properties，避免需要 clock 取值）
      (entity as unknown as { itemInfoValue: unknown }).itemInfoValue = {
        item: p,
        centerCartesian3: pos,
      };
      this.source.entities.add(entity);
    }
    this.applyClustering();
    this.registerHandlers();
  }

  private resolvePosition(p: ClusterPoint): Cesium.Cartesian3 | null {
    if (p.wkt) {
      try {
        const cs = wktToCartesians(p.wkt);
        if (cs.length) return cs[0];
      } catch {
        /* 回退到 lng/lat */
      }
    }
    if (Number.isFinite(p.lng) && Number.isFinite(p.lat)) {
      return Cesium.Cartesian3.fromDegrees(p.lng, p.lat, 0);
    }
    return null;
  }

  private applyClustering(): void {
    if (!this.enableClustering) return;
    const clustering = this.source.clustering;
    clustering.enabled = true;
    clustering.pixelRange = this.config.pixelRange ?? 50;
    clustering.minimumClusterSize = this.config.minimumClusterSize ?? 2;
    const ranges = this.config.clusterRanges ?? DEFAULT_RANGES;
    const colors = this.config.clusterColors ?? DEFAULT_COLORS;
    const sizes = this.config.clusterSizes ?? DEFAULT_SIZES;
    this.clusterListener = clustering.clusterEvent.addEventListener((_clustered, cluster) => {
      const billboard = cluster.billboard as Cesium.BillboardGraphics;
      const label = cluster.label as Cesium.LabelGraphics;
      label.show = false;
      billboard.show = true;
      const count = (_clustered as unknown as unknown[]).length;
      const idx = clusterRangeIndex(count, ranges);
      const size = sizes[idx];
      const color = colors[idx];
      const icon = drawClusterIcon(count, { size, color });
      if (icon) billboard.image = icon;
      billboard.width = size[0];
      billboard.height = size[1];
    });
  }

  private registerHandlers(): void {
    if (this.handlerClick || this.handlerMove) return;
    const canvas = this.viewer.scene.canvas as HTMLCanvasElement;
    if (this.config.createEventHandler) {
      this.handlerClick = this.config.createEventHandler(canvas, 'LEFT_CLICK');
      this.handlerMove = this.config.createEventHandler(canvas, 'MOUSE_MOVE');
    } else {
      this.handlerClick = new Cesium.ScreenSpaceEventHandler(canvas) as unknown as HandlerLike;
      this.handlerMove = new Cesium.ScreenSpaceEventHandler(canvas) as unknown as HandlerLike;
    }
    this.handlerClick.setInputAction(
      (m) => this.onClick(m as Cesium.ScreenSpaceEventHandler.PositionedEvent),
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    );
    this.handlerMove.setInputAction(
      (m) => this.onMove(m as Cesium.ScreenSpaceEventHandler.MotionEvent),
      Cesium.ScreenSpaceEventType.MOUSE_MOVE,
    );
  }

  private onClick(movement: Cesium.ScreenSpaceEventHandler.PositionedEvent): void {
    const picked = this.viewer.scene.pick(movement.position) as
      Cesium.Entity | Cesium.Primitive | Cesium.Cesium3DTileFeature | undefined;
    this.recoverPicked();
    const { kind, items } = classifyPick(picked ?? null, this.typeName);
    if (kind === 'cluster') {
      const arr = (picked as { id?: unknown }).id as Array<{
        itemInfoValue?: { centerCartesian3: Cesium.Cartesian3 };
      }>;
      const position = arr?.[0]?.itemInfoValue?.centerCartesian3 ?? null;
      this.emit({ kind, items, position });
      this.lockZoom(true);
    } else if (kind === 'single') {
      const entity = (picked as { id?: unknown }).id as Cesium.Entity & {
        itemInfoValue: { item: ClusterPoint; centerCartesian3: Cesium.Cartesian3 };
      };
      this.pickedEntity = entity;
      this.pickBillboard = entity.billboard.clone();
      const item = entity.itemInfoValue.item;
      const icon = drawPointIcon(item.name ?? '', {
        color: resolveColor(DEFAULT_SELECTED_COLOR, '#ff5a5a'),
      });
      if (icon) {
        entity.billboard = new Cesium.BillboardGraphics({
          image: icon,
          scale: 1,
          pixelOffset: new Cesium.Cartesian2(0, -10),
          heightReference: CLAMP,
        });
      }
      this.emit({ kind, items, position: entity.itemInfoValue.centerCartesian3 });
      this.lockZoom(true);
    } else {
      this.emit({ kind: 'none', items: [], position: null });
      this.lockZoom(false);
    }
  }

  private onMove(movement: Cesium.ScreenSpaceEventHandler.MotionEvent): void {
    const p = movement.endPosition as Cesium.Cartesian2;
    if (!p) return;
    // 缓存最新坐标，用 rAF 兜底：鼠标每移动一像素 Cesium 都会抛 MOUSE_MOVE，
    // 若每次都 scene.pick()（GPU 拾取回读）会严重阻塞渲染线程，导致地图滑动卡顿。
    // 改为每帧最多拾取一次，并复用最近坐标。
    this.lastMoveXY = { x: p.x, y: p.y };
    if (this.moveRaf) return;
    const tick = () => {
      this.moveRaf = 0;
      const xy = this.lastMoveXY;
      if (!xy) return;
      const picked = this.viewer.scene.pick(new Cesium.Cartesian2(xy.x, xy.y)) as
        Cesium.Entity | Cesium.Primitive | Cesium.Cesium3DTileFeature | undefined;
      const { kind } = classifyPick(picked ?? null, this.typeName);
      const el = this.viewer.canvas as HTMLCanvasElement;
      el.style.cursor = kind === 'none' ? 'default' : 'pointer';
    };
    if (typeof requestAnimationFrame === 'function') {
      this.moveRaf = requestAnimationFrame(tick);
    } else {
      tick();
    }
  }

  private recoverPicked(): void {
    if (this.pickedEntity && this.pickBillboard) {
      this.pickedEntity.billboard = this.pickBillboard;
      this.pickedEntity = null;
      this.pickBillboard = null;
    }
  }

  private lockZoom(lock: boolean): void {
    if (this.enableZoomLock) {
      this.viewer.scene.screenSpaceCameraController.enableZoom = !lock;
    }
  }

  private emit(info: ClusterPickInfo): void {
    this.onPick?.(info);
  }

  /** 图层显隐。 */
  setVisible(visible: boolean): void {
    this.source.show = visible;
  }

  /** 清除当前选中态（恢复单点图标）并上报 none。 */
  clearSelection(): void {
    this.recoverPicked();
    this.emit({ kind: 'none', items: [], position: null });
  }

  private clearEntities(): void {
    this.recoverPicked();
    this.source.entities.removeAll();
  }

  /** 销毁图层：移除事件、聚合监听、实体与数据源。 */
  destroy(): void {
    this.removeHandlers();
    if (this.clusterListener) {
      this.clusterListener();
      this.clusterListener = null;
    }
    this.clearEntities();
    if (!this.viewer.isDestroyed?.()) {
      try {
        this.viewer.dataSources.remove(this.source);
      } catch {
        /* noop */
      }
    }
  }

  private removeHandlers(): void {
    if (this.moveRaf) {
      cancelAnimationFrame(this.moveRaf);
      this.moveRaf = 0;
    }
    this.lastMoveXY = null;
    if (this.handlerClick) {
      this.handlerClick.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handlerClick = null;
    }
    if (this.handlerMove) {
      this.handlerMove.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      this.handlerMove = null;
    }
  }
}
