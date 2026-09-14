# 契约变更说明

本次为纯前端 UI 绑定，未新增/修改/删除任何对外接口或 schema：

- 前端消费既有 `GET /api/v1/fire-facility/faults`（已在 `docs/api/fire-facility.openapi.json` 中定义，schema `FireFacilityFaultItem` / `FireFacilityFaultResult` 不变）。
- 未改动 `src/types/generated/fire-facility.ts` 的生成来源；未新增路由参数或请求/响应字段。
- 四同步（openspec → 契约 → 后端 → 前端类型）因无接口变更而未触发。
