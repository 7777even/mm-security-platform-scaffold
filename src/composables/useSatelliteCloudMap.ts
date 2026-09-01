import { computed, ref } from 'vue';
import { fetchJmaHimawariFrames, type JmaHimawariFrame } from '@/services/weather/jmaHimawariApi';
import {
  fetchRainViewerMaps,
  pickNearestRainViewerFrame,
  type RainViewerFrame,
} from '@/services/weather/rainViewerApi';

export type SatelliteCloudMapMode = 'satellite' | 'vector' | 'typhoonPath';
export type SatelliteCloudTimeRange = '24h' | '6h' | 'current';

export interface SatelliteCloudTimelineTick {
  id: string;
  label: string;
  position: number;
  time: number;
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

function filterJmaFramesByRange(
  frames: JmaHimawariFrame[],
  range: SatelliteCloudTimeRange,
): JmaHimawariFrame[] {
  if (!frames.length) return [];
  if (range === 'current') return [frames[frames.length - 1]!];

  const latest = frames[frames.length - 1]!.time;
  const windowSeconds = range === '6h' ? 6 * 3600 : 24 * 3600;
  const minTime = latest - windowSeconds;
  const filtered = frames.filter((frame) => frame.time >= minTime);
  return filtered.length ? filtered : frames;
}

function buildTimelineTicks(
  frames: JmaHimawariFrame[],
  radarFrames: RainViewerFrame[],
): SatelliteCloudTimelineTick[] {
  if (!frames.length) return [];

  const first = frames[0]!.time;
  const last = frames[frames.length - 1]!.time;
  const span = Math.max(last - first, 1);

  return frames.map((frame, index) => {
    const isLast = index === frames.length - 1;
    const nearestRadar = pickNearestRainViewerFrame(frame.time, radarFrames);
    return {
      id: `frame-${frame.validtime}`,
      label: isLast ? '现在' : formatTickLabel(frame.time),
      position: (frame.time - first) / span,
      time: frame.time,
      jmaBasetime: frame.basetime,
      jmaValidtime: frame.validtime,
      rainViewerPath: nearestRadar?.path,
      isNow: isLast,
    };
  });
}

export function useSatelliteCloudMap() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const rainViewerHost = ref('https://tilecache.rainviewer.com');
  const jmaFrames = ref<JmaHimawariFrame[]>([]);
  const radarFrames = ref<RainViewerFrame[]>([]);
  const timeRange = ref<SatelliteCloudTimeRange>('24h');
  const frameIndex = ref(0);

  const visibleFrames = computed(() => filterJmaFramesByRange(jmaFrames.value, timeRange.value));

  const timelineTicks = computed(() => buildTimelineTicks(visibleFrames.value, radarFrames.value));

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

  const sourceLabel = computed(() => '日本气象厅葵花卫星 · 降雨雷达');

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
      const [rainViewer, satelliteFrames] = await Promise.all([
        fetchRainViewerMaps(),
        fetchJmaHimawariFrames(),
      ]);
      rainViewerHost.value = rainViewer.host;
      jmaFrames.value = satelliteFrames;
      radarFrames.value = rainViewer.radar.past;
      frameIndex.value = Math.max(
        filterJmaFramesByRange(satelliteFrames, timeRange.value).length - 1,
        0,
      );
    } catch (err) {
      error.value = err instanceof Error ? err.message : '气象数据加载失败';
      jmaFrames.value = [];
      radarFrames.value = [];
      frameIndex.value = 0;
    } finally {
      loading.value = false;
    }
  }

  function setTimeRange(range: SatelliteCloudTimeRange) {
    timeRange.value = range;
    const ticks = filterJmaFramesByRange(jmaFrames.value, range);
    frameIndex.value = Math.max(ticks.length - 1, 0);
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
    const ticks = filterJmaFramesByRange(jmaFrames.value, '24h');
    frameIndex.value = Math.max(ticks.length - 1, 0);
  }

  return {
    loading,
    error,
    rainViewerHost,
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
    setProgress,
    stepFrame,
    resetPlayback,
  };
}
