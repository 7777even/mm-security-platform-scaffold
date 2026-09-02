import { computed, ref } from 'vue';
import {
  fetchTyphoonDetail,
  fetchTyphoonYearList,
  getTyphoonAgencyColor,
  normalizeTyphoonCoord,
  type IstrongTyphoonDetail,
  type IstrongTyphoonPoint,
  type IstrongTyphoonSummary,
} from '../weather/istrongcloudTyphoonApi';

export interface TyphoonTrackPointInfo {
  id: string;
  lat: number;
  lng: number;
  time: string;
  strong: string;
  power: number;
  pressure: number | null;
  speed: number;
  moveSpeed: string | number | null;
  moveDir: string | null;
  agency?: string;
  isForecast: boolean;
}

export interface TyphoonAgencyForecastLine {
  agency: string;
  color: string;
  coords: [number, number][];
  points: TyphoonTrackPointInfo[];
}

export interface TyphoonTrackViewModel {
  tfbh: string;
  name: string;
  ename: string;
  isActive: boolean;
  observedCoords: [number, number][];
  observedPoints: TyphoonTrackPointInfo[];
  forecastLines: TyphoonAgencyForecastLine[];
  agencies: string[];
}

function mapPoint(
  point: IstrongTyphoonPoint,
  options: { agency?: string; isForecast: boolean; id: string },
): TyphoonTrackPointInfo | null {
  const coord = normalizeTyphoonCoord(point);
  if (!coord) return null;
  return {
    id: options.id,
    lat: coord[0],
    lng: coord[1],
    time: point.time,
    strong: point.strong,
    power: point.power,
    pressure: point.pressure,
    speed: point.speed,
    moveSpeed: point.move_speed,
    moveDir: point.move_dir,
    agency: options.agency,
    isForecast: options.isForecast,
  };
}

function buildForecastLines(
  points: IstrongTyphoonPoint[],
  observedCoords: [number, number][],
): TyphoonAgencyForecastLine[] {
  if (!observedCoords.length) return [];

  const start = observedCoords[observedCoords.length - 1]!;
  const agencyLines = new Map<string, TyphoonAgencyForecastLine>();

  for (let index = points.length - 1; index >= 0; index -= 1) {
    const point = points[index];
    if (!point?.forecast?.length) continue;

    for (const forecast of point.forecast) {
      if (agencyLines.has(forecast.sets)) continue;

      const forecastPoints: TyphoonTrackPointInfo[] = [];
      const coords: [number, number][] = [start];
      forecast.points.forEach((forecastPoint, pointIndex) => {
        const mapped = mapPoint(forecastPoint, {
          id: `fc-${forecast.sets}-${pointIndex}`,
          agency: forecast.sets,
          isForecast: true,
        });
        if (!mapped) return;
        forecastPoints.push(mapped);
        coords.push([mapped.lat, mapped.lng]);
      });

      if (coords.length > 1) {
        agencyLines.set(forecast.sets, {
          agency: forecast.sets,
          color: getTyphoonAgencyColor(forecast.sets),
          coords,
          points: forecastPoints,
        });
      }
    }
  }

  return [...agencyLines.values()].sort((a, b) => {
    const order = ['中国', '日本', '美国', '韩国', '欧洲', '中国香港', '中国台湾'];
    const aIndex = order.indexOf(a.agency);
    const bIndex = order.indexOf(b.agency);
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });
}

export function buildTyphoonTrackViewModel(detail: IstrongTyphoonDetail): TyphoonTrackViewModel {
  const observedPoints: TyphoonTrackPointInfo[] = [];
  const observedCoords: [number, number][] = [];

  detail.points.forEach((point, index) => {
    const mapped = mapPoint(point, {
      id: `obs-${index}`,
      isForecast: false,
    });
    if (!mapped) return;
    observedPoints.push(mapped);
    observedCoords.push([mapped.lat, mapped.lng]);
  });

  const forecastLines = buildForecastLines(detail.points, observedCoords);
  const agencies = forecastLines.map((line) => line.agency);

  return {
    tfbh: detail.tfbh,
    name: detail.name,
    ename: detail.ename,
    isActive: detail.is_current === 1,
    observedCoords,
    observedPoints,
    forecastLines,
    agencies,
  };
}

export function formatTyphoonPopupHtml(point: TyphoonTrackPointInfo): string {
  const rows = [
    ['时间', point.time.replace('T', ' ')],
    ['强度', point.strong],
    ['气压', point.pressure != null ? `${point.pressure} hPa` : '--'],
    ['风速', `${point.speed} m/s`],
    ['风力', `${point.power} 级`],
    ['移速', point.moveSpeed != null && point.moveSpeed !== '' ? `${point.moveSpeed} km/h` : '--'],
    ['移向', point.moveDir || '--'],
  ];
  if (point.agency) rows.unshift(['预报机构', point.agency]);
  if (point.isForecast) rows.unshift(['类型', '预报点']);

  return `
    <div style="min-width:180px;font-size:12px;line-height:1.5;color:#eaf2ff;">
      ${rows
        .map(
          ([label, value]) =>
            `<div style="display:flex;justify-content:space-between;gap:12px;padding:2px 0;"><span style="color:#9eb0c8;">${label}</span><strong style="font-weight:500;">${value}</strong></div>`,
        )
        .join('')}
    </div>
  `;
}

function resolveInitialCode(list: IstrongTyphoonSummary[], preferredCode?: string): string | null {
  if (!list.length) return null;
  if (preferredCode) return preferredCode;
  const active = list.find((item) => item.is_current === 1);
  if (active) return active.tfbh;
  return list[0]!.tfbh;
}

async function ensurePreferredInList(
  list: IstrongTyphoonSummary[],
  preferredCode?: string,
): Promise<IstrongTyphoonSummary[]> {
  if (!preferredCode || list.some((item) => item.tfbh === preferredCode)) {
    return list;
  }

  try {
    const detail = await fetchTyphoonDetail(preferredCode);
    const summary: IstrongTyphoonSummary = {
      tfbh: detail.tfbh,
      ident: detail.ident,
      name: detail.name,
      ename: detail.ename,
      is_current: detail.is_current,
      begin_time: detail.begin_time,
      end_time: detail.end_time,
      land: detail.land,
    };
    return [summary, ...list];
  } catch {
    return list;
  }
}

function sortTyphoonList(
  list: IstrongTyphoonSummary[],
  preferredCode?: string,
): IstrongTyphoonSummary[] {
  return [...list].sort((a, b) => {
    if (preferredCode) {
      if (a.tfbh === preferredCode && b.tfbh !== preferredCode) return -1;
      if (b.tfbh === preferredCode && a.tfbh !== preferredCode) return 1;
    }
    if (a.is_current !== b.is_current) {
      return b.is_current - a.is_current;
    }
    return b.begin_time.localeCompare(a.begin_time);
  });
}

export function useTyphoonTrackMap(initialCode?: () => string | undefined) {
  const loading = ref(false);
  const listLoading = ref(false);
  const error = ref<string | null>(null);
  const track = ref<TyphoonTrackViewModel | null>(null);
  const historyList = ref<IstrongTyphoonSummary[]>([]);
  const selectedCode = ref<string | null>(null);
  const trackSeq = ref(0);
  const listSeq = ref(0);
  const trackRequestedCode = ref<string | null>(null);

  const activeTyphoon = computed(
    () => historyList.value.find((item) => item.is_current === 1) ?? null,
  );
  const hasActiveTyphoon = computed(() => Boolean(activeTyphoon.value));

  const title = computed(() => {
    if (!track.value) return '台风路径';
    return `${track.value.name} (${track.value.ename})`;
  });

  const subtitle = computed(() => {
    if (!track.value) return '';
    const statusText = track.value.isActive ? '活跃台风' : '历史台风';
    const agencyText = track.value.agencies.length
      ? ` · 预报：${track.value.agencies.join('、')}`
      : '';
    return `${track.value.tfbh} · ${statusText}${agencyText}`;
  });

  async function loadTyphoonTrack(code?: string) {
    const tfbh = code ?? selectedCode.value;
    if (!tfbh) return;

    const seq = ++trackSeq.value;
    trackRequestedCode.value = tfbh;
    loading.value = true;
    error.value = null;
    try {
      const detail = await fetchTyphoonDetail(tfbh);
      if (seq !== trackSeq.value) return;
      if (trackRequestedCode.value !== tfbh) return;
      selectedCode.value = tfbh;
      track.value = buildTyphoonTrackViewModel(detail);
    } catch (err) {
      if (seq !== trackSeq.value) return;
      if (trackRequestedCode.value !== tfbh) return;
      track.value = null;
      error.value = err instanceof Error ? err.message : '台风路径加载失败';
    } finally {
      if (seq === trackSeq.value) loading.value = false;
    }
  }

  async function loadTyphoonHistory(year = new Date().getFullYear(), preferredCode?: string) {
    listLoading.value = true;
    error.value = null;
    try {
      const seq = ++listSeq.value;
      let list = await fetchTyphoonYearList(year);
      list = await ensurePreferredInList(list, preferredCode ?? initialCode?.());
      const preferred = preferredCode ?? initialCode?.();
      historyList.value = sortTyphoonList(list, preferred);

      // 只在“尚未选中过台风”时，才加载默认台风；避免覆盖用户点击造成“点A跳B”
      if (!selectedCode.value) {
        const initial = resolveInitialCode(historyList.value, preferred);
        if (initial) await loadTyphoonTrack(initial);
      }

      if (seq !== listSeq.value) return;
    } catch (err) {
      historyList.value = [];
      error.value = err instanceof Error ? err.message : '台风列表加载失败';
    } finally {
      listLoading.value = false;
    }
  }

  async function selectTyphoon(code: string) {
    if (selectedCode.value === code && track.value?.tfbh === code) return;
    // 先占位选中，避免列表点击后被正在进行的“初始化加载”覆盖
    selectedCode.value = code;
    await loadTyphoonTrack(code);
  }

  async function initializeTyphoonData() {
    await loadTyphoonHistory(new Date().getFullYear(), initialCode?.());
  }

  function resetTyphoonState() {
    loading.value = false;
    listLoading.value = false;
    error.value = null;
    track.value = null;
    historyList.value = [];
    selectedCode.value = null;
    trackSeq.value += 1;
    listSeq.value += 1;
    trackRequestedCode.value = null;
  }

  return {
    loading,
    listLoading,
    error,
    track,
    historyList,
    selectedCode,
    activeTyphoon,
    hasActiveTyphoon,
    title,
    subtitle,
    loadTyphoonTrack,
    loadTyphoonHistory,
    selectTyphoon,
    initializeTyphoonData,
    resetTyphoonState,
  };
}
