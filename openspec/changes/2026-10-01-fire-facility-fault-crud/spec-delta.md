# Spec Delta: mgmt 消防设施故障管理

## 新增 capability 要求

### mgmt 消防设施故障 CRUD

- mgmt「消防设施故障管理」页应提供新增、编辑、删除操作，全部落后端真库，
  不得只在本地态变更。
- 新增与编辑共用弹窗：枚举字段（故障级别 / 故障类型 / 故障状态）须为下拉选项，
  时间字段须为日期时间选择器（`value-format="YYYY-MM-DD HH:mm:ss"`）；
  无既定字典的描述类字段保持自由文本。
- 删除须二次确认，确认后调用真删除端点并在成功后重拉列表。
- 编号（faultCode）与设施编码（facilityCode）编辑态不可修改。

### 三端实时联通

- mgmt 列表页与大屏消防设施监测弹窗均应订阅 `fire-facility.fault` 域变更，
  收到通知后只读重拉（不得携带或执行任何硬控指令）。
- 订阅生命周期由 `useDomainAutoRefresh` 统一管理，卸载须退订。

### 契约

- `docs/api/fire-facility.openapi.json` 为唯一真源：新增端点须有 `summary` / `description`，
  请求与响应 schema 字段须有中文 `description` 与 `example`；
  同一 path 的多个 method 必须合并到同一 path key。

## 变更的既有约束

- 无。既有只读列表行为（级别/状态筛选）保持兼容。
