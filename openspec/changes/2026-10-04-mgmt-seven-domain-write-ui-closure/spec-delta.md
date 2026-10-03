# Spec Delta: 前端消费层

## 新增

- 5 个 service 新增共 15 个写方法（create / update / delete），URL 与动词与后端端点逐字对齐。
- 9 个视图新增写 UI：`MgmtRecordEditDialog` 弹窗、`FIELDS` 定义、新增按钮、编辑 / 删除操作列。
- 权限按钮挂载 `v-permission`，共 7 个权限码（与后端 V106 播种的 perm_code 一致）。

## 变更（交互）

- CommRecordView / DeviceView / MonitorPointView 的自然键字段（recordNo / deviceCode / 点位 id）
  在编辑态禁用，与后端「PUT 不以请求体覆盖路径定位键」对齐。

## 不变

- 既有的读函数、返回类型、筛选、分页、tab 与 `useDomainAutoRefresh` 订阅全部保持原样。
- `MgmtRecordEditDialog` 组件与其 `(payload, id: number | null)` 签名未改动。
- 契约 `docs/api/*.openapi.json` 与 `src/types/generated/*` 未改动（本次无 schema 变更）。
