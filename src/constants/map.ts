// S1 §9.1 / §9.4 离线部署：地图瓦片默认同源离线瓦片（不请求公网），由部署环境提供内网瓦片服务。
// 开发态如需公网 OSM / Carto 预览，可设 VITE_MAP_TILE_URL=https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png
// 并相应放宽 vite.config 的 CSP img-src（仅开发态；生产必须同源内网）。
export const MAP_TILE_URL: string = import.meta.env.VITE_MAP_TILE_URL ?? '/tiles/{z}/{x}/{y}.png';
