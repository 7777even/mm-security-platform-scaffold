// D1 性能验收预算（P7–P10 前端可度量项）。
// 仅声明阈值与判定；真机/浏览器级压测为 CI-browser 步骤，不在本环境。

export interface PerfBudget {
  enterPlatformMs: number; // P7 进入平台 ≤5s
  functionWindowMs: number; // P8 功能窗口切换 ≤2s
  baseMapMs: number; // P9 基础地图 ≤2s（由地图模块在各自 change 触发打点）
  terrainMs: number; // 地形浮雕加载耗时（非硬性 P 档预算，仅观测）
  componentQueryMs: number; // P10 部件查询 ≤2s（由查询模块在各自 change 触发打点）
}

export const PERF_BUDGETS: PerfBudget = {
  enterPlatformMs: 5000,
  functionWindowMs: 2000,
  baseMapMs: 2000,
  terrainMs: 3000,
  componentQueryMs: 2000,
};

export type PerfKey = keyof PerfBudget;

export interface PerfEvaluation {
  key: PerfKey;
  durationMs: number;
  budgetMs: number;
  within: boolean;
}

export function evaluatePerf(key: PerfKey, durationMs: number): PerfEvaluation {
  const budgetMs = PERF_BUDGETS[key];
  return { key, durationMs, budgetMs, within: durationMs <= budgetMs };
}

/** 记录一次性能测量并判定预算；超预算仅告警不抛错，避免阻断业务。 */
export function recordPerf(key: PerfKey, durationMs: number): PerfEvaluation {
  const ev = evaluatePerf(key, durationMs);
  if (!ev.within) {
    console.warn(`[perf-budget] ${key} 超时: ${durationMs.toFixed(1)}ms > 预算 ${ev.budgetMs}ms`);
  }
  return ev;
}

/**
 * 计时并执行异步任务，结束后回写对应 D1 性能预算（P9 地图/P10 查询等）。
 * 任务抛错仍记录耗时并向上抛出，便于排查慢路径而不丢失异常。
 */
export async function recordPerfAsync<R>(key: PerfKey, fn: () => Promise<R> | R): Promise<R> {
  const t0 = performance.now();
  try {
    return await fn();
  } finally {
    recordPerf(key, performance.now() - t0);
  }
}
