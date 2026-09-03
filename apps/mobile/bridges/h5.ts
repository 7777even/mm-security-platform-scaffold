import type { GeoPosition, LocationBridge, OfflineBridge, TokenSource } from './types';

/**
 * H5 降级实现（决策未定期的垫底层）
 * 全部为浏览器标准 API 实现，供 dev / 纯 H5 部署形态使用；
 * 决策落地（hybrid 原生壳）后由 JSBridge 适配器整体替换，接口不变。
 */

/** H5 定位：navigator.geolocation（无北斗通道，精度/后台能力有客观差距，见偏差分析 §2.1） */
export class H5LocationBridge implements LocationBridge {
  private watchId: number | null = null;

  async getPosition(): Promise<GeoPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('[bridges] 当前环境不支持 geolocation'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lng: pos.coords.longitude,
            lat: pos.coords.latitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          }),
        (err) => reject(new Error(`[bridges] 定位失败：${err.message}`)),
        { enableHighAccuracy: true, timeout: 10_000 },
      );
    });
  }

  startWatch(onPosition: (pos: GeoPosition) => void): void {
    if (this.watchId !== null || !navigator.geolocation) return;
    this.watchId = navigator.geolocation.watchPosition(
      (pos) =>
        onPosition({
          lng: pos.coords.longitude,
          lat: pos.coords.latitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        }),
      () => undefined,
      { enableHighAccuracy: true },
    );
  }

  stopWatch(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}

const OFFLINE_PREFIX = 'mobile-offline:';

/** H5 离线垫底：Web Storage（无 AES-256 加密，详设要求 SQLite + 加密，仅开发联调用） */
export class H5OfflineBridge implements OfflineBridge {
  async save(key: string, payload: unknown): Promise<void> {
    localStorage.setItem(OFFLINE_PREFIX + key, JSON.stringify(payload));
  }

  async load<T>(key: string): Promise<T | null> {
    const raw = localStorage.getItem(OFFLINE_PREFIX + key);
    return raw === null ? null : (JSON.parse(raw) as T);
  }

  async pendingCount(): Promise<number> {
    let count = 0;
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k?.startsWith(OFFLINE_PREFIX)) count += 1;
    }
    return count;
  }

  async clear(key: string): Promise<void> {
    localStorage.removeItem(OFFLINE_PREFIX + key);
  }
}

/** H5 令牌垫底：会话存储（原生壳注入方案落地后改为 JSBridge 读取） */
export class H5TokenSource implements TokenSource {
  private expiredHandler: (() => void) | null = null;

  async getToken(): Promise<string | null> {
    return sessionStorage.getItem('mobile-token');
  }

  onTokenExpired(handler: () => void): void {
    this.expiredHandler = handler;
  }

  /** 供上层（如 401 响应处理）触发失效回调 */
  emitExpired(): void {
    this.expiredHandler?.();
  }
}
