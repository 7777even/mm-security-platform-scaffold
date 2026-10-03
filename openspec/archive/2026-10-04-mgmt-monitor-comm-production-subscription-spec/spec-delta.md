# Spec Delta: 测试覆盖

## 新增

- `apps/mgmt/views/__tests__/MonitorCommProductionSubscriptionViews.spec.ts`（14 例），
  覆盖 `video.camera` / `communication.device` / `communication.record` / `device` /
  `hazard` / `hazard.point` / `special-operation` 共 7 个实时域的订阅接线。

## 不变

- 视图源码、订阅逻辑、`useDomainAutoRefresh` composable 均未改动。
- service 层函数签名与返回结构未改动。
- 契约 `docs/api/*.openapi.json` 与 `src/types/generated/*` 未改动。
