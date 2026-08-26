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

// 厂区/园区 3D 建筑模型（3D Tiles，受控联网）。
// 示例：茂名石化园区倾斜摄影 / BIM 轻量化后的 3D Tiles 服务地址。
// 缺省为空 → 不加载建筑模型，仅显示卫星/矢量底图 + 风险区域。
export const BUILDING_TILESET_URL: string =
  (import.meta.env.VITE_BUILDING_TILESET_URL as string | undefined) ?? '';
// 3D Tiles 异步加载超时保护（ms）
export const BUILDING_TILESET_TIMEOUT_MS = 10000;

// 保留原离线瓦片配置（同源内网瓦片服务），作为无 VITE_MAP_TILE_URL 时的兜底占位
export const MAP_TILE_URL: string = import.meta.env.VITE_MAP_TILE_URL ?? '/tiles/{z}/{x}/{y}.png';

// 底图统一深蓝科技调色（作用于矢量/影像底图 imageryLayer）：压低亮度 + 蓝向色相偏移 + 提饱和/对比，
// 使真实世界底图融入系统深蓝基色，与两侧面板同色系；影像/夜景两种模式共用。
export const NIGHT_GRADING = {
  brightness: 0.62,
  saturation: 1.18,
  contrast: 1.16,
  hue: 0.085,
};
