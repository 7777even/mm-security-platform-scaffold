// wujie 类型化通信桥（wujie-shell spec）。
// 修正 mm-safety-master 既有桥接中 `window as any` 反模式（S1 禁 any）：
// 全部经强类型 WujieBus 访问，禁止裸 any。

/** 主壳 → 子应用 / 子应用间 跨应用事件契约（仅监视/导航类，零下行控制红线） */
export interface WujieEventMap {
  'map-fly-to': { lng: number; lat: number; height?: number };
  'map-focus': { id: string };
  'emergency-event-changed': { eventId: string; status: string };
  'theme-changed': { theme: string };
  'perm-changed': { perms: string[] };
}

export interface WujieBus {
  $emit<K extends keyof WujieEventMap>(event: K, data: WujieEventMap[K]): void;
  $on<K extends keyof WujieEventMap>(event: K, handler: (data: WujieEventMap[K]) => void): void;
  $off<K extends keyof WujieEventMap>(event: K, handler: (data: WujieEventMap[K]) => void): void;
}

/** wujie 注入到子应用 window 的实例类型（强类型，禁 any） */
export interface WujieInstance {
  bus: WujieBus;
  props: Record<string, unknown>;
}

declare global {
  interface Window {
    $wujie?: WujieInstance;
  }
}

/** 获取类型化事件总线；子应用侧调用，主壳侧恒有 */
export function getWujieBus(): WujieBus | undefined {
  return window.$wujie?.bus;
}

export function emitWujieEvent<K extends keyof WujieEventMap>(
  event: K,
  data: WujieEventMap[K],
): void {
  getWujieBus()?.$emit(event, data);
}

export function onWujieEvent<K extends keyof WujieEventMap>(
  event: K,
  handler: (data: WujieEventMap[K]) => void,
): void {
  getWujieBus()?.$on(event, handler);
}

export function offWujieEvent<K extends keyof WujieEventMap>(
  event: K,
  handler: (data: WujieEventMap[K]) => void,
): void {
  getWujieBus()?.$off(event, handler);
}
