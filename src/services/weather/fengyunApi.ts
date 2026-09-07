/**
 * 中央气象台（nmc.cn）风云四号 B 星真彩云图 —— 免密钥、国内可达的默认卫星云图源。
 *
 * 产品：FY4B ETCC（真彩）全国区 ACHN（SEVP_NSMC_WXBL_FY4B_ETCC_ACHN_LNO_PY）。
 * 实测（2026-09）：
 *   URL  https://image.nmc.cn/product/{YYYY}/{MM}/{DD}/WXBL/medium/SEVP_NSMC_WXBL_FY4B_ETCC_ACHN_LNO_PY_{UTC_TS}000.JPG
 *   分辨率 860×540（medium），15 分钟一帧，UTC 时间戳，直连 200。
 * 配准：ACHN 产品与雷达共用官方范围（中央气象台台风网 gis.js ≥2019 卫星参数）。
 * 注意：真彩产品夜间无新帧（该通道依赖可见光），回退策略会沿用更早白天帧。
 */

import { CHINA_RADAR_BOUNDS } from './chinaRadarApi';

/** 风云 ACHN 产品与雷达拼图共用官方配准范围 */
export const FY4B_BOUNDS: L.LatLngBoundsExpression = CHINA_RADAR_BOUNDS;

/** 风云真彩帧间隔（毫秒）：15 分钟一帧 */
export const FY4B_STEP_MS = 15 * 60 * 1000;

/** 卫星帧单次回退最多尝试的更早时次数量（8 × 15min = 2 小时窗口） */
export const FY4B_MAX_BACKOFF = 8;

/** 本地时间轴步长（秒）：与卫星帧节奏一致，雷达按 6 分钟独立回退 */
export const CN_TIMELINE_STEP_SECONDS = 15 * 60;

/** 将时间戳向下取整到 15 分钟边界 */
export function floorTo15Min(unixMs: number): number {
  const totalMin = Math.floor(unixMs / 60000);
  return Math.floor(totalMin / 15) * 15 * 60000;
}

function pad(n: number, width = 2): string {
  return String(n).padStart(width, '0');
}

/**
 * 由 UTC 毫秒构造 FY4B 真彩云图 URL。
 * 仅使用 UTC 字段（getUTC*），与文件名字段时间戳保持一致。
 */
export function buildFy4bImageUrl(unixMs: number): string {
  const floored = new Date(floorTo15Min(unixMs));
  const yyyy = floored.getUTCFullYear();
  const mm = pad(floored.getUTCMonth() + 1);
  const dd = pad(floored.getUTCDate());
  const hh = pad(floored.getUTCHours());
  const mi = pad(floored.getUTCMinutes());
  const ts = `${yyyy}${mm}${dd}${hh}${mi}00`;
  return `https://image.nmc.cn/product/${yyyy}/${mm}/${dd}/WXBL/medium/SEVP_NSMC_WXBL_FY4B_ETCC_ACHN_LNO_PY_${ts}000.JPG`;
}

/** 由基准时刻回退 step 个 15 分钟时次得到的 URL（step=0 即基准本身） */
export function fy4bImageUrlByBackstep(baseUnixMs: number, step: number): string {
  return buildFy4bImageUrl(floorTo15Min(baseUnixMs) - step * FY4B_STEP_MS);
}

export type CnTimeRange = '24h' | '6h' | 'current';

/**
 * 本地生成时间轴时次（unix 秒，升序）：
 * 末端为最近一个 15 分钟整点，向前按范围展开（24h=96 帧 / 6h=24 帧 / current=最近 2 小时 8 帧）。
 * 全程零网络请求，外源不可达不再影响时间轴。
 */
export function buildLocalTickTimes(range: CnTimeRange, nowMs = Date.now()): number[] {
  const latest = floorTo15Min(nowMs);
  const stepSec = CN_TIMELINE_STEP_SECONDS;
  if (range === 'current') {
    const count = 8;
    return Array.from({ length: count }, (_, i) =>
      Math.floor((latest - (count - 1 - i) * stepSec * 1000) / 1000),
    );
  }
  const count = range === '6h' ? (6 * 3600) / stepSec : (24 * 3600) / stepSec;
  return Array.from({ length: count }, (_, i) =>
    Math.floor((latest - (count - 1 - i) * stepSec * 1000) / 1000),
  );
}

/**
 * 时间轴安全滞后（毫秒）：官方产品从观测到发布有 30–45 分钟生成延迟，
 * 时间轴末端固定回退该量级，保证“现在”时次的雷达/卫星帧必然已生成。
 * 说明：image.nmc.cn 的 404 响应不带 CORS 头，任何运行时探测（fetch/img）
 * 都会打进浏览器控制台，故这里用静态滞后而非运行时探测。
 */
export const CN_TIMELINE_SAFE_LAG_MS = 45 * 60 * 1000;
