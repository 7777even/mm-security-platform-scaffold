import { describe, it, expect, vi, afterEach } from 'vitest';
import type { JmaHimawariFrame } from '@/services/weather/jmaHimawariApi';
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

function toValidtime(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}00`;
}

function jma(ms: number): JmaHimawariFrame {
  const v = toValidtime(ms);
  return { basetime: v, validtime: v, time: Math.floor(ms / 1000) };
}

function radar(ms: number, path: string): RainViewerFrame {
  return { time: Math.floor(ms / 1000), path };
}

function stubFetch(frames: JmaHimawariFrame[], radarFrames: RainViewerFrame[] = []) {
  const mock = vi.fn(async (url: unknown) => {
    const u = String(url);
    if (u.includes('targetTimes_fd.json')) {
      return {
        ok: true,
        status: 200,
        json: async () => frames.map((f) => ({ basetime: f.basetime, validtime: f.validtime })),
      };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({
        host: 'https://tilecache.rainviewer.com',
        radar: { past: radarFrames, nowcast: [] },
      }),
    };
  });
  vi.stubGlobal('fetch', mock);
  return mock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('useSatelliteCloudMap: 单轨时间轴与回放能力保全', () => {
  it('24h 档位保留最近 24 小时的全部 JMA 帧', async () => {
    const frames = Array.from({ length: 200 }, (_, i) => jma(NOW - (199 - i) * 10 * 60_000));
    stubFetch(frames, []);

    const m = useSatelliteCloudMap();
    await m.loadWeatherData();

    // 10 分钟一档：24h 窗口含 145 个时次（含首尾）
    expect(m.timelineTicks.value).toHaveLength(145);
    expect(m.timelineTicks.value.every((t) => t.jmaValidtime.length === 14)).toBe(true);
  });

  it('6h / current 档位按既有窗口收敛，不新增也不缩短 24h 轨', async () => {
    const frames = Array.from({ length: 200 }, (_, i) => jma(NOW - (199 - i) * 10 * 60_000));
    stubFetch(frames, []);

    const m = useSatelliteCloudMap();
    await m.loadWeatherData();

    m.setTimeRange('6h');
    expect(m.timelineTicks.value).toHaveLength(37);

    m.setTimeRange('current');
    expect(m.timelineTicks.value).toHaveLength(1);

    m.setTimeRange('24h');
    expect(m.timelineTicks.value).toHaveLength(145);
  });

  it('时间轴始终由 JMA 帧构建，雷达缺失不影响 tick 数量', async () => {
    const frames = Array.from({ length: 30 }, (_, i) => jma(NOW - (29 - i) * 10 * 60_000));
    stubFetch(frames, []);

    const m = useSatelliteCloudMap();
    await m.loadWeatherData();

    expect(m.timelineTicks.value).toHaveLength(30);
    expect(m.timelineTicks.value.every((t) => t.radarMatched === false)).toBe(true);
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

describe('useSatelliteCloudMap: 气象帧自动刷新', () => {
  it('轮询到新时次时追加进帧列表并在末帧时自动前进', async () => {
    vi.useFakeTimers();
    const initial = [jma(NOW - 10 * 60_000), jma(NOW)];
    stubFetch(initial, []);

    const m = useSatelliteCloudMap();
    await m.loadWeatherData();
    expect(m.timelineTicks.value).toHaveLength(2);

    stubFetch([...initial, jma(NOW + 10 * 60_000)], []);
    m.startAutoRefresh();
    await vi.advanceTimersByTimeAsync(WEATHER_REFRESH_INTERVAL_MS);

    expect(m.timelineTicks.value).toHaveLength(3);
    expect(m.frameIndex.value).toBe(2);
    m.stopAutoRefresh();
  });

  it('无新时次时不改动帧列表', async () => {
    vi.useFakeTimers();
    const initial = [jma(NOW - 10 * 60_000), jma(NOW)];
    stubFetch(initial, []);

    const m = useSatelliteCloudMap();
    await m.loadWeatherData();
    const before = m.timelineTicks.value.map((t) => t.id);

    m.startAutoRefresh();
    await vi.advanceTimersByTimeAsync(WEATHER_REFRESH_INTERVAL_MS);

    expect(m.timelineTicks.value.map((t) => t.id)).toEqual(before);
    m.stopAutoRefresh();
  });

  it('停留在历史帧时不自动前进，仅更新列表', async () => {
    vi.useFakeTimers();
    const initial = [jma(NOW - 10 * 60_000), jma(NOW)];
    stubFetch(initial, []);

    const m = useSatelliteCloudMap();
    await m.loadWeatherData();
    m.frameIndex.value = 0;

    stubFetch([...initial, jma(NOW + 10 * 60_000)], []);
    m.startAutoRefresh();
    await vi.advanceTimersByTimeAsync(WEATHER_REFRESH_INTERVAL_MS);

    expect(m.timelineTicks.value).toHaveLength(3);
    expect(m.frameIndex.value).toBe(0);
    m.stopAutoRefresh();
  });

  it('页面隐藏时不再发起轮询', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('document', {
      visibilityState: 'hidden',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const initial = [jma(NOW)];
    const mock = stubFetch(initial, []);
    const m = useSatelliteCloudMap();
    await m.loadWeatherData();
    const callsAfterLoad = mock.mock.calls.length;

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

    const initial = [jma(NOW)];
    const mock = stubFetch([...initial, jma(NOW + 10 * 60_000)], []);
    const m = useSatelliteCloudMap();
    await m.loadWeatherData();
    const callsAfterLoad = mock.mock.calls.length;

    m.startAutoRefresh();
    await vi.advanceTimersByTimeAsync(WEATHER_REFRESH_INTERVAL_MS);
    expect(mock.mock.calls.length).toBe(callsAfterLoad);

    doc.visibilityState = 'visible';
    listeners.visibilitychange?.();
    await vi.advanceTimersByTimeAsync(0);

    expect(mock.mock.calls.length).toBeGreaterThan(callsAfterLoad);
    expect(m.timelineTicks.value).toHaveLength(2);
    m.stopAutoRefresh();
  });

  it('轮询失败仅记录错误态并退避，不清空已有帧', async () => {
    vi.useFakeTimers();
    const initial = [jma(NOW - 10 * 60_000), jma(NOW)];
    stubFetch(initial, []);

    const m = useSatelliteCloudMap();
    await m.loadWeatherData();

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('网络不可用')));

    m.startAutoRefresh();
    await vi.advanceTimersByTimeAsync(WEATHER_REFRESH_INTERVAL_MS);

    expect(m.autoRefreshError.value).toBe('网络不可用');
    expect(m.timelineTicks.value).toHaveLength(2);

    // 退避加倍：下一个周期不再请求，需再等一个原周期
    const failing = vi.mocked(globalThis.fetch);
    const callsAfterFirstFailure = failing.mock.calls.length;
    await vi.advanceTimersByTimeAsync(WEATHER_REFRESH_INTERVAL_MS);
    expect(failing.mock.calls.length).toBe(callsAfterFirstFailure);

    await vi.advanceTimersByTimeAsync(WEATHER_REFRESH_INTERVAL_MS);
    expect(failing.mock.calls.length).toBeGreaterThan(callsAfterFirstFailure);

    m.stopAutoRefresh();
  });
});
