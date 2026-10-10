// 无障碍模式（户外高对比 / 适老三档）：PoC 阶段从存储读取并挂根节点 data-skin。
// App 平台无 document，P1 改为页面级样式注入 + 条件编译。
import { getItem, setItem } from './storage';

export type AccessibilityMode = 'normal' | 'outdoor' | 'elder';
const KEY = 'accessibility-mode';

export function getAccessibilityMode(): AccessibilityMode {
  return (getItem(KEY) as AccessibilityMode) ?? 'normal';
}

export function setAccessibilityMode(mode: AccessibilityMode): void {
  setItem(KEY, mode);
}

export function initAccessibilityModes(): void {
  const mode = getAccessibilityMode();
  try {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-skin', mode === 'normal' ? 'normal' : mode);
    }
  } catch {
    /* 非 H5 平台忽略 */
  }
}
