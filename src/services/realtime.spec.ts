import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { startRealtime, stopRealtime, subscribeAlarmPush, subscribeDomainChange } from './realtime';
import type { DomainChangeEvent } from './realtime';
import { useAlarmStore } from '@/stores/alarm';
import { setAccessToken, clearAccessToken } from '@/services/token';

// 复刻 ws.spec 的 FakeSocket，用于驱动 onmessage（node 环境无全局 WebSocket）
class FakeSocket {
  static instances: FakeSocket[] = [];
  static reset(): void {
    FakeSocket.instances = [];
  }
  readyState = 0;
  onopen: (() => void) | null = null;
  onclose: ((ev: { code?: number; wasClean?: boolean }) => void) | null = null;
  onerror: ((ev: unknown) => void) | null = null;
  onmessage: ((ev: { data: unknown }) => void) | null = null;
  constructor(public url: string) {
    FakeSocket.instances.push(this);
  }
  send(): void {
    /* noop */
  }
  close(): void {
    this.readyState = 3;
  }
  open(): void {
    this.readyState = 1;
    this.onopen?.();
  }
}

function makeAlarmPayload(over: Record<string, unknown> = {}) {
  return {
    alarmId: 'a1',
    level: 1,
    type: 'FIRE',
    status: 'ACTIVE',
    deviceCode: 'DEV-01',
    location: 'A 栋 3F',
    ts: '2026-08-19T10:00:00Z',
    description: '烟雾浓度超限',
    ...over,
  };
}

describe('realtime 监测预警中枢（alarm.push）', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    FakeSocket.reset();
  });
  afterEach(() => stopRealtime());

  function startWithFake() {
    startRealtime({ url: 'ws://t', createSocket: (u) => new FakeSocket(u) });
    const s = FakeSocket.instances[0]!;
    s.open();
    return s;
  }

  it('alarm.push 消息入 alarm store', () => {
    const s = startWithFake();
    s.onmessage?.({ data: JSON.stringify({ topic: 'alarm.push', payload: makeAlarmPayload() }) });
    expect(useAlarmStore().alarms).toHaveLength(1);
  });

  it('非 alarm.push topic 不入 store', () => {
    const s = startWithFake();
    s.onmessage?.({ data: JSON.stringify({ topic: 'other', payload: makeAlarmPayload() }) });
    expect(useAlarmStore().alarms).toHaveLength(0);
  });

  it('非法 alarm 负载容错（不抛异常、不入 store）', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const s = startWithFake();
    expect(() =>
      s.onmessage?.({ data: JSON.stringify({ topic: 'alarm.push', payload: { foo: 1 } }) }),
    ).not.toThrow();
    expect(useAlarmStore().alarms).toHaveLength(0);
    warnSpy.mockRestore();
  });

  it('重复 startRealtime 幂等，不创建第二个连接', () => {
    startWithFake();
    startRealtime({ url: 'ws://t', createSocket: (u) => new FakeSocket(u) });
    expect(FakeSocket.instances).toHaveLength(1);
  });

  it('startRealtime 将 access token 注入 WS 握手 URL（?token=）', () => {
    setAccessToken('rt-injected');
    startRealtime({ url: 'ws://t', createSocket: (u) => new FakeSocket(u) });
    expect(FakeSocket.instances[0]!.url).toBe('ws://t?token=rt-injected');
    clearAccessToken();
  });

  it('subscribeAlarmPush 订阅者收到 alarm.push 增量（与 store 入库并行）', () => {
    const received: string[] = [];
    const unsubscribe = subscribeAlarmPush((alarm) => received.push(alarm.alarmId));
    const s = startWithFake();
    s.onmessage?.({ data: JSON.stringify({ topic: 'alarm.push', payload: makeAlarmPayload() }) });
    expect(received).toEqual(['a1']);
    expect(useAlarmStore().alarms).toHaveLength(1); // store 入库不受订阅影响
    unsubscribe();
  });

  it('无活跃 Pinia 时订阅者仍可收到推送', () => {
    const received: string[] = [];
    const unsubscribe = subscribeAlarmPush((alarm) => received.push(alarm.alarmId));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const store = useAlarmStore(); // 先取引用，再模拟子应用早期无活跃 Pinia
    setActivePinia(undefined as never);
    const s = startWithFake();
    s.onmessage?.({ data: JSON.stringify({ topic: 'alarm.push', payload: makeAlarmPayload() }) });
    expect(received).toEqual(['a1']);
    expect(store.alarms).toHaveLength(0);
    warnSpy.mockRestore();
    unsubscribe();
  });

  it('非法 alarm 负载不触发订阅者', () => {
    const listener = vi.fn();
    subscribeAlarmPush(listener);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const s = startWithFake();
    s.onmessage?.({ data: JSON.stringify({ topic: 'alarm.push', payload: { foo: 1 } }) });
    expect(listener).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('订阅者抛异常不影响其他订阅者与 store 入库', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const received: string[] = [];
    subscribeAlarmPush(() => {
      throw new Error('boom');
    });
    const unsubscribe = subscribeAlarmPush((alarm) => received.push(alarm.alarmId));
    const s = startWithFake();
    s.onmessage?.({ data: JSON.stringify({ topic: 'alarm.push', payload: makeAlarmPayload() }) });
    expect(received).toEqual(['a1']);
    expect(useAlarmStore().alarms).toHaveLength(1);
    warnSpy.mockRestore();
    unsubscribe();
  });
});

describe('realtime 多域变更路由与去抖（<domain>.changed）', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeSocket.reset();
  });
  afterEach(() => {
    stopRealtime();
    vi.useRealTimers();
  });

  function startWithFake() {
    startRealtime({ url: 'ws://t', createSocket: (u) => new FakeSocket(u) });
    return FakeSocket.instances[0]!;
  }

  it('<domain>.changed 按域路由到对应订阅者', () => {
    const userHandler = vi.fn();
    const roleHandler = vi.fn();
    subscribeDomainChange('system.user', userHandler);
    subscribeDomainChange('system.role', roleHandler);

    const s = startWithFake();
    s.onmessage?.({
      data: JSON.stringify({
        topic: 'system.user.changed',
        payload: { domain: 'system.user', action: 'created', id: '1', data: null },
      }),
    });
    vi.advanceTimersByTime(400);

    expect(userHandler).toHaveBeenCalledTimes(1);
    expect(roleHandler).not.toHaveBeenCalled();
    const events = userHandler.mock.calls[0][0] as DomainChangeEvent[];
    expect(events[0].domain).toBe('system.user');
    expect(events[0].action).toBe('created');
  });

  it('同一域 400ms 内的多次变更按去抖合并为一次回调', () => {
    const handler = vi.fn();
    subscribeDomainChange('alarm', handler);
    const s = startWithFake();
    s.onmessage?.({
      data: JSON.stringify({
        topic: 'alarm.changed',
        payload: { domain: 'alarm', action: 'created', id: 'A', data: null },
      }),
    });
    s.onmessage?.({
      data: JSON.stringify({
        topic: 'alarm.changed',
        payload: { domain: 'alarm', action: 'updated', id: 'A', data: null },
      }),
    });
    vi.advanceTimersByTime(200);
    expect(handler).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(handler).toHaveBeenCalledTimes(1);
    const events = handler.mock.calls[0][0] as DomainChangeEvent[];
    expect(events).toHaveLength(2);
  });

  it('未知 topic 被忽略且不抛异常', () => {
    const handler = vi.fn();
    subscribeDomainChange('system.user', handler);
    const s = startWithFake();
    expect(() =>
      s.onmessage?.({ data: JSON.stringify({ topic: 'unknown.topic', payload: {} }) }),
    ).not.toThrow();
    vi.advanceTimersByTime(400);
    expect(handler).not.toHaveBeenCalled();
  });

  it('退订后不再收到该域变更', () => {
    const handler = vi.fn();
    const unsub = subscribeDomainChange('system.user', handler);
    unsub();
    const s = startWithFake();
    s.onmessage?.({
      data: JSON.stringify({
        topic: 'system.user.changed',
        payload: { domain: 'system.user', action: 'updated', id: '1', data: null },
      }),
    });
    vi.advanceTimersByTime(400);
    expect(handler).not.toHaveBeenCalled();
  });
});
