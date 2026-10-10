// 平台无关键值存储：优先 uni 同步存储；非 uni 环境（纯 Node 测试）降级到内存 Map。
// 注意：令牌绝不经此存储（见 token.ts 红线），此处仅用于语言偏好、离线操作缓存等。
const memory = new Map<string, string>();

/** 取得 uni 全局对象（非 uni 环境返回 undefined）。用 any 规避 uni 类型在纯 TS 环境的缺失。 */
function getUni(): any | undefined {
  const u = (globalThis as Record<string, unknown>).uni;
  return u && typeof u === 'object' ? (u as any) : undefined;
}

export function getItem(key: string): string | null {
  try {
    const u = getUni();
    if (u && typeof u.getStorageSync === 'function') {
      const v = u.getStorageSync(key);
      return v === undefined || v === null ? null : String(v);
    }
  } catch {
    /* 降级 */
  }
  return memory.get(key) ?? null;
}

export function setItem(key: string, value: string): void {
  try {
    const u = getUni();
    if (u && typeof u.setStorageSync === 'function') {
      u.setStorageSync(key, value);
      return;
    }
  } catch {
    /* 降级 */
  }
  memory.set(key, value);
}

export function removeItem(key: string): void {
  try {
    const u = getUni();
    if (u && typeof u.removeStorageSync === 'function') {
      u.removeStorageSync(key);
      return;
    }
  } catch {
    /* 降级 */
  }
  memory.delete(key);
}
