# Spec Delta: 事故案例库管理页 CRUD

## ADDED Requirements

### Requirement: 事故案例库管理页写操作

`CaseLibView` 应提供新增 / 编辑 / 删除能力，调用
`POST /emergency/cases`、`PUT /emergency/cases/{id}`、`DELETE /emergency/cases/{id}`。

- **权限**：新增 / 编辑 / 删除按钮受 `emergency:case:write` 控制（未授权隐藏，且后端 403 兜底）。
- **表单**：复用 `MgmtRecordEditDialog`，title 必填，accidentType/location 文本，occurredAt 日期时间，summary/lessons 文本域。
- **编辑语义**：仅回传被改字段，实现后端局部更新（null=不修改）。
- **实时**：挂载时通过 `useDomainAutoRefresh` 订阅 `emergency.case`，任一端改动后自动重拉。

#### Scenario: 编辑只回传被改字段

- **WHEN** 用户只改 `summary` 并保存
- **THEN** 仅提交 `{ summary }`，后端 `title`/`location` 保持原值。

#### Scenario: 未授权用户不可见写按钮

- **WHEN** 当前角色不持有 `emergency:case:write`
- **THEN** 新增 / 编辑 / 删除按钮均不渲染。

## MODIFIED Requirements

### Requirement: 事故案例库页不再是只读

`CaseLibView` 由只读表格变更为支持 CRUD，并订阅 `emergency.case` 广播域。只读展示（列、加载逻辑）不变。
