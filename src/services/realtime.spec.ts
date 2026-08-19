import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { startRealtime, stopRealtime } from './realtime';
import { useAlarmStore } from '@/stores/alarm';

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

describe('realtime 监测预警中枢', () => {
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
});
