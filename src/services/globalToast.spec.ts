import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  pushGlobalToast,
  resetGlobalToastThrottleForTest,
  subscribeGlobalToast,
} from './globalToast';

describe('globalToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    resetGlobalToastThrottleForTest();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('订阅者收到推送的文案与色调', () => {
    const received: string[] = [];
    const unsubscribe = subscribeGlobalToast((toast) =>
      received.push(`${toast.tone}:${toast.message}`),
    );

    pushGlobalToast('请求失败：后端异常');

    expect(received).toEqual(['error:请求失败：后端异常']);
    unsubscribe();
  });

  it('同文案在去重窗口内只推一次，窗口过后可再推', () => {
    const received: string[] = [];
    subscribeGlobalToast((toast) => received.push(toast.message));

    pushGlobalToast('后端未接入 /alarms');
    pushGlobalToast('后端未接入 /alarms');
    expect(received).toHaveLength(1);

    vi.advanceTimersByTime(2001);
    pushGlobalToast('后端未接入 /alarms');
    expect(received).toHaveLength(2);
  });

  it('不同文案在最小间隔内被节流，避免批量失败刷屏', () => {
    const received: string[] = [];
    subscribeGlobalToast((toast) => received.push(toast.message));

    pushGlobalToast('请求失败：A');
    pushGlobalToast('请求失败：B');
    expect(received).toEqual(['请求失败：A']);

    vi.advanceTimersByTime(1201);
    pushGlobalToast('请求失败：B');
    expect(received).toEqual(['请求失败：A', '请求失败：B']);
  });

  it('退订后不再收到推送', () => {
    const received: string[] = [];
    const unsubscribe = subscribeGlobalToast((toast) => received.push(toast.message));
    unsubscribe();

    pushGlobalToast('退订后推送');

    expect(received).toEqual([]);
  });
});
