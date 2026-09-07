/**
 * 中央气象台（nmc.cn）降雨雷达 —— 免密钥、国内可达的默认雷达源。
 *
 * 产品：SWAN 全国雷达拼图 EZ9（SEVP_NMC_RDCP_SWAN_EZ9_ACHN_LNO_P9）。
 * 实测（2026-09）：
 *   URL  https://image.nmc.cn/product/{YYYY}/{MM}/{DD}/RDCP/SEVP_NMC_RDCP_SWAN_EZ9_ACHN_LNO_P9_{UTC_TS}000.PNG
 *   分辨率 3328×2560（约 2km/px），6 分钟帧，UTC 时间戳，直连 200。
 * 配准：与中央气象台台风网 gis.js addRadarImg ≥2023 参数一致（SWAN 产品的官方标定）。
 * 展示：Leaflet imageOverlay 仅以 <img src> 展示，不需要 CORS；加载失败由调用方回退更早时次。
 */

/**
 * ACHN（全国拼图）产品官方地理配准（中央气象台台风网 gis.js ≥2023 参数）。
 * 雷达与风云卫星 ACHN 产品共用同一范围。
 */
export const CHINA_RADAR_BOUNDS: L.LatLngBoundsExpression = [
  [11.1784, 67.5],
  [55.7766, 140.625],
];

/** 雷达帧间隔（毫秒）：SWAN 拼图每 6 分钟一帧（生成存在数分钟级延迟，由回退策略兜底） */
export const CHINA_RADAR_STEP_MS = 6 * 60 * 1000;

/** 单次回退最多尝试的更早时次数量（12 × 6min = 72 分钟窗口） */
export const CHINA_RADAR_MAX_BACKOFF = 12;

/** 将时间戳向下取整到 6 分钟边界 */
export function floorTo6Min(unixMs: number): number {
  const totalMin = Math.floor(unixMs / 60000);
  return Math.floor(totalMin / 6) * 6 * 60000;
}

function pad(n: number, width = 2): string {
  return String(n).padStart(width, '0');
}

/**
 * 由 UTC 毫秒构造 SWAN 全国雷达拼图 URL。
 * 仅使用 UTC 字段（getUTC*），与文件名字段时间戳保持一致。
 */
export function buildChinaRadarImageUrl(unixMs: number): string {
  const floored = new Date(floorTo6Min(unixMs));
  const yyyy = floored.getUTCFullYear();
  const mm = pad(floored.getUTCMonth() + 1);
  const dd = pad(floored.getUTCDate());
  const hh = pad(floored.getUTCHours());
  const mi = pad(floored.getUTCMinutes());
  const ts = `${yyyy}${mm}${dd}${hh}${mi}00`;
  return `https://image.nmc.cn/product/${yyyy}/${mm}/${dd}/RDCP/SEVP_NMC_RDCP_SWAN_EZ9_ACHN_LNO_P9_${ts}000.PNG`;
}

/** 当前时刻最新一帧的 URL（UTC 向下取整到 6 分钟） */
export function latestChinaRadarImageUrl(): string {
  return buildChinaRadarImageUrl(Date.now());
}

/** 由基准时刻回退 step 个 6 分钟时次得到的 URL（step=0 即基准本身） */
export function chinaRadarImageUrlByBackstep(baseUnixMs: number, step: number): string {
  return buildChinaRadarImageUrl(floorTo6Min(baseUnixMs) - step * CHINA_RADAR_STEP_MS);
}
