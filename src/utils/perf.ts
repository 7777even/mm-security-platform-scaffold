/**
 * 渲染层性能埋点（B4 真机复测工具）
 *
 * 启用方式：
 * - 开发态（DEV）默认启用；
 * - 任意环境 URL 携带 ?perf=1 显式启用，?perf=0 强制关闭（便于线上/真机诊断）。
 *
 * 用法：入口 JS 最先执行处 mark('app:start')，首屏挂载完成后 mark('app:ready')，
 * 再 measure('render', 'app:start', 'app:ready') 即得渲染层耗时（SLO 口径：JS 执行 → 首屏可用）。
 * 数据输出到 console，与 DevTools Performance 面板 / FCP 交叉验证。
 */

function queryFlag(): boolean | null {
  if (typeof window === 'undefined') return null;
  const p = new URLSearchParams(window.location.search);
  if (p.get('perf') === '0') return false;
  if (p.has('perf')) return true;
  return null;
}

/** 埋点是否启用 */
export function isPerfEnabled(): boolean {
  return queryFlag() ?? import.meta.env.DEV;
}

function hasPerf(): boolean {
  return isPerfEnabled() && typeof performance !== 'undefined';
}

/**
 * 记录一个时间点标记（后续用 measure 计算耗时）。
 * 输出为相对 app:start 的偏移（时间轴），如 `layout:ready @ +42.0ms`；
 * 无 app:start 时退回相对当前时刻。
 */
// 同名 mark 会被反复创建（每次导航都会 mark('nav:start')），Performance Timeline 不会覆盖旧 entry。
// 因此一律取「最近一次」的 entry，否则 measure/mark 会拿到最早那次，度量值随会话时间无限增大
// （表现为 functionWindowMs 持续累积直到触发 2000ms 预算超时）。
function lastEntry(name: string): PerformanceEntry | undefined {
  const entries = performance.getEntriesByName(name);
  return entries.length ? entries[entries.length - 1] : undefined;
}

export function mark(name: string): void {
  if (!hasPerf()) return;
  performance.mark(name);
  const origin = lastEntry('app:start');
  const self = lastEntry(name);
  const offset = origin && self ? self.startTime - origin.startTime : relativeMs(name);
  console.info(`[perf] ${name} @ +${offset.toFixed(1)}ms`);
}

// markOnce 已打点的标记名（避免组件重复打点覆盖首次记录）
const markedOnce = new Set<string>();

/** 同名单次打点：重复调用不覆盖首次记录 */
export function markOnce(name: string): void {
  if (markedOnce.has(name)) return;
  markedOnce.add(name);
  mark(name);
}

/**
 * 计算 fromMark → toMark（缺省为当前时刻）耗时并输出。
 * 起点标记缺失时返回 null（不计入）。
 */
export function measure(name: string, fromMark: string, toMark?: string): number | null {
  if (!hasPerf()) return null;
  const from = lastEntry(fromMark);
  if (!from) return null;
  const to = toMark ? lastEntry(toMark) : undefined;
  const ms = to ? to.startTime - from.startTime : performance.now() - from.startTime;
  console.info(`[perf] ${name}=${ms.toFixed(1)}ms (${fromMark}${toMark ? ` → ${toMark}` : ''})`);
  return ms;
}

/** 某标记相对当前时刻的毫秒数（缺失时近似取 now） */
function relativeMs(name: string): number {
  const entry = lastEntry(name);
  return entry ? performance.now() - entry.startTime : performance.now();
}
