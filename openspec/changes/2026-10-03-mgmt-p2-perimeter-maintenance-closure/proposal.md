# Proposal: 周界告警 CRUD 闭环 + 设施报警改接对源 + 维保子写端点

## Why

P2 批次 1（`2026-10-03-mgmt-p2-security-crud`）只补齐了契约与生成类型，管理端**仍缺周界告警台账 UI**；
同时复核发现两处数据源错接与一处能力缺口：

1. **周界告警无管理端台账**：后端 `/security/perimeter-alarms` 已具备 POST/PUT/DELETE，本次复核又补上 LIST GET
   （`listPerimeterAlarms`，按告警时间倒序），但管理端没有页面消费，周界告警只能在态势面板看、不能台账化处置/销条。
2. **设施报警错接源**：`FireFacilityAlarmView.vue` 读的是 `/fire-alarms`（fac_fire_alarm 报警单，与大屏不同源），
   应改读与大屏同源的 `/fire-facility/alarms`（由 fac_fire_facility_fault 派生）。
3. **维保缺子写端点**：`fac_fire_facility_maintenance` 维保记录只能随台账整体返回，无法在管理端单独新增/删除；
   后端新增 `POST /fire-facility/ledger/{ledgerId}/maintenance` 与 `DELETE /fire-facility/maintenance/{recordId}`。

本次在 P2 批次 1 的契约四同步基础上，完成「契约 → 生成类型 → 服务层 → 管理端 UI → 实时订阅 → 守门」全链路闭环。

## What Changes

### 契约真源（`docs/api/*.openapi.json`）

- `security.openapi.json`：新增 `GET /security/perimeter-alarms`（`listPerimeterAlarms`）operation，
  200 响应 example 为 `data=PerimeterAlarmDetail[]`；`PerimeterAlarmDetail` 已存在（32 字段）。
- `fire-facility.openapi.json`：
  - `FireFacilityMaintenanceRecord` 增加 `id`（记录主键）/ `ledgerId`（所属台账 id）两字段；
  - 新增 `FireFacilityMaintenanceWriteRequest` schema（`date`/`content` 必填，`reportFile` 可空）；
  - 新增 `POST /fire-facility/ledger/{ledgerId}/maintenance`（`createFireFacilityMaintenance`）与
    `DELETE /fire-facility/maintenance/{recordId}`（`deleteFireFacilityMaintenance`），均标注权限码
    `fire-facility:ledger:write` 与广播域 `fire-facility.ledger`。

### 生成类型与服务层

- `npm run gen:api-types` → `src/types/generated/security.ts` 产出 `listPerimeterAlarms`；
  `src/types/generated/fire-facility.ts` 产出 `createMaintenance`/`deleteMaintenance` 与两 schema。
- `src/services/security.ts`：新增 `fetchPerimeterAlarms()`（GET 列表）/ `deletePerimeterAlarm(id)`（DELETE）。
- `src/services/fireFacility.ts`：`FireFacilityMaintenanceRecord` 增加 `id`/`ledgerId`；新增
  `FireFacilityMaintenanceWriteRequest` 与 `createFireFacilityMaintenance` / `deleteFireFacilityMaintenance`（三态语义对齐既有写接口）。

### 管理端 UI

- **新增 `apps/mgmt/views/security/PerimeterAlarmView.vue`**：周界入侵告警台账，列表 + 新增（对话框，title 必填）+
  处置/派单写回（状态流转 + 误报标记 + 处置情况/时间/派单人员/通知）+ 删除；订阅 `security.perimeter-alarm`。
  路由 `/perimeter-alarm-mgmt` + 菜单「周界入侵告警管理」（`src/data/mgmtMenus.ts`）。
- **`FireFacilityAlarmView.vue`**：改读 `fetchFireFacilityAlarms`（`/fire-facility/alarms`，与大屏同源），服务端 level/status
  过滤；订阅 `fire-facility.fault`（故障写回后报警派生视图自动重拉）。
- **`FireFacilityMaintenanceView.vue`**：台账展开每条设施的维保记录，支持新增（`createFireFacilityMaintenance`）/
  删除（`deleteFireFacilityMaintenance`），订阅 `fire-facility.ledger`。
- `apps/mgmt/router.ts`：新增 `/perimeter-alarm-mgmt` 路由。
- `src/data/mgmtMenus.ts`：治安防恐管理分组新增「周界入侵告警管理」叶子。

## Capabilities

- `security`（前端契约层）：新增「周界入侵告警 LIST」契约与类型；管理端新增周界告警台账 CRUD UI。
- `fire-facility`（前端契约层）：维保记录携带 `id`/`ledgerId`；新增维保子写请求 schema 与「消防设施维保新增/删除」契约。

## Impact

- 影响：`docs/api/security.openapi.json`、`docs/api/fire-facility.openapi.json`、
  `src/types/generated/*.ts`、`src/services/security.ts`、`src/services/fireFacility.ts`、
  `apps/mgmt/views/security/PerimeterAlarmView.vue`、`apps/mgmt/views/fire/FireFacilityAlarmView.vue`、
  `apps/mgmt/views/fire/FireFacilityMaintenanceView.vue`、`apps/mgmt/router.ts`、`src/data/mgmtMenus.ts`。
- 风险：维保记录接口加 `id`/`ledgerId` 为新增必填字段，但仅前端 service/UI 使用，不影响既有只读消费。
- 守门：`check-api-contract.mjs --strict` schema 漂移 0；本次新增路由全部落入「已对齐」集合。
  存量 12 处路由差异为 gate/bollard/patrol 的 `{id}` 路径形式技术债（契约无 `{id}`、实现有），非本次引入。
