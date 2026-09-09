/**
 * 全局错误 toast 兜底（services 层 → UI 层单向桥）。
 *
 * http 拦截器在请求失败（非 401）时经 `pushGlobalToast` 推送错误提示；
 * UI 层（如大屏 AppToast.vue）经 `subscribeGlobalToast` 订阅并渲染。
 * services 层不直接依赖 Vue 组件 / router，与 onUnauthorized 同范式，避免子应用循环依赖。
 *
 * 内置节流：批量接口同时失败时（典型：后端宕机时大屏十几个面板并发请求）
 * 只弹第一条 + 同文案 2s 去重，避免 toast 风暴刷屏。
 */

export type GlobalToastTone = 'error' | 'info';

export interface GlobalToastMessage {
  message: string;
  tone: GlobalToastTone;
}

type GlobalToastListener = (toast: GlobalToastMessage) => void;

/** 同文案去重窗口（ms） */
const DEDUPE_WINDOW_MS = 2000;
/** 相邻两条 toast 的最小间隔（ms），防批量失败刷屏 */
const MIN_INTERVAL_MS = 1200;

const listeners = new Set<GlobalToastListener>();
let lastMessage = '';
/** 初始为 -Infinity：任何时钟（含伪造时钟 0 点）下首条 toast 都不被间隔门限拦住 */
let lastAt = Number.NEGATIVE_INFINITY;

/** 订阅全局 toast；返回取消订阅函数（组件 onUnmounted 时调用防泄漏）。 */
export function subscribeGlobalToast(listener: GlobalToastListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * 推送全局 toast。
 * @param message 展示文案（建议业务域 + 简短原因）
 * @param tone 语义色调，默认 error
 */
export function pushGlobalToast(message: string, tone: GlobalToastTone = 'error'): void {
  const now = Date.now();
  if (message === lastMessage && now - lastAt < DEDUPE_WINDOW_MS) return;
  if (now - lastAt < MIN_INTERVAL_MS) return;
  lastMessage = message;
  lastAt = now;
  listeners.forEach((listener) => listener({ message, tone }));
}

/** 仅供测试重置节流状态；业务代码勿用。 */
export function resetGlobalToastThrottleForTest(): void {
  lastMessage = '';
  lastAt = Number.NEGATIVE_INFINITY;
}
