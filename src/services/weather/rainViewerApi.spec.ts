import { describe, it, expect } from 'vitest';
import { buildRainViewerTileUrl, pickNearestRainViewerFrame } from './rainViewerApi';

describe('rainViewerApi: 无 key 时降级', () => {
  it('未传入 key 时 URL 不含 ?key（降级到免密钥瓦片）', () => {
    const url = buildRainViewerTileUrl(
      'https://tilecache.rainviewer.com',
      '/v2/radar/123.png',
      5,
      10,
      20,
    );
    expect(url).toBe('https://tilecache.rainviewer.com/v2/radar/123.png/512/5/10/20/2/1_1.png');
    expect(url).not.toContain('key=');
  });

  it('传入 key 时 URL 追加 ?key=<encoded>', () => {
    const url = buildRainViewerTileUrl(
      'https://tilecache.rainviewer.com',
      '/v2/radar/123.png',
      5,
      10,
      20,
      512,
      'MY_KEY',
    );
    expect(url).toBe(
      'https://tilecache.rainviewer.com/v2/radar/123.png/512/5/10/20/2/1_1.png?key=MY_KEY',
    );
  });

  it('key 为空串等同于无 key（不追加 ?key）', () => {
    const url = buildRainViewerTileUrl('https://h', '/p.png', 1, 2, 3, 256, '');
    expect(url).not.toContain('key=');
  });
});

describe('rainViewerApi: 最近雷达帧选择（覆盖窗回退）', () => {
  it('命中窗口内返回时间上最近的帧', () => {
    const frames = [
      { time: 100, path: '/a.png' },
      { time: 200, path: '/b.png' },
    ];
    expect(pickNearestRainViewerFrame(210, frames)?.path).toBe('/b.png');
  });

  it('超出窗口返回 undefined，避免把旧帧误当作当前回波', () => {
    const frames = [{ time: 100, path: '/a.png' }];
    expect(pickNearestRainViewerFrame(100 + 900 + 1, frames)).toBeUndefined();
  });
});
