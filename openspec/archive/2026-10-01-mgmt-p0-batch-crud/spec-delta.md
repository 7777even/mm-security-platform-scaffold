# Spec Delta: mgmt 台账 CRUD 通用能力

## 新增 capability 要求

### 通用台账弹窗

- 应提供 schema 驱动的「新增/编辑」共用弹窗，由字段定义数组渲染表单并执行必填校验。
- 控件类型须覆盖 input / textarea / select / date / number；`date` 须支持
  日期与日期时间两种精度及自定义 `value-format`。
- 新增态 `editRow` 为空 → 保存事件携带 `id = null`；编辑态携带记录 id。
- 编辑态须用 `editRow` 预填表单；主键/唯一编码字段应支持 `disabledOnEdit` 锁定。

### mgmt 台账页 CRUD

- 每个台账页须提供新增、编辑、删除（二次确认）三项操作，全部落后端真库。
- 删除成功后须重拉列表；失败须显式提示，不得静默。
- 有既定枚举的字段一律下拉，无字典字段保持自由文本。

### 实时

- 各页继续沿用 `useDomainAutoRefresh` 订阅自身业务域，生命周期由 composable 管理。

### 契约

- 新增写端点须同步到对应 `docs/api/*.openapi.json`，字段带中文 description 与 example。

## 变更的既有约束

- 无。既有只读页行为保持兼容。
