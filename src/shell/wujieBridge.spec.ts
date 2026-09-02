import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  emitWujieEvent,
  onWujieEvent,
  offWujieEvent,
  getWujieBus,
  type WujieBus,
  type WujieEventMap,
} from './wujieBridge';

function createMockBus(): {
  bus: WujieBus;
  calls: Array<{ event: keyof WujieEventMap; data: unknown }>;
} {
  const calls: Array<{ event: keyof WujieEventMap; data: unknown }> = [];
  const handlers = new Map<keyof WujieEventMap, Set<(d: unknown) => void>>();
  const bus: WujieBus = {
    $emit(event, data) {
      calls.push({ event, data });
      handlers.get(event)?.forEach((h) => h(data));
    },
    $on(event, handler) {
      if (!handlers.get(event)) handlers.set(event, new Set());
      handlers.get(event)!.add(handler as (d: unknown) => void);
    },
    $off(event, handler) {
      handlers.get(event)?.delete(handler as (d: unknown) => void);
    },
  };
  return { bus, calls };
}

describe('wujieBridge：类型化事件总线', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('emit/on 强类型事件可收发，且负载类型正确', () => {
    const { bus } = createMockBus();
    vi.stubGlobal('window', { $wujie: { bus, props: {} } });
    const received: Array<WujieEventMap['map-fly-to']> = [];
    onWujieEvent('map-fly-to', (d) => received.push(d));
    emitWujieEvent('map-fly-to', { lng: 116.4, lat: 39.9 });
    expect(received).toEqual([{ lng: 116.4, lat: 39.9 }]);
    expect(getWujieBus()).toBe(bus);
  });

  it('off 后不再接收事件', () => {
    const { bus } = createMockBus();
    vi.stubGlobal('window', { $wujie: { bus, props: {} } });
    const handler = vi.fn();
    onWujieEvent('map-focus', handler);
    emitWujieEvent('map-focus', { id: 'a' });
    offWujieEvent('map-focus', handler);
    emitWujieEvent('map-focus', { id: 'b' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('子应用未注入 $wujie 时安全降级（emit 不抛）', () => {
    vi.stubGlobal('window', {});
    expect(() => emitWujieEvent('theme-changed', { theme: 'dark' })).not.toThrow();
    expect(getWujieBus()).toBeUndefined();
  });

  it('route-navigate 事件负载携带可选 query / replace（type-check 覆盖）', () => {
    const { bus } = createMockBus();
    vi.stubGlobal('window', { $wujie: { bus, props: {} } });
    const received: Array<WujieEventMap['route-navigate']> = [];
    onWujieEvent('route-navigate', (d) => received.push(d));
    // 纯路径
    emitWujieEvent('route-navigate', { path: '/emergency/drill' });
    // 路径 + query（drill/autostart/eventId 等参数依赖此通道）
    emitWujieEvent('route-navigate', {
      path: '/fire/rescue',
      query: { eventId: '42', autostart: '1' },
    });
    // replace：一次性消费参数（?create=event）清理后主壳不留历史
    emitWujieEvent('route-navigate', { path: '/emergency', query: {}, replace: true });
    expect(received).toEqual([
      { path: '/emergency/drill' },
      { path: '/fire/rescue', query: { eventId: '42', autostart: '1' } },
      { path: '/emergency', query: {}, replace: true },
    ]);
  });
});
