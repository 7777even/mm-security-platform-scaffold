/**
 * 移动端原生能力桥接接口层（详设 V1.5 §5.3 决策隔离）
 *
 * 背景：详设定义移动端为 Android Kotlin 原生应用（北斗无感定位 / SQLite AES-256 离线库 /
 * 后台静默补发 / 系统级推送），原生壳与 H5 业务页的集成方式待与设计方确认
 * （见 docs/详细设计V1.5偏差分析.md §2.1）。为使业务页不被决策阻塞，所有原生能力
 * 一律经由本层接口访问；业务代码只 import 接口类型与 index.ts 的实例，禁止直调
 * navigator.geolocation / Web Storage 等具体实现。
 *
 * 决策落地后的替换方式：只新增/替换 index.ts 里的适配器实现（如 JSBridge 版
 * LocationBridge 调原生北斗服务），业务页零改动。
 */

/** 地理坐标（WGS-84，与北斗/GPS 原始输出一致；转 GCJ-02 由原生层或后端负责） */
export interface GeoPosition {
  lng: number;
  lat: number;
  accuracy: number;
  timestamp: number;
}

/** 定位桥：无感定位（详设 §5.3 location/BeidouLocationService.kt 的 H5 侧镜像） */
export interface LocationBridge {
  /** 单次取位；原生实现应透出北斗/GPS 混合定位 */
  getPosition(): Promise<GeoPosition>;
  /** 开始持续定位（作业轨迹场景）；H5 实现基于 watchPosition */
  startWatch(onPosition: (pos: GeoPosition) => void): void;
  stopWatch(): void;
}

/** 离线持久化桥：断网缓存 + 重连静默补发（详设 §5.3 database/OfflineCacheDatabase.kt） */
export interface OfflineBridge {
  /** 落盘一条离线操作/数据（原生实现为 SQLite + AES-256，H5 实现为 Web Storage 垫底） */
  save(key: string, payload: unknown): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  /** 待补发队列长度（供角标/同步状态展示） */
  pendingCount(): Promise<number>;
  clear(key: string): Promise<void>;
}

/** 令牌来源桥：原生壳注入登录态（详设 §4.2.7 令牌体系） */
export interface TokenSource {
  /** 取当前访问令牌；无登录态返回 null */
  getToken(): Promise<string | null>;
  /** 令牌失效回调注册（原生壳统一处理续期/重登） */
  onTokenExpired(handler: () => void): void;
}
