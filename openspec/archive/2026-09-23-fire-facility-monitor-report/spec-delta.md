# Spec Delta: fire-facility-monitor-report

## Capability: fire-facility-monitor（前端监测上报服务）

### ADDED — 前端消防设施监测上报服务方法

- 契约 `docs/api/fire-facility.openapi.json` SHALL 新增 `POST /fire-facility/monitors/report` 路径与 `FireFacilityMonitorReportRequest / Item / Param` 三个 schema（含中文 description 与 B3 example）。
- `npm run gen:api-types` SHALL 重新生成 `src/types/generated/fire-facility.ts`。
- `services/fireFacility.ts` SHALL 新增 `reportFireFacilityMonitors(payload)`，三态守卫与 `updateFireFacilityFault` 对齐：
  - `isDemoMode()` → 仅本地成功返回 `null`，不落库；
  - `isOfflineNoBackend()` → `notifyBackendOffline` 提示并抛异常；
  - 连后端 → 真实 `POST /fire-facility/monitors/report`，成功返回刷新后 `FireFacilityMonitorResult`。

#### Scenario: 演示模式上报

- **GIVEN** `VITE_USE_DEV_MOCK=true`
- **WHEN** 调用 `reportFireFacilityMonitors(payload)`
- **THEN** 仅本地成功返回 `null`，不请求后端

#### Scenario: 离线无后端

- **GIVEN** 无 `VITE_API_BASE` 且未开演示
- **WHEN** 调用 `reportFireFacilityMonitors(payload)`
- **THEN** 提示并抛异常

#### Scenario: 连后端上报

- **GIVEN** 已连后端
- **WHEN** 调用 `reportFireFacilityMonitors(payload)`
- **THEN** 真实 `POST /fire-facility/monitors/report`，成功返回刷新后 `FireFacilityMonitorResult`
