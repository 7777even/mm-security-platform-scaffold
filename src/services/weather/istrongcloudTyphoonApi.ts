export const ISTRONG_TYPHOON_LIST_URL = 'https://data.istrongcloud.com/v2/data/complex';

export interface IstrongTyphoonLandfall {
  position: string;
  land_time: string;
  lng: string | number;
  lat: string | number;
}

export interface IstrongTyphoonSummary {
  tfbh: string;
  ident: string;
  name: string;
  ename: string;
  is_current: number;
  begin_time: string;
  end_time: string;
  land: IstrongTyphoonLandfall[];
}

export interface IstrongTyphoonPoint {
  time: string;
  lng: number | string;
  lat: number | string;
  strong: string;
  power: number;
  pressure: number | null;
  speed: number;
  move_speed: string | number | null;
  move_dir: string | null;
  radius7?: number | null;
  radius10?: number | null;
  radius12?: number | null;
  remark?: string | null;
  forecast?: Array<{
    sets: string;
    points: IstrongTyphoonPoint[];
  }> | null;
}

export interface IstrongTyphoonDetail extends IstrongTyphoonSummary {
  points: IstrongTyphoonPoint[];
}

export const TYPHOON_AGENCY_COLORS: Record<string, string> = {
  中国: '#ff5c5c',
  美国: '#4da3ff',
  日本: '#5ad86a',
  韩国: '#b86cff',
  欧洲: '#ffd64a',
  中国香港: '#ff9f43',
  中国台湾: '#ff7eb3',
};

const DEFAULT_AGENCY_COLOR = '#c8d4e8';

export function getTyphoonAgencyColor(agency: string): string {
  return TYPHOON_AGENCY_COLORS[agency] ?? DEFAULT_AGENCY_COLOR;
}

function toNumber(value: number | string | null | undefined): number {
  if (value == null || value === '') return NaN;
  return typeof value === 'number' ? value : Number.parseFloat(value);
}

export function normalizeTyphoonCoord(
  point: Pick<IstrongTyphoonPoint, 'lat' | 'lng'>,
): [number, number] | null {
  const lat = toNumber(point.lat);
  const lng = toNumber(point.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

export async function fetchTyphoonYearList(
  year = new Date().getFullYear(),
): Promise<IstrongTyphoonSummary[]> {
  const response = await fetch(`${ISTRONG_TYPHOON_LIST_URL}/${year}.json`);
  if (!response.ok) {
    throw new Error(`台风列表请求失败: ${response.status}`);
  }
  return response.json() as Promise<IstrongTyphoonSummary[]>;
}

export async function fetchTyphoonDetail(tfbh: string): Promise<IstrongTyphoonDetail> {
  const response = await fetch(`${ISTRONG_TYPHOON_LIST_URL}/${tfbh}.json`);
  if (!response.ok) {
    throw new Error(`台风路径请求失败: ${response.status}`);
  }
  const payload = (await response.json()) as IstrongTyphoonDetail[];
  const detail = payload[0];
  if (!detail?.points?.length) {
    throw new Error('台风路径数据为空');
  }
  return detail;
}

function countForecastAgencies(detail: IstrongTyphoonDetail): number {
  const agencies = new Set<string>();
  for (const point of detail.points) {
    point.forecast?.forEach((item) => agencies.add(item.sets));
  }
  return agencies.size;
}

export async function fetchTyphoonDetailWithForecasts(
  preferredCode?: string,
  year = new Date().getFullYear(),
): Promise<IstrongTyphoonDetail> {
  let bestDetail: IstrongTyphoonDetail | null = null;
  let bestAgencyCount = 0;

  const consider = async (code: string) => {
    const detail = await fetchTyphoonDetail(code);
    const agencyCount = countForecastAgencies(detail);
    if (!bestDetail || agencyCount > bestAgencyCount) {
      bestDetail = detail;
      bestAgencyCount = agencyCount;
    }
    return agencyCount;
  };

  if (preferredCode) {
    await consider(preferredCode);
    if (bestAgencyCount >= 2) return bestDetail!;
  } else {
    const autoCode = await resolveTyphoonCode(undefined, year);
    await consider(autoCode);
  }

  const list = await fetchTyphoonYearList(year);
  const active = list.find((item) => item.is_current === 1);
  if (active) {
    const activeCount = await consider(active.tfbh);
    if (activeCount >= 2) return bestDetail!;
  }

  for (const item of list.slice(0, 20)) {
    if (item.tfbh === preferredCode) continue;
    const agencyCount = await consider(item.tfbh);
    if (agencyCount >= 6) break;
  }

  if (!bestDetail) {
    throw new Error('未找到可用台风路径数据');
  }
  return bestDetail;
}

export async function resolveTyphoonCode(
  preferredCode?: string,
  year = new Date().getFullYear(),
): Promise<string> {
  if (preferredCode) return preferredCode;

  const list = await fetchTyphoonYearList(year);
  if (!list.length) {
    throw new Error(`${year} 年暂无台风数据`);
  }

  const active = list.find((item) => item.is_current === 1);
  if (active) return active.tfbh;

  const nearSouthChina = list.find((item) =>
    item.land?.some((land) => {
      const lat = toNumber(land.lat);
      const lng = toNumber(land.lng);
      return lat >= 18 && lat <= 25 && lng >= 105 && lng <= 120;
    }),
  );
  if (nearSouthChina) return nearSouthChina.tfbh;

  return list[0]!.tfbh;
}
