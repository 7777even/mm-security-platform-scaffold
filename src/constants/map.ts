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

// 保留原离线瓦片配置（同源内网瓦片服务），作为无 VITE_MAP_TILE_URL 时的兜底占位
export const MAP_TILE_URL: string = import.meta.env.VITE_MAP_TILE_URL ?? '/tiles/{z}/{x}/{y}.png';

// one-brain 暗夜风格调色（仅作用于矢量底图 imageryLayer）：轻微降亮 + 蓝向色相偏移 + 提饱和/对比，
// 复刻 one-brain 默认「夜景」暗蓝观感（renderColor.js 默认不调色，其夜景来自 sdmap 暗色矢量层，此处以调色近似）。
export const NIGHT_GRADING = {
  brightness: 0.82,
  saturation: 1.12,
  contrast: 1.06,
  hue: 0.045,
};
