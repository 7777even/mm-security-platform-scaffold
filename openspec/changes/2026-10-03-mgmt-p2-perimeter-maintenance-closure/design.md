# Design: 周界告警 CRUD 闭环 + 设施报警改接对源 + 维保子写端点

## 真源与守门链路

```
docs/api/security.openapi.json        ──(npm run gen:api-types)──▶ src/types/generated/security.ts
docs/api/fire-facility.openapi.json   ──(npm run gen:api-types)──▶ src/types/generated/fire-facility.ts
        │
        └──(后端: node scripts/check-api-contract.mjs --strict)──▶ 路由层 + schema 层对拍
```

- 路由层：后端 Controller 的 `(method, path)` ⇄ 契约 `paths`（契约 `servers[0].url=/api/v1` 参与拼接）。
- schema 层：后端具名 DTO ⇄ 契约 `components.schemas` 同名字段的字段名 + 类型族。

## 周界告警台账 UI（新页面）

- 后端已具备 POST/PUT/DELETE，本次补 LIST GET；管理端 `PerimeterAlarmView` 统一消费四个写接口。
- 对话框双模式：`create`（title 必填 + 可选字段）/ `handle`（处置写回：status/falseAlarm/dispatchPersonnel/
  handleResult/handleTime/notifyApp/notifySms），复用 `MgmtRecordEditDialog` 的 `FieldDef` 驱动。
- 通知开关 `notifyApp`/`notifySms` 用 `select` + 布尔 option（value 为 `true`/`false`）映射，避免新增控件类型。
- 删除走 `deletePerimeterAlarm`，二次确认；按钮按 `v-permission` 受 `security:perimeter-create`/
  `security:perimeter-ack`/`security:perimeter-delete` 控制。
- 实时：`useDomainAutoRefresh('security.perimeter-alarm', load, { immediate: false })`。

## 设施报警改接对源

- 原 `FireFacilityAlarmView` 读 `/fire-alarms`（fac_fire_alarm 报警单），与大屏不同源、数据口径不一致。
- 改为 `fetchFireFacilityAlarms`（`/fire-facility/alarms`，由 fac_fire_facility_fault 派生），服务端 level/status
  过滤；列表列对齐 `FireFacilityAlarmItem`（id/faultCode/facilityType/category/level/status/content/source/time）。
- 报警为派生命名视图，无独立写端点；处置在「消防故障」台账完成，故订阅 `fire-facility.fault` 广播自动重拉。

## 维保子写端点

- 后端新增 `POST /fire-facility/ledger/{ledgerId}/maintenance`（落 fac_fire_facility_maintenance，sort_no 按台账内
  max+1）与 `DELETE /fire-facility/maintenance/{recordId}`（物理删除），经 `fire-facility.ledger` 广播。
- 前端 `FireFacilityMaintenanceRecord` 增加 `id`/`ledgerId`，新增 `FireFacilityMaintenanceWriteRequest`；
  `FireFacilityMaintenanceView` 展开每条台账维护其维保记录，新增/删除按钮受 `fire-facility:ledger:write` 控制，
  订阅 `fire-facility.ledger`。

## 四条铁律落地

- ① 按域分组：周界落在 `security.openapi.json`，维保落在 `fire-facility.openapi.json`，未建平行体系。
- ② 每个 operation 具 `summary` + `description`（权限码 + 广播域 + 必填项）。
- ③ 每个 schema 字段具中文 `description` + `example`。
- ④ 200 响应具 `example`；删除端点 example 为 `data: null`。

## 存量漂移说明

`check-api-contract.mjs` 报告 12 处路由差异（gate-controls/bollards/patrols 的 PUT/DELETE 契约无 `{id}` 占位符、
实现有），属 P2 批次 1 前已存在的技术债，本 Change 不引入新差异；新增路由全部「已对齐」。
