# Spec Delta: 救援资源四台账管理页 CRUD

## ADDED Requirements

### Requirement: 四台账管理页全量 CRUD

`EmergencyExpertView` / `EmergencyTeamView` / `EmergencyVehicleView` / `ResourceView`
应各自支持新增 / 编辑 / 删除，并分别订阅 `rescue.personnel` / `rescue.brigade` /
`rescue.vehicle` / `rescue.equipment` 域。

- 写操作按钮受对应权限码控制（`v-permission`）。
- 删除前二次确认；删除成功后重新拉取列表。
- 编辑弹窗由通用组件 `MgmtRecordEditDialog` 的 FieldDef 驱动。

#### Scenario: 他端改动后自动刷新

- **WHEN** 大屏或移动端改动了任一救援资源台账
- **THEN** 对应管理页在 400ms 内自动重拉，无需手动点刷新。

#### Scenario: 车辆编辑不回传子集合

- **WHEN** 打开车辆编辑弹窗并保存
- **THEN** 提交体只含车辆本体字段，不含 `crew / onboardEquipment / consumables / dispatchSummary`。

### Requirement: 救援资源 service 写方法

`src/services/rescueResource.ts` 应提供四台账各 3 个写方法（create / update / delete）
与对应写请求类型，并导出值班状态 / 车辆状态 / 装备状态三组下拉常量。

### Requirement: 契约同步

`rescue-resource.openapi.json` 应为 4 个列表路径补 `post`、为 4 个 `{id}` 路径补
`put` 与 `delete`（同 path 多 method 合并同一 path key），并新增 4 个 WriteRequest schema；
`RescuePersonnelItem` 补 `personGroup / phone / dutyStatus`，`RescueEquipmentItem` 补
`category / unit`。改后须 `npm run gen:api-types`，后端 `check-api-contract.mjs --strict` 保持 0 差异。

## MODIFIED Requirements

### Requirement: 救援资源只读类型字段扩展（沿用既有约定）

`RescuePersonnelItem` 与 `RescueEquipmentItem` 的 TS 接口随契约扩展；
既有字段不改名、不改语义，既有表格列不受影响。
