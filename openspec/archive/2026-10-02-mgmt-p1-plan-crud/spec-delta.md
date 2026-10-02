# Spec Delta: 应急预案管理页 CRUD

## ADDED Requirements

### Requirement: 应急预案管理页写操作

`EmergencyPlanView` 应提供新增 / 编辑 / 删除能力，调用
`POST /emergency-plans`、`PUT` / `DELETE /emergency-plans/{id}`。

- **权限**：新增 / 编辑 / 删除按钮受 `emergency:plan:write` 控制（未授权隐藏，且后端 403 兜底）。
- **表单**：复用 `MgmtRecordEditDialog`，planName 必填，tabKey/domain select（既定枚举），nuclear/isActive select（是/否 → boolean），accidentType/facility 文本，sortNo 数字。
- **编辑语义**：仅回传被改字段，实现后端局部更新（null=不修改）。
- **实时**：挂载时通过 `useDomainAutoRefresh` 订阅 `emergency.plan`，任一端改动后自动重拉。

#### Scenario: 编辑只回传被改字段

- **WHEN** 用户只改 `facility` 并保存
- **THEN** 仅提交 `{ facility }`，后端 `planName`/`domain` 保持原值。

#### Scenario: 未授权用户不可见写按钮

- **WHEN** 当前角色不持有 `emergency:plan:write`
- **THEN** 写按钮均不渲染。

## MODIFIED Requirements

### Requirement: 应急预案页不再是只读

`EmergencyPlanView` 由只读 `/catalog` + `/catalog-detail` 层次化摘要变更为可编辑主记录 CRUD，并订阅 `emergency.plan` 广播域。
