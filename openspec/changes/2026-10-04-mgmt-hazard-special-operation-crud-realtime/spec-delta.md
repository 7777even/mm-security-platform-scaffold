# Spec Delta: hazard / special-operation 契约

## 变更 paths

- `hazard.openapi.json`：`/hazards` 增 POST；`/hazards/{id}` 增 PUT、DELETE；`/monitoring/points` 增 POST；`/monitoring/points/{id}` 增 PUT、DELETE。
- `special-operation.openapi.json`：`/special-operations` 增 POST；`/special-operations/{id}` 增 PUT、DELETE。

## 新增 schema

- `MajorHazardWriteRequest`（10 字段）、`MonitoringPointWriteRequest`（8 字段，字符串主键由请求给定）、`SpecialOperationWriteRequest`（26 字段）。
- 两份契约各自新增本域本地 `DeleteResult`——各域契约必须各自本地定义，跨域引用会导致该域整份类型生成失败。

## 新增订阅

- `HazardMgmtView` → `hazard`；`MonitorPointView` → `hazard.point`；`SpecialOpsView` → `special-operation`。
- 均走 `useDomainAutoRefresh`（自带 onMounted 订阅 / onUnmounted 退订），变更到达即重拉当前查询条件下的列表。

## 不变

- 读端点 paths 与响应 schema 不变。
- `src/services/hazard.ts` / `specialOperation.ts` 的读函数签名与返回类型不变。
- 三视图不新增写 UI，故无新增权限码与 `v-permission` 挂载。
