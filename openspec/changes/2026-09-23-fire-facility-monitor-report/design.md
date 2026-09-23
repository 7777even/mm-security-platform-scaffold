# Design: fire-facility-monitor-report（前端）

## 调用形态

`reportFireFacilityMonitors(payload)` 与既有 `updateFireFacilityFault` 完全对齐三态守卫：

1. `isDemoMode()`（VITE_USE_DEV_MOCK=true）→ 仅本地成功、不落库，返回 `null`（调用方保留乐观更新）；
2. `isOfflineNoBackend()`（无 VITE_API_BASE 且未开演示）→ `notifyBackendOffline` 提示并抛异常；
3. 连后端 → 真实 `POST /fire-facility/monitors/report`，成功返回刷新后的 `FireFacilityMonitorResult`。

## 类型来源

契约 `docs/api/fire-facility.openapi.json` 为唯一真源。`gen:api-types` 生成 `src/types/generated/fire-facility.ts`；本服务文件沿用既有手写接口风格（`FireFacilityMonitorReportRequest` 等），与生成物保持字段一致，并同步跑 `gen:api-types` 使生成文件不滞后。

## 实时回填

后端 `@RealtimeSync(domain="fire-facility.monitor")` 广播 `fire-facility.monitor.changed`；后续若在大屏订阅 `subscribeDomainChange`，可去抖刷新「运行监控」卡片，无需手动轮询。
