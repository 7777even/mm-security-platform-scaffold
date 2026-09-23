## Why

后端新增 `POST /api/v1/fire-facility/monitors/report`（消防设施监测运行数据上报写端点，L3）。前端需同步契约真源、生成 TS 类型，并提供与 `updateFireFacilityFault` 三态守卫一致的服务方法，使「运行监控」页具备把监测数据落库的能力（此前该页只读，数据仅来自 V20 种子）。

## What Changes

- 契约 `docs/api/fire-facility.openapi.json` 增 POST 路径与 `FireFacilityMonitorReportRequest / Item / Param` 三个 schema（含中文 description 与 B3 example）。
- `npm run gen:api-types` 重新生成 `src/types/generated/fire-facility.ts`。
- `services/fireFacility.ts` 增 `reportFireFacilityMonitors`（三态：演示模式仅本地成功返回 null / 未连后端显式报错 / 连后端真实 POST）。

## Impact

- 仅新增写方法，不改既有 GET 调用；`fm-fire-facility` 运行监控页 UI 暂未接上报入口（列为后续项），但 API 层已具备落库能力。
- type-check / lint / gate:screen 须保持全绿。
