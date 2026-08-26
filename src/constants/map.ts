// 地图底图配置。
//
// 设计基线原为「离线优先 / 同源 CSP（S1 §9.4）」；按业务要求复用 one-brain 同款**天地图在线底图**
// 以达到一致视觉（暗色夜景 + 青色叠加），故此处引入在线天地图瓦片。
//
// tk 优先取 VITE_TIANDITU_KEY，缺省回退 one-brain 内置 tk（仅开发预览用，生产须替换为自有 key）。
// 注意：生产部署的 CSP（deploy/csp.conf）需放行 *.tianditu.gov.cn 的 img-src / connect-src。

// one-brain 项目内置天地图 key（开发预览默认；生产请通过 VITE_TIANDITU_KEY 覆盖为自有 key）
const TIANDITU_KEY_FALLBACK = '93724b915d1898d946ca7dc7b765dda5';

export const TIANDITU_KEY: string =
  (import.meta.env.VITE_TIANDITU_KEY as string | undefined) ?? TIANDITU_KEY_FALLBACK;

// 天地图瓦片模板（与 one-brain MapPlot 一致：T=vec_w 矢量 / cva_w 矢量注记 / img_w 影像 / cia_w 影像注记）。
// Cesium 的 UrlTemplateImageryProvider 会替换 {z}/{x}/{y}/{s}；天地图用 l 作为层级参数 → 此处用 l={z}。
const tdt = (type: string): string =>
  `https://t{s}.tianditu.gov.cn/DataServer?T=${type}_w&x={x}&y={y}&l={z}&tk=${TIANDITU_KEY}`;

export const TIANDITU = {
  /** 矢量底图（夜景暗色风格靠下方调色实现） */
  vector: tdt('vec'),
  /** 矢量注记（道路/地名标注） */
  vectorLabel: tdt('cva'),
  /** 影像底图 */
  image: tdt('img'),
  /** 影像注记 */
  imageLabel: tdt('cia'),
};

// 地形 / 高程服务（受控联网）。
// 说明：天地图 T=ter_w 是「地形晕渲」影像（山体阴影贴图），并非 Cesium 可用的高程(quantized-mesh)数据。
// 因此 layered：
//  - TERRAIN_HILLSHADE：天地图地形晕渲影像，仅作视觉浮雕叠加（不提供真实高程几何，但观感接近 3D 起伏）。
//  - TERRAIN_URL：可选的真实高程瓦片服务（Cesium quantized-mesh），由 VITE_TERRAIN_URL 注入；
//    缺省为空 → 不加载真实地形，仅用地形晕渲影像做视觉增强。
export const TERRAIN_HILLSHADE = tdt('ter');
export const TERRAIN_URL: string = (import.meta.env.VITE_TERRAIN_URL as string | undefined) ?? '';
// 真实地形 readyPromise 超时保护（ms），避免不可达服务长期挂起
export const TERRAIN_TIMEOUT_MS = 6000;

// 保留原离线瓦片配置（同源内网瓦片服务），作为无 VITE_MAP_TILE_URL 时的兜底占位
export const MAP_TILE_URL: string = import.meta.env.VITE_MAP_TILE_URL ?? '/tiles/{z}/{x}/{y}.png';

// one-brain 暗夜风格调色（仅作用于矢量底图 imageryLayer）：压低亮度 + 蓝向色相偏移 + 提饱和/对比，
// 复刻 one-brain 默认「夜景」暗蓝观感。默认即以 night 模式加载（BaseMap.baseMapMode='night'）。
export const NIGHT_GRADING = {
  brightness: 0.68,
  saturation: 1.22,
  contrast: 1.14,
  hue: 0.07,
};
