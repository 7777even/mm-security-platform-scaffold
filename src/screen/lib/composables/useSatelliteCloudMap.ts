import { computed, ref } from 'vue';
import {
  fetchRainViewerMaps,
  pickNearestRainViewerFrame,
  type RainViewerFrame,
} from '../weather/rainViewerApi';
import {
  buildLocalTickTimes,
  CN_TIMELINE_SAFE_LAG_MS,
  type CnTimeRange,
} from '@/services/weather/fengyunApi';
import { buildChinaRadarImageUrl } from '@/services/weather/chinaRadarApi';

export type SatelliteCloudMapMode = 'satellite' | 'vector' | 'typhoonPath';
export type SatelliteCloudTimeRange = CnTimeRange;

export interface SatelliteCloudTimelineTick {
  id: string;
  label: string;
  position: number;
  time: number;
  /** 国内模式下不再消费 JMA 字段，保留字段以兼容既有 UI/回放代码 */
  jmaBasetime: string;
  jmaValidtime: string;
  rainViewerPath?: string;
  isNow?: boolean;
}

const MAOMING_CENTER: [number, number] = [21.67, 110.92];
const DEFAULT_ZOOM = 5;

function formatTickLabel(unix: number): string {
  const date = new Date(unix * 1000);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function useSatelliteCloudMap() {
  const loading = ref(false);
  const error = ref<string | null>(null);
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
      return {
        id: `t-${time}`,
        label: isLast ? '现在' : formatTickLabel(time),
        position: index / span,
        time,
        jmaBasetime: '',
        jmaValidtime: String(time),
        rainViewerPath: pickNearestRainViewerFrame(time, radarFrames.value)?.path,
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

  /** 国内（中央气象台）雷达当前时次图片 URL；按时间轴时次反算 */
  const chinaRadarUrl = computed(() => {
    const tick = currentTick.value;
    if (!tick) return '';
    return buildChinaRadarImageUrl(tick.time * 1000);
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
    rainViewerHost,
    radarSource,
    rainViewerKey,
    chinaRadarUrl,
    timelineTicks,
    timelineLabelTicks,
    currentTick,
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
  };
}
