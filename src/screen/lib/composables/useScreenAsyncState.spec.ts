import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useScreenAsyncState } from './useScreenAsyncState';

describe('useScreenAsyncState', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('成功：写入 data、loading 归位、error 清空', async () => {
    const state = useScreenAsyncState<number[]>('demo', '/demo', () => Promise.resolve([1, 2, 3]), {
      initialData: [],
      immediate: false,
    });

    expect(state.loading.value).toBe(false);
    const run = state.retry();
    expect(state.loading.value).toBe(true);
    await run;

    expect(state.data.value).toEqual([1, 2, 3]);
    expect(state.loading.value).toBe(false);
    expect(state.error.value).toBeNull();
    expect(state.isEmpty.value).toBe(false);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('失败：error 置文案、data 保持初始空态、打印域级降级告警', async () => {
    const state = useScreenAsyncState<string[]>(
      'demo',
      '/demo/items',
      () => Promise.reject(new Error('连接超时')),
      { initialData: [], immediate: false },
    );

    await state.retry();

    expect(state.data.value).toEqual([]);
    expect(state.error.value).toBe('连接超时');
    expect(state.isEmpty.value).toBe(true);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(String(warnSpy.mock.calls[0]?.[0])).toContain('[demo]');
  });

  it('失败后重试成功：data 更新且 error 清空', async () => {
    let shouldFail = true;
    const state = useScreenAsyncState<number>(
      'demo',
      '/demo',
      () => (shouldFail ? Promise.reject(new Error('失败')) : Promise.resolve(42)),
      { immediate: false },
    );

    await state.retry();
    expect(state.data.value).toBeNull();
    expect(state.error.value).toBe('失败');

    shouldFail = false;
    await state.retry();
    expect(state.data.value).toBe(42);
    expect(state.error.value).toBeNull();
  });

  it('并发调用合并为单次 inflight，fetcher 只执行一次', async () => {
    const fetcher = vi.fn(() => Promise.resolve('ok'));
    const state = useScreenAsyncState<string>('demo', '/demo', fetcher, { immediate: false });

    await Promise.all([state.retry(), state.retry(), state.retry()]);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(state.data.value).toBe('ok');
  });

  it('immediate=false 时创建不自动发起请求', () => {
    const fetcher = vi.fn(() => Promise.resolve(1));
    useScreenAsyncState<number>('demo', '/demo', fetcher, { immediate: false });

    expect(fetcher).not.toHaveBeenCalled();
  });

  it('自定义 isEmpty 判定生效', () => {
    const state = useScreenAsyncState<{ total: number }>(
      'demo',
      '/demo',
      () => Promise.resolve({ total: 0 }),
      { immediate: false, isEmpty: (data) => (data?.total ?? 0) === 0 },
    );

    expect(state.isEmpty.value).toBe(true);
  });
});
