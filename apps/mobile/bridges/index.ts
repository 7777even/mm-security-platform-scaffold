import type { LocationBridge, OfflineBridge, TokenSource } from './types';
import { H5LocationBridge, H5OfflineBridge, H5TokenSource } from './h5';

export type { GeoPosition, LocationBridge, OfflineBridge, TokenSource } from './types';

/**
 * 桥接实例装配点：业务页只 import 这三个实例，不感知实现。
 * 当前装配 H5 降级实现；hybrid 决策落地后，在此按运行时探测
 * （如 window.NativeBridge 是否存在）切换为 JSBridge 适配器即可。
 */
export const locationBridge: LocationBridge = new H5LocationBridge();
export const offlineBridge: OfflineBridge = new H5OfflineBridge();
export const tokenSource: TokenSource = new H5TokenSource();
