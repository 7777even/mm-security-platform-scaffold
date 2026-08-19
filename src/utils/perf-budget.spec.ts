import { describe, it, expect } from 'vitest';
import { evaluatePerf, recordPerf, recordPerfAsync, PERF_BUDGETS } from '@/utils/perf-budget';

describe('perf-budget 性能基线（D1 P7–P10）', () => {
  it('预算阈值与 D1 指标一致', () => {
    expect(PERF_BUDGETS.enterPlatformMs).toBe(5000);
    expect(PERF_BUDGETS.functionWindowMs).toBe(2000);
    expect(PERF_BUDGETS.baseMapMs).toBe(2000);
    expect(PERF_BUDGETS.componentQueryMs).toBe(2000);
  });

  it('未超预算 within=true', () => {
    expect(evaluatePerf('functionWindowMs', 1500).within).toBe(true);
  });

  it('超预算 within=false 且带回预算值', () => {
    const ev = evaluatePerf('baseMapMs', 3000);
    expect(ev.within).toBe(false);
    expect(ev.budgetMs).toBe(2000);
    expect(ev.durationMs).toBe(3000);
  });

  it('recordPerf 返回评估且不抛错', () => {
    expect(recordPerf('componentQueryMs', 1000).within).toBe(true);
    expect(recordPerf('componentQueryMs', 9999).within).toBe(false);
  });

  it('recordPerfAsync 记录异步耗时并透传结果', async () => {
    const r = await recordPerfAsync('componentQueryMs', async () => 42);
    expect(r).toBe(42);
  });

  it('recordPerfAsync 抛错仍记录耗时并向上抛出', async () => {
    await expect(
      recordPerfAsync('baseMapMs', async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
    expect(recordPerf('baseMapMs', 1).within).toBe(true); // 仅校验不污染后续判定
  });
});
