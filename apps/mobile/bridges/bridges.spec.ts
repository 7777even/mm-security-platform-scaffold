// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { H5LocationBridge, H5OfflineBridge, H5TokenSource } from './h5';
import { locationBridge, offlineBridge, tokenSource } from './index';

describe('H5LocationBridge', () => {
  beforeEach(() => {
    (navigator as unknown as { geolocation?: unknown }).geolocation = undefined;
  });

  it('getPosition 在环境不支持 geolocation 时拒绝', async () => {
    const bridge = new H5LocationBridge();
    await expect(bridge.getPosition()).rejects.toThrow(/不支持 geolocation/);
  });

  it('getPosition 从 getCurrentPosition 映射为 GeoPosition', async () => {
    const mockPos = {
      coords: { longitude: 116.39, latitude: 39.9, accuracy: 5 },
      timestamp: 1700000000000,
    };
    (navigator as unknown as { geolocation: unknown }).geolocation = {
      getCurrentPosition: (ok: (p: typeof mockPos) => void) => ok(mockPos),
      watchPosition: () => 1,
      clearWatch: () => undefined,
    };
    const bridge = new H5LocationBridge();
    expect(await bridge.getPosition()).toEqual({
      lng: 116.39,
      lat: 39.9,
      accuracy: 5,
      timestamp: 1700000000000,
    });
  });

  it('startWatch 在定位回调中触发 onPosition，stopWatch 清除 watch', () => {
    const onPosition = vi.fn();
    const mockPos = { coords: { longitude: 1, latitude: 2, accuracy: 3 }, timestamp: 1 };
    const clearWatch = vi.fn();
    (navigator as unknown as { geolocation: unknown }).geolocation = {
      getCurrentPosition: () => undefined,
      watchPosition: (ok: (p: typeof mockPos) => void) => {
        ok(mockPos);
        return 7;
      },
      clearWatch,
    };
    const bridge = new H5LocationBridge();
    bridge.startWatch(onPosition);
    expect(onPosition).toHaveBeenCalledWith({ lng: 1, lat: 2, accuracy: 3, timestamp: 1 });
    bridge.stopWatch();
    expect(clearWatch).toHaveBeenCalledWith(7);
  });

  it('startWatch 在无 geolocation 支持时为 no-op', () => {
    const onPosition = vi.fn();
    const bridge = new H5LocationBridge();
    bridge.startWatch(onPosition);
    expect(onPosition).not.toHaveBeenCalled();
  });
});

describe('H5OfflineBridge', () => {
  beforeEach(() => localStorage.clear());

  it('save 后 load 往返一致', async () => {
    const bridge = new H5OfflineBridge();
    await bridge.save('k1', { a: 1 });
    expect(await bridge.load('k1')).toEqual({ a: 1 });
  });

  it('load 未知 key 返回 null', async () => {
    const bridge = new H5OfflineBridge();
    expect(await bridge.load('missing')).toBeNull();
  });

  it('pendingCount 只统计带前缀的键', async () => {
    const bridge = new H5OfflineBridge();
    await bridge.save('a', 1);
    await bridge.save('b', 2);
    localStorage.setItem('unrelated', 'x');
    expect(await bridge.pendingCount()).toBe(2);
  });

  it('clear 移除指定键', async () => {
    const bridge = new H5OfflineBridge();
    await bridge.save('a', 1);
    await bridge.clear('a');
    expect(await bridge.load('a')).toBeNull();
  });
});

describe('H5TokenSource', () => {
  beforeEach(() => sessionStorage.clear());

  it('无会话令牌时 getToken 返回 null', async () => {
    const src = new H5TokenSource();
    expect(await src.getToken()).toBeNull();
  });

  it('getToken 从 sessionStorage 读取 mobile-token', async () => {
    sessionStorage.setItem('mobile-token', 'abc');
    const src = new H5TokenSource();
    expect(await src.getToken()).toBe('abc');
  });

  it('onTokenExpired 注册的回调可由 emitExpired 触发', async () => {
    const src = new H5TokenSource();
    const handler = vi.fn();
    src.onTokenExpired(handler);
    src.emitExpired();
    expect(handler).toHaveBeenCalled();
  });
});

describe('桥接装配点（index.ts）', () => {
  it('对外暴露 H5 降级实例', () => {
    expect(locationBridge).toBeInstanceOf(H5LocationBridge);
    expect(offlineBridge).toBeInstanceOf(H5OfflineBridge);
    expect(tokenSource).toBeInstanceOf(H5TokenSource);
  });
});
