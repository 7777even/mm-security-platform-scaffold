// 移动端原生能力桥接接口层（详设 V1.5 §5.3 决策隔离）。
// 业务页只 import 接口类型与 index.ts 的实例，禁止直调 navigator.geolocation / Web Storage 等具体实现。
// 与原 apps/mobile/bridges/types.ts 完全一致——接口契约不变，仅实现层由 h5.ts 换成 uni.ts。

/** 地理坐标（WGS-84）。 */
export interface GeoPosition {
  lng: number;
  lat: number;
  accuracy: number;
  timestamp: number;
}

/** 定位桥：无感定位（uni 实现为原生定位/高德/腾讯地图 SDK）。 */
export interface LocationBridge {
  getPosition(): Promise<GeoPosition>;
  startWatch(onPosition: (pos: GeoPosition) => void): void;
  stopWatch(): void;
}

/** 离线持久化桥：断网缓存 + 重连静默补发。 */
export interface OfflineBridge {
  save(key: string, payload: unknown): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  pendingCount(): Promise<number>;
  clear(key: string): Promise<void>;
}

/** 令牌来源桥：原生壳/uni App 注入登录态。 */
export interface TokenSource {
  getToken(): Promise<string | null>;
  onTokenExpired(handler: () => void): void;
}
