export const GIBS_WMS_URL = 'https://gibs.earthdata.nasa.gov/wms/epsg3857/all/wms.cgi';
export const GIBS_HIMWARI_LAYER = 'Himawari_AHI_Band13_Clean_Infrared_v0_NRT';
export const GIBS_DESCRIBE_DOMAINS_URL =
  'https://gibs.earthdata.nasa.gov/wmts/epsg3857/all/wmts.cgi';

export function formatGibsQueryDate(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function parseGibsTimeDomain(domain: string): string[] {
  const times: string[] = [];
  for (const segment of domain.split(',')) {
    const trimmed = segment.trim();
    if (!trimmed) continue;

    const [start, end, step] = trimmed.split('/');
    if (!start) continue;

    if (!end || start === end) {
      times.push(start);
      continue;
    }

    const stepMinutes = step?.startsWith('PT') ? Number.parseInt(step.slice(2), 10) : 10;
    const intervalMs = Number.isFinite(stepMinutes) ? stepMinutes * 60_000 : 600_000;
    let cursor = Date.parse(start);
    const endMs = Date.parse(end);
    if (!Number.isFinite(cursor) || !Number.isFinite(endMs)) continue;

    while (cursor <= endMs) {
      times.push(new Date(cursor).toISOString().replace('.000Z', 'Z'));
      cursor += intervalMs;
    }
  }
  return times;
}

export async function fetchGibsSatelliteTimes(date = new Date()): Promise<string[]> {
  const queryDate = formatGibsQueryDate(date);
  const url = new URL(GIBS_DESCRIBE_DOMAINS_URL);
  url.searchParams.set('SERVICE', 'WMTS');
  url.searchParams.set('REQUEST', 'DescribeDomains');
  url.searchParams.set('VERSION', '1.0.0');
  url.searchParams.set('LAYER', GIBS_HIMWARI_LAYER);
  url.searchParams.set('TIME', `${queryDate}T00:00:00Z`);

  const response = await fetch(url);
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
