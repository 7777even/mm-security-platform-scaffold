import { describe, it, expect, vi, afterEach, type Mock } from 'vitest';
import type { RainViewerFrame } from '@/services/weather/rainViewerApi';
import {
  RADAR_COVERAGE_HINT,
  RADAR_MATCH_WINDOW_SECONDS,
  WEATHER_REFRESH_INTERVAL_MS,
  radarCoverageLabel,
  resolveRadarFrameForTick,
  useSatelliteCloudMap,
} from './useSatelliteCloudMap';

const NOW = Date.UTC(2026, 8, 7, 0, 0, 0);

function radar(ms: number, path: string): RainViewerFrame {
  return { time: Math.floor(ms / 1000), path };
}

/**
 * 桩 RainViewer 天气地图接口（工程当前唯一外源拉取）。
 * getFrames 支持可变，便于同一用例在加载后切换帧集合并发起刷新。
 * 其余 URL（已弃用的 JMA 等历史外源）一律静默返回空，避免测试耦合旧实现。
 */
function stubRainViewer(getFrames: () => RainViewerFrame[] = () => []): Mock {
  const mock = vi.fn(async (url: unknown) => {
    if (String(url).includes('rainviewer.com')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          host: 'https://tilecache.rainviewer.com',
          radar: { past: getFrames(), nowcast: [] },
        }),
      };
    }
    return { ok: true, status: 200, json: async () => [] };
  });
  vi.stubGlobal('fetch', mock);
  return mock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

/** 冲刷 fetch 链上的微任务（不受 fake timers 影响）。 */
async function flushMicrotasks(): Promise<void> {
  for (let i = 0; i < 5; i++) await Promise.resolve();
}

describe('useSatelliteCloudMap: 时间轴窗口由档位决定（本地生成、零网络依赖）', () => {
  it('24h 档位本地生成 96 个时次（15 分钟步长）', async () => {
    stubRainViewer();
    const m = useSatelliteCloudMap();
    await m.loadWeatherData();

    expect(m.timelineTicks.value).toHaveLength(96);
    // 兼容字段 jmaValidtime 镜像时次 unix 秒，非空
    expect(m.timelineTicks.value.every((t) => t.jmaValidtime === String(t.time))).toBe(true);
  });

  it('6h / current 档位按窗口收敛为 24 / 8 个时次，回到 24h 恢复 96', async () => {
    stubRainViewer();
    const m = useSatelliteCloudMap();
    await m.loadWeatherData();

    m.setTimeRange('6h');
    expect(m.timelineTicks.value).toHaveLength(24);

    m.setTimeRange('current');
    expect(m.timelineTicks.value).toHaveLength(8);

    m.setTimeRange('24h');
    expect(m.timelineTicks.value).toHaveLength(96);
  });

  it('时间轴始终本地生成，外源不可达不影响 tick 数量', async () => {
    stubRainViewer();
    const m = useSatelliteCloudMap();
    await m.loadWeatherData();

    // 默认 24h → 96 个时次，且无任何雷达帧时全部 radarMatched=false
    expect(m.timelineTicks.value).toHaveLength(96);
    expect(m.timelineTicks.value.every((t) => t.radarMatched === false)).toBe(true);
  });

  it('雷达帧命中末帧时，对应时次 radarMatched=true 且回填路径', async () => {
    vi.useFakeTimers();
    let frames: RainViewerFrame[] = [];
    stubRainViewer(() => frames);

    const m = useSatelliteCloudMap();
    await m.loadWeatherData();
    const lastTime = m.timelineTicks.value[m.timelineTicks.value.length - 1]!.time;

    // 加载后注入一个恰好落在末帧时刻的雷达帧，并触发一次刷新
    frames = [radar(lastTime * 1000, 'p-last')];
    m.startAutoRefresh();
    await vi.advanceTimersByTimeAsync(WEATHER_REFRESH_INTERVAL_MS);
    await flushMicrotasks();

    const last = m.timelineTicks.value[m.timelineTicks.value.length - 1]!;
    expect(last.radarMatched).toBe(true);
    expect(last.rainViewerPath).toBe('p-last');
    m.stopAutoRefresh();
  });
});

describe('resolveRadarFrameForTick: 雷达帧回退', () => {
  const frames = [radar(NOW, 'p-now')];

  it('命中匹配窗返回该帧', () => {
    expect(resolveRadarFrameForTick(Math.floor(NOW / 1000), frames)?.path).toBe('p-now');
  });

  it('未命中时沿用上一帧', () => {
    const prev = radar(NOW, 'p-prev');
    const far = Math.floor(NOW / 1000) + RADAR_MATCH_WINDOW_SECONDS * 4;
    expect(resolveRadarFrameForTick(far, frames, prev)?.path).toBe('p-prev');
  });

  it('连续 3 个未命中 tick 仍返回同一上一帧', () => {
    const prev = radar(NOW, 'p-prev');
    let carried: RainViewerFrame | undefined = prev;
    for (let i = 1; i <= 3; i++) {
      const t = Math.floor(NOW / 1000) + RADAR_MATCH_WINDOW_SECONDS * 10 * i;
      carried = resolveRadarFrameForTick(t, frames, carried);
      expect(carried?.path).toBe('p-prev');
    }
  });

  it('首帧即未命中且无上一帧时返回 undefined 交由 UI 标注', () => {
    expect(resolveRadarFrameForTick(Math.floor(NOW / 1000) + 99_999, [])).toBeUndefined();
  });
});

describe('radarCoverageLabel: 覆盖窗标注', () => {
  const frames = [radar(NOW, 'p-now')];

  it('落在覆盖窗内返回 null（无需标注）', () => {
    expect(radarCoverageLabel(Math.floor(NOW / 1000), frames)).toBeNull();
  });

  it('超出覆盖窗返回提示文案', () => {
    expect(radarCoverageLabel(Math.floor(NOW / 1000) + 99_999, frames)).toBe(RADAR_COVERAGE_HINT);
  });
});

describe('useSatelliteCloudMap: 气象时次自动刷新（真实时钟滑动）', () => {
  it('时间推进超过一个步长时末帧前移，且停留在末帧时 frameIndex 跟随', async () => {
    vi.useFakeTimers();
    stubRainViewer();

    const m = useSatelliteCloudMap();
    await m.loadWeatherData();
    expect(m.timelineTicks.value).toHaveLength(96);
    const lastTimeBefore = m.timelineTicks.value[m.timelineTicks.value.length - 1]!.time;
    expect(m.frameIndex.value).toBe(95);

    // 推进 16 分钟（> 15 分钟步长），时间窗整体滑动一格
    m.startAutoRefresh();
    await vi.advanceTimersByTimeAsync(16 * 60_000);

    expect(m.timelineTicks.value).toHaveLength(96); // 长度恒定，仅窗口滑动
    const lastTimeAfter = m.timelineTicks.value[m.timelineTicks.value.length - 1]!.time;
    expect(lastTimeAfter - lastTimeBefore).toBe(15 * 60); // 末帧前移一个步长
    expect(m.frameIndex.value).toBe(95); // 仍停留在末帧
    m.stopAutoRefresh();
  });

  it('用户停留在历史帧时不前移 frameIndex，仅末帧随窗口滑动', async () => {
    vi.useFakeTimers();
    stubRainViewer();

    const m = useSatelliteCloudMap();
    await m.loadWeatherData();
    m.frameIndex.value = 0; // 停在第一帧（历史）

    m.startAutoRefresh();
    await vi.advanceTimersByTimeAsync(16 * 60_000);

    expect(m.timelineTicks.value).toHaveLength(96);
    expect(m.frameIndex.value).toBe(0); // 历史帧不被打断
    m.stopAutoRefresh();
  });

  it('页面隐藏时不再发起轮询', async () => {
    vi.useFakeTimers();
    const mock = stubRainViewer();

    const m = useSatelliteCloudMap();
    await m.loadWeatherData();
    const callsAfterLoad = mock.mock.calls.length;

    vi.stubGlobal('document', {
      visibilityState: 'hidden',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    m.startAutoRefresh();
    await vi.advanceTimersByTimeAsync(WEATHER_REFRESH_INTERVAL_MS * 3);

    expect(mock.mock.calls.length).toBe(callsAfterLoad);
    m.stopAutoRefresh();
  });

  it('页面恢复可见时立即补拉一次', async () => {
    vi.useFakeTimers();
    const listeners: Record<string, () => void> = {};
    const doc = {
      visibilityState: 'hidden',
      addEventListener: vi.fn((type: string, fn: () => void) => {
        listeners[type] = fn;
      }),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal('document', doc);
    const mock = stubRainViewer();

    const m = useSatelliteCloudMap();
    await m.loadWeatherData();
    const callsAfterLoad = mock.mock.calls.length;

    m.startAutoRefresh();
    await vi.advanceTimersByTimeAsync(WEATHER_REFRESH_INTERVAL_MS);
    expect(mock.mock.calls.length).toBe(callsAfterLoad); // 隐藏期间不轮询

    doc.visibilityState = 'visible';
    listeners.visibilitychange?.();
    await vi.advanceTimersByTimeAsync(0);

    expect(mock.mock.calls.length).toBeGreaterThan(callsAfterLoad); // 恢复可见立即补拉
    m.stopAutoRefresh();
  });

  it('可选 RainViewer 拉取失败时静默降级：不抛异常、autoRefreshError 保持 null、已有帧保留', async () => {
    // 全程拒绝 fetch（含 RainViewer 与任何遗留外源）
    const reject = vi.fn().mockRejectedValue(new Error('网络不可用'));
    vi.stubGlobal('fetch', reject);

    const m = useSatelliteCloudMap();
    await expect(m.loadWeatherData()).resolves.toBeUndefined();
    await flushMicrotasks(); // 冲刷 fetch 微任务（失败被静默吞掉）

    // 失败不污染错误态，时间轴本地生成不依赖外源
    expect(m.autoRefreshError.value).toBeNull();
    expect(m.timelineTicks.value).toHaveLength(96);

    // 即便在自动刷新周期内失败，错误态同样保持 null（设计上全球雷达为可选能力）
    vi.useFakeTimers();
    m.startAutoRefresh();
    await vi.advanceTimersByTimeAsync(WEATHER_REFRESH_INTERVAL_MS);
    await flushMicrotasks();
    expect(m.autoRefreshError.value).toBeNull();
    expect(m.timelineTicks.value).toHaveLength(96);
    m.stopAutoRefresh();
  });
});
