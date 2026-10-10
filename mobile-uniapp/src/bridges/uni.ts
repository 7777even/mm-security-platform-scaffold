// uni 实现：定位走 uni.getLocation / 离线走 platform/storage / 令牌走内存态（由登录启动注入）。
// 对应原 H5LocationBridge / H5OfflineBridge / H5TokenSource 的「决策落地」替换实现。
import type { GeoPosition, LocationBridge, OfflineBridge, TokenSource } from './types';
import { getItem, setItem, removeItem } from '@/platform/storage';
import { getAccessToken, setAccessToken, clearAccessToken } from '@/platform/token';

const OFFLINE_PREFIX = 'mobile-offline:';

/** uni 定位：原生定位能力（需 app-plus 模块声明，见 manifest.json）。 */
export class UniLocationBridge implements LocationBridge {
  private watchId: number | null = null;

  getPosition(): Promise<GeoPosition> {
    return new Promise((resolve, reject) => {
      uni.getLocation({
        type: 'wgs84',
        success: (res: { longitude: number; latitude: number; accuracy: number }) =>
          resolve({
            lng: res.longitude,
            lat: res.latitude,
            accuracy: res.accuracy,
            timestamp: Date.now(),
          }),
        fail: (err: { errMsg?: string }) =>
          reject(new Error(`[bridges] 定位失败：${err?.errMsg ?? ''}`)),
      });
    });
  }

  startWatch(onPosition: (pos: GeoPosition) => void): void {
    if (this.watchId !== null) return;
    this.watchId = uni.startLocationUpdate({
      success: () => undefined,
      fail: () => undefined,
    }) as unknown as number;
    uni.onLocationChange((res: { longitude: number; latitude: number; accuracy: number }) => {
      onPosition({
        lng: res.longitude,
        lat: res.latitude,
        accuracy: res.accuracy,
        timestamp: Date.now(),
      });
    });
  }

  stopWatch(): void {
    if (this.watchId !== null) {
      uni.stopLocationUpdate();
      this.watchId = null;
    }
  }
}

/** uni 离线：uni 同步存储（App 平台底层为原生存储；P1 可换原生 SQLite + AES-256）。 */
export class UniOfflineBridge implements OfflineBridge {
  async save(key: string, payload: unknown): Promise<void> {
    setItem(OFFLINE_PREFIX + key, JSON.stringify(payload));
  }
  async load<T>(key: string): Promise<T | null> {
    const raw = getItem(OFFLINE_PREFIX + key);
    return raw === null ? null : (JSON.parse(raw) as T);
  }
  async pendingCount(): Promise<number> {
    // uni 存储无长度枚举，P1 用独立计数器键维护
    return Number(getItem(OFFLINE_PREFIX + '__count') ?? '0');
  }
  async clear(key: string): Promise<void> {
    removeItem(OFFLINE_PREFIX + key);
  }
}

/** uni 令牌：内存态（登录启动/原生壳注入后写入），与 platform/token.ts 同源。 */
export class UniTokenSource implements TokenSource {
  private expiredHandler: (() => void) | null = null;

  async getToken(): Promise<string | null> {
    return getAccessToken();
  }

  onTokenExpired(handler: () => void): void {
    this.expiredHandler = handler;
  }

  /** 供 401 处理或原生壳续期后调用。 */
  emitExpired(): void {
    this.expiredHandler?.();
  }
}

// 兼容占位：某些分支需读取/写入（如原生壳注入令牌）
export { setAccessToken, clearAccessToken };
