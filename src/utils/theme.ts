/**
 * 读取设计 token（CSS 变量）运行时计算值。
 * 用于 ECharts 等 canvas 场景：canvas 无法直接消费 `var(--token)`，
 * 需在渲染时从 :root 解析出实际色值/尺寸，从而保证主题切换一致。
 */
export function readCssVar(name: string, fallback = ''): string {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}
