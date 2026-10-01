# Spec Delta: 应急事件与流程填报管理页 CRUD

## ADDED Requirements

### Requirement: 应急事件管理页全量 CRUD

`EmergencyEventView` 应支持新增 / 编辑 / 删除，并订阅 `emergency.event` 域。

- 新增与编辑使用**不同的 FieldDef 清单**（create 需坐标与分组维度，update 为局部更新）。
- 编辑态把 `left / top / time` 映射回 `leftPercent / topPercent / eventTime`。
- 删除前二次确认；删除成功后重新拉取列表。
- 写操作按钮受 `emergency:event:write` 权限码控制（`v-permission`）。

#### Scenario: 只改状态提交局部更新

- **WHEN** 编辑弹窗只改「处置状态」为「处置中」并保存
- **THEN** 提交体只含 `status: 'processing'`（及用户填的字段），未填字段不被清空。

#### Scenario: 新增事件按类型归组

- **WHEN** 新增时「事件类型」选「储罐消防报警」
- **THEN** 提交体展开为 `kind: 'event'`、`eventCategory: 'default'`、
  `groupCode: 'tank'`、`groupLabel: '储罐消防报警'`。

#### Scenario: 他端写入后自动刷新

- **WHEN** 大屏新增或推进了应急事件
- **THEN** 管理端列表在 400ms 内自动重拉，无需手动点刷新。

### Requirement: 流程填报记录删除

`form-wizard.vue` 应为 ADMIN 提供删除操作，并订阅 `form.record` 域。

- 删除前二次确认；记录不存在时由 `toastErr` 提示后端返回的 404 文案。
- 非 ADMIN 不渲染删除按钮（与既有「审核通过」同口径）。

### Requirement: 契约同步

`emergency-event.openapi.json` 增 `/emergency-events/{id}`（put + delete 合并同一 path key）
与 `EmergencyEventUpdateRequest` schema；`form-records.openapi.json` 的
`/form-records/{id}` 增 delete。改后须 `npm run gen:api-types`，且后端
`check-api-contract.mjs --strict` 保持 0 差异。

## MODIFIED Requirements

### Requirement: 弹窗友好化标准（沿用）

判断依据仍是「该字段是否有既定字典/枚举取值」：处置状态、危害源等级、事件场景、事件类型
有既定取值 → `el-select`；标题 / 位置 / 描述 / 舞台百分比偏移无字典 → `el-input`，
**不得臆造下拉**。
