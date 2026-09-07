import { computed, ref } from 'vue';
import {
  fetchRainViewerMaps,
  pickNearestRainViewerFrame,
  type RainViewerFrame,
} from '@/services/weather/rainViewerApi';
import {
  buildLocalTickTimes,
  CN_TIMELINE_SAFE_LAG_MS,
  type CnTimeRange,
} from '@/services/weather/fengyunApi';
import { buildChinaRadarImageUrl } from '@/services/weather/chinaRadarApi';

export type SatelliteCloudMapMode = 'satellite' | 'vector' | 'typhoonPath';
export type SatelliteCloudTimeRange = CnTimeRange;

/** 雷达帧与卫星时次的匹配窗口（秒）：超出即视为该时次无真实雷达数据 */
export const RADAR_MATCH_WINDOW_SECONDS = 900;

/** 雷达回退帧的提示文案：避免值班人员把回退帧误认为该时次的真实回波 */
export const RADAR_COVERAGE_HINT = '雷达仅覆盖最近约 2 小时';

/** 时次表轮询周期（毫秒）：对齐源返回的 Cache-Control: max-age=60 */
export const WEATHER_REFRESH_INTERVAL_MS = 60_000;

/** 轮询失败后的退避上限（毫秒） */
export const WEATHER_REFRESH_MAX_BACKOFF_MS = 600_000;

export interface SatelliteCloudTimelineTick {
  id: string;
  label: string;
  position: number;
  time: number;
  /** 国内模式下不再消费 JMA 字段，保留字段以兼容既有 UI/回放代码 */
  jmaBasetime: string;
  jmaValidtime: string;
  rainViewerPath?: string;
  /** 该时次是否命中了本时次的真实雷达帧（false 表示 rainViewerPath 为回退帧） */
  radarMatched: boolean;
  isNow?: boolean;
}

const MAOMING_CENTER: [number, number] = [21.67, 110.92];
const DEFAULT_ZOOM = 5;

function formatTickLabel(unix: number): string {
  const date = new Date(unix * 1000);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * 为时间轴上的某个时次解析雷达帧（RainViewer 全球模式用）。
 * 命中 ±RADAR_MATCH_WINDOW_SECONDS 返回该帧；未命中则沿用 previousFrame，
 * 保证雷达图层连续存在而不是整层消失。
 */
export function resolveRadarFrameForTick(
  tickTime: number,
  radarFrames: RainViewerFrame[],
  previousFrame?: RainViewerFrame,
): RainViewerFrame | undefined {
  return (
    pickNearestRainViewerFrame(tickTime, radarFrames, RADAR_MATCH_WINDOW_SECONDS) ?? previousFrame
  );
}

/**
 * 判定该时次是否有本时次的真实雷达数据；无则回退文案，供来源行标注。
 * 返回 null 表示落在覆盖窗内、无需标注。
 */
export function radarCoverageLabel(
  tickTime: number,
  radarFrames: RainViewerFrame[],
): string | null {
  if (pickNearestRainViewerFrame(tickTime, radarFrames, RADAR_MATCH_WINDOW_SECONDS)) return null;
  return RADAR_COVERAGE_HINT;
}

/** 页面是否处于隐藏态：node / 非浏览器环境一律视为可见，便于单测与 SSR */
function isDocumentHidden(): boolean {
  if (typeof document === 'undefined') return false;
  return document.visibilityState === 'hidden';
}

export function useSatelliteCloudMap() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const autoRefreshError = ref<string | null>(null);
  const rainViewerHost = ref('https://tilecache.rainviewer.com');
  const radarFrames = ref<RainViewerFrame[]>([]);
  const timeRange = ref<SatelliteCloudTimeRange>('24h');
  const frameIndex = ref(0);
  const radarSource = ref<'china' | 'rainviewer'>('china');
  const rainViewerKey = ref(import.meta.env.VITE_RAINVIEWER_KEY ?? '');

  /**
   * 帧可用性锚点（unix ms，0=未初始化）：官方产品生成有 30–45 分钟延迟，
   * 时间轴末端固定回退安全滞后量，“现在”时次不再打到未生成帧（404 噪声归零）。
   */
  const anchorMs = ref(0);

  /** 时间轴本地生成（15 分钟步长），不依赖任何外源接口 */
  const visibleTickTimes = computed(() =>
    buildLocalTickTimes(timeRange.value, anchorMs.value || Date.now()),
  );

  const timelineTicks = computed<SatelliteCloudTimelineTick[]>(() => {
    const times = visibleTickTimes.value;
    const span = Math.max(times.length - 1, 1);
    return times.map((time, index) => {
      const isLast = index === times.length - 1;
      const matched = pickNearestRainViewerFrame(
        time,
        radarFrames.value,
        RADAR_MATCH_WINDOW_SECONDS,
      );
      return {
        id: `t-${time}`,
        label: isLast ? '现在' : formatTickLabel(time),
        position: index / span,
        time,
        jmaBasetime: '',
        jmaValidtime: String(time),
        rainViewerPath: matched?.path,
        radarMatched: Boolean(matched),
        isNow: isLast,
      };
    });
  });

  const timelineLabelTicks = computed(() => {
    const ticks = timelineTicks.value;
    if (ticks.length <= 8) return ticks;

    const step = Math.max(1, Math.floor(ticks.length / 7));
    return ticks.filter((tick, index) => index % step === 0 || tick.isNow);
  });

  const currentTick = computed(() => {
    const ticks = timelineTicks.value;
    if (!ticks.length) return null;
    return ticks[Math.min(frameIndex.value, ticks.length - 1)] ?? null;
  });

  const progress = computed(() => currentTick.value?.position ?? 0);

  const sourceLabel = computed(() => '中央气象台 · 风云四号B / 雷达拼图');

  const sourceDate = computed(() => {
    const tick = currentTick.value;
    if (!tick) return '--';
    return new Date(tick.time * 1000).toISOString().slice(0, 10);
  });

  const currentTimeLabel = computed(() => {
    const tick = currentTick.value;
    if (!tick) return '--:--';
    return tick.isNow ? formatTickLabel(tick.time) : tick.label;
  });

  /** 当前时次的雷达覆盖标注：国内源按 URL 回退策略兜底，不再做覆盖窗标注 */
  const radarCoverageHint = computed(() => {
    if (radarSource.value !== 'rainviewer') return null;
    const tick = currentTick.value;
    if (!tick) return null;
    return radarCoverageLabel(tick.time, radarFrames.value);
  });

  /** 国内（中央气象台）雷达当前时次图片 URL；按时间轴时次反算 */
  const chinaRadarUrl = computed(() => {
    const tick = currentTick.value;
    if (!tick) return '';
    return buildChinaRadarImageUrl(tick.time * 1000);
  });

  async function loadWeatherData() {
    loading.value = true;
    error.value = null;
    try {
      // 时间轴末端回退安全滞后量：产品生成延迟内不再打到未生成帧。
      anchorMs.value = Date.now() - CN_TIMELINE_SAFE_LAG_MS;
      frameIndex.value = Math.max(timelineTicks.value.length - 1, 0);
    } finally {
      loading.value = false;
    }
    // RainViewer 为可选全球雷达能力：拉取失败静默降级，不影响国内源。
    void fetchRainViewerMaps()
      .then((maps) => {
        rainViewerHost.value = maps.host;
        radarFrames.value = maps.radar.past;
      })
      .catch(() => {
        /* 全球雷达为可选能力，失败保持静默 */
      });
  }

  let refreshTimer: ReturnType<typeof setTimeout> | null = null;
  let refreshBackoffMs = WEATHER_REFRESH_INTERVAL_MS;
  let autoRefreshActive = false;

  function clearRefreshTimer() {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
  }

  /**
   * 刷新：重新本地生成时间轴（推进“现在”边界），并静默补拉 RainViewer。
   * 用户停留在末帧时才自动前进，避免打断历史时次的研判。
   */
  async function pullLatestFrames(): Promise<void> {
    try {
      const wasAtLatest = frameIndex.value >= timelineTicks.value.length - 1;
      anchorMs.value = Date.now() - CN_TIMELINE_SAFE_LAG_MS;
      if (wasAtLatest) {
        frameIndex.value = Math.max(timelineTicks.value.length - 1, 0);
      }
      autoRefreshError.value = null;
      refreshBackoffMs = WEATHER_REFRESH_INTERVAL_MS;
    } catch (err) {
      autoRefreshError.value = err instanceof Error ? err.message : '气象时次刷新失败';
      refreshBackoffMs = Math.min(refreshBackoffMs * 2, WEATHER_REFRESH_MAX_BACKOFF_MS);
    }
    void fetchRainViewerMaps()
      .then((maps) => {
        rainViewerHost.value = maps.host;
        radarFrames.value = maps.radar.past;
      })
      .catch(() => {
        /* 全球雷达为可选能力，失败保持静默 */
      });
  }

  function scheduleRefresh(delayMs: number) {
    clearRefreshTimer();
    refreshTimer = setTimeout(() => {
      refreshTimer = null;
      if (!autoRefreshActive || isDocumentHidden()) return;
      void pullLatestFrames().then(() => {
        if (autoRefreshActive && !isDocumentHidden()) scheduleRefresh(refreshBackoffMs);
      });
    }, delayMs);
  }

  function handleVisibilityChange() {
    if (!autoRefreshActive) return;
    if (isDocumentHidden()) {
      clearRefreshTimer();
      return;
    }
    if (refreshTimer) return;
    void pullLatestFrames().then(() => scheduleRefresh(refreshBackoffMs));
  }

  /** 启动纯前端时次轮询（60s 推进“现在”边界），无需后端配合 */
  function startAutoRefresh() {
    if (autoRefreshActive) return;
    autoRefreshActive = true;
    refreshBackoffMs = WEATHER_REFRESH_INTERVAL_MS;
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    scheduleRefresh(WEATHER_REFRESH_INTERVAL_MS);
  }

  function stopAutoRefresh() {
    autoRefreshActive = false;
    clearRefreshTimer();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
    refreshBackoffMs = WEATHER_REFRESH_INTERVAL_MS;
  }

  function setTimeRange(range: SatelliteCloudTimeRange) {
    timeRange.value = range;
    frameIndex.value = Math.max(timelineTicks.value.length - 1, 0);
  }

  function setRadarSource(src: 'china' | 'rainviewer') {
    radarSource.value = src;
  }

  function setProgress(position: number) {
    const ticks = timelineTicks.value;
    if (!ticks.length) return;

    let nearestIndex = 0;
    let minDistance = Infinity;
    ticks.forEach((tick, index) => {
      const distance = Math.abs(tick.position - position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });
    frameIndex.value = nearestIndex;
  }

  function stepFrame(delta: number) {
    const ticks = timelineTicks.value;
    if (!ticks.length) return;
    frameIndex.value = (frameIndex.value + delta + ticks.length) % ticks.length;
  }

  function resetPlayback() {
    timeRange.value = '24h';
    frameIndex.value = Math.max(timelineTicks.value.length - 1, 0);
  }

  return {
    loading,
    error,
    autoRefreshError,
    rainViewerHost,
    radarSource,
    rainViewerKey,
    chinaRadarUrl,
    timelineTicks,
    timelineLabelTicks,
    currentTick,
    radarCoverageHint,
    progress,
    sourceLabel,
    sourceDate,
    currentTimeLabel,
    timeRange,
    frameIndex,
    mapCenter: MAOMING_CENTER,
    mapZoom: DEFAULT_ZOOM,
    loadWeatherData,
    setTimeRange,
    setRadarSource,
    setProgress,
    stepFrame,
    resetPlayback,
    startAutoRefresh,
    stopAutoRefresh,
  };
}
