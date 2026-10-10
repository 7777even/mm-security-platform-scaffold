// 桥接实例装配点：业务页只 import 这三个实例，不感知实现。
// 原 apps/mobile 装配 H5 降级实现；uni-app 工程直接装配 uni 实现（对应「决策落地」）。
// 若需在 H5 平台保留降级，可用 #ifdef H5 条件编译切回 H5 实现。
import type { LocationBridge, OfflineBridge, TokenSource } from './types';
import { UniLocationBridge, UniOfflineBridge, UniTokenSource } from './uni';

export type { GeoPosition, LocationBridge, OfflineBridge, TokenSource } from './types';

export const locationBridge: LocationBridge = new UniLocationBridge();
export const offlineBridge: OfflineBridge = new UniOfflineBridge();
export const tokenSource: TokenSource = new UniTokenSource();
