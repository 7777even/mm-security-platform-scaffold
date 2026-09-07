/**
 * NASA GIBS 葵花（Himawari AHI）红外瓦片与时次服务。
 *
 * 图层与矩阵集经 WMTSCapabilities 实测确认（2026-09）：
 * - `Himawari_AHI_Band13_Clean_Infrared` → `GoogleMapsCompatible_Level6`，最大层级 6，PNG，10 分钟一档。
 * - 仓库早期引用的 `..._v0_NRT` 图层在 GIBS 上不存在（`LAYER does not exist`），不要复用。
 * - `gibs.earthdata.nasa.gov` 返回 `Access-Control-Allow-Origin: *`，允许浏览器直连。
 */

export const GIBS_WMTS_BASE = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857';
export const GIBS_HIMAWARI_IR_LAYER = 'Himawari_AHI_Band13_Clean_Infrared';
export const GIBS_TILE_MATRIX_SET = 'GoogleMapsCompatible_Level6';
export const GIBS_MAX_ZOOM = 6;

/** 单次展开时次的硬上限，防御异常 Domain 造成死循环 */
const MAX_EXPANDED_TIMES = 2000;

const DEFAULT_STEP_MS = 600_000;

function toIsoZ(ms: number): string {
  return new Date(ms).toISOString().replace('.000Z', 'Z');
}

/** ISO8601 时长 → 毫秒，支持 PT10M / PT1H / P1D，其余回落 10 分钟 */
function stepToMillis(step: string | undefined): number {
  if (!step) return DEFAULT_STEP_MS;

  const minute = /^PT(\d+)M$/.exec(step);
  if (minute?.[1]) return Number(minute[1]) * 60_000;

  const hour = /^PT(\d+)H$/.exec(step);
  if (hour?.[1]) return Number(hour[1]) * 3_600_000;

  const day = /^P(\d+)D$/.exec(step);
  if (day?.[1]) return Number(day[1]) * 86_400_000;

  return DEFAULT_STEP_MS;
}

export function formatGibsQueryDate(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function buildGibsDescribeDomainsUrl(date = new Date()): string {
  const url = new URL(`${GIBS_WMTS_BASE}/all/wmts.cgi`);
  url.searchParams.set('SERVICE', 'WMTS');
  url.searchParams.set('REQUEST', 'DescribeDomains');
  url.searchParams.set('VERSION', '1.0.0');
  url.searchParams.set('LAYER', GIBS_HIMAWARI_IR_LAYER);
  url.searchParams.set('TIME', `${formatGibsQueryDate(date)}T00:00:00Z`);
  return url.toString();
}

/** GIBS WMTS REST 为 z/y/x 顺序，与常见 z/x/y 相反 */
export function buildGibsTileUrl(time: string, z: number, x: number, y: number): string {
  return `${GIBS_WMTS_BASE}/best/${GIBS_HIMAWARI_IR_LAYER}/default/${time}/${GIBS_TILE_MATRIX_SET}/${z}/${y}/${x}.png`;
}

export function parseGibsTimeDomain(domain: string): string[] {
  const times: string[] = [];

  for (const segment of domain.split(',')) {
    const trimmed = segment.trim();
    if (!trimmed) continue;

    const [start, end, step] = trimmed.split('/');
    if (!start) continue;

    const startMs = Date.parse(start);
    if (!Number.isFinite(startMs)) continue;

    if (!end || start === end) {
      times.push(toIsoZ(startMs));
      continue;
    }

    const endMs = Date.parse(end);
    if (!Number.isFinite(endMs)) continue;

    const stepMs = stepToMillis(step);
    for (
      let cursor = startMs;
      cursor <= endMs && times.length < MAX_EXPANDED_TIMES;
      cursor += stepMs
    ) {
      times.push(toIsoZ(cursor));
    }
  }

  return times;
}

export async function fetchGibsHimawariTimes(date = new Date()): Promise<string[]> {
  const response = await fetch(buildGibsDescribeDomainsUrl(date));
  if (!response.ok) {
    throw new Error(`GIBS DescribeDomains 请求失败: ${response.status}`);
  }

  const xml = await response.text();
  const domainMatch = xml.match(/<Domain>([^<]+)<\/Domain>/);
  if (!domainMatch?.[1]) return [];

  return parseGibsTimeDomain(domainMatch[1]);
}

export function pickNearestGibsTime(targetUnix: number, times: string[]): string | undefined {
  if (!times.length) return undefined;

  let nearest = times[0]!;
  let minDistance = Infinity;
  for (const iso of times) {
    const distance = Math.abs(Date.parse(iso) - targetUnix * 1000);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = iso;
    }
  }
  return nearest;
}
